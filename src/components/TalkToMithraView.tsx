import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Languages,
  Shield,
  HelpCircle,
  PhoneCall,
  RefreshCw,
  Heart,
  Smile,
  Activity,
  Headphones,
  Brain,
  MessageSquare,
  Radio,
  Play,
  Square,
  Users,
  Wind,
  CheckCircle2,
  ArrowRight,
  Sparkle,
  X,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { CompanionConfig, AppLanguage, CheckinData, CompanionAvatarType } from '../types';
import { CompanionAvatar, AvatarAnimationState } from './CompanionAvatar';
import { VIRTUAL_COMPANIONS } from '../data/mockData';
import {
  speakText,
  stopSpeaking,
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  RecognizerInstance,
  detectTextLanguage,
  playToneCue,
} from '../utils/speechService';

interface TalkToMithraViewProps {
  companion: CompanionConfig;
  onCompanionChange?: (newComp: CompanionConfig) => void;
  language: AppLanguage;
  onLanguageChange?: (lang: AppLanguage) => void;
  latestCheckin?: CheckinData;
  onOpenCounsellorBooking?: () => void;
  onOpenRelax?: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'companion';
  text: string;
  timestamp: string;
}

const QUICK_CAMPUS_PROMPTS = [
  {
    en: 'I am stressed about placement coding & aptitude rounds',
    ta: 'பிளேஸ்மென்ட் தேர்வுகள் குறித்து எனக்கு மிகவும் பயமாக உள்ளது',
    tanglish: 'Enakku placement coding & aptitude rounds pathi romba stress-aa irukku',
  },
  {
    en: 'Feeling overwhelmed by internal assessments & lab viva',
    ta: 'இன்டெர்னல் தேர்வுகள் மற்றும் வைவா என்னை அலைக்கழிக்கிறது',
    tanglish: 'Internal exam & lab viva pressure romba jaasthi-aa irukku',
  },
  {
    en: 'Trouble sleeping at night because thoughts are racing',
    ta: 'இரவில் அதிக யோசனைகளால் தூங்க முடியவில்லை',
    tanglish: 'Night-la overthinking aagudhu, thoonga mudiyala',
  },
  {
    en: 'Feeling homesick and alone in the hostel',
    ta: 'ஹாஸ்டலில் குடும்பத்தினரை நினைத்து ஏக்கமாக உள்ளது',
    tanglish: 'Hostel-la homesick-aa irukku, family romba miss panren',
  },
];

export const TalkToMithraView: React.FC<TalkToMithraViewProps> = ({
  companion = VIRTUAL_COMPANIONS[0],
  onCompanionChange,
  language = 'en',
  onLanguageChange,
  latestCheckin,
  onOpenCounsellorBooking,
  onOpenRelax,
}) => {
  // Current active view mode: 'chat' | 'selection'
  const [viewMode, setViewMode] = useState<'chat' | 'selection'>('chat');

  // Selected Companion state (Mithra or Mithran)
  const [activeCompanion, setActiveCompanion] = useState<CompanionConfig>(() => {
    if (companion && companion.avatar) return companion;
    return VIRTUAL_COMPANIONS[0];
  });

  // Keep activeCompanion in sync if parent prop changes
  useEffect(() => {
    if (companion && companion.name) {
      setActiveCompanion(companion);
    }
  }, [companion]);

  // Audio Voice Toggle
  const [isVoiceActive, setIsVoiceActive] = useState(true);

  // Avatar Animation State Machine: 'idle' | 'listening' | 'thinking' | 'speaking'
  const [avatarState, setAvatarState] = useState<AvatarAnimationState>('idle');
  const [visemeIndex, setVisemeIndex] = useState<number | undefined>(undefined);
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [speechInterimText, setSpeechInterimText] = useState('');
  const [micUnsupportedNotice, setMicUnsupportedNotice] = useState(false);

  // Text Input State & Transcript
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCopiedId, setIsCopiedId] = useState<string | null>(null);

  // End Conversation Reflection Modal
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);

  // Waveform visualization animation ticker
  const [waveHeightMultiplier, setWaveHeightMultiplier] = useState(1);

  // Initial personalized greeting generator
  const getGreeting = useCallback(
    (comp: CompanionConfig, lang: AppLanguage) => {
      const isMithran = comp.avatar === 'mithran' || comp.name === 'Mithran';
      const cName = isMithran ? 'Mithran' : 'Mithra';
      const cTamilName = isMithran ? 'மித்ரன்' : 'மித்ரா';

      if (lang === 'ta') {
        return `வணக்கம்! நான் ${cTamilName}. உங்கள் கல்லூரிப் பயணத்தில் உங்களுக்கு அமைதியான, ஆதரவான தோழனாக இருக்கிறேன். இன்று உங்கள் மனம் எப்படி இருக்கிறது?`;
      }
      if (lang === 'tanglish') {
        return `Hi! Naan ${cName}. Ungalukku support panna inga irukken. Inniki exam, placement or college pathi unga mind-la enna thonudho openly share pannunga.`;
      }
      return `Hello! I'm ${cName}, your personal wellbeing companion. Whether you are navigating exam stress, placement pressure, or just need a safe space to breathe, I'm right here listening. How are you feeling right now?`;
    },
    []
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      sender: 'companion',
      text: getGreeting(activeCompanion, language),
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognizerRef = useRef<RecognizerInstance | null>(null);
  const speakingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const waveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Waveform effect when listening or speaking
  useEffect(() => {
    if (avatarState === 'listening' || avatarState === 'speaking') {
      waveIntervalRef.current = setInterval(() => {
        setWaveHeightMultiplier(0.4 + Math.random() * 0.9);
      }, 100);
    } else {
      setWaveHeightMultiplier(0.2);
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    }

    return () => {
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    };
  }, [avatarState]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, speechInterimText]);

  // Clean up speech synthesis & recognition on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
      if (recognizerRef.current) recognizerRef.current.abort();
    };
  }, []);

  // Companion switcher handler
  const handleSelectCompanion = (comp: CompanionConfig) => {
    stopSpeaking();
    setActiveCompanion(comp);
    onCompanionChange?.(comp);
    setViewMode('chat');

    // Add new greeting from the newly selected companion
    const newGreetingText = getGreeting(comp, language);
    const greetingMsg: Message = {
      id: `m-switch-${Date.now()}`,
      sender: 'companion',
      text: newGreetingText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, greetingMsg]);
    triggerCompanionSpeaking(newGreetingText, comp);
  };

  // Perform AI Speech Output with Lip-Sync Transition
  const triggerCompanionSpeaking = useCallback(
    (text: string, compOverride?: CompanionConfig) => {
      if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
      stopSpeaking();
      setAvatarState('speaking');

      const targetCompanion = compOverride || activeCompanion;
      const effectiveGender = targetCompanion.avatar === 'mithran' ? 'male' : 'female';

      if (isVoiceActive) {
        speakText({
          text,
          language: (language || 'en') as AppLanguage,
          tone: targetCompanion.tone || 'gentle',
          avatar: targetCompanion.avatar || 'mithra',
          gender: effectiveGender,
          voicePitch: targetCompanion.voicePitch,
          onStart: () => {
            setAvatarState('speaking');
          },
          onViseme: (v) => {
            setVisemeIndex(v);
          },
          onEnd: () => {
            setAvatarState('idle');
            setVisemeIndex(undefined);
          },
          onError: () => {
            setVisemeIndex(undefined);
            // Fallback duration if speech synthesis error occurs
            const fallbackDuration = Math.min(Math.max(text.length * 45, 1800), 5500);
            speakingTimerRef.current = setTimeout(() => {
              setAvatarState('idle');
            }, fallbackDuration);
          },
        });
      } else {
        // If muted, simulate realistic visual lip-sync duration
        const duration = Math.min(Math.max(text.length * 40, 1800), 4500);
        speakingTimerRef.current = setTimeout(() => {
          setAvatarState('idle');
          setVisemeIndex(undefined);
        }, duration);
      }
    },
    [activeCompanion, isVoiceActive, language]
  );

  // Send Message & Connect to Backend API (`POST /api/companion/chat`)
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    // Stop ongoing speech & microphone
    stopSpeaking();
    if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
    if (isRecordingMic && recognizerRef.current) {
      recognizerRef.current.stop();
      setIsRecordingMic(false);
    }
    setSpeechInterimText('');

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!textToSend) setInputValue('');

    // Transition State: 'Thinking'
    setIsTyping(true);
    setAvatarState('thinking');

    try {
      // Build session context payload for backend
      const formattedHistory = newHistory.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await fetch('/api/companion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: formattedHistory,
          companion: activeCompanion,
          language: language,
          recentCheckin: latestCheckin || null,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.reply || getOfflineSmartFallback(text, activeCompanion, (language || 'en') as AppLanguage);

      const companionMsg: Message = {
        id: `m-${Date.now()}`,
        sender: 'companion',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, companionMsg]);
      setIsTyping(false);

      // Transition to 'Speaking' with Lip-Sync
      triggerCompanionSpeaking(replyText);
    } catch (err) {
      console.warn('Companion chat API request failed, using intelligent fallback:', err);
      const fallbackReply = getOfflineSmartFallback(text, activeCompanion, (language || 'en') as AppLanguage);

      const companionMsg: Message = {
        id: `m-${Date.now()}`,
        sender: 'companion',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, companionMsg]);
      setIsTyping(false);
      triggerCompanionSpeaking(fallbackReply);
    }
  };

  // Offline Smart Fallback Helper
  const getOfflineSmartFallback = (
    userInput: string,
    comp: CompanionConfig,
    lang: AppLanguage
  ): string => {
    const isMithran = comp.avatar === 'mithran' || comp.name === 'Mithran';
    const detectedLang = detectTextLanguage(userInput);
    const effectiveLang = lang !== 'en' ? lang : detectedLang;
    const lower = userInput.toLowerCase();

    if (
      lower.includes('placement') ||
      lower.includes('job') ||
      lower.includes('coding') ||
      lower.includes('interview') ||
      lower.includes('resume')
    ) {
      if (effectiveLang === 'tanglish') {
        return `Placement and aptitude rounds unakku periya pressure-aa irukku pola. Unakku okay-na, placement-la exactly enna round dhaan romba bayama irukku?`;
      }
      if (effectiveLang === 'ta') {
        return `வேலைவாய்ப்புத் தேர்வுகள் குறித்த உங்கள் பதற்றம் முற்றிலும் இயல்பானது. உங்களுக்கு இதில் எந்தப் பகுதி அதிக அழுத்தத்தைத் தருகிறது?`;
      }
      return `Placement season and coding rounds can feel like immense pressure. If you're comfortable sharing, which specific round or expectation is weighing on you the most?`;
    }

    if (
      lower.includes('exam') ||
      lower.includes('internal') ||
      lower.includes('arrear') ||
      lower.includes('viva') ||
      lower.includes('cgpa') ||
      lower.includes('study')
    ) {
      if (effectiveLang === 'tanglish') {
        return `Exam and viva tension understand aagudhu nanba. Ella syllabus-um ore naal-la finish panna mudiyadhu. Next 10 minutes-ku edha start panna nalla irukkum?`;
      }
      if (effectiveLang === 'ta') {
        return `தேர்வு குறித்த அச்சம் இயல்பானதுதான். அனைத்து பாடங்களையும் ஒரே நேரத்தில் யோசிக்காமல், சிறிய பகுதிகளாகப் பிரிக்கலாம். இப்போது எந்தப் பாடம் உங்களுக்கு முக்கியம்?`;
      }
      return `Academic pressure around exams and vivas is genuinely challenging. Breaking your prep into small 20-minute focus sprints really helps. What is one chapter or subject you'd like to look at first?`;
    }

    if (
      lower.includes('sleep') ||
      lower.includes('tired') ||
      lower.includes('night') ||
      lower.includes('insomnia') ||
      lower.includes('rest')
    ) {
      if (effectiveLang === 'tanglish') {
        return `Sleep debt irundha energy automatic-aa drop aagum. Screen-ah konjam off pannitu, calm-aa oru 2 minutes deep breath edupoma?`;
      }
      if (effectiveLang === 'ta') {
        return `மனதில் அதிக யோசனைகள் இருக்கும்போது தூக்கம் வருவது கடினம். ஒரு நிமிடம் கண்களை மூடி ஆழ்ந்த மூச்சு எடுக்கலாமா?`;
      }
      return `When racing thoughts keep you awake, giving your mind permission to pause is essential. Would you like to try a soothing 60-second breathing cycle in the Mind Relax Oasis?`;
    }

    if (
      lower.includes('counsel') ||
      lower.includes('counsellor') ||
      lower.includes('doctor') ||
      lower.includes('booking')
    ) {
      if (effectiveLang === 'tanglish') {
        return `Campus counsellor kitta pesuradhu 100% confidential and free. Neenga Counselling tab-la direct-aa slot schedule pannikalaam.`;
      }
      if (effectiveLang === 'ta') {
        return `கல்லூரி ஆலோசகரிடம் பேசுவது சிறந்த முடிவு. இது முற்றிலும் இலவசம் மற்றும் ரகசியமானது. நான் வழிகாட்டட்டுமா?`;
      }
      return `Speaking with a trained campus counsellor is a confidential, empowering step. You can prepare your private notes and book a session anytime in the Counselling tab.`;
    }

    // Default conversational response (Listen -> Understand -> Respond -> Ask ONE question)
    if (effectiveLang === 'tanglish') {
      return `Puriyudhu nanba. Namma manasula irukkuradha open-aa pesuradhe periya relief tharum. Ippo unakku enna help panna nalla irukkum?`;
    }
    if (effectiveLang === 'ta') {
      return `உங்கள் உணர்வுகளை நான் புரிந்துகொள்கிறேன். இதை வெளிப்படையாகப் பகிர்ந்ததற்கு நன்றி. இப்போது உங்கள் மனதை இலகுவாக்க நாம் என்ன செய்யலாம்?`;
    }
    return `I hear you, and it's completely valid to feel this way. Thank you for sharing that with me. What would bring you even a tiny moment of calm right now?`;
  };

  // Microphone Speech-to-Text Toggle
  const handleToggleMic = () => {
    if (isRecordingMic) {
      if (recognizerRef.current) recognizerRef.current.stop();
      setIsRecordingMic(false);
      setSpeechInterimText('');
      if (!inputValue.trim()) setAvatarState('idle');
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setMicUnsupportedNotice(true);
      setTimeout(() => setMicUnsupportedNotice(false), 5000);
      return;
    }

    stopSpeaking();
    playToneCue('listen');
    setAvatarState('listening');
    setIsRecordingMic(true);
    setSpeechInterimText('');

    const langParam = language === 'ta' ? 'ta' : language === 'tanglish' ? 'tanglish' : 'en';

    const recognizer = createSpeechRecognizer({
      language: langParam,
      onStart: () => {
        setIsRecordingMic(true);
        setAvatarState('listening');
      },
      onResult: (transcript, isFinal) => {
        setSpeechInterimText(transcript);
        setInputValue(transcript);
        if (isFinal && transcript.trim()) {
          setIsRecordingMic(false);
          setSpeechInterimText('');
          handleSendMessage(transcript);
        }
      },
      onError: (err) => {
        console.warn('Speech recognition error callback:', err);
        setIsRecordingMic(false);
        setSpeechInterimText('');
        if (!inputValue.trim()) setAvatarState('idle');
      },
      onEnd: () => {
        setIsRecordingMic(false);
        setSpeechInterimText('');
        if (!inputValue.trim()) setAvatarState('idle');
      },
    });

    if (recognizer) {
      recognizerRef.current = recognizer;
      recognizer.start();
    }
  };

  // Preview Voice sample on selection card
  const handlePreviewVoice = (comp: CompanionConfig) => {
    const isMithran = comp.avatar === 'mithran' || comp.name === 'Mithran';
    const sampleText =
      language === 'ta'
        ? `வணக்கம்! நான் ${isMithran ? 'மித்ரன்' : 'மித்ரா'}. நான் உங்கள் கல்லூரித் தோழன்.`
        : language === 'tanglish'
        ? `Hi! Naan ${isMithran ? 'Mithran' : 'Mithra'}. Unga college life-ku support panna inga irukken.`
        : `Hello! I am ${comp.name}. I am here to listen and support your wellbeing.`;

    stopSpeaking();
    speakText({
      text: sampleText,
      language: (language || 'en') as AppLanguage,
      avatar: comp.avatar,
      gender: isMithran ? 'male' : 'female',
      voicePitch: comp.voicePitch,
    });
  };

  // State metadata badge
  const stateBadges = {
    idle: {
      label: 'Idle & Present',
      desc: 'Breathing & attentive',
      color: 'bg-emerald-500',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: Smile,
    },
    listening: {
      label: 'Listening to you...',
      desc: 'Attentive eye contact',
      color: 'bg-teal-500',
      badgeClass: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 animate-pulse',
      icon: Headphones,
    },
    thinking: {
      label: 'Reflecting...',
      desc: 'Formulating thoughtful response',
      color: 'bg-amber-500',
      badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 animate-pulse',
      icon: Brain,
    },
    speaking: {
      label: `${activeCompanion.name} is speaking`,
      desc: 'Lip-sync & empathetic tone',
      color: 'bg-rose-500',
      badgeClass: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      icon: MessageSquare,
    },
  };

  const currentBadge = stateBadges[avatarState];
  const BadgeIcon = currentBadge.icon;

  return (
    <div className="flex flex-col h-[calc(100vh-190px)] min-h-[580px] max-w-4xl mx-auto bg-white dark:bg-[#161E20] rounded-3xl border border-[#E8E4D9] dark:border-[#223034] shadow-sm overflow-hidden relative">
      {/* Top Header Bar with Mode Switching & Controls */}
      <header className="px-4 sm:px-6 py-3 bg-[#F9F7F2] dark:bg-[#1A2326] border-b border-[#E8E4D9] dark:border-[#223034] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Active Companion Avatar Pill */}
          <div
            onClick={() => setViewMode(viewMode === 'selection' ? 'chat' : 'selection')}
            className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-[#4A8B8D]/30 flex items-center justify-center p-0.5 cursor-pointer hover:scale-105 transition-transform"
            title="Click to Switch Companion"
          >
            <CompanionAvatar avatar={activeCompanion.avatar} emotion="happy" size="sm" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#2D2D2B] dark:text-[#F3F6F8] flex items-center gap-1.5">
                <span>{activeCompanion.name}</span>
                <span className="text-xs font-normal text-[#7A756D] dark:text-[#9BA3AF]">
                  ({activeCompanion.tamilName || (activeCompanion.name === 'Mithran' ? 'மித்ரன்' : 'மித்ரா')})
                </span>
              </h2>
              {/* State Pill */}
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${currentBadge.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${currentBadge.color}`}></span>
                <span>{currentBadge.label}</span>
              </span>
            </div>
            <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF] truncate max-w-[200px] sm:max-w-xs">
              {activeCompanion.title || 'Live Human-Like AI Companion'}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-white dark:bg-[#12181A] rounded-xl p-0.5 border border-[#E8E4D9] dark:border-[#2F3D42] text-[11px] font-semibold">
            <button
              onClick={() => onLanguageChange?.('en')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                language === 'en'
                  ? 'bg-[#4A8B8D] text-white'
                  : 'text-[#5A554E] dark:text-[#9BA3AF] hover:text-[#2D2D2B]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange?.('tanglish')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                language === 'tanglish'
                  ? 'bg-[#4A8B8D] text-white'
                  : 'text-[#5A554E] dark:text-[#9BA3AF] hover:text-[#2D2D2B]'
              }`}
            >
              Tanglish
            </button>
            <button
              onClick={() => onLanguageChange?.('ta')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                language === 'ta'
                  ? 'bg-[#4A8B8D] text-white'
                  : 'text-[#5A554E] dark:text-[#9BA3AF] hover:text-[#2D2D2B]'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Voice Mute / Unmute */}
          <button
            onClick={() => {
              if (isVoiceActive) stopSpeaking();
              setIsVoiceActive(!isVoiceActive);
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isVoiceActive
                ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-700 text-[#4A8B8D] dark:text-[#63C1C4]'
                : 'bg-white dark:bg-[#12181A] border-[#E8E4D9] dark:border-[#2F3D42] text-[#7A756D]'
            }`}
            title={isVoiceActive ? 'Voice narration active (Click to mute)' : 'Muted (Click to unmute)'}
          >
            {isVoiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Companion Switcher View Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'selection' ? 'chat' : 'selection')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
              viewMode === 'selection'
                ? 'bg-[#4A8B8D] text-white border-[#4A8B8D]'
                : 'bg-white dark:bg-[#12181A] border-[#E8E4D9] dark:border-[#2F3D42] text-[#2D2D2B] dark:text-[#F3F6F8] hover:bg-[#F0EDE4] dark:hover:bg-[#253235]'
            }`}
            title="Switch between Mithra & Mithran"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {viewMode === 'selection' ? 'Back to Live Call' : 'Switch Companion'}
            </span>
          </button>

          {/* End Conversation Button */}
          <button
            onClick={() => setIsEndModalOpen(true)}
            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
            title="End Conversation & Reflection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* VIEW MODE 1: COMPANION SELECTION SCREEN */}
      {viewMode === 'selection' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F9F7F2] dark:bg-[#0F1416]">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Virtual Companions
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                Choose Your Wellbeing Ally
              </h3>
              <p className="text-xs sm:text-sm text-[#7A756D] dark:text-[#9BA3AF] max-w-md mx-auto">
                Both Mithra and Mithran are trained to support university students through exam stress, placement anxiety, and daily thoughts with non-judgmental empathy.
              </p>
            </div>

            {/* Companion Selection Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {VIRTUAL_COMPANIONS.map((comp) => {
                const isSelected = activeCompanion.id === comp.id || activeCompanion.name === comp.name;
                const isMithran = comp.id === 'mithran' || comp.name === 'Mithran';

                return (
                  <div
                    key={comp.id || comp.name}
                    className={`relative rounded-3xl p-5 border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white dark:bg-[#1A2326] border-[#4A8B8D] shadow-md ring-2 ring-[#4A8B8D]/20'
                        : 'bg-white/80 dark:bg-[#161E20] border-[#E8E4D9] dark:border-[#223034] hover:border-[#4A8B8D]/50 hover:shadow-xs'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3.5 right-3.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#4A8B8D] text-white rounded-full">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}

                    <div className="space-y-4">
                      {/* Avatar Display */}
                      <div className="flex justify-center pt-2">
                        <div
                          className={`w-28 h-28 rounded-3xl p-2 border-2 flex items-center justify-center transition-transform hover:scale-105 ${
                            isMithran
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                              : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          <CompanionAvatar avatar={comp.avatar} emotion="happy" size="lg" isAnimated />
                        </div>
                      </div>

                      {/* Info & Persona */}
                      <div className="text-center space-y-1.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <h4 className="text-lg font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                            {comp.name}
                          </h4>
                          <span className="text-sm text-[#7A756D] dark:text-[#9BA3AF]">
                            ({comp.tamilName})
                          </span>
                        </div>
                        <p className="text-xs font-medium text-[#4A8B8D] dark:text-[#63C1C4]">
                          {comp.title}
                        </p>
                        <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF] leading-relaxed pt-1">
                          {comp.bio}
                        </p>
                      </div>

                      {/* Personality Trait Badges */}
                      <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                        {isMithran ? (
                          <>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              🧘 Calm & Grounded
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              🎯 Practical Focus
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              🗣️ Tanglish Native
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              🌸 Warm & Empathetic
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                              👂 Active Listener
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                              🌿 Gentle Reassurance
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-5 space-y-2">
                      <button
                        onClick={() => handlePreviewVoice(comp)}
                        className="w-full py-2 px-3 rounded-xl border border-[#E8E4D9] dark:border-[#2F3D42] bg-[#F9F7F2] dark:bg-[#12181A] hover:bg-[#F0EDE4] dark:hover:bg-[#253235] text-xs font-semibold text-[#3D3A35] dark:text-[#E2E8F0] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#4A8B8D]" />
                        <span>Listen to Voice Sample</span>
                      </button>

                      <button
                        onClick={() => handleSelectCompanion(comp)}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#4A8B8D] text-white hover:bg-[#3E7678] shadow-xs'
                            : 'bg-[#2D2D2B] dark:bg-white text-white dark:text-[#161E20] hover:opacity-90'
                        }`}
                      >
                        <span>{isSelected ? 'Continue Conversation' : `Select ${comp.name}`}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: LIVE HUMAN-LIKE CONVERSATION SCREEN */}
      {viewMode === 'chat' && (
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* LEFT/TOP STAGE: Large Interactive Avatar & Voice Waveform */}
          <div className="w-full md:w-5/12 bg-linear-to-b from-[#F9F7F2] to-[#EFECE3] dark:from-[#1A2326] dark:to-[#12181A] border-b md:border-b-0 md:border-r border-[#E8E4D9] dark:border-[#223034] p-4 sm:p-6 flex flex-col items-center justify-between shrink-0 select-none">
            {/* Top Stage Badges */}
            <div className="w-full flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7A756D] dark:text-[#9BA3AF]">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                100% Private Vault
              </span>
              <button
                onClick={() => setViewMode('selection')}
                className="text-[11px] text-[#4A8B8D] dark:text-[#63C1C4] hover:underline font-semibold cursor-pointer"
              >
                Change Avatar ▾
              </button>
            </div>

            {/* Main Interactive Avatar Display */}
            <div className="my-auto py-2 flex flex-col items-center">
              <div className="relative">
                {/* Glow ring around avatar based on state */}
                <div
                  className={`absolute -inset-3 rounded-full blur-md opacity-40 transition-all duration-700 ${
                    avatarState === 'listening'
                      ? 'bg-teal-400 dark:bg-teal-500 scale-110'
                      : avatarState === 'speaking'
                      ? 'bg-rose-400 dark:bg-rose-500 scale-105'
                      : avatarState === 'thinking'
                      ? 'bg-amber-400 dark:bg-amber-500 scale-100 animate-pulse'
                      : 'bg-emerald-300 dark:bg-emerald-600 opacity-20'
                  }`}
                ></div>

                <div className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white dark:bg-[#161E20] border-4 border-white dark:border-[#2F3D42] shadow-lg flex items-center justify-center p-2">
                  <CompanionAvatar
                    avatar={activeCompanion.avatar}
                    emotion={avatarState === 'thinking' ? 'concerned' : avatarState === 'listening' ? 'listening' : 'happy'}
                    state={avatarState}
                    lipSyncValue={visemeIndex !== undefined ? visemeIndex / 5 : undefined}
                    size="xl"
                    isAnimated
                  />
                </div>

                {/* State Mini Badge Pill */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${currentBadge.badgeClass}`}
                  >
                    <BadgeIcon className="w-3.5 h-3.5" />
                    <span>{currentBadge.label}</span>
                  </span>
                </div>
              </div>

              {/* Dynamic Voice Waveform Visualizer */}
              <div className="mt-6 flex items-center justify-center gap-1.5 h-8 w-44">
                {[12, 24, 18, 30, 20, 28, 14, 26, 16, 22].map((baseHeight, i) => {
                  const isActive = avatarState === 'speaking' || avatarState === 'listening';
                  const height = isActive
                    ? Math.max(6, Math.min(32, baseHeight * waveHeightMultiplier * (0.8 + (i % 3) * 0.2)))
                    : 4;

                  return (
                    <motion.div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-100 ${
                        avatarState === 'listening'
                          ? 'bg-teal-500'
                          : avatarState === 'speaking'
                          ? 'bg-[#E98A72]'
                          : 'bg-[#C7C2B4] dark:bg-[#3D4D52]'
                      }`}
                      style={{ height: `${height}px` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Quick Action Navigation Buttons (Module 3 & Module 5 Links) */}
            <div className="w-full pt-2 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onOpenRelax}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] hover:border-teal-400 text-[11px] font-bold text-[#2D2D2B] dark:text-[#F3F6F8] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all hover:bg-teal-50/50"
                  title="Open Mind Relax Oasis"
                >
                  <Wind className="w-3.5 h-3.5 text-teal-600" />
                  <span>Try Mind Relax</span>
                </button>

                <button
                  onClick={onOpenCounsellorBooking}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] hover:border-blue-400 text-[11px] font-bold text-[#2D2D2B] dark:text-[#F3F6F8] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all hover:bg-blue-50/50"
                  title="Prepare & Book Campus Counselling"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Counselling Prep</span>
                </button>
              </div>

              {/* Mic Unsupported Warning Alert if triggered */}
              {micUnsupportedNotice && (
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200 text-center">
                  Speech Recognition not supported in this browser. Please type your message below.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT/BOTTOM STAGE: Live Conversation Transcript & Controls */}
          <div className="w-full md:w-7/12 flex flex-col min-h-0 bg-white dark:bg-[#161E20]">
            {/* Transcript Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-[88%]">
                      {!isUser && (
                        <div className="w-7 h-7 rounded-xl bg-teal-50 dark:bg-teal-950 p-0.5 shrink-0 border border-teal-200 dark:border-teal-800">
                          <CompanionAvatar avatar={activeCompanion.avatar} emotion="happy" size="sm" />
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                          isUser
                            ? 'bg-[#4A8B8D] text-white rounded-br-xs shadow-2xs'
                            : 'bg-[#F9F7F2] dark:bg-[#1A2326] text-[#2D2D2B] dark:text-[#F3F6F8] border border-[#E8E4D9] dark:border-[#2F3D42] rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>

                    {/* Message Footnotes & Audio Replay */}
                    <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-[#7A756D] dark:text-[#9BA3AF]">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <>
                          <span>•</span>
                          <button
                            onClick={() => triggerCompanionSpeaking(msg.text)}
                            className="hover:text-[#4A8B8D] flex items-center gap-1 font-medium cursor-pointer"
                            title="Replay Voice Audio"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Listen</span>
                          </button>
                          <span>•</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(msg.text);
                              setIsCopiedId(msg.id);
                              setTimeout(() => setIsCopiedId(null), 2000);
                            }}
                            className="hover:text-[#4A8B8D] flex items-center gap-1 cursor-pointer"
                            title="Copy message text"
                          >
                            {isCopiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Real-time Interim Voice Speech Transcription Pill */}
              {isRecordingMic && speechInterimText && (
                <div className="flex flex-col items-end">
                  <div className="rounded-2xl px-4 py-2.5 bg-teal-50 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-200 text-xs sm:text-sm animate-pulse max-w-[85%]">
                    <span className="font-semibold text-[10px] uppercase text-teal-600 block mb-0.5">
                      Transcribing live speech...
                    </span>
                    <p>{speechInterimText}</p>
                  </div>
                </div>
              )}

              {/* AI Thinking Animation */}
              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-teal-50 dark:bg-teal-950 p-0.5 shrink-0 border border-teal-200 dark:border-teal-800">
                    <CompanionAvatar avatar={activeCompanion.avatar} emotion="concerned" size="sm" />
                  </div>
                  <div className="bg-[#F9F7F2] dark:bg-[#1A2326] border border-[#E8E4D9] dark:border-[#2F3D42] rounded-2xl px-4 py-2.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#4A8B8D] animate-bounce"></span>
                    <span
                      className="w-2 h-2 rounded-full bg-[#4A8B8D] animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></span>
                    <span
                      className="w-2 h-2 rounded-full bg-[#4A8B8D] animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    ></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Context Prompts Bar (Chips) */}
            <div className="px-4 py-2 bg-[#F9F7F2]/60 dark:bg-[#161E20]/60 border-t border-[#E8E4D9] dark:border-[#223034] overflow-x-auto no-scrollbar flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#7A756D] shrink-0 uppercase tracking-wider">
                Topics:
              </span>
              {QUICK_CAMPUS_PROMPTS.map((prompt, idx) => {
                const text =
                  language === 'ta'
                    ? prompt.ta
                    : language === 'tanglish'
                    ? prompt.tanglish
                    : prompt.en;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(text)}
                    className="px-2.5 py-1 rounded-full bg-white dark:bg-[#1A2326] border border-[#E8E4D9] dark:border-[#2F3D42] hover:border-[#4A8B8D] text-[11px] text-[#3D3A35] dark:text-[#E2E8F0] whitespace-nowrap shrink-0 transition-colors cursor-pointer hover:bg-teal-50/50"
                  >
                    {text}
                  </button>
                );
              })}
            </div>

            {/* Live Bottom Voice & Text Input Bar */}
            <div className="p-3 sm:p-4 bg-[#F9F7F2] dark:bg-[#1A2326] border-t border-[#E8E4D9] dark:border-[#223034]">
              {/* Mic Active Recording Indicator */}
              {isRecordingMic && (
                <div className="mb-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                    <span className="font-bold">Microphone Active — Speak naturally</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold">
                    {language === 'ta' ? 'தமிழ்' : language === 'tanglish' ? 'Tanglish' : 'English'}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Large Interactive Microphone Trigger */}
                <button
                  onClick={handleToggleMic}
                  className={`p-3 rounded-2xl flex items-center justify-center cursor-pointer transition-all shadow-xs ${
                    isRecordingMic
                      ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-200 dark:ring-rose-900 animate-pulse'
                      : 'bg-teal-600 hover:bg-teal-700 text-white ring-2 ring-teal-200 dark:ring-teal-900'
                  }`}
                  title={isRecordingMic ? 'Stop Speech Recognition' : 'Start Voice Conversation'}
                >
                  {isRecordingMic ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Text Input Box */}
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={
                      language === 'ta'
                        ? 'இங்கு தட்டச்சு செய்யவும் அல்லது மைக் மூலம் பேசவும்...'
                        : language === 'tanglish'
                        ? 'Type pannunga or mic use panni pesunga...'
                        : `Share your thoughts with ${activeCompanion.name}...`
                    }
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-2xl bg-white dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] text-xs sm:text-sm text-[#2D2D2B] dark:text-[#F3F6F8] placeholder-[#9BA3AF] focus:outline-none focus:ring-2 focus:ring-[#4A8B8D]"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim()}
                    className="absolute right-2 p-1.5 rounded-xl bg-[#4A8B8D] text-white disabled:opacity-40 hover:bg-[#3E7678] cursor-pointer transition-all"
                    title="Send message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* END CONVERSATION & REFLECTION MODAL */}
      <AnimatePresence>
        {isEndModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1A2326] rounded-3xl p-6 max-w-md w-full border border-[#E8E4D9] dark:border-[#2F3D42] shadow-xl space-y-5"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950 mx-auto flex items-center justify-center border border-teal-200 dark:border-teal-800">
                  <CompanionAvatar avatar={activeCompanion.avatar} emotion="happy" size="md" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                  Thank you for sharing, friend.
                </h3>
                <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF] leading-relaxed">
                  Taking time to acknowledge your thoughts is a powerful step. Your conversation is strictly private and stored only in your encrypted local session.
                </p>
              </div>

              {/* Recommended Next Actions */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                  Would you like to try next?
                </p>

                <button
                  onClick={() => {
                    setIsEndModalOpen(false);
                    onOpenRelax?.();
                  }}
                  className="w-full p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-between text-left hover:bg-teal-100/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Wind className="w-5 h-5 text-teal-600" />
                    <div>
                      <h4 className="text-xs font-bold text-teal-900 dark:text-teal-200">
                        Try Mind Relax Oasis
                      </h4>
                      <p className="text-[11px] text-teal-700 dark:text-teal-400">
                        4-7-8 breathing, sensory grounding & calming rain
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-teal-600" />
                </button>

                <button
                  onClick={() => {
                    setIsEndModalOpen(false);
                    onOpenCounsellorBooking?.();
                  }}
                  className="w-full p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-between text-left hover:bg-blue-100/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                        Prepare for Campus Counselling
                      </h4>
                      <p className="text-[11px] text-blue-700 dark:text-blue-400">
                        100% free, confidential student support
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </button>
              </div>

              {/* Close & Continue Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setIsEndModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#E8E4D9] dark:border-[#2F3D42] text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8] hover:bg-[#F0EDE4] dark:hover:bg-[#253235] cursor-pointer"
                >
                  Stay in Chat
                </button>
                <button
                  onClick={() => {
                    stopSpeaking();
                    setIsEndModalOpen(false);
                    setViewMode('selection');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#4A8B8D] hover:bg-[#3E7678] text-white text-xs font-bold cursor-pointer"
                >
                  Return to Companions
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
