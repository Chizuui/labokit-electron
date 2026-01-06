# LABOKit Linux Setup - Summary of Changes

## Overview

This document summarizes all changes made to enable native Linux builds of LABOKit without Wine errors.

## Files Modified

### 1. **package.json**
- Added `dev:linux` script: `vite --host`
- Added `build:linux` script: `tsc && vite build && electron-builder --linux AppImage`
- Added `build:all` script for multi-platform builds
- Enabled native Linux Electron installation

### 2. **vite.config.ts**
- Enhanced build configuration with:
  - `target: "esnext"` for modern syntax
  - `minify: "terser"` for production builds
  - Sourcemap enabled for debugging
  - Optimized library name

### 3. **electron-builder.json5**
- Configured Linux target with:
  - `AppImage` format (portable, self-contained)
  - `deb` format (for Debian/Ubuntu packages)
  - Icon path: `public/icon.png`
  - Desktop metadata (Name, Comment)
  - MIME type support (image/jpeg, image/png, image/webp)
  - Application category: Science;Utility

### 4. **README.md**
- Added comprehensive installation guides:
  - Linux AppImage installation
  - Windows EXE installation
  - Developer setup from source
- Added detailed usage guide:
  - Image upscaling instructions
  - Background removal instructions
  - Format conversion instructions
- Added platform-specific troubleshooting
- Enhanced system requirements section

## Files Created

### 1. **dev-linux.sh**
Automated helper script that:
- Detects Linux platform
- Forces Linux binary installation
- Verifies ELF binary type
- Launches development server with hot reload

### 2. **setup-linux.sh**
Distribution-aware setup script that:
- Auto-detects Ubuntu, Debian, Fedora, Arch Linux
- Installs system dependencies (Python, Node.js, build tools)
- Installs npm packages
- Installs Python requirements

### 3. **requirements.txt**
Python package dependencies:
- Pillow: Image processing
- numpy: Numerical computations
- opencv-python: Computer vision
- onnxruntime: Model inference
- rembg: Background removal
- torch & torchvision: AI models

### 4. **LINUX_BUILD.md**
Comprehensive Linux build guide covering:
- System requirements for various distributions
- Automated and manual setup procedures
- Development workflow
- Building AppImage and DEB packages
- Detailed troubleshooting section
- Performance optimization notes

### 5. **LINUX_QUICKSTART.md**
Quick reference guide with:
- 5-minute user setup
- 5-minute developer setup
- Common commands
- Quick troubleshooting

### 6. **LINUX_NATIVE_FIXED.md**
Technical deep-dive covering:
- Root cause analysis (Wine error investigation)
- Solution implementation steps
- Environment variables used
- Helper scripts created
- Key learnings
- Verification procedures

## Key Configuration Changes

### npm Platform Forcing
```bash
npm_config_platform=linux npm_config_arch=x64 node node_modules/electron/install.js
```

### Linux Build Output
- **AppImage**: Portable, single executable, ~339MB
- **DEB**: Debian package for Ubuntu/Debian systems
- Both include all assets, models, and dependencies

### Icon & Branding
- Icon path: `public/icon.png` (7173×7173 PNG)
- Embedded in build process
- Appears in file manager and application menus

## Testing & Verification

### Verify Linux Binary
```bash
file node_modules/electron/dist/electron
# Expected: ELF 64-bit LSB pie executable
```

### Test Development Build
```bash
npm run dev:linux
# Should start without Wine errors
```

### Test Distribution Build
```bash
npm run build:linux
# Creates LABOKit-Linux-1.0.0.AppImage
```

## Result

✅ **Native Linux Support**: Full Electron + Python integration  
✅ **No Wine**: Clean native binaries only  
✅ **Portable**: Single AppImage file, works across distributions  
✅ **Self-Contained**: All dependencies bundled  
✅ **Icon Support**: Application branding in system menus  
✅ **User-Friendly**: Clear documentation for all steps  
