import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Compass,
  Heart
} from 'lucide-react';
import { AppLanguage } from '../../types';
import { playPluckTone, playChime, setRelaxAudioMuted, getRelaxAudioMuted } from './relaxAudio';

interface LightTrailProps {
  language: AppLanguage;
  onExit: () => void;
  onFinishSession: (durationMinutes: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

const TRAIL_PALETTES = [
  '#4ECDC4',
  '#FFD166',
  '#06D6A0',
  '#118AB2',
  '#EF476F',
  '#F4A261',
  '#E76F51',
  '#A0C4FF',
];

export const LightTrailGame: React.FC<LightTrailProps> = ({
  language,
  onExit,
  onFinishSession,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(getRelaxAudioMuted());
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [colorPaletteIdx, setColorPaletteIdx] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number | null>(null);
  const lastSoundTime = useRef(0);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Main Canvas render loop for glowing particle ribbons
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      const width = (canvas.width = canvas.parentElement?.clientWidth || 700);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 480);

      // Deep obsidian void with soft trail persistence fade
      ctx.fillStyle = 'rgba(13, 17, 23, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay * dt;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 16;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const addParticlesAt = (x: number, y: number) => {
    const now = Date.now();
    if (now - lastSoundTime.current > 180) {
      lastSoundTime.current = now;
      playPluckTone(520 + (x % 300), 0.5, 0.03);
    }

    const count = 4;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 5,
        color: TRAIL_PALETTES[Math.floor(Math.random() * TRAIL_PALETTES.length)],
        alpha: 1,
        decay: 0.6 + Math.random() * 0.4,
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addParticlesAt(x, y);
  };

  const handleFinish = () => {
    onFinishSession(Math.max(1, Math.round(sessionSeconds / 60)));
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-xl bg-[#0D1117] flex flex-col justify-between p-4 sm:p-6 select-none border border-[#21262D]">
      {/* Interactive Light Trail Canvas */}
      <div
        className="absolute inset-0 cursor-crosshair touch-none"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerMove}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-xs flex items-center gap-2">
            <span className="text-sm">✨</span>
            <span className="font-serif font-bold text-xs text-white">
              Light Trail
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200">
              Kinetic Glow
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              const newMute = !isMuted;
              setIsMuted(newMute);
              setRelaxAudioMuted(newMute);
            }}
            className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:scale-105 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-teal-300" />}
          </button>

          <button
            onClick={handleFinish}
            className="px-3.5 py-1.5 rounded-full bg-[#1F6FEB] text-white font-bold text-xs shadow-md hover:bg-[#1A5DC8] transition-all cursor-pointer"
          >
            Finish
          </button>
        </div>
      </div>

      {/* Center Gentle Motion Prompt */}
      <div className="relative z-10 text-center pointer-events-none px-4">
        <span className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-teal-100 text-xs font-medium border border-teal-400/20">
          Trace slow, continuous circles with your finger or mouse
        </span>
      </div>

      {/* Bottom Information Strip */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/15 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Kinetic Flow State</h4>
            <p className="text-[11px] text-white/70">
              Unbroken, gentle hand movements induce alpha wave brain rhythms and physical stillness.
            </p>
          </div>
        </div>

        <button
          onClick={() => (particlesRef.current = [])}
          className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-[11px] font-bold hover:bg-white/20 transition-colors cursor-pointer"
        >
          Clear Canvas
        </button>
      </div>
    </div>
  );
};
