import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, Check, ArrowRight, X } from 'lucide-react';
import { AppLanguage } from '../../types';
import { playChime } from './relaxAudio';

export interface RelaxFeedbackModalProps {
  isOpen: boolean;
  gameId: string;
  gameTitle: string;
  durationMinutes: number;
  language: AppLanguage;
  onClose: () => void;
  onSubmitFeedback: (feedback: 'better' | 'same' | 'stressed', note?: string) => void;
}

export const RelaxFeedbackModal: React.FC<RelaxFeedbackModalProps> = ({
  isOpen,
  gameId,
  gameTitle,
  durationMinutes,
  language,
  onClose,
  onSubmitFeedback,
}) => {
  const [selectedFeeling, setSelectedFeeling] = useState<'better' | 'same' | 'stressed' | null>(null);
  const [briefNote, setBriefNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (feeling: 'better' | 'same' | 'stressed') => {
    setSelectedFeeling(feeling);
    playChime(580, 0.8);
    setSubmitted(true);
    setTimeout(() => {
      onSubmitFeedback(feeling, briefNote);
      setSubmitted(false);
      setSelectedFeeling(null);
      setBriefNote('');
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-[#161E20] w-full max-w-md rounded-3xl border border-[#E8E4D9] dark:border-[#223034] shadow-2xl overflow-hidden p-6 text-center relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#7A756D] hover:bg-[#F0EDE4] dark:hover:bg-[#253235] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!submitted ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-[#4A8B8D]/30 flex items-center justify-center mx-auto text-[#4A8B8D] dark:text-[#63C1C4]">
              <Heart className="w-6 h-6 fill-current opacity-80" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A756D] dark:text-[#9BA3AF]">
                {gameTitle} • {Math.max(1, durationMinutes)} min session
              </span>
              <h3 className="font-serif font-bold text-xl text-[#2D2D2B] dark:text-[#F3F6F8] mt-1">
                {language === 'ta' ? 'இப்போது எப்படி உணர்கிறீர்கள்?' : language === 'tanglish' ? 'How do you feel now?' : 'How do you feel now?'}
              </h3>
              <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF] mt-1 max-w-xs mx-auto">
                {language === 'ta'
                  ? 'உங்கள் கருத்து உங்களுக்கு எந்த பயிற்சிகள் உதவுகின்றன என்பதை அறிய உதவும்.'
                  : 'Your response helps personalize what calming practices support you best.'}
              </p>
            </div>

            {/* 3 Feeling Choices */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <button
                onClick={() => handleSubmit('better')}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/60 transition-all hover:scale-103 cursor-pointer group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🙂</span>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mt-1.5">
                  Better
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400/80">Lighter</span>
              </button>

              <button
                onClick={() => handleSubmit('same')}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/80 dark:hover:bg-amber-950/60 transition-all hover:scale-103 cursor-pointer group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">😐</span>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 mt-1.5">
                  Same
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400/80">Neutral</span>
              </button>

              <button
                onClick={() => handleSubmit('stressed')}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100/80 dark:hover:bg-rose-950/60 transition-all hover:scale-103 cursor-pointer group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">😟</span>
                <span className="text-xs font-bold text-rose-800 dark:text-rose-300 mt-1.5">
                  Still stressed
                </span>
                <span className="text-[10px] text-rose-600 dark:text-rose-400/80">Need care</span>
              </button>
            </div>

            <div className="pt-2 text-left">
              <label className="text-[11px] font-semibold text-[#7A756D] dark:text-[#9BA3AF]">
                Optional personal note:
              </label>
              <input
                type="text"
                value={briefNote}
                onChange={(e) => setBriefNote(e.target.value)}
                placeholder="e.g., Felt my breathing slow down during the ride..."
                className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-[#F9F7F2] dark:bg-[#1E292B] border border-[#E8E4D9] dark:border-[#2F3D42] text-[#2D2D2B] dark:text-white placeholder-[#7A756D]/50 focus:outline-none focus:border-[#4A8B8D]"
              />
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-6 space-y-3"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#2D2D2B] dark:text-[#F3F6F8]">
              Thank you for pausing today.
            </h3>
            <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF] max-w-xs mx-auto">
              Your feedback is saved securely to refine what calming practices support you best.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
