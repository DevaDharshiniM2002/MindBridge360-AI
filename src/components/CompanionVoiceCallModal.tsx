import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Sparkles,
  Radio,
  RotateCcw,
  MessageSquare,
  Globe,
  Headphones,
} from 'lucide-react';
import { CompanionConfig, CompanionAvatarType, CompanionTone, AppLanguage } from '../types';
import { CompanionAvatar } from './CompanionAvatar';
import {
  speakText,
  stopSpeaking,
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  detectTextLanguage,
  RecognizerInstance,
  playToneCue,
} from '../utils/speechService';

interface CompanionVoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  companion: CompanionConfig;
  initialLanguage?: 'ta' | 'en' | 'tanglish';
  recentCheckin?: any;
  onNewMessage?: (msg: { role: 'user' | 'assistant'; content: string; timestamp: string }) => void;
  chatHistory?: { role: 'user' | 'assistant'; content: string }[];
}

export const CompanionVoiceCallModal: React.FC<CompanionVoiceCallModalProps> = ({
  isOpen,
  onClose,
  companion,
  initialLanguage = 'en',
  recentCheckin,
  onNewMessage,
  chatHistory = [],
}) => {
  const safeCompanion = companion || { name: 'Mithra', avatar: 'blob', tone: 'gentle', voiceEnabled: true };
  const [voiceLang, setVoiceLang] = useState<'ta' | 'en' | 'tanglish'>(initialLanguage || 'en');
  const [callState, setCallState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [lastUserSpeech, setLastUserSpeech] = useState('');
  const [lastAssistantSpeech, setLastAssistantSpeech] = useState('');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [handsFree, setHandsFree] = useState(true);
  const [visemeIndex, setVisemeIndex] = useState<number | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognizerRef = useRef<RecognizerInstance | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopSpeaking();
      if (recognizerRef.current) {
        recognizerRef.current.abort();
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  // When call modal opens, speak greeting and start listening
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setTranscript('');
      setLastUserSpeech('');

      const greetings: Record<string, string> = {
        en: `Hi! I'm listening. Speak naturally in English, Tamil, or Tanglish whenever you're ready.`,
        ta: `வணக்கம்! நான் கேட்கிறேன். தேர்வு பயமோ அல்லது உங்கள் மனதின் எந்த எண்ணமோ, தயங்காமல் பேசுங்கள்.`,
        tanglish: `Vanakkam! Naan ketkiren. Unga manasula irukkardha freely share pannunga, naan unga kooda irukken.`,
      };

      const greetingText = greetings[voiceLang] || greetings.en;
      setLastAssistantSpeech(greetingText);

      // Speak greeting then auto-start listening
      if (!isSpeakerMuted) {
        setCallState('speaking');
        speakText({
          text: greetingText,
          language: voiceLang as AppLanguage,
          tone: safeCompanion.tone as CompanionTone,
          avatar: safeCompanion.avatar as CompanionAvatarType,
          onStart: () => {
            if (isMountedRef.current) setCallState('speaking');
          },
          onEnd: () => {
            if (isMountedRef.current) {
              setCallState('idle');
              if (handsFree && !isMicMuted) {
                startListening();
              }
            }
          },
          onError: () => {
            if (isMountedRef.current) {
              setCallState('idle');
              if (handsFree && !isMicMuted) startListening();
            }
          },
        });
      } else {
        startListening();
      }
    } else {
      stopSpeaking();
      if (recognizerRef.current) {
        recognizerRef.current.abort();
      }
    }
  }, [isOpen, voiceLang]);

  const startListening = () => {
    if (!isSpeechRecognitionSupported()) {
      setErrorMsg('Speech recognition is not supported on this browser. Try typing in chat.');
      return;
    }

    if (isMicMuted) return;

    stopSpeaking();
    setErrorMsg(null);
    setTranscript('');
    setCallState('listening');

    if (recognizerRef.current) {
      recognizerRef.current.abort();
    }

    const recognizer = createSpeechRecognizer({
      language: voiceLang,
      onStart: () => {
        if (isMountedRef.current) setCallState('listening');
      },
      onResult: (text: string, isFinal: boolean) => {
        if (!isMountedRef.current) return;
        setTranscript(text);

        // Auto-detect language if typed or spoken
        const detected = detectTextLanguage(text);
        if (detected !== voiceLang && text.length > 8) {
          // Keep current preference or adapt smoothly
        }

        // Reset silence timer on every speech event
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        // If final or substantial pause (1.4s), automatically process
        if (isFinal) {
          silenceTimerRef.current = setTimeout(() => {
            handleProcessSpokenText(text);
          }, 600);
        } else {
          silenceTimerRef.current = setTimeout(() => {
            if (text.trim().length > 3) {
              handleProcessSpokenText(text);
            }
          }, 1800);
        }
      },
      onError: (err: any) => {
        if (!isMountedRef.current) return;
        if (err.error === 'not-allowed' || err.error === 'permission-denied') {
          setErrorMsg('Microphone access was denied. Please allow microphone permissions.');
          setCallState('idle');
        }
      },
      onEnd: () => {
        if (!isMountedRef.current) return;
        if (callState === 'listening' && handsFree && !transcript.trim()) {
          // Restart listening after brief pause
          setTimeout(() => {
            if (isMountedRef.current && callState === 'idle') {
              startListening();
            }
          }, 500);
        }
      },
    });

    recognizerRef.current = recognizer;
    recognizer?.start();
  };

  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setCallState('idle');
  };

  const handleProcessSpokenText = async (spokenText: string) => {
    const cleanText = spokenText.trim();
    if (!cleanText || callState === 'processing') return;

    stopListening();
    setCallState('processing');
    setLastUserSpeech(cleanText);
    setTranscript('');

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    onNewMessage?.({ role: 'user', content: cleanText, timestamp: timeStr });

    // Auto-detect speech language for optimal reply
    const detectedLang = detectTextLanguage(cleanText);
    const targetLang = voiceLang === 'auto' ? detectedLang : voiceLang;

    try {
      const res = await fetch('/api/companion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanText,
          history: chatHistory.slice(-6),
          companion: safeCompanion,
          language: targetLang,
          recentCheckin,
        }),
      });

      const data = await res.json();
      let replyText = data.reply;

      if (!replyText) {
        if (targetLang === 'ta') {
          replyText = `நான் உங்களை கவனிக்கிறேன். நிதானமாக ஒரு மூச்சு விடுங்கள். இந்த செமஸ்டர் அழுத்தத்தை நீங்கள் தனியாக சுமக்க வேண்டியதில்லை.`;
        } else if (targetLang === 'tanglish') {
          replyText = `Naan unga kooda irukken. Take a slow breath. Don't worry nanba, namma step by step-aa solve pannuvom.`;
        } else {
          replyText = `I hear you completely. Take a slow, calm breath. You don't have to carry all this stress alone.`;
        }
      }

      setLastAssistantSpeech(replyText);
      onNewMessage?.({ role: 'assistant', content: replyText, timestamp: timeStr });

      if (!isSpeakerMuted) {
        setCallState('speaking');
        speakText({
          text: replyText,
          language: (targetLang || 'en') as AppLanguage,
          tone: safeCompanion.tone as CompanionTone,
          avatar: safeCompanion.avatar as CompanionAvatarType,
          onStart: () => {
            if (isMountedRef.current) setCallState('speaking');
          },
          onViseme: (v) => {
            if (isMountedRef.current) setVisemeIndex(v);
          },
          onEnd: () => {
            if (isMountedRef.current) {
              setCallState('idle');
              setVisemeIndex(undefined);
              if (handsFree && !isMicMuted) {
                setTimeout(() => {
                  if (isMountedRef.current) startListening();
                }, 350);
              }
            }
          },
          onError: () => {
            if (isMountedRef.current) {
              setCallState('idle');
              setVisemeIndex(undefined);
              if (handsFree && !isMicMuted) startListening();
            }
          },
        });
      } else {
        setCallState('idle');
        setVisemeIndex(undefined);
        if (handsFree && !isMicMuted) {
          setTimeout(() => {
            if (isMountedRef.current) startListening();
          }, 600);
        }
      }
    } catch (err) {
      console.error('Voice chat error:', err);
      const fallback = `I'm right here with you. Take things one moment at a time.`;
      setLastAssistantSpeech(fallback);
      setCallState('idle');
    }
  };

  const handleEndCall = () => {
    stopSpeaking();
    if (recognizerRef.current) recognizerRef.current.abort();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    onClose();
  };

  const handleToggleMute = () => {
    const next = !isMicMuted;
    setIsMicMuted(next);
    if (next) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1E2324]/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="bg-radial from-[#283637] to-[#172021] text-white w-full max-w-md rounded-[36px] shadow-2xl border border-white/10 overflow-hidden flex flex-col relative"
        >
          {/* Top Bar */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#52B788] animate-pulse"></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#A0D4D6]">
                Voice Call with {safeCompanion.name}
              </span>
            </div>

            {/* Language Switch Pills */}
            <div className="inline-flex bg-white/10 rounded-full p-0.5 border border-white/15">
              {(['en', 'ta', 'tanglish'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setVoiceLang(l);
                    stopSpeaking();
                    stopListening();
                    setTimeout(() => startListening(), 200);
                  }}
                  className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full transition-all cursor-pointer ${
                    voiceLang === l
                      ? 'bg-[#4A8B8D] text-white font-bold shadow-xs'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {l === 'en' ? 'English' : l === 'ta' ? 'தமிழ்' : 'Tanglish'}
                </button>
              ))}
            </div>
          </div>

          {/* Center Call Visual Stage */}
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6">
            {/* Animated Avatar with Dynamic Soundwave Halo */}
            <div className="relative">
              {/* Outer pulsing wave rings */}
              {callState === 'speaking' && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full bg-[#4A8B8D]/30 -z-10"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.7, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut', delay: 0.3 }}
                    className="absolute inset-0 rounded-full bg-[#4A8B8D]/20 -z-10"
                  />
                </>
              )}

              {callState === 'listening' && (
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0.2, 0.7] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full bg-[#E98A72]/30 -z-10"
                />
              )}

              <div className="p-4 bg-white/10 rounded-[32px] border border-white/20 shadow-xl backdrop-blur-sm">
                <CompanionAvatar
                  avatar={safeCompanion.avatar}
                  state={
                    callState === 'speaking'
                      ? 'speaking'
                      : callState === 'listening'
                      ? 'listening'
                      : callState === 'processing'
                      ? 'thinking'
                      : 'idle'
                  }
                  lipSyncValue={visemeIndex !== undefined ? visemeIndex / 5 : undefined}
                  emotion={
                    callState === 'speaking'
                      ? 'happy'
                      : callState === 'listening'
                      ? 'listening'
                      : callState === 'processing'
                      ? 'concerned'
                      : 'neutral'
                  }
                  size="lg"
                  isAnimated
                />
              </div>
            </div>

            {/* Dynamic Status Badge */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium">
                {callState === 'listening' && (
                  <>
                    <Radio className="w-3.5 h-3.5 text-[#E98A72] animate-pulse" />
                    <span className="text-[#F5D5CB]">
                      Listening in {voiceLang === 'ta' ? 'தமிழ்' : voiceLang === 'tanglish' ? 'Tanglish' : 'English'}...
                    </span>
                  </>
                )}
                {callState === 'processing' && (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#A0D4D6] animate-spin" />
                    <span className="text-[#A0D4D6]">{safeCompanion.name} is reflecting...</span>
                  </>
                )}
                {callState === 'speaking' && (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#52B788] animate-bounce" />
                    <span className="text-[#D8F3DC]">{safeCompanion.name} is speaking</span>
                  </>
                )}
                {callState === 'idle' && (
                  <>
                    <Headphones className="w-3.5 h-3.5 text-white/60" />
                    <span className="text-white/70">Tap mic to speak</span>
                  </>
                )}
              </div>

              {/* Soundwave Bars */}
              <div className="flex items-center justify-center gap-1.5 h-6">
                {[0.4, 0.8, 1.2, 0.9, 1.4, 0.7, 1.1, 0.5].map((scale, i) => (
                  <motion.span
                    key={i}
                    animate={{
                      height:
                        callState === 'speaking' || callState === 'listening'
                          ? [`${8 * scale}px`, `${24 * scale}px`, `${8 * scale}px`]
                          : '6px',
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6 + (i % 3) * 0.2,
                      ease: 'easeInOut',
                    }}
                    className={`w-1 rounded-full ${
                      callState === 'speaking'
                        ? 'bg-[#52B788]'
                        : callState === 'listening'
                        ? 'bg-[#E98A72]'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Live Dialogue & Caption Box */}
            <div className="w-full bg-black/30 border border-white/10 rounded-[24px] p-4 text-left space-y-2 min-h-[90px] max-h-[140px] overflow-y-auto">
              {transcript && (
                <p className="text-xs text-[#F5D5CB] italic">
                  <span className="font-semibold text-white/70">You: </span>
                  {transcript}
                </p>
              )}
              {!transcript && lastUserSpeech && (
                <p className="text-xs text-white/80">
                  <span className="font-semibold text-white/60">You: </span>
                  {lastUserSpeech}
                </p>
              )}
              {lastAssistantSpeech && (
                <p className="text-xs text-[#A0D4D6] leading-relaxed">
                  <span className="font-semibold text-[#52B788]">{safeCompanion.name}: </span>
                  {lastAssistantSpeech}
                </p>
              )}
            </div>

            {/* Error / Permission Note */}
            {errorMsg && (
              <div className="p-2.5 bg-[#A84832]/30 border border-[#E98A72]/40 rounded-xl text-xs text-[#F5D5CB]">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Controls Footer */}
          <div className="p-5 bg-black/40 border-t border-white/10 flex items-center justify-around">
            {/* Mute Mic */}
            <button
              onClick={handleToggleMute}
              className={`p-3.5 rounded-full border transition-all cursor-pointer ${
                isMicMuted
                  ? 'bg-red-500/30 border-red-400 text-red-300'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
              title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="p-4 bg-[#E98A72] hover:bg-[#D97962] text-white rounded-full shadow-lg border border-white/20 active:scale-95 transition-all cursor-pointer"
              title="End Voice Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            {/* Speaker Toggle */}
            <button
              onClick={() => {
                const next = !isSpeakerMuted;
                setIsSpeakerMuted(next);
                if (next) stopSpeaking();
              }}
              className={`p-3.5 rounded-full border transition-all cursor-pointer ${
                isSpeakerMuted
                  ? 'bg-white/5 border-white/10 text-white/40'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
              title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
            >
              {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
