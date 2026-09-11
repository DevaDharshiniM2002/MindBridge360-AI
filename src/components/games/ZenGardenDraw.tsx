import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Flower, Waves, Compass, RefreshCw } from 'lucide-react';

export const ZenGardenDraw: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'rake' | 'stone' | 'smooth'>('rake');

  const initSand = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Warm sand background
    ctx.fillStyle = '#E8DFCC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grain texture
    ctx.fillStyle = 'rgba(180, 160, 130, 0.15)';
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  };

  useEffect(() => {
    initSand();
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const drawRakeLines = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'rake') {
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#BFB199';
      ctx.lineCap = 'round';

      // 3 parallel rake tines
      [-8, 0, 8].forEach((offset) => {
        ctx.beginPath();
        ctx.arc(x + offset, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#C8BAA3';
        ctx.fill();
        ctx.stroke();
      });
    } else if (tool === 'stone') {
      // Draw a smooth zen river pebble
      ctx.fillStyle = '#6E6A63';
      ctx.beginPath();
      ctx.ellipse(x, y, 14, 10, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4D4A45';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      // Smooth sand out
      ctx.fillStyle = '#E8DFCC';
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    drawRakeLines(x, y);
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    drawRakeLines(x, y);
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  return (
    <div className="flex flex-col items-center p-6 rounded-3xl bg-[#F8F5EE] dark:bg-[#1C2329] border border-[#E5DEC9] dark:border-[#2D3945] min-h-[440px]">
      <div className="text-center mb-4">
        <h4 className="text-base font-serif font-bold text-[#2D3748] dark:text-white flex items-center justify-center gap-2">
          <Waves className="w-4 h-4 text-[#8A7964]" />
          Sand Garden Rake
        </h4>
        <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-0.5">
          Drag your finger or cursor to trace peaceful ripples in the sand.
        </p>
      </div>

      {/* Canvas container with wood-frame styling */}
      <div className="p-3 bg-[#8C765C] rounded-2xl shadow-inner mb-4">
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          className="rounded-xl shadow-xs cursor-crosshair touch-none"
        />
      </div>

      {/* Tool Selector and Reset */}
      <div className="flex items-center justify-between w-full max-w-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTool('rake')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
              tool === 'rake'
                ? 'bg-[#6E5D48] text-white shadow-xs'
                : 'bg-white/80 dark:bg-[#253039] text-[#6E5D48] dark:text-[#C5B39E]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Rake</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('stone')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
              tool === 'stone'
                ? 'bg-[#6E5D48] text-white shadow-xs'
                : 'bg-white/80 dark:bg-[#253039] text-[#6E5D48] dark:text-[#C5B39E]'
            }`}
          >
            <Flower className="w-3.5 h-3.5" />
            <span>Pebble</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('smooth')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
              tool === 'smooth'
                ? 'bg-[#6E5D48] text-white shadow-xs'
                : 'bg-white/80 dark:bg-[#253039] text-[#6E5D48] dark:text-[#C5B39E]'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Smooth</span>
          </button>
        </div>

        <button
          type="button"
          onClick={initSand}
          className="p-2 rounded-xl bg-white dark:bg-[#253039] text-[#6E5D48] dark:text-[#C5B39E] hover:bg-[#EAE3D2] border border-[#DDD4BD] dark:border-[#384654] transition-all cursor-pointer"
          title="Rake Fresh Sand"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
