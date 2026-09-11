import React, { useState } from 'react';
import { Send, Wind, Sparkles } from 'lucide-react';

interface FloatingWord {
  id: number;
  text: string;
  x: number; // %
  size: number; // rem
  opacity: number;
}

export const WordCloudRelease: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [floatingWords, setFloatingWords] = useState<FloatingWord[]>([]);

  const handleRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newWord: FloatingWord = {
      id: Date.now(),
      text: inputText.trim(),
      x: 20 + Math.random() * 60, // between 20% and 80%
      size: 0.9 + Math.random() * 0.4,
      opacity: 1,
    };

    setFloatingWords((prev) => [...prev, newWord]);
    setInputText('');

    // Remove word after animation completes (5s)
    setTimeout(() => {
      setFloatingWords((prev) => prev.filter((w) => w.id !== newWord.id));
    }, 5000);
  };

  return (
    <div className="flex flex-col items-center justify-between p-6 rounded-3xl bg-linear-to-b from-[#F0F6F7] to-[#E3EFF1] dark:from-[#172327] dark:to-[#111B1E] border border-[#CDE3E6] dark:border-[#273B40] min-h-[440px]">
      <div className="text-center mb-3">
        <h4 className="text-base font-serif font-bold text-[#2D3748] dark:text-white flex items-center justify-center gap-2">
          <Wind className="w-4 h-4 text-[#3A8E91]" />
          Thought Release Breeze
        </h4>
        <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-0.5">
          Type any stress, worry, or rumination, then release it to dissolve harmlessly into the sky.
        </p>
      </div>

      {/* Floating Canvas Area */}
      <div className="relative w-full max-w-sm h-60 bg-white/60 dark:bg-[#1C2C30] rounded-2xl border border-[#D3E7E9] dark:border-[#2E4348] overflow-hidden my-3 shadow-inner">
        {floatingWords.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-[#7FA5A8] dark:text-[#5D8083] italic">
            Quiet open sky... release whatever you carry
          </div>
        )}

        {floatingWords.map((word) => (
          <div
            key={word.id}
            className="absolute font-serif text-[#327173] dark:text-[#A0CCD0] font-medium pointer-events-none transition-all duration-5000 ease-out"
            style={{
              left: `${word.x}%`,
              bottom: '10%',
              transform: 'translate(-50%, -180px)',
              opacity: 0,
              fontSize: `${word.size}rem`,
            }}
          >
            {word.text}
          </div>
        ))}
      </div>

      {/* Input release bar */}
      <form onSubmit={handleRelease} className="flex items-center gap-2 w-full max-w-sm">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g., Fear of tomorrow's viva, feeling behind..."
          className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-[#202F33] border border-[#CDE3E6] dark:border-[#2F4449] text-[#2D3748] dark:text-white placeholder-[#94B3B5] focus:outline-none focus:ring-2 focus:ring-[#3A8E91]"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-4 py-2.5 rounded-xl bg-[#3A8E91] hover:bg-[#2C7477] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>Release</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
