import React, { useState, useEffect } from 'react';
import { Music, Sparkles, Volume2, Heart } from 'lucide-react';

export const RhythmTapCalm: React.FC = () => {
  const [targetActive, setTargetActive] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const playTone = (frequency: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (_) {}
  };

  // Slow, relaxing 60 BPM ambient bell rhythm pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setTargetActive(true);
      playTone(392); // G4 bell tone

      setTimeout(() => {
        setTargetActive(false);
      }, 900); // Generous forgiving window
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  const handleTap = () => {
    if (targetActive) {
      playTone(523.25); // C5 harmonic tone
      setPulseCount((c) => c + 1);
      setFeedback('Harmonious & Centered');
    } else {
      playTone(330); // Soft supportive E4 tone
      setFeedback('Flow with the bell');
    }

    setTimeout(() => {
      setFeedback(null);
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-between p-6 rounded-3xl bg-[#FAF6F3] dark:bg-[#1E2325] border border-[#EBDED3] dark:border-[#353D42] min-h-[440px]">
      <div className="text-center mb-4">
        <h4 className="text-base font-serif font-bold text-[#2D3748] dark:text-white flex items-center justify-center gap-2">
          <Music className="w-4 h-4 text-[#C27D56]" />
          Calm Rhythm Tap
        </h4>
        <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-0.5">
          Tap the singing bowl when the ring aligns. Forgiving tempo, zero score loss.
        </p>
      </div>

      {/* Target Drum / Bowl */}
      <div className="relative flex items-center justify-center my-6">
        {/* Expanding pulsating ring */}
        <div
          className={`absolute w-52 h-52 rounded-full border-2 border-[#C27D56]/40 transition-all duration-1000 ${
            targetActive ? 'scale-110 opacity-80' : 'scale-75 opacity-20'
          }`}
        />

        <button
          type="button"
          onClick={handleTap}
          className={`w-36 h-36 rounded-full bg-linear-to-tr from-[#C27D56] to-[#E9A986] shadow-lg flex flex-col items-center justify-center text-white transition-all transform active:scale-95 cursor-pointer ${
            targetActive ? 'ring-4 ring-amber-300 scale-105' : 'scale-100'
          }`}
        >
          <Sparkles className="w-6 h-6 mb-1 opacity-90" />
          <span className="text-xs font-bold tracking-wider uppercase">
            {targetActive ? 'Tap Now' : 'Listen'}
          </span>
        </button>
      </div>

      {/* Real-time gentle affirmation */}
      <div className="text-center h-8 flex items-center justify-center">
        {feedback ? (
          <span className="text-xs font-semibold text-[#A05C35] dark:text-[#E8A57E] animate-in fade-in">
            {feedback}
          </span>
        ) : (
          <span className="text-xs text-[#718096] dark:text-[#A0AEC0]">
            Paced taps: <strong className="text-[#2D3748] dark:text-white">{pulseCount}</strong> • Relax into the tone
          </span>
        )}
      </div>

      <div className="text-[11px] text-[#A08E82] dark:text-[#80766F] pt-2">
        Synchronizing your touch to a steady rhythm calms sympathetic nervous arousal.
      </div>
    </div>
  );
};
