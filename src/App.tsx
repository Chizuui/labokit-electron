import { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [divergence, setDivergence] = useState("1.048596");
  const [status, setStatus] = useState("READY");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [operation, setOperation] = useState<'upscale' | 'rembg' | 'convert'>('upscale');
  const [model, setModel] = useState("realesrgan-x4plus");
  const [convertFormat, setConvertFormat] = useState("png");
  const [progress, setProgress] = useState<string>("");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedDimensions, setSelectedDimensions] = useState<{ width: number; height: number } | null>(null);
  const [resultDimensions, setResultDimensions] = useState<{ width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const models = [
    { name: "RealESRGAN x4 Plus", value: "realesrgan-x4plus" },
    { name: "RealESRGAN x4 Plus Anime", value: "realesrgan-x4plus-anime" },
    { name: "RealESR Anime x2", value: "realesr-animevideov3-x2" },
    { name: "RealESR Anime x3", value: "realesr-animevideov3-x3" },
    { name: "RealESR Anime x4", value: "realesr-animevideov3-x4" }
  ];

  useEffect(() => {
    // Listen for progress updates from Electron
    const unsubscribe = window.electronAPI?.onProcessProgress?.((data: any) => {
      setProgress(data.stage);
      console.log('Progress:', data.stage);
    });

    return () => unsubscribe?.();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectFile = async () => {
    const filePath = await window.electronAPI.openFile();
    if (filePath) {
      setSelectedFile(filePath);
      setStatus("FILE LOADED");
      setResultImage(null);
      setResultDimensions(null);
      
      // Get selected image dimensions
      try {
        const dims = await window.electronAPI.getImageDimensions(filePath);
        setSelectedDimensions(dims);
        
        // Load preview image as base64
        const base64 = await window.electronAPI.readImageAsBase64(filePath);
        let mimeType = 'image/jpeg';
        
        if (filePath.toLowerCase().endsWith('.png')) {
          mimeType = 'image/png';
        } else if (filePath.toLowerCase().endsWith('.webp')) {
          mimeType = 'image/webp';
        } else if (filePath.toLowerCase().endsWith('.gif')) {
          mimeType = 'image/gif';
        } else if (filePath.toLowerCase().endsWith('.bmp')) {
          mimeType = 'image/bmp';
        } else if (filePath.toLowerCase().endsWith('.svg')) {
          mimeType = 'image/svg+xml';
        }
        
        setSelectedImagePreview(`data:${mimeType};base64,${base64}`);
      } catch (error) {
        console.error('Failed to get image dimensions:', error);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    
    if (files.length > 0) {
      const file = files[0];
      console.log('File dropped:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Use Electron's webUtils to get the real file path
      const filePath = window.electronAPI.getPathForFile(file);
      console.log('File path from webUtils:', filePath);
      
      if (filePath) {
        setSelectedFile(filePath);
        setStatus("FILE LOADED");
        setResultImage(null);
        setResultDimensions(null);
        
        try {
          const dims = await window.electronAPI.getImageDimensions(filePath);
          setSelectedDimensions(dims);
          
          // Load preview image as base64
          const base64 = await window.electronAPI.readImageAsBase64(filePath);
          let mimeType = 'image/jpeg';
          
          if (filePath.toLowerCase().endsWith('.png')) {
            mimeType = 'image/png';
          } else if (filePath.toLowerCase().endsWith('.webp')) {
            mimeType = 'image/webp';
          } else if (filePath.toLowerCase().endsWith('.gif')) {
            mimeType = 'image/gif';
          } else if (filePath.toLowerCase().endsWith('.bmp')) {
            mimeType = 'image/bmp';
          } else if (filePath.toLowerCase().endsWith('.svg')) {
            mimeType = 'image/svg+xml';
          }
          
          setSelectedImagePreview(`data:${mimeType};base64,${base64}`);
          console.log('Image dimensions:', dims);
        } catch (error) {
          console.error('Failed to get dimensions:', error);
          setStatus("ERROR: Could not load image dimensions");
        }
      } else {
        console.error('Could not get file path from dropped file');
        setStatus("ERROR: Could not access file path");
      }
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setStatus("PROCESSING...");
    setProgress("");
    setProgressPercent(0);
    setIsProcessing(true);
    
    // Glitch animation start
    const interval = setInterval(() => {
      setDivergence((Math.random() * 2).toFixed(6));
    }, 100);

    try {
      // Simulate progress increments
      const progressInterval = setInterval(() => {
        setProgressPercent(prev => {
          if (prev < 95) return prev + Math.random() * 20;
          return prev;
        });
      }, 500);

      // Call Python Backend
      const result = await window.electronAPI.processImage({
        filePath: selectedFile,
        operation: operation,
        model: operation === 'upscale' ? model : undefined,
        format: operation === 'convert' ? convertFormat : undefined
      });
      
      clearInterval(progressInterval);
      setProgressPercent(100);
      
      console.log("Processed:", result);
      setStatus("COMPLETE");
      setDivergence("0.571024"); // Steins;Gate Success Number
      
      // Load result image as base64
      try {
        const base64 = await window.electronAPI.readImageAsBase64(result);
        let mimeType = 'image/jpeg';
        
        if (result.toLowerCase().endsWith('.png')) {
          mimeType = 'image/png';
        } else if (result.toLowerCase().endsWith('.webp')) {
          mimeType = 'image/webp';
        } else if (result.toLowerCase().endsWith('.gif')) {
          mimeType = 'image/gif';
        } else if (result.toLowerCase().endsWith('.bmp')) {
          mimeType = 'image/bmp';
        } else if (result.toLowerCase().endsWith('.svg')) {
          mimeType = 'image/svg+xml';
        }
        
        setResultImage(`data:${mimeType};base64,${base64}`);
        
        // Get result dimensions (skip for SVG)
        if (!result.toLowerCase().endsWith('.svg')) {
          const dims = await window.electronAPI.getImageDimensions(result);
          setResultDimensions(dims);
        }
      } catch (error) {
        console.error('Failed to load result image:', error);
      }
    } catch (error) {
      console.error(error);
      setStatus("ERROR");
      setDivergence("0.000000");
      setResultImage(null);
      setResultDimensions(null);
    } finally {
      clearInterval(interval);
      setIsProcessing(false);
      setTimeout(() => setProgressPercent(0), 1000);
    }
  };

  const getProgressDisplay = () => {
    if (!progress) return "";
    
    const progressMap: { [key: string]: string } = {
      'PROCESSING': '⏳ Loading...',
      'UPSCALING_STARTED': '⬆️ Starting Upscale...',
      'MODEL_SELECTED': '🤖 Model Loaded',
      'EXECUTING_UPSCALE': '⚙️ Upscaling...',
      'UPSCALE_COMPLETE': '✓ Upscale Done',
      'LOADING_MODEL': '📥 Loading Model...',
      'REMOVING_BACKGROUND': '✂️ Removing Background...',
      'SAVING': '💾 Saving...',
      'SUCCESS': '✓ Success!'
    };
    
    return progressMap[progress] || progress;
  };

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow?.();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow?.();
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow?.();
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <div className="min-h-screen w-full flex flex-col relative bg-gray-900">
      {/* Custom Titlebar - Matches UI Style */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <div 
        className="h-8 bg-gray-900/90 border-b border-orange-600/20 flex items-center justify-between px-4 text-orange-600 text-xs font-bold tracking-widest uppercase select-none"
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        <div>LABOKit</div>
        
        {/* Window Control Buttons */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <div className="flex gap-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <button
            onClick={handleMinimize}
            className="w-6 h-6 flex items-center justify-center text-orange-600 hover:bg-orange-600/20 rounded transition-colors"
            title="Minimize"
          >
            −
          </button>
          <button
            onClick={handleMaximize}
            className="w-6 h-6 flex items-center justify-center text-orange-600 hover:bg-orange-600/20 rounded transition-colors"
            title="Maximize"
          >
            ▢
          </button>
          <button
            onClick={handleClose}
            className="w-6 h-6 flex items-center justify-center text-orange-600 hover:bg-red-600/30 rounded transition-colors"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 relative overflow-hidden bg-gray-900 scanlines flex-col">
        <div className="flex flex-1 overflow-hidden gap-3 p-4">
          {/* Left Sidebar - Controls */}
          <div className="w-80 flex-shrink-0 border border-gray-700 bg-gray-900/80 p-6 overflow-y-auto flex flex-col rounded">
            <h1 className="text-gray-500 tracking-[0.5em] text-xs mb-8 uppercase">
              LABOKit <span className="text-orange-600">Electron Ver</span>
            </h1>

            {/* Operation Toolbar */}
            <div className="mb-6 border border-gray-600 bg-gray-900/50 p-4 rounded">
              <div className="text-xs text-gray-500 mb-3 uppercase tracking-widest">[ Operation Mode ]</div>
              <div className="flex flex-col gap-2 mb-4 w-full">
                <button
                  onClick={() => setOperation('upscale')}
                  className={`py-2 px-3 border text-xs font-bold uppercase tracking-wider transition-all rounded
                    ${operation === 'upscale'
                      ? 'bg-orange-600/30 border-orange-600 text-orange-500 shadow-[0_0_10px_rgba(255,90,0,0.4)]'
                      : 'bg-gray-800/30 border-gray-700 text-gray-500 hover:border-orange-600/50'
                    }
                  `}
                >
                  ⬆ Upscale
                </button>
                <button
                  onClick={() => setOperation('rembg')}
                  className={`py-2 px-3 border text-xs font-bold uppercase tracking-wider transition-all rounded
                    ${operation === 'rembg'
                      ? 'bg-orange-600/30 border-orange-600 text-orange-500 shadow-[0_0_10px_rgba(255,90,0,0.4)]'
                      : 'bg-gray-800/30 border-gray-700 text-gray-500 hover:border-orange-600/50'
                    }
                  `}
                >
                  ✂ Remove BG
                </button>
                <button
                  onClick={() => setOperation('convert')}
                  className={`py-2 px-3 border text-xs font-bold uppercase tracking-wider transition-all rounded
                    ${operation === 'convert'
                      ? 'bg-orange-600/30 border-orange-600 text-orange-500 shadow-[0_0_10px_rgba(255,90,0,0.4)]'
                      : 'bg-gray-800/30 border-gray-700 text-gray-500 hover:border-orange-600/50'
                    }
                  `}
                >
                  🔄 Convert
                </button>
              </div>

              {/* Model Selector for Upscale */}
              {operation === 'upscale' && (
                <div className="pt-3 border-t border-gray-700">
                  <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">
                    Upscale Model
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    title="Select upscaling model"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-xs text-orange-400 rounded cursor-pointer hover:border-orange-600/50 focus:border-orange-600 focus:outline-none"
                  >
                    {models.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Format Selector for Convert */}
              {operation === 'convert' && (
                <div className="pt-3 border-t border-gray-700">
                  <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">
                    Output Format
                  </label>
                  <select
                    value={convertFormat}
                    onChange={(e) => setConvertFormat(e.target.value)}
                    title="Select output format"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-xs text-orange-400 rounded cursor-pointer hover:border-orange-600/50 focus:border-orange-600 focus:outline-none"
                  >
                    <option value="jpg">JPG (JPEG)</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                    <option value="bmp">BMP</option>
                    <option value="gif">GIF</option>
                    <option value="svg">SVG</option>
                  </select>
                </div>
              )}
            </div>

            {/* File Selection Display */}
            <div 
                onClick={handleSelectFile}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mb-4 py-4 border border-dashed transition-colors rounded cursor-pointer
                  ${isDragOver 
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400' 
                    : 'border-gray-600 hover:border-orange-500 text-gray-400'
                  }
                `}
            >
              <div className="text-xs text-center">
                {selectedFile ? 
                  selectedFile.split('\\').pop() : 
                  isDragOver ? "[ DROP IMAGE HERE ]" : "[ CLICK TO SELECT SUBJECT ]"
                }
              </div>
              {selectedDimensions && (
                <div className="text-orange-500 text-xs mt-2 text-center">
                  {selectedDimensions.width}x{selectedDimensions.height}px
                </div>
              )}
            </div>

            {/* Resolution Comparison */}
            {selectedDimensions && resultDimensions && (
              <div className="mb-4 p-3 border border-orange-600/30 bg-orange-900/10 rounded text-xs text-orange-400 space-y-1">
                <div className="font-bold uppercase tracking-widest">Resolution</div>
                <div>Before: {selectedDimensions.width}x{selectedDimensions.height}</div>
                <div>After: {resultDimensions.width}x{resultDimensions.height}</div>
                <div className="text-orange-500 font-bold">
                  Scale: {(resultDimensions.width / selectedDimensions.width).toFixed(1)}x
                </div>
              </div>
            )}

            <button 
              onClick={handleProcess}
              disabled={!selectedFile}
              className={`w-full py-3 border transition-all uppercase tracking-widest font-bold text-xs rounded mb-4
                ${selectedFile 
                  ? 'bg-orange-900/20 border-orange-600/50 text-orange-500 hover:bg-orange-600 hover:text-black hover:shadow-[0_0_15px_rgba(255,90,0,0.6)]' 
                  : 'bg-gray-800/50 border-gray-700 text-gray-600 cursor-not-allowed'}
              `}
            >
              Execute Operation
            </button>

            {/* Progress Display */}
            {progress && (
              <div className="mb-4 py-3 px-4 border border-orange-600/50 bg-orange-900/20 rounded text-center">
                <div className="text-xs text-orange-400 animate-pulse">
                  {getProgressDisplay()}
                </div>
              </div>
            )}
            
            <div className="font-mono text-xs text-orange-800">
              STATUS: [{status}]
            </div>
          </div>

          {/* Right Panel - Result Display */}
          <div className="flex-1 flex flex-col overflow-hidden border border-orange-600/50 rounded bg-gray-900/50 relative min-h-0" style={{ maxHeight: '100%' }}>
            {/* Zoom Controls - Floating at Top Center (Only when result exists) */}
            {resultImage && (
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 border border-gray-600 bg-gray-900/80 rounded p-2">
                <div className="text-xs text-gray-500 uppercase tracking-widest self-center hidden sm:block">Zoom</div>
                <button
                  onClick={() => setZoom(1)}
                  className={`px-3 py-1 text-xs font-bold uppercase transition-all rounded
                    ${zoom === 1
                      ? 'bg-orange-600/50 text-orange-400 border border-orange-600'
                      : 'border border-orange-600/30 text-orange-600/70 hover:bg-orange-900/40'
                    }
                  `}
                >
                  100%
                </button>
                <button
                  onClick={() => setZoom(2)}
                  className={`px-3 py-1 text-xs font-bold uppercase transition-all rounded
                    ${zoom === 2
                      ? 'bg-orange-600/50 text-orange-400 border border-orange-600'
                      : 'border border-orange-600/30 text-orange-600/70 hover:bg-orange-900/40'
                    }
                  `}
                >
                  2x
                </button>
                <button
                  onClick={() => setZoom(4)}
                  className={`px-3 py-1 text-xs font-bold uppercase transition-all rounded
                    ${zoom === 4
                      ? 'bg-orange-600/50 text-orange-400 border border-orange-600'
                      : 'border border-orange-600/30 text-orange-600/70 hover:bg-orange-900/40'
                    }
                  `}
                >
                  4x
                </button>
                <button
                  onClick={() => setZoom(8)}
                  className={`px-3 py-1 text-xs font-bold uppercase transition-all rounded
                    ${zoom === 8
                      ? 'bg-orange-600/50 text-orange-400 border border-orange-600'
                      : 'border border-orange-600/30 text-orange-600/70 hover:bg-orange-900/40'
                    }
                  `}
                >
                  8x
                </button>
              </div>
            )}
            {resultImage ? (
              <>
                {/* Image Display with Zoom - Fixed Container */}
                <div
                  className="overflow-auto border border-orange-600/50 rounded w-full cursor-grab active:cursor-grabbing select-none hide-scrollbar"
                  style={{ 
                    flex: '1 0 0',
                    minHeight: '0',
                    display: 'flex', 
                    alignItems: zoom > 1 ? 'flex-start' : 'center',
                    justifyContent: zoom > 1 ? 'flex-start' : 'center',
                    padding: zoom > 1 ? '0' : '0'
                  }}
                  onMouseDown={(e) => {
                    if (zoom > 1) {
                      setIsDragging(true);
                      setDragStart({ x: e.clientX, y: e.clientY });
                    }
                  }}
                  onMouseMove={(e) => {
                    if (!isDragging || zoom <= 1) return;
                    
                    const container = e.currentTarget;
                    const dx = e.clientX - dragStart.x;
                    const dy = e.clientY - dragStart.y;
                    
                    container.scrollLeft -= dx;
                    container.scrollTop -= dy;
                    
                    setDragStart({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                >
                {resultImage && resultImage.endsWith('.svg') ? (
                  <object 
                    data={resultImage}
                    type="image/svg+xml"
                    className="pointer-events-none"
                    style={{
                      maxWidth: zoom === 1 ? '100%' : 'none',
                      maxHeight: zoom === 1 ? '100%' : 'none',
                      width: zoom === 1 ? 'auto' : `${100 * zoom}%`,
                      height: zoom === 1 ? 'auto' : `${100 * zoom}%`,
                      objectFit: 'contain',
                      userSelect: 'none'
                    }}
                  />
                ) : (
                  <img 
                    src={resultImage} 
                    alt="Processed result" 
                    className="pointer-events-none"
                    style={{
                      maxWidth: zoom === 1 ? '100%' : 'none',
                      maxHeight: zoom === 1 ? '100%' : 'none',
                      width: zoom === 1 ? 'auto' : `${100 * zoom}%`,
                      height: zoom === 1 ? 'auto' : `${100 * zoom}%`,
                      objectFit: 'contain',
                      userSelect: 'none'
                    }}
                    draggable={false}
                  />
                )}
                </div>

                {/* Clear Button with Divergence Display - Floating at Bottom */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 border border-gray-600 flex items-center justify-between gap-4 bg-gray-900/80 rounded">
                  <button
                    onClick={() => {
                      setResultImage(null);
                      setResultDimensions(null);
                      setZoom(1);
                    }}
                    className="text-gray-400 text-xs uppercase hover:text-orange-400 transition-colors"
                  >
                    Clear Result
                  </button>
                  <div className="font-mono text-sm text-orange-500 tracking-widest">
                    {divergence}
                  </div>
                </div>
              </>
            ) : selectedImagePreview ? (
              <>
                {/* Preview of Selected Image */}
                <div
                  className="overflow-hidden border border-orange-600/50 rounded w-full select-none"
                  style={{ 
                    flex: '1 1 0',
                    minHeight: '0',
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <img 
                    src={selectedImagePreview ?? ''} 
                    alt="Selected image preview" 
                    className="pointer-events-none"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      userSelect: 'none'
                    }}
                    draggable={false}
                  />
                </div>

                {/* Info Bar - Floating at Bottom */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 border border-gray-600 flex items-center justify-between gap-4 bg-gray-900/80 rounded">
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setSelectedImagePreview(null);
                      setSelectedDimensions(null);
                    }}
                    className="text-gray-400 text-xs uppercase hover:text-orange-400 transition-colors"
                  >
                    Clear Selection
                  </button>
                  <div className="font-mono text-sm text-orange-500 tracking-widest">
                    {divergence}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-600 flex-1 flex flex-col items-center justify-center">
                <div className="text-lg mb-4">⏳</div>
                <p className="text-xs uppercase tracking-widest">
                  {selectedFile ? 'Ready to process' : 'Select an image to begin'}
                </p>
              </div>
            )}

            {/* Progress Overlay - Blur Background with Percentage */}
            {isProcessing && progressPercent > 0 && (
              <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded"
                style={{
                  backdropFilter: 'blur(5px)'
                }}
              >
                <div className="text-center">
                  <div className="text-6xl font-bold text-orange-500 mb-4 font-mono">
                    {Math.round(progressPercent)}%
                  </div>
                  <div className="w-48 h-2 bg-gray-800/50 border border-orange-600/50 rounded overflow-hidden mb-4">
                    <div 
                      className="h-full bg-orange-600 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-orange-400 text-xs uppercase tracking-widest">
                    {getProgressDisplay() || 'Processing...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;