# LABOKit But Electron Version

A sci-fi themed image processing application built with Electron, React, and TypeScript. Features real-time image upscaling and background removal with an immersive retro-futuristic UI inspired by *Steins;Gate*.

## Features

- **Image Upscaling**: Enhance image resolution using RealESRGAN models
  - Support for 2x, 3x, and 4x scaling
  - Anime-specific models available (RealESR Anime and RealESRGAN Anime)
  
- **Background Removal**: Remove image backgrounds using the rembg library with local u2net model

- **Image Format Conversion**: Convert images between multiple formats
  - Supported formats: JPG, PNG, WebP, BMP, GIF, and SVG
  - Smart color space conversion (RGBA to RGB for non-transparent formats)
  - Quality optimization for each format

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
└── vite.config.ts        # Vite configuration
```

## Stack Used

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Desktop Framework**: Electron
- **Build Tool**: Vite + esbuild
- **Python Backend**: RealESRGAN, rembg
- **Styling**: Tailwind CSS with custom animations

## Installation

### Prerequisites
- Node.js 18+
- Python 3.8+
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Chizuui/labokit-electron.git
cd labokit-electron
```

2. Install dependencies:
```bash
npm install
```

3. Install Python dependencies (if not bundled):
```bash
pip install rembg torch torchvision
```

## Development

Start the development server with hot reload:

```bash
npm run dev
```

This will start the Vite dev server and Electron app simultaneously.

## Building

Build the application for production:

```bash
npm run build
```

Build and package for distribution:

```bash
npm run build && npm run electron-builder
```

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
   - SVG and raster images both supported
   - Clear result button to reset for new processing

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

## IPC Communication

The application uses Electron IPC for communication between main and renderer processes:

- `process-image`: Spawn Python subprocess for image operations
- `read-image-base64`: Convert image files to base64 data
- `get-image-dimensions`: Extract image width/height
- `minimize-window`, `maximize-window`, `close-window`: Window controls

## Performance Notes

- First run processes may be slow due to Python model initialization
- Zoom operations are performed client-side in the browser
- Large images (>4K) may impact performance during real-time operations

## Troubleshooting

### Python not found
Ensure Python is in your system PATH and rembg is properly installed.

### Image processing fails
Check that model files exist in `utils/upscale/` and `utils/rembg/`

### App won't start
Try clearing the dist folder and rebuilding:
```bash
rm -rf dist-electron dist
npm run build
```

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

## Disclaimer

This application uses third-party models and libraries. Please respect their respective licenses and usage terms.
