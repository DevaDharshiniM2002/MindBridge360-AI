import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Save,
  Share2,
  Edit3,
  BookOpen,
  MessageSquare,
  Shield,
  Clock,
  ThumbsUp,
  Lightbulb,
  Award,
  Send,
  RefreshCw,
  HelpCircle,
  UserCheck,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  TrainingMode,
  TrainingScenarioId,
  TrainingScenarioItem,
  TrainingTurn,
  CounsellingReadinessScorecard,
  MyCounsellingNotes,
  AppLanguage,
  CounsellorBooking,
} from '../types';
import { CompanionAvatar } from './CompanionAvatar';
import {
  speakText,
  stopSpeaking,
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  playToneCue,
  detectTextLanguage,
  RecognizerInstance,
} from '../utils/speechService';

export const TRAINING_SCENARIOS: TrainingScenarioItem[] = [
  {
    id: 'placement-pressure',
    title: 'Placement Pressure & Coding Anxiety',
    emoji: '💼',
    description: 'Aptitude rounds, technical interviews, company shortlists, and career fears',
    sampleConcern: 'Enakku placement pathi romba stress-aa irukku. Aptitude rounds and coding tests-la clear panna mudiyuma nu bayama irukku.',
    contextTag: 'Placements',
  },
  {
    id: 'exam-stress',
    title: 'Exam Stress & Revision Overwhelm',
    emoji: '📚',
    description: 'Internal assessments, huge portions, memory blanking, and semester exams',
    sampleConcern: 'Next week internal exams irukku, portions romba pending-aa irukku. Padichaalum marandhu pogudhu.',
    contextTag: 'Exams',
  },
  {
    id: 'backlog-anxiety',
    title: 'Backlog Anxiety & Arrear Strain',
    emoji: '🎓',
    description: 'Arrear exams, low GPA, fear of lagging behind batchmates, and self-doubt',
    sampleConcern: 'Previous semester backlogs clear panna mudiyuma nu bayama irukku, batchmates kooda compare panna feel aagudhu.',
    contextTag: 'Arrears',
  },
  {
    id: 'hostel-homesickness',
    title: 'Hostel Life & Homesickness',
    emoji: '🏠',
    description: 'Adjusting to hostel food, missing parents/home, roommate friction, and loneliness',
    sampleConcern: 'Hostel atmosphere set aagala, veetukku poga thonudhu and room-la yaarum kooda connect panna mudila.',
    contextTag: 'Hostel',
  },
  {
    id: 'family-expectations',
    title: 'Family Expectations & Parental Pressure',
    emoji: '👨‍👩‍👧',
    description: 'High expectations from parents, financial stress, comparison with relatives',
    sampleConcern: 'Veetla 9+ CGPA edukkanum nu expect panraanga, aana stress handle panna mudiyama suffer panren.',
    contextTag: 'Family',
  },
  {
    id: 'career-confusion',
    title: 'Career Confusion & Future Direction',
    emoji: '🧭',
    description: 'Confused between core engineering, IT, higher studies (GATE/GRE), or startup',
    sampleConcern: 'Final year vandhudhu, aana core field-la poganuma illai IT coding learn pannanuma nu clear idea illa.',
    contextTag: 'Career',
  },
  {
    id: 'study-sleep',
    title: 'Study/Sleep Routine & Burnout',
    emoji: '😴',
    description: 'Late-night caffeine study, 4-hour sleep cycles, daytime brain fog, and exhaustion',
    sampleConcern: 'Daily 3-4 hours dhaan thoonguren. Class-la concentrate panna mudila, full-aa tired-aa irukku.',
    contextTag: 'Sleep',
  },
  {
    id: 'social-difficulties',
    title: 'Social Anxiety & Campus Hesitation',
    emoji: '🤝',
    description: 'Hesitation speaking in seminars, making college friends, team project stress',
    sampleConcern: 'Project team meetings and seminar presentations-la pesanum-na heart beat fast aagi voice tremble aagudhu.',
    contextTag: 'Social',
  },
  {
    id: 'custom',
    title: 'My Custom Situation',
    emoji: '✏️',
    description: 'Describe any unique college or personal situation in your own words',
    sampleConcern: '',
    contextTag: 'Personal',
  },
];

interface CounsellorTrainingSimulatorProps {
  initialContext?: string;
  initialLanguage?: AppLanguage;
  onBookRealCounsellor?: (notes?: MyCounsellingNotes) => void;
  onClose?: () => void;
  onOpenCrisisBar?: () => void;
}

export const CounsellorTrainingSimulator: React.FC<CounsellorTrainingSimulatorProps> = ({
  initialContext,
  initialLanguage = 'en',
  onBookRealCounsellor,
  onClose,
  onOpenCrisisBar,
}) => {
  // Stage: 'setup' | 'practice' | 'scorecard' | 'notes'
  const [stage, setStage] = useState<'setup' | 'practice' | 'scorecard' | 'notes'>('setup');

  // Setup Options
  const [selectedTrainer, setSelectedTrainer] = useState<'mithra' | 'mithran'>('mithra');
  const [selectedMode, setSelectedMode] = useState<TrainingMode>('beginner');
  const [selectedScenario, setSelectedScenario] = useState<TrainingScenarioItem>(TRAINING_SCENARIOS[0]);
  const [customScenarioText, setCustomScenarioText] = useState('');
  const [language, setLanguage] = useState<AppLanguage>(initialLanguage);
  const [usePreviousConversation, setUsePreviousConversation] = useState<boolean>(!!initialContext);

  // Practice State
  const [turns, setTurns] = useState<TrainingTurn[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('What brings you here today?');
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [interimSpeech, setInterimSpeech] = useState<string>('');
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [visemeIndex, setVisemeIndex] = useState<number | undefined>(undefined);
  const [voiceMuted, setVoiceMuted] = useState<boolean>(false);
  const [isProcessingTurn, setIsProcessingTurn] = useState<boolean>(false);

  // Try Again / Retry State
  const [isRetryingTurn, setIsRetryingTurn] = useState<boolean>(false);
  const [firstAttemptText, setFirstAttemptText] = useState<string>('');
  const [attemptComparisonNote, setAttemptComparisonNote] = useState<string | null>(null);

  // Final Results & Notes State
  const [scorecard, setScorecard] = useState<CounsellingReadinessScorecard | null>(null);
  const [counsellingNotes, setCounsellingNotes] = useState<MyCounsellingNotes | null>(null);
  const [copiedNotes, setCopiedNotes] = useState<boolean>(false);
  const [savedNotes, setSavedNotes] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);

  // Emergency safety flag
  const [isSafetyTriggered, setIsSafetyTriggered] = useState<boolean>(false);

  const recognizerRef = useRef<RecognizerInstance | null>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopSpeaking();
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Speak trainer question with audio cues and visemes
  const speakTrainerQuestion = (text: string) => {
    if (voiceMuted) return;
    playToneCue('speak');
    setAvatarState('speaking');
    speakText({
      text,
      gender: selectedTrainer === 'mithra' ? 'female' : 'male',
      language,
      onStart: () => {
        if (isMountedRef.current) setAvatarState('speaking');
      },
      onViseme: (v) => {
        if (isMountedRef.current) setVisemeIndex(v);
      },
      onEnd: () => {
        if (isMountedRef.current) {
          setAvatarState('idle');
          setVisemeIndex(undefined);
        }
      },
      onError: () => {
        if (isMountedRef.current) {
          setAvatarState('idle');
          setVisemeIndex(undefined);
        }
      },
    });
  };

  // Start Training Session
  const handleStartTraining = () => {
    stopSpeaking();
    const scenario = selectedScenario.id === 'custom' && customScenarioText.trim()
      ? { ...selectedScenario, title: customScenarioText.trim(), sampleConcern: customScenarioText.trim() }
      : selectedScenario;

    let initialQ = 'What brings you here today?';
    if (language === 'ta') {
      initialQ = 'வணக்கம்! இன்று நீங்கள் எதைப் பற்றி பேச விரும்புகிறீர்கள்?';
    } else if (language === 'tanglish') {
      initialQ = 'Hello! Innaiku enna vishayam pathi discuss panna vandhurukkinga?';
    }

    // If student chose to practice using previous conversation
    if (usePreviousConversation && initialContext) {
      if (language === 'tanglish') {
        initialQ = `Previous chat-la sonna maadhiri, unga concern pathi innum konjam detail-aa share panna mudiyuma? What brings you in today?`;
      } else if (language === 'ta') {
        initialQ = `முந்தைய உரையாடலில் பகிர்ந்தது போல, உங்கள் மனநிலையைப் பற்றி விரிவாகப் பேசலாமா?`;
      } else {
        initialQ = `Building on what you shared earlier, could you walk me through what's been weighing on your mind recently?`;
      }
    }

    setTurns([]);
    setCurrentQuestion(initialQ);
    setQuestionIndex(0);
    setInputValue('');
    setIsRetryingTurn(false);
    setFirstAttemptText('');
    setAttemptComparisonNote(null);
    setStage('practice');

    setTimeout(() => {
      speakTrainerQuestion(initialQ);
    }, 400);
  };

  // Toggle Live Voice Input
  const handleToggleVoiceInput = () => {
    if (isRecording) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
        recognizerRef.current = null;
      }
      setIsRecording(false);
      setAvatarState('idle');
      if (interimSpeech.trim()) {
        setInputValue((prev) => (prev ? `${prev} ${interimSpeech}` : interimSpeech));
        setInterimSpeech('');
      }
    } else {
      stopSpeaking();
      playToneCue('listen');
      setIsRecording(true);
      setAvatarState('listening');
      setInterimSpeech('');

      const langParam = language === 'ta' ? 'ta' : language === 'tanglish' ? 'tanglish' : 'en';

      const recognizer = createSpeechRecognizer({
        language: langParam,
        onStart: () => {
          if (isMountedRef.current) {
            setIsRecording(true);
            setAvatarState('listening');
          }
        },
        onResult: (transcript, isFinal) => {
          if (!isMountedRef.current) return;
          if (isFinal) {
            setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
            setInterimSpeech('');
          } else {
            setInterimSpeech(transcript);
          }
        },
        onError: (err) => {
          console.warn('Speech recognition error:', err);
          if (isMountedRef.current) {
            setIsRecording(false);
            setAvatarState('idle');
          }
        },
        onEnd: () => {
          if (isMountedRef.current) {
            setIsRecording(false);
            setAvatarState('idle');
          }
        },
      });

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
      }
    }
  };

  // Submit Answer for practice turn
  const handleSubmitAnswer = async (answerText?: string) => {
    const textToSubmit = (answerText || inputValue || interimSpeech).trim();
    if (!textToSubmit || isProcessingTurn) return;

    if (isRecording && recognizerRef.current) {
      recognizerRef.current.stop();
      recognizerRef.current = null;
      setIsRecording(false);
    }

    stopSpeaking();
    setAvatarState('thinking');
    setIsProcessingTurn(true);

    // Crisis / Safety check
    const lower = textToSubmit.toLowerCase();
    if (
      lower.includes('suicide') ||
      lower.includes('end my life') ||
      lower.includes('kill myself') ||
      lower.includes('self harm') ||
      lower.includes('valkaila vaala pidikala') ||
      lower.includes('uyira vitralam')
    ) {
      setIsSafetyTriggered(true);
      setIsProcessingTurn(false);
      setAvatarState('idle');
      return;
    }

    try {
      const payload = {
        trainer: selectedTrainer,
        mode: selectedMode,
        scenario: selectedScenario,
        questionIndex,
        currentQuestion,
        studentAnswer: textToSubmit,
        history: turns.map((t) => ({
          question: t.question,
          studentAnswer: t.studentAnswer,
          feedback: t.feedback?.feedbackText,
        })),
        isRetry: isRetryingTurn,
        previousAttemptAnswer: firstAttemptText,
        language,
      };

      const res = await fetch('/api/counsellor-training/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      const newTurn: TrainingTurn = {
        id: `turn-${Date.now()}`,
        questionIndex,
        question: currentQuestion,
        studentAnswer: textToSubmit,
        answerMode: isRecording ? 'voice' : 'text',
        firstAttemptAnswer: isRetryingTurn ? firstAttemptText : undefined,
        feedback: data.feedback,
        timestamp: new Date().toISOString(),
      };

      const updatedTurns = [...turns, newTurn];
      setTurns(updatedTurns);
      setInputValue('');
      setInterimSpeech('');

      if (data.attemptComparison) {
        setAttemptComparisonNote(data.attemptComparison);
      }

      setIsRetryingTurn(false);
      setFirstAttemptText('');

      if (data.isCompleted) {
        // Session complete! Generate Scorecard & Notes
        await handleGenerateFinalResults(updatedTurns);
      } else {
        setCurrentQuestion(data.nextQuestion);
        setQuestionIndex((prev) => prev + 1);
        setIsProcessingTurn(false);
        setAvatarState('idle');
        setTimeout(() => {
          speakTrainerQuestion(data.nextQuestion);
        }, 500);
      }
    } catch (e) {
      console.error('Error processing turn:', e);
      setIsProcessingTurn(false);
      setAvatarState('idle');
    }
  };

  // Trigger "Try Again"
  const handleTryAgain = () => {
    if (turns.length === 0) return;
    stopSpeaking();
    const lastTurn = turns[turns.length - 1];
    setFirstAttemptText(lastTurn.studentAnswer);
    setIsRetryingTurn(true);
    setCurrentQuestion(lastTurn.question);
    setInputValue('');
    setInterimSpeech('');
    playToneCue('speak');

    // Remove last turn from history to let student overwrite with their improved attempt
    setTurns((prev) => prev.slice(0, -1));
    setQuestionIndex((prev) => Math.max(0, prev - 1));

    setTimeout(() => {
      speakTrainerQuestion(
        language === 'tanglish'
          ? `Kandippa! Adhey question-ai innum konjam clear-aa try pannunga: ${lastTurn.question}`
          : `Let's practice again. Take a breath and build on your thoughts: ${lastTurn.question}`
      );
    }, 300);
  };

  // Generate Final Scorecard and My Counselling Notes
  const handleGenerateFinalResults = async (finalTurns: TrainingTurn[]) => {
    try {
      const res = await fetch('/api/counsellor-training/generate-scorecard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainer: selectedTrainer,
          mode: selectedMode,
          scenario: selectedScenario,
          turns: finalTurns,
          language,
        }),
      });

      const data = await res.json();
      setScorecard(data.scorecard);

      const notes: MyCounsellingNotes = {
        id: `note-${Date.now()}`,
        mainConcern: data.notes?.mainConcern || selectedScenario.title,
        whatIAmExperiencing: data.notes?.whatIAmExperiencing || '',
        whatTriggersIt: data.notes?.whatTriggersIt || '',
        howItAffectsMe: data.notes?.howItAffectsMe || '',
        whatIHaveTried: data.notes?.whatIHaveTried || '',
        whatIWantHelpWith: data.notes?.whatIWantHelpWith || '',
        scenarioTitle: selectedScenario.title,
        trainerName: selectedTrainer === 'mithran' ? 'Mithran' : 'Mithra',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSharedWithCounsellor: false,
      };

      setCounsellingNotes(notes);
      setIsProcessingTurn(false);
      setAvatarState('idle');
      setStage('scorecard');
      playToneCue('end');
    } catch (e) {
      console.error('Error generating scorecard:', e);
      setIsProcessingTurn(false);
      setAvatarState('idle');
      setStage('scorecard');
    }
  };

  // Copy notes to clipboard
  const handleCopyNotes = () => {
    if (!counsellingNotes) return;
    const formatted = `=== MindMitra Counselling Readiness Notes ===
• Main Concern: ${counsellingNotes.mainConcern}
• What I am Experiencing: ${counsellingNotes.whatIAmExperiencing}
• What Triggers It: ${counsellingNotes.whatTriggersIt}
• How It Affects Me: ${counsellingNotes.howItAffectsMe}
• What I Have Tried: ${counsellingNotes.whatIHaveTried}
• What I Want Help With: ${counsellingNotes.whatIWantHelpWith}
Generated on: ${new Date().toLocaleDateString()} via MindMitra Training Simulator`;

    navigator.clipboard.writeText(formatted);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2500);
  };

  // Save notes locally
  const handleSaveNotes = () => {
    if (!counsellingNotes) return;
    try {
      const existingStr = localStorage.getItem('mindmitra_saved_counselling_notes') || '[]';
      const existing = JSON.parse(existingStr);
      existing.unshift(counsellingNotes);
      localStorage.setItem('mindmitra_saved_counselling_notes', JSON.stringify(existing.slice(0, 10)));
      setSavedNotes(true);
      setTimeout(() => setSavedNotes(false), 2500);
    } catch (e) {}
  };

  // Share with counsellor action
  const handleConfirmShareWithCounsellor = () => {
    if (counsellingNotes) {
      setCounsellingNotes({
        ...counsellingNotes,
        isSharedWithCounsellor: true,
        sharedAt: new Date().toISOString(),
      });
    }
    setIsShareModalOpen(false);
    onBookRealCounsellor?.(counsellingNotes || undefined);
  };

  return (
    <div className="w-full space-y-5 pb-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner & Safety Disclaimer */}
      <div className="bg-white dark:bg-[#161E20] rounded-3xl p-4 sm:p-5 border border-[#E8E4D9] dark:border-[#263539] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-xl border border-teal-200 dark:border-teal-800 shrink-0">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                  Counsellor Training Simulator
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 rounded-full border border-teal-200 dark:border-teal-700">
                  Module 5
                </span>
              </div>
              <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
                Not sure what a counsellor may ask? Practice here before your real session.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {stage !== 'setup' && (
              <button
                onClick={() => {
                  stopSpeaking();
                  setStage('setup');
                }}
                className="px-3 py-1.5 rounded-xl border border-[#E8E4D9] dark:border-[#2F3D42] text-xs font-semibold text-[#7A756D] hover:text-[#2D2D2B] dark:hover:text-white bg-[#F9F7F2] dark:bg-[#1E292B] cursor-pointer transition-all flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Setup</span>
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl border border-[#E8E4D9] dark:border-[#2F3D42] text-xs font-semibold text-[#7A756D] hover:text-[#2D2D2B] cursor-pointer"
              >
                Back
              </button>
            )}
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="mt-3 pt-3 border-t border-[#F0EDE4] dark:border-[#202C2F] flex items-center gap-2 text-[11px] text-[#7A756D] dark:text-[#9BA3AF]">
          <Shield className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>
            <strong>Practice Tool Notice:</strong> This is an interactive communication training simulator, not professional psychological counselling or medical diagnosis.
          </span>
        </div>
      </div>

      {/* EMERGENCY CRISIS OVERLAY (If triggered) */}
      <AnimatePresence>
        {isSafetyTriggered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/80 border-2 border-rose-300 dark:border-rose-800 space-y-4 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-rose-900 dark:text-rose-200">
                  You are not alone. Immediate support is available right now.
                </h3>
                <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                  We noticed you may be going through intense distress. Training practice has been paused so you can connect with compassionate 24/7 professional support directly.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href="tel:14416"
                className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-between shadow-xs transition-all"
              >
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-rose-200">24/7 Tele-MANAS Helpline</span>
                  <span className="text-sm">Call 14416 (Toll-Free)</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="tel:18005990019"
                className="p-3.5 rounded-2xl bg-white dark:bg-[#1E292B] border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 font-bold text-xs flex items-center justify-between shadow-xs transition-all"
              >
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#7A756D]">KIRAN Mental Health</span>
                  <span className="text-sm">Call 1800-599-0019</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setIsSafetyTriggered(false)}
                className="text-xs text-rose-700 dark:text-rose-400 underline font-medium cursor-pointer"
              >
                Return to Simulator
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* STAGE 1: SETUP SCREEN */}
      {/* ========================================================================= */}
      {stage === 'setup' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Previous Conversation Alert (If coming from Module 4) */}
          {initialContext && (
            <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-teal-900 dark:text-teal-200 block">
                    Connected from Mithra AI Conversation
                  </span>
                  <span className="text-teal-700 dark:text-teal-400">
                    "{initialContext.slice(0, 90)}..."
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setUsePreviousConversation(true)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    usePreviousConversation
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-[#1A2326] text-[#7A756D] border border-teal-200'
                  }`}
                >
                  Use this conversation
                </button>
                <button
                  onClick={() => setUsePreviousConversation(false)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !usePreviousConversation
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-[#1A2326] text-[#7A756D] border border-teal-200'
                  }`}
                >
                  Start Fresh
                </button>
              </div>
            </div>
          )}

          {/* 1. CHOOSE TRAINER */}
          <div className="bg-white dark:bg-[#161E20] rounded-3xl p-5 border border-[#E8E4D9] dark:border-[#263539] space-y-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#7A756D] dark:text-[#9BA3AF]">
              1. Choose Your AI Trainer
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Mithra Female Trainer */}
              <div
                onClick={() => setSelectedTrainer('mithra')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                  selectedTrainer === 'mithra'
                    ? 'border-[#4A8B8D] bg-teal-50/50 dark:bg-teal-950/40 shadow-xs'
                    : 'border-[#E8E4D9] dark:border-[#2F3D42] bg-white dark:bg-[#1A2326] hover:border-teal-300'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center p-1 border border-teal-300 shrink-0">
                  <CompanionAvatar avatar="mithra" emotion="happy" size="sm" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                      👩 Mithra (மித்ரா)
                    </h4>
                    {selectedTrainer === 'mithra' && (
                      <CheckCircle2 className="w-4 h-4 text-[#4A8B8D]" />
                    )}
                  </div>
                  <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
                    Female Trainer • Warm, patient, and soothing guidance
                  </p>
                </div>
              </div>

              {/* Mithran Male Trainer */}
              <div
                onClick={() => setSelectedTrainer('mithran')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                  selectedTrainer === 'mithran'
                    ? 'border-[#4A8B8D] bg-teal-50/50 dark:bg-teal-950/40 shadow-xs'
                    : 'border-[#E8E4D9] dark:border-[#2F3D42] bg-white dark:bg-[#1A2326] hover:border-teal-300'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center p-1 border border-teal-300 shrink-0">
                  <CompanionAvatar avatar="mithran" emotion="happy" size="sm" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                      👨 Mithran (மித்ரன்)
                    </h4>
                    {selectedTrainer === 'mithran' && (
                      <CheckCircle2 className="w-4 h-4 text-[#4A8B8D]" />
                    )}
                  </div>
                  <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
                    Male Trainer • Grounded, reassuring, and practical tone
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. CHOOSE TRAINING MODE */}
          <div className="bg-white dark:bg-[#161E20] rounded-3xl p-5 border border-[#E8E4D9] dark:border-[#263539] space-y-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#7A756D] dark:text-[#9BA3AF]">
              2. Select Training Mode
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Beginner */}
              <div
                onClick={() => setSelectedMode('beginner')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                  selectedMode === 'beginner'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs'
                    : 'border-[#E8E4D9] dark:border-[#2F3D42] bg-white dark:bg-[#1A2326] hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">🟢</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                    3 Questions
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                  Beginner Practice
                </h4>
                <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF] leading-relaxed">
                  Basic counselling questions and simple step-by-step practice.
                </p>
              </div>

              {/* Intermediate */}
              <div
                onClick={() => setSelectedMode('intermediate')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                  selectedMode === 'intermediate'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 shadow-xs'
                    : 'border-[#E8E4D9] dark:border-[#2F3D42] bg-white dark:bg-[#1A2326] hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">🟡</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300">
                    4 Questions
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                  Intermediate Depth
                </h4>
                <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF] leading-relaxed">
                  More detailed questions based on your selected campus concern.
                </p>
              </div>

              {/* Real Session Simulation */}
              <div
                onClick={() => setSelectedMode('simulation')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                  selectedMode === 'simulation'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 shadow-xs'
                    : 'border-[#E8E4D9] dark:border-[#2F3D42] bg-white dark:bg-[#1A2326] hover:border-rose-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">🔴</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-300">
                    Full Session (5Q)
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                  Real Simulation
                </h4>
                <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF] leading-relaxed">
                  Simulate a realistic counselling conversation from beginning to end.
                </p>
              </div>
            </div>
          </div>

          {/* 3. CHOOSE SCENARIO */}
          <div className="bg-white dark:bg-[#161E20] rounded-3xl p-5 border border-[#E8E4D9] dark:border-[#263539] space-y-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#7A756D] dark:text-[#9BA3AF]">
              3. Select Practice Scenario
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {TRAINING_SCENARIOS.map((sc) => {
                const isSelected = selectedScenario.id === sc.id;
                return (
                  <div
                    key={sc.id}
                    onClick={() => setSelectedScenario(sc)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#4A8B8D] bg-teal-50/40 dark:bg-teal-950/40 shadow-2xs ring-1 ring-teal-500'
                        : 'border-[#E8E4D9] dark:border-[#2F3D42] bg-[#F9F7F2]/60 dark:bg-[#1E292B]/60 hover:bg-white dark:hover:bg-[#1E292B]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl">{sc.emoji}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E8E4D9] dark:bg-[#253235] text-[#2D2D2B] dark:text-[#F3F6F8]">
                          {sc.contextTag}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                        {sc.title}
                      </h4>
                      <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF] mt-1 line-clamp-2">
                        {sc.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Scenario Input */}
            {selectedScenario.id === 'custom' && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1">
                  Describe your situation in your own words:
                </label>
                <textarea
                  rows={3}
                  value={customScenarioText}
                  onChange={(e) => setCustomScenarioText(e.target.value)}
                  placeholder="e.g. I am anxious about presenting my final year project viva and blanking out in front of external examiners..."
                  className="w-full p-3 rounded-2xl bg-[#F9F7F2] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] text-xs sm:text-sm text-[#2D2D2B] dark:text-[#F3F6F8] focus:ring-2 focus:ring-[#4A8B8D] outline-none"
                />
              </div>
            )}
          </div>

          {/* 4. LANGUAGE SELECTOR */}
          <div className="bg-white dark:bg-[#161E20] rounded-3xl p-5 border border-[#E8E4D9] dark:border-[#263539] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                Preferred Conversation Language
              </h3>
              <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF]">
                The trainer adapts naturally if you mix English, Tamil, and Tanglish during practice.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-[#F0EDE4] dark:bg-[#253235] p-1 rounded-2xl">
              {(['en', 'tanglish', 'ta'] as AppLanguage[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    language === l
                      ? 'bg-white dark:bg-[#1A2326] text-[#4A8B8D] dark:text-[#63C1C4] shadow-2xs'
                      : 'text-[#7A756D] hover:text-[#2D2D2B]'
                  }`}
                >
                  {l === 'en' ? 'English' : l === 'tanglish' ? 'Tanglish (தமிழ்+Eng)' : 'தமிழ் (Tamil)'}
                </button>
              ))}
            </div>
          </div>

          {/* START TRAINING BUTTON */}
          <div className="pt-2">
            <button
              onClick={handleStartTraining}
              className="w-full py-4 px-6 rounded-2xl bg-[#4A8B8D] hover:bg-[#3E7678] active:scale-[0.99] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer"
            >
              <span>🎓</span>
              <span>Start Counsellor Training Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 2: LIVE INTERACTIVE PRACTICE STAGE */}
      {/* ========================================================================= */}
      {stage === 'practice' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Progress Header Bar */}
          <div className="bg-white dark:bg-[#161E20] rounded-2xl px-4 py-3 border border-[#E8E4D9] dark:border-[#263539] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                {selectedTrainer === 'mithran' ? '👨 Trainer Mithran' : '👩 Trainer Mithra'}
              </span>
              <span className="text-[#7A756D]">•</span>
              <span className="text-[#7A756D] dark:text-[#9BA3AF]">
                {selectedScenario.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-teal-700 dark:text-teal-300">
                Question {questionIndex + 1} of {selectedMode === 'beginner' ? 3 : selectedMode === 'intermediate' ? 4 : 5}
              </span>
              <button
                onClick={() => setVoiceMuted(!voiceMuted)}
                className="p-1.5 rounded-lg border border-[#E8E4D9] dark:border-[#2F3D42] text-[#7A756D] hover:text-[#2D2D2B] cursor-pointer"
                title={voiceMuted ? 'Unmute Trainer Voice' : 'Mute Trainer Voice'}
              >
                {voiceMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Trainer Avatar & Question Card */}
          <div className="bg-white dark:bg-[#161E20] rounded-3xl p-5 sm:p-6 border border-[#E8E4D9] dark:border-[#263539] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Human-Like AI Avatar */}
              <div className="shrink-0 relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-linear-to-b from-teal-50 to-teal-100 dark:from-teal-950 dark:to-[#121A1C] flex items-center justify-center p-1.5 border-2 border-teal-200 dark:border-teal-800 shadow-xs">
                  <CompanionAvatar
                    avatar={selectedTrainer === 'mithran' ? 'mithran' : 'mithra'}
                    emotion={
                      avatarState === 'speaking'
                        ? 'happy'
                        : avatarState === 'listening'
                        ? 'listening'
                        : avatarState === 'thinking'
                        ? 'concerned'
                        : 'happy'
                    }
                    state={avatarState}
                    lipSyncValue={visemeIndex !== undefined ? visemeIndex / 5 : undefined}
                    size="xl"
                    isAnimated
                  />
                </div>
                {avatarState === 'speaking' && (
                  <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-teal-600 text-white text-[9px] font-bold shadow-xs animate-bounce">
                    Speaking
                  </span>
                )}
                {avatarState === 'listening' && (
                  <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-bold shadow-xs animate-pulse">
                    Listening
                  </span>
                )}
              </div>

              {/* Current Question Bubble */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    Counsellor Practice Question
                  </span>
                  {isRetryingTurn && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 border border-amber-200">
                      🔄 Try Again Mode
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-xl font-serif font-bold text-[#2D2D2B] dark:text-[#F3F6F8] leading-snug">
                  "{currentQuestion}"
                </h3>

                <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF]">
                  Speak or type your honest answer as you would in a real session. Take your time.
                </p>
              </div>
            </div>

            {/* Replay Question Button */}
            <div className="flex justify-center sm:justify-end">
              <button
                onClick={() => speakTrainerQuestion(currentQuestion)}
                className="px-3 py-1 rounded-xl text-xs text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950 border border-teal-200 dark:border-teal-800 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Repeat Question Voice</span>
              </button>
            </div>
          </div>

          {/* Retry Comparison Note (If just completed a Try Again) */}
          {attemptComparisonNote && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">First attempt → Improved attempt:</span>
                <span>{attemptComparisonNote}</span>
              </div>
            </div>
          )}

          {/* Quick Demo Helper Hint */}
          {questionIndex === 0 && turns.length === 0 && (
            <div className="p-3 rounded-2xl bg-[#F0EDE4] dark:bg-[#1E292B] border border-[#E8E4D9] dark:border-[#2F3D42] text-xs text-[#7A756D] dark:text-[#9BA3AF] flex items-center justify-between gap-2">
              <span>
                💡 <strong>Try this:</strong> Click the voice mic or tap sample answer:
              </span>
              <button
                onClick={() => setInputValue(selectedScenario.sampleConcern || 'Enakku placement pathi romba stress-aa irukku.')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#161E20] border border-[#E8E4D9] text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-50 cursor-pointer shrink-0"
              >
                Insert Sample ({selectedScenario.contextTag})
              </button>
            </div>
          )}

          {/* Student Answer Input Box */}
          <div className="bg-white dark:bg-[#161E20] rounded-3xl p-4 sm:p-5 border border-[#E8E4D9] dark:border-[#263539] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7A756D] dark:text-[#9BA3AF]">
                Your Answer (Voice or Text)
              </label>

              {isRecording && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  <span>Live Microphone Active...</span>
                </div>
              )}
            </div>

            {/* Textarea for typing or voice review */}
            <textarea
              rows={3}
              value={interimSpeech ? `${inputValue} ${interimSpeech}` : inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                language === 'ta'
                  ? 'உங்கள் பதிலை இங்கு தட்டச்சு செய்யவும் அல்லது மைக் மூலம் பேசவும்...'
                  : language === 'tanglish'
                  ? 'Type pannunga or mic use panni unga answer-ai pesunga...'
                  : 'Speak into the mic or type your answer clearly here...'
              }
              className="w-full p-3.5 rounded-2xl bg-[#F9F7F2] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] text-xs sm:text-sm text-[#2D2D2B] dark:text-[#F3F6F8] focus:ring-2 focus:ring-[#4A8B8D] outline-none leading-relaxed"
            />

            {/* Voice & Submit Actions */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={handleToggleVoiceInput}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-200 dark:ring-rose-900 animate-pulse'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isRecording ? 'Stop Recording' : '🎙️ Answer with Voice'}</span>
              </button>

              <div className="flex items-center gap-2">
                {turns.length > 0 && !isRetryingTurn && (
                  <button
                    onClick={handleTryAgain}
                    className="px-3.5 py-2.5 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100 cursor-pointer transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>🔄 Try Again</span>
                  </button>
                )}

                <button
                  onClick={() => handleSubmitAnswer()}
                  disabled={(!inputValue.trim() && !interimSpeech.trim()) || isProcessingTurn}
                  className="px-5 py-2.5 rounded-2xl bg-[#4A8B8D] hover:bg-[#3E7678] disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  {isProcessingTurn ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isProcessingTurn ? 'Trainer Listening...' : 'Submit Answer'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* RECENT TRAINER FEEDBACK CARD (After previous answer) */}
          {turns.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-linear-to-br from-amber-50/70 via-white to-teal-50/50 dark:from-[#1E292B] dark:via-[#161E20] dark:to-[#182326] rounded-3xl p-4 sm:p-5 border border-amber-200/80 dark:border-amber-900/50 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">💡</span>
                  <h4 className="text-xs sm:text-sm font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                    Trainer Communication Feedback
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-[#7A756D] dark:text-[#9BA3AF]">
                  Non-Clinical Communication Assessment
                </span>
              </div>

              {/* Feedback text */}
              <p className="text-xs text-[#2D2D2B] dark:text-[#E2E8F0] leading-relaxed">
                "{turns[turns.length - 1].feedback?.feedbackText}"
              </p>

              {/* Communication metrics */}
              {turns[turns.length - 1].feedback && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="bg-white/80 dark:bg-[#12181A]/80 p-2 rounded-xl border border-[#E8E4D9] dark:border-[#2F3D42] text-center">
                    <span className="text-[10px] text-[#7A756D] block">Clarity</span>
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                      {turns[turns.length - 1].feedback?.clarity}%
                    </span>
                  </div>
                  <div className="bg-white/80 dark:bg-[#12181A]/80 p-2 rounded-xl border border-[#E8E4D9] dark:border-[#2F3D42] text-center">
                    <span className="text-[10px] text-[#7A756D] block">Completeness</span>
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                      {turns[turns.length - 1].feedback?.completeness}%
                    </span>
                  </div>
                  <div className="bg-white/80 dark:bg-[#12181A]/80 p-2 rounded-xl border border-[#E8E4D9] dark:border-[#2F3D42] text-center">
                    <span className="text-[10px] text-[#7A756D] block">Expression</span>
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                      {turns[turns.length - 1].feedback?.expression}%
                    </span>
                  </div>
                  <div className="bg-white/80 dark:bg-[#12181A]/80 p-2 rounded-xl border border-[#E8E4D9] dark:border-[#2F3D42] text-center">
                    <span className="text-[10px] text-[#7A756D] block">Confidence</span>
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                      {turns[turns.length - 1].feedback?.confidence}%
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Quick Option to Complete Early & View Scorecard */}
          {turns.length >= 2 && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => handleGenerateFinalResults(turns)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-[#1A2326] border border-[#E8E4D9] dark:border-[#2F3D42] text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-50 cursor-pointer shadow-2xs"
              >
                🏁 Finish Practice Early & View Readiness Scorecard
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 3: FINAL SESSION SCORECARD */}
      {/* ========================================================================= */}
      {stage === 'scorecard' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="bg-linear-to-br from-teal-600 via-[#4A8B8D] to-[#3E7678] text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <h3 className="text-lg sm:text-xl font-serif font-bold">
                    Your Counselling Readiness
                  </h3>
                  <p className="text-xs text-teal-100">
                    Training practice completed with {selectedTrainer === 'mithran' ? 'Trainer Mithran' : 'Trainer Mithra'}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold tracking-wide backdrop-blur-xs">
                {scorecard?.readinessBadge || 'Well-Prepared'}
              </span>
            </div>

            {/* Scorecard Metric Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white/10 rounded-2xl p-3 border border-white/15 backdrop-blur-xs text-center">
                <span className="text-[11px] text-teal-100 block">Clarity</span>
                <span className="text-xl font-bold text-white">
                  {scorecard?.clarity || 88}%
                </span>
                <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-300 h-full rounded-full"
                    style={{ width: `${scorecard?.clarity || 88}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-3 border border-white/15 backdrop-blur-xs text-center">
                <span className="text-[11px] text-teal-100 block">Confidence</span>
                <span className="text-xl font-bold text-white">
                  {scorecard?.confidence || 85}%
                </span>
                <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-300 h-full rounded-full"
                    style={{ width: `${scorecard?.confidence || 85}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-3 border border-white/15 backdrop-blur-xs text-center">
                <span className="text-[11px] text-teal-100 block">Expression</span>
                <span className="text-xl font-bold text-white">
                  {scorecard?.expression || 90}%
                </span>
                <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-300 h-full rounded-full"
                    style={{ width: `${scorecard?.expression || 90}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-3 border border-white/15 backdrop-blur-xs text-center">
                <span className="text-[11px] text-teal-100 block">Communication</span>
                <span className="text-xl font-bold text-white">
                  {scorecard?.communication || 87}%
                </span>
                <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-300 h-full rounded-full"
                    style={{ width: `${scorecard?.communication || 87}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Observations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* What you did well */}
            <div className="bg-white dark:bg-[#161E20] rounded-3xl p-5 border border-[#E8E4D9] dark:border-[#263539] space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="text-sm font-bold">What you did well</h4>
              </div>
              <ul className="space-y-2 text-xs text-[#2D2D2B] dark:text-[#E2E8F0]">
                {scorecard?.whatYouDidWell?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                )) || (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>Clearly identified the core stressor without minimizing feelings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>Expressed authentic emotional awareness and study challenges honestly</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* What you can improve */}
            <div className="bg-white dark:bg-[#161E20] rounded-3xl p-5 border border-[#E8E4D9] dark:border-[#263539] space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Lightbulb className="w-5 h-5" />
                <h4 className="text-sm font-bold">What you can improve</h4>
              </div>
              <ul className="space-y-2 text-xs text-[#2D2D2B] dark:text-[#E2E8F0]">
                {scorecard?.whatYouCanImprove?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                )) || (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>In your real session, feel free to pause and take a slow breath whenever needed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>Bring your auto-generated Counselling Notes to your real session</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Action Buttons: Practice Again or View Notes */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => {
                stopSpeaking();
                setStage('setup');
              }}
              className="w-full sm:w-1/2 py-3.5 rounded-2xl border border-[#E8E4D9] dark:border-[#2F3D42] bg-white dark:bg-[#1A2326] text-[#2D2D2B] dark:text-[#F3F6F8] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#F0EDE4] cursor-pointer transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Again</span>
            </button>

            <button
              onClick={() => setStage('notes')}
              className="w-full sm:w-1/2 py-3.5 rounded-2xl bg-[#4A8B8D] hover:bg-[#3E7678] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>View & Edit My Counselling Notes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 4: MY COUNSELLING NOTES (WORKSHEET) */}
      {/* ========================================================================= */}
      {stage === 'notes' && counsellingNotes && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Notes Header Bar */}
          <div className="bg-white dark:bg-[#161E20] rounded-3xl p-5 border border-[#E8E4D9] dark:border-[#263539] space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                    My Counselling Notes
                  </h3>
                  <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
                    Auto-generated strictly from your practice answers. You can edit, copy, save, or share these notes.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingNotes(!isEditingNotes)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isEditingNotes
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-[#F9F7F2] dark:bg-[#1E292B] text-[#2D2D2B] dark:text-[#F3F6F8] border-[#E8E4D9] dark:border-[#2F3D42]'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingNotes ? 'Done Editing' : '✏️ Edit Notes'}</span>
                </button>

                <button
                  onClick={handleCopyNotes}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#F9F7F2] dark:bg-[#1E292B] text-[#2D2D2B] dark:text-[#F3F6F8] border border-[#E8E4D9] dark:border-[#2F3D42] hover:bg-white cursor-pointer"
                >
                  {copiedNotes ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNotes ? 'Copied!' : '📋 Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 6 Structured Sections */}
          <div className="bg-white dark:bg-[#161E20] rounded-3xl p-5 sm:p-6 border border-[#E8E4D9] dark:border-[#263539] space-y-4">
            {/* 1. Main Concern */}
            <div className="p-4 rounded-2xl bg-[#F9F7F2] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A8B8D] dark:text-[#63C1C4] block">
                1. My Main Concern
              </span>
              {isEditingNotes ? (
                <input
                  type="text"
                  value={counsellingNotes.mainConcern}
                  onChange={(e) => setCounsellingNotes({ ...counsellingNotes, mainConcern: e.target.value })}
                  className="w-full p-2 bg-white dark:bg-[#1E292B] rounded-xl border border-teal-300 text-xs font-medium"
                />
              ) : (
                <p className="text-xs sm:text-sm font-semibold text-[#2D2D2B] dark:text-[#F3F6F8]">
                  {counsellingNotes.mainConcern}
                </p>
              )}
            </div>

            {/* 2. What I am experiencing */}
            <div className="p-4 rounded-2xl bg-[#F9F7F2] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A8B8D] dark:text-[#63C1C4] block">
                2. What I Am Experiencing
              </span>
              {isEditingNotes ? (
                <textarea
                  rows={2}
                  value={counsellingNotes.whatIAmExperiencing}
                  onChange={(e) => setCounsellingNotes({ ...counsellingNotes, whatIAmExperiencing: e.target.value })}
                  className="w-full p-2 bg-white dark:bg-[#1E292B] rounded-xl border border-teal-300 text-xs font-medium"
                />
              ) : (
                <p className="text-xs sm:text-sm text-[#2D2D2B] dark:text-[#F3F6F8] leading-relaxed">
                  {counsellingNotes.whatIAmExperiencing}
                </p>
              )}
            </div>

            {/* 3. What triggers it */}
            <div className="p-4 rounded-2xl bg-[#F9F7F2] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A8B8D] dark:text-[#63C1C4] block">
                3. What Triggers It
              </span>
              {isEditingNotes ? (
                <textarea
                  rows={2}
                  value={counsellingNotes.whatTriggersIt}
                  onChange={(e) => setCounsellingNotes({ ...counsellingNotes, whatTriggersIt: e.target.value })}
                  className="w-full p-2 bg-white dark:bg-[#1E292B] rounded-xl border border-teal-300 text-xs font-medium"
                />
              ) : (
                <p className="text-xs sm:text-sm text-[#2D2D2B] dark:text-[#F3F6F8] leading-relaxed">
                  {counsellingNotes.whatTriggersIt}
                </p>
              )}
            </div>

            {/* 4. How it affects me */}
            <div className="p-4 rounded-2xl bg-[#F9F7F2] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A8B8D] dark:text-[#63C1C4] block">
                4. How It Affects Me (Daily Routine / Sleep / Studies)
              </span>
              {isEditingNotes ? (
                <textarea
                  rows={2}
                  value={counsellingNotes.howItAffectsMe}
                  onChange={(e) => setCounsellingNotes({ ...counsellingNotes, howItAffectsMe: e.target.value })}
                  className="w-full p-2 bg-white dark:bg-[#1E292B] rounded-xl border border-teal-300 text-xs font-medium"
                />
              ) : (
                <p className="text-xs sm:text-sm text-[#2D2D2B] dark:text-[#F3F6F8] leading-relaxed">
                  {counsellingNotes.howItAffectsMe}
                </p>
              )}
            </div>

            {/* 5. What I have tried */}
            <div className="p-4 rounded-2xl bg-[#F9F7F2] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A8B8D] dark:text-[#63C1C4] block">
                5. What I Have Tried So Far
              </span>
              {isEditingNotes ? (
                <textarea
                  rows={2}
                  value={counsellingNotes.whatIHaveTried}
                  onChange={(e) => setCounsellingNotes({ ...counsellingNotes, whatIHaveTried: e.target.value })}
                  className="w-full p-2 bg-white dark:bg-[#1E292B] rounded-xl border border-teal-300 text-xs font-medium"
                />
              ) : (
                <p className="text-xs sm:text-sm text-[#2D2D2B] dark:text-[#F3F6F8] leading-relaxed">
                  {counsellingNotes.whatIHaveTried}
                </p>
              )}
            </div>

            {/* 6. What I want help with */}
            <div className="p-4 rounded-2xl bg-[#F9F7F2] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A8B8D] dark:text-[#63C1C4] block">
                6. What I Want Help With (Goals for Session)
              </span>
              {isEditingNotes ? (
                <textarea
                  rows={2}
                  value={counsellingNotes.whatIWantHelpWith}
                  onChange={(e) => setCounsellingNotes({ ...counsellingNotes, whatIWantHelpWith: e.target.value })}
                  className="w-full p-2 bg-white dark:bg-[#1E292B] rounded-xl border border-teal-300 text-xs font-medium"
                />
              ) : (
                <p className="text-xs sm:text-sm text-[#2D2D2B] dark:text-[#F3F6F8] leading-relaxed">
                  {counsellingNotes.whatIWantHelpWith}
                </p>
              )}
            </div>
          </div>

          {/* Action Row: Save Locally & Share with Counsellor */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleSaveNotes}
              className="w-full sm:w-1/2 py-3.5 rounded-2xl border border-[#E8E4D9] dark:border-[#2F3D42] bg-white dark:bg-[#1A2326] text-[#2D2D2B] dark:text-[#F3F6F8] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#F0EDE4] cursor-pointer shadow-xs"
            >
              {savedNotes ? <Check className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4" />}
              <span>{savedNotes ? 'Saved to Your Notes!' : '💾 Save to My Notes'}</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="w-full sm:w-1/2 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>📤 Share with Campus Counsellor</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* SHARE WITH COUNSELLOR CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1A2326] rounded-3xl p-6 max-w-md w-full border border-[#E8E4D9] dark:border-[#2F3D42] shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-xl border border-teal-200 shrink-0">
                  📤
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                    Share Notes with Counsellor?
                  </h3>
                  <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
                    Only shared upon your explicit confirmation.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <Shield className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Confidentiality Guarantee</span>
                </div>
                <p className="text-[11px] text-teal-800 dark:text-teal-300 leading-relaxed">
                  These notes will be attached only to your upcoming confidential appointment booking so your counsellor has context before your session begins.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8E4D9] text-xs font-bold text-[#7A756D] hover:text-[#2D2D2B] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmShareWithCounsellor}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Confirm & Book Slot
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
