import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Fish,
  Droplets
} from 'lucide-react';
import { AppLanguage } from '../../types';
import { playWaterDrop, playPluckTone, setRelaxAudioMuted, getRelaxAudioMuted } from './relaxAudio';

interface CalmAquariumProps {
  language: AppLanguage;
  onExit: () => void;
  onFinishSession: (durationMinutes: number) => void;
}

interface AquariumFish {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  color: string;
  size: number;
  tailAngle: number;
}

const FISH_COLORS = ['#FF7A59', '#FFAA00', '#4ECDC4', '#FF6B6B', '#FFE66D', '#A8DADC'];

export const CalmAquariumGame: React.FC<CalmAquariumProps> = ({
  language,
  onExit,
  onFinishSession,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(getRelaxAudioMuted());
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; scale: number; opacity: number }>>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  // Aquarium Fish state
  const fishesRef = useRef<AquariumFish[]>(
    Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      x: 100 + Math.random() * 500,
      y: 80 + Math.random() * 320,
      targetX: 100 + Math.random() * 500,
      targetY: 80 + Math.random() * 320,
      speed: 0.6 + Math.random() * 0.8,
      color: FISH_COLORS[i % FISH_COLORS.length],
      size: 14 + Math.random() * 10,
      tailAngle: 0,
    }))
  );

  const bubblesRef = useRef<Array<{ x: number; y: number; radius: number; speed: number }>>(
    Array.from({ length: 22 }).map(() => ({
      x: Math.random() * 800,
      y: Math.random() * 500,
      radius: 2 + Math.random() * 4,
      speed: 0.5 + Math.random() * 1.2,
    }))
  );

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Main Canvas render loop for Aquarium
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

      // Deep tranquil blue aqua gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#1A4D62');
      bgGrad.addColorStop(0.5, '#0E3141');
      bgGrad.addColorStop(1, '#081D27');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Sunlight rays filtering through water surface
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let r = 0; r < 4; r++) {
        ctx.beginPath();
        ctx.moveTo(width * (0.2 + r * 0.2), 0);
        ctx.lineTo(width * (0.3 + r * 0.25), height);
        ctx.lineTo(width * (0.15 + r * 0.2), height);
        ctx.closePath();
        ctx.fill();
      }

      // Aquatic Plants at the bottom
      ctx.strokeStyle = '#2A7B68';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      for (let p = 0; p < 8; p++) {
        const plantX = 40 + p * (width / 8);
        const sway = Math.sin(time * 0.0015 + p) * 16;
        ctx.beginPath();
        ctx.moveTo(plantX, height);
        ctx.quadraticCurveTo(plantX + sway, height - 70, plantX + sway * 1.5, height - 130);
        ctx.stroke();
      }

      // Ambient Bubbles
      bubblesRef.current.forEach((b) => {
        if (isPlaying) {
          b.y -= b.speed;
          if (b.y < -10) {
            b.y = height + 10;
            b.x = Math.random() * width;
          }
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Fishes
      fishesRef.current.forEach((f) => {
        if (isPlaying) {
          // Wander to target
          const dx = f.targetX - f.x;
          const dy = f.targetY - f.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 20 || Math.random() < 0.005) {
            f.targetX = 60 + Math.random() * (width - 120);
            f.targetY = 60 + Math.random() * (height - 120);
          } else {
            f.x += (dx / dist) * f.speed * 40 * dt;
            f.y += (dy / dist) * f.speed * 40 * dt;
          }
          f.tailAngle += 0.15;
        }

        // Draw Fish
        const angle = Math.atan2(f.targetY - f.y, f.targetX - f.x);
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(angle);

        // Fish Body
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, f.size, f.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fish Tail Wiggle
        const tailWag = Math.sin(f.tailAngle) * 0.35;
        ctx.beginPath();
        ctx.moveTo(-f.size * 0.8, 0);
        ctx.lineTo(-f.size * 1.5, -f.size * 0.5 + tailWag * 10);
        ctx.lineTo(-f.size * 1.5, f.size * 0.5 + tailWag * 10);
        ctx.closePath();
        ctx.fill();

        // Eye
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(f.size * 0.5, -f.size * 0.15, f.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(f.size * 0.55, -f.size * 0.15, f.size * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying]);

  // Touch / Click to guide fish and create water ripples
  const handleAquariumTouch = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    playWaterDrop(580, 0.25);
    playPluckTone(520 + Math.random() * 100, 0.8, 0.04);

    // Guide nearest fishes gently towards touch
    fishesRef.current.forEach((f) => {
      f.targetX = x + (Math.random() * 60 - 30);
      f.targetY = y + (Math.random() * 60 - 30);
    });

    setRipples((prev) => [...prev.slice(-6), { id: Date.now(), x, y, scale: 0.2, opacity: 1 }]);
  };

  const handleFinish = () => {
    onFinishSession(Math.max(1, Math.round(sessionSeconds / 60)));
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-xl bg-[#081D27] flex flex-col justify-between p-4 sm:p-6 select-none border border-[#1A4D62]">
      {/* Interactive Aquarium Canvas */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handleAquariumTouch}
        onTouchStart={handleAquariumTouch}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 shadow-xs flex items-center gap-2">
            <span className="text-sm">🐠</span>
            <span className="font-serif font-bold text-xs text-white">
              Calm Aquarium
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-200">
              Interactive Water
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
            className="w-9 h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white hover:scale-105 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-teal-300" />}
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white hover:scale-105 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={handleFinish}
            className="px-3.5 py-1.5 rounded-full bg-[#1A4D62] text-white font-bold text-xs shadow-md hover:bg-[#256680] transition-all cursor-pointer"
          >
            Finish
          </button>
        </div>
      </div>

      {/* Center Subtle Touch Prompt */}
      <div className="relative z-10 text-center pointer-events-none">
        <span className="px-4 py-1.5 rounded-full bg-black/30 backdrop-blur-md text-teal-100 text-xs font-medium border border-teal-400/20">
          Touch or drag across the water to gently guide the school of fish
        </span>
      </div>

      {/* Bottom Information Strip */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/15 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Visual Grounding</h4>
            <p className="text-[11px] text-teal-200/70">
              Watching smooth, natural swimming motions anchors sensory attention when feeling restless.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
