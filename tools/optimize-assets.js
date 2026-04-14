const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const rootDir = path.resolve(__dirname, "..");
const inputDir = path.join(rootDir, "images");
const outputDir = path.join(rootDir, "optimized");
const thumbsDir = path.join(outputDir, "thumbs");
const fullDir = path.join(outputDir, "full");
const manifestPath = path.join(rootDir, "gallery-data.js");

const thumbOptions = { width: 420, height: 280, fit: "cover", position: "attention" };
const fullOptions = { width: 1800, height: 1800, fit: "inside", withoutEnlargement: true };

function isSupportedImage(fileName) {
  return /\.(jpe?g|png)$/i.test(fileName) && !fileName.endsWith(":Zone.Identifier");
}

function toLabel(fileName) {
  return path
    .parse(fileName)
    .name
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function ensureDirectories() {
  await fs.mkdir(thumbsDir, { recursive: true });
  await fs.mkdir(fullDir, { recursive: true });
}

async function buildVariant(source, resizeOptions, outputBase, qualitySet) {
  const { data, info } = await source
    .clone()
    .resize(resizeOptions)
    .jpeg({ quality: qualitySet.jpeg, mozjpeg: true, progressive: true })
    .toBuffer({ resolveWithObject: true });

  await fs.writeFile(`${outputBase}.jpg`, data);

  await source
    .clone()
    .resize(resizeOptions)
    .webp({ quality: qualitySet.webp })
    .toFile(`${outputBase}.webp`);

  await source
    .clone()
    .resize(resizeOptions)
    .avif({ quality: qualitySet.avif })
    .toFile(`${outputBase}.avif`);

  return { width: info.width, height: info.height };
}

async function buildImageManifest() {
  await ensureDirectories();

  const entries = await fs.readdir(inputDir);
  const imageFiles = entries.filter(isSupportedImage).sort((left, right) => left.localeCompare(right));

  const manifest = [];

  for (const fileName of imageFiles) {
    const inputPath = path.join(inputDir, fileName);
    const slug = path.parse(fileName).name;
    const label = toLabel(fileName);
    const source = sharp(inputPath).rotate();

    const thumbBase = path.join(thumbsDir, `${slug}-thumb`);
    const fullBase = path.join(fullDir, `${slug}-full`);

    const thumbMeta = await buildVariant(source, thumbOptions, thumbBase, {
      jpeg: 72,
      webp: 68,
      avif: 48
    });

    const fullMeta = await buildVariant(source, fullOptions, fullBase, {
      jpeg: 76,
      webp: 72,
      avif: 50
    });

    manifest.push({
      id: slug,
      label,
      thumb: {
        avif: `optimized/thumbs/${slug}-thumb.avif`,
        webp: `optimized/thumbs/${slug}-thumb.webp`,
        fallback: `optimized/thumbs/${slug}-thumb.jpg`,
        width: thumbMeta.width,
        height: thumbMeta.height
      },
      full: {
        avif: `optimized/full/${slug}-full.avif`,
        webp: `optimized/full/${slug}-full.webp`,
        fallback: `optimized/full/${slug}-full.jpg`,
        width: fullMeta.width,
        height: fullMeta.height
      }
    });
  }

  const manifestContent = `window.GALLERY_IMAGES = ${JSON.stringify(manifest, null, 2)};\n`;
  await fs.writeFile(manifestPath, manifestContent, "utf8");

  console.log(`Generated ${manifest.length} optimized image entries.`);
}

buildImageManifest().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});