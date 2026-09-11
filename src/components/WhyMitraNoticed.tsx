import React, { useState } from 'react';
import { Sparkles, Calendar, MessageSquare, ArrowRight, X, Info, Shield, Clock, Heart } from 'lucide-react';
import { WellbeingSignal, WellbeingEvaluation } from '../services/wellbeingSignals';
import { HowSignalsWorkModal } from './HowSignalsWorkModal';

interface WhyMitraNoticedProps {
  evaluation: WellbeingEvaluation;
  onPracticeTalking: (context: string) => void;
  onTalkToMitra: () => void;
  onDismiss: () => void;
}

export const WhyMitraNoticed: React.FC<WhyMitraNoticedProps> = ({
  evaluation,
  onPracticeTalking,
  onTalkToMitra,
  onDismiss,
}) => {
  const [isExplainerOpen, setIsExplainerOpen] = useState<boolean>(false);

  if (!evaluation.shouldSurface || evaluation.signals.length === 0) {
    return null;
  }

  const getSignalBadgeColor = (severity: string) => {
    return severity === 'notable'
      ? 'bg-amber-100/80 text-amber-900 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700/50'
      : 'bg-[#EBF4F4] text-[#1F4647] border-[#BCDCDC] dark:bg-[#203436] dark:text-[#A7D7D9] dark:border-[#355B5E]';
  };

  return (
    <>
      <div 
        className="w-full mb-6 rounded-2xl bg-gradient-to-br from-[#FCFBF8] via-[#FAF6EE] to-[#F4EFE3] dark:from-[#1D242C] dark:via-[#192027] dark:to-[#151C22] border border-[#E8E1D1] dark:border-[#2D3945] p-5 md:p-6 shadow-sm relative overflow-hidden transition-all animate-in fade-in slide-in-from-top-3 duration-300"
        id="why-mitra-noticed-panel"
      >
        {/* Decorative subtle background accents */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-36 h-36 rounded-full bg-[#4A8B8D]/5 dark:bg-[#4A8B8D]/10 pointer-events-none blur-2xl"></div>

        {/* Card Header */}
        <div className="flex items-start justify-between gap-4 mb-3.5 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2C6E70]/10 dark:bg-[#6CB2B5]/20 flex items-center justify-center text-[#2C6E70] dark:text-[#6CB2B5] shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2C6E70] dark:text-[#6CB2B5]">
                  Why Mitra Noticed
                </span>
                <button
                  type="button"
                  onClick={() => setIsExplainerOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-[#718096] dark:text-[#A0AEC0] hover:text-[#2C6E70] dark:hover:text-[#6CB2B5] underline underline-offset-2 transition-colors cursor-pointer"
                  title="Click to see how these signals are calculated"
                >
                  <Info className="w-3 h-3" />
                  <span>How this works</span>
                </button>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-[#2D3748] dark:text-white font-['Playfair_Display',serif]">
                A gentle check-in based on your recent rhythms
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="text-[#A0AEC0] hover:text-[#4A5568] dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Dismiss check-in notice"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Observable Signals List */}
        <div className="space-y-2 mb-4 relative z-10">
          {evaluation.signals.map((signal) => (
            <div
              key={signal.id}
              className="flex items-start gap-3 p-2.5 md:p-3 rounded-xl bg-white/80 dark:bg-[#232C36]/80 border border-[#E5DFD1] dark:border-[#2D3748] text-xs transition-shadow hover:shadow-xs"
            >
              <div className="mt-0.5">
                <span className={`inline-block px-2 py-0.5 rounded-md font-semibold border text-[10px] tracking-wide ${getSignalBadgeColor(signal.severity)}`}>
                  Signal
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[#2D3748] dark:text-white">
                  {signal.label}
                </div>
                <div className="text-[#596677] dark:text-[#B3C0CD] mt-0.5 leading-relaxed">
                  {signal.explanation} {signal.detail && <span className="opacity-80">({signal.detail})</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Strict Non-Diagnostic Reassurance Banner */}
        <div className="p-3 rounded-xl bg-[#F0ECE1]/70 dark:bg-[#1A222A]/70 border border-[#E0D7C3] dark:border-[#2B3540] text-xs text-[#524B40] dark:text-[#C5BEB3] flex items-center gap-2 mb-5 relative z-10">
          <Shield className="w-4 h-4 text-[#2C6E70] dark:text-[#6CB2B5] shrink-0" />
          <p className="italic">
            "This isn't a diagnosis — just a pattern we noticed. You know yourself best."
          </p>
        </div>

        {/* Action Buttons: 3 transparent pathways */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 relative z-10">
          {/* Action 1: Practice talking about this (Bridges into Practice Sandbox with context) */}
          <button
            type="button"
            onClick={() => onPracticeTalking(evaluation.suggestedPracticeTopic)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C6E70] hover:bg-[#23585A] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer group"
          >
            <MessageSquare className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span>Practice talking about this</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Action 2: Talk to Mitra (Opens existing Mitra chat) */}
          <button
            type="button"
            onClick={onTalkToMitra}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#26303B] hover:bg-[#F3EFE6] dark:hover:bg-[#2F3B48] text-[#2D3748] dark:text-white border border-[#DCD5C3] dark:border-[#384553] text-xs font-medium transition-all cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-[#2C6E70] dark:text-[#6CB2B5]" />
            <span>Talk to Mitra</span>
          </button>

          {/* Action 3: Not now (Soft dismiss) */}
          <button
            type="button"
            onClick={onDismiss}
            className="px-3 py-2.5 text-xs text-[#718096] dark:text-[#9FB1C1] hover:text-[#2D3748] dark:hover:text-white transition-colors cursor-pointer"
          >
            Not now
          </button>
        </div>
      </div>

      {/* Explainer Modal */}
      <HowSignalsWorkModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
      />
    </>
  );
};
