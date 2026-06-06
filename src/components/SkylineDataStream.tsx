import React, { useEffect, useRef } from 'react';

interface SkylineDataStreamProps {
  mode?: 'binary' | 'matrix';
  color?: string; // hex string e.g., '#2dd4bf'
  speed?: number; // frame delay in ms
  density?: number; // grid cell size in px
  imageSrc?: string;
}

const SkylineDataStream: React.FC<SkylineDataStreamProps> = ({
  mode = 'matrix',
  color = '#2dd4bf',
  speed = 50,
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

    // Load the background image
    const image = new Image();
    image.src = imageSrc;
    
    // Core grid array storing active pixels
    let grid: { x: number, y: number, brightness: number, char: string }[] = [];
    let columns = 0;
    let rows = 0;
    let drops: number[] = []; // tracks the "falling" scanlines

    const binaryChars = '01'.split('');
    const matrixChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*()_+'.split('');

    const initGrid = () => {
      if (!image.complete || image.naturalWidth === 0) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      columns = Math.ceil(canvas.width / density);
      rows = Math.ceil(canvas.height / density);

      // Create an offscreen canvas to sample the image pixels
      const offCanvas = document.createElement('canvas');
      offCanvas.width = columns;
      offCanvas.height = rows;
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
      if (!offCtx) return;

      // Draw image scaled to cover the offscreen canvas
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

      // Draw the image downscaled to grid resolution
      offCtx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      
      // Extract pixel data
      const imgData = offCtx.getImageData(0, 0, columns, rows).data;
      
      grid = [];
      const chars = mode === 'binary' ? binaryChars : matrixChars;

      // Map pixels to grid
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const index = (y * columns + x) * 4;
          const r = imgData[index];
          const g = imgData[index + 1];
          const b = imgData[index + 2];
          
          // Calculate perceived brightness (luma)
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
          
          // Only map bright areas (the skyline buildings) to characters
          if (brightness > 25) {
             grid.push({
               x,
               y,
               brightness,
               char: chars[Math.floor(Math.random() * chars.length)]
             });
          }
        }
      }

      // Initialize the falling scanlines
      drops = Array.from({ length: columns }).fill(0).map(() => Math.floor(Math.random() * -rows));
    };

    image.onload = initGrid;

    // Handle resize
    const handleResize = () => {
      initGrid();
    };
    window.addEventListener('resize', handleResize);

    const draw = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(draw);

      if (timestamp - lastDrawTime < speed) return;
      lastDrawTime = timestamp;

      // Clear the canvas with slight alpha to create motion trails
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${density}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Parse theme hex color to RGB
      let r = 45, g = 212, b = 191; // Default teal-400
      if (color.startsWith('#') && color.length === 7) {
        r = parseInt(color.slice(1, 3), 16);
        g = parseInt(color.slice(3, 5), 16);
        b = parseInt(color.slice(5, 7), 16);
      }

      const chars = mode === 'binary' ? binaryChars : matrixChars;

      // Draw the mapped ASCII grid
      for (let i = 0; i < grid.length; i++) {
        const cell = grid[i];
        
        // Randomly mutate characters to simulate active data
        if (Math.random() > 0.95) {
           cell.char = chars[Math.floor(Math.random() * chars.length)];
        }

        const px = cell.x * density + density / 2;
        const py = cell.y * density + density / 2;

        const dropY = drops[cell.x];
        
        // Calculate distance from the falling drop head
        let distance = cell.y - dropY;
        if (distance < 0) distance += rows; // wrap around for continuous loop
        
        // Base brightness from the image mapped to 0-1
        const baseIntensity = cell.brightness / 255;
        
        // Add a flare multiplier if near the drop head
        const flare = distance < 12 && distance >= 0 ? 1 - (distance / 12) : 0;
        
        // Final pixel intensity calculation
        const finalIntensity = Math.min(1, (baseIntensity * 0.4) + (flare * 1.5));
        
        // Draw the character if it's visible enough
        if (finalIntensity > 0.08) {
          // 1. Draw base color
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalIntensity})`;
          ctx.fillText(cell.char, px, py);

          // 2. Chromatic Aberration / Glitch pass (only on the brightest active cells)
          if (finalIntensity > 0.7) {
             ctx.globalCompositeOperation = 'screen';
             
             // Cyan offset
             ctx.fillStyle = `rgba(0, 255, 255, ${finalIntensity * 0.6})`;
             ctx.fillText(cell.char, px - 1.5, py);
             
             // Magenta offset
             ctx.fillStyle = `rgba(255, 0, 255, ${finalIntensity * 0.6})`;
             ctx.fillText(cell.char, px + 1.5, py);
             
             ctx.globalCompositeOperation = 'source-over';
          }
        }
      }

      // Increment drops to move scanlines down
      for (let i = 0; i < columns; i++) {
        drops[i]++;
        // Reset above top if it hits the bottom
        if (drops[i] > rows) {
           drops[i] = Math.floor(Math.random() * -20);
        }
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mode, color, speed, density, imageSrc]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full z-0 pointer-events-none mix-blend-screen" 
    />
  );
};

export default SkylineDataStream;
