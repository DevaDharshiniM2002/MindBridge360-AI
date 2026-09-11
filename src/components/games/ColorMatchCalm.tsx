import React, { useState } from 'react';
import { Sparkles, RefreshCw, CheckCircle2, Heart } from 'lucide-react';

interface Tile {
  id: number;
  colorName: string;
  hex: string;
  matched: boolean;
}

const PASTEL_PAIRS = [
  { name: 'Sage Leaf', hex: '#A3B899' },
  { name: 'Muted Teal', hex: '#66999B' },
  { name: 'Warm Clay', hex: '#E29578' },
  { name: 'Pale Lavender', hex: '#B8B8D1' },
  { name: 'Soft Sand', hex: '#DDB892' },
  { name: 'Powder Blue', hex: '#8ECAE6' },
];

export const ColorMatchCalm: React.FC = () => {
  const generateShuffledTiles = () => {
    const tiles: Tile[] = [];
    let id = 0;
    PASTEL_PAIRS.forEach((pair) => {
      tiles.push({ id: id++, colorName: pair.name, hex: pair.hex, matched: false });
      tiles.push({ id: id++, colorName: pair.name, hex: pair.hex, matched: false });
    });
    return tiles.sort(() => Math.random() - 0.5);
  };

  const [tiles, setTiles] = useState<Tile[]>(generateShuffledTiles);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [matchesFound, setMatchesFound] = useState<number>(0);

  const playSoftTone = (freq: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (_) {}
  };

  const handleTileClick = (tile: Tile) => {
    if (tile.matched || selectedIds.includes(tile.id) || selectedIds.length === 2) return;

    playSoftTone(340);
    const newSelected = [...selectedIds, tile.id];
    setSelectedIds(newSelected);

    if (newSelected.length === 2) {
      const first = tiles.find((t) => t.id === newSelected[0])!;
      const second = tiles.find((t) => t.id === newSelected[1])!;

      if (first.hex === second.hex) {
        playSoftTone(520);
        setTimeout(() => {
          setTiles((prev) =>
            prev.map((t) => (t.hex === first.hex ? { ...t, matched: true } : t))
          );
          setSelectedIds([]);
          setMatchesFound((m) => m + 1);
        }, 400);
      } else {
        setTimeout(() => {
          setSelectedIds([]);
        }, 850);
      }
    }
  };

  const handleReset = () => {
    setTiles(generateShuffledTiles());
    setSelectedIds([]);
    setMatchesFound(0);
  };

  const allMatched = matchesFound === PASTEL_PAIRS.length;

  return (
    <div className="flex flex-col items-center p-6 rounded-3xl bg-[#FBF9F5] dark:bg-[#1A2227] border border-[#E9E3D5] dark:border-[#2C3843] min-h-[440px]">
      <div className="text-center mb-5">
        <h4 className="text-base font-serif font-bold text-[#2D3748] dark:text-white flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-[#4A8B8D]" />
          Soft Color Harmony
        </h4>
        <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-0.5">
          Tap two tiles to pair their serene pastel hues. No clock, no stress.
        </p>
      </div>

      {/* Grid of tiles */}
      <div className="grid grid-cols-4 gap-3 max-w-sm w-full mb-6">
        {tiles.map((tile) => {
          const isSelected = selectedIds.includes(tile.id);
          const isRevealed = isSelected || tile.matched;

          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => handleTileClick(tile)}
              className={`aspect-square rounded-2xl border transition-all duration-300 transform cursor-pointer flex items-center justify-center shadow-2xs ${
                tile.matched
                  ? 'opacity-40 scale-95 border-transparent'
                  : isSelected
                  ? 'scale-105 ring-2 ring-[#4A8B8D] border-transparent'
                  : 'bg-white dark:bg-[#253039] hover:bg-[#F3EFE6] border-[#DFD8C8] dark:border-[#3A4957]'
              }`}
              style={{
                backgroundColor: isRevealed ? tile.hex : undefined,
              }}
              aria-label={tile.colorName}
            >
              {tile.matched && <CheckCircle2 className="w-5 h-5 text-white drop-shadow-sm" />}
            </button>
          );
        })}
      </div>

      {/* Completion or in-progress feedback */}
      <div className="flex items-center justify-between w-full max-w-sm pt-2 border-t border-[#EAE3D4] dark:border-[#2D3945]">
        <div className="text-xs text-[#718096] dark:text-[#A0AEC0] flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span>{allMatched ? 'All paired beautifully!' : `${matchesFound} / ${PASTEL_PAIRS.length} pairs joined`}</span>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#253039] hover:bg-[#EFE9DC] text-xs font-semibold text-[#4A8B8D] dark:text-[#6CB2B5] border border-[#DFD8C8] dark:border-[#3A4957] transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Shuffle</span>
        </button>
      </div>
    </div>
  );
};
