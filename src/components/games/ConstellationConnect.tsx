import React, { useState } from 'react';
import { Sparkles, RefreshCw, Star, Moon } from 'lucide-react';

interface StarPoint {
  id: number;
  x: number; // percentage
  y: number; // percentage
  name: string;
}

const CONSTELLATIONS = [
  {
    title: 'Ursa Minor (Little Dipper)',
    stars: [
      { id: 0, x: 20, y: 70, name: 'Ankaa' },
      { id: 1, x: 35, y: 55, name: 'Pherkad' },
      { id: 2, x: 50, y: 60, name: 'Kochab' },
      { id: 3, x: 45, y: 35, name: 'Zeta' },
      { id: 4, x: 60, y: 25, name: 'Epsilon' },
      { id: 5, x: 75, y: 22, name: 'Delta' },
      { id: 6, x: 88, y: 20, name: 'Polaris' },
    ],
  },
  {
    title: 'Cassiopeia (The Northern Crown)',
    stars: [
      { id: 0, x: 15, y: 65, name: 'Caph' },
      { id: 1, x: 35, y: 35, name: 'Schedar' },
      { id: 2, x: 50, y: 60, name: 'Gamma' },
      { id: 3, x: 68, y: 30, name: 'Ruchbah' },
      { id: 4, x: 85, y: 55, name: 'Segin' },
    ],
  },
];

export const ConstellationConnect: React.FC = () => {
  const [constellationIdx, setConstellationIdx] = useState(0);
  const currentConstellation = CONSTELLATIONS[constellationIdx];
  const [connectedIds, setConnectedIds] = useState<number[]>([0]);

  const playChime = (pitch: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (_) {}
  };

  const handleStarClick = (star: StarPoint) => {
    const nextExpectedId = connectedIds.length;
    if (star.id === nextExpectedId) {
      const baseFreq = 400 + nextExpectedId * 65;
      playChime(baseFreq);
      setConnectedIds((prev) => [...prev, star.id]);
    }
  };

  const isCompleted = connectedIds.length === currentConstellation.stars.length;

  const handleNext = () => {
    setConstellationIdx((i) => (i + 1) % CONSTELLATIONS.length);
    setConnectedIds([0]);
  };

  return (
    <div className="flex flex-col items-center p-6 rounded-3xl bg-[#0F172A] border border-[#1E293B] min-h-[440px] text-white">
      <div className="text-center mb-4">
        <h4 className="text-base font-serif font-bold flex items-center justify-center gap-2 text-indigo-200">
          <Moon className="w-4 h-4 text-indigo-300" />
          Constellation Connect
        </h4>
        <p className="text-xs text-indigo-300/70 mt-0.5">
          Tap the glowing stars in sequence to illuminate the night sky.
        </p>
      </div>

      {/* Sky Canvas Container */}
      <div className="w-full max-w-sm h-64 bg-radial from-[#1E293B] to-[#0B0F19] rounded-2xl border border-indigo-900/40 relative overflow-hidden mb-4">
        {/* Background ambient distant stars */}
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full animate-pulse"
            style={{
              top: `${(i * 37) % 95}%`,
              left: `${(i * 53) % 95}%`,
              animationDelay: `${(i % 5) * 0.4}s`,
            }}
          />
        ))}

        {/* Drawn SVG connecting lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connectedIds.slice(1).map((starId, idx) => {
            const prevStar = currentConstellation.stars[connectedIds[idx]];
            const currStar = currentConstellation.stars[starId];
            return (
              <line
                key={starId}
                x1={`${prevStar.x}%`}
                y1={`${prevStar.y}%`}
                x2={`${currStar.x}%`}
                y2={`${currStar.y}%`}
                stroke="#818CF8"
                strokeWidth="2"
                strokeDasharray="3 3"
                className="animate-in fade-in duration-500"
              />
            );
          })}
        </svg>

        {/* Interactive Star Nodes */}
        {currentConstellation.stars.map((star) => {
          const isConnected = connectedIds.includes(star.id);
          const isNextTarget = star.id === connectedIds.length;

          return (
            <button
              key={star.id}
              type="button"
              onClick={() => handleStarClick(star)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-full transition-all cursor-pointer ${
                isConnected
                  ? 'text-amber-300 scale-110'
                  : isNextTarget
                  ? 'text-indigo-300 animate-bounce'
                  : 'text-indigo-600/60'
              }`}
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
              }}
              aria-label={star.name}
            >
              <Star
                className={`w-5 h-5 ${
                  isConnected ? 'fill-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]' : ''
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Completion status */}
      <div className="flex items-center justify-between w-full max-w-sm pt-2">
        <div className="text-xs text-indigo-300 font-medium">
          {isCompleted ? (
            <span className="text-amber-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {currentConstellation.title} Illuminated!
            </span>
          ) : (
            `Next star: ${connectedIds.length + 1} of ${currentConstellation.stars.length}`
          )}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-800 text-xs font-semibold transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isCompleted ? 'Next Constellation' : 'Reset Sky'}</span>
        </button>
      </div>
    </div>
  );
};
