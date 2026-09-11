import React from 'react';
import { ShieldCheck, Info, Sparkles, Lock, EyeOff, UserCheck, X } from 'lucide-react';

interface HowSignalsWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowSignalsWorkModal: React.FC<HowSignalsWorkModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-[#FDFBF7] dark:bg-[#1E252B] border border-[#E8E2D5] dark:border-[#2D3748] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
        role="dialog"
        aria-labelledby="how-signals-title"
      >
        {/* Header decoration */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A8B8D]/10 dark:bg-[#4A8B8D]/20 flex items-center justify-center text-[#2C6E70] dark:text-[#6CB2B5]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 id="how-signals-title" className="text-lg font-bold text-[#2D3748] dark:text-white font-['Playfair_Display',serif]">
                How "Why Mitra Noticed" Works
              </h3>
              <p className="text-xs text-[#718096] dark:text-[#A0AEC0]">
                100% Transparent • Non-Diagnostic • Student-Exclusive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#A0AEC0] hover:text-[#4A5568] dark:hover:text-white p-1 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="space-y-4 text-sm text-[#4A5568] dark:text-[#CBD5E0] leading-relaxed max-h-[65vh] overflow-y-auto pr-1">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
              <strong className="font-semibold block mb-0.5">Important Safety Boundary:</strong>
              This card is never a diagnosis, medical evaluation, or psychological assessment. It is simply a gentle mirror reflecting observable timeline events and reflection habits.
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-xs tracking-wider uppercase text-[#718096] dark:text-[#A0AEC0]">
              The 4 Observable Signals Mitra Checks:
            </h4>
            
            <div className="grid gap-2.5">
              <div className="p-3 rounded-xl bg-white dark:bg-[#252E38] border border-[#E2E8F0] dark:border-[#2D3748]">
                <div className="font-medium text-xs text-[#2D3748] dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  1. Check-In Frequency Patterns
                </div>
                <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-1 pl-4">
                  If you haven't checked in for 4+ days or your daily streak paused, Mitra notices you might be busy or carrying extra weight.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#252E38] border border-[#E2E8F0] dark:border-[#2D3748]">
                <div className="font-medium text-xs text-[#2D3748] dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  2. Self-Reported Stress Sentiment
                </div>
                <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-1 pl-4">
                  When your recent check-in ratings are high (4/5 or 5/5) or your notes mention feeling tired, Mitra remembers you've had heavy days.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#252E38] border border-[#E2E8F0] dark:border-[#2D3748]">
                <div className="font-medium text-xs text-[#2D3748] dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  3. Academic Calendar Proximity
                </div>
                <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-1 pl-4">
                  If you have mid-terms, final exams, lab vivas, or placement rounds within the next 10 days, Mitra flags this upcoming pressure.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#252E38] border border-[#E2E8F0] dark:border-[#2D3748]">
                <div className="font-medium text-xs text-[#2D3748] dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  4. Late-Night Activity
                </div>
                <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-1 pl-4">
                  Opening the app in the early morning hours (12:30 AM – 5 AM) often correlates with sleep disruption or cramming stress.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <Lock className="w-4 h-4" />
              Strict Confidentiality Guarantee
            </div>
            <ul className="text-xs text-emerald-700 dark:text-emerald-400 space-y-1 pl-5 list-disc">
              <li>These signals are calculated for <strong>your eyes only</strong>.</li>
              <li>They are <strong>never sent</strong> to campus administrators, professors, or parents.</li>
              <li>No one can be disciplined, evaluated, or monitored through this feature.</li>
            </ul>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-[#E8E2D5] dark:border-[#2D3748] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#2C6E70] hover:bg-[#23585A] text-white shadow transition-all cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
