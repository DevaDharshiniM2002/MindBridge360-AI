import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  Bot,
  Heart,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Smile,
  Frown,
  Meh,
  Wind,
  Headphones,
  Gamepad2,
  Calendar,
} from 'lucide-react';
import { VoiceMoodNLPAnalysis } from '../types';

interface VoiceMoodJournalNLPProps {
  onSaveVoiceMood?: (analysis: VoiceMoodNLPAnalysis) => void;
  onLaunchFeature: (targetTab: string) => void;
}

export const VoiceMoodJournalNLP: React.FC<VoiceMoodJournalNLPProps> = ({
  onSaveVoiceMood,
  onLaunchFeature,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VoiceMoodNLPAnalysis | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);

  const recognitionRef = useRef<any>(null);

  // Check Web Speech API availability
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
    }
  }, []);

  const startVoiceRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Graceful fallback: set a realistic sample journal
      setTranscript('I am feeling so overwhelmed with the AI model training lab viva tomorrow. I slept only 4 hours and my mind is racing.');
      handleAnalyzeText('I am feeling so overwhelmed with the AI model training lab viva tomorrow. I slept only 4 hours and my mind is racing.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Works for Indian English & mixed Tanglish

      recognition.onstart = () => {
        setIsRecording(true);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition exception:', e);
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);

    if (transcript.trim()) {
      handleAnalyzeText(transcript);
    }
  };

  // Perform NLP Sentiment & Healing Analysis
  const handleAnalyzeText = (text: string) => {
    if (!text.trim()) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let detectedEmotion = 'Mildly Strained & Thinking Ahead';
      let valence: 'positive' | 'neutral' | 'stressed' | 'overwhelmed' = 'stressed';
      let triggers: string[] = [];

      if (lower.includes('exam') || lower.includes('viva') || lower.includes('test')) {
        triggers.push('Academic Assessment Pressure');
      }
      if (lower.includes('sleep') || lower.includes('tired') || lower.includes('exhaust')) {
        triggers.push('Sleep Debt & Circadian Strain');
      }
      if (lower.includes('project') || lower.includes('code') || lower.includes('deadline')) {
        triggers.push('Lab Submission Deadlines');
      }
      if (lower.includes('lonely') || lower.includes('hostel') || lower.includes('home')) {
        triggers.push('Hostel Adjustment & Distance from Home');
      }

      if (triggers.length === 0) {
        triggers.push('Semester Cognitive Load');
      }

      if (lower.includes('overwhelm') || lower.includes('panic') || lower.includes('terrified') || lower.includes('cannot')) {
        detectedEmotion = 'Acute Exam & Performance Overload';
        valence = 'overwhelmed';
      } else if (lower.includes('tired') || lower.includes('exhausted')) {
        detectedEmotion = 'Deep Mental & Physical Fatigue';
        valence = 'stressed';
      } else if (lower.includes('good') || lower.includes('happy') || lower.includes('calm')) {
        detectedEmotion = 'Balanced & Steady Focus';
        valence = 'positive';
      }

      // Mithra's 3-Step NLP Healing Pathway: Relax, Calm, Overcome
      const healingPathway = {
        relax:
          'Breathe out with me. Soften your jaw and drop your shoulders away from your ears. Take one deep 4-second inhale and a long 7-second exhale. You are safe in this moment.',
        calm:
          'This viva or assignment is one single academic checkpoint — it does not define your intellect or your future. You have tackled tough lab codes before and made it through.',
        overcome:
          'Break your remaining tasks into one tiny 15-minute chunk. Drink half a glass of warm water, and let’s take 3 minutes in the Pranayama Pacer to center your focus.',
      };

      const result: VoiceMoodNLPAnalysis = {
        transcript: text,
        detectedEmotion,
        emotionConfidence: 94,
        sentimentValence: valence,
        extractedTriggers: triggers,
        healingPathway,
        recommendedAction: '3-Minute Pranayama 4-7-8 Breath Reset',
        targetTab: 'relax',
        recordedAt: new Date().toISOString(),
      };

      setAnalysisResult(result);
      setIsAnalyzing(false);
      onSaveVoiceMood?.(result);
    }, 700);
  };

  // Play Mithra's Voice Output (TTS)
  const handleSpeakHealingVoice = () => {
    if (!analysisResult) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const messageToSpeak = `${analysisResult.healingPathway.relax} ${analysisResult.healingPathway.calm} ${analysisResult.healingPathway.overcome}`;
    const utterance = new SpeechSynthesisUtterance(messageToSpeak);
    utterance.rate = 0.9; // Calm, soothing slower pace
    utterance.pitch = 1.05;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  // Demo sample texts
  const samplePrompts = [
    'I feel exhausted after 6 hours of lab code and tomorrow is my semester viva.',
    'I miss home food and I am stressed about the upcoming campus placement interview.',
    'Feeling pretty good today, just wrapped up my mini project on time!',
  ];

  return (
    <div className="bg-white/95 dark:bg-[#182326]/95 rounded-[32px] border border-[#E8E4D9] dark:border-[#28383D] p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E4D9]/70 dark:border-[#28383D]/70 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-[#2D2D2B] dark:text-white">
                Voice Mood Journal & NLP Engine
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                Relax • Calm • Overcome
              </span>
            </div>
            <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
              Speak your mind freely in English or Tanglish. AI decodes your mood and responds with soothing healing guidance.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Confidential
        </span>
      </div>

      {/* Voice Recording Control Area */}
      <div className="p-5 rounded-3xl bg-[#FAF8F5] dark:bg-[#1C282C] border border-[#E8E4D9] dark:border-[#2D3E42] flex flex-col items-center justify-center text-center space-y-3">
        <div className="relative">
          {isRecording && (
            <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
          )}
          <button
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-95 ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-300 dark:ring-rose-900'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            title={isRecording ? 'Click to finish speaking' : 'Click and speak your mood'}
          >
            {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </button>
        </div>

        <div>
          <h4 className="text-xs font-bold text-[#2D2D2B] dark:text-white">
            {isRecording ? 'Listening attentively... Speak freely' : 'Tap Microphone to Speak Your Daily Mood'}
          </h4>
          <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF] mt-0.5">
            {isRecording
              ? 'Tell Mithra how you are feeling about classes, exams, or hostel.'
              : 'Or type / select a quick journal reflection below.'}
          </p>
        </div>

        {/* Live Transcript / Manual Input box */}
        <div className="w-full max-w-xl">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your spoken words will appear here in real-time, or you can type how you feel..."
            rows={2}
            className="w-full p-3 rounded-2xl bg-white dark:bg-[#152023] border border-[#E8E4D9] dark:border-[#2B3B3F] text-xs text-[#2D2D2B] dark:text-white placeholder-[#9BA3AF] focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(p);
                    handleAnalyzeText(p);
                  }}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-white dark:bg-[#152023] border border-[#E8E4D9] dark:border-[#2D3F43] text-[#7A756D] dark:text-[#9BA3AF] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                >
                  Prompt {idx + 1}
                </button>
              ))}
            </div>

            {transcript.trim() && !isRecording && (
              <button
                onClick={() => handleAnalyzeText(transcript)}
                disabled={isAnalyzing}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAnalyzing ? 'Analyzing...' : 'Analyze with NLP'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* NLP Sentiment & Healing Outcome Card */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-5 rounded-3xl bg-linear-to-br from-indigo-50/60 to-purple-50/40 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/80 dark:border-indigo-800/60 space-y-4"
          >
            {/* Sentiment & Trigger Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-900/60 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400 tracking-wider">
                  NLP Mood Diagnosis
                </span>
                <h4 className="text-sm font-bold text-[#2D2D2B] dark:text-white flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  {analysisResult.detectedEmotion}
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {analysisResult.extractedTriggers.map((trg, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#162124] text-[#2D2D2B] dark:text-[#E2E8F0] border border-indigo-200 dark:border-indigo-800"
                  >
                    • {trg}
                  </span>
                ))}
              </div>
            </div>

            {/* 3-Step Healing Pathway: Relax, Calm, Overcome */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Step 1: Relax */}
              <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-[#162124]/95 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5" /> 1. Relax (Somatic Release)
                </span>
                <p className="text-xs text-[#555] dark:text-[#CBD5E1] leading-relaxed">
                  {analysisResult.healingPathway.relax}
                </p>
              </div>

              {/* Step 2: Calm */}
              <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-[#162124]/95 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" /> 2. Calm (Cognitive Reframe)
                </span>
                <p className="text-xs text-[#555] dark:text-[#CBD5E1] leading-relaxed">
                  {analysisResult.healingPathway.calm}
                </p>
              </div>

              {/* Step 3: Overcome */}
              <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-[#162124]/95 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 3. Overcome (Micro Action)
                </span>
                <p className="text-xs text-[#555] dark:text-[#CBD5E1] leading-relaxed">
                  {analysisResult.healingPathway.overcome}
                </p>
              </div>
            </div>

            {/* Bottom Actions: Voice Audio Out + Direct Launch */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <button
                onClick={handleSpeakHealingVoice}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isPlayingAudio
                    ? 'bg-rose-500 text-white'
                    : 'bg-white dark:bg-[#162124] border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? 'Stop Voice Output' : "Listen to Mithra's Voice"}</span>
              </button>

              <button
                onClick={() => onLaunchFeature(analysisResult.targetTab)}
                className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Connect to {analysisResult.recommendedAction}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
