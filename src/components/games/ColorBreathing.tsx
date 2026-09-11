import React, { useState, useEffect } from 'react';
import { Eye, Sun, Play, Pause, Sparkles } from 'lucide-react';

const CHROMATIC_CYCLES = [
  { name: 'Dawn Horizon', colors: ['#FFF7ED', '#FFEDD5', '#FED7AA', '#E0F2FE', '#BAE6FD'] },
  { name: 'Forest Pine', colors: ['#F0FDF4', '#DCFCE7', '#BBF7D0', '#E0F2FE', '#CFFAFE'] },
  { name: 'Twilight Lavender', colors: ['#FAF5FF', '#F3E8FF', '#E9D5FF', '#E0E7FF', '#C7D2FE'] },
];

export const ColorBreathing: React.FC = () => {
  const [cycleIndex, setCycleIndex] = useState(0);
  const [colorStep, setColorStep] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [breathCount, setBreathCount] = useState(0);

  const activePalette = CHROMATIC_CYCLES[cycleIndex].colors;

  useEffect(() => {
    if (!isRunning) return;

    // Changes color shade every 3.5 seconds gently
    const interval = setInterval(() => {
      setColorStep((prev) => {
        const next = (prev + 1) % activePalette.length;
        if (next === 0) setBreathCount((b) => b + 1);
        return next;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isRunning, activePalette.length]);

  return (
    <div
      className="flex flex-col items-center justify-between p-6 rounded-3xl border border-stone-200/80 min-h-[440px] transition-colors duration-3000 ease-in-out relative overflow-hidden"
      style={{ backgroundColor: activePalette[colorStep] }}
    >
      {/* Palette Chooser */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 z-10">
        {CHROMATIC_CYCLES.map((c, idx) => (
          <button
            key={c.name}
            type="button"
            onClick={() => {
              setCycleIndex(idx);
              setColorStep(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
              cycleIndex === idx
                ? 'bg-black/75 text-white'
                : 'bg-white/80 text-stone-700 hover:bg-white'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Passive Meditative Center */}
      <div className="text-center space-y-3 z-10 my-8">
        <div className="w-20 h-20 mx-auto rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center shadow-inner animate-pulse">
          <Eye className="w-8 h-8 text-stone-700/80" />
        </div>
        <h4 className="text-lg font-serif font-bold text-stone-800">
          Soft Color Bath
        </h4>
        <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
          Rest your eyes and let the shifting ambient wavelengths slow your thoughts. Completely hands-free.
        </p>
        <div className="text-xs font-mono text-stone-700 font-semibold">
          Breaths bathed: {breathCount}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center gap-3 z-10">
        <button
          type="button"
          onClick={() => setIsRunning(!isRunning)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/70 hover:bg-black/85 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isRunning ? 'Pause Chromatherapy' : 'Resume Flow'}</span>
        </button>
      </div>
    </div>
  );
};
