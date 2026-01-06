#!/bin/bash

# LABOKit Linux Setup Script
# Automatically detects distribution and installs dependencies

set -e

echo "🐧 LABOKit Linux Setup"
echo "======================="

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
else
    echo "❌ Cannot detect Linux distribution"
    exit 1
fi

echo "Detected: $OS $VER"
echo ""

# Install system dependencies based on distribution
case $OS in
    ubuntu|debian)
        echo "📦 Installing dependencies for Ubuntu/Debian..."
        sudo apt-get update
        sudo apt-get install -y \
            python3 \
            python3-pip \
            python3-venv \
            build-essential \
            libssl-dev \
            libffi-dev \
            libopencv-dev \
            nodejs \
            npm
        ;;
    fedora)
        echo "📦 Installing dependencies for Fedora..."
        sudo dnf install -y \
            python3 \
            python3-devel \
            python3-pip \
            gcc \
            gcc-c++ \
            make \
            opencv-devel \
            nodejs \
            npm
        ;;
    arch)
        echo "📦 Installing dependencies for Arch Linux..."
        sudo pacman -Sy --noconfirm \
            python \
            python-pip \
            base-devel \
            opencv \
            nodejs \
            npm
        ;;
    *)
        echo "⚠️  Unsupported distribution: $OS"
        echo "Please install manually:"
        echo "  - Python 3.8+"
        echo "  - Node.js 18+"
        echo "  - npm or yarn"
        exit 1
        ;;
esac

echo ""
echo "✅ System dependencies installed"
echo ""

# Install npm dependencies
if [ -d "node_modules" ]; then
    echo "Updating npm dependencies..."
else
    echo "Installing npm dependencies..."
fi
npm install

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install -r requirements.txt

echo ""
echo "🎉 Setup complete!"
echo "To start development, run: npm run dev:linux"
