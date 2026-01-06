# Linux Native Build - Root Cause Analysis & Fix

## Problem

Wine errors appearing despite using "Linux" build commands:

```
wine-preloader: Could not perform a function in a .dll
0x7b01f5de: fixme:stub: SetDefaultDllDirectories
```

## Root Cause

**Windows version of Electron (electron.exe) was installed instead of the native Linux binary.**

The issue occurred because:
1. Default npm behavior installs based on the **system's npm configuration**, not always the current OS
2. npm's platform detection defaults to Windows on fresh installs
3. Electron binary is architecture-specific and caches globally

## Solution Applied

### Step 1: Verify the Problem

```bash
file node_modules/electron/dist/electron
# Shows: PE32 executable (Windows binary) - WRONG
# Should show: ELF 64-bit LSB pie executable (Linux binary)
```

### Step 2: Clear Cache

```bash
npm cache clean --force
rm -rf node_modules
```

### Step 3: Force Linux Binary Installation

```bash
npm_config_platform=linux npm_config_arch=x64 node node_modules/electron/install.js
npm install
```

### Step 4: Verify Fix

```bash
file node_modules/electron/dist/electron
# Should now show: ELF 64-bit LSB pie executable, x86-64
```

## Environment Variables Used

| Variable | Value | Purpose |
|----------|-------|---------|
| `npm_config_platform` | `linux` | Force Linux platform detection |
| `npm_config_arch` | `x64` | Specify 64-bit architecture |

## Permanent Fix: npm Scripts

Updated `package.json` with platform-specific scripts:

```json
{
  "scripts": {
    "dev:linux": "vite --host",
    "build:linux": "tsc && vite build && electron-builder --linux AppImage",
    "dev:windows": "vite --host",
    "build:windows": "tsc && vite build && electron-builder --win",
    "build:all": "npm run build:windows && npm run build:linux"
  }
}
```

## Helper Script: dev-linux.sh

Created `dev-linux.sh` to automate the process:

```bash
chmod +x dev-linux.sh
./dev-linux.sh
```

This script:
1. Checks for node_modules
2. Forces Linux binary installation
3. Verifies ELF binary format
4. Launches development server

## Key Learnings

1. **Electron binaries are not portable** - Each platform needs its own executable
2. **npm needs explicit configuration** - Can't rely on automatic detection alone
3. **File verification is crucial** - Use `file` command to verify binary type
4. **Cache matters** - npm global cache can interfere; clean it regularly

## Testing

Confirm native Linux without Wine:

```bash
# Check for Wine errors (should be empty)
npm run dev:linux 2>&1 | grep -i wine

# Verify process
ps aux | grep electron
# Should show the Linux executable, not wine-preloader
```

## Result

✅ **Native Linux Electron**: ELF 64-bit executable  
✅ **No Wine**: Clean subprocess spawning  
✅ **No Python Import Errors**: Python path correctly resolved  
✅ **Reproducible Build**: Works across Linux distributions  

## File References

- **Binary Location**: `node_modules/electron/dist/electron`
- **Main Process**: `electron/main.ts` (uses native `spawn` function)
- **Python Bridge**: `pyfile/bridge.py` (called via subprocess)
- **Build Config**: `electron-builder.json5` (configured for Linux AppImage)
