import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Layers,
  Heart
} from 'lucide-react';
import { AppLanguage } from '../../types';
import { playPluckTone, playChime, setRelaxAudioMuted, getRelaxAudioMuted } from './relaxAudio';

interface FocusFlowProps {
  language: AppLanguage;
  onExit: () => void;
  onFinishSession: (durationMinutes: number) => void;
}

interface PatternCard {
  id: number;
  shape: 'circle' | 'lotus' | 'diamond' | 'sun' | 'clover';
  color: string;
  rotation: number;
}

const SHAPES: Array<PatternCard['shape']> = ['circle', 'lotus', 'diamond', 'sun', 'clover'];
const PALETTES = ['#4A8B8D', '#E98A72', '#588157', '#8A5FB2', '#D97706'];

export const FocusFlowGame: React.FC<FocusFlowProps> = ({
  language,
  onExit,
  onFinishSession,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(getRelaxAudioMuted());
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [round, setRound] = useState(1);
  const [targetPattern, setTargetPattern] = useState<PatternCard>({
    id: 1,
    shape: 'lotus',
    color: '#4A8B8D',
    rotation: 0,
  });
  const [choices, setChoices] = useState<PatternCard[]>([]);
  const [matchedSuccess, setMatchedSuccess] = useState(false);
  const [completedMatches, setCompletedMatches] = useState(0);

  // Generate gentle new pattern round
  const generateNewRound = () => {
    const targetShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const targetColor = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    const targetRot = (Math.floor(Math.random() * 4)) * 45;

    const target: PatternCard = {
      id: 999,
      shape: targetShape,
      color: targetColor,
      rotation: targetRot,
    };
    setTargetPattern(target);

    // Create 3 choices (1 exact match, 2 subtle variations)
    const exactMatch: PatternCard = { ...target, id: 1 };
    const decoy1: PatternCard = {
      id: 2,
      shape: SHAPES.find((s) => s !== targetShape) || 'circle',
      color: targetColor,
      rotation: targetRot,
    };
    const decoy2: PatternCard = {
      id: 3,
      shape: targetShape,
      color: PALETTES.find((c) => c !== targetColor) || '#E98A72',
      rotation: (targetRot + 45) % 360,
    };

    const shuffled = [exactMatch, decoy1, decoy2].sort(() => Math.random() - 0.5);
    setChoices(shuffled);
    setMatchedSuccess(false);
  };

  useEffect(() => {
    generateNewRound();
  }, []);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleSelectChoice = (choice: PatternCard) => {
    if (choice.shape === targetPattern.shape && choice.color === targetPattern.color) {
      // Gentle match chime
      playPluckTone(580, 0.8);
      playChime(680, 1.2);
      setMatchedSuccess(true);
      setCompletedMatches((c) => c + 1);

      setTimeout(() => {
        setRound((r) => r + 1);
        generateNewRound();
      }, 900);
    } else {
      // Gentle soft reminder, no penalty
      playPluckTone(340, 0.4, 0.03);
    }
  };

  const renderShapeIcon = (shape: PatternCard['shape'], color: string, rotation: number) => {
    return (
      <div
        style={{ transform: `rotate(${rotation}deg)` }}
        className="w-16 h-16 flex items-center justify-center transition-transform duration-500"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          {shape === 'circle' && (
            <circle cx="50" cy="50" r="36" fill={color} opacity="0.85" />
          )}
          {shape === 'lotus' && (
            <path
              d="M50,15 C65,40 85,60 85,75 C85,88 70,88 50,88 C30,88 15,88 15,75 C15,60 35,40 50,15 Z"
              fill={color}
              opacity="0.85"
            />
          )}
          {shape === 'diamond' && (
            <polygon points="50,15 85,50 50,85 15,50" fill={color} opacity="0.85" />
          )}
          {shape === 'sun' && (
            <g fill={color} opacity="0.85">
              <circle cx="50" cy="50" r="22" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => (
                <rect
                  key={i}
                  x="47"
                  y="12"
                  width="6"
                  height="12"
                  rx="3"
                  transform={`rotate(${ang} 50 50)`}
                />
              ))}
            </g>
          )}
          {shape === 'clover' && (
            <g fill={color} opacity="0.85">
              <circle cx="35" cy="40" r="16" />
              <circle cx="65" cy="40" r="16" />
              <circle cx="50" cy="65" r="16" />
            </g>
          )}
        </svg>
      </div>
    );
  };

  const handleFinish = () => {
    onFinishSession(Math.max(1, Math.round(sessionSeconds / 60)));
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-xl bg-linear-to-b from-[#F5F2EB] via-[#EDE9DE] to-[#E2DDCF] dark:from-[#181F22] dark:via-[#151B1D] dark:to-[#0F1416] flex flex-col justify-between p-4 sm:p-6 select-none border border-[#DDD7C8] dark:border-[#253034]">
      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#1E272A]/90 backdrop-blur-md border border-[#DDD7C8] dark:border-[#253034] shadow-xs flex items-center gap-2">
            <span className="text-sm">🧩</span>
            <span className="font-serif font-bold text-xs text-[#2D2D2B] dark:text-[#F3F6F8]">
              Focus Flow
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {completedMatches} Calm Matches
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
            className="w-9 h-9 rounded-full bg-white/85 dark:bg-[#1E272A]/85 border border-[#DDD7C8] dark:border-[#253034] flex items-center justify-center text-[#2D2D2B] dark:text-[#F3F6F8] hover:scale-105 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-[#4A8B8D]" />}
          </button>

          <button
            onClick={handleFinish}
            className="px-3.5 py-1.5 rounded-full bg-[#4A8B8D] text-white font-bold text-xs shadow-md hover:bg-[#3B7274] transition-all cursor-pointer"
          >
            Finish
          </button>
        </div>
      </div>

      {/* Main Center Pattern Focus Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center space-y-6">
        {/* Target Harmony Pattern Card */}
        <div className="flex flex-col items-center space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#7A756D] dark:text-[#9BA3AF]">
            Target Harmonious Pattern
          </span>
          <motion.div
            key={round}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 rounded-3xl bg-white dark:bg-[#1E272A] border-2 border-[#4A8B8D]/40 shadow-lg flex items-center justify-center relative overflow-hidden"
          >
            {renderShapeIcon(targetPattern.shape, targetPattern.color, targetPattern.rotation)}
            {matchedSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-emerald-500/20 backdrop-blur-xs flex items-center justify-center text-emerald-600 dark:text-emerald-300"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* 3 Choices to Match */}
        <div className="flex items-center gap-3 sm:gap-5">
          {choices.map((c) => (
            <motion.button
              key={c.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectChoice(c)}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white dark:bg-[#1E272A] border border-[#DDD7C8] dark:border-[#2F3D42] shadow-sm hover:border-[#4A8B8D] flex items-center justify-center cursor-pointer transition-all hover:shadow-md"
            >
              {renderShapeIcon(c.shape, c.color, c.rotation)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom Cognitive Redirection Strip */}
      <div className="bg-white/80 dark:bg-[#1E272A]/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-[#DDD7C8] dark:border-[#253034] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-[#4A8B8D] dark:text-[#63C1C4] flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
              Attention Redirection
            </h4>
            <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF]">
              Gentle pattern recognition soothes racing brain loops without stressful countdown clocks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
