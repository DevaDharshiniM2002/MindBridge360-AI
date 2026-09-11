import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, Wind, Volume2, VolumeX } from 'lucide-react';

type BreathingPattern = '4-7-8' | 'box' | 'calm-equal';

export const BreathingBubble: React.FC = () => {
  const [pattern, setPattern] = useState<BreathingPattern>('4-7-8');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(4);
  const [cycleCount, setCycleCount] = useState<number>(0);

  const getDurations = (p: BreathingPattern) => {
    switch (p) {
      case '4-7-8':
        return { inhale: 4, hold1: 7, exhale: 8, hold2: 0 };
      case 'box':
        return { inhale: 4, hold1: 4, exhale: 4, hold2: 4 };
      case 'calm-equal':
        return { inhale: 5, hold1: 0, exhale: 5, hold2: 0 };
    }
  };

  useEffect(() => {
    if (!isActive) return;

    const durations = getDurations(pattern);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev > 1) return prev - 1;

        // Transition to next phase
        if (phase === 'Inhale') {
          if (durations.hold1 > 0) {
            setPhase('Hold');
            return durations.hold1;
          } else {
            setPhase('Exhale');
            return durations.exhale;
          }
        } else if (phase === 'Hold') {
          setPhase('Exhale');
          return durations.exhale;
        } else if (phase === 'Exhale') {
          if (durations.hold2 > 0) {
            setPhase('Rest');
            return durations.hold2;
          } else {
            setPhase('Inhale');
            setCycleCount((c) => c + 1);
            return durations.inhale;
          }
        } else {
          // Rest -> Inhale
          setPhase('Inhale');
          setCycleCount((c) => c + 1);
          return durations.inhale;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase, pattern]);

  const handlePatternChange = (newP: BreathingPattern) => {
    setPattern(newP);
    setPhase('Inhale');
    setSecondsRemaining(getDurations(newP).inhale);
  };

  // Calculate bubble scale based on phase
  const getBubbleScale = () => {
    if (!isActive) return 'scale-90 opacity-60';
    if (phase === 'Inhale') return 'scale-125 transition-transform duration-4000 ease-out';
    if (phase === 'Hold' || phase === 'Rest') return 'scale-120 transition-transform duration-1000 ease-linear';
    if (phase === 'Exhale') return 'scale-75 transition-transform duration-6000 ease-in-out';
    return 'scale-90';
  };

  return (
    <div className="flex flex-col items-center justify-between p-6 rounded-3xl bg-linear-to-b from-[#F5F9F9] to-[#E9F3F3] dark:from-[#192427] dark:to-[#131D20] border border-[#CFE5E6] dark:border-[#2C4146] min-h-[440px]">
      {/* Pattern Selector */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        {[
          { id: '4-7-8', label: '4-7-8 Relax', desc: 'Inhale 4s • Hold 7s • Exhale 8s' },
          { id: 'box', label: 'Box Breathing', desc: '4s • 4s • 4s • 4s' },
          { id: 'calm-equal', label: 'Equal Flow', desc: '5s In • 5s Out' },
        ].map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handlePatternChange(p.id as BreathingPattern)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              pattern === p.id
                ? 'bg-[#2C6E70] text-white shadow-xs'
                : 'bg-white/80 dark:bg-[#202E32] text-[#4A6466] dark:text-[#9EC4C6] hover:bg-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* The Breathing Bubble */}
      <div className="relative flex items-center justify-center my-8 w-64 h-64">
        {/* Outer glowing ripple ring */}
        <div
          className={`absolute inset-0 rounded-full bg-[#4A8B8D]/20 dark:bg-[#4A8B8D]/30 blur-xl ${
            isActive ? 'animate-pulse' : ''
          }`}
        />

        {/* Dynamic Bubble */}
        <div
          className={`w-48 h-48 rounded-full bg-linear-to-tr from-[#31797B] via-[#4A8B8D] to-[#80C8CB] shadow-lg flex flex-col items-center justify-center text-white relative z-10 transition-all ${getBubbleScale()}`}
        >
          <Wind className="w-6 h-6 opacity-80 mb-1 animate-bounce" />
          <span className="text-xl font-bold tracking-wider uppercase font-serif">
            {phase}
          </span>
          <span className="text-3xl font-extrabold mt-1 font-mono">
            {secondsRemaining}s
          </span>
        </div>
      </div>

      {/* Cycle count & guidance */}
      <div className="text-center space-y-1 mb-4">
        <p className="text-xs font-medium text-[#4D7173] dark:text-[#9BC1C3]">
          Cycles completed: <span className="font-bold">{cycleCount}</span> • Follow the gentle pulse
        </p>
        <p className="text-[11px] text-[#719193] dark:text-[#6D8A8C]">
          No rush, no goals — only your natural breath.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2C6E70] hover:bg-[#225759] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isActive ? 'Pause Flow' : 'Resume Flow'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setPhase('Inhale');
            setSecondsRemaining(getDurations(pattern).inhale);
            setCycleCount(0);
          }}
          className="p-2.5 rounded-xl bg-white dark:bg-[#233135] hover:bg-stone-100 text-[#4D7173] dark:text-[#9BC1C3] border border-[#CFE5E6] dark:border-[#2C4146] transition-all cursor-pointer"
          title="Reset"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
