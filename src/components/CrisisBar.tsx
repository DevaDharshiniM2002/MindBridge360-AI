import React, { useState } from 'react';
import { PhoneCall, ShieldAlert, X, ExternalLink, HeartHandshake, Copy, Check } from 'lucide-react';
import { CRISIS_HELPLINES } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';

export const CrisisBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <>
      {/* Persistent subtle, trustworthy banner */}
      <aside 
        id="crisis-persistent-bar"
        aria-label="Crisis Support Bar"
        className="sticky top-0 z-40 w-full bg-[#FAF7F2] border-b border-[#E8E4D9] px-3 sm:px-6 py-2 flex items-center justify-between text-xs text-[#3D3A35] transition-all shadow-xs"
      >
        <div className="flex items-center gap-2.5 max-w-[75%] truncate">
          <span className="text-[10px] font-bold text-[#E98A72] uppercase tracking-wider border border-[#E98A72] px-2 py-0.5 rounded-full shrink-0 bg-[#E98A7215]">
            Crisis Support
          </span>
          <span className="font-medium text-[#2D2D2B] truncate hidden sm:inline">
            Free 24x7 confidential student support & helplines across India
          </span>
          <span className="font-medium text-[#2D2D2B] truncate sm:hidden">
            24x7 Student Helplines
          </span>
        </div>

        <button
          id="open-crisis-directory-btn"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 bg-[#E98A72] hover:bg-[#d67860] active:scale-95 text-white font-medium px-3 py-1 rounded-full text-xs shadow-xs transition-all cursor-pointer"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Need help right now?</span>
        </button>
      </aside>

      {/* Helplines Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2D2D2B]/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl border border-[#E8E4D9] overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-[#4A8B8D] text-white p-5 sm:p-6 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-white/20 rounded-2xl mt-0.5">
                    <HeartHandshake className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold italic tracking-tight">24x7 Free Crisis Support</h2>
                    <p className="text-[#D1E5E6] text-xs mt-1 leading-relaxed">
                      You are never alone. Reach out to trained human listeners anytime — confidential, compassionate, and free.
                    </p>
                  </div>
                </div>
                <button
                  id="close-crisis-modal"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 divide-y divide-[#E8E4D9]">
                {CRISIS_HELPLINES.map((item, idx) => (
                  <div key={idx} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#2D2D2B] text-sm">{item.name}</span>
                        {item.isTollFree && (
                          <span className="text-[10px] uppercase font-bold tracking-wide bg-[#D1E5E6]/60 text-[#1F4647] border border-[#4A8B8D]/30 px-2 py-0.5 rounded-full">
                            Toll-Free
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-[#E98A72] bg-[#E98A7215] px-2.5 py-0.5 rounded-full border border-[#E98A7230]">
                        {item.available}
                      </span>
                    </div>

                    <p className="text-xs text-[#7A756D] leading-relaxed">{item.description}</p>
                    <div className="text-[11px] text-[#7A756D]">
                      <span className="font-medium text-[#3D3A35]">Languages: </span>
                      {item.languages}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${item.number.replace(/[^0-9+]/g, '')}`}
                        className="inline-flex items-center gap-1.5 bg-[#4A8B8D] hover:bg-[#376F71] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xs transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        Call {item.number}
                      </a>
                      <button
                        onClick={() => handleCopy(item.number)}
                        className="inline-flex items-center gap-1 bg-[#F0EDE4] hover:bg-[#E8E4D9] text-[#3D3A35] text-xs px-3 py-2 rounded-full border border-[#E8E4D9] transition-colors cursor-pointer"
                      >
                        {copiedNumber === item.number ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#4A8B8D]" />
                            <span className="text-[#4A8B8D] font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#7A756D]" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer reassurance */}
              <div className="p-4 bg-[#F9F7F2] border-t border-[#E8E4D9] text-center text-xs text-[#7A756D]">
                MindBridge 360 does not record calls. If in immediate medical emergency, please call 112.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
