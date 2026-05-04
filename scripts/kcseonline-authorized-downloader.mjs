import { createWriteStream } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import process from "node:process";
import { inferImportedResourceMetadata } from "./lib/resource-classification.mjs";

const SITE_ORIGIN = "https://kcseonline.co.ke";
const LOGIN_URL = `${SITE_ORIGIN}/membership-login/`;
const DEFAULT_START_URLS = [
  SITE_ORIGIN,
  `${SITE_ORIGIN}/kcseonline-resources/`,
  `${SITE_ORIGIN}/membership-login/`
];

const FILE_EXTENSION_PATTERN =
  /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|zip|rar|7z)(?:[?#].*)?$/i;

const args = parseArgs(process.argv.slice(2));
const username = process.env.KCSEONLINE_USERNAME;
const password = process.env.KCSEONLINE_PASSWORD;
const shouldDownload = Boolean(args.download);
const inventoryOnly = Boolean(args["inventory-only"]) || !shouldDownload;
const downloadLimit = args["download-limit"]
  ? Number.parseInt(args["download-limit"], 10)
  : Infinity;
const downloadOffset = args["download-offset"]
  ? Number.parseInt(args["download-offset"], 10)
  : 0;
const fromManifestPath = args["from-manifest"]
  ? resolve(process.cwd(), String(args["from-manifest"]))
  : null;
const quiet = Boolean(args.quiet);
const useSitemap = !Boolean(args["no-sitemap"]);
const explicitStartUrls = normalizeStartUrls(args["start-url"]);
const maxPages = Number.parseInt(args["max-pages"] ?? "1200", 10);
const crawlDelayMs = Number.parseInt(args.delay ?? "250", 10);
const outputRoot = resolve(process.cwd(), args.out ?? "downloads/kcseonline");
const manifestPath = resolve(
  process.cwd(),
  args.manifest ?? "data/kcseonline-authorized-materials.json"
);

let cookieJar;

async function main() {
  if (!username || !password) {
    console.error(
      "Missing KCSEONLINE_USERNAME or KCSEONLINE_PASSWORD environment variables."
    );
    process.exit(1);
  }

  await mkdir(outputRoot, { recursive: true });
  await mkdir(dirname(manifestPath), { recursive: true });

  cookieJar = new CookieJar();

  if (fromManifestPath) {
    const rawManifest = await readFile(fromManifestPath, "utf8");
    const manifest = JSON.parse(rawManifest);
    if (!Array.isArray(manifest.resources)) {
      throw new Error("The manifest must contain a resources array.");
    }

    const downloadResult = await downloadResources(manifest.resources);
    manifest.crawl = {
      ...(manifest.crawl ?? {}),
      downloaded: downloadResult.attempted >= manifest.resources.length,
      download_attempted_count: downloadResult.attempted,
      download_success_count: downloadResult.succeeded,
      download_error_count: downloadResult.failed,
      last_download_offset: downloadOffset,
      last_download_limit: Number.isFinite(downloadLimit) ? downloadLimit : null,
      last_downloaded_at: new Date().toISOString()
    };
    await writeFile(
      fromManifestPath,
      `${JSON.stringify(manifest, null, 2)}\n`,
      "utf8"
    );
    console.log(
      `Batch attempted ${downloadResult.attempted}; succeeded ${downloadResult.succeeded}; failed ${downloadResult.failed}.`
    );
    console.log(`Updated manifest at ${fromManifestPath}.`);
    return;
  }

  const loginHtml = await login();
  const account = parseAccount(loginHtml);

  console.log(
    `Logged in as ${account.username ?? username}; membership: ${
      account.membership ?? "unknown"
    }; expiry: ${account.expiry ?? "unknown"}.`
  );

  const startUrls = new Set(
    explicitStartUrls.length > 0 ? explicitStartUrls : DEFAULT_START_URLS
  );

  if (useSitemap) {
    const sitemapUrls = await collectSitemapUrls();
    for (const url of sitemapUrls) {
      startUrls.add(url);
    }
  }

  const crawlResult = await crawl([...startUrls]);
  const manifest = buildManifest(crawlResult, account);

  if (shouldDownload) {
    const downloadResult = await downloadResources(manifest.resources);
    manifest.crawl.download_attempted_count = downloadResult.attempted;
    manifest.crawl.download_success_count = downloadResult.succeeded;
    manifest.crawl.download_error_count = downloadResult.failed;
    manifest.crawl.last_download_offset = downloadOffset;
    manifest.crawl.last_download_limit = Number.isFinite(downloadLimit)
      ? downloadLimit
      : null;
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(
    `${inventoryOnly ? "Inventoried" : "Processed"} ${
      manifest.resources.length
    } material links from ${crawlResult.pages.length} pages.`
  );
  console.log(`Manifest written to ${manifestPath}.`);
  if (shouldDownload) {
    console.log(`Downloaded files are under ${outputRoot}.`);
  }
}

async function login() {
  const body = new URLSearchParams({
    swpm_login_origination_flag: "1",
    swpm_user_name: username,
    swpm_password: password,
    "swpm-login": "Log In"
  });

  await fetchWithCookies(LOGIN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": "ELimuCore authorized migration"
    },
    body
  });

  const response = await fetchWithCookies(LOGIN_URL, {
    headers: {
      "user-agent": "ELimuCore authorized migration"
    }
  });
  const html = await response.text();

  if (!html.includes("swpm-login-widget-logged")) {
    throw new Error("Login did not appear to succeed.");
  }

  return html;
}

async function collectSitemapUrls() {
  const urls = new Set();
  const sitemapIndex = `${SITE_ORIGIN}/sitemap_index.xml`;

  try {
    const indexResponse = await fetchWithCookies(sitemapIndex);
    if (!indexResponse.ok) {
      return urls;
    }

    const indexXml = await indexResponse.text();
    const sitemapUrls = extractLocs(indexXml).filter((url) =>
      url.endsWith(".xml")
    );

    for (const sitemapUrl of sitemapUrls) {
      await delay(crawlDelayMs);
      const sitemapResponse = await fetchWithCookies(sitemapUrl);
      if (!sitemapResponse.ok) {
        continue;
      }

      const sitemapXml = await sitemapResponse.text();
      for (const loc of extractLocs(sitemapXml)) {
        const normalized = normalizeUrl(loc);
        if (normalized && isInternalPageUrl(normalized)) {
          urls.add(normalized);
        }
      }
    }
  } catch (error) {
    console.warn(`Could not read sitemap: ${error.message}`);
  }

  return urls;
}

async function crawl(initialUrls) {
  const queue = initialUrls
    .map((url) => normalizeUrl(url))
    .filter(Boolean)
    .filter((url) => isInternalPageUrl(url));
  const queued = new Set(queue);
  const visited = new Set();
  const pages = [];
  const materialMap = new Map();

  while (queue.length > 0 && visited.size < maxPages) {
    const pageUrl = queue.shift();
    queued.delete(pageUrl);

    if (!pageUrl || visited.has(pageUrl)) {
      continue;
    }

    visited.add(pageUrl);
    await delay(crawlDelayMs);

    try {
      const response = await fetchWithCookies(pageUrl, {
        headers: {
          "user-agent": "ELimuCore authorized migration"
        }
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok || !contentType.includes("text/html")) {
        continue;
      }

      const html = await response.text();
      const pageTitle = extractTitle(html);
      const links = extractLinks(html, pageUrl);
      pages.push({ url: pageUrl, title: pageTitle, link_count: links.length });

      for (const link of links) {
        const normalized = normalizeUrl(link.href, pageUrl);
        if (!normalized) {
          continue;
        }

        if (isMaterialUrl(normalized)) {
          const material = normalizeMaterial({
            url: normalized,
            label: link.label,
            pageUrl,
            pageTitle
          });
          if (!materialMap.has(material.key)) {
            materialMap.set(material.key, material);
          }
          continue;
        }

        if (
          isInternalPageUrl(normalized) &&
          !visited.has(normalized) &&
          !queued.has(normalized)
        ) {
          queue.push(normalized);
          queued.add(normalized);
        }
      }

      if (visited.size % 25 === 0) {
        console.log(
          `Crawled ${visited.size} pages; found ${materialMap.size} unique material links...`
        );
      }
    } catch (error) {
      console.warn(`Skipping ${pageUrl}: ${error.message}`);
    }
  }

  return {
    pages,
    resources: [...materialMap.values()]
  };
}

function buildManifest(crawlResult, account) {
  const resources = crawlResult.resources.map((material) => {
    const title = material.fileName || material.label || material.pageTitle;
    const inferred = inferImportedResourceMetadata({
      title,
      summary: material.pageTitle,
      description: material.pageTitle,
      sourcePageTitle: material.pageTitle,
      sourceUrl: material.url
    });
    const resource_year = inferYear(`${title} ${material.pageTitle}`);
    const format = inferFormat(title, material.url);
    const slug = uniqueSlug(
      `${resource_year ?? ""} ${inferred.subject} ${title}`,
      material.key
    );

    return {
      slug,
      title: cleanText(title),
      summary: `Authorized migration from ${material.pageTitle}.`,
      description: `Material migrated from KCSE Online page: ${material.pageTitle}.`,
      school_level_slug: inferred.school_level_slug,
      category_slug: inferred.category_slug,
      subject: inferred.subject,
      access: "premium",
      format,
      resource_year,
      term: inferTerm(`${title} ${material.pageTitle}`),
      featured: false,
      published: true,
      storage_path: material.localPath ?? null,
      source_url: material.url,
      source_page_url: material.pageUrl,
      source_page_title: material.pageTitle,
      source_key: material.key
    };
  });

  return {
    source: SITE_ORIGIN,
    generated_at: new Date().toISOString(),
    authorized_by: "User confirmed permission in this workspace.",
    account,
    crawl: {
      pages_scanned: crawlResult.pages.length,
      resources_found: resources.length,
      max_pages: maxPages,
      downloaded: shouldDownload
    },
    pages: crawlResult.pages,
    resources
  };
}

async function downloadResources(resources) {
  const endIndex = Number.isFinite(downloadLimit)
    ? downloadOffset + downloadLimit
    : undefined;
  const selectedResources = resources.slice(downloadOffset, endIndex);
  const result = {
    attempted: selectedResources.length,
    succeeded: 0,
    failed: 0
  };

  for (const [index, resource] of selectedResources.entries()) {
    const resourceDir = join(outputRoot, resource.category_slug);
    await mkdir(resourceDir, { recursive: true });

    const safeName = sanitizeFileName(resource.title);
    const extension = extensionForResource(resource);
    const filePath = join(resourceDir, `${resource.slug}${extension}`);

    if (await fileExists(filePath)) {
      resource.storage_path = relativePath(filePath);
      delete resource.download_error;
      result.succeeded += 1;
      continue;
    }

    try {
      const downloadUrl = toDownloadUrl(resource.source_url);
      const response = await fetch(downloadUrl, {
        redirect: "follow",
        headers: {
          "user-agent": "ELimuCore authorized migration"
        }
      });

      if (!response.ok || !response.body) {
        throw new Error(`download failed with status ${response.status}`);
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("text/html") && isGoogleDriveUrl(resource.source_url)) {
        throw new Error(
          "Google Drive returned a viewer page instead of a downloadable file"
        );
      }

      await pipeline(Readable.fromWeb(response.body), createWriteStream(filePath));
      resource.storage_path = relativePath(filePath);
      resource.file_size_bytes = (await stat(filePath)).size;
      resource.mime_type = contentType || null;
      delete resource.download_error;
      resource.downloaded_at = new Date().toISOString();
      result.succeeded += 1;

      if (!quiet) {
        console.log(
          `Downloaded ${index + 1}/${selectedResources.length}: ${safeName}${extension}`
        );
      }
    } catch (error) {
      resource.download_error = error.message;
      result.failed += 1;
      if (!quiet) {
        console.warn(`Could not download ${resource.source_url}: ${error.message}`);
      }
    }

    await delay(crawlDelayMs);
  }

  return result;
}

async function fetchWithCookies(url, options = {}) {
  let currentUrl = url;
  let currentOptions = { ...options };

  for (let redirectCount = 0; redirectCount < 8; redirectCount += 1) {
    const headers = new Headers(currentOptions.headers ?? {});
    const cookieHeader = cookieJar.header();
    if (cookieHeader) {
      headers.set("cookie", cookieHeader);
    }

    const response = await fetch(currentUrl, {
      ...currentOptions,
      headers,
      redirect: "manual"
    });
    cookieJar.setFromResponse(response);

    const location = response.headers.get("location");
    if (
      location &&
      [301, 302, 303, 307, 308].includes(response.status)
    ) {
      currentUrl = new URL(location, currentUrl).href;
      currentOptions = {
        ...currentOptions,
        method: "GET",
        body: undefined
      };
      continue;
    }

    return response;
  }

  throw new Error(`Too many redirects while fetching ${url}`);
}

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  setFromResponse(response) {
    const getSetCookie = response.headers.getSetCookie?.bind(response.headers);
    const rawCookies =
      typeof getSetCookie === "function"
        ? getSetCookie()
        : splitCombinedSetCookie(response.headers.get("set-cookie"));

    for (const rawCookie of rawCookies) {
      const [pair] = rawCookie.split(";");
      const separatorIndex = pair.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const name = pair.slice(0, separatorIndex).trim();
      const value = pair.slice(separatorIndex + 1).trim();
      if (name) {
        this.cookies.set(name, value);
      }
    }
  }

  header() {
    return [...this.cookies.entries()]
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }
}

function parseArgs(rawArgs) {
  return rawArgs.reduce((acc, arg) => {
    if (!arg.startsWith("--")) {
      return acc;
    }

    const [key, value] = arg.slice(2).split("=");
    acc[key] = value ?? true;
    return acc;
  }, {});
}

function normalizeStartUrls(value) {
  if (!value) {
    return [];
  }

  const values = Array.isArray(value) ? value : String(value).split(",");
  return values
    .flatMap((item) => String(item).split(","))
    .map((item) => normalizeUrl(item.trim()))
    .filter(Boolean);
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) =>
    decodeHtml(match[1].trim())
  );
}

function extractLinks(html, baseUrl) {
  const links = [];
  const anchorPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(anchorPattern)) {
    const attrs = match[1];
    const href = getAttribute(attrs, "href");
    if (!href) {
      continue;
    }

    const ariaLabel = getAttribute(attrs, "aria-label");
    const label = cleanText(ariaLabel || stripTags(match[2]));
    links.push({
      href: normalizeUrl(href, baseUrl),
      label
    });
  }

  return links.filter((link) => Boolean(link.href));
}

function getAttribute(attrs, name) {
  const pattern = new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i");
  return attrs.match(pattern)?.[1] ?? "";
}

function extractTitle(html) {
  const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const title = heading || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return cleanText(stripTags(title ?? "Untitled page"));
}

function normalizeUrl(url, baseUrl = SITE_ORIGIN) {
  if (!url || url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:")) {
    return null;
  }

  try {
    const normalized = new URL(decodeHtml(url), baseUrl);
    normalized.hash = "";

    if (normalized.protocol !== "http:" && normalized.protocol !== "https:") {
      return null;
    }

    return normalized.href;
  } catch {
    return null;
  }
}

function isInternalPageUrl(url) {
  const parsed = new URL(url);
  if (parsed.origin !== SITE_ORIGIN) {
    return false;
  }

  if (
    parsed.pathname.includes("/wp-admin") ||
    parsed.pathname.includes("/wp-login") ||
    parsed.pathname.includes("/xmlrpc.php") ||
    parsed.pathname.includes("/wp-json") ||
    parsed.pathname.includes("/feed") ||
    parsed.pathname.includes("/comments")
  ) {
    return false;
  }

  return !FILE_EXTENSION_PATTERN.test(parsed.pathname);
}

function isMaterialUrl(url) {
  const parsed = new URL(url);
  return (
    isGoogleDriveUrl(url) ||
    FILE_EXTENSION_PATTERN.test(parsed.pathname) ||
    parsed.pathname.includes("/wp-content/uploads/")
  );
}

function isGoogleDriveUrl(url) {
  const host = new URL(url).hostname;
  return host === "drive.google.com" || host.endsWith(".googleusercontent.com");
}

function normalizeMaterial({ url, label, pageUrl, pageTitle }) {
  const driveId = extractDriveId(url);
  const fileName =
    cleanText(label) || (driveId ? `Google Drive file ${driveId}` : url.split("/").pop());
  const key = driveId ? `drive:${driveId}` : `url:${url}`;

  return {
    key,
    url,
    label: cleanText(label),
    fileName,
    pageUrl,
    pageTitle
  };
}

function extractDriveId(url) {
  const parsed = new URL(url);
  const id = parsed.searchParams.get("id");
  if (id) {
    return id;
  }

  return parsed.pathname.match(/\/file\/d\/([^/]+)/)?.[1] ?? null;
}

function toDownloadUrl(url) {
  const driveId = extractDriveId(url);
  if (driveId) {
    return `https://drive.google.com/uc?export=download&id=${driveId}`;
  }

  return url;
}

function inferYear(text) {
  const year = text.match(/\b(20[0-3][0-9]|19[8-9][0-9])\b/)?.[1];
  return year ? Number.parseInt(year, 10) : null;
}

function inferTerm(text) {
  const lower = text.toLowerCase();
  const term = lower.match(/term\s*([123])/i)?.[1];
  if (term) {
    return `Term ${term}`;
  }
  if (lower.includes("holiday")) {
    return "Holiday";
  }
  return null;
}

function inferFormat(title, url) {
  const lower = `${title} ${url}`.toLowerCase();
  if (lower.includes(".ppt") || lower.includes("powerpoint")) {
    return "PowerPoint";
  }
  if (lower.includes(".doc")) {
    return "DOCX";
  }
  if (lower.includes(".xls")) {
    return "Spreadsheet";
  }
  if (lower.includes(".zip")) {
    return "ZIP archive";
  }
  return "PDF";
}

function uniqueSlug(text, key) {
  const base = slugify(text).slice(0, 90) || "material";
  const suffix = slugify(key).slice(-10);
  return `${base}-${suffix}`;
}

function slugify(text) {
  return cleanText(text)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function sanitizeFileName(text) {
  return cleanText(text)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function extensionForResource(resource) {
  const sourcePath = new URL(resource.source_url).pathname;
  const sourceExtension = extname(sourcePath);
  if (sourceExtension) {
    return sourceExtension;
  }

  if (resource.format === "PowerPoint") {
    return ".pptx";
  }
  if (resource.format === "DOCX") {
    return ".docx";
  }
  if (resource.format === "Spreadsheet") {
    return ".xlsx";
  }
  if (resource.format === "ZIP archive") {
    return ".zip";
  }
  return ".pdf";
}

async function fileExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function relativePath(path) {
  return path.replace(`${process.cwd()}\\`, "").replaceAll("\\", "/");
}

function stripTags(html) {
  return String(html).replace(/<[^>]+>/g, " ");
}

function cleanText(value) {
  return decodeHtml(String(value ?? ""))
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value) {
  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    )
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function splitCombinedSetCookie(value) {
  if (!value) {
    return [];
  }

  return value.split(/,(?=\s*[^;,=]+=[^;,]+)/g);
}

function parseAccount(html) {
  return {
    username: extractLoggedValue(html, "swpm-logged-username-value"),
    status: extractLoggedValue(html, "swpm-logged-status-value"),
    membership: extractLoggedValue(html, "swpm-logged-membership-value"),
    expiry: extractLoggedValue(html, "swpm-logged-expiry-value")
  };
}

function extractLoggedValue(html, className) {
  const pattern = new RegExp(
    `<div class="${className}[^"]*">([\\s\\S]*?)<\\/div>`,
    "i"
  );
  return cleanText(stripTags(html.match(pattern)?.[1] ?? ""));
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

await main();
