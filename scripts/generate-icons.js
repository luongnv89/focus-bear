#!/usr/bin/env node

/**
 * Generate PNG icons for the FocusPaw extension
 * Converts the SVG icon to PNG files at multiple resolutions
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 32, 48, 128];
const svgPath = path.join(__dirname, '..', 'assets', 'icon.svg');
const assetsDir = path.join(__dirname, '..', 'assets');

async function generateIcons() {
  console.log('🐾 Generating FocusPaw icons from SVG...\n');

  // Create assets directory if it doesn't exist
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Read SVG file
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate PNG for each size
  for (const size of sizes) {
    const outputPath = path.join(assetsDir, `icon-${size}.png`);
    console.log(`Generating ${size}x${size} icon...`);

    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      console.log(`✓ Generated icon-${size}.png (${stats.size} bytes)`);
    } catch (error) {
      console.error(`✗ Failed to generate ${size}x${size} icon:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n✅ All icons generated successfully!');
  console.log('Icons created: icon-16.png, icon-32.png, icon-48.png, icon-128.png');
}

generateIcons().catch((error) => {
  console.error('Error generating icons:', error);
  process.exit(1);
});
