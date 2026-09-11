import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Feather as FeatherIcon,
  Wind,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Heart,
  Compass
} from 'lucide-react';
import { AppLanguage } from '../../types';
import { playBreathSweep, playChime, setRelaxAudioMuted, getRelaxAudioMuted } from './relaxAudio';

interface FeatherBalanceProps {
  language: AppLanguage;
  onExit: () => void;
  onFinishSession: (durationMinutes: number) => void;
}

export const FeatherBalanceGame: React.FC<FeatherBalanceProps> = ({
  language,
  onExit,
  onFinishSession,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(getRelaxAudioMuted());
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [featherY, setFeatherY] = useState(50); // 0 (top) to 100 (bottom), 50 = balanced center
  const [featherRotation, setFeatherRotation] = useState(0);
  const [stabilityScore, setStabilityScore] = useState(85);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Periodic calm audio
  useEffect(() => {
    let timer: any;
    if (isPlaying && !isMuted) {
      timer = setInterval(() => {
        if (Math.random() > 0.4) {
          playChime(540, 1.5, 0.04);
        }
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isMuted]);

  // Breathing Loop & Feather physics
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      const stepMs = 50;
      let phaseTime = 0;
      const phaseDuration = 4000;

      interval = setInterval(() => {
        phaseTime += stepMs;
        if (phaseTime >= phaseDuration) {
          phaseTime = 0;
          setBreathPhase((p) => {
            const next = p === 'inhale' ? 'exhale' : 'inhale';
            playBreathSweep(next, 4);
            return next;
          });
        }

        // Soft sinusoidal oscillation keeping feather floating gracefully in the sweet spot (40-60%)
        const progress = phaseTime / phaseDuration;
        const targetY = breathPhase === 'inhale' ? 42 + Math.sin(progress * Math.PI) * -8 : 56 + Math.sin(progress * Math.PI) * 8;

        setFeatherY((curr) => curr + (targetY - curr) * 0.05);
        setFeatherRotation(Math.sin(progress * Math.PI * 2) * 12);
        setStabilityScore((s) => Math.min(100, Math.max(70, s + 0.1)));
      }, stepMs);
    }
    return () => clearInterval(interval);
  }, [isPlaying, breathPhase]);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Gentle tap to nudge feather with zero penalty
  const handleGentleTap = () => {
    playChime(620, 0.6);
    setFeatherY((y) => Math.max(30, y - 8));
  };

  const handleFinish = () => {
    onFinishSession(Math.max(1, Math.round(sessionSeconds / 60)));
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-xl bg-linear-to-b from-[#F4EBE1] via-[#EFE5DB] to-[#E2D4C5] dark:from-[#211B16] dark:via-[#1D1713] dark:to-[#16120E] flex flex-col justify-between p-4 sm:p-6 select-none border border-[#DFCFC0] dark:border-[#382E25]">
      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#251E18]/90 backdrop-blur-md border border-[#DFCFC0] dark:border-[#382E25] shadow-xs flex items-center gap-2">
            <span className="text-sm">🪶</span>
            <span className="font-serif font-bold text-xs text-[#3E3024] dark:text-[#F0E6DD]">
              Feather Balance
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              Gentle Flow
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
            className="w-9 h-9 rounded-full bg-white/85 dark:bg-[#251E18]/85 border border-[#DFCFC0] dark:border-[#382E25] flex items-center justify-center text-[#3E3024] dark:text-[#F0E6DD] hover:scale-105 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-[#D97706]" />}
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-full bg-white/85 dark:bg-[#251E18]/85 border border-[#DFCFC0] dark:border-[#382E25] flex items-center justify-center text-[#3E3024] dark:text-[#F0E6DD] hover:scale-105 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={handleFinish}
            className="px-3.5 py-1.5 rounded-full bg-[#B45309] text-white font-bold text-xs shadow-md hover:bg-[#92400E] transition-all cursor-pointer"
          >
            Finish
          </button>
        </div>
      </div>

      {/* Main Center Floating Feather Column Stage */}
      <div
        className="relative flex-1 flex items-center justify-center cursor-pointer"
        onClick={handleGentleTap}
      >
        {/* Soft Warm Air Column Highlight */}
        <div className="absolute w-40 h-full bg-linear-to-b from-transparent via-amber-200/20 dark:via-amber-500/10 to-transparent blur-md rounded-full pointer-events-none" />

        {/* Floating Feather Visual */}
        <motion.div
          style={{
            top: `${featherY}%`,
            transform: `translate(-50%, -50%) rotate(${featherRotation}deg)`,
          }}
          className="absolute left-1/2 cursor-pointer transition-all duration-300 group"
        >
          {/* Feather SVG Illustration */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 filter drop-shadow-md group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Central Quill Stem */}
              <path
                d="M30,85 Q50,50 75,15"
                fill="none"
                stroke="#C29B7F"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Soft Feather Vane (Warm golden peach) */}
              <path
                d="M75,15 Q60,35 40,65 Q35,75 30,85 Q45,70 65,40 Z"
                fill="#E8B298"
                opacity="0.85"
              />
              <path
                d="M75,15 Q70,30 55,55 Q45,70 30,85 Q50,60 70,35 Z"
                fill="#F4D3C2"
                opacity="0.7"
              />
              {/* Gentle barbs detail */}
              <line x1="60" y1="35" x2="72" y2="30" stroke="#FFF" strokeWidth="1" opacity="0.6" />
              <line x1="50" y1="50" x2="62" y2="45" stroke="#FFF" strokeWidth="1" opacity="0.6" />
              <line x1="40" y1="65" x2="52" y2="60" stroke="#FFF" strokeWidth="1" opacity="0.6" />
            </svg>
          </div>
        </motion.div>

        {/* Target Calm Float Zone Guide */}
        <div className="absolute left-1/2 -translate-x-1/2 w-48 h-32 rounded-3xl border-2 border-dashed border-amber-400/40 dark:border-amber-600/30 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-bold text-amber-700/60 dark:text-amber-300/40 tracking-wider">
            Equilibrium Stream
          </span>
        </div>
      </div>

      {/* Rhythmic Breathing Guidance Prompt */}
      <div className="text-center my-2 space-y-1">
        <motion.div
          key={breathPhase}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base sm:text-lg font-serif font-bold text-[#3E3024] dark:text-[#F0E6DD] flex items-center justify-center gap-2"
        >
          {breathPhase === 'inhale' ? (
            <>
              <Wind className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Inhale — The feather rises gently</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-300" />
              <span>Exhale — The feather settles with softness</span>
            </>
          )}
        </motion.div>
        <p className="text-xs text-[#7A6856] dark:text-[#B59F8B]">
          There are no scores or failures. Follow your natural, tranquil breathing pace.
        </p>
      </div>

      {/* Bottom Calm Tip Banner */}
      <div className="bg-white/80 dark:bg-[#251E18]/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-[#DFCFC0] dark:border-[#382E25] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center">
            <Heart className="w-5 h-5 fill-current opacity-80" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#3E3024] dark:text-[#F0E6DD]">
              Soft Breath Regulation
            </h4>
            <p className="text-[11px] text-[#7A6856] dark:text-[#B59F8B]">
              Keeping breath smooth helps reduce physical tension in the jaw, shoulders, and chest.
            </p>
          </div>
        </div>

        <button
          onClick={handleGentleTap}
          className="px-3.5 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-xs font-bold hover:bg-amber-200 transition-colors cursor-pointer"
        >
          Touch Stream
        </button>
      </div>
    </div>
  );
};
