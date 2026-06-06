import React, { useEffect, useRef } from 'react';

export interface ThemePalette {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

export type RenderStyle = 'silhouette' | 'outline' | 'luma-blend';
export type MotionType = 'falling' | 'flicker';

interface SkylineDataStreamProps {
  mode?: 'binary' | 'matrix';
  palette: ThemePalette;
  renderStyle?: RenderStyle;
  motionType?: MotionType;
  speed?: number;
  density?: number;
  imageSrc?: string;
}

// Convert hex to rgb array [r, g, b]
const hexToRgb = (hex: string) => {
  let r = 255, g = 255, b = 255;
  if (hex.startsWith('#') && hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  return [r, g, b];
};

const SkylineDataStream: React.FC<SkylineDataStreamProps> = ({
  mode = 'matrix',
  palette,
  renderStyle = 'silhouette',
  motionType = 'falling',
  speed = 45,
  density = 10,
  imageSrc = '/san-diego-skyline-night.png',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastDrawTime = 0;

    const image = new Image();
    image.src = imageSrc;
    
    let columns = 0;
    let rows = 0;
    let drops: number[] = [];
    let lumaMap: Uint8Array = new Uint8Array(0);
    let outlineMap: Uint8Array = new Uint8Array(0);
    
    // For flicker mode, keep track of individual cell states
    let flickerStates: Float32Array = new Float32Array(0);

    const binaryChars = '01'.split('');
    const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~'.split('');

    // --- Image Processing & Edge Detection ---
    const initGrid = () => {
      if (!image.complete || image.naturalWidth === 0) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      columns = Math.ceil(canvas.width / density);
      rows = Math.ceil(canvas.height / density);

      const offCanvas = document.createElement('canvas');
      offCanvas.width = columns;
      offCanvas.height = rows;
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
      if (!offCtx) return;

      const imgRatio = image.naturalWidth / image.naturalHeight;
      const canvasRatio = canvas.width / canvas.height;
      
      let drawWidth = offCanvas.width;
      let drawHeight = offCanvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        drawWidth = drawHeight * imgRatio;
        offsetX = (offCanvas.width - drawWidth) / 2;
      } else {
        drawHeight = drawWidth / imgRatio;
        offsetY = (offCanvas.height - drawHeight) / 2;
      }

      offCtx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      const imgData = offCtx.getImageData(0, 0, columns, rows).data;
      
      lumaMap = new Uint8Array(columns * rows);
      outlineMap = new Uint8Array(columns * rows);
      flickerStates = new Float32Array(columns * rows).map(() => Math.random());

      // 1. Calculate Luma Map
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const index = (y * columns + x) * 4;
          const r = imgData[index];
          const g = imgData[index + 1];
          const b = imgData[index + 2];
          lumaMap[y * columns + x] = (r * 0.299 + g * 0.587 + b * 0.114);
        }
      }

      // 2. Calculate Edge Detection (Outline Map) if needed
      if (renderStyle === 'outline') {
        for (let y = 1; y < rows - 1; y++) {
          for (let x = 1; x < columns - 1; x++) {
            const idx = y * columns + x;
            const luma = lumaMap[idx];
            
            // Simple edge detection: compare with right and bottom neighbors
            const rightLuma = lumaMap[idx + 1];
            const bottomLuma = lumaMap[idx + columns];
            
            const diffX = Math.abs(luma - rightLuma);
            const diffY = Math.abs(luma - bottomLuma);
            
            if (diffX > 15 || diffY > 15) {
              outlineMap[idx] = 255;
            } else {
              outlineMap[idx] = 0;
            }
          }
        }
      }

      // Initialize drops for falling mode
      drops = Array.from({ length: columns }).fill(0).map(() => Math.floor(Math.random() * -rows));
    };

    image.onload = initGrid;
    window.addEventListener('resize', () => initGrid());

    // --- Render Loop ---
    const draw = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(draw);

      if (timestamp - lastDrawTime < speed) return;
      lastDrawTime = timestamp;

      // Extract palette colors
      const [bgR, bgG, bgB] = hexToRgb(palette.background);
      const [txtR, txtG, txtB] = hexToRgb(palette.text);
      const [primR, primG, primB] = hexToRgb(palette.primary);
      const [secR, secG, secB] = hexToRgb(palette.secondary);

      // Handle Background clear/fade based on motion type and render style
      if (renderStyle === 'luma-blend') {
         // Subtle background draw of original image
         ctx.fillStyle = `rgba(${bgR}, ${bgG}, ${bgB}, 0.2)`;
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         // Note: proper luma-blend would draw the image itself, 
         // but since we want the generator aesthetic, we use the palette bg
      } else if (motionType === 'falling') {
         ctx.fillStyle = `rgba(${bgR}, ${bgG}, ${bgB}, 0.15)`;
         ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
         // Flicker mode needs a full clear to avoid smearing
         ctx.fillStyle = `rgba(${bgR}, ${bgG}, ${bgB}, 1)`;
         ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.font = `600 ${density}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const chars = mode === 'binary' ? binaryChars : matrixChars;

      // --- MOTION: FALLING RAIN ---
      if (motionType === 'falling') {
        for (let x = 0; x < columns; x++) {
          const y = drops[x];
          
          if (y >= 0 && y < rows) {
            const idx = y * columns + x;
            const luma = lumaMap[idx];
            const isEdge = outlineMap[idx] === 255;
            
            let shouldDraw = false;
            if (renderStyle === 'silhouette' && luma > 30) shouldDraw = true;
            if (renderStyle === 'outline' && isEdge) shouldDraw = true;
            if (renderStyle === 'luma-blend' && luma > 10) shouldDraw = true;

            if (shouldDraw) {
              const char = chars[Math.floor(Math.random() * chars.length)];
              const px = x * density + density / 2;
              const py = y * density + density / 2;

              // Primary bright color
              ctx.fillStyle = `rgba(${txtR}, ${txtG}, ${txtB}, ${renderStyle === 'luma-blend' ? luma/255 : 1})`;
              ctx.fillText(char, px, py);

              // Chromatic Aberration / Glitch on bright points or edges
              if (luma > 150 || renderStyle === 'outline') {
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = `rgba(${primR}, ${primG}, ${primB}, 0.7)`;
                ctx.fillText(char, px - 1, py);
                ctx.fillStyle = `rgba(${secR}, ${secG}, ${secB}, 0.7)`;
                ctx.fillText(char, px + 1, py);
                ctx.globalCompositeOperation = 'source-over';
              }
            }
          }

          drops[x]++;
          if (drops[x] * density > canvas.height && Math.random() > 0.95) {
            drops[x] = 0;
          }
        }
      } 
      // --- MOTION: STATIC FLICKER ---
      else if (motionType === 'flicker') {
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < columns; x++) {
             const idx = y * columns + x;
             const luma = lumaMap[idx];
             const isEdge = outlineMap[idx] === 255;

             let shouldDraw = false;
             if (renderStyle === 'silhouette' && luma > 40) shouldDraw = true;
             if (renderStyle === 'outline' && isEdge) shouldDraw = true;
             if (renderStyle === 'luma-blend' && luma > 20) shouldDraw = true;

             if (shouldDraw) {
                // Mutate flicker state
                if (Math.random() > 0.9) {
                   flickerStates[idx] = Math.random();
                }
                const fState = flickerStates[idx];
                
                // Only draw if flicker state is high enough (creates sparse glowing points)
                if (fState > 0.6) {
                  const char = chars[Math.floor(Math.random() * chars.length)];
                  const px = x * density + density / 2;
                  const py = y * density + density / 2;

                  // Vary color based on flicker state
                  const useAccent = fState > 0.95;
                  
                  ctx.fillStyle = useAccent 
                    ? `rgba(${primR}, ${primG}, ${primB}, ${fState})` 
                    : `rgba(${txtR}, ${txtG}, ${txtB}, ${fState * (luma/255)})`;
                    
                  ctx.fillText(char, px, py);

                  // Glitch extreme points
                  if (fState > 0.98) {
                    ctx.globalCompositeOperation = 'screen';
                    ctx.fillStyle = `rgba(${secR}, ${secG}, ${secB}, 0.8)`;
                    ctx.fillText(char, px - 2, py);
                    ctx.globalCompositeOperation = 'source-over';
                  }
                }
             }
          }
        }
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, palette, renderStyle, motionType, speed, density, imageSrc]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full z-0 pointer-events-none mix-blend-screen opacity-90" 
      style={{ backgroundColor: palette.background }}
    />
  );
};

export default SkylineDataStream;
