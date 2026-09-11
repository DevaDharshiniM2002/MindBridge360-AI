import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  PhoneCall,
  UserCheck,
  Heart,
  RotateCcw,
  Smile,
  Play,
  Square,
  Mic,
  MicOff,
  Phone,
  Radio,
  Languages,
} from 'lucide-react';
import { CompanionConfig, AppLanguage, CheckinData, CompanionTone, CompanionAvatarType } from '../types';
import { CompanionAvatar } from './CompanionAvatar';
import { CompanionVoiceCallModal } from './CompanionVoiceCallModal';
import {
  speakText,
  stopSpeaking,
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  detectTextLanguage,
  RecognizerInstance,
} from '../utils/speechService';
import { I18N_TEXT } from '../data/mockData';

interface CompanionChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  companion: CompanionConfig;
  language?: AppLanguage;
  latestCheckin?: CheckinData | null;
  onOpenCounsellorBooking: () => void;
  onUpdateVoicePref?: (enabled: boolean) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isCrisisAlert?: boolean;
}

export const CompanionChatDrawer: React.FC<CompanionChatDrawerProps> = ({
  isOpen,
  onClose,
  companion = { name: 'Mithra', avatar: 'blob', tone: 'gentle', voiceEnabled: true },
  language = 'en',
  latestCheckin,
  onOpenCounsellorBooking,
  onUpdateVoicePref,
}) => {
  const safeCompanion = companion || { name: 'Mithra', avatar: 'blob', tone: 'gentle', voiceEnabled: true };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingMsgId, setCurrentSpeakingMsgId] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(safeCompanion.voiceEnabled ?? true);
  const [companionEmotion, setCompanionEmotion] = useState<
    'neutral' | 'happy' | 'concerned' | 'celebrating' | 'listening' | 'breathing'
  >('happy');

  // Voice Chat States
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [micLanguage, setMicLanguage] = useState<'en' | 'ta' | 'tanglish'>('en');
  const [interimSpokenText, setInterimSpokenText] = useState('');
  const [micError, setMicError] = useState<string | null>(null);

  const recognizerRef = useRef<RecognizerInstance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = I18N_TEXT[language] || I18N_TEXT.en;

  // Sync voice preference
  useEffect(() => {
    setVoiceEnabled(safeCompanion.voiceEnabled ?? true);
  }, [safeCompanion.voiceEnabled]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognizerRef.current) {
        recognizerRef.current.abort();
      }
    };
  }, []);

  // Initialize welcoming message
  useEffect(() => {
    const welcomeMsg = `Hi there! I'm ${safeCompanion.name || 'Mithra'}. You can type or voice chat with me in English, தமிழ் (Tamil), or Tanglish anytime! How is your day feeling?`;

    setMessages((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: 'welcome-1',
            role: 'assistant',
            content: welcomeMsg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      }
      return prev;
    });
  }, [safeCompanion.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, interimSpokenText]);

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    onUpdateVoicePref?.(next);
    if (!next) {
      stopSpeaking();
      setIsSpeaking(false);
      setCurrentSpeakingMsgId(null);
    }
  };

  const playSpeech = (text: string, msgId?: string) => {
    if (isSpeaking && currentSpeakingMsgId === msgId) {
      stopSpeaking();
      setIsSpeaking(false);
      setCurrentSpeakingMsgId(null);
      return;
    }

    stopSpeaking();
    setIsSpeaking(true);
    if (msgId) setCurrentSpeakingMsgId(msgId);

    // Auto-detect language of the response to ensure proper pronunciation
    const detectedLang = detectTextLanguage(text);

    speakText({
      text,
      language: detectedLang as AppLanguage,
      tone: safeCompanion.tone as CompanionTone,
      avatar: safeCompanion.avatar as CompanionAvatarType,
      onStart: () => {
        setIsSpeaking(true);
        if (msgId) setCurrentSpeakingMsgId(msgId);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setCurrentSpeakingMsgId(null);
      },
      onError: () => {
        setIsSpeaking(false);
        setCurrentSpeakingMsgId(null);
      },
    });
  };

  // Start in-bar speech recognition
  const handleToggleMic = () => {
    if (isRecordingMic) {
      // Stop recording
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsRecordingMic(false);
      if (interimSpokenText.trim()) {
        const textToSend = interimSpokenText.trim();
        setInterimSpokenText('');
        handleSend(textToSend);
      }
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setMicError('Speech recognition is not supported on this browser.');
      setTimeout(() => setMicError(null), 3000);
      return;
    }

    stopSpeaking();
    setMicError(null);
    setInterimSpokenText('');
    setIsRecordingMic(true);

    if (recognizerRef.current) {
      recognizerRef.current.abort();
    }

    const recognizer = createSpeechRecognizer({
      language: micLanguage,
      onStart: () => {
        setIsRecordingMic(true);
      },
      onResult: (text: string, isFinal: boolean) => {
        setInterimSpokenText(text);
        if (isFinal && text.trim().length > 3) {
          // If finalized, put into input box or auto-send
          setInput(text);
        }
      },
      onError: (err: any) => {
        console.warn('Mic error:', err);
        setIsRecordingMic(false);
        if (err.error === 'not-allowed' || err.error === 'permission-denied') {
          setMicError('Microphone permission required.');
          setTimeout(() => setMicError(null), 4000);
        }
      },
      onEnd: () => {
        setIsRecordingMic(false);
      },
    });

    recognizerRef.current = recognizer;
    recognizer?.start();
  };

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend || input || interimSpokenText).trim();
    if (!messageText || isLoading) return;

    if (isRecordingMic) {
      if (recognizerRef.current) recognizerRef.current.stop();
      setIsRecordingMic(false);
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setInterimSpokenText('');
    setIsLoading(true);
    setCompanionEmotion('listening');

    // Auto-detect language of user message
    const detectedLang = detectTextLanguage(messageText);

    // Basic distress keyword detection for gentle safety escalation
    const distressWords = [
      'kill myself',
      'suicide',
      'end my life',
      'die',
      'hopeless',
      'cannot take this',
      'no reason to live',
      'self harm',
      'hurt myself',
      'uyirai maayithu',
      'tharkolai',
      'saaganum',
    ];
    const hasCriticalDistress = distressWords.some((w) =>
      messageText.toLowerCase().includes(w)
    );

    try {
      const res = await fetch('/api/companion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
          companion: safeCompanion,
          language: detectedLang,
          recentCheckin: latestCheckin,
        }),
      });

      const data = await res.json();
      let assistantText = data.reply;

      if (!assistantText) {
        if (detectedLang === 'ta') {
          assistantText = `நான் உங்களை கவனிக்கிறேன். நிதானமாக ஒரு மூச்சு விடுங்கள். இந்த செமஸ்டர் அழுத்தத்தை நீங்கள் தனியாக சுமக்க வேண்டியதில்லை.`;
        } else if (detectedLang === 'tanglish') {
          assistantText = `Naan unga kooda irukken. Take a slow breath. Indha college pressure-ah neenga thaania carry panna vendam nanba.`;
        } else {
          assistantText = `I'm listening. Take a gentle breath. You don't have to carry this entire semester by yourself.`;
        }
      }

      const botId = `bot-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: botId,
        role: 'assistant',
        content: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCrisisAlert: hasCriticalDistress,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setCompanionEmotion(hasCriticalDistress ? 'concerned' : 'happy');

      if (voiceEnabled) {
        playSpeech(assistantText, botId);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackText =
        detectedLang === 'ta'
          ? `நான் உங்களுடன் இருக்கிறேன். நிதானமாக இருங்கள். உங்களுக்கு எது அமைதி தரும் என்று சொல்லுங்கள்.`
          : detectedLang === 'tanglish'
          ? `Naan unga kooda irukken. Don't worry, relax-aa pesuvom. Inniki enna aachu?`
          : `I'm right here with you. Take things one moment at a time. What would bring you a tiny bit of peace right now?`;

      const fallbackMsg: ChatMessage = {
        id: `bot-fallback-${Date.now()}`,
        role: 'assistant',
        content: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setCompanionEmotion('concerned');
    } finally {
      setIsLoading(false);
    }
  };

  const getQuickPrompts = () => {
    return [
      { label: 'தேர்வு பயம் (Tamil) 📚', prompt: 'தேர்வு நெருங்குவதால் மிகவும் பதற்றமாக இருக்கிறது. மனதை அமைதிப்படுத்துவது எப்படி?' },
      { label: 'Exam tension (Tanglish) ⚡', prompt: 'Enakku exam tension romba irukku, mind full-aa stress aagudhu. Eppadi calm aaguradhu?' },
      { label: 'Hostel homesick (Tanglish) 🏠', prompt: 'Inniki veetoda ninaipaa irukku, hostel-la lonely-aa feel panren.' },
      { label: '2-min breathing (English) 🌬️', prompt: 'Can you guide me through a quick, soothing breathing exercise?' },
      { label: 'Syllabus overload (English) ⏳', prompt: 'My syllabus feels impossible to complete in time. How do I prioritize without burning out?' },
    ];
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-[#2D2D2B]/50 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          className="bg-[#FAF7F2] w-full max-w-md h-full shadow-2xl flex flex-col border-l border-[#E8E4D9]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-white border-b border-[#E8E4D9] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-[#D1E5E6]/50 rounded-[18px] border border-[#4A8B8D]/20">
                <CompanionAvatar avatar={safeCompanion.avatar} emotion={companionEmotion} size="sm" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif italic font-bold text-[#2D2D2B] text-base">
                    {safeCompanion.name}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#D1E5E6] text-[#1F4647] rounded-full">
                    Voice & Text
                  </span>
                </div>
                <p className="text-xs text-[#7A756D]">
                  Tamil • English • Tanglish
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Voice Call Launcher Button */}
              <button
                onClick={() => {
                  stopSpeaking();
                  setIsVoiceCallOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4A8B8D] hover:bg-[#376F71] text-white rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer"
                title="Start Live Voice Call"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Voice Call</span>
              </button>

              {/* Speaker Audio Output Toggle Button */}
              <button
                onClick={handleToggleVoice}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  voiceEnabled
                    ? 'bg-[#D1E5E6] border-[#4A8B8D]/30 text-[#1F4647]'
                    : 'bg-[#F0EDE4] border-[#E8E4D9] text-[#7A756D]'
                }`}
                title={voiceEnabled ? 'Voice output is ON' : 'Voice output is OFF'}
              >
                {voiceEnabled ? (
                  <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse text-[#4A8B8D]' : ''}`} />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  stopSpeaking();
                  setIsSpeaking(false);
                  setCurrentSpeakingMsgId(null);
                  if (recognizerRef.current) recognizerRef.current.abort();
                  onClose();
                }}
                className="p-2 text-[#7A756D] hover:text-[#2D2D2B] rounded-full hover:bg-[#F0EDE4] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Voice Active Status Banner */}
          {isSpeaking && (
            <div className="bg-[#D1E5E6]/60 border-b border-[#4A8B8D]/20 px-4 py-2 flex items-center justify-between text-xs text-[#1F4647]">
              <div className="flex items-center gap-2">
                <span className="flex gap-0.5 items-end h-3.5">
                  <span className="w-1 bg-[#4A8B8D] rounded-full animate-bounce [animation-duration:0.6s]"></span>
                  <span className="w-1 bg-[#4A8B8D] rounded-full animate-bounce [animation-duration:0.4s]"></span>
                  <span className="w-1 bg-[#4A8B8D] rounded-full animate-bounce [animation-duration:0.8s]"></span>
                </span>
                <span className="font-semibold">{safeCompanion.name} is speaking...</span>
              </div>
              <button
                onClick={() => {
                  stopSpeaking();
                  setIsSpeaking(false);
                  setCurrentSpeakingMsgId(null);
                }}
                className="text-[11px] font-bold text-[#A84832] bg-white px-2.5 py-0.5 rounded-full border border-[#E98A72]/30 shadow-2xs hover:bg-[#F5D5CB] cursor-pointer"
              >
                Stop Voice
              </button>
            </div>
          )}

          {/* Live Mic Recording Banner */}
          {isRecordingMic && (
            <div className="bg-[#F5D5CB]/70 border-b border-[#E98A72]/40 px-4 py-2.5 flex items-center justify-between text-xs text-[#A84832]">
              <div className="flex items-center gap-2 flex-1 mr-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E98A72] animate-ping shrink-0" />
                <span className="font-semibold">
                  Listening ({micLanguage === 'ta' ? 'தமிழ்' : micLanguage === 'tanglish' ? 'Tanglish' : 'English'}):
                </span>
                <span className="italic text-[#2D2D2B] truncate">
                  {interimSpokenText || 'Speak now...'}
                </span>
              </div>
              <button
                onClick={handleToggleMic}
                className="text-[11px] font-bold text-white bg-[#E98A72] hover:bg-[#D97962] px-3 py-1 rounded-full shadow-2xs cursor-pointer shrink-0"
              >
                Done
              </button>
            </div>
          )}

          {micError && (
            <div className="bg-[#F5D5CB] border-b border-[#E98A72] px-4 py-1.5 text-xs text-[#A84832] text-center font-medium">
              {micError}
            </div>
          )}

          {/* Message Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isThisSpeaking = isSpeaking && currentSpeakingMsgId === msg.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-[24px] px-4 py-3 text-xs sm:text-sm leading-relaxed relative group ${
                      msg.role === 'user'
                        ? 'bg-[#4A8B8D] text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-[#2D2D2B] border border-[#E8E4D9] rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Audio Listen Button on Assistant Messages */}
                    {msg.role === 'assistant' && (
                      <div className="mt-2.5 pt-2 border-t border-[#E8E4D9]/60 flex items-center justify-between text-[11px] text-[#7A756D]">
                        <button
                          type="button"
                          onClick={() => playSpeech(msg.content, msg.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            isThisSpeaking
                              ? 'bg-[#4A8B8D] text-white shadow-xs'
                              : 'bg-[#F0EDE4] hover:bg-[#D1E5E6] text-[#1F4647]'
                          }`}
                        >
                          {isThisSpeaking ? (
                            <>
                              <Square className="w-3 h-3 fill-current" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-[#4A8B8D]" />
                              <span>Listen Voice</span>
                            </>
                          )}
                        </button>

                        <span className="text-[10px] text-[#7A756D]">{msg.timestamp}</span>
                      </div>
                    )}

                    {/* Distress Guidance Card inside message if flagged */}
                    {msg.isCrisisAlert && (
                      <div className="mt-3 p-3.5 bg-[#F5D5CB]/40 border border-[#E98A72]/40 rounded-[18px] space-y-2 text-[#A84832]">
                        <p className="font-semibold text-xs flex items-center gap-1.5 text-[#A84832]">
                          <Heart className="w-3.5 h-3.5 text-[#E98A72] fill-[#E98A72]" />
                          Please let a caring human support you:
                        </p>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={onOpenCounsellorBooking}
                            className="w-full py-2 px-3 bg-[#E98A72] hover:bg-[#D97962] text-white rounded-full font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Connect with Campus Counsellor
                          </button>
                          <a
                            href="tel:14416"
                            className="w-full py-2 px-3 bg-white hover:bg-[#F5D5CB]/30 text-[#A84832] border border-[#E98A72]/40 rounded-full font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            Call Tele-MANAS (14416)
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <span className="text-[10px] text-[#7A756D] mt-1 px-1.5">{msg.timestamp}</span>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-[#7A756D] text-xs pl-2">
                <CompanionAvatar avatar={safeCompanion.avatar} emotion="listening" size="sm" />
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#4A8B8D] rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-[#4A8B8D] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#4A8B8D] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span className="text-xs text-[#7A756D]">{safeCompanion.name} is reflecting...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Multilingual Prompts Carousel */}
          <div className="px-3.5 py-2.5 bg-[#F0EDE4] border-t border-[#E8E4D9] overflow-x-auto flex gap-2 no-scrollbar">
            {getQuickPrompts().map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.prompt)}
                className="shrink-0 text-xs bg-white hover:bg-[#D1E5E6]/40 active:scale-95 text-[#3D3A35] hover:text-[#1F4647] border border-[#E8E4D9] hover:border-[#4A8B8D]/40 px-3 py-1.5 rounded-full shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Spoken Language Mode Selector & Input Bar */}
          <div className="p-3 bg-white border-t border-[#E8E4D9] space-y-2">
            {/* Voice Language Pills */}
            <div className="flex items-center justify-between px-1 text-xs">
              <span className="text-[11px] text-[#7A756D] flex items-center gap-1 font-medium">
                <Radio className="w-3 h-3 text-[#4A8B8D]" /> Voice Spoken Mode:
              </span>
              <div className="inline-flex bg-[#F0EDE4] rounded-full p-0.5 border border-[#E8E4D9]">
                <button
                  type="button"
                  onClick={() => {
                    setMicLanguage('en');
                    if (isRecordingMic) {
                      if (recognizerRef.current) recognizerRef.current.abort();
                      setIsRecordingMic(false);
                    }
                  }}
                  className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full transition-all cursor-pointer ${
                    micLanguage === 'en'
                      ? 'bg-[#4A8B8D] text-white shadow-2xs'
                      : 'text-[#7A756D] hover:text-[#2D2D2B]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMicLanguage('ta');
                    if (isRecordingMic) {
                      if (recognizerRef.current) recognizerRef.current.abort();
                      setIsRecordingMic(false);
                    }
                  }}
                  className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full transition-all cursor-pointer ${
                    micLanguage === 'ta'
                      ? 'bg-[#4A8B8D] text-white shadow-2xs'
                      : 'text-[#7A756D] hover:text-[#2D2D2B]'
                  }`}
                >
                  தமிழ் (Tamil)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMicLanguage('tanglish');
                    if (isRecordingMic) {
                      if (recognizerRef.current) recognizerRef.current.abort();
                      setIsRecordingMic(false);
                    }
                  }}
                  className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full transition-all cursor-pointer ${
                    micLanguage === 'tanglish'
                      ? 'bg-[#4A8B8D] text-white shadow-2xs'
                      : 'text-[#7A756D] hover:text-[#2D2D2B]'
                  }`}
                >
                  Tanglish
                </button>
              </div>
            </div>

            {/* Input Controls */}
            <div className="flex items-center gap-2">
              {/* Mic Voice Input Button */}
              <button
                type="button"
                onClick={handleToggleMic}
                className={`p-3 rounded-full border transition-all cursor-pointer shrink-0 ${
                  isRecordingMic
                    ? 'bg-[#E98A72] border-[#E98A72] text-white shadow-md animate-pulse'
                    : 'bg-[#F0EDE4] hover:bg-[#D1E5E6] border-[#E8E4D9] text-[#1F4647]'
                }`}
                title={
                  isRecordingMic
                    ? 'Tap to stop & send voice message'
                    : `Tap to speak in ${micLanguage === 'ta' ? 'Tamil' : micLanguage === 'tanglish' ? 'Tanglish' : 'English'}`
                }
              >
                {isRecordingMic ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#4A8B8D]" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  micLanguage === 'ta'
                    ? `${safeCompanion.name}-டன் தமிழில் பேசுங்கள் / தட்டச்சு செய்யுங்கள்...`
                    : micLanguage === 'tanglish'
                    ? `${safeCompanion.name} kitta Tanglish-la pesunga...`
                    : `Talk or speak to ${safeCompanion.name}...`
                }
                className="flex-1 px-4 py-3 bg-[#F9F7F2] border border-[#E8E4D9] rounded-full text-xs sm:text-sm text-[#2D2D2B] focus:outline-hidden focus:ring-2 focus:ring-[#4A8B8D] focus:bg-white"
              />

              <button
                onClick={() => handleSend()}
                disabled={(!input.trim() && !interimSpokenText.trim()) || isLoading}
                className={`p-3 rounded-full transition-all shrink-0 ${
                  (input.trim() || interimSpokenText.trim()) && !isLoading
                    ? 'bg-[#4A8B8D] hover:bg-[#376F71] text-white shadow-xs cursor-pointer'
                    : 'bg-[#F0EDE4] text-[#7A756D] cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Interactive Full Voice Call Modal */}
      <CompanionVoiceCallModal
        isOpen={isVoiceCallOpen}
        onClose={() => setIsVoiceCallOpen(false)}
        companion={safeCompanion}
        initialLanguage={micLanguage}
        recentCheckin={latestCheckin}
        chatHistory={messages.map((m) => ({ role: m.role, content: m.content }))}
        onNewMessage={(newMsg) => {
          setMessages((prev) => [
            ...prev,
            {
              id: `voice-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              role: newMsg.role,
              content: newMsg.content,
              timestamp: newMsg.timestamp,
            },
          ]);
        }}
      />
    </>
  );
};

