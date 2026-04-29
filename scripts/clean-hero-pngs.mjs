import path from "node:path";
import sharp from "sharp";

const assets = [
  {
    file: "dash.png",
    matcher: (r, g, b) => isBlueDashboardBackground(r, g, b)
  },
  {
    file: "family.png",
    matcher: (r, g, b) => isGreenFamilyBackground(r, g, b)
  },
  {
    file: "zoom.png",
    matcher: (r, g, b) => isMaroonZoomBackground(r, g, b)
  }
];

function isBlueDashboardBackground(r, g, b) {
  return b > 180 && g > 90 && r < 120;
}

function isGreenFamilyBackground(r, g, b) {
  return g > 135 && b > 70 && b < 170 && r < 90;
}

function isMaroonZoomBackground(r, g, b) {
  return r > 90 && r < 180 && g < 80 && b < 100 && r - g > 45 && r - b > 20;
}

for (const asset of assets) {
  const filePath = path.join(process.cwd(), "assets", asset.file);
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const visited = new Uint8Array(width * height);
  const queue = [];

  const pushIfBackground = (x, y) => {
    const index = y * width + x;
    if (visited[index]) {
      return;
    }

    const pixelIndex = index * 4;
    const r = data[pixelIndex];
    const g = data[pixelIndex + 1];
    const b = data[pixelIndex + 2];

    if (!asset.matcher(r, g, b)) {
      return;
    }

    visited[index] = 1;
    queue.push(index);
  };

  for (let x = 0; x < width; x++) {
    pushIfBackground(x, 0);
    pushIfBackground(x, height - 1);
  }

  for (let y = 0; y < height; y++) {
    pushIfBackground(0, y);
    pushIfBackground(width - 1, y);
  }

  while (queue.length > 0) {
    const index = queue.pop();
    const x = index % width;
    const y = Math.floor(index / width);
    const pixelIndex = index * 4;

    data[pixelIndex + 3] = 0;

    const neighbors = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1]
    ];

    for (const [nextX, nextY] of neighbors) {
      if (
        nextX < 0 ||
        nextX >= width ||
        nextY < 0 ||
        nextY >= height
      ) {
        continue;
      }

      pushIfBackground(nextX, nextY);
    }
  }

  await sharp(data, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
    .png()
    .toFile(filePath);

  console.log(`Cleaned ${asset.file}`);
}
