import React, { useEffect, useRef } from 'react';

interface SkylineDataStreamProps {
  mode?: 'binary' | 'lines';
  color?: string; // allow custom color overrides for premium interaction
  speed?: number; // speed in milliseconds per frame (default 50)
}

const SkylineDataStream: React.FC<SkylineDataStreamProps> = ({
  mode = 'binary',
  color = '#2dd4bf', // Tailwind teal-400
  speed = 50,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Stream setup
    const fontSize = 16;
    let columns = Math.ceil(canvas.width / fontSize);
    let drops = Array.from({ length: columns }).fill(1) as number[];

    // Handle initial sizing and resize events
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const newColumns = Math.ceil(canvas.width / fontSize);
      if (newColumns > drops.length) {
        // Pad drops array for wider screen
        const extra = Array.from({ length: newColumns - drops.length }).fill(1) as number[];
        drops = [...drops, ...extra];
      } else if (newColumns < drops.length) {
        // Shrink drops array
        drops = drops.slice(0, newColumns);
      }
      columns = newColumns;
    };

    // Set initial size
    handleResize();
    window.addEventListener('resize', handleResize);

    const draw = () => {
      // 1. Create the fade trail effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.12)'; // Tailwind slate-900 with high transparency
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Set the glowing tech color
      ctx.fillStyle = color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;

      // 3. Render the streams
      for (let i = 0; i < columns; i++) {
        // Make sure we have a drop index
        if (drops[i] === undefined) {
          drops[i] = 1;
        }

        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (mode === 'binary') {
          // --- OPTION 1: THE BINARY MATRIX ---
          ctx.font = `${fontSize}px monospace`;
          const char = Math.random() > 0.5 ? '0' : '1';
          ctx.fillText(char, x, y);
        } else {
          // --- OPTION 2: ABSTRACT LIGHT LINES ---
          // Draws a falling laser/fiber-optic line segment
          ctx.beginPath();
          ctx.moveTo(x, y - 18); // Start slightly above
          ctx.lineTo(x, y);      // Draw to current position
          ctx.lineWidth = 2;
          ctx.strokeStyle = color;
          ctx.stroke();
        }

        // 4. Stagger the reset so it rains continuously 
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move the drop down
        drops[i]++;
      }
    };

    // Run the animation loop at specified speed
    const interval = setInterval(draw, speed);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [mode, color, speed]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full z-0 mix-blend-screen pointer-events-none" 
    />
  );
};

export default SkylineDataStream;
