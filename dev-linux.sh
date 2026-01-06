#!/bin/bash

# LABOKit Linux Development Helper
# Ensures native Linux Electron binary is used (not Wine)

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🐧 LABOKit Linux Development Setup"
echo "======================================"

# Check if node_modules exists
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Force Linux platform for Electron
echo "🔧 Configuring for Linux native binary..."
npm_config_platform=linux npm_config_arch=x64 node node_modules/electron/install.js

# Verify we have the Linux binary
ELECTRON_BIN="$PROJECT_DIR/node_modules/electron/dist/electron"
if [ -f "$ELECTRON_BIN" ]; then
    FILE_TYPE=$(file "$ELECTRON_BIN" | grep -o "ELF\|PE32" | head -1)
    if [ "$FILE_TYPE" = "ELF" ]; then
        echo "✅ Linux native binary verified (ELF 64-bit)"
    else
        echo "⚠️  Warning: Expected ELF binary, got $FILE_TYPE"
    fi
else
    echo "❌ Electron binary not found at $ELECTRON_BIN"
    exit 1
fi

echo ""
echo "🚀 Starting LABOKit development..."
npm run dev:linux
