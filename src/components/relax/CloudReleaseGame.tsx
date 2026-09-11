import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cloud,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Wind,
  Sun
} from 'lucide-react';
import { AppLanguage } from '../../types';
import { playBreathSweep, playChime, setRelaxAudioMuted, getRelaxAudioMuted } from './relaxAudio';

interface CloudReleaseProps {
  language: AppLanguage;
  onExit: () => void;
  onFinishSession: (durationMinutes: number) => void;
}

interface ThoughtCloud {
  id: string;
  text: string;
  x: number; // percentage (-20 to 120)
  y: number; // percentage (15 to 65)
  speed: number;
  opacity: number;
  scale: number;
}

export const CloudReleaseGame: React.FC<CloudReleaseProps> = ({
  language,
  onExit,
  onFinishSession,
}) => {
  const [inputText, setInputText] = useState('');
  const [clouds, setClouds] = useState<ThoughtCloud[]>([]);
  const [isMuted, setIsMuted] = useState(getRelaxAudioMuted());
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [cloudsReleased, setCloudsReleased] = useState(0);

  useEffect(() => {
    let timer = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Continuous Cloud drifting across the sky
  useEffect(() => {
    let animId: number;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      setClouds((prev) =>
        prev
          .map((c) => {
            const nextX = c.x + c.speed * dt;
            // Fade out as it reaches the right horizon
            const nextOpacity = nextX > 65 ? Math.max(0, 1 - (nextX - 65) / 35) : 1;
            return {
              ...c,
              x: nextX,
              opacity: nextOpacity,
            };
          })
          .filter((c) => c.opacity > 0.02 && c.x < 110)
      );

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleReleaseCloud = (text: string) => {
    if (!text.trim()) return;
    playBreathSweep('exhale', 3);
    playChime(520, 1.4);

    const newCloud: ThoughtCloud = {
      id: `cloud-${Date.now()}`,
      text: text.trim(),
      x: 10,
      y: 25 + Math.random() * 30,
      speed: 4 + Math.random() * 2.5,
      opacity: 1,
      scale: 1,
    };

    setClouds((prev) => [...prev, newCloud]);
    setCloudsReleased((c) => c + 1);
    setInputText('');
  };

  const handleFinish = () => {
    onFinishSession(Math.max(1, Math.round(sessionSeconds / 60)));
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-xl bg-linear-to-b from-[#4F6C8A] via-[#8598A8] to-[#E9C39B] text-white flex flex-col justify-between p-4 sm:p-6 select-none border border-[#7C95AE]">
      {/* Top Sun & Horizon */}
      <div className="absolute top-12 right-16 w-32 h-32 rounded-full bg-[#FFE6B3]/40 blur-2xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 shadow-xs flex items-center gap-2">
            <span className="text-sm">☁️</span>
            <span className="font-serif font-bold text-xs text-white">
              Cloud Release
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-100">
              {cloudsReleased} Released
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newMute = !isMuted;
              setIsMuted(newMute);
              setRelaxAudioMuted(newMute);
            }}
            className="w-9 h-9 rounded-full bg-white/20 border border-white/20 flex items-center justify-center text-white hover:scale-105 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-amber-200" />}
          </button>

          <button
            onClick={handleFinish}
            className="px-3.5 py-1.5 rounded-full bg-[#3B5B7D] text-white font-bold text-xs shadow-md hover:bg-[#2C4866] transition-all cursor-pointer"
          >
            Finish
          </button>
        </div>
      </div>

      {/* Center Open Sky Drift Stage */}
      <div className="relative flex-1 my-2 overflow-hidden">
        {/* Floating Drifting Clouds */}
        {clouds.map((c) => (
          <div
            key={c.id}
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              opacity: c.opacity,
            }}
            className="absolute -translate-y-1/2 transition-opacity duration-300"
          >
            <div className="relative px-6 py-4 rounded-[40px] bg-white/80 dark:bg-white/70 backdrop-blur-md border border-white/90 shadow-lg text-[#2D3748] max-w-xs text-center font-medium text-xs">
              <div className="absolute -top-3 left-6 w-8 h-8 bg-white/80 rounded-full"></div>
              <div className="absolute -top-4 right-8 w-10 h-10 bg-white/80 rounded-full"></div>
              <p className="relative z-10">{c.text}</p>
            </div>
          </div>
        ))}

        {clouds.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
            <div className="text-center bg-black/20 backdrop-blur-xs p-4 rounded-3xl border border-white/20 max-w-sm space-y-1">
              <p className="font-serif italic text-base sm:text-lg font-bold text-white">
                Release your thoughts into the sky
              </p>
              <p className="text-[11px] text-white/80">
                Type anything weighing on your mind below. Watch it drift across the horizon and dissolve.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Input Form & Safe Visualization Notice */}
      <div className="relative z-10 bg-white/20 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/25 shadow-xl space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleReleaseCloud(inputText);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Write a thought (e.g. I am worried about tomorrow)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/80 text-xs text-[#2D2D2B] placeholder-[#7A756D] focus:outline-none focus:ring-2 focus:ring-[#FFE6B3]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#2C4866] text-white text-xs font-bold shadow-sm hover:bg-[#1E354C] transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Wind className="w-4 h-4" />
            <span>Release Cloud</span>
          </button>
        </form>

        <p className="text-[10px] text-white/70 text-center">
          * This is a visualization exercise, not a claim that the worry has been medically treated.
        </p>
      </div>
    </div>
  );
};
