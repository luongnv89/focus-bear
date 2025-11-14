# Assets Directory

## Icons

The extension requires the following icon sizes:
- `icon-16.png` - 16x16px (toolbar)
- `icon-48.png` - 48x48px (extension management page)
- `icon-128.png` - 128x128px (Chrome Web Store)

### Temporary Note

Currently using SVG placeholder (`icon.svg`). For development, you can:

1. Convert the SVG to PNG using an online tool or ImageMagick:
   ```bash
   # If you have ImageMagick installed
   convert -background none -resize 16x16 icon.svg icon-16.png
   convert -background none -resize 48x48 icon.svg icon-48.png
   convert -background none -resize 128x128 icon.svg icon-128.png
   ```

2. Or create simple 1x1 pixel PNGs for testing:
   ```bash
   # Create minimal test icons
   echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > icon-16.png
   echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > icon-48.png
   echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > icon-128.png
   ```

### Brand Guidelines

Icons should follow the FocusBear brand kit:
- Primary colors: Bear Blue (#0E75B6), Focus Purple (#6C5CE7)
- Feature the bear mascot
- Simple, friendly, approachable design
