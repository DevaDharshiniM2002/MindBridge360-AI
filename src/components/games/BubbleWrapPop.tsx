import React, { useState } from 'react';
import { Sparkles, RefreshCw, Circle } from 'lucide-react';

export const BubbleWrapPop: React.FC = () => {
  const TOTAL_BUBBLES = 36;
  const [poppedState, setPoppedState] = useState<boolean[]>(new Array(TOTAL_BUBBLES).fill(false));
  const [totalPoppedCount, setTotalPoppedCount] = useState<number>(0);

  const playPopSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      // Fast chirp frequency
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 + Math.random() * 250, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (_) {}
  };

  const handlePop = (index: number) => {
    if (poppedState[index]) return;

    playPopSound();
    setPoppedState((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    setTotalPoppedCount((c) => c + 1);
  };

  const handleReset = () => {
    setPoppedState(new Array(TOTAL_BUBBLES).fill(false));
  };

  const remaining = poppedState.filter((p) => !p).length;

  return (
    <div className="flex flex-col items-center p-6 rounded-3xl bg-[#F4F9FA] dark:bg-[#182326] border border-[#CFE4E6] dark:border-[#273B40] min-h-[440px]">
      <div className="text-center mb-4">
        <h4 className="text-base font-serif font-bold text-[#2D3748] dark:text-white flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-[#388D90]" />
          Infinite Bubble Wrap
        </h4>
        <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-0.5">
          Tap or click to pop. Tactile tactile release to ease tension anytime.
        </p>
      </div>

      {/* Bubble Wrap Grid */}
      <div className="grid grid-cols-6 gap-2.5 p-4 bg-white/70 dark:bg-[#1F2C30] rounded-2xl border border-[#D5E8EA] dark:border-[#2D4247] shadow-inner mb-5">
        {poppedState.map((popped, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePop(idx)}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              popped
                ? 'bg-transparent border border-dashed border-[#A0C5C7] dark:border-[#385157] opacity-35 scale-90'
                : 'bg-linear-to-tr from-[#9AD3D5] to-[#D5EFF0] dark:from-[#2B565C] dark:to-[#4A7D85] shadow-xs hover:scale-105 active:scale-95 border border-white/60 dark:border-[#528A92]'
            }`}
            aria-label={popped ? 'Popped bubble' : 'Pop bubble'}
          >
            {!popped && (
              <span className="w-2.5 h-2.5 rounded-full bg-white/70 self-start mt-1.5 ml-1.5 pointer-events-none" />
            )}
          </button>
        ))}
      </div>

      {/* Bottom stats and unroll more */}
      <div className="flex items-center justify-between w-full max-w-xs pt-1">
        <div className="text-xs font-medium text-[#467274] dark:text-[#8EBDC0]">
          Total popped: <span className="font-bold">{totalPoppedCount}</span>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#388D90] hover:bg-[#2C7275] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Fresh Sheet</span>
        </button>
      </div>
    </div>
  );
};
