import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  MessageCircle,
  Heart,
  Compass,
} from 'lucide-react';
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  speakText,
  stopSpeaking,
  playToneCue,
} from '../utils/speechService';
import { AppLanguage, VoiceParsedIntent } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  language: AppLanguage;
  onClose: () => void;
  onNavigate?: (tabId: string) => void;
  onNavigateTab?: (tabId: string) => void;
  onLanguageChange?: (lang: AppLanguage) => void;
  companionName?: string;
  onSaveVoiceCheckin?: (checkin: { mood: any; stressScore: number; notes: string; category: string }) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  language,
  onClose,
  onNavigate,
  onNavigateTab,
  onLanguageChange,
  companionName = 'Mithra',
  onSaveVoiceCheckin,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<VoiceParsedIntent | null>(null);
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<AppLanguage>(language || 'tanglish');
  const [isSpeakingBack, setIsSpeakingBack] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognizerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setParsedResult(null);
      setErrorMsg(null);
      startVoiceListening();
    } else {
      stopVoiceListening();
      stopSpeaking();
    }
  }, [isOpen, selectedVoiceLang]);

  const startVoiceListening = () => {
    if (!isSpeechRecognitionSupported()) {
      setErrorMsg('Voice recognition is not supported in this browser. You can type or use on-screen buttons.');
      return;
    }

    try {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }

      playToneCue('listen');
      const recognizer = createSpeechRecognizer({
        language: selectedVoiceLang === 'ta' ? 'ta' : selectedVoiceLang === 'tanglish' ? 'tanglish' : 'en',
        onStart: () => {
          setIsListening(true);
          setErrorMsg(null);
        },
        onResult: (text, isFinal) => {
          setTranscript(text);
          if (isFinal && text.trim().length > 3) {
            handleProcessTranscript(text);
          }
        },
        onError: (err) => {
          setIsListening(false);
          console.warn('Speech recognizer notice:', err);
        },
        onEnd: () => {
          setIsListening(false);
        },
      });

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
      }
    } catch (err) {
      console.error('Failed to start voice recognition:', err);
      setIsListening(false);
    }
  };

  const stopVoiceListening = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      recognizerRef.current = null;
    }
    setIsListening(false);
  };

  const handleProcessTranscript = async (textToParse: string) => {
    stopVoiceListening();
    setIsParsing(true);

    try {
      const res = await fetch('/api/voice/parse-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: textToParse,
          language: selectedVoiceLang,
        }),
      });

      const data: VoiceParsedIntent = await res.json();
      setParsedResult(data);

      // Auditory Feedback (TTS)
      if (data.displayMessage) {
        speakText({
          text: data.displayMessage,
          language: selectedVoiceLang === 'ta' ? 'ta' : 'en',
          onStart: () => setIsSpeakingBack(true),
          onEnd: () => setIsSpeakingBack(false),
          onError: () => setIsSpeakingBack(false),
        });
      }
    } catch (err) {
      console.error('Voice parsing error:', err);
      setErrorMsg('Could not process voice command. Please try again or tap manually.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleExecuteAction = () => {
    if (!parsedResult) return;
    const navigate = onNavigate || onNavigateTab;

    if (parsedResult.action === 'checkin' && parsedResult.checkinDraft && onSaveVoiceCheckin) {
      onSaveVoiceCheckin(parsedResult.checkinDraft);
      navigate?.('my-wellness');
      onClose();
    } else if (parsedResult.targetTab) {
      navigate?.(parsedResult.targetTab);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="bg-white dark:bg-[#161E20] rounded-[36px] border border-[#E8E4D9] dark:border-[#223034] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#F0EDE4] dark:bg-[#253235] flex items-center justify-center text-[#7A756D] hover:text-[#2D2D2B] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-100 dark:bg-teal-900/60 text-[#4A8B8D] dark:text-[#63C1C4] rounded-full text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Voice-First Accessibility (Module 12)</span>
          </div>
          <h3 className="font-serif italic text-2xl sm:text-3xl text-[#2D2D2B] dark:text-[#F3F6F8]">
            Talk to MindBridge 360
          </h3>
          <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
            Speak naturally in Tamil, Tanglish, or English
          </p>

          {/* Language Selector */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {(['tanglish', 'ta', 'en'] as AppLanguage[]).map((lng) => (
              <button
                key={lng}
                onClick={() => setSelectedVoiceLang(lng)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedVoiceLang === lng
                    ? 'bg-[#4A8B8D] text-white shadow-2xs'
                    : 'bg-[#F0EDE4] dark:bg-[#253235] text-[#7A756D] dark:text-[#9BA3AF]'
                }`}
              >
                {lng === 'tanglish' ? 'Tanglish' : lng === 'ta' ? 'தமிழ்' : 'English'}
              </button>
            ))}
          </div>
        </div>

        {/* Center Waveform & Microphone Visualizer */}
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="relative flex items-center justify-center">
            {isListening && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  className="absolute w-28 h-28 rounded-full bg-teal-300 dark:bg-teal-700/50"
                />
                <motion.div
                  animate={{ scale: [1, 1.6, 1], opacity: [0.15, 0.4, 0.15] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut', delay: 0.3 }}
                  className="absolute w-36 h-36 rounded-full bg-teal-200 dark:bg-teal-800/30"
                />
              </>
            )}

            <button
              onClick={() => {
                if (isListening) stopVoiceListening();
                else startVoiceListening();
              }}
              className={`relative z-10 w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-[#4A8B8D] hover:bg-[#3D7375] text-white'
              }`}
            >
              {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
            </button>
          </div>

          {/* Status Label */}
          <div className="text-center space-y-1">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isListening
                  ? 'text-rose-600 dark:text-rose-400'
                  : isParsing
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-[#7A756D] dark:text-[#9BA3AF]'
              }`}
            >
              {isListening
                ? '🔴 MindMitra is listening...'
                : isParsing
                ? '🟡 Understanding your command...'
                : 'Tap microphone to speak'}
            </span>

            {/* Live Audio Visualizer Bars */}
            {isListening && (
              <div className="flex items-center justify-center gap-1 h-6">
                {[12, 24, 18, 28, 14, 26, 10, 20].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [8, h, 8] }}
                    transition={{ repeat: Infinity, duration: 0.6 + i * 0.1 }}
                    className="w-1 bg-[#4A8B8D] rounded-full"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Transcript Box */}
        <div className="p-4 rounded-2xl bg-[#F9F7F2] dark:bg-[#1C2527] border border-[#E8E4D9] dark:border-[#2F3D42] text-center min-h-[68px] flex items-center justify-center">
          {transcript ? (
            <p className="text-sm font-medium text-[#2D2D2B] dark:text-[#F3F6F8] italic">
              "{transcript}"
            </p>
          ) : (
            <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
              Try saying: "Mind Relax open pannu", "I want to talk to Mithra", or "I'm feeling stressed about placements"
            </p>
          )}
        </div>

        {/* Parsed Intent / Confirmation Box */}
        {parsedResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A8B8D]">
                <CheckCircle className="w-4 h-4" />
                <span>Intent Recognized ({parsedResult.confidence}% match)</span>
              </div>
              {isSpeakingBack && (
                <span className="text-[10px] text-teal-700 flex items-center gap-1 font-bold">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Speaking...
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#2D2D2B] dark:text-[#F3F6F8] font-semibold">
              {parsedResult.displayMessage}
            </p>

            {parsedResult.checkinDraft && (
              <div className="text-xs bg-white dark:bg-[#161E20] p-2.5 rounded-xl border border-[#E8E4D9] dark:border-[#2F3D42] text-[#7A756D] dark:text-[#9BA3AF]">
                <span>Logged Mood: <strong>{parsedResult.checkinDraft.mood}</strong></span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={startVoiceListening}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#7A756D] hover:text-[#2D2D2B] cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              <button
                onClick={handleExecuteAction}
                className="px-4 py-2 bg-[#4A8B8D] hover:bg-[#3D7375] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>{parsedResult.suggestedActionLabel || 'Confirm Action'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Error Notice */}
        {errorMsg && (
          <div className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950 p-3 rounded-xl border border-rose-200">
            {errorMsg}
          </div>
        )}

        {/* Privacy Note */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7A756D] dark:text-[#9BA3AF] text-center pt-1 border-t border-[#E8E4D9] dark:border-[#223034]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#4A8B8D]" />
          <span>Audio is processed in real time and never saved or shared without consent.</span>
        </div>
      </motion.div>
    </div>
  );
};
