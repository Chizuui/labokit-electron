import { app, ipcMain, dialog, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "child_process";
import { readFileSync } from "node:fs";
let started = false;
try {
  const squirrel = await import("electron-squirrel-startup");
  started = squirrel.default;
} catch {
  started = false;
}
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
if (started) {
  app.quit();
}
let mainWindow = null;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1e3,
    height: 700,
    backgroundColor: "#050505",
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  app.setPath("userData", path.join(app.getPath("appData"), "labokit-electron"));
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname$1, "../dist/index.html"));
  }
};
ipcMain.handle("dialog:openFile", async () => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Images", extensions: ["jpg", "png", "jpeg", "webp"] }]
  });
  return filePaths[0];
});
ipcMain.handle("process-image", async (_event, { filePath, operation, model }) => {
  return new Promise((resolve, reject) => {
    const outputPath = filePath.replace(/\.[^/.]+$/, "") + "_processed.png";
    const pythonScript = path.join(__dirname$1, "../pyfile/bridge.py");
    console.log(`Running Python: ${pythonScript}`);
    const args = [
      pythonScript,
      operation,
      "--input",
      filePath,
      "--output",
      outputPath
    ];
    if (operation === "upscale" && model) {
      args.push("--model", model);
    }
    const pythonProcess = spawn("python", args);
    let output = "";
    pythonProcess.stdout.on("data", (data) => {
      const message = data.toString().trim();
      output += message + "\n";
      console.log(`Python: ${message}`);
      if (message && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("process-progress", {
          stage: message,
          timestamp: Date.now()
        });
      }
    });
    pythonProcess.stderr.on("data", (data) => {
      const errorMsg = data.toString();
      console.error(`Error: ${errorMsg}`);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("process-progress", {
          stage: `ERROR: ${errorMsg}`,
          timestamp: Date.now()
        });
      }
    });
    pythonProcess.on("close", (code) => {
      if (code === 0 && output.includes("SUCCESS")) {
        resolve(outputPath);
      } else {
        reject(`Process failed with code ${code}. Output: ${output}`);
      }
    });
    setTimeout(() => {
      pythonProcess.kill();
      reject("Process timeout");
    }, 6e5);
  });
});
ipcMain.handle("read-image-base64", async (_event, filePath) => {
  try {
    const imageBuffer = readFileSync(filePath);
    return imageBuffer.toString("base64");
  } catch (error) {
    throw new Error(`Failed to read image: ${error}`);
  }
});
ipcMain.handle("get-image-dimensions", async (_event, filePath) => {
  try {
    const imageBuffer = readFileSync(filePath);
    let width = 0;
    let height = 0;
    if (imageBuffer[0] === 137 && imageBuffer[1] === 80 && imageBuffer[2] === 78 && imageBuffer[3] === 71) {
      width = imageBuffer.readUInt32BE(16);
      height = imageBuffer.readUInt32BE(20);
    } else if (imageBuffer[0] === 255 && imageBuffer[1] === 216) {
      const sizeOf = (await import("./index-CMA3ZsdK.js")).default;
      const dimensions = sizeOf(imageBuffer);
      width = dimensions.width || 0;
      height = dimensions.height || 0;
    }
    if (width === 0 || height === 0) {
      throw new Error("Could not determine image dimensions");
    }
    return { width, height };
  } catch (error) {
    throw new Error(`Failed to get image dimensions: ${error}`);
  }
});
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
ipcMain.on("window:minimize", () => {
  mainWindow?.minimize();
});
ipcMain.on("window:maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on("window:close", () => {
  mainWindow?.close();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
