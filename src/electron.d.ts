declare global {
  interface Window {
    electronAPI: {
      openFile: () => Promise<string>;
      processImage: (data: { filePath: string; operation: string; model?: string; format?: string }) => Promise<string>;
      readImageAsBase64: (filePath: string) => Promise<string>;
      getImageDimensions: (filePath: string) => Promise<{ width: number; height: number }>;
      getPathForFile: (file: File) => string | null;
      onProcessProgress: (callback: (data: any) => void) => () => void;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
    };
  }
}

export {};
