import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Volume2, Check, ArrowLeft, Heart, ShieldCheck, Shuffle, VolumeX } from 'lucide-react';
import { CompanionAvatarType, CompanionTone, CompanionConfig, AppLanguage } from '../types';
import { CompanionAvatar } from './CompanionAvatar';
import { speakText, stopSpeaking } from '../utils/speechService';

interface CompanionCustomizerProps {
  isOpen?: boolean;
  initialConfig?: CompanionConfig;
  currentConfig?: CompanionConfig;
  language?: AppLanguage;
  onSave: (config: CompanionConfig) => void;
  onCancel?: () => void;
  onClose?: () => void;
}

const AVATAR_OPTIONS: { id: CompanionAvatarType; label: string; desc: string }[] = [
  { id: 'mithra', label: 'Mithra (மித்ரா)', desc: 'Warm, gentle, empathetic female companion' },
  { id: 'mithran', label: 'Mithran (மித்ரன்)', desc: 'Calm, friendly, supportive male companion' },
  { id: 'blob', label: 'Soft Blob', desc: 'Squishy, empathetic & calming companion' },
  { id: 'otter', label: 'River Otter', desc: 'Gentle, playful, and loyal listener' },
  { id: 'sprout', label: 'Sprout', desc: 'Grounded, peaceful, and blossoming' },
  { id: 'owl', label: 'Little Owl', desc: 'Thoughtful, calm, and reassuring' },
];

const TONE_OPTIONS: { id: CompanionTone; label: string; desc: string; emoji: string }[] = [
  {
    id: 'gentle',
    label: 'Gentle & Empathetic',
    desc: 'Soft, slow, deeply validating — like a quiet cup of warm chai.',
    emoji: '🍵',
  },
  {
    id: 'upbeat',
    label: 'Upbeat & Cheerful',
    desc: 'Encouraging, optimistic, and energizing when you need momentum.',
    emoji: '✨',
  },
  {
    id: 'straight-talking',
    label: 'Straight-Talking',
    desc: 'Pragmatic, grounded, action-oriented with zero fluff.',
    emoji: '🎯',
  },
];

const NAME_SUGGESTIONS = ['Mithra', 'Aarav', 'Kavi', 'Tara', 'Brio', 'Anbu', 'Sahara', 'Neel'];

export const CompanionCustomizer: React.FC<CompanionCustomizerProps> = ({
  isOpen = true,
  initialConfig,
  currentConfig,
  language = 'en',
  onSave,
  onCancel,
  onClose,
}) => {
  if (isOpen === false) return null;

  const baseConfig = currentConfig || initialConfig || {
    name: 'Mithra',
    avatar: 'blob',
    tone: 'gentle',
    voiceEnabled: true,
  };

  const handleDismiss = onCancel || onClose || (() => {});

  const [name, setName] = useState(baseConfig.name || 'Mithra');
  const [avatar, setAvatar] = useState<CompanionAvatarType>(baseConfig.avatar || 'blob');
  const [tone, setTone] = useState<CompanionTone>(baseConfig.tone || 'gentle');
  const [voiceEnabled, setVoiceEnabled] = useState(baseConfig.voiceEnabled ?? true);
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  const handleRandomizeName = () => {
    const random = NAME_SUGGESTIONS[Math.floor(Math.random() * NAME_SUGGESTIONS.length)];
    setName(random);
  };

  const handlePlayVoiceSample = () => {
    if (isPlayingSample) {
      stopSpeaking();
      setIsPlayingSample(false);
      return;
    }

    let text = '';
    const companionName = name || 'Mithra';

    if (language === 'ta') {
      text =
        tone === 'gentle'
          ? `வணக்கம்! நான் ${companionName}. கல்லூரி அழுத்தமோ அல்லது மன அமைதிக்கான உரையாடலோ, நான் எப்போதும் உங்களுடன் இருக்கிறேன்.`
          : tone === 'upbeat'
          ? `வணக்கம்! நான் ${companionName}! இன்றைய நாளை புத்துணர்ச்சியுடன் தொடங்க தயாரா?`
          : `வணக்கம்! நான் ${companionName}. உங்கள் வேலைகளை எளிதாக திட்டமிட்டு முடிப்போம்.`;
    } else if (language === 'tanglish') {
      text =
        tone === 'gentle'
          ? `Vanakkam! Naan unga friend ${companionName}. College life konjam heavy-aa irundhaalum, take a slow breath. Naan unga kooda irukken.`
          : tone === 'upbeat'
          ? `Hey! Naan ${companionName}! Inniki day-ah jolly-aa and positive-aa start pannalaama?`
          : `Hey! Naan ${companionName}. College workloads-ah step-by-step-aa solve pannuvom.`;
    } else {
      text =
        tone === 'gentle'
          ? `Hello! I'm ${companionName}. I'm here to listen whenever college gets a little too loud.`
          : tone === 'upbeat'
          ? `Hey there! I'm ${companionName}! Ready to take on today, one small step at a time?`
          : `Hey! I'm ${companionName}. Let's break down whatever is on your plate cleanly.`;
    }

    setIsPlayingSample(true);
    speakText({
      text,
      language: (language || 'en') as AppLanguage,
      tone,
      avatar,
      onStart: () => setIsPlayingSample(true),
      onEnd: () => setIsPlayingSample(false),
      onError: () => setIsPlayingSample(false),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim() || 'Mithra',
      avatar,
      tone,
      voiceEnabled,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2D2D2B]/50 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#FAF7F2] w-full max-w-xl rounded-[36px] shadow-2xl border border-[#E8E4D9] overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#E8E4D9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleDismiss}
              className="p-2 rounded-full hover:bg-[#F0EDE4] text-[#7A756D] hover:text-[#2D2D2B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-serif italic font-normal text-xl sm:text-2xl text-[#2D2D2B]">
                Meet Your AI Companion
              </h2>
              <p className="text-xs text-[#7A756D]">
                Personalize your supportive cartoon companion
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-[#D1E5E6] text-[#1F4647] border border-[#4A8B8D]/20 rounded-full">
            100% Optional
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 overflow-y-auto space-y-6">
          {/* Avatar Preview Spotlight */}
          <div className="flex flex-col items-center justify-center bg-[#D1E5E6]/30 p-6 rounded-[28px] border border-[#4A8B8D]/20 text-center">
            <CompanionAvatar avatar={avatar} emotion="happy" size="xl" />
            <div className="mt-3.5">
              <span className="font-serif italic font-bold text-xl text-[#2D2D2B]">{name || 'Mithra'}</span>
              <p className="text-xs text-[#4A8B8D] font-medium mt-0.5">
                {TONE_OPTIONS.find((t) => t.id === tone)?.label}
              </p>
            </div>

            {/* Voice Preview Button */}
            <button
              type="button"
              onClick={handlePlayVoiceSample}
              className="mt-3.5 inline-flex items-center gap-2 bg-white hover:bg-[#F0EDE4] active:scale-95 text-[#1F4647] border border-[#E8E4D9] px-4 py-2 rounded-full text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingSample ? 'text-[#4A8B8D] animate-pulse' : 'text-[#4A8B8D]'}`} />
              <span>{isPlayingSample ? 'Listening to voice...' : 'Preview Voice Greeting'}</span>
            </button>
          </div>

          {/* 1. Pick an Avatar */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D]">
              1. Choose Character Form
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AVATAR_OPTIONS.map((opt) => {
                const isSelected = avatar === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAvatar(opt.id)}
                    className={`p-3.5 rounded-[24px] border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#D1E5E6]/40 border-[#4A8B8D] ring-2 ring-[#4A8B8D]/20 shadow-xs'
                        : 'bg-white border-[#E8E4D9] hover:border-[#4A8B8D]/40 hover:bg-[#F0EDE4]/30'
                    }`}
                  >
                    <CompanionAvatar avatar={opt.id} emotion="happy" size="md" isAnimated={isSelected} />
                    <span className="mt-2 text-xs font-bold text-[#2D2D2B]">{opt.label}</span>
                    <span className="text-[10px] text-[#7A756D] leading-tight mt-0.5 line-clamp-2">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Choose a Name */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D]">
                2. Companion Name
              </label>
              <button
                type="button"
                onClick={handleRandomizeName}
                className="text-xs text-[#4A8B8D] hover:text-[#376F71] font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" /> Suggest name
              </button>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mithra, Aarav, Kavi, Tara"
              maxLength={20}
              className="w-full px-4 py-3 bg-white border border-[#E8E4D9] rounded-xl text-sm font-medium text-[#2D2D2B] focus:outline-hidden focus:ring-2 focus:ring-[#4A8B8D]"
            />
          </div>

          {/* 3. Personality Tone */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D]">
              3. Personality & Conversation Tone
            </label>
            <div className="space-y-2.5">
              {TONE_OPTIONS.map((opt) => {
                const isSelected = tone === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTone(opt.id)}
                    className={`w-full p-3.5 rounded-[22px] border flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#D1E5E6]/40 border-[#4A8B8D] ring-2 ring-[#4A8B8D]/20 shadow-xs'
                        : 'bg-white border-[#E8E4D9] hover:border-[#4A8B8D]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl p-2 bg-[#F9F7F2] rounded-[16px] border border-[#E8E4D9]">
                        {opt.emoji}
                      </span>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-[#2D2D2B]">{opt.label}</div>
                        <div className="text-xs text-[#7A756D] mt-0.5">{opt.desc}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#4A8B8D] text-white flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Non-Impersonation Ethical Guarantee Banner */}
          <div className="p-4 bg-[#F0EDE4] rounded-[20px] border border-[#E8E4D9] text-xs text-[#7A756D] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#4A8B8D] shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong className="text-[#2D2D2B]">Ethical Companion Guarantee:</strong> This is purely an original cartoon personality layer on your AI friend. It is never modeled after, nor allowed to impersonate, any real human person.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3.5 px-4 bg-[#F0EDE4] hover:bg-[#E8E4D9] text-[#3D3A35] rounded-full font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel / Keep Default
            </button>
            <button
              type="submit"
              className="flex-2 py-3.5 px-5 bg-[#4A8B8D] hover:bg-[#376F71] active:scale-[0.99] text-white rounded-full font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#F5D5CB]" />
              <span>Save & Meet {name || 'Mithra'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
