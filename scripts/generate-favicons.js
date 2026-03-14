/**
 * Generate favicons from public/logo.png. Run with Bun: bun run generate-favicons
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateFavicons() {
  const logoPath = path.join(process.cwd(), 'public', 'logo.png');
  const faviconDir = path.join(process.cwd(), 'public', 'favicon');

  if (!fs.existsSync(faviconDir)) fs.mkdirSync(faviconDir, { recursive: true });

  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
  ];

  for (const { name, size } of sizes) {
    await sharp(logoPath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(faviconDir, name));
    console.log('Created:', name);
  }

  // 32x32 PNG as favicon.ico (browsers accept PNG in .ico container)
  await sharp(logoPath)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(faviconDir, 'favicon.ico'));
  console.log('Created: favicon/favicon.ico');

  // Root fallback for browsers that look at /favicon.ico
  await sharp(logoPath)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(process.cwd(), 'public', 'favicon.ico'));
  console.log('Created: public/favicon.ico');

  console.log('\nAll favicons generated successfully!');
}

generateFavicons().catch(console.error);
