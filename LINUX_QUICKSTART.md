# LABOKit Linux Quick Start

Get LABOKit running on Linux in 5 minutes.

## For Users (Pre-built Binary)

```bash
# 1. Download LABOKit-Linux-1.0.0.AppImage

# 2. Make executable
chmod +x LABOKit-Linux-1.0.0.AppImage

# 3. Run it
./LABOKit-Linux-1.0.0.AppImage
```

✅ Done! No installation, no dependencies needed.

## For Developers (From Source)

```bash
# 1. Clone
git clone https://github.com/Chizuui/labokit-electron.git
cd labokit-electron

# 2. Setup (auto-detects your Linux distro)
chmod +x setup-linux.sh
./setup-linux.sh

# 3. Develop
npm run dev:linux

# 4. Build distribution
npm run build:linux
```

## Common Commands

| Task | Command |
|------|---------|
| Start Dev | `npm run dev:linux` |
| Build AppImage | `npm run build:linux` |
| Build DEB | `npm run build:linux` (builds both) |
| Clean | `npm run clean` |

## Troubleshooting

### Wine Errors?
```bash
npm cache clean --force
rm -rf node_modules
npm_config_platform=linux npm_config_arch=x64 node node_modules/electron/install.js
npm install
```

### Python Error?
```bash
pip3 install -r requirements.txt
```

### AppImage won't run?
```bash
chmod +x LABOKit-Linux-1.0.0.AppImage
```

## Full Guide

See [LINUX_BUILD.md](LINUX_BUILD.md) for detailed documentation.
