# LABOKit Linux Build Guide

## Overview

This guide covers building and running LABOKit natively on Linux without Wine or any Windows compatibility layer.

## System Requirements

- **Linux**: 64-bit (Ubuntu 20.04+, Fedora 30+, Debian 10+, or similar)
- **Node.js**: 18.0.0 or later
- **npm**: 9.0.0 or later  
- **Python**: 3.8 or later
- **RAM**: Minimum 2GB (4GB+ recommended for AI processing)
- **Disk Space**: 500MB for app, 1-2GB for models

## Supported Distributions

- ✅ Ubuntu 20.04 LTS and newer
- ✅ Debian 10 (Buster) and newer
- ✅ Fedora 30 and newer
- ✅ Arch Linux
- ✅ CentOS 8+
- ✅ Other systemd-based distributions

## Quick Setup

### Automated Setup (Recommended)

```bash
chmod +x setup-linux.sh
./setup-linux.sh
```

This script will:
1. Detect your Linux distribution
2. Install system dependencies
3. Install npm packages
4. Install Python dependencies

### Manual Setup

1. **Install system dependencies** (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install -y python3 python3-pip build-essential nodejs npm
```

2. **Install npm dependencies**:
```bash
npm install
```

3. **Install Python dependencies**:
```bash
pip3 install -r requirements.txt
```

## Development

### Start with Native Linux Binary

To ensure you're using the native Linux binary (not Wine):

```bash
chmod +x dev-linux.sh
./dev-linux.sh
```

Or manually:

```bash
npm_config_platform=linux npm_config_arch=x64 node node_modules/electron/install.js
npm run dev:linux
```

### Without Helper Script

```bash
npm run dev:linux
```

## Building for Distribution

### Build AppImage (Single Executable)

```bash
npm run build:linux
```

Output: `release/1.0.0/LABOKit-Linux-1.0.0.AppImage`

**Features:**
- No installation required
- Portable across all Linux distributions
- Contains all dependencies
- Icon embedded in executable

### Build DEB Package (Ubuntu/Debian)

```bash
npm run build:linux
```

Output: `release/1.0.0/LABOKit-Linux-1.0.0.deb`

## Troubleshooting

### Wine Error Messages

**Problem**: Seeing wine, windows, or .exe errors despite running on Linux.

**Solution**: Wine-related errors indicate the Windows version of Electron was installed. Fix it:

```bash
npm cache clean --force
rm -rf node_modules
npm_config_platform=linux npm_config_arch=x64 node node_modules/electron/install.js
npm install
```

### Python Module Not Found

**Problem**: `ModuleNotFoundError: No module named 'rembg'` or similar

**Solution**: Install Python dependencies:

```bash
pip3 install -r requirements.txt
```

Or install individual packages:

```bash
pip3 install rembg torch torchvision opencv-python
```

### Electron Won't Start

**Problem**: Application won't launch or crashes immediately.

**Solution**:

1. Clear cache and rebuild:
```bash
rm -rf dist-electron dist node_modules
npm install
npm run build:linux
```

2. Check logs:
```bash
npm run dev:linux 2>&1 | tee debug.log
```

3. Verify electron binary:
```bash
file node_modules/electron/dist/electron
# Should show: ELF 64-bit LSB pie executable
```

### AppImage Won't Run

**Problem**: `Permission denied` when running `.AppImage` file

**Solution**: Make it executable:

```bash
chmod +x LABOKit-Linux-1.0.0.AppImage
./LABOKit-Linux-1.0.0.AppImage
```

### Image Processing Fails

**Problem**: Python subprocess errors when processing images

**Solution**:

1. Verify Python installation:
```bash
python3 --version
python3 -c "import rembg; print('rembg OK')"
```

2. Check model files exist:
```bash
ls -lh utils/upscale/realesrgan-ncnn-vulkan
ls -lh utils/rembg/u2net.onnx
```

3. Run bridge.py directly to test:
```bash
python3 pyfile/bridge.py upscale --input test.png --output test_upscale.png --model realesrgan-x4plus
```

## Performance Notes

- **First Run**: May be slow (5-10 minutes) as models download and initialize
- **GPU Acceleration**: Not enabled by default; see below to enable
- **Large Images**: 4K+ images may impact performance
- **Memory Usage**: Plan for 2-4GB RAM during processing

### Enabling GPU Acceleration (Optional)

Requires NVIDIA GPU with CUDA support:

```bash
# Install CUDA-enabled PyTorch
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

## File Locations

- **Config**: `~/.config/LABOKit/` (if app creates local config)
- **Models**: `utils/upscale/` and `utils/rembg/` (bundled in AppImage)
- **Logs**: Check terminal output or `~/.local/share/LABOKit/logs/`

## Advanced: Building Portable AppImage with AppImageKit

For maximum portability:

```bash
npm run build:linux
# AppImage is automatically created in release/
```

## Cross-Platform Building

To build for Windows and macOS from Linux (requires wine, setup):

```bash
npm run build:all
```

## Contributing

For development contributions:

1. Use `npm run dev:linux` for development
2. Follow existing code style
3. Test on multiple distributions before submitting PR
4. Document any Linux-specific changes

## Support

- **Issue Tracker**: GitHub Issues
- **Documentation**: See README.md for general usage
- **Build Logs**: Check `npm run dev:linux` output for detailed errors
