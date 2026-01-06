#!/bin/bash

# Setup script for LABOKit Python dependencies
# Detects OS and installs required Python packages

set -e

echo "🚀 LABOKit Python Dependencies Setup"
echo "======================================"
echo ""

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    echo "Detected: Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    echo "Detected: macOS"
else
    echo "❌ Unsupported OS: $OSTYPE"
    exit 1
fi

echo ""
echo "Checking Python installation..."
python --version || {
    echo "❌ Python not found!"
    if [[ "$OS" == "linux" ]]; then
        echo ""
        echo "Install Python with:"
        echo "  Ubuntu/Debian: sudo apt install python3 python3-pip"
        echo "  Fedora: sudo dnf install python3 python3-pip"
        echo "  Arch: pacman -S python python-pip"
    fi
    exit 1
}

echo ""
echo "Installing required packages..."
echo "(This may take 5-15 minutes as torch is large)"
echo ""

# Install packages
pip install rembg torch torchvision onnxruntime

echo ""
echo "✅ Setup complete!"
echo ""
echo "You can now run LABOKit:"
echo "  ./LABOKit-Linux-1.0.0.AppImage"
echo ""
echo "Features that now work:"
echo "  ✅ Image Upscaling (RealESRGAN)"
echo "  ✅ Format Conversion"
echo "  ✅ Background Removal (rembg)"
