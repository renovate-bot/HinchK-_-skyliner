import React, { useEffect, useRef } from 'react';

interface SkylineDataStreamProps {
  mode?: 'binary' | 'matrix';
  color?: string; // used for subtle tinting
  speed?: number; // frame delay
  density?: number; // smaller = higher res text
  imageSrc?: string;
}

const SkylineDataStream: React.FC<SkylineDataStreamProps> = ({
  mode = 'matrix',
  color = '#2dd4bf', // Teal default
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

    const binaryChars = '01'.split('');
    const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~'.split('');

    const initGrid = () => {
      if (!image.complete || image.naturalWidth === 0) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      columns = Math.ceil(canvas.width / density);
      rows = Math.ceil(canvas.height / density);

      // Extract pixel brightness into a 1D array for O(1) lookup
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

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const index = (y * columns + x) * 4;
          const r = imgData[index];
          const g = imgData[index + 1];
          const b = imgData[index + 2];
          // Perceived brightness mapping
          lumaMap[y * columns + x] = (r * 0.299 + g * 0.587 + b * 0.114);
        }
      }

      // Initialize drops with random negative starting Y positions to stagger the rain
      drops = Array.from({ length: columns }).fill(0).map(() => Math.floor(Math.random() * -rows));
    };

    image.onload = initGrid;

    const handleResize = () => {
      initGrid();
    };
    window.addEventListener('resize', handleResize);

    const draw = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(draw);

      if (timestamp - lastDrawTime < speed) return;
      lastDrawTime = timestamp;

      // Dark alpha fade to create the trailing effect
      // Extremely dark to simulate the deep pitch-black Spartan aesthetic
      ctx.fillStyle = 'rgba(2, 6, 23, 0.15)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `600 ${density}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const chars = mode === 'binary' ? binaryChars : matrixChars;

      // Render the falling rain heads
      for (let x = 0; x < columns; x++) {
        const y = drops[x];
        
        // Bounds check
        if (y >= 0 && y < rows) {
          const luma = lumaMap[y * columns + x];
          
          // Only render characters if this pixel is over a bright spot in the building
          if (luma > 30) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const px = x * density + density / 2;
            const py = y * density + density / 2;

            // Pure crisp white/silver for the data head
            ctx.fillStyle = `rgba(241, 245, 249, ${luma / 255})`;
            ctx.fillText(char, px, py);

            // Subtle Chromatic Aberration on bright areas
            if (luma > 150) {
              ctx.globalCompositeOperation = 'screen';
              
              ctx.fillStyle = `rgba(0, 255, 255, 0.7)`; // Cyan
              ctx.fillText(char, px - 1, py);
              
              ctx.fillStyle = `rgba(255, 0, 255, 0.7)`; // Magenta
              ctx.fillText(char, px + 1, py);
              
              ctx.globalCompositeOperation = 'source-over';
            }
          }
        }

        // Drop falls down
        drops[x]++;

        // Reset the drop to top randomly once it hits the bottom
        if (drops[x] * density > canvas.height && Math.random() > 0.95) {
          drops[x] = 0;
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
      className="absolute inset-0 w-full h-full z-0 pointer-events-none mix-blend-screen opacity-90" 
    />
  );
};

export default SkylineDataStream;
