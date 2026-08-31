/**
 * Build script for FocusBear extension
 * Creates a production-ready build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('Building FocusBear extension...');

// Create dist directory
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy files to dist
const filesToCopy = [
  'manifest.json',
  'src',
  'assets',
];

filesToCopy.forEach((file) => {
  const src = path.join(rootDir, file);
  const dest = path.join(distDir, file);

  if (fs.existsSync(src)) {
    if (fs.lstatSync(src).isDirectory()) {
      copyDir(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
});

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Stamp version_name in dist/manifest.json without mutating tracked file (deterministic build)
try {
  const distManifestPath = path.join(distDir, 'manifest.json');
  if (fs.existsSync(distManifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(distManifestPath, 'utf8'));
    const baseVersion = manifest.version;
    let gitHash = 'dev';
    try {
      gitHash = execSync('git rev-parse --short HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
    } catch {
      // No git repo or command failed — keep dev
    }
    manifest.version_name = `${baseVersion}-${gitHash}`;
    fs.writeFileSync(distManifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`Stamped dist/manifest.json version_name: ${manifest.version_name}`);
  }
} catch (error) {
  console.warn('Warning: could not stamp dist manifest version_name', error.message);
}

console.log('Build complete! Output in dist/');
