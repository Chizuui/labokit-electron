# LABOKit - Image Processing Tool

A simple and powerful image processing application with a cool sci-fi theme. Upscale images, remove backgrounds, and convert formats - all in one place!

## What Can You Do?

### 1. **Upscale Images** 📈
Make small images bigger and clearer using AI technology.
- 2x, 3x, or 4x size increase
- Special support for anime images

### 2. **Remove Background** 🎨
Remove the background from any image automatically.
- One-click background removal
- Keep your subject, remove everything else

### 3. **Convert Image Formats** 🖼️
Change image type: JPG → PNG, PNG → WebP, etc.
- Supports: JPG, PNG, WebP, BMP, GIF, SVG
- Auto-adjusts colors and quality

### Screenshots??
- Check [Screenshots](#Screenshots)
---

## Installation

### Quick Start (30 seconds)

#### **Windows Users:**
1. Download from [Releases](https://github.com/Chizuui/labokit-electron/releases)
2. Run `LABOKit-Setup-1.0.0.exe`
3. Done! Open the app

#### **Linux Users:**
```bash
# Download the app
wget https://github.com/Chizuui/labokit-electron/releases/download/v1.1/LABOKit-Linux-1.1.AppImage

# Make it executable
chmod +x LABOKit-Linux-1.0.0.AppImage

# Run it
./LABOKit-Linux-1.0.0.AppImage
```

---

## First Time Setup

**Important:** To use all features (especially background removal), you need to install Python packages.

### Step 1: Install Python (if you don't have it)

**Windows:**
- Go to [python.org](https://www.python.org/downloads/)
- Download Python 3.10 or newer
- Run the installer
- ✅ Make sure to check "Add Python to PATH"

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3 python3-pip
```

**Linux (Fedora):**
```bash
sudo dnf install python3 python3-pip
```

**Linux (Arch):**
```bash
pacman -S python python-pip
```

### Step 2: Install Required Packages

Open Command Prompt (Windows) or Terminal (Linux/Mac) and run:

```bash
pip install rembg torch torchvision onnxruntime
```

⏳ **This takes 5-15 minutes** (torch is large)

### Step 3: Run LABOKit

Done! Now all features work perfectly.

---

## How to Use

### Basic Steps:
1. **Open LABOKit**
2. **Choose what you want to do:**
   - Click "Upscale" to make image bigger
   - Click "Remove BG" to remove background
   - Click "Convert" to change format
3. **Pick your image:**
   - Click the folder icon to select
   - Or drag and drop your image
4. **Pick settings:**
   - For upscale: Choose 2x, 3x, or 4x
   - For convert: Choose JPG, PNG, WebP, etc.
5. **Click "Execute"**
6. **Wait for processing** (takes 10 seconds to 2 minutes)
7. **View and save your result**

---

## Troubleshooting

### Problem: "Python packages required" error

**Solution:** Run this command:
```bash
pip install rembg torch torchvision onnxruntime
```

### Problem: AppImage won't open (Linux)

**Solution:**
```bash
chmod +x LABOKit-Linux-1.0.0.AppImage
./LABOKit-Linux-1.0.0.AppImage
```

### Problem: "FUSE2 not found" error (Linux)

**Solution:**
```bash
# Ubuntu/Debian
sudo apt install libfuse2

# Fedora
sudo dnf install fuse

# Arch
pacman -S fuse2
```

### Problem: Background removal doesn't work

**Check:**
1. Did you run `pip install rembg torch torchvision onnxruntime`?
2. Does the error message show? Read it carefully!
3. Try restarting the app

### Problem: App uses too much memory

**Solution:**
- Close other apps
- Process smaller images first
- The app needs 2-4 GB RAM

### Problem: Processing is very slow

**First run takes longer** (downloads and initializes AI models)
- First time: 1-2 minutes
- After that: Much faster (cached)

---

## For Developers

Want to modify the code? Here's how to set up development:

### Linux:
```bash
git clone https://github.com/Chizuui/labokit-electron.git
cd labokit-electron
git checkout linux
./setup-linux.sh
npm run dev:linux
```

### Windows:
```bash
git clone https://github.com/Chizuui/labokit-electron.git
cd labokit-electron
npm install
npm run dev
```

### Build for Distribution:

**Linux:**
```bash
npm run build:linux
# Creates: LABOKit-Linux-1.0.0.AppImage
```

**Windows:**
```bash
npm run build:win
# Creates: LABOKit-Setup-1.0.0.exe
```

---

## What's Inside?

### Technology
- **Frontend:** React + TypeScript (the visual interface you see)
- **Desktop:** Electron (makes it work on Windows/Linux)
- **Backend:** Python (does the image processing)
- **AI Models:** RealESRGAN (upscaling), rembg (background removal)

### File Structure
```
LABOKit/
├── src/              # User interface code
├── electron/         # Desktop app code
├── pyfile/           # Image processing code (Python)
├── utils/            # AI models and tools
└── public/           # Icons and images
```

---

## Features Explained

### Upscaling
- Uses RealESRGAN AI model
- Makes images bigger WITHOUT losing quality
- Works on photos and anime art
- 2x to 4x magnification

### Remove Background
- Uses rembg AI model
- Removes background, keeps subject
- Works best with clear subjects
- Perfect for product photos

### Image Conversion
- Convert between formats
- Supports modern formats (WebP for smaller file size)
- Auto-adjusts color space
- Optimizes quality

### Zoom & Pan
- Zoom in to see details (100%, 2x, 4x, 8x)
- Drag to move around when zoomed
- Compare before/after side by side

---

## Common Questions

**Q: Why do I need to install Python packages?**
A: They contain the AI technology for background removal and upscaling. Including them in the app would make it 5-10 GB (too big).

**Q: Do I need internet after setup?**
A: No! Once installed, everything works offline.

**Q: Can I use my GPU (graphics card)?**
A: Yes! If you have NVIDIA GPU, follow [PyTorch CUDA setup](https://pytorch.org/get-started/locally/).

**Q: How long does processing take?**
A: Depends on image size:
- Small (< 1 MP): 10-30 seconds
- Medium (1-5 MP): 30-60 seconds
- Large (> 5 MP): 1-2 minutes

**Q: What's the best image quality?**
A: PNG or WebP give best results. JPG is smaller but lower quality.

---

## Support & Links

- **Having issues?** Check [Troubleshooting](#troubleshooting) section above
- **Want to code?** See development section above
- **Report bug?** Open an issue on GitHub

---

## Credits

- **RealESRGAN**: https://github.com/xinntao/Real-ESRGAN
- **rembg**: https://github.com/danielgatis/rembg
- **Steins;Gate**: Original anime by White Fox
- **LABOKit (Original Source)**: https://github.com/wagakano/LABOKit

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This application uses third-party models and libraries. Please respect their respective licenses and usage terms.


## Screenshots

<img width="1501" height="781" alt="image" src="https://github.com/user-attachments/assets/a109d265-5039-44ec-9730-042a53ee95f5" />


<img width="1501" height="781" alt="image" src="https://github.com/user-attachments/assets/40ddaa25-1fda-4b94-81b0-c8356cce66c3" />


<img width="1501" height="781" alt="image" src="https://github.com/user-attachments/assets/c4f4a998-14b1-405d-82cc-b41915155fc1" />


<img width="1501" height="781" alt="image" src="https://github.com/user-attachments/assets/f265db64-1cd7-49d4-bc40-98d38b472d16" />

