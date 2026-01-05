"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  openFile: () => electron.ipcRenderer.invoke("dialog:openFile"),
  processImage: (data) => electron.ipcRenderer.invoke("process-image", data),
  readImageAsBase64: (filePath) => electron.ipcRenderer.invoke("read-image-base64", filePath),
  getImageDimensions: (filePath) => electron.ipcRenderer.invoke("get-image-dimensions", filePath),
  onProcessProgress: (callback) => {
    electron.ipcRenderer.on("process-progress", (_event, data) => callback(data));
    return () => electron.ipcRenderer.removeListener("process-progress", callback);
  },
  minimizeWindow: () => electron.ipcRenderer.send("window:minimize"),
  maximizeWindow: () => electron.ipcRenderer.send("window:maximize"),
  closeWindow: () => electron.ipcRenderer.send("window:close")
});
