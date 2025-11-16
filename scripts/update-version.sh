#!/bin/bash
# Update version_name in manifest.json with current git commit hash
# Usage: ./scripts/update-version.sh

set -e

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MANIFEST_PATH="$PROJECT_ROOT/manifest.json"

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "Error: Not in a git repository"
  exit 1
fi

# Get current git commit hash (short version)
GIT_HASH=$(git rev-parse --short HEAD)

# Get the base version from manifest.json
BASE_VERSION=$(grep -o '"version": "[^"]*"' "$MANIFEST_PATH" | cut -d'"' -f4)

# Create version_name with git hash
VERSION_NAME="${BASE_VERSION}-${GIT_HASH}"

echo "Updating manifest.json:"
echo "  Base version: $BASE_VERSION"
echo "  Git hash: $GIT_HASH"
echo "  Version name: $VERSION_NAME"

# Check if version_name already exists in manifest.json
if grep -q '"version_name"' "$MANIFEST_PATH"; then
  # Update existing version_name using sed
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/\"version_name\": \"[^\"]*\"/\"version_name\": \"$VERSION_NAME\"/" "$MANIFEST_PATH"
  else
    # Linux
    sed -i "s/\"version_name\": \"[^\"]*\"/\"version_name\": \"$VERSION_NAME\"/" "$MANIFEST_PATH"
  fi
  echo "✓ Updated version_name to: $VERSION_NAME"
else
  # Add version_name after version field
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "/\"version\": \"$BASE_VERSION\",/a\\
  \"version_name\": \"$VERSION_NAME\",
" "$MANIFEST_PATH"
  else
    # Linux
    sed -i "/\"version\": \"$BASE_VERSION\",/a\\  \"version_name\": \"$VERSION_NAME\"," "$MANIFEST_PATH"
  fi
  echo "✓ Added version_name: $VERSION_NAME"
fi

echo "Done!"
