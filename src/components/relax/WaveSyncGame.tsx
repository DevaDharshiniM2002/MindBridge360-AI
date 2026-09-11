import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Waves,
  Wind,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Compass
} from 'lucide-react';
import { AppLanguage } from '../../types';
import { playBreathSweep, playChime, setRelaxAudioMuted, getRelaxAudioMuted } from './relaxAudio';

interface WaveSyncProps {
  language: AppLanguage;
  onExit: () => void;
  onFinishSession: (durationMinutes: number) => void;
}

export const WaveSyncGame: React.FC<WaveSyncProps> = ({
  language,
  onExit,
  onFinishSession,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(getRelaxAudioMuted());
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Wave Breathing Cycle (4.5s Inhale, 4.5s Exhale)
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      const stepMs = 50;
      const durationMs = 4500;
      interval = setInterval(() => {
        setPhaseProgress((prev) => {
          const next = prev + stepMs / durationMs;
          if (next >= 1) {
            setBreathPhase((curr) => {
              const newPhase = curr === 'inhale' ? 'exhale' : 'inhale';
              if (newPhase === 'inhale') {
                setCompletedCycles((c) => c + 1);
                playBreathSweep('inhale', 4.5);
              } else {
                playBreathSweep('exhale', 4.5);
              }
              return newPhase;
            });
            return 0;
          }
          return next;
        });
      }, stepMs);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleFinish = () => {
    onFinishSession(Math.max(1, Math.round(sessionSeconds / 60)));
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-xl bg-linear-to-b from-[#3B6E8C] via-[#2A5770] to-[#16384C] text-white flex flex-col justify-between p-4 sm:p-6 select-none border border-[#4E88AA]">
      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 shadow-xs flex items-center gap-2">
            <span className="text-sm">🌊</span>
            <span className="font-serif font-bold text-xs text-white">
              Wave Sync
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200">
              {completedCycles} Ocean Breaths
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
            className="w-9 h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white hover:scale-105 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white hover:scale-105 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={handleFinish}
            className="px-3.5 py-1.5 rounded-full bg-cyan-700 text-white font-bold text-xs shadow-md hover:bg-cyan-600 transition-all cursor-pointer"
          >
            Finish
          </button>
        </div>
      </div>

      {/* Main Ocean Wave Elevation Visualizer */}
      <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
        {/* Sun / Horizon Glow */}
        <div className="absolute top-12 w-48 h-48 rounded-full bg-amber-300/25 blur-3xl" />

        {/* Dynamic Wave Layer 1 (Distant) */}
        <motion.div
          animate={{
            y: breathPhase === 'inhale' ? [-10, -40] : [-40, -10],
          }}
          transition={{ duration: 4.5, ease: 'easeInOut' }}
          className="absolute bottom-0 left-0 right-0 h-64 opacity-50 pointer-events-none"
        >
          <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
            <path
              fill="#255D7E"
              d="M0,160L80,176C160,192,320,224,480,213.3C640,203,800,149,960,138.7C1120,128,1280,160,1360,176L1440,192L1440,320L0,320Z"
            />
          </svg>
        </motion.div>

        {/* Dynamic Wave Layer 2 (Foreground Swell) */}
        <motion.div
          animate={{
            y: breathPhase === 'inhale' ? [0, -60] : [-60, 0],
            scaleY: breathPhase === 'inhale' ? [1, 1.25] : [1.25, 1],
          }}
          transition={{ duration: 4.5, ease: 'easeInOut' }}
          className="absolute bottom-0 left-0 right-0 h-52 pointer-events-none"
        >
          <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
            <path
              fill="#184863"
              d="M0,192L60,181.3C120,171,240,149,360,160C480,171,600,213,720,208C840,203,960,149,1080,138.7C1200,128,1320,160,1380,176L1440,192L1440,320L0,320Z"
            />
          </svg>
        </motion.div>

        {/* Wave Foam Ripple */}
        <motion.div
          animate={{
            opacity: breathPhase === 'inhale' ? [0.4, 0.9] : [0.9, 0.4],
            scale: breathPhase === 'inhale' ? [1, 1.1] : [1.1, 1],
          }}
          transition={{ duration: 4.5 }}
          className="absolute bottom-28 w-80 h-2 bg-white/40 rounded-full blur-xs pointer-events-none"
        />

        {/* Synchronized Breath Guidance Prompts */}
        <div className="relative z-10 text-center space-y-2">
          <motion.div
            key={breathPhase}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl font-serif font-bold text-white drop-shadow-md flex items-center justify-center gap-2"
          >
            {breathPhase === 'inhale' ? (
              <>
                <Waves className="w-6 h-6 text-cyan-300" />
                <span>Inhale as the wave rises</span>
              </>
            ) : (
              <>
                <Wind className="w-6 h-6 text-cyan-200" />
                <span>Exhale as the wave falls</span>
              </>
            )}
          </motion.div>

          <p className="text-xs text-cyan-100/80 max-w-xs mx-auto">
            Allow the natural rhythm of the ocean to guide your lung capacity effortlessly.
          </p>
        </div>
      </div>

      {/* Bottom Grounding Strip */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/15 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Vagal Tone Synchronization</h4>
            <p className="text-[11px] text-cyan-200/70">
              Matching visual rise-and-fall cycles lowers sympathetic nervous arousal within 90 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
