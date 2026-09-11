import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  MessageCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Edit3,
  Mic,
  MicOff,
  Send,
  ShieldCheck,
  PhoneCall,
  ArrowRight,
  ArrowLeft,
  Share2,
  Lock,
  Bot,
  User,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle2,
  HelpCircle,
  Info,
} from 'lucide-react';
import {
  AppLanguage,
  ParentBridgeSituationId,
  ParentBridgeTone,
  ParentNeedType,
  ParentBridgeMessageResult,
  ParentPracticeTurn,
} from '../types';
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  speakText,
  stopSpeaking,
  playToneCue,
} from '../utils/speechService';

interface ParentBridgeViewProps {
  language: AppLanguage;
  onNavigateToTab?: (tab: string) => void;
  onOpenCrisisBar?: () => void;
}

const COMMON_SITUATIONS: Array<{
  id: ParentBridgeSituationId;
  title: string;
  emoji: string;
  shortDesc: string;
  exampleExplanation: string;
}> = [
  {
    id: 'placement-pressure',
    title: 'Placement Pressure',
    emoji: '💼',
    shortDesc: 'Campus interviews, aptitude rounds, and salary expectations',
    exampleExplanation: 'Placement pressure nala romba stress aa irukku. Amma kitta epdi solrathu therila.',
  },
  {
    id: 'exam-stress',
    title: 'Exam Stress & Blanking',
    emoji: '📚',
    shortDesc: 'Semester internals, syllabus overload, and revision fatigue',
    exampleExplanation: 'Exams are coming up in 2 weeks and I am feeling overwhelmed by the syllabus.',
  },
  {
    id: 'backlog-pressure',
    title: 'Backlog / Academic Pressure',
    emoji: '🎓',
    shortDesc: 'Handling arrears, GPA recovery, and clearing subjects',
    exampleExplanation: 'I have an arrear subject and need time to prepare and clear it without panic.',
  },
  {
    id: 'career-confusion',
    title: 'Career Confusion',
    emoji: '🧭',
    shortDesc: 'Choosing between core engineering, IT, higher studies, or govt exams',
    exampleExplanation: 'I want to explore options outside standard campus placements and need guidance.',
  },
  {
    id: 'study-fatigue',
    title: 'Study Fatigue & Burnout',
    emoji: '😴',
    shortDesc: 'Exhaustion, sleep deprivation, and needing a breathing break',
    exampleExplanation: 'I have been studying continuously and feel physically and mentally drained.',
  },
  {
    id: 'hostel-homesickness',
    title: 'Hostel / Homesickness',
    emoji: '🏠',
    shortDesc: 'Adjusting to hostel life, food changes, and missing family',
    exampleExplanation: 'Hostel environment is making me feel isolated and I miss home support.',
  },
  {
    id: 'feeling-overwhelmed',
    title: 'Feeling Overwhelmed',
    emoji: '🧠',
    shortDesc: 'General emotional overload from combined responsibilities',
    exampleExplanation: 'Everything is piling up at once and I just need a safe space to breathe.',
  },
  {
    id: 'course-decision',
    title: 'Career / Course Decision',
    emoji: '🔄',
    shortDesc: 'Changing specialization, taking certification, or gap year plan',
    exampleExplanation: 'I want to make a thoughtful decision about my future project path.',
  },
];

const TONE_OPTIONS: Array<{
  id: ParentBridgeTone;
  label: string;
  emoji: string;
  desc: string;
}> = [
  { id: 'gentle', label: 'Gentle', emoji: '🌿', desc: 'Soft, reassuring, and comforting' },
  { id: 'simple', label: 'Simple', emoji: '💬', desc: 'Clear, direct, and straightforward' },
  { id: 'emotional', label: 'Emotional', emoji: '❤️', desc: 'Heartfelt, open, and personal' },
  { id: 'practical', label: 'Practical', emoji: '🎯', desc: 'Action-focused and solution-oriented' },
  { id: 'respectful', label: 'Respectful', emoji: '🙏', desc: 'Culturally deferent and polite' },
];

const PARENT_NEEDS_LIST: Array<{
  id: ParentNeedType;
  label: string;
  emoji: string;
}> = [
  { id: 'listen', label: 'Listen to me', emoji: '👂' },
  { id: 'give-time', label: 'Give me some time', emoji: '⏳' },
  { id: 'reduce-pressure', label: 'Reduce pressure', emoji: '🕊️' },
  { id: 'help-plan', label: 'Help me plan', emoji: '📋' },
  { id: 'encourage', label: 'Encourage me', emoji: '🌟' },
  { id: 'understand', label: 'Understand my situation', emoji: '🤝' },
  { id: 'professional-support', label: 'Help me find professional support', emoji: '🩺' },
];

export const ParentBridgeView: React.FC<ParentBridgeViewProps> = ({
  language: initialLang,
  onNavigateToTab,
  onOpenCrisisBar,
}) => {
  // Navigation Steps: 'start' -> 'setup' -> 'message' -> 'simulation'
  const [currentStep, setCurrentStep] = useState<'start' | 'setup' | 'message' | 'simulation'>('start');

  // Configuration State
  const [selectedSituation, setSelectedSituation] = useState<ParentBridgeSituationId>('placement-pressure');
  const [customSituationTitle, setCustomSituationTitle] = useState('');
  const [studentExplanation, setStudentExplanation] = useState('');
  const [selectedTone, setSelectedTone] = useState<ParentBridgeTone>('respectful');
  const [selectedNeeds, setSelectedNeeds] = useState<ParentNeedType[]>(['understand', 'give-time', 'encourage']);
  const [selectedLang, setSelectedLang] = useState<AppLanguage>(initialLang || 'tanglish');
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'sms' | 'inPerson'>('whatsapp');

  // Generator & Editing State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<ParentBridgeMessageResult | null>(null);
  const [editableMessage, setEditableMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Speech Recognition State for Voice Input
  const [isRecordingInput, setIsRecordingInput] = useState(false);
  const recognizerRef = useRef<any>(null);

  // Parent Simulation Practice State
  const [simTrainer, setSimTrainer] = useState<'mithra' | 'mithran'>('mithra');
  const [simTurns, setSimTurns] = useState<ParentPracticeTurn[]>([]);
  const [currentStudentInput, setCurrentStudentInput] = useState('');
  const [isSimLoading, setIsSimLoading] = useState(false);
  const [isSimRecording, setIsSimRecording] = useState(false);
  const [isTTSActive, setIsTTSActive] = useState(false);
  const [practiceAttemptCount, setPracticeAttemptCount] = useState(1);
  const [simCompleted, setSimCompleted] = useState(false);

  // Safety trigger check
  const hasSafetyFlag =
    /suicide|kill myself|end my life|die|self harm|hurt myself|no reason to live/i.test(
      studentExplanation + ' ' + currentStudentInput
    );

  // Helper to toggle need checkboxes
  const handleToggleNeed = (needId: ParentNeedType) => {
    setSelectedNeeds((prev) =>
      prev.includes(needId) ? prev.filter((id) => id !== needId) : [...prev, needId]
    );
  };

  // Generate Message via API
  const handleGenerateMessage = async () => {
    setIsGenerating(true);
    const situationObj = COMMON_SITUATIONS.find((s) => s.id === selectedSituation);
    const title = selectedSituation === 'custom' ? customSituationTitle || 'Custom Concern' : situationObj?.title || 'Academic Situation';

    try {
      const res = await fetch('/api/parent-bridge/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: selectedSituation,
          situationTitle: title,
          studentExplanation: studentExplanation || situationObj?.exampleExplanation || '',
          tone: selectedTone,
          parentNeeds: selectedNeeds,
          language: selectedLang,
          targetChannel: activeChannel,
        }),
      });

      const data = await res.json();
      setGeneratedResult(data);
      const text = activeChannel === 'whatsapp' ? data.whatsapp : activeChannel === 'sms' ? data.sms : data.inPerson;
      setEditableMessage(text || data.whatsapp || '');
      setCurrentStep('message');
    } catch (err) {
      console.error('Parent Bridge generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Switch channel view
  const handleChannelSwitch = (channel: 'whatsapp' | 'sms' | 'inPerson') => {
    setActiveChannel(channel);
    if (generatedResult) {
      const text =
        channel === 'whatsapp'
          ? generatedResult.whatsapp
          : channel === 'sms'
          ? generatedResult.sms
          : generatedResult.inPerson;
      setEditableMessage(text || '');
    }
  };

  // Copy Message to Clipboard
  const handleCopyMessage = () => {
    if (editableMessage) {
      navigator.clipboard.writeText(editableMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Voice Input for Explanation
  const toggleVoiceInput = () => {
    if (isRecordingInput) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
        recognizerRef.current = null;
      }
      setIsRecordingInput(false);
    } else {
      if (!isSpeechRecognitionSupported()) {
        alert('Voice recognition is not supported in this browser.');
        return;
      }
      playToneCue('listen');
      const recognizer = createSpeechRecognizer({
        language: selectedLang === 'ta' ? 'ta' : selectedLang === 'tanglish' ? 'tanglish' : 'en',
        onStart: () => setIsRecordingInput(true),
        onResult: (transcript, isFinal) => {
          if (isFinal) {
            setStudentExplanation((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        },
        onError: () => setIsRecordingInput(false),
        onEnd: () => setIsRecordingInput(false),
      });
      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
      }
    }
  };

  // Start Simulation Step
  const handleStartSimulation = () => {
    const situationObj = COMMON_SITUATIONS.find((s) => s.id === selectedSituation);
    const initialParentText =
      selectedLang === 'tanglish'
        ? 'Amma/Appa: "Enna aachu pa? Enamo sollanum nu sonniye? Nalla padikiriya illaya?"'
        : selectedLang === 'ta'
        ? 'அம்மா/அப்பா: "என்ன விஷயம் பா? ஏதோ பேச வேண்டும் என்று சொன்னாயே? படிப்பு எப்படி போகிறது?"'
        : 'Mom/Dad: "Yes, what did you want to talk about? Is everything okay with your college and studies?"';

    setSimTurns([
      {
        id: 'turn-0',
        speaker: 'parent',
        text: initialParentText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setPracticeAttemptCount(1);
    setSimCompleted(false);
    setCurrentStudentInput('');
    setCurrentStep('simulation');
  };

  // Submit student turn in simulation
  const handleSendSimTurn = async (customText?: string) => {
    const textToSend = (customText || currentStudentInput).trim();
    if (!textToSend || isSimLoading) return;

    const situationObj = COMMON_SITUATIONS.find((s) => s.id === selectedSituation);
    const title = selectedSituation === 'custom' ? customSituationTitle || 'Custom Concern' : situationObj?.title || 'Academic Situation';

    const newStudentTurn: ParentPracticeTurn = {
      id: `turn-student-${Date.now()}`,
      speaker: 'student',
      text: textToSend,
      attemptNumber: practiceAttemptCount,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSimTurns((prev) => [...prev, newStudentTurn]);
    setCurrentStudentInput('');
    setIsSimLoading(true);

    try {
      const res = await fetch('/api/parent-bridge/simulate-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: selectedSituation,
          situationTitle: title,
          studentMessage: textToSend,
          history: simTurns.map((t) => ({ speaker: t.speaker, text: t.text })),
          trainer: simTrainer,
          language: selectedLang,
          attemptCount: practiceAttemptCount,
        }),
      });

      const data = await res.json();

      // Attach feedback to student's turn and add parent's next reply
      setSimTurns((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].speaker === 'student') {
          updated[lastIdx].feedback = data.coachingFeedback;
        }
        if (data.parentReply) {
          updated.push({
            id: `turn-parent-${Date.now()}`,
            speaker: 'parent',
            text: data.parentReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        }
        return updated;
      });

      if (data.isConversationConcluded || simTurns.length >= 6) {
        setSimCompleted(true);
      }
    } catch (err) {
      console.error('Simulation turn error:', err);
    } finally {
      setIsSimLoading(false);
    }
  };

  // Voice toggle for simulation response
  const toggleSimVoice = () => {
    if (isSimRecording) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
        recognizerRef.current = null;
      }
      setIsSimRecording(false);
    } else {
      if (!isSpeechRecognitionSupported()) {
        alert('Voice recognition not supported in this browser.');
        return;
      }
      playToneCue('listen');
      const recognizer = createSpeechRecognizer({
        language: selectedLang === 'ta' ? 'ta' : selectedLang === 'tanglish' ? 'tanglish' : 'en',
        onStart: () => setIsSimRecording(true),
        onResult: (transcript, isFinal) => {
          if (isFinal) {
            setCurrentStudentInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        },
        onError: () => setIsSimRecording(false),
        onEnd: () => setIsSimRecording(false),
      });
      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
      }
    }
  };

  // TTS speak for coach or parent
  const handleSpeakText = (text: string) => {
    if (isTTSActive) {
      stopSpeaking();
      setIsTTSActive(false);
    } else {
      speakText({
        text,
        language: selectedLang === 'ta' ? 'ta' : 'en',
        onStart: () => setIsTTSActive(true),
        onEnd: () => setIsTTSActive(false),
        onError: () => setIsTTSActive(false),
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 px-3 sm:px-4">
      {/* 1. Privacy Banner & Safety Check */}
      {hasSafetyFlag && (
        <div className="bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-300 dark:border-rose-800 rounded-3xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm animate-pulse">
          <div className="p-2 bg-rose-200 dark:bg-rose-900 rounded-xl text-rose-800 dark:text-rose-200">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-rose-900 dark:text-rose-100 text-sm">
              We care about your safety first
            </h4>
            <p className="text-xs text-rose-800 dark:text-rose-200 mt-0.5">
              If you are feeling overwhelmed or unsafe, please remember you don't have to carry this alone. Free 24/7 confidential professional helplines are available right now.
            </p>
            <div className="flex flex-wrap gap-2 mt-2.5">
              <a
                href="tel:14416"
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call Tele-MANAS (14416)
              </a>
              <a
                href="tel:18005990019"
                className="px-3 py-1.5 bg-white dark:bg-rose-900/80 text-rose-800 dark:text-rose-100 border border-rose-300 dark:border-rose-700 rounded-xl text-xs font-bold"
              >
                KIRAN (1800-599-0019)
              </a>
              {onOpenCrisisBar && (
                <button
                  onClick={onOpenCrisisBar}
                  className="px-3 py-1.5 bg-rose-100 dark:bg-rose-900/40 text-rose-900 dark:text-rose-200 rounded-xl text-xs font-bold"
                >
                  Campus Crisis Desk
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Step 1: START SCREEN */}
      {currentStep === 'start' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#161E20] rounded-[36px] border border-[#E8E4D9] dark:border-[#223034] p-6 sm:p-10 shadow-sm space-y-8 text-center"
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-4xl shadow-inner">
              👨‍👩‍👧
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 bg-teal-100 dark:bg-teal-900/60 text-[#4A8B8D] dark:text-[#63C1C4] rounded-full">
                Module 9 • Student ↔ Parent Communication
              </span>
              <h2 className="font-serif italic text-3xl sm:text-4xl text-[#2D2D2B] dark:text-[#F3F6F8]">
                Parent Bridge
              </h2>
              <p className="text-sm sm:text-base text-[#7A756D] dark:text-[#9BA3AF] leading-relaxed">
                “Having trouble explaining how you feel? Let MindMitra help you find the words.”
              </p>
            </div>
          </div>

          {/* Value Highlights Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-[#F9F7F2] dark:bg-[#1C2527] border border-[#E8E4D9] dark:border-[#2F3D42] space-y-1.5">
              <span className="text-2xl">🌿</span>
              <h4 className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">Culturally Respectful</h4>
              <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF]">
                De-stigmatizes study fatigue without sounding disrespectful or confrontational.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F9F7F2] dark:bg-[#1C2527] border border-[#E8E4D9] dark:border-[#2F3D42] space-y-1.5">
              <span className="text-2xl">✏️</span>
              <h4 className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">Say It in Your Words</h4>
              <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF]">
                Generate WhatsApp / SMS / In-person messages you can edit freely. Never auto-sent.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F9F7F2] dark:bg-[#1C2527] border border-[#E8E4D9] dark:border-[#2F3D42] space-y-1.5">
              <span className="text-2xl">🎭</span>
              <h4 className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">Practice Conversation</h4>
              <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF]">
                Roleplay difficult responses with Mithra to stay calm, grounded, and confident.
              </p>
            </div>
          </div>

          {/* Privacy Guarantee Box */}
          <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 flex items-start gap-3 text-left">
            <Lock className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 space-y-0.5">
              <p className="font-bold">100% Private & Voluntary</p>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80">
                MindMitra will NEVER share your mood logs, check-ins, or private chats with your parents. You control what you send.
              </p>
            </div>
          </div>

          <div>
            <button
              onClick={() => setCurrentStep('setup')}
              className="px-8 py-3.5 bg-[#4A8B8D] hover:bg-[#3D7375] text-white rounded-2xl font-bold text-sm sm:text-base shadow-md transition-all cursor-pointer inline-flex items-center gap-2 hover:scale-[1.02]"
            >
              <span>Start Parent Bridge</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* 3. Step 2: SELECT SITUATION & CONFIGURE */}
      {currentStep === 'setup' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#161E20] rounded-[36px] border border-[#E8E4D9] dark:border-[#223034] p-6 sm:p-8 shadow-sm space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E8E4D9] dark:border-[#223034] pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentStep('start')}
                className="w-8 h-8 rounded-full bg-[#F0EDE4] dark:bg-[#253235] flex items-center justify-center text-[#7A756D] hover:text-[#2D2D2B] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="font-serif italic text-xl sm:text-2xl text-[#2D2D2B] dark:text-[#F3F6F8]">
                  What do you want to explain?
                </h3>
                <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
                  Select the situation closest to your current situation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-[#F0EDE4] dark:bg-[#253235] p-1 rounded-xl">
              {(['tanglish', 'ta', 'en'] as AppLanguage[]).map((lng) => (
                <button
                  key={lng}
                  onClick={() => setSelectedLang(lng)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedLang === lng
                      ? 'bg-white dark:bg-[#161E20] text-[#4A8B8D] dark:text-[#63C1C4] shadow-2xs'
                      : 'text-[#7A756D] dark:text-[#9BA3AF]'
                  }`}
                >
                  {lng === 'tanglish' ? 'Tanglish' : lng === 'ta' ? 'தமிழ்' : 'English'}
                </button>
              ))}
            </div>
          </div>

          {/* Situations Grid */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#7A756D] dark:text-[#9BA3AF] uppercase tracking-wider">
              1. Choose Situation
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {COMMON_SITUATIONS.map((sit) => {
                const isSelected = selectedSituation === sit.id;
                return (
                  <button
                    key={sit.id}
                    onClick={() => {
                      setSelectedSituation(sit.id);
                      if (!studentExplanation) {
                        setStudentExplanation(sit.exampleExplanation);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#4A8B8D] bg-teal-50/70 dark:bg-teal-950/40 shadow-xs'
                        : 'border-[#E8E4D9] dark:border-[#2F3D42] bg-[#F9F7F2]/60 dark:bg-[#1C2527]/60 hover:bg-[#F0EDE4] dark:hover:bg-[#253235]'
                    }`}
                  >
                    <div>
                      <span className="text-2xl mb-1 block">{sit.emoji}</span>
                      <h4
                        className={`text-xs font-bold ${
                          isSelected ? 'text-[#4A8B8D] dark:text-[#63C1C4]' : 'text-[#2D2D2B] dark:text-[#F3F6F8]'
                        }`}
                      >
                        {sit.title}
                      </h4>
                      <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF] mt-1 line-clamp-2">
                        {sit.shortDesc}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="mt-2 text-[10px] font-bold text-[#4A8B8D] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student's Own Experience / Voice or Text Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#7A756D] dark:text-[#9BA3AF] uppercase tracking-wider">
                2. What do you want your parent to understand?
              </label>
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isRecordingInput
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-[#F0EDE4] dark:bg-[#253235] text-[#7A756D] dark:text-[#9BA3AF] hover:text-[#2D2D2B]'
                }`}
              >
                {isRecordingInput ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecordingInput ? 'Listening... Tap to stop' : 'Speak your thoughts'}</span>
              </button>
            </div>
            <div className="relative">
              <textarea
                value={studentExplanation}
                onChange={(e) => setStudentExplanation(e.target.value)}
                placeholder="e.g. Placement pressure nala romba stress aa irukku. Amma kitta epdi solrathu therila..."
                rows={3}
                className="w-full p-4 rounded-2xl bg-[#F9F7F2] dark:bg-[#1C2527] border border-[#E8E4D9] dark:border-[#2F3D42] text-xs sm:text-sm text-[#2D2D2B] dark:text-[#F3F6F8] focus:outline-none focus:ring-2 focus:ring-[#4A8B8D] transition-all"
              />
              <span className="text-[10px] text-[#7A756D] dark:text-[#9BA3AF] absolute bottom-2.5 right-3">
                Use your natural Tamil / Tanglish / English
              </span>
            </div>
          </div>

          {/* What I Need From My Parent (Checkboxes) */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#7A756D] dark:text-[#9BA3AF] uppercase tracking-wider">
              3. What I need from my parent
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {PARENT_NEEDS_LIST.map((item) => {
                const isChecked = selectedNeeds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleToggleNeed(item.id)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isChecked
                        ? 'border-[#4A8B8D] bg-teal-50/70 dark:bg-teal-950/40 text-[#4A8B8D] dark:text-[#63C1C4] font-bold'
                        : 'border-[#E8E4D9] dark:border-[#2F3D42] bg-[#F9F7F2]/60 dark:bg-[#1C2527]/60 text-[#2D2D2B] dark:text-[#F3F6F8]'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                        isChecked
                          ? 'bg-[#4A8B8D] border-[#4A8B8D] text-white'
                          : 'border-[#CCC8BD] dark:border-[#4B5563]'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone Options */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#7A756D] dark:text-[#9BA3AF] uppercase tracking-wider">
              4. Desired Tone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {TONE_OPTIONS.map((tn) => {
                const isSelected = selectedTone === tn.id;
                return (
                  <button
                    key={tn.id}
                    onClick={() => setSelectedTone(tn.id)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#4A8B8D] bg-teal-50/80 dark:bg-teal-950/50 shadow-xs'
                        : 'border-[#E8E4D9] dark:border-[#2F3D42] bg-[#F9F7F2]/60 dark:bg-[#1C2527]/60 hover:bg-[#F0EDE4] dark:hover:bg-[#253235]'
                    }`}
                  >
                    <span className="text-xl block mb-1">{tn.emoji}</span>
                    <h5
                      className={`text-xs font-bold ${
                        isSelected ? 'text-[#4A8B8D] dark:text-[#63C1C4]' : 'text-[#2D2D2B] dark:text-[#F3F6F8]'
                      }`}
                    >
                      {tn.label}
                    </h5>
                    <p className="text-[10px] text-[#7A756D] dark:text-[#9BA3AF] mt-0.5 line-clamp-1">
                      {tn.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-between border-t border-[#E8E4D9] dark:border-[#223034]">
            <button
              onClick={() => setCurrentStep('start')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#7A756D] hover:text-[#2D2D2B] cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleGenerateMessage}
              disabled={isGenerating}
              className="px-6 py-3 bg-[#4A8B8D] hover:bg-[#3D7375] disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Finding the right words...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Respectful Message</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* 4. Step 3: GENERATED MESSAGE ("SAY IT IN MY WORDS") */}
      {currentStep === 'message' && generatedResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#161E20] rounded-[36px] border border-[#E8E4D9] dark:border-[#223034] p-6 sm:p-8 shadow-sm space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E4D9] dark:border-[#223034] pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentStep('setup')}
                className="w-8 h-8 rounded-full bg-[#F0EDE4] dark:bg-[#253235] flex items-center justify-center text-[#7A756D] hover:text-[#2D2D2B] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A8B8D]">
                  “Say It in My Words”
                </span>
                <h3 className="font-serif italic text-xl sm:text-2xl text-[#2D2D2B] dark:text-[#F3F6F8]">
                  Your Tailored Message
                </h3>
              </div>
            </div>

            {/* Channels Switcher */}
            <div className="flex items-center gap-1 bg-[#F0EDE4] dark:bg-[#253235] p-1 rounded-2xl">
              <button
                onClick={() => handleChannelSwitch('whatsapp')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeChannel === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-[#7A756D] hover:text-[#2D2D2B]'
                }`}
              >
                <span>💬</span>
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => handleChannelSwitch('sms')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeChannel === 'sms'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-[#7A756D] hover:text-[#2D2D2B]'
                }`}
              >
                <span>📱</span>
                <span>SMS</span>
              </button>
              <button
                onClick={() => handleChannelSwitch('inPerson')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeChannel === 'inPerson'
                    ? 'bg-[#4A8B8D] text-white shadow-2xs'
                    : 'text-[#7A756D] hover:text-[#2D2D2B]'
                }`}
              >
                <span>🗣️</span>
                <span>In-Person</span>
              </button>
            </div>
          </div>

          {/* Editable Message Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#7A756D] dark:text-[#9BA3AF]">
                  {activeChannel === 'whatsapp'
                    ? 'WhatsApp Draft (Editable)'
                    : activeChannel === 'sms'
                    ? 'SMS Draft (Editable)'
                    : 'In-Person Conversation Script (Editable)'}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-teal-50 dark:bg-teal-950 text-[#4A8B8D] rounded-full border border-teal-200 dark:border-teal-800 font-bold">
                  {selectedTone} tone
                </span>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-bold text-[#4A8B8D] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Done Editing' : 'Edit Text'}</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                value={editableMessage}
                onChange={(e) => setEditableMessage(e.target.value)}
                rows={6}
                className={`w-full p-4 sm:p-5 rounded-2xl text-xs sm:text-sm text-[#2D2D2B] dark:text-[#F3F6F8] leading-relaxed transition-all font-sans ${
                  isEditing
                    ? 'bg-white dark:bg-[#1A2326] border-2 border-[#4A8B8D] ring-2 ring-teal-100'
                    : 'bg-[#F9F7F2] dark:bg-[#1C2527] border border-[#E8E4D9] dark:border-[#2F3D42]'
                }`}
              />
              <div className="flex items-center justify-between text-[11px] text-[#7A756D] dark:text-[#9BA3AF] px-1 mt-1">
                <span>The final message belongs to you. Never automatically sent.</span>
                <span>{editableMessage.length} characters</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Copy, WhatsApp Helper, Regenerate */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={handleCopyMessage}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#2D2D2B] dark:bg-white text-white dark:text-[#2D2D2B] hover:opacity-90'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : '📋 Copy Message'}</span>
            </button>

            {activeChannel === 'whatsapp' && (
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(editableMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all"
              >
                <span>💬</span>
                <span>Open in WhatsApp</span>
              </a>
            )}

            <button
              onClick={handleGenerateMessage}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl bg-[#F0EDE4] dark:bg-[#253235] text-[#2D2D2B] dark:text-[#F3F6F8] hover:bg-[#E8E4D9] font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>🔄 Regenerate</span>
            </button>
          </div>

          {/* Conversation Tips & Suggested Timing */}
          {generatedResult.tips && generatedResult.tips.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#F9F7F2] dark:bg-[#1C2527] border border-[#E8E4D9] dark:border-[#2F3D42] space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">💡</span>
                <h4 className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                  Tips for Starting the Conversation
                </h4>
              </div>
              <ul className="space-y-1.5 text-xs text-[#7A756D] dark:text-[#9BA3AF]">
                {generatedResult.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#4A8B8D] font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
              {generatedResult.suggestedTiming && (
                <div className="text-[11px] text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 p-2.5 rounded-xl font-medium mt-2">
                  ⏰ <strong>Best Timing:</strong> {generatedResult.suggestedTiming}
                </div>
              )}
            </div>
          )}

          {/* Next Step Banner: Practice Talking to Parent */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-500/10 via-[#4A8B8D]/10 to-teal-500/5 dark:from-teal-950/40 dark:to-[#161E20] border-2 border-[#4A8B8D]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎭</span>
                <h4 className="font-serif italic font-bold text-base text-[#2D2D2B] dark:text-[#F3F6F8]">
                  Nervous about how they might respond?
                </h4>
              </div>
              <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF] max-w-lg">
                Practice the conversation with Mithra first. Mithra will simulate realistic parent questions so you can practice calm, non-defensive replies.
              </p>
            </div>
            <button
              onClick={handleStartSimulation}
              className="px-5 py-3 bg-[#4A8B8D] hover:bg-[#3D7375] text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
            >
              <span>🎭 Practice Talking to Parent</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Secondary Navigation Links */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E4D9] dark:border-[#223034]">
            <span className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
              MindMitra helps you communicate with the people who matter most.
            </span>
            <div className="flex items-center gap-2">
              {onNavigateToTab && (
                <>
                  <button
                    onClick={() => onNavigateToTab('talk-mithra')}
                    className="px-3 py-1.5 rounded-xl bg-[#F0EDE4] dark:bg-[#253235] text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8] hover:bg-[#E8E4D9] cursor-pointer"
                  >
                    🤖 Talk with Mithra
                  </button>
                  <button
                    onClick={() => onNavigateToTab('counselling-prep')}
                    className="px-3 py-1.5 rounded-xl bg-[#F0EDE4] dark:bg-[#253235] text-xs font-bold text-[#4A8B8D] dark:text-[#63C1C4] hover:bg-[#E8E4D9] cursor-pointer"
                  >
                    🎓 Prepare for Counselling
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 5. Step 4: 🎭 PRACTICE TALKING TO PARENT (SIMULATION) */}
      {currentStep === 'simulation' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#161E20] rounded-[36px] border border-[#E8E4D9] dark:border-[#223034] p-6 sm:p-8 shadow-sm space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E4D9] dark:border-[#223034] pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentStep('message')}
                className="w-8 h-8 rounded-full bg-[#F0EDE4] dark:bg-[#253235] flex items-center justify-center text-[#7A756D] hover:text-[#2D2D2B] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎭</span>
                  <h3 className="font-serif italic text-xl sm:text-2xl text-[#2D2D2B] dark:text-[#F3F6F8]">
                    Practice Talking to Parent
                  </h3>
                </div>
                <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
                  Mithra simulates realistic parent reactions and guides you to answer calmly
                </p>
              </div>
            </div>

            {/* Coach Selector */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#F0EDE4] dark:bg-[#253235] p-1 rounded-2xl text-xs">
                <button
                  onClick={() => setSimTrainer('mithra')}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    simTrainer === 'mithra'
                      ? 'bg-white dark:bg-[#161E20] text-[#4A8B8D] dark:text-[#63C1C4] shadow-2xs'
                      : 'text-[#7A756D]'
                  }`}
                >
                  👩 Mithra
                </button>
                <button
                  onClick={() => setSimTrainer('mithran')}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    simTrainer === 'mithran'
                      ? 'bg-white dark:bg-[#161E20] text-[#4A8B8D] dark:text-[#63C1C4] shadow-2xs'
                      : 'text-[#7A756D]'
                  }`}
                >
                  👨 Mithran
                </button>
              </div>
            </div>
          </div>

          {/* Transcript / Dialogue Feed */}
          <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
            {simTurns.map((turn, idx) => (
              <div key={turn.id || idx} className="space-y-2.5">
                {turn.speaker === 'parent' ? (
                  /* Parent Message Bubble */
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-lg shrink-0">
                      👨‍👩‍👦
                    </div>
                    <div className="max-w-[85%] rounded-3xl rounded-tl-sm bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300">
                          Parent (Simulated)
                        </span>
                        <button
                          onClick={() => handleSpeakText(turn.text)}
                          className="text-[#7A756D] hover:text-[#2D2D2B] cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-[#2D2D2B] dark:text-[#F3F6F8] leading-relaxed">
                        {turn.text}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Student Response Bubble */
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-start gap-3 justify-end max-w-[85%]">
                      <div className="rounded-3xl rounded-tr-sm bg-[#4A8B8D] text-white p-4 space-y-1 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-teal-100">You (Student)</span>
                          <span className="text-[10px] text-teal-100/80">{turn.timestamp}</span>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed">{turn.text}</p>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-lg shrink-0">
                        🎓
                      </div>
                    </div>

                    {/* Mithra Coaching Feedback Card */}
                    {turn.feedback && (
                      <div className="max-w-[90%] w-full rounded-2xl bg-[#F9F7F2] dark:bg-[#1C2527] border border-[#E8E4D9] dark:border-[#2F3D42] p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A8B8D] dark:text-[#63C1C4]">
                            <Bot className="w-4 h-4" />
                            <span>{simTrainer === 'mithran' ? 'Mithran’s Coaching' : 'Mithra’s Coaching'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold">
                            <span className="text-emerald-700 dark:text-emerald-400">
                              Calmness: {turn.feedback.calmness}%
                            </span>
                            <span className="text-teal-700 dark:text-teal-400">
                              Clarity: {turn.feedback.clarity}%
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[#2D2D2B] dark:text-[#F3F6F8]">
                          {turn.feedback.coachingTip}
                        </p>

                        {turn.feedback.samplePhrasing && (
                          <div className="bg-white dark:bg-[#161E20] p-2.5 rounded-xl border border-dashed border-[#4A8B8D]/40 text-xs text-[#7A756D] dark:text-[#9BA3AF]">
                            <span className="font-bold text-[#4A8B8D] block text-[10px] mb-0.5">
                              Suggested Calm Alternative:
                            </span>
                            "{turn.feedback.samplePhrasing}"
                            <button
                              onClick={() => setCurrentStudentInput(turn.feedback?.samplePhrasing || '')}
                              className="ml-2 text-[10px] font-bold text-[#4A8B8D] underline cursor-pointer"
                            >
                              Use this phrase
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isSimLoading && (
              <div className="flex items-center gap-2 text-xs text-[#7A756D] dark:text-[#9BA3AF] italic py-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-[#4A8B8D]" />
                <span>Simulating parent response & coaching tips...</span>
              </div>
            )}
          </div>

          {/* Quick Response Starters */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#7A756D] dark:text-[#9BA3AF]">
              Quick Calm Response Starters:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                selectedLang === 'tanglish'
                  ? 'Amma, unga concern puriyudhu. Naan try panren.'
                  : 'I understand your worry, Mom. I am doing my best.',
                selectedLang === 'tanglish'
                  ? 'Konjam calm-aa time kudutha nalla concentrate panna mudiyum.'
                  : 'Having your patient encouragement will help me focus better.',
                selectedLang === 'tanglish'
                  ? 'Naan guidance centre kooda pesalam nu ninaikiren.'
                  : 'I want to build a balanced study routine with college guidance.',
              ].map((starter, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => setCurrentStudentInput(starter)}
                  className="text-[11px] px-3 py-1.5 rounded-xl bg-[#F0EDE4] dark:bg-[#253235] text-[#2D2D2B] dark:text-[#F3F6F8] hover:bg-[#E8E4D9] transition-colors cursor-pointer"
                >
                  "{starter}"
                </button>
              ))}
            </div>
          </div>

          {/* Response Input Controls */}
          <div className="space-y-2 border-t border-[#E8E4D9] dark:border-[#223034] pt-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentStudentInput}
                onChange={(e) => setCurrentStudentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendSimTurn();
                }}
                placeholder={
                  selectedLang === 'tanglish'
                    ? 'Type what you want to say to your parent (e.g. Amma, naan try panren...)'
                    : 'Type how you would respond to your parent...'
                }
                className="flex-1 p-3.5 rounded-2xl bg-[#F9F7F2] dark:bg-[#1C2527] border border-[#E8E4D9] dark:border-[#2F3D42] text-xs sm:text-sm text-[#2D2D2B] dark:text-[#F3F6F8] focus:outline-none focus:ring-2 focus:ring-[#4A8B8D]"
              />

              <button
                onClick={toggleSimVoice}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
                  isSimRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-[#F0EDE4] dark:bg-[#253235] text-[#7A756D] hover:text-[#2D2D2B]'
                }`}
                title="Voice input"
              >
                {isSimRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleSendSimTurn()}
                disabled={!currentStudentInput.trim() || isSimLoading}
                className="p-3.5 rounded-2xl bg-[#4A8B8D] hover:bg-[#3D7375] disabled:opacity-50 text-white shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#7A756D] dark:text-[#9BA3AF]">
              <span>Practice speaking calmly without feeling judged</span>
              <button
                onClick={() => {
                  setPracticeAttemptCount((prev) => prev + 1);
                  handleStartSimulation();
                }}
                className="text-[#4A8B8D] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Practice</span>
              </button>
            </div>
          </div>

          {/* Final Options at End of Practice */}
          <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-[#2D2D2B] dark:text-[#F3F6F8]">
              <strong>Feeling ready?</strong> Copy your message or explore companion support.
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setCurrentStep('message');
                  handleCopyMessage();
                }}
                className="px-3.5 py-1.5 bg-[#4A8B8D] hover:bg-[#3D7375] text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Message</span>
              </button>
              {onNavigateToTab && (
                <>
                  <button
                    onClick={() => onNavigateToTab('talk-mithra')}
                    className="px-3.5 py-1.5 bg-white dark:bg-[#161E20] text-[#2D2D2B] dark:text-[#F3F6F8] rounded-xl text-xs font-bold border border-[#E8E4D9] dark:border-[#2F3D42] cursor-pointer"
                  >
                    Talk with Mithra
                  </button>
                  <button
                    onClick={() => onNavigateToTab('counselling-prep')}
                    className="px-3.5 py-1.5 bg-white dark:bg-[#161E20] text-[#4A8B8D] dark:text-[#63C1C4] rounded-xl text-xs font-bold border border-[#E8E4D9] dark:border-[#2F3D42] cursor-pointer"
                  >
                    Prepare for Counselling
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
