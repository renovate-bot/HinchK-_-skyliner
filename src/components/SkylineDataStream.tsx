import React, { useEffect, useRef, useState } from 'react';

export interface ThemePalette {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  accent: string;
}

interface SkylineDataStreamProps {
  mode: 'binary' | 'matrix';
  palette: ThemePalette;
  speed: number;
  density: number; // Used as font size and grid size
  imageSrc: string | null;
  lumaThreshold: number;
  invertMask: boolean;
}

const SkylineDataStream: React.FC<SkylineDataStreamProps> = ({
  mode,
  palette,
  speed,
  density,
  imageSrc,
  lumaThreshold,
  invertMask,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load the image
  useEffect(() => {
    if (!imageSrc) return;
    setImageLoaded(false);
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
  }, [imageSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas to full window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Characters for the point cloud
    const chars = mode === 'binary' 
      ? '01' 
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+<>:;=~|';

    // Grid state to hold characters so they don't change every frame unless they flicker
    const gridCols = Math.ceil(canvas.width / density);
    const gridRows = Math.ceil(canvas.height / density);
    const charGrid: string[][] = Array(gridCols).fill(0).map(() => 
      Array(gridRows).fill('0').map(() => chars[Math.floor(Math.random() * chars.length)])
    );

    // Off-screen canvas to extract image data
    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d');

    let animationFrameId: number;
    let lastDrawTime = 0;

    const renderFrame = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(renderFrame);

      // Throttle based on speed slider (higher speed = lower delay)
      // speed ranges from 0.1 to 3
      const delay = 100 / speed;
      if (timestamp - lastDrawTime < delay) return;
      lastDrawTime = timestamp;

      // Pure black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!imageLoaded || !imageRef.current || !offCtx) return;

      const img = imageRef.current;
      
      // Calculate scale to "cover" the canvas while maintaining aspect ratio
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      // Center the image
      const drawX = (canvas.width - drawWidth) / 2;
      const drawY = (canvas.height - drawHeight) / 2;

      // Draw to offscreen canvas to get pixel data
      offCanvas.width = canvas.width;
      offCanvas.height = canvas.height;
      offCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      
      let imgData: ImageData;
      try {
        imgData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (e) {
        console.error("getImageData failed", e);
        return; // Handle CORS or not loaded
      }
      const data = imgData.data;

      // Set up font for the grid
      ctx.font = `${density}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Iterate over the grid
      const cols = Math.ceil(canvas.width / density);
      const rows = Math.ceil(canvas.height / density);

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const px = Math.floor(x * density + density / 2);
          const py = Math.floor(y * density + density / 2);

          // Bounds check
          if (px >= canvas.width || py >= canvas.height) continue;

          const i = (py * canvas.width + px) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate perceptual brightness (Luma)
          const luma = r * 0.299 + g * 0.587 + b * 0.114;

          // Mask Check
          const pass = invertMask ? luma < lumaThreshold : luma > lumaThreshold;

          if (pass) {
            // Chance to "flicker" (change character)
            if (Math.random() < 0.05) {
               // Safety check for grid bounds in case canvas resized mid-frame
               if (charGrid[x] && charGrid[x][y]) {
                   charGrid[x][y] = chars[Math.floor(Math.random() * chars.length)];
               }
            }
            
            const char = charGrid[x]?.[y] || '1';

            // Base color from palette
            const colorArray = [palette.primary, palette.secondary, palette.accent, palette.text];
            let color = colorArray[Math.floor(Math.random() * colorArray.length)];
            
            // Chromatic Glitch effect on very bright spots
            const isVeryBright = invertMask ? luma < Math.max(0, lumaThreshold - 50) : luma > Math.min(255, lumaThreshold + 50);
            
            if (isVeryBright && Math.random() < 0.1) {
              // Glitch cyan/magenta
              ctx.globalCompositeOperation = 'screen';
              
              ctx.fillStyle = '#0ff'; // Cyan
              ctx.fillText(char, px - 2, py);
              
              ctx.fillStyle = '#f0f'; // Magenta
              ctx.fillText(char, px + 2, py);
              
              ctx.globalCompositeOperation = 'source-over';
            } else {
              // Apply opacity based on how far past the threshold it is, to give depth
              let opacity = 1;
              if (invertMask) {
                // Closer to 0 is more opaque
                opacity = 1 - (luma / lumaThreshold);
              } else {
                // Closer to 255 is more opaque
                opacity = (luma - lumaThreshold) / (255 - lumaThreshold);
              }
              // Map opacity to a minimum of 0.3 so it doesn't totally disappear if it passed the threshold
              opacity = Math.max(0.3, Math.min(1, opacity));
              
              ctx.globalAlpha = opacity;
              ctx.fillStyle = color;
              ctx.fillText(char, px, py);
              ctx.globalAlpha = 1.0;
            }
          }
        }
      }
    };

    animationFrameId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [mode, palette, speed, density, imageLoaded, lumaThreshold, invertMask]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        backgroundColor: '#000',
      }}
    />
  );
};

export default SkylineDataStream;
