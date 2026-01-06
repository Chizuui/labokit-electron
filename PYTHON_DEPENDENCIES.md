# Python Dependencies Architecture

## Overview

LABOKit uses a **hybrid bundled + system Python approach**:
- ✅ **Bundled**: Model files (RealESRGAN binaries, u2net.onnx) - included in AppImage/EXE
- ❌ **Not Bundled**: Python packages (rembg, torch, etc.) - must be installed by user

This design provides several benefits:

## Why Not Bundle Python Packages?

### 1. **AppImage/EXE Size**
- Bundling Python + all packages would create a **5-10GB** package
- Current approach: **339MB** for AppImage (2-3% of bundled package)
- torch alone: 2GB+
- torchvision: 1GB+

### 2. **Hardware Acceleration (GPU/CUDA)**
Different users have different GPUs (NVIDIA, AMD, Intel, or CPU-only). Users can install:
```bash
# NVIDIA GPU (CUDA)
pip install torch torchvision onnxruntime --index-url https://download.pytorch.org/whl/cu118

# AMD GPU (ROCm)
pip install torch torchvision --index-url https://download.pytorch.org/whl/rocm5.7

# CPU only (smaller download)
pip install torch torchvision -i https://download.pytorch.org/whl/cpu
```

### 3. **Flexibility**
Users can:
- Update packages independently of app updates
- Use different versions if needed
- Share environment with other ML applications

## What Gets Bundled

### Model Files (~229MB)
```
utils/
├── upscale/
│   ├── realesrgan-ncnn-vulkan       # 11MB (Linux)
│   ├── realesrgan-ncnn-vulkan.exe   # 6.2MB (Windows)
│   └── models/
│       ├── realesr-animevideov3-x2.param
│       ├── realesr-animevideov3-x3.param
│       ├── realesr-animevideov3-x4.param
│       ├── realesrgan-x4plus-anime.param
│       └── realesrgan-x4plus.param
└── rembg/
    └── u2net.onnx                   # 176MB
```

### Why Binaries Are Bundled
- **RealESRGAN**: Self-contained executable (no Python required)
- **u2net.onnx**: Pre-downloaded model file to avoid 176MB download on first run

## What Needs Installation

### Required Packages
```bash
pip install rembg torch torchvision onnxruntime
```

**Why each is needed:**
| Package | Purpose | Size | Used For |
|---------|---------|------|----------|
| **rembg** | Background removal AI library | 50MB | Remove BG feature |
| **torch** | PyTorch deep learning framework | 2GB+ | AI model execution |
| **torchvision** | PyTorch image utilities | 1GB+ | Image preprocessing |
| **onnxruntime** | ONNX model inference | 100MB | Fast neural network execution |

### Optional Packages
```bash
pip install pillow numpy opencv-python
```

These are already available in Python standard library or minimal, but rembg may use them.

## Feature Matrix

| Feature | Bundled | Python Deps | Status |
|---------|---------|-------------|--------|
| **Image Upscaling** | ✅ (binary) | ❌ | Works immediately |
| **Format Conversion** | ❌ | ✅ (PIL in stdlib) | Works immediately |
| **Remove Background** | ✅ (model) | ✅ (rembg+torch) | **Needs pip install** |

## Setup Instructions

### Linux (First Time)
```bash
# 1. Install system Python
sudo apt update && sudo apt install python3 python3-pip

# 2. Install image processing packages
pip install rembg torch torchvision onnxruntime

# 3. Run LABOKit
./LABOKit-Linux-1.0.0.AppImage
```

### Windows (First Time)
```bash
# 1. Install Python from python.org (3.10+)

# 2. Open Command Prompt and run:
pip install rembg torch torchvision onnxruntime

# 3. Run LABOKit installer
LABOKit-Setup-1.0.0.exe
```

### macOS (First Time)
```bash
# 1. Install Python (via Homebrew)
brew install python

# 2. Install image processing packages
pip install rembg torch torchvision onnxruntime

# 3. Build from source (no pre-built binary yet)
npm run build:mac
```

## Troubleshooting

### "ERROR: Missing Python packages"
**Solution**: Run the pip install command shown in README

```bash
pip install rembg torch torchvision onnxruntime
```

### Installation fails with "No matching distribution"
**Usually means**: Python version mismatch or pip is for wrong Python

```bash
# Check Python version
python --version  # Should be 3.8+

# Use python3 explicitly
python3 -m pip install rembg torch torchvision onnxruntime
```

### Very slow torch installation
**Solution**: torch is 2GB+ and compiles locally on some systems
- Use pre-built wheels: Run installation commands as-is
- Consider CPU-only if no GPU: `pip install torch -i https://download.pytorch.org/whl/cpu`
- Be patient: Takes 5-15 minutes depending on connection

### CUDA/GPU not working
**This is expected** - Install CUDA-enabled torch:

```bash
# NVIDIA CUDA 11.8
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# NVIDIA CUDA 12.1
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

### Permission denied on Linux
```bash
sudo chmod +x LABOKit-Linux-1.0.0.AppImage
./LABOKit-Linux-1.0.0.AppImage
```

## Development Notes

When developing, also install:
```bash
pip install -r requirements.txt
```

This includes:
- Pillow: Image processing
- OpenCV: Format conversion utilities
- numpy: Numerical operations
- All the above production packages

### Running Development Version
```bash
# Linux
./setup-linux.sh  # Auto-installs Python dependencies
npm run dev:linux

# Windows
npm install
npm run dev
```

## Future Improvements

Possible solutions to reduce Python dependency friction:

1. **Conda Packaging**: Include Python environment with packages
   - Pro: Fully self-contained
   - Con: AppImage would be 3GB+

2. **PyInstaller Bundle**: Freeze Python + packages into the app
   - Pro: One-click setup
   - Con: Very large binary, updates harder

3. **Server Mode**: Web-based version with backend server
   - Pro: Flexibility, easy updates
   - Con: Loss of offline capability

4. **Poetry/Pipenv Lock**: Pre-compile for all platforms
   - Pro: Faster installation
   - Con: Complex CI/CD setup

Currently, the **hybrid approach is optimal** for balance between size, flexibility, and user experience.

## References

- [PyTorch Installation](https://pytorch.org/get-started/locally/)
- [rembg Documentation](https://github.com/danielgatis/rembg)
- [ONNX Runtime](https://onnxruntime.ai/)
