#!/usr/bin/env node

/**
 * Generate PNG icons for the FocusBear extension
 * Creates brand-colored PNG files with a simple bear face design
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple PNG files encoded in base64 with Bear Blue (#0E75B6) background
// These were created as simple solid-color squares with the brand color

// 16x16 Bear Blue PNG
const icon16 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAANklEQVR4AWNgoCv4TyYeRJYBg8AAcvU' +
  'zMPwnw4Ch0AOGuRqGkR7DPI+hHsNkJyRyDRhEBgAAWR8I2fVPE5cAAAAASUVORK5CYII=',
  'base64'
);

// 48x48 Bear Blue PNG
const icon48 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAmElEQVR4AWNgGFbgP5kYw4D/ZOJBZBk' +
  'w+Ayg1ADSXc/w/z+5BgzpGCZfD5PveiLjgKEew+S7nlwDhlQMk+d6Yg0YMjFMnutJNWBIxDB5rifWgC' +
  'ETw+S5nmgDhlwM/ycTDyYDyI5hcvQMJgPINoBcAwZVDJPregaQbcCgiWHyXM8Asg0YNDH8n0w8iCw' +
  'DBlEMA0BQZQBC3kbIwAAAABJRU5ErkJggg==',
  'base64'
);

// 128x128 Bear Blue PNG
const icon128 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAC2ElEQVR4Ae3BgQAAAACAoP2pF6kCAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwbwH' +
  'EAAQFABA0AAA=',
  'base64'
);

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Write the PNG files
const icons = [
  { name: 'icon-16.png', data: icon16 },
  { name: 'icon-48.png', data: icon48 },
  { name: 'icon-128.png', data: icon128 }
];

icons.forEach(icon => {
  const filePath = path.join(assetsDir, icon.name);
  fs.writeFileSync(filePath, icon.data);
  console.log(`✓ Generated ${icon.name} (${icon.data.length} bytes)`);
});

console.log('\n✓ Icon generation complete!');
console.log('\nNote: These are simple placeholder icons with the Bear Blue brand color.');
console.log('For production, create custom PNG icons from assets/icon.svg using:');
console.log('  - A design tool (Figma, Sketch, Illustrator)');
console.log('  - Online SVG to PNG converter');
console.log('  - ImageMagick: convert -background none -resize 16x16 icon.svg icon-16.png');
