import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/weblogo.png";

const footerLinks = [
  { label: "Pricing", href: "/#plans" },
  { label: "Support", href: "/#how-to-use" },
  { label: "Scheme Bot", href: "/scheme-bot" },
  { label: "Login", href: "/login" },
  { label: "Sign Up", href: "/signup" }
] as const;

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6H16.8V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 4.1V11H8v3h2.7v8h2.8Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer
      id="footer"
      className="border-t border-[#ececec] bg-white px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex max-w-[1360px] flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Image
            src={logo}
            alt="ELimuCore"
            width={180}
            height={58}
            className="h-12 w-auto"
          />

          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/elimucoreh"
              target="_blank"
              rel="noreferrer"
              aria-label="ELimuCore on Facebook"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-[#25b24a] hover:text-white"
            >
              <FacebookIcon />
            </a>

            <span
              aria-label="ELimuCore on Instagram"
              title="Instagram link coming soon"
              className="inline-flex h-10 w-10 cursor-default items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400"
            >
              <InstagramIcon />
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {footerLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-md px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#25b24a] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

