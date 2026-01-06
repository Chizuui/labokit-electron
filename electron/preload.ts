import { contextBridge, ipcRenderer, webUtils } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  processImage: (data: { filePath: string; operation: string; model?: string }) => 
    ipcRenderer.invoke('process-image', data),
  readImageAsBase64: (filePath: string) =>
    ipcRenderer.invoke('read-image-base64', filePath),
  getImageDimensions: (filePath: string) =>
    ipcRenderer.invoke('get-image-dimensions', filePath),
  getPathForFile: (file: File) => {
    // Use webUtils to get the real path from a File object
    try {
      return webUtils.getPathForFile(file);
    } catch (err) {
      console.error('Failed to get path for file:', err);
      return null;
    }
  },
  onProcessProgress: (callback: (data: any) => void) => {
    ipcRenderer.on('process-progress', (_event, data) => callback(data));
    return () => ipcRenderer.removeListener('process-progress', callback);
  },
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close')
});