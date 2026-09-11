import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout,
  Wind,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  TreePine,
  Flower2,
  Heart,
  Play,
  Pause,
  CheckCircle2
} from 'lucide-react';
import { AppLanguage } from '../../types';
import { playBreathSweep, playChime, playPluckTone, setRelaxAudioMuted, getRelaxAudioMuted } from './relaxAudio';

interface CalmGardenProps {
  language: AppLanguage;
  onExit: () => void;
  onFinishSession: (durationMinutes: number) => void;
}

interface GardenRecord {
  treesGrown: number;
  flowersBloomed: number;
  totalBreaths: number;
  lastTendedDate: string;
}

export const CalmGardenGame: React.FC<CalmGardenProps> = ({
  language,
  onExit,
  onFinishSession,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(getRelaxAudioMuted());
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0); // 0 to 1
  const [currentGrowthStage, setCurrentGrowthStage] = useState(1); // 1 = sprout, 2 = seedling, 3 = young plant, 4 = blooming bonsai, 5 = flourishing calming tree
  const [completedCycles, setCompletedCycles] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Garden Persistence
  const [gardenData, setGardenData] = useState<GardenRecord>(() => {
    try {
      const saved = localStorage.getItem('mb_calm_garden_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      treesGrown: 2,
      flowersBloomed: 8,
      totalBreaths: 24,
      lastTendedDate: new Date().toISOString().split('T')[0],
    };
  });

  const saveGardenRecord = (newData: GardenRecord) => {
    setGardenData(newData);
    try {
      localStorage.setItem('mb_calm_garden_history', JSON.stringify(newData));
    } catch {}
  };

  // Breathing Loop timer (4s Inhale, 4s Exhale)
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      const stepMs = 50;
      const phaseDurationMs = 4000;
      interval = setInterval(() => {
        setPhaseProgress((prev) => {
          const next = prev + stepMs / phaseDurationMs;
          if (next >= 1) {
            // Flip Phase
            setBreathPhase((curr) => {
              const newPhase = curr === 'inhale' ? 'exhale' : 'inhale';
              if (newPhase === 'inhale') {
                // Completed one full breath cycle
                setCompletedCycles((c) => {
                  const newCount = c + 1;
                  // Advance growth every 2 cycles
                  if (newCount % 2 === 0) {
                    setCurrentGrowthStage((st) => Math.min(5, st + 1));
                    playPluckTone(520 + (newCount % 5) * 60, 1.2);
                  }
                  return newCount;
                });
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

  // Session elapsed timer
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // If reached stage 5, persist tree to garden history
  useEffect(() => {
    if (currentGrowthStage === 5 && completedCycles >= 8) {
      const updated: GardenRecord = {
        ...gardenData,
        treesGrown: gardenData.treesGrown + 1,
        flowersBloomed: gardenData.flowersBloomed + 4,
        totalBreaths: gardenData.totalBreaths + completedCycles,
        lastTendedDate: new Date().toISOString().split('T')[0],
      };
      saveGardenRecord(updated);
    }
  }, [currentGrowthStage, completedCycles]);

  const handleFinish = () => {
    onFinishSession(Math.max(1, Math.round(sessionSeconds / 60)));
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-xl bg-linear-to-b from-[#E2EFEA] via-[#E8F2EC] to-[#CFE0D6] dark:from-[#13221C] dark:via-[#162922] dark:to-[#0F1B16] flex flex-col justify-between p-4 sm:p-6 border border-[#B7D5C6] dark:border-[#223E32] select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#1C2C25]/90 backdrop-blur-md border border-[#B7D5C6] dark:border-[#223E32] shadow-xs flex items-center gap-2">
            <span className="text-sm">🌱</span>
            <span className="font-serif font-bold text-xs text-[#204033] dark:text-[#E2EFEA]">
              Calm Garden
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Stage {currentGrowthStage}/5
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-[#1C2C25]/80 text-[11px] text-[#3D6B57] dark:text-[#95C2AE] font-medium border border-[#B7D5C6]/60">
            <TreePine className="w-3.5 h-3.5" />
            <span>{gardenData.treesGrown} Trees in Sanctuary</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newMute = !isMuted;
              setIsMuted(newMute);
              setRelaxAudioMuted(newMute);
            }}
            className="w-9 h-9 rounded-full bg-white/85 dark:bg-[#1C2C25]/85 border border-[#B7D5C6] dark:border-[#223E32] flex items-center justify-center text-[#204033] dark:text-[#E2EFEA] hover:scale-105 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-[#3D6B57]" />}
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-full bg-white/85 dark:bg-[#1C2C25]/85 border border-[#B7D5C6] dark:border-[#223E32] flex items-center justify-center text-[#204033] dark:text-[#E2EFEA] hover:scale-105 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={handleFinish}
            className="px-3.5 py-1.5 rounded-full bg-[#3D6B57] text-white font-bold text-xs shadow-md hover:bg-[#2F5343] transition-all cursor-pointer"
          >
            Finish
          </button>
        </div>
      </div>

      {/* Main Center Plant Visualizer with Dynamic Breathing Scales */}
      <div className="relative flex-1 flex flex-col items-center justify-center">
        {/* Soft Aura Radiance */}
        <motion.div
          animate={{
            scale: breathPhase === 'inhale' ? 1.25 : 0.95,
            opacity: breathPhase === 'inhale' ? 0.6 : 0.3,
          }}
          transition={{ duration: 3.8, ease: 'easeInOut' }}
          className="absolute w-72 h-72 rounded-full bg-emerald-300/30 dark:bg-emerald-600/20 blur-3xl pointer-events-none"
        />

        {/* Plant Illustration Container */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Animated Botanical SVG */}
          <motion.div
            animate={{
              scale: breathPhase === 'inhale' ? 1.08 + currentGrowthStage * 0.05 : 1 + currentGrowthStage * 0.04,
              rotate: breathPhase === 'exhale' ? [-0.8, 0.8, -0.4, 0] : 0,
              y: breathPhase === 'inhale' ? -8 : 0,
            }}
            transition={{ duration: 4, ease: 'easeInOut' }}
            className="w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center"
          >
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
              {/* Ground & Ceramic Planter Pot */}
              <ellipse cx="100" cy="175" rx="42" ry="10" fill="#2E4A3B" opacity="0.3" />
              <path
                d="M68,145 L132,145 L124,180 L76,180 Z"
                fill="#C89674"
                stroke="#A87455"
                strokeWidth="2"
              />
              <ellipse cx="100" cy="145" rx="32" ry="6" fill="#754731" />

              {/* Stage 1: Sprout */}
              {currentGrowthStage >= 1 && (
                <g className="transition-all duration-700">
                  <path
                    d="M100,145 Q98,125 100,115"
                    fill="none"
                    stroke="#588157"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M100,115 Q88,105 85,115 Q95,118 100,115"
                    fill="#74A870"
                    stroke="#588157"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M100,118 Q112,108 115,118 Q105,121 100,118"
                    fill="#74A870"
                    stroke="#588157"
                    strokeWidth="1.5"
                  />
                </g>
              )}

              {/* Stage 2: Seedling Branches */}
              {currentGrowthStage >= 2 && (
                <g className="transition-all duration-700">
                  <path
                    d="M100,115 Q102,90 98,75"
                    fill="none"
                    stroke="#4F772D"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M99,95 Q80,85 75,98 Q90,102 99,95"
                    fill="#8BBF7A"
                    stroke="#4F772D"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M99,90 Q120,80 125,92 Q110,98 99,90"
                    fill="#8BBF7A"
                    stroke="#4F772D"
                    strokeWidth="1.5"
                  />
                </g>
              )}

              {/* Stage 3: Young Foliage Canopy */}
              {currentGrowthStage >= 3 && (
                <g className="transition-all duration-700">
                  <circle cx="75" cy="75" r="16" fill="#588157" opacity="0.9" />
                  <circle cx="125" cy="75" r="16" fill="#588157" opacity="0.9" />
                  <circle cx="100" cy="60" r="20" fill="#6EA368" />
                </g>
              )}

              {/* Stage 4 & 5: Blooming Bonsai / Calming Blossom Tree */}
              {currentGrowthStage >= 4 && (
                <g className="transition-all duration-700">
                  {/* Blossom Dots */}
                  <circle cx="85" cy="55" r="5" fill="#F8B4B4" />
                  <circle cx="115" cy="55" r="5" fill="#F8B4B4" />
                  <circle cx="100" cy="45" r="6" fill="#FFAAA6" />
                  <circle cx="70" cy="70" r="4.5" fill="#FDE2E2" />
                  <circle cx="130" cy="70" r="4.5" fill="#FDE2E2" />
                  <circle cx="100" cy="45" r="2" fill="#FFE28A" />
                </g>
              )}

              {/* Stage 5: Calming Spirit Birds / Dew Sparkles */}
              {currentGrowthStage === 5 && (
                <g className="animate-pulse">
                  <circle cx="60" cy="50" r="2.5" fill="#FFE699" />
                  <circle cx="140" cy="45" r="3" fill="#FFE699" />
                  <circle cx="100" cy="30" r="3.5" fill="#FFF" />
                </g>
              )}
            </svg>
          </motion.div>

          {/* Rhythmic Breathing Guide Label */}
          <div className="text-center mt-2 space-y-1">
            <motion.div
              key={breathPhase}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-base sm:text-lg font-serif font-bold text-[#204033] dark:text-[#E2EFEA]"
            >
              {breathPhase === 'inhale' ? (
                <span className="flex items-center justify-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                  <Wind className="w-4 h-4" />
                  {language === 'ta' ? 'மூச்சை உள்ளிழுக்கவும் (Inhale) — மரம் வளர்கிறது' : 'Inhale Gently — The plant grows'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5 text-teal-800 dark:text-teal-300">
                  <Sparkles className="w-4 h-4" />
                  {language === 'ta' ? 'மூச்சை வெளியிடவும் (Exhale) — இலைகள் அசைகின்றன' : 'Exhale Slowly — Leaves sway in peace'}
                </span>
              )}
            </motion.div>

            <p className="text-xs text-[#3D6B57] dark:text-[#95C2AE]">
              {completedCycles} breath cycles completed • {5 - currentGrowthStage > 0 ? `${5 - currentGrowthStage} stages to full bloom` : 'Sanctuary flourishing'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Garden History Drawer / Stats Banner */}
      <div className="bg-white/80 dark:bg-[#1C2C25]/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-[#B7D5C6] dark:border-[#223E32] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-[#3D6B57] dark:text-[#95C2AE] flex items-center justify-center">
            <Flower2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#204033] dark:text-[#E2EFEA]">
              Your Mind Garden Sanctuary
            </h4>
            <p className="text-[11px] text-[#3D6B57] dark:text-[#95C2AE]">
              Return daily anytime you need a breath. Your sanctuary stays here.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentGrowthStage(1);
              setCompletedCycles(0);
            }}
            className="px-3 py-1.5 rounded-xl border border-[#B7D5C6] dark:border-[#2F4D3F] text-[11px] font-bold text-[#3D6B57] dark:text-[#95C2AE] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Plant New Seed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
