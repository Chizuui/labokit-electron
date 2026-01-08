// Lightweight adapter so the renderer can run in a browser without Electron.
// Exports `api` which mirrors the Electron `window.electronAPI` surface used in the app.
export const api: any = (window as any).electronAPI ?? {
  openFile: async () => {
    return new Promise<string | null>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return resolve(null);
        const dataUrl = await readFileAsDataURL(file);
        resolve(dataUrl);
      };
      input.click();
    });
  },
  readImageAsBase64: async (dataUrlOrPath: string) => {
    // If already a data URL, extract base64
    if (typeof dataUrlOrPath === 'string' && dataUrlOrPath.startsWith('data:')) {
      const parts = dataUrlOrPath.split(',');
      return parts[1] ?? '';
    }
    return '';
  },
  getImageDimensions: async (dataUrl: string) => {
    return new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = (e) => reject(e);
      img.src = dataUrl;
    });
  },
  getPathForFile: (file: File) => {
    // Return data URL synchronously is not possible; instead return a Promise-like string via FileReader handled by caller.
    // For compatibility, read file as data URL synchronously is impossible; we will instead return an empty string
    // and callers in this app will fall back to using drag File directly if needed.
    return null;
  },
  processImage: async () => {
    // Processing backend is not available in the browser in this repo.
    throw new Error('Processing is only available in the desktop Electron app.');
  },
  onProcessProgress: undefined,
  minimizeWindow: () => {},
  maximizeWindow: () => {},
  closeWindow: () => {},
};

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

export default api;
