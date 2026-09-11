import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Wind,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Moon,
  Compass,
  Star
} from 'lucide-react';
import { AppLanguage } from '../../types';
import { playBreathSweep, playChime, setRelaxAudioMuted, getRelaxAudioMuted } from './relaxAudio';

interface StarBreathingProps {
  language: AppLanguage;
  onExit: () => void;
  onFinishSession: (durationMinutes: number) => void;
}

interface ConstellationPoint {
  x: number; // percentage (0 to 100)
  y: number;
  label?: string;
}

const CONSTELLATIONS: { name: string; stars: ConstellationPoint[]; connections: [number, number][] }[] = [
  {
    name: 'The Anchor of Calm (அமைதி நங்கூரம்)',
    stars: [
      { x: 50, y: 25, label: 'Breathe' },
      { x: 50, y: 55 },
      { x: 35, y: 65, label: 'Release' },
      { x: 65, y: 65, label: 'Grounded' },
      { x: 30, y: 45 },
      { x: 70, y: 45 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [1, 3],
      [4, 5],
    ],
  },
  {
    name: 'The Lotus of Clarity (தாமரை மலர்)',
    stars: [
      { x: 50, y: 30 },
      { x: 35, y: 50 },
      { x: 65, y: 50 },
      { x: 42, y: 65 },
      { x: 58, y: 65 },
      { x: 50, y: 75, label: 'Peace' },
    ],
    connections: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 5],
      [4, 5],
      [3, 4],
    ],
  },
  {
    name: 'The Gentle Feather (மென்மையான இறகு)',
    stars: [
      { x: 35, y: 25 },
      { x: 45, y: 40 },
      { x: 55, y: 55 },
      { x: 65, y: 70 },
      { x: 40, y: 50 },
      { x: 60, y: 45 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [1, 4],
      [2, 5],
    ],
  },
];

export const StarBreathingGame: React.FC<StarBreathingProps> = ({
  language,
  onExit,
  onFinishSession,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(getRelaxAudioMuted());
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [constellationIdx, setConstellationIdx] = useState(0);

  // Background ambient starry particle field
  const [ambientStars] = useState(() =>
    Array.from({ length: 60 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      twinkleSpeed: 2 + Math.random() * 3,
      baseBrightness: 0.3 + Math.random() * 0.5,
    }))
  );

  // Breathing Loop (4s Inhale, 4s Exhale)
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      const stepMs = 50;
      const durationMs = 4000;
      interval = setInterval(() => {
        setPhaseProgress((p) => {
          const next = p + stepMs / durationMs;
          if (next >= 1) {
            setPhase((curr) => {
              const newPhase = curr === 'inhale' ? 'exhale' : 'inhale';
              if (newPhase === 'inhale') {
                setCompletedCycles((c) => {
                  const newC = c + 1;
                  if (newC % 4 === 0) {
                    setConstellationIdx((idx) => (idx + 1) % CONSTELLATIONS.length);
                    playChime(660, 2);
                  }
                  return newC;
                });
                playBreathSweep('inhale', 4);
              } else {
                playBreathSweep('exhale', 4);
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

  const activeConstellation = CONSTELLATIONS[constellationIdx];
  const constellationUnlockedLines = Math.min(
    activeConstellation.connections.length,
    Math.floor((completedCycles % 5) * 1.5)
  );

  const handleFinish = () => {
    onFinishSession(Math.max(1, Math.round(sessionSeconds / 60)));
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-xl bg-linear-to-b from-[#090C16] via-[#111728] to-[#1A233A] text-white flex flex-col justify-between p-4 sm:p-6 select-none border border-[#2A375A]">
      {/* Dynamic Starlight Field */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {ambientStars.map((s, idx) => (
          <motion.div
            key={idx}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
            }}
            animate={{
              opacity: phase === 'inhale' ? [s.baseBrightness, 1, s.baseBrightness] : [0.9, 0.4, 0.9],
              scale: phase === 'exhale' ? [1, 1.4, 1] : 1,
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          />
        ))}

        {/* Cosmic Nebulae Glow */}
        <motion.div
          animate={{
            scale: phase === 'inhale' ? 1.3 : 1.0,
            opacity: phase === 'inhale' ? 0.35 : 0.15,
          }}
          transition={{ duration: 4, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl"
        />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xs flex items-center gap-2">
            <span className="text-sm">🌌</span>
            <span className="font-serif font-bold text-xs text-white">
              Star Breathing
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200">
              {completedCycles} Breaths
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
            className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:scale-105 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-indigo-300" />}
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:scale-105 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={handleFinish}
            className="px-3.5 py-1.5 rounded-full bg-indigo-600 text-white font-bold text-xs shadow-md hover:bg-indigo-500 transition-all cursor-pointer"
          >
            Finish
          </button>
        </div>
      </div>

      {/* Center Sky & Constellation Visualizer */}
      <div className="relative flex-1 flex flex-col items-center justify-center">
        {/* Constellation SVG Canvas */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80">
          <svg className="w-full h-full">
            {/* Constellation Connecting Lines */}
            {activeConstellation.connections.slice(0, Math.max(1, constellationUnlockedLines)).map(([from, to], i) => {
              const p1 = activeConstellation.stars[from];
              const p2 = activeConstellation.stars[to];
              return (
                <motion.line
                  key={i}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: phase === 'inhale' ? 0.8 : 0.4 }}
                  transition={{ duration: 1.5 }}
                  x1={`${p1.x}%`}
                  y1={`${p1.y}%`}
                  x2={`${p2.x}%`}
                  y2={`${p2.y}%`}
                  stroke="rgba(199, 210, 254, 0.7)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Constellation Stars */}
            {activeConstellation.stars.map((star, idx) => (
              <g key={idx}>
                <motion.circle
                  cx={`${star.x}%`}
                  cy={`${star.y}%`}
                  r={phase === 'inhale' ? 6 : 4}
                  fill="#FFF"
                  filter="drop-shadow(0 0 6px #818CF8)"
                  animate={{
                    r: phase === 'inhale' ? [4, 7, 6] : [6, 4, 4],
                    fill: phase === 'inhale' ? '#FFE8A3' : '#E0E7FF',
                  }}
                  transition={{ duration: 3.8 }}
                />
                {star.label && (
                  <text
                    x={`${star.x}%`}
                    y={`${star.y + 7}%`}
                    textAnchor="middle"
                    fill="rgba(224, 231, 255, 0.85)"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {star.label}
                  </text>
                )}
              </g>
            ))}
          </svg>

          {/* Central Breathing Aura Ring */}
          <motion.div
            animate={{
              scale: phase === 'inhale' ? [0.8, 1.3] : [1.3, 0.8],
              opacity: phase === 'inhale' ? [0.2, 0.6] : [0.6, 0.2],
            }}
            transition={{ duration: 4, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full border border-indigo-400/40 pointer-events-none"
          />
        </div>

        {/* Breathing Visual Pace Prompt */}
        <div className="text-center mt-3 space-y-1">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base sm:text-lg font-serif font-bold text-indigo-100 flex items-center justify-center gap-2"
          >
            {phase === 'inhale' ? (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Inhale slowly — Stars brighten with warmth</span>
              </>
            ) : (
              <>
                <Wind className="w-4 h-4 text-indigo-300" />
                <span>Exhale gently — Stars expand into space</span>
              </>
            )}
          </motion.div>

          <p className="text-xs text-indigo-300/80">
            Forming <span className="font-semibold text-white">{activeConstellation.name}</span>
          </p>
        </div>
      </div>

      {/* Bottom Constellation Information Strip */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/15 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/30 text-indigo-200 flex items-center justify-center">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">{activeConstellation.name}</h4>
            <p className="text-[11px] text-indigo-200/70">
              Each slow breath aligns celestial calmness in your mind.
            </p>
          </div>
        </div>

        <button
          onClick={() => setConstellationIdx((idx) => (idx + 1) % CONSTELLATIONS.length)}
          className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-[11px] font-bold hover:bg-white/20 transition-colors cursor-pointer"
        >
          Next Sky
        </button>
      </div>
    </div>
  );
};
