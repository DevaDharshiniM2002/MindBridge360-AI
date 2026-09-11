import React from 'react';
import { Calendar, UserCheck, ArrowRight, X, HeartHandshake } from 'lucide-react';

interface PostPracticeBookingPromptProps {
  isOpen: boolean;
  onBookSession: () => void;
  onDismiss: () => void;
}

export const PostPracticeBookingPrompt: React.FC<PostPracticeBookingPromptProps> = ({
  isOpen,
  onBookSession,
  onDismiss,
}) => {
  if (!isOpen) return null;

  return (
    <div className="w-full mb-6 rounded-2xl bg-gradient-to-r from-[#EBF5F5] to-[#F3F9F9] dark:from-[#1E292B] dark:to-[#172224] border border-[#BFDFE0] dark:border-[#2C4A4D] p-4 md:p-5 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2C6E70]/15 dark:bg-[#6CB2B5]/20 flex items-center justify-center text-[#2C6E70] dark:text-[#6CB2B5] shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm md:text-base font-semibold text-[#1F4647] dark:text-[#E2F1F1] font-['Playfair_Display',serif]">
              Great work completing your rehearsal session!
            </h4>
            <p className="text-xs text-[#406869] dark:text-[#A7C8C9] mt-0.5">
              Rehearsing makes it much easier to articulate what you're experiencing. Ready to book a real session with a campus counsellor?
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-[#648B8C] hover:text-[#1F4647] dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Dismiss booking suggestion"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-3 mt-3.5 pl-12">
        <button
          onClick={onBookSession}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2C6E70] hover:bg-[#23585A] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book a Real Session</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-80" />
        </button>

        <button
          onClick={onDismiss}
          className="px-3 py-2 text-xs text-[#527778] dark:text-[#9EC0C2] hover:text-[#1F4647] dark:hover:text-white transition-colors cursor-pointer"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};
