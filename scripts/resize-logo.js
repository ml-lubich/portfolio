/**
 * Resize public/logo.png to 256×256 and overwrite it.
 * Run once to reduce logo payload (~7MB → ~50KB) for better LCP.
 *
 * Requires: bun add -d sharp (or already in devDependencies).
 * Run: bun run resize-logo
 */
const path = require("path");
const fs = require("fs");

async function main() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.error("Install sharp with Bun: bun add -d sharp");
    process.exit(1);
  }

  const logoPath = path.join(process.cwd(), "public", "logo.png");
  if (!fs.existsSync(logoPath)) {
    console.error("Not found: public/logo.png");
    process.exit(1);
  }

  const backup = path.join(process.cwd(), "public", "logo-original.png");
  if (!fs.existsSync(backup)) {
    fs.copyFileSync(logoPath, backup);
    console.log("Backed up to public/logo-original.png");
  }

  const buf = await sharp(logoPath)
    .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(logoPath, buf);
  console.log("Resized public/logo.png to 256×256. Run: bun run generate-favicons");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
