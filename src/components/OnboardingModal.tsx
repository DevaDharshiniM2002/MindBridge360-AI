import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Heart, Sparkles, Languages, Check, ArrowRight } from 'lucide-react';
import { AppLanguage, CompanionConfig } from '../types';
import { I18N_TEXT } from '../data/mockData';
import { CompanionAvatar } from './CompanionAvatar';

interface OnboardingModalProps {
  isOpen?: boolean;
  language?: AppLanguage;
  onLanguageChange?: (lang: AppLanguage) => void;
  onComplete: (openCustomizer: boolean) => void;
  companion?: CompanionConfig;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen = true,
  language = 'en',
  onLanguageChange = (_lang: AppLanguage) => {},
  onComplete,
  companion = { name: 'Mithra', avatar: 'blob', tone: 'gentle', voiceEnabled: true },
}) => {
  if (!isOpen) return null;
  const t = I18N_TEXT[language] || I18N_TEXT.en;
  const safeCompanion = companion || { name: 'Mithra', avatar: 'blob', tone: 'gentle', voiceEnabled: true };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2D2D2B]/50 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#FAF7F2] w-full max-w-lg rounded-[36px] shadow-2xl border border-[#E8E4D9] overflow-hidden flex flex-col my-auto"
      >
        {/* Header Hero */}
        <div className="p-6 sm:p-8 bg-[#D1E5E6]/30 border-b border-[#E8E4D9] text-center relative">
          <div className="flex justify-center mb-3">
            <div className="p-3.5 bg-white rounded-[24px] shadow-2xs border border-[#E8E4D9]">
              <CompanionAvatar avatar={safeCompanion.avatar || 'blob'} emotion="happy" size="lg" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif italic font-normal text-[#2D2D2B] tracking-tight">
            {t.appName}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A756D] mt-1.5 max-w-sm mx-auto leading-relaxed">
            {t.onboardingSub}
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-[#E8E4D9] text-[11px] font-medium text-[#4A8B8D] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#E98A72]" />
              <span>Voice & Text in Tamil, English & Tanglish</span>
            </span>
          </div>
        </div>

        {/* Privacy & Trust Pillars */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-[#1F4647] font-semibold text-sm">
            <ShieldCheck className="w-5 h-5 text-[#4A8B8D]" />
            <span>{t.privacyPledge}</span>
          </div>

          <div className="space-y-2.5">
            {t.privacyPoints.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 bg-white rounded-[20px] border border-[#E8E4D9] shadow-2xs text-xs sm:text-sm text-[#3D3A35] leading-relaxed"
              >
                <div className="mt-0.5 w-4 h-4 rounded-full bg-[#D1E5E6] text-[#4A8B8D] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>{point}</span>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="pt-3 space-y-2.5">
            <button
              id="consent-continue-btn"
              onClick={() => onComplete(true)}
              className="w-full py-4 px-6 bg-[#4A8B8D] hover:bg-[#376F71] active:scale-[0.99] text-white rounded-full font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.customizeCompanion}</span>
              <Sparkles className="w-4 h-4 text-[#F5D5CB]" />
            </button>

            <button
              id="skip-to-app-btn"
              onClick={() => onComplete(false)}
              className="w-full py-3 px-4 bg-transparent hover:bg-[#F0EDE4] text-[#7A756D] hover:text-[#2D2D2B] rounded-full font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{t.skipPersonalization}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#7A756D]" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
