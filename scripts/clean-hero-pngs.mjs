import path from "node:path";
import sharp from "sharp";

const assets = [
  { file: "dash.png", alphaCutoff: 60 },
  { file: "family.png", alphaCutoff: 96 },
  { file: "zoom.png", alphaCutoff: 96 }
];

function removeWhiteMatte(value, alpha) {
  if (alpha >= 255) {
    return value;
  }

  const normalizedAlpha = alpha / 255;
  const corrected = (value - 255 * (1 - normalizedAlpha)) / normalizedAlpha;

  return Math.max(0, Math.min(255, Math.round(corrected)));
}

for (const asset of assets) {
  const { file, alphaCutoff } = asset;
  const filePath = path.join(process.cwd(), "assets", file);
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let index = 0; index < data.length; index += info.channels) {
    const alpha = data[index + 3];

    if (alpha <= alphaCutoff) {
      data[index] = 0;
      data[index + 1] = 0;
      data[index + 2] = 0;
      data[index + 3] = 0;
      continue;
    }

    data[index] = removeWhiteMatte(data[index], alpha);
    data[index + 1] = removeWhiteMatte(data[index + 1], alpha);
    data[index + 2] = removeWhiteMatte(data[index + 2], alpha);
  }

  const cleaned = await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp(cleaned).png().toFile(filePath);

  console.log(`Cleaned ${file}`);
}
