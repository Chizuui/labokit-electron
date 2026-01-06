# LABOKit Electron Version

A sci-fi themed image processing application built with Electron, React, and TypeScript. Features real-time image upscaling and background removal with an immersive retro-futuristic UI inspired by *Steins;Gate*.

<img width="1501" height="781" alt="image" src="https://github.com/user-attachments/assets/a109d265-5039-44ec-9730-042a53ee95f5" />

## Quick Start

### For End Users (Recommended)
**Download pre-built applications** - No setup required!

#### Linux
```bash
# Install Python image processing dependencies (required for all features)
pip install rembg torch torchvision onnxruntime

# Download and run
wget https://github.com/Chizuui/labokit-electron/releases/download/v1.0.0/LABOKit-Linux-1.0.0.AppImage
chmod +x LABOKit-Linux-1.0.0.AppImage
./LABOKit-Linux-1.0.0.AppImage
```

> **Note**: The AppImage bundles model files but requires Python packages to be installed on your system. This allows flexibility in package versions and CUDA support.

#### Windows
```bash
# Install Python image processing dependencies (required for all features)
pip install rembg torch torchvision onnxruntime

# Download and run the installer
# LABOKit-Setup-1.0.0.exe from https://github.com/Chizuui/labokit-electron/releases
```
Download from [Releases](https://github.com/Chizuui/labokit-electron/releases) and run the installer.

### For Developers (Build from Source)

#### Linux
```bash
git clone https://github.com/Chizuui/labokit-electron.git
cd labokit-electron
git checkout linux  # Switch to Linux branch with setup scripts
./setup-linux.sh    # Install dependencies
npm run dev:linux   # Start development
```

#### Windows
```bash
git clone https://github.com/Chizuui/labokit-electron.git
cd labokit-electron
npm install
npm run dev         # Start development
```

---

## Features

- **Image Upscaling**: Enhance image resolution using RealESRGAN models
  - Support for 2x, 3x, and 4x scaling
  - Anime-specific models available (RealESR Anime and RealESRGAN Anime)

<img width="1501" height="781" alt="image" src="https://github.com/user-attachments/assets/40ddaa25-1fda-4b94-81b0-c8356cce66c3" />


- **Background Removal**: Remove image backgrounds using the rembg library with local u2net model (WIP)

<img width="1501" height="781" alt="image" src="https://github.com/user-attachments/assets/c4f4a998-14b1-405d-82cc-b41915155fc1" />


- **Image Format Conversion**: Convert images between multiple formats
  - Supported formats: JPG, PNG, WebP, BMP, GIF, and SVG
  - Smart color space conversion (RGBA to RGB for non-transparent formats)
  - Quality optimization for each format

<img width="1501" height="781" alt="image" src="https://github.com/user-attachments/assets/f265db64-1cd7-49d4-bc40-98d38b472d16" />


- **Advanced Zoom & Pan**: 
  - Multiple zoom levels (100%, 2x, 4x, 8x)
  - Drag-pan functionality for zoomed images
  - Smooth scrolling without visible scrollbars
  - Support for both raster and SVG image viewing

- **Real-time Resolution Tracking**: 
  - Display before/after resolution comparison
  - Calculate upscaling multiplier

- **Sci-Fi UI Theme**:
  - Retro-futuristic orange neon glow effects
  - Scanline overlay animation
  - DSEG14 digital font display
  - Divergence meter inspired by Steins;Gate

---

## Project Structure

```
labokit-electron/
├── electron/
│   ├── main.ts           # Electron main process
│   ├── preload.ts        # IPC context bridge
│   └── electron-env.d.ts # Type definitions
├── src/
│   ├── App.tsx           # Main React component
│   ├── index.css         # Global styles
│   ├── main.tsx          # React entry point
│   └── components/
│       └── DivergenceMeter.jsx # Status display
├── pyfile/
│   └── bridge.py         # Python image processing backend
├── utils/
│   ├── upscale/          # RealESRGAN models and executable
│   └── rembg/            # rembg u2net model
├── public/
│   └── icon.png          # Application icon
└── vite.config.ts        # Vite configuration
```

## Stack Used

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Desktop Framework**: Electron
- **Build Tool**: Vite + esbuild
- **Python Backend**: RealESRGAN, rembg
- **Styling**: Tailwind CSS with custom animations
- **Packaging**: electron-builder (AppImage for Linux, NSIS for Windows)

---

## Installation & Setup

### Prerequisites
- **Node.js 18+**
- **npm or yarn**
- **Python 3.8+** (development only, bundled in releases)

### Option 1: Clone and Develop (Linux)

```bash
git clone https://github.com/Chizuui/labokit-electron.git
cd labokit-electron
git checkout linux
./setup-linux.sh  # One-time setup - installs all dependencies
```

### Option 2: Clone and Develop (Windows)

```bash
git clone https://github.com/Chizuui/labokit-electron.git
cd labokit-electron
npm install
```

---

## Development

### Linux
```bash
npm run dev:linux    # Start Vite dev server with native Electron
```

### Windows
```bash
npm run dev          # Start Vite dev server with Electron
```

### Available Commands
```bash
npm run dev           # Dev mode (current platform)
npm run dev:linux     # Dev mode with native Linux Electron
npm run build         # Build for current platform
npm run build:linux   # Build AppImage for Linux distribution
npm run build:win     # Build installer for Windows distribution
npm run build:all     # Build for all platforms
```

---

## Building for Distribution

### Build Linux AppImage
```bash
git checkout linux
./setup-linux.sh
npm run build:linux
# Output: release/1.0.0/LABOKit-Linux-1.0.0.AppImage
```

### Build Windows Installer
```bash
npm install
npm run build:win
# Output: release/1.0.0/LABOKit-Setup-1.0.0.exe
```

---

## Usage

1. **Select Operation Mode**: Choose between:
   - **Upscale**: Enhance image resolution with AI upscaling
   - **Remove BG**: Remove image background automatically
   - **Convert**: Convert image to different formats

2. **Select Model or Format**:
   - For Upscaling: Choose from RealESRGAN x4 Plus, RealESRGAN x4 Plus Anime, or RealESR Anime x2/x3/x4
   - For Converting: Select output format (JPG, PNG, WebP, BMP, GIF, or SVG)

3. **Load Image**: Click on the image selector or drag-and-drop an image file

4. **Execute**: Click "Execute Operation" to process the image

5. **View Results**: 
   - Use zoom buttons (100%, 2x, 4x, 8x) to inspect details
   - Drag to pan when zoomed in
   - Clear result button to reset for new processing

---

## Configuration

### Image Models
- **Upscaling Models**: Located in `utils/upscale/`
  - RealESRGAN executable with multiple .param files
  
- **Background Removal**: Located in `utils/rembg/`
  - Local u2net.onnx model file for offline processing

### UI Customization
Edit `src/index.css` for theme colors and effects:
- Orange neon glow: `#ff5a00`
- Scanline effects opacity
- Font definitions

## Python Dependencies

The application requires specific Python packages for image processing features. These are **NOT** bundled in the AppImage/EXE to allow flexibility in package versions and hardware acceleration (GPU/CUDA support).

### Required Packages
```bash
pip install rembg torch torchvision onnxruntime
```

### What Each Package Does
- **rembg**: Background removal using AI (remove-background feature)
- **torch + torchvision**: Deep learning framework for ML models
- **onnxruntime**: Efficient neural network inference engine

### Alternative: Install All Optional Dependencies
```bash
pip install -r requirements.txt
```

This installs all development dependencies including PIL and OpenCV for format conversion.

### If You Don't Install Dependencies

If you run the app without Python packages installed:
- **Upscaling** still works (RealESRGAN binary is bundled)
- **Format Conversion** still works (basic PIL included with Python)
- **Background Removal** will fail with an error asking you to run the pip install command

### FAQ: Why Aren't These Packages Bundled?

**For a detailed explanation**, see [PYTHON_PACKAGES_EXPLAINED.md](PYTHON_PACKAGES_EXPLAINED.md).

**Short answer**: 
- PyTorch alone is 2-3GB; bundling all packages would make the AppImage 5-10GB
- Users need different versions for different GPUs (NVIDIA, AMD, CPU-only)
- Users can update packages independently of app updates

For a comprehensive breakdown of the architecture, see:
- [PYTHON_DEPENDENCIES.md](PYTHON_DEPENDENCIES.md) - Technical details and setup instructions
- [PYTHON_PACKAGES_EXPLAINED.md](PYTHON_PACKAGES_EXPLAINED.md) - Why this design was chosen

### First-Time Setup

**Linux:**
```bash
# 1. Install system dependencies
sudo apt update && sudo apt install python3 python3-pip  # Ubuntu/Debian
# OR
sudo dnf install python3 python3-pip  # Fedora
# OR
pacman -S python python-pip  # Arch

# 2. Install Python packages
pip install rembg torch torchvision onnxruntime

# 3. Download and run AppImage
./LABOKit-Linux-1.0.0.AppImage
```

**Windows:**
```bash
# 1. Download and install Python from python.org (3.10+)
# 2. Install Python packages
pip install rembg torch torchvision onnxruntime

# 3. Run the installer
LABOKit-Setup-1.0.0.exe
```

---

## IPC Communication

The application uses Electron IPC for communication between main and renderer processes:

- `process-image`: Spawn Python subprocess for image operations
- `read-image-base64`: Convert image files to base64 data
- `get-image-dimensions`: Extract image width/height
- `minimize-window`, `maximize-window`, `close-window`: Window controls

---

## Troubleshooting

### Linux Issues
| Problem | Solution |
|---------|----------|
| "Permission denied" on AppImage | Run `chmod +x LABOKit-Linux-1.0.0.AppImage` |
| AppImage won't launch | Install FUSE2: `sudo apt install libfuse2` |
| `npm run dev:linux` not found | Make sure you're on `linux` branch: `git checkout linux` |
| Python errors in dev | Run `./setup-linux.sh` to install dependencies |

### Windows Issues
| Problem | Solution |
|---------|----------|
| Installer won't run | Try running as Administrator |
| App crashes on startup | Uninstall completely and reinstall |
| Image processing fails | Ensure `utils/` folder has all model files |

### General Issues
| Problem | Solution |
|---------|----------|
| "Missing Python packages" error | Run `pip install rembg torch torchvision onnxruntime` |
| Background removal not working | Ensure Python packages are installed (see Python Dependencies section) |
| Models downloading slowly | First run downloads ~500MB, be patient |
| High memory usage | Close other apps, LABOKit uses 2-4GB during processing |
| File not found errors | Use absolute paths or drag-and-drop images |
| App won't start | Try: `rm -rf dist-electron dist && npm run build` |

---

## Performance Notes

- **First run**: Models download (~500MB) and initialize (~1-2 minutes)
- **Subsequent runs**: Faster as models are cached
- **Zoom operations**: Client-side, very responsive
- **Large images**: 4K+ images may impact performance
- **Memory**: Allocate 2-4GB RAM for processing

---

## Branch Information

- **`main`** - Stable release version (Windows/Linux binaries included)
- **`linux`** - Linux development branch with setup scripts and build tools

To switch branches:
```bash
git checkout linux
git checkout main
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Inspiration

UI design inspired by the sci-fi anime *Steins;Gate*, featuring:
- Divergence meter concept
- Time travel theme elements
- Retro-futuristic aesthetic

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

- **RealESRGAN**: https://github.com/xinntao/Real-ESRGAN
- **rembg**: https://github.com/danielgatis/rembg
- **Steins;Gate**: Original anime by White Fox
- **LABOKit (Original Source)**: https://github.com/wagakano/LABOKit

## Disclaimer

This application uses third-party models and libraries. Please respect their respective licenses and usage terms.
