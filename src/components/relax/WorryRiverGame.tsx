import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Play,
  Pause,
  Waves,
  Heart,
  Droplets
} from 'lucide-react';
import { AppLanguage } from '../../types';
import { playWaterDrop, playChime, setRelaxAudioMuted, getRelaxAudioMuted } from './relaxAudio';

interface WorryRiverProps {
  language: AppLanguage;
  onExit: () => void;
  onFinishSession: (durationMinutes: number) => void;
}

interface RiverBubble {
  id: string;
  text: string;
  x: number; // 0 to 1
  y: number; // 0 (start at top/mid) to 1 (flows downriver)
  speedY: number;
  wobbleOffset: number;
  size: number;
  opacity: number;
  dissolved: boolean;
}

const COMMON_WORRIES = [
  "I'm scared about my placement.",
  "What if I fail the upcoming semester exams?",
  "Overwhelmed by lab records and deadlines.",
  "Feeling disconnected and homesick in hostel.",
  "Family expectations feeling too heavy.",
];

export const WorryRiverGame: React.FC<WorryRiverProps> = ({
  language,
  onExit,
  onFinishSession,
}) => {
  const [inputText, setInputText] = useState('');
  const [bubbles, setBubbles] = useState<RiverBubble[]>([]);
  const [activeBubbleId, setActiveBubbleId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(getRelaxAudioMuted());
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [releasedCount, setReleasedCount] = useState(0);
  const [lastReleasedText, setLastReleasedText] = useState<string | null>(null);

  // Periodic river water trickle sound
  useEffect(() => {
    let timer: any;
    if (!isMuted) {
      timer = setInterval(() => {
        if (Math.random() > 0.4) {
          playWaterDrop(520 + Math.random() * 150, 0.3);
        }
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isMuted]);

  // Session elapsed timer
  useEffect(() => {
    const timer = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Continuous River Animation loop for floating bubbles
  useEffect(() => {
    let animId: number;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      setBubbles((prev) =>
        prev
          .map((b) => {
            const nextY = b.y + b.speedY * dt;
            const nextOpacity = nextY > 0.75 ? Math.max(0, 1 - (nextY - 0.75) / 0.25) : 1;
            return {
              ...b,
              y: nextY,
              wobbleOffset: b.wobbleOffset + dt * 2,
              opacity: nextOpacity,
              dissolved: nextY >= 1,
            };
          })
          .filter((b) => !b.dissolved)
      );

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleCreateBubble = (text: string) => {
    if (!text.trim()) return;
    playWaterDrop(620, 0.4);
    const newBubble: RiverBubble = {
      id: `bubble-${Date.now()}-${Math.random()}`,
      text: text.trim(),
      x: 0.3 + Math.random() * 0.4,
      y: 0.15,
      speedY: 0.08 + Math.random() * 0.04,
      wobbleOffset: Math.random() * Math.PI,
      size: Math.min(180, Math.max(120, text.length * 5 + 60)),
      opacity: 1,
      dissolved: false,
    };

    setBubbles((prev) => [...prev, newBubble]);
    setLastReleasedText(text.trim());
    setReleasedCount((c) => c + 1);
    setInputText('');
    playChime(480, 1.2);
  };

  const handleFinish = () => {
    onFinishSession(Math.max(1, Math.round(sessionSeconds / 60)));
  };

  return (
    <div className="relative w-full h-[540px] sm:h-[600px] rounded-3xl overflow-hidden shadow-xl bg-linear-to-b from-[#87B5B5] via-[#5C9496] to-[#2B5456] flex flex-col justify-between p-4 sm:p-6 select-none border border-[#A2C7C7]/50">
      {/* Animated River Waves Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path
            d="M0,20 Q25,25 50,20 T100,20 L100,100 L0,100 Z"
            fill="#3B6B6D"
            className="animate-pulse"
          />
          <path
            d="M0,45 Q25,40 50,45 T100,45 L100,100 L0,100 Z"
            fill="#2A5254"
            className="opacity-70"
          />
          <path
            d="M0,70 Q30,75 60,70 T100,70 L100,100 L0,100 Z"
            fill="#1E3E40"
            className="opacity-80"
          />
        </svg>

        {/* River Floating Lotus Leaves */}
        <div className="absolute top-1/4 left-10 w-8 h-8 rounded-full bg-emerald-600/60 blur-xs"></div>
        <div className="absolute top-1/2 right-12 w-10 h-10 rounded-full bg-emerald-700/50 blur-xs"></div>
        <div className="absolute bottom-20 left-1/3 w-12 h-12 rounded-full bg-emerald-800/40 blur-xs"></div>
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#162325]/90 backdrop-blur-md border border-[#A2C7C7]/40 shadow-xs flex items-center gap-2">
            <span className="text-sm">🫧</span>
            <span className="font-serif font-bold text-xs text-[#1C3638] dark:text-[#E2F0F0]">
              Worry Bubble River
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200">
              {releasedCount} Released Downstream
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
            className="w-9 h-9 rounded-full bg-white/85 dark:bg-[#162325]/85 border border-[#A2C7C7]/40 flex items-center justify-center text-[#1C3638] dark:text-[#E2F0F0] hover:scale-105 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-[#4A8B8D]" />}
          </button>

          <button
            onClick={handleFinish}
            className="px-3.5 py-1.5 rounded-full bg-[#346062] text-white font-bold text-xs shadow-md hover:bg-[#274B4C] transition-all cursor-pointer"
          >
            Finish
          </button>
        </div>
      </div>

      {/* Center River Stage with Floating Bubbles */}
      <div className="relative flex-1 my-2 overflow-hidden">
        {/* Floating Bubble Items on River */}
        {bubbles.map((b) => {
          const wobbleX = Math.sin(b.wobbleOffset) * 20;
          return (
            <motion.div
              key={b.id}
              style={{
                left: `calc(${b.x * 100}% + ${wobbleX}px)`,
                top: `${b.y * 100}%`,
                opacity: b.opacity,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              onClick={() => {
                playWaterDrop(750, 0.2);
                setBubbles((prev) => prev.filter((item) => item.id !== b.id));
              }}
            >
              <div
                style={{ width: `${b.size}px` }}
                className="p-3 rounded-full bg-white/30 backdrop-blur-md border-2 border-white/70 shadow-[0_8px_32px_rgba(255,255,255,0.25)] text-center text-white text-xs font-semibold hover:scale-105 transition-transform"
              >
                <div className="absolute top-1.5 left-3 w-3 h-1.5 bg-white/80 rounded-full rotate-[-30deg]"></div>
                <p className="line-clamp-2 leading-tight drop-shadow-xs">{b.text}</p>
              </div>
            </motion.div>
          );
        })}

        {/* Calming Central Anchor Message */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md bg-black/25 backdrop-blur-xs p-4 rounded-3xl border border-white/20 text-white space-y-1.5 shadow-lg"
          >
            <h4 className="font-serif italic text-lg sm:text-xl font-bold">
              “You don't have to solve everything right now.”
            </h4>
            <p className="text-[11px] text-[#D1EAEB] leading-relaxed">
              Place any heavy thought into a bubble. Watch it float down the current. (Visualization practice for mental decompression).
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom Input Drawer to Type Worry or Select Quick Prompt */}
      <div className="relative z-10 bg-white/90 dark:bg-[#162325]/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-[#A2C7C7]/40 shadow-xl space-y-2.5">
        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold uppercase text-[#7A756D] dark:text-[#9BA3AF] shrink-0">
            Quick Prompts:
          </span>
          {COMMON_WORRIES.map((w, idx) => (
            <button
              key={idx}
              onClick={() => handleCreateBubble(w)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-[#EAF4F4] dark:bg-[#203638] text-[#2B5456] dark:text-[#CDE5E5] hover:bg-teal-100 dark:hover:bg-[#294648] transition-colors whitespace-nowrap shrink-0 border border-teal-200/50 dark:border-teal-900/40 cursor-pointer"
            >
              {w}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateBubble(inputText);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a worry or thought to float downriver..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#F9F7F2] dark:bg-[#1C2C2E] border border-[#E8E4D9] dark:border-[#2F4447] text-xs text-[#2D2D2B] dark:text-white placeholder-[#7A756D]/60 focus:outline-none focus:border-[#4A8B8D]"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#4A8B8D] disabled:opacity-50 text-white text-xs font-bold shadow-sm hover:bg-[#3B7274] transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Float Bubble</span>
          </button>
        </form>
      </div>
    </div>
  );
};
