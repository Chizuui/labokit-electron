import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'child_process'
import { readFileSync } from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    backgroundColor: '#050505',
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allow file protocol access for drag and drop
    },
  });

  // Set user data path to avoid cache permission issues
  app.setPath('userData', path.join(app.getPath('appData'), 'labokit-electron'));

  // Handle file drops
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Prevent navigation on file drops
    if (url.startsWith('file://')) {
      event.preventDefault();
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};

ipcMain.handle('dialog:openFile', async () => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'png', 'jpeg', 'webp'] }]
  });
  return filePaths[0];
});

ipcMain.handle('process-image', async (_event, { filePath, operation, model, format }) => {
  return new Promise((resolve, reject) => {
    const outputExt = operation === 'convert' && format ? format : 'png';
    // Build output filename based on operation
    const baseNoExt = filePath.replace(/\.[^/.]+$/, "");
    let suffix = '_processed';
    if (operation === 'upscale') {
      // include model name in filename, sanitize model string
      const modelSafe = (model || 'model').toString().replace(/[^a-zA-Z0-9-_]/g, '_');
      suffix = `_${modelSafe}_upscaled`;
    } else if (operation === 'rembg') {
      suffix = '_removed_bg';
    } else if (operation === 'convert') {
      suffix = '_converted';
    }
    const outputPath = `${baseNoExt}${suffix}.${outputExt}`;
    
    // Get the correct path for the Python script
    // If packaged, get from app.asar.unpacked (because we use asarUnpack)
    let pythonScript: string;
    if (app.isPackaged) {
      pythonScript = path.join(process.resourcesPath, 'app.asar.unpacked', 'pyfile', 'bridge.py');
    } else {
      pythonScript = path.join(__dirname, '../pyfile/bridge.py');
    }

    console.log(`Running Python: ${pythonScript}`);

    const args = [
      pythonScript,
      operation,
      '--input', filePath,
      '--output', outputPath
    ];

    if (operation === 'upscale' && model) {
      args.push('--model', model);
    }

    if (operation === 'convert' && format) {
      args.push('--format', format);
    }

    const pythonProcess = spawn('python', args);

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      const message = data.toString().trim();
      output += message + '\n';
      console.log(`Python: ${message}`);
      
      // Send progress updates to renderer
      if (message && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('process-progress', {
          stage: message,
          timestamp: Date.now()
        });
      }
    });
    
    pythonProcess.stderr.on('data', (data) => {
      const errorMsg = data.toString();
      console.error(`Error: ${errorMsg}`);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('process-progress', {
          stage: `ERROR: ${errorMsg}`,
          timestamp: Date.now()
        });
      }
    });

    pythonProcess.on('close', (code) => {
      if (code === 0 && output.includes('SUCCESS')) {
        resolve(outputPath);
      } else {
        reject(`Process failed with code ${code}. Output: ${output}`);
      }
    });

    // Timeout after 10 minutes (for model download on first run)
    setTimeout(() => {
      pythonProcess.kill();
      reject('Process timeout');
    }, 600000);
  });
});

ipcMain.handle('read-image-base64', async (_event, filePath: string) => {
  try {
    const imageBuffer = readFileSync(filePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    throw new Error(`Failed to read image: ${error}`);
  }
});

ipcMain.handle('get-image-dimensions', async (_event, filePath: string) => {
  try {
    const imageBuffer = readFileSync(filePath);
    
    // Detect image format and parse dimensions
    let width = 0;
    let height = 0;
    
    // Check PNG signature
    if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50 && imageBuffer[2] === 0x4E && imageBuffer[3] === 0x47) {
      // PNG format - dimensions are at bytes 16-24
      width = imageBuffer.readUInt32BE(16);
      height = imageBuffer.readUInt32BE(20);
    }
    // Check JPEG signature
    else if (imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8) {
      // JPEG - parse more complex, use imagemagick or just return 0
      // For now, we'll use a basic approach
      const sizeOf = (await import('image-size')).default;
      const dimensions = sizeOf(imageBuffer);
      width = dimensions.width || 0;
      height = dimensions.height || 0;
    }
    
    if (width === 0 || height === 0) {
      throw new Error('Could not determine image dimensions');
    }
    
    return { width, height };
  } catch (error) {
    throw new Error(`Failed to get image dimensions: ${error}`);
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Window control handlers
ipcMain.on('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window:close', () => {
  mainWindow?.close();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});