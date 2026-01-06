# Development Guide

This document covers development setup, workflow, and contribution guidelines.

## Quick Setup

### Linux
```bash
git clone https://github.com/Chizuui/labokit-electron.git
cd labokit-electron
git checkout linux
./setup-linux.sh
npm run dev:linux
```

### Windows
```bash
git clone https://github.com/Chizuui/labokit-electron.git
cd labokit-electron
npm install
npm run dev
```

## Development Commands

```bash
# Start dev server
npm run dev          # Current platform
npm run dev:linux    # Linux specific

# Build for distribution
npm run build        # Current platform
npm run build:linux  # Linux AppImage
npm run build:win    # Windows installer
npm run build:all    # All platforms

# Check for issues
npm run lint         # Run linter
npm run type-check   # TypeScript check
```

## Project Structure

```
labokit-electron/
├── electron/
│   ├── main.ts              # Electron main process
│   ├── preload.ts           # IPC context bridge
│   └── electron-env.d.ts    # Type definitions
├── src/
│   ├── App.tsx              # Main React component
│   ├── index.css            # Global styles
│   ├── main.tsx             # React entry point
│   └── components/
│       └── DivergenceMeter.jsx
├── pyfile/
│   ├── bridge.py            # Python image processing
│   └── requirements.txt      # Python dependencies
├── utils/
│   ├── upscale/             # RealESRGAN models
│   └── rembg/               # Background removal models
├── public/
│   └── icon.png             # App icon
├── vite.config.ts           # Vite configuration
├── electron-builder.json5   # Build configuration
└── package.json             # npm scripts and dependencies
```

## Tech Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Desktop:** Electron 39.2.7
- **Build Tool:** Vite 7.3.0
- **Python Backend:** bridge.py for image processing
- **Packaging:** electron-builder

## Key Files to Know

### `electron/main.ts`
- Electron main process initialization
- Window creation and management
- IPC message handling
- File dialog and window controls

### `src/App.tsx`
- Main React component
- UI logic and state management
- Image processing workflow
- File handling and drag-drop

### `pyfile/bridge.py`
- Python subprocess for image operations
- RealESRGAN upscaling integration
- rembg background removal
- Image format conversion

### `vite.config.ts`
- Build configuration
- Entry point definitions
- Development server setup

### `electron-builder.json5`
- Linux: AppImage configuration with icon and metadata
- Windows: NSIS installer configuration
- File bundling and resources

## Development Workflow

### 1. Making Changes

**React/TypeScript Changes:**
- Edit files in `src/`
- Hot reload works automatically with Vite
- Check browser console for errors

**Python Changes:**
- Edit files in `pyfile/`
- Restart dev server to pick up changes
- Check terminal output for errors

**Electron Changes:**
- Edit files in `electron/`
- Requires restart of dev server
- May need full rebuild

### 2. Testing

**Manual Testing:**
```bash
# Start dev server
npm run dev:linux  # or npm run dev

# In another terminal, test specific features:
# - Drag and drop images
# - Try each operation (upscale, remove-bg, convert)
# - Test zoom and pan
# - Check error handling
```

**Building:**
```bash
npm run build:linux
# Test the generated AppImage
./release/1.0.0/LABOKit-Linux-1.0.0.AppImage
```

### 3. Code Style

- TypeScript for all frontend code
- ESLint configuration provided
- Tailwind CSS for styling
- Comments for complex logic

### 4. Git Workflow

**Branches:**
- `main` - Stable releases
- `linux` - Linux development

**Commit Messages:**
```
feat: Add new feature description
fix: Fix bug description
docs: Update documentation
refactor: Reorganize code
perf: Performance improvement
test: Add or update tests
```

## Common Tasks

### Add New Image Processing Feature

1. **Add Python code** in `pyfile/bridge.py`
   - Create new function
   - Add command-line argument handling
   - Test with: `python pyfile/bridge.py --operation your_op --input test.jpg --output out.jpg`

2. **Add Electron handler** in `electron/main.ts`
   - Listen for IPC message
   - Spawn Python subprocess
   - Send result back to renderer

3. **Add UI component** in `src/App.tsx`
   - Add operation option
   - Add parameter selection
   - Handle result display

4. **Test end-to-end**
   ```bash
   npm run dev:linux
   # Test new feature in dev server
   npm run build:linux
   # Test in built AppImage
   ```

### Modify UI Theme

Edit `src/index.css`:
```css
:root {
  --color-primary: #ff5a00;   /* Orange neon */
  --color-accent: #00ffff;    /* Cyan accent */
  /* ... other variables ... */
}
```

### Update Python Dependencies

1. Edit `pyfile/requirements.txt`
2. Run: `pip install -r pyfile/requirements.txt`
3. Test all features
4. Rebuild: `npm run build:linux`

### Build for Release

```bash
# Linux
npm run build:linux
# Output: release/1.0.0/LABOKit-Linux-1.0.0.AppImage

# Windows
npm run build:win
# Output: release/1.0.0/LABOKit-Setup-1.0.0.exe

# Both
npm run build:all
```

## Troubleshooting Development

### Dev server won't start

```bash
# Clear cache and rebuild
rm -rf node_modules dist dist-electron
npm install
npm run dev:linux
```

### Python subprocess errors

```bash
# Check Python path
python --version
pip list  # Verify packages installed

# Test bridge.py directly
python pyfile/bridge.py --operation upscale --input test.jpg --output out.jpg
```

### Build failures

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Clear electron cache
rm -rf dist-electron release
npm run build:linux
```

### IPC Communication Issues

- Check `electron/preload.ts` for exposed APIs
- Verify IPC message names match in both places
- Check browser DevTools Console for errors
- Check terminal for main process errors

## Performance Optimization

- **Vite:** Already handles tree-shaking and code splitting
- **Tailwind:** Configured for CSS minification
- **Terser:** Minifies JavaScript output
- **Images:** Use WebP for smaller bundle size
- **Python:** Uses compiled binaries for speed

## Git LFS (Large File Storage)

Large model files are tracked with Git LFS:
```bash
# These files are stored with LFS:
# - utils/upscale/realesrgan-ncnn-vulkan
# - utils/upscale/realesrgan-ncnn-vulkan.exe
# - utils/rembg/u2net.onnx

# Pull actual files (not pointers)
git lfs pull origin

# Check status
git lfs status
```

## Release Checklist

- [ ] Update version in `package.json`
- [ ] Update version in `electron-builder.json5`
- [ ] Test all features on Linux
- [ ] Test all features on Windows
- [ ] Run `npm run build:all`
- [ ] Verify AppImage and EXE work
- [ ] Create GitHub release
- [ ] Upload AppImage and EXE
- [ ] Update README if needed
- [ ] Tag release in git

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [electron-builder Docs](https://www.electron.build/)

## Support

- Check existing GitHub issues
- Review error messages carefully
- Test in isolation before combining changes
- Document what you've tried in PRs
