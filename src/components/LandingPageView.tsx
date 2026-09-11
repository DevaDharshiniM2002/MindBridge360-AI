import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Shield,
  HeartHandshake,
  Brain,
  Compass,
  Activity,
  Users,
  MessageSquare,
  BarChart3,
  Flame,
  ArrowRight,
  CheckCircle2,
  Lock,
  GraduationCap,
  Award,
  Star,
  Globe,
  Feather,
  Mic,
  Moon,
  Sun,
  ChevronDown,
  Play,
  Zap,
  BookOpen,
  PhoneCall,
  Layers,
  Code2,
  Palette,
  LineChart,
  UserCheck,
  Building,
  Target,
  Eye,
  Check,
  ExternalLink,
  ChevronRight,
  Smile,
  Frown,
  Meh,
  AlertTriangle,
  RotateCcw,
  Sparkle,
  HelpCircle,
  Clock,
  Compass as CompassIcon,
} from 'lucide-react';
import { AppLanguage, UserRole } from '../types';

// Asset Imports via ESM bundler for reliable resolution
import heroBannerImg from '../assets/images/landing_hero_banner_1788254437146.jpg';
import earlyInterventionImg from '../assets/images/early_intervention_ai_1788254458387.jpg';
import campusRadarImg from '../assets/images/campus_radar_analytics_1788254475804.jpg';
import foundersVisionImg from '../assets/images/founders_team_vision_1788254493178.jpg';

interface LandingPageViewProps {
  onEnterApp: (role?: UserRole, initialTab?: string) => void;
  onOpenAuth: (mode?: 'student' | 'admin') => void;
  onOpenJudgeFeedback?: () => void;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  isLoggedIn?: boolean;
}

interface Founder {
  name: string;
  role: string;
  focus: string;
  bio: string;
  badge: string;
  icon: any;
  gradient: string;
  skills: string[];
  quote: string;
}

const FOUNDERS: Founder[] = [
  {
    name: 'Deva Dharshini',
    role: 'Founder & Lead AI Architect',
    focus: 'Full-Stack Architecture & Gemini AI Infrastructure',
    bio: 'Founder and architect of MindBridge 360\'s end-to-end full-stack platform, high-reliability server endpoints, Firebase Firestore real-time security rules, and Gemini generative AI emotional first-aid models fine-tuned with cultural sensitivity for college students.',
    badge: 'Founder & Lead AI Architect',
    icon: Code2,
    gradient: 'from-teal-500/20 via-emerald-500/10 to-transparent border-teal-300 dark:border-teal-700/60',
    skills: ['React & Node.js', 'Google GenAI SDK', 'Firestore Security Rules', 'Distributed Real-Time Sync', 'Cloud Architecture'],
    quote: 'Technology must serve human vulnerability with absolute empathy and zero judgment.',
  },
  {
    name: 'Anusha',
    role: 'Founder & Wellness Strategist',
    focus: 'Psychological Frameworks & Evidence-Based CBT Interventions',
    bio: 'Founder and strategist of MindBridge 360\'s cognitive behavioral therapy (CBT) micro-modules, exam stress containment protocols, and psycho-education frameworks tailored for higher education student stressors in engineering and professional colleges.',
    badge: 'Founder & Wellness Strategist',
    icon: Brain,
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent border-amber-300 dark:border-amber-700/60',
    skills: ['CBT & Mindfulness Workflows', 'Clinical Safety Escalation', 'Student Experience Strategy', 'Intervention Efficacy'],
    quote: 'Early intervention is the difference between a student feeling alone and knowing they are heard.',
  },
  {
    name: 'Astra Shylin',
    role: 'Founder & UI/UX Design Lead',
    focus: 'Trauma-Informed Design & Sensory Relaxation Suites',
    bio: 'Founder and design lead behind MindBridge 360\'s soothing aesthetic language, calming micro-interactions, accessible typography, and sensory relaxation suites including Pranayama breath pacers, Kolam Zen drawing, and ambient regional soundscapes.',
    badge: 'Founder & UI/UX Design Lead',
    icon: Palette,
    gradient: 'from-purple-500/20 via-pink-500/10 to-transparent border-purple-300 dark:border-purple-700/60',
    skills: ['Trauma-Informed UI/UX', 'Design Systems', 'Motion & Micro-interactions', 'Sensory Accessibility', 'Cultural Aesthetics'],
    quote: 'The visual space a person enters when anxious must feel like an exhale, never a burden.',
  },
  {
    name: 'Priya',
    role: 'Founder & Community Lead',
    focus: 'Campus Peer Safety & k-Anonymity Data Analytics',
    bio: 'Founder and community lead heading MindBridge 360\'s peer support moderation frameworks, automated toxicity safety filters, Tamil/Tanglish cultural vernacular adaptation, and privacy-preserving institutional wellness radar with strict k-anonymity (N ≥ 10).',
    badge: 'Founder & Community Lead',
    icon: LineChart,
    gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent border-blue-300 dark:border-blue-700/60',
    skills: ['k-Anonymity Data Protection', 'Tamil & Tanglish NLP Nuances', 'Automated Moderation', 'Peer Support Networks', 'Sentiment Analysis'],
    quote: 'Privacy is not a feature; it is the fundamental prerequisite for honest student expression.',
  },
];

const FEATURES = [
  {
    title: 'Culturally Attuned AI Ally',
    subtitle: 'Mithra 24x7 Emotional First-Aid',
    desc: 'Converses fluently in Tamil, Tanglish, and English with zero judgment. Grounded in empathetic reflection and safety routing.',
    icon: MessageSquare,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800',
    tag: 'Bilingual AI',
  },
  {
    title: 'Predictive Exam Stress Radar',
    subtitle: 'Early-Warning Burnout Forecast',
    desc: 'Forecasts academic burnout weeks before midterms using daily sentiment trends and student-consented micro check-ins.',
    icon: Activity,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    tag: 'Predictive Care',
  },
  {
    title: 'Pseudonymized Peer Sanctuary',
    subtitle: '100% Safe Student Circles',
    desc: 'Share placement worries, hostel homesickness, and academic burnout with AI auto-moderation guarding student privacy.',
    icon: Users,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
    tag: 'Peer Support',
  },
  {
    title: 'Sensory Relaxation Pavilion',
    subtitle: 'Pranayama & Kolam Zen',
    desc: 'Interactive 4-7-8 breath pacers, traditional meditative Kolam dot-drawing, and immersive regional temple & rain audio.',
    icon: Sparkles,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
    tag: 'Mind Relax',
  },
  {
    title: 'Institutional Wellness Radar',
    subtitle: 'k-Anonymity Protected (N ≥ 10)',
    desc: 'Deans and counsellors gain aggregate heatmaps to allocate resources proactively without ever exposing individual student identities.',
    icon: BarChart3,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
    tag: 'Dean Intelligence',
  },
  {
    title: 'Multilingual Parent Bridge',
    subtitle: 'Generational Empathy Toolkit',
    desc: 'Generates compassionate letters and discussion guides in Tamil & English to explain college stress to traditional parents.',
    icon: HeartHandshake,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    tag: 'Family Dialogue',
  },
];

const FAQS = [
  {
    q: 'How does MindBridge 360 ensure student privacy and confidentiality?',
    a: 'We operate on a zero-identifying philosophy. Students can access the platform anonymously as guests or with confidential credentials. Institutional analytics enforce strict mathematical k-anonymity (N ≥ 10 threshold), guaranteeing that no dean, faculty, or staff can ever trace wellness logs back to an individual student.',
  },
  {
    q: 'Can students chat in Tamil and Tanglish?',
    a: 'Yes! MindBridge 360 is purpose-built for college students in Tamil Nadu and India. The AI companion understands conversational Tamil, Tanglish (e.g. "Romba stress-ah irukku da, placement mock exam fear"), and English with contextual cultural empathy.',
  },
  {
    q: 'How do campus administrators and deans use the Overall Analytics Report?',
    a: 'College authorities log in using verified institutional credentials to view high-level department burnout heatmaps, academic exam stress curves, and counsellor queue metrics. This enables leadership to schedule wellness breaks and adjust academic deadlines proactively rather than reacting to crises.',
  },
  {
    q: 'What happens during a critical psychological emergency?',
    a: 'MindBridge 360 incorporates automated safety triggers. If crisis intent is detected, it immediately provides one-tap crisis hotline routing (Tele-MANAS 14416, Sneha India 044-24640050, KIRAN 1800-599-0019) and guides the student towards professional campus counselling.',
  },
  {
    q: 'Who are the developers and founders behind MindBridge 360?',
    a: 'MindBridge 360 was founded and built by four student technologist-innovators who are all equal co-founders: Deva Dharshini (Founder & Lead AI Architect), Anusha (Founder & Wellness Strategist), Astra Shylin (Founder & UI/UX Design Lead), and Priya (Founder & Community Lead).',
  },
];

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onEnterApp,
  onOpenAuth,
  onOpenJudgeFeedback,
  language,
  onLanguageChange,
  isLoggedIn = false,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Interactive Mini Demo States on Landing Page
  const [selectedMood, setSelectedMood] = useState<'overwhelmed' | 'anxious' | 'tired' | 'peaceful'>('overwhelmed');
  const [breathingPhase, setBreathingPhase] = useState<'Inhale (4s)' | 'Hold (7s)' | 'Exhale (8s)'>('Inhale (4s)');
  const [breathingSeconds, setBreathingSeconds] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  // Simple Breathing Timer Effect for Live Interactive Pacer
  useEffect(() => {
    if (!isBreathingActive) return;
    const interval = setInterval(() => {
      setBreathingSeconds((prev) => {
        if (prev <= 1) {
          if (breathingPhase.startsWith('Inhale')) {
            setBreathingPhase('Hold (7s)');
            return 7;
          } else if (breathingPhase.startsWith('Hold')) {
            setBreathingPhase('Exhale (8s)');
            return 8;
          } else {
            setBreathingPhase('Inhale (4s)');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isBreathingActive, breathingPhase]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0D1315] text-[#2D2D2B] dark:text-[#F3F6F8] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#4A8B8D]/20 overflow-x-hidden">
      {/* ================= EMERGENCY BANNER STRIP ================= */}
      <div className="w-full bg-rose-50 dark:bg-rose-950/80 border-b border-rose-200 dark:border-rose-900 px-4 py-2 text-xs flex flex-wrap items-center justify-between text-rose-800 dark:text-rose-200 gap-2">
        <div className="flex items-center gap-2 font-bold mx-auto sm:mx-0">
          <PhoneCall className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
          <span>24/7 Free Confidential Helplines:</span>
          <a href="tel:14416" className="underline hover:text-rose-950 dark:hover:text-white">Tele-MANAS: 14416</a>
          <span>•</span>
          <a href="tel:04424640050" className="underline hover:text-rose-950 dark:hover:text-white">Sneha India: 044-24640050</a>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[11px] opacity-90 mx-auto sm:mx-0">
          <Shield className="w-3 h-3 text-rose-600" />
          <span>Government of India & Tamil Nadu Mental Health Initiative</span>
        </div>
      </div>

      {/* ================= STICKY TOP NAVIGATION BAR ================= */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/95 dark:bg-[#0D1315]/95 backdrop-blur-md border-b border-[#E8E4D9] dark:border-[#1E292C] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Platform Name */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4A8B8D] to-[#2C6264] text-white flex items-center justify-center font-serif italic text-2xl shadow-md ring-2 ring-[#4A8B8D]/20">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif italic font-normal text-2xl text-[#2D2D2B] dark:text-[#F3F6F8] tracking-tight">
                  MindBridge
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#D1E5E6] dark:bg-[#4A8B8D]/30 text-[#2C6264] dark:text-[#88D4D6]">
                  360
                </span>
              </div>
              <p className="text-[11px] text-[#7A756D] dark:text-[#A6B4B9] hidden sm:block">
                Early-Intervention Campus Wellness Platform
              </p>
            </div>
          </div>

          {/* Quick Navigation Anchor Links (Desktop) */}
          <nav className="hidden xl:flex items-center space-x-6 text-xs font-semibold text-[#5A554E] dark:text-[#B0BEC5]">
            <a href="#what-we-do" className="hover:text-[#4A8B8D] dark:hover:text-[#88D4D6] transition-colors">
              What We Do
            </a>
            <a href="#features" className="hover:text-[#4A8B8D] dark:hover:text-[#88D4D6] transition-colors">
              Platform Pillars
            </a>
            <a href="#interactive-demo" className="hover:text-[#4A8B8D] dark:hover:text-[#88D4D6] transition-colors">
              Live Demo
            </a>
            <a href="#vision-mission" className="hover:text-[#4A8B8D] dark:hover:text-[#88D4D6] transition-colors">
              Vision & Mission
            </a>
            <a href="#founders" className="hover:text-[#4A8B8D] dark:hover:text-[#88D4D6] transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#4A8B8D]" />
              Founders
            </a>
            <a href="#faq" className="hover:text-[#4A8B8D] dark:hover:text-[#88D4D6] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action Buttons & Portal Switchers */}
          <div className="flex items-center space-x-2.5">
            {/* Language switch */}
            <div className="hidden sm:flex items-center space-x-1 p-1 rounded-xl bg-[#EFECE3] dark:bg-[#182225] text-[11px]">
              {(['en', 'ta', 'tanglish'] as AppLanguage[]).map((l) => (
                <button
                  key={l}
                  onClick={() => onLanguageChange(l)}
                  className={`px-2 py-0.5 rounded-lg capitalize font-medium transition-all cursor-pointer ${
                    language === l
                      ? 'bg-[#4A8B8D] text-white shadow-2xs font-bold'
                      : 'text-[#7A756D] dark:text-[#8E9B9F] hover:text-[#2D2D2B]'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'ta' ? 'தமிழ்' : 'Tanglish'}
                </button>
              ))}
            </div>

            {/* If logged in, button to go straight to dashboard */}
            {isLoggedIn ? (
              <button
                onClick={() => onEnterApp('student', 'home')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4A8B8D] hover:bg-[#3D7375] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </button>
            ) : (
              <>
                {/* Admin Portal Button */}
                <button
                  onClick={() => onOpenAuth('admin')}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Institutional Admin & Deans Portal"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span className="hidden sm:inline">Admin Radar</span>
                  <span className="sm:hidden">Admin</span>
                </button>

                {/* Student Portal Button */}
                <button
                  onClick={() => onOpenAuth('student')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4A8B8D] hover:bg-[#3D7375] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow active:scale-95"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Portal</span>
                </button>

                {/* Real-time Judge Evaluation & Ratings Button */}
                {onOpenJudgeFeedback && (
                  <button
                    onClick={onOpenJudgeFeedback}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow active:scale-95 animate-pulse"
                    title="Real-Time Judge Ratings & Live Database Feed"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden md:inline">Judge Ratings</span>
                    <span className="md:hidden">⭐ Rate</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION WITH VISUAL BANNER ================= */}
      <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Vision Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5F2F2] dark:bg-[#162D30] border border-[#BCE1E3] dark:border-[#224A4F] text-[#245D5F] dark:text-[#88D4D6] text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#4A8B8D]" />
              <span>Higher Education Early Mental Wellness Ecosystem • Tamil Nadu</span>
            </div>

            {/* Hero Main Headline */}
            <h1 className="font-serif italic text-4xl sm:text-5xl lg:text-6xl text-[#1E1E1C] dark:text-white leading-[1.14] tracking-tight">
              Transforming Campus Mental Health from{' '}
              <span className="underline decoration-[#4A8B8D] decoration-wavy decoration-2">
                Crisis Reaction
              </span>{' '}
              to Proactive Empathy.
            </h1>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg text-[#5A554E] dark:text-[#A6B4B9] leading-relaxed max-w-2xl">
              MindBridge 360 is a 24x7 culturally attuned digital companion that empowers college students to manage academic pressure, placement anxiety, and emotional fatigue before they escalate — while equipping institutional leaders with privacy-first campus wellness heatmaps.
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => onOpenAuth('student')}
                className="px-6 py-3.5 rounded-2xl bg-[#4A8B8D] hover:bg-[#386F71] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 cursor-pointer active:scale-98"
              >
                <GraduationCap className="w-5 h-5" />
                <span>Student Login / Registration</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenAuth('admin')}
                className="px-5 py-3.5 rounded-2xl bg-white dark:bg-[#182326] hover:bg-[#F2EFE8] dark:hover:bg-[#202E32] text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span>Institutional Analytics Radar</span>
              </button>

              <button
                onClick={() => onEnterApp('student', 'home')}
                className="px-4 py-3 rounded-xl text-xs font-semibold text-[#7A756D] dark:text-[#A6B4B9] hover:text-[#2D2D2B] dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-teal-600" />
                <span>Instant Guest Pass Access</span>
              </button>

              {onOpenJudgeFeedback && (
                <button
                  onClick={onOpenJudgeFeedback}
                  className="px-4 py-3 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span>⭐ Judge Ratings & Live Real-Time DB</span>
                </button>
              )}
            </div>

            {/* Trust Metrics Bar */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-[#E8E4D9] dark:border-[#202D30]">
              <div>
                <div className="text-2xl sm:text-3xl font-serif italic font-bold text-[#2C6264] dark:text-[#88D4D6]">
                  100%
                </div>
                <div className="text-[11px] text-[#7A756D] dark:text-[#8E9B9F] font-medium">
                  Confidential & Stigma-Free
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-serif italic font-bold text-purple-700 dark:text-purple-300">
                  N ≥ 10
                </div>
                <div className="text-[11px] text-[#7A756D] dark:text-[#8E9B9F] font-medium">
                  k-Anonymity Safe Radar
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-serif italic font-bold text-amber-600 dark:text-amber-400">
                  3 Dialects
                </div>
                <div className="text-[11px] text-[#7A756D] dark:text-[#8E9B9F] font-medium">
                  Tamil • Tanglish • English
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Image Explaining the Project */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-[36px] overflow-hidden border-2 border-[#E8E4D9] dark:border-[#253539] shadow-2xl bg-white dark:bg-[#151E21] group">
              <img
                src={heroBannerImg}
                alt="MindBridge 360 Campus Wellness Ecosystem - Students connecting with empathy"
                className="w-full h-[360px] sm:h-[450px] object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6 text-white text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold mb-2 w-fit">
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-300" />
                  <span>Early Intervention Technology</span>
                </div>
                <h3 className="font-serif italic text-xl sm:text-2xl font-bold text-white mb-1">
                  Empathetic Support on Every College Campus
                </h3>
                <p className="text-xs text-white/90 line-clamp-2">
                  Created by student innovators for students — integrating AI companion, stress radar, peer circle & sensory relaxation.
                </p>
              </div>
            </div>

            {/* Floating Security Guarantee Badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-5 -left-4 sm:-left-6 bg-white dark:bg-[#1C272A] border border-[#E8E4D9] dark:border-[#2F3D42] p-3.5 rounded-2xl shadow-xl flex items-center gap-3 max-w-[260px]"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#2D2D2B] dark:text-white">Zero Identity Storage</div>
                <div className="text-[10px] text-[#7A756D] dark:text-[#8E9B9F]">Anonymous guest mode enabled</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= QUICK LINKS FLOATING STRIP ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="p-3.5 rounded-2xl bg-[#F1EDE4] dark:bg-[#162124] border border-[#E4DFD2] dark:border-[#233336] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#5A554E] dark:text-[#A6B4B9] font-bold">
            <Sparkles className="w-4 h-4 text-[#4A8B8D]" />
            <span>Quick Navigation:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="#what-we-do"
              className="px-3 py-1 rounded-lg bg-white dark:bg-[#1C2A2D] text-[#2D2D2B] dark:text-white font-medium hover:text-[#4A8B8D] transition-colors"
            >
              What We Do
            </a>
            <a
              href="#features"
              className="px-3 py-1 rounded-lg bg-white dark:bg-[#1C2A2D] text-[#2D2D2B] dark:text-white font-medium hover:text-[#4A8B8D] transition-colors"
            >
              6 Pillars
            </a>
            <a
              href="#interactive-demo"
              className="px-3 py-1 rounded-lg bg-white dark:bg-[#1C2A2D] text-[#2D2D2B] dark:text-white font-medium hover:text-[#4A8B8D] transition-colors"
            >
              Interactive Demo
            </a>
            <a
              href="#vision-mission"
              className="px-3 py-1 rounded-lg bg-white dark:bg-[#1C2A2D] text-[#2D2D2B] dark:text-white font-medium hover:text-[#4A8B8D] transition-colors"
            >
              Vision & Mission
            </a>
            <a
              href="#founders"
              className="px-3 py-1 rounded-lg bg-white dark:bg-[#1C2A2D] text-[#2D2D2B] dark:text-white font-medium hover:text-[#4A8B8D] transition-colors text-teal-700 dark:text-teal-400 font-bold"
            >
              Dev Team (4 Founders)
            </a>
            <a
              href="#faq"
              className="px-3 py-1 rounded-lg bg-white dark:bg-[#1C2A2D] text-[#2D2D2B] dark:text-white font-medium hover:text-[#4A8B8D] transition-colors"
            >
              FAQ
            </a>
          </div>
        </div>
      </section>

      {/* ================= WHAT WE DO & HOW USEFUL WE ARE ================= */}
      <section id="what-we-do" className="py-16 bg-[#F5F2EA] dark:bg-[#121A1C] border-y border-[#E8E4D9] dark:border-[#1E292C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold tracking-widest text-[#4A8B8D] dark:text-[#88D4D6] uppercase">
              The Need & Solution
            </span>
            <h2 className="font-serif italic text-3xl sm:text-4xl text-[#2D2D2B] dark:text-white">
              What We Are Doing & How Useful We Are
            </h2>
            <p className="text-sm sm:text-base text-[#7A756D] dark:text-[#A6B4B9]">
              Over 68% of university students report severe stress during semesters, but less than 8% seek conventional counselling due to stigma and fear of academic repercussions. MindBridge 360 creates a zero-friction, confidential safety net.
            </p>
          </div>

          {/* 3 Step Visual Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#192427] border border-[#E8E4D9] dark:border-[#27363A] shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-serif italic text-xl font-bold">
                01
              </div>
              <h3 className="font-serif italic text-xl font-bold text-[#2D2D2B] dark:text-white">
                Daily Confidential Reflection
              </h3>
              <p className="text-xs text-[#5A554E] dark:text-[#A6B4B9] leading-relaxed">
                Students perform 30-second mood check-ins, voice-assisted emotional venting, or chat in Tamil/Tanglish with Mithra. Personal patterns stay private and encrypted on user devices.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Express freely in native dialect
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#192427] border border-[#E8E4D9] dark:border-[#27363A] shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-serif italic text-xl font-bold">
                02
              </div>
              <h3 className="font-serif italic text-xl font-bold text-[#2D2D2B] dark:text-white">
                Early Burnout Forecasting
              </h3>
              <p className="text-xs text-[#5A554E] dark:text-[#A6B4B9] leading-relaxed">
                Intelligent predictive modeling detects cumulative stress trajectories ahead of semester exams or placement drives, gently suggesting tailored relaxation micro-interventions.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Proactive warnings before crisis
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#192427] border border-[#E8E4D9] dark:border-[#27363A] shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-serif italic text-xl font-bold">
                03
              </div>
              <h3 className="font-serif italic text-xl font-bold text-[#2D2D2B] dark:text-white">
                Institutional Wellness Radar
              </h3>
              <p className="text-xs text-[#5A554E] dark:text-[#A6B4B9] leading-relaxed">
                College leaders receive anonymized department heatmaps ($k \ge 10$) showing aggregated burnout trends. Deans can schedule wellness breaks and adjust academic deadlines proactively.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> High-impact institutional action
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PLATFORM PILLARS & FEATURES ================= */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-[#4A8B8D] dark:text-[#88D4D6] uppercase">
            Platform Capabilities
          </span>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-[#2D2D2B] dark:text-white">
            Six Pillars of Campus Wellness
          </h2>
          <p className="text-sm text-[#7A756D] dark:text-[#A6B4B9]">
            A complete 360° ecosystem addressing individual emotional care, peer validation, sensory calming, and administrative intelligence.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${feat.bg} text-left flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-white dark:bg-black/30 flex items-center justify-center shadow-xs">
                      <Icon className={`w-5 h-5 ${feat.color}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/40 text-[#5A554E] dark:text-[#A6B4B9]">
                      {feat.tag}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A756D] dark:text-[#8E9B9F]">
                      {feat.subtitle}
                    </span>
                    <h3 className="font-serif italic text-lg font-bold text-[#2D2D2B] dark:text-white mt-0.5">
                      {feat.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#5A554E] dark:text-[#C5D0D3] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Deep-Dive Cards Showing Images That Explain the Project */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
          {/* Deep Dive 1: AI Companion & Multilingual First-Aid */}
          <div className="rounded-[36px] bg-white dark:bg-[#162124] border border-[#E8E4D9] dark:border-[#27373B] overflow-hidden shadow-md flex flex-col justify-between text-left group">
            <div className="p-6 sm:p-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800">
                <Brain className="w-3.5 h-3.5" />
                <span>Feature Spotlight • Emotional AI</span>
              </div>
              <h3 className="font-serif italic text-2xl font-bold text-[#2D2D2B] dark:text-white">
                Empathetic AI Companion Grounded in Cognitive First-Aid
              </h3>
              <p className="text-xs sm:text-sm text-[#5A554E] dark:text-[#A6B4B9] leading-relaxed">
                Mithra is fine-tuned to recognize the unique pressures of higher education in South India — from campus placement anxiety and familial academic expectations to hostel acclimatization. It offers comforting reframing, guided Socratic questioning, and automatic risk containment.
              </p>
            </div>
            <div className="relative h-64 sm:h-72 overflow-hidden border-t border-[#E8E4D9] dark:border-[#27373B]">
              <img
                src={earlyInterventionImg}
                alt="AI Companion Interaction and Emotional First-Aid"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-[11px] font-semibold text-white/90 bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                  24/7 Voice & Text Venting in Tamil, Tanglish & English
                </span>
              </div>
            </div>
          </div>

          {/* Deep Dive 2: Campus Radar & k-Anonymity Dashboard */}
          <div className="rounded-[36px] bg-white dark:bg-[#162124] border border-[#E8E4D9] dark:border-[#27373B] overflow-hidden shadow-md flex flex-col justify-between text-left group">
            <div className="p-6 sm:p-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Institutional Excellence • Privacy-First</span>
              </div>
              <h3 className="font-serif italic text-2xl font-bold text-[#2D2D2B] dark:text-white">
                Campus Wellness Radar & Anonymized Burnout Analytics
              </h3>
              <p className="text-xs sm:text-sm text-[#5A554E] dark:text-[#A6B4B9] leading-relaxed">
                Empowering college principals, deans, and counsellors with bird's-eye visibility into institutional stress indicators. Department breakdowns automatically enforce strict $k$-anonymity ($N \ge 10$) so student identity is never exposed.
              </p>
            </div>
            <div className="relative h-64 sm:h-72 overflow-hidden border-t border-[#E8E4D9] dark:border-[#27373B]">
              <img
                src={campusRadarImg}
                alt="Campus Wellness Radar Analytics for College Deans"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-[11px] font-semibold text-white/90 bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                  Aggregated Heatmaps & Early Academic Stress Warning Signals
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE TRYOUT / LIVE DEMO ================= */}
      <section id="interactive-demo" className="py-16 bg-[#F3EFE6] dark:bg-[#131D1F] border-y border-[#E8E4D9] dark:border-[#1E292C]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-widest text-[#4A8B8D] dark:text-[#88D4D6] uppercase">
              Interactive Micro-Experience
            </span>
            <h2 className="font-serif italic text-3xl sm:text-4xl text-[#2D2D2B] dark:text-white">
              Try How MindBridge 360 Helps You Right Now
            </h2>
            <p className="text-xs sm:text-sm text-[#7A756D] dark:text-[#A6B4B9]">
              Experience a live preview of our instant mood reframing and 4-7-8 calming breath pacer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Interactive Mood Selector */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A2629] border border-[#E8E4D9] dark:border-[#2A3B3E] shadow-sm space-y-5 text-left">
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-teal-600" />
                <h3 className="font-serif italic text-xl font-bold text-[#2D2D2B] dark:text-white">
                  1. How are you feeling right now?
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'overwhelmed', label: 'Overwhelmed by Exams', emoji: '📚', color: 'border-rose-300 text-rose-800' },
                  { id: 'anxious', label: 'Placement / Interview Fear', emoji: '💼', color: 'border-amber-300 text-amber-800' },
                  { id: 'tired', label: 'Hostel Burnout / Tired', emoji: '🛌', color: 'border-purple-300 text-purple-800' },
                  { id: 'peaceful', label: 'Seeking Focus & Grounding', emoji: '🌿', color: 'border-emerald-300 text-emerald-800' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedMood(item.id as any)}
                    className={`p-3 rounded-2xl border text-left text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      selectedMood === item.id
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 ring-2 ring-teal-500/20 text-[#2C6264] dark:text-teal-300'
                        : 'bg-[#F9F7F2] dark:bg-[#131E20] border-[#E8E4D9] dark:border-[#223033] hover:border-[#4A8B8D]'
                    }`}
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span className="line-clamp-1">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Instant Response Box from Mithra */}
              <div className="p-4 rounded-2xl bg-[#E8F4F5] dark:bg-[#14292C] border border-[#BCE1E3] dark:border-[#214B50] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2C6264] dark:text-[#88D4D6]">
                  <Sparkle className="w-3.5 h-3.5" />
                  <span>Mithra's Empathetic Suggestion:</span>
                </div>
                <p className="text-xs text-[#2D2D2B] dark:text-[#D1E5E6] leading-relaxed">
                  {selectedMood === 'overwhelmed' &&
                    '"Syllabus pathi romba bayama irukka? Take a deep breath. You don’t need to finish everything in one hour. Break it into 25-minute Pomodoros. In the full app, I can help you summarize your study stress."'}
                  {selectedMood === 'anxious' &&
                    '"Mock interview and aptitude tests can trigger intense imposter syndrome. Remember: an interview tests preparation, not your worth as a human. Practice mock reframing with me in the app."'}
                  {selectedMood === 'tired' &&
                    '"Late-night hostel study combined with 8 AM lectures drains your emotional battery. Give yourself permission to disconnect for 15 minutes with our Monsoon soundscapes."'}
                  {selectedMood === 'peaceful' &&
                    '"Wonderful! Cultivating steady focus helps you retain complex engineering concepts effortlessly. Our Kolam Zen drawing tool can anchor this peaceful flow state."'}
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => onEnterApp('student', 'talk-mithra')}
                    className="text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Talk to Mithra about this in the app</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive 4-7-8 Breathing Tool */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A2629] border border-[#E8E4D9] dark:border-[#2A3B3E] shadow-sm space-y-5 flex flex-col justify-between text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-600" />
                  <h3 className="font-serif italic text-xl font-bold text-[#2D2D2B] dark:text-white">
                    2. Instant 4-7-8 Vagus Nerve Calming
                  </h3>
                </div>
                <p className="text-xs text-[#7A756D] dark:text-[#A6B4B9]">
                  Clinically proven to reduce heart rate and lower cortisol during exam panic.
                </p>
              </div>

              {/* Breathing Visual Circle */}
              <div className="flex flex-col items-center justify-center py-4">
                <div
                  className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-1000 ${
                    isBreathingActive
                      ? breathingPhase.startsWith('Inhale')
                        ? 'border-teal-400 bg-teal-50 dark:bg-teal-950/60 scale-110'
                        : breathingPhase.startsWith('Hold')
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 scale-110'
                        : 'border-rose-400 bg-rose-50 dark:bg-rose-950/60 scale-95'
                      : 'border-gray-300 bg-gray-50 dark:bg-[#121A1C]'
                  }`}
                >
                  <span className="text-3xl font-serif italic font-bold text-[#2C6264] dark:text-[#88D4D6]">
                    {isBreathingActive ? breathingSeconds : '4-7-8'}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A756D] dark:text-[#A6B4B9]">
                    {isBreathingActive ? breathingPhase : 'Relax'}
                  </span>
                </div>
              </div>

              {/* Breathing Controls */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setIsBreathingActive(!isBreathingActive);
                    if (!isBreathingActive) {
                      setBreathingPhase('Inhale (4s)');
                      setBreathingSeconds(4);
                    }
                  }}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isBreathingActive
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300'
                      : 'bg-[#4A8B8D] text-white hover:bg-[#396C6E] shadow-xs'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isBreathingActive ? 'Stop Breath Pacer' : 'Start 60-Sec Breath Pacer'}</span>
                </button>

                <button
                  onClick={() => onEnterApp('student', 'relax')}
                  className="px-4 py-2.5 rounded-xl bg-[#F0EDE4] dark:bg-[#202E32] text-xs font-semibold hover:bg-[#E5E1D6] transition-colors cursor-pointer"
                >
                  Full Relax Suite →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= VISION & MISSION ================= */}
      <section id="vision-mission" className="py-20 bg-gradient-to-b from-[#F3EFE6] to-[#EAE4D7] dark:from-[#11191B] dark:to-[#172225] border-y border-[#E8E4D9] dark:border-[#253539]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold tracking-widest text-[#4A8B8D] dark:text-[#88D4D6] uppercase">
              Our Core Purpose
            </span>
            <h2 className="font-serif italic text-3xl sm:text-5xl text-[#2D2D2B] dark:text-white">
              Vision & Mission
            </h2>
            <p className="text-sm sm:text-base text-[#5A554E] dark:text-[#A6B4B9]">
              Rooted in empathy, scientific cognitive intervention, and zero-compromise student privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {/* Vision Card */}
            <div className="p-8 sm:p-10 rounded-[36px] bg-white/95 dark:bg-[#1A2629]/95 border border-[#E0DACB] dark:border-[#2E3F43] shadow-lg backdrop-blur-md space-y-5 relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                <Target className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4A8B8D] dark:text-[#88D4D6]">
                  Our North Star
                </span>
                <h3 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2D2D2B] dark:text-white">
                  Our Vision
                </h3>
              </div>
              <p className="text-sm text-[#4E4942] dark:text-[#C5D0D3] leading-relaxed">
                To build an empathetic, stigma-free higher education ecosystem across Tamil Nadu and India where no student suffers in silence. We envision universities where mental wellness is proactively cultivated, emotional first-aid is accessible instantly in every regional dialect, and institutional care is driven by compassionate, privacy-safe intelligence.
              </p>
              <div className="pt-3 border-t border-[#E8E4D9] dark:border-[#27373B] space-y-2 text-xs font-semibold text-[#2C6264] dark:text-[#88D4D6]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>100% Destigmatized College Culture</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Proactive Burnout Prevention Before Exam Panic</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Accessible in Tamil, Tanglish & English</span>
                </div>
              </div>
            </div>

            {/* Mission Card */}
            <div className="p-8 sm:p-10 rounded-[36px] bg-white/95 dark:bg-[#1A2629]/95 border border-[#E0DACB] dark:border-[#2E3F43] shadow-lg backdrop-blur-md space-y-5 relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                <Compass className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                  Our Everyday Commitment
                </span>
                <h3 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2D2D2B] dark:text-white">
                  Our Mission
                </h3>
              </div>
              <p className="text-sm text-[#4E4942] dark:text-[#C5D0D3] leading-relaxed">
                To deliver a secure, multi-tier early intervention mental wellness platform that combines 24x7 bilingual conversational AI, evidence-grounded CBT micro-exercises, peer support sanctuaries, and aggregate early-warning radar for academic leaders — transforming campus culture from emergency firefighting to holistic, continuous empathy.
              </p>
              <div className="pt-3 border-t border-[#E8E4D9] dark:border-[#27373B] space-y-2 text-xs font-semibold text-purple-800 dark:text-purple-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Strict k-Anonymity (N ≥ 10) Protecting Student Identity</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Closing the Generational Gap with Parent Dialogue Tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Instant Routing to Certified Counsellors & Crisis Hotlines</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DEVELOPER & FOUNDERS SECTION ================= */}
      <section id="founders" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E5F2F2] dark:bg-[#162D30] text-[#245D5F] dark:text-[#88D4D6] text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>The 4 Co-Founders</span>
          </div>
          <h2 className="font-serif italic text-3xl sm:text-5xl text-[#2D2D2B] dark:text-white">
            Meet the Founders of MindBridge 360
          </h2>
          <p className="text-sm sm:text-base text-[#7A756D] dark:text-[#A6B4B9]">
            MindBridge 360 is created and led by four passionate student co-founders uniting full-stack engineering, psychological intervention research, trauma-informed design, and regional campus data analytics.
          </p>
        </div>

        {/* Team Collaboration Banner Graphic */}
        <div className="rounded-[36px] overflow-hidden border border-[#E8E4D9] dark:border-[#27373B] shadow-xl bg-white dark:bg-[#151E21] relative group">
          <img
            src={foundersVisionImg}
            alt="MindBridge 360 Founders Team - Deva Dharshini, Anusha, Astra Shylin, Priya"
            className="w-full h-64 sm:h-96 object-cover transition-transform duration-700 group-hover:scale-102"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Student-Led Mental Health Innovation • 4 Co-Founders
            </span>
            <h3 className="font-serif italic text-2xl sm:text-3xl font-bold mt-1 text-white">
              Deva Dharshini • Anusha • Astra Shylin • Priya
            </h3>
            <p className="text-xs sm:text-sm text-white/90 max-w-2xl mt-1.5 leading-relaxed">
              "We built MindBridge 360 because we lived through the sleepless exam nights, placement rejections, and the silent anxiety college students endure. We wanted to build the companion we wished we had."
            </p>
          </div>
        </div>

        {/* 4 Individual Founder Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {FOUNDERS.map((founder, idx) => {
            const Icon = founder.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-3xl border bg-white dark:bg-[#162124] ${founder.gradient} shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-5`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#EBF4F4] dark:bg-black/40 flex items-center justify-center shadow-xs text-[#2D2D2B] dark:text-white">
                      <Icon className="w-6 h-6 text-[#4A8B8D]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white dark:bg-[#202E32] text-[#2C6264] dark:text-[#88D4D6] border border-[#E8E4D9] dark:border-[#2F3D42]">
                      {founder.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif italic text-xl font-bold text-[#2D2D2B] dark:text-white">
                      {founder.name}
                    </h3>
                    <div className="text-xs font-bold text-[#4A8B8D] dark:text-[#88D4D6]">
                      {founder.role}
                    </div>
                    <div className="text-[11px] text-[#7A756D] dark:text-[#8E9B9F] font-medium mt-0.5">
                      {founder.focus}
                    </div>
                  </div>

                  <p className="text-xs text-[#5A554E] dark:text-[#C5D0D3] leading-relaxed">
                    {founder.bio}
                  </p>

                  <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-[11px] italic text-[#6B655B] dark:text-[#A6B4B9] border-l-2 border-[#4A8B8D]">
                    "{founder.quote}"
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8E4D9]/80 dark:border-[#27373B]">
                  <div className="text-[10px] uppercase font-bold text-[#7A756D] dark:text-[#8E9B9F] mb-1.5">
                    Core Technical Expertise
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {founder.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#F4F1EA] dark:bg-[#1E2B2E] text-[#4E4A43] dark:text-[#A6B4B9] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= FREQUENTLY ASKED QUESTIONS ================= */}
      <section id="faq" className="py-16 bg-[#F5F2EA] dark:bg-[#121A1C] border-y border-[#E8E4D9] dark:border-[#1E292C]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-widest text-[#4A8B8D] dark:text-[#88D4D6] uppercase">
              Got Questions?
            </span>
            <h2 className="font-serif italic text-3xl sm:text-4xl text-[#2D2D2B] dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3 text-left">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-[#192427] border border-[#E8E4D9] dark:border-[#27363A] overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-[#2D2D2B] dark:text-white cursor-pointer hover:bg-[#FDFBF7] dark:hover:bg-[#1E2B2F]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7A756D] transition-transform duration-200 shrink-0 ml-3 ${
                      openFaq === idx ? 'rotate-180 text-[#4A8B8D]' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-[#5A554E] dark:text-[#A6B4B9] leading-relaxed border-t border-[#E8E4D9]/60 dark:border-[#27363A]/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CALL TO ACTION BANNER ================= */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 rounded-[40px] bg-gradient-to-br from-[#4A8B8D] via-[#356E70] to-[#1E4C4E] text-white shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle Background Radial Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="relative space-y-4 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-[#D1E5E6] bg-white/10 px-3.5 py-1 rounded-full">
              Join the Campus Wellness Revolution
            </span>
            <h2 className="font-serif italic text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Ready to Experience MindBridge 360?
            </h2>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              Whether you are a student navigating engineering pressure or a dean looking to support campus well-being proactively — MindBridge 360 is built for you.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
              <button
                onClick={() => onOpenAuth('student')}
                className="px-6 py-3.5 rounded-2xl bg-white text-[#2C6264] hover:bg-[#F5F2EA] font-bold text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <GraduationCap className="w-5 h-5 text-[#4A8B8D]" />
                <span>Student Login / Register</span>
              </button>

              <button
                onClick={() => onOpenAuth('admin')}
                className="px-6 py-3.5 rounded-2xl bg-purple-900/80 hover:bg-purple-900 border border-purple-300/40 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-purple-300" />
                <span>Institutional Admin Access</span>
              </button>

              <button
                onClick={() => onEnterApp('student', 'home')}
                className="px-5 py-3.5 rounded-2xl bg-black/30 hover:bg-black/40 border border-white/20 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 text-teal-300" />
                <span>Confidential Guest Pass</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COMPREHENSIVE FOOTER ================= */}
      <footer className="bg-[#EFECE3] dark:bg-[#0A0F11] border-t border-[#E8E4D9] dark:border-[#1E292C] text-xs text-[#7A756D] dark:text-[#8E9B9F]">
        {/* Emergency Crisis Lifelines Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-[#E8E4D9] dark:border-[#1E292C] flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold">
            <PhoneCall className="w-4 h-4 shrink-0" />
            <span>24/7 Verified Crisis Lifelines & Helplines:</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <a href="tel:14416" className="hover:underline font-semibold text-[#2D2D2B] dark:text-white">
              Tele-MANAS: <span className="text-teal-700 dark:text-teal-400">14416</span> (Govt Toll-Free 24x7)
            </a>
            <span>•</span>
            <a href="tel:04424640050" className="hover:underline font-semibold text-[#2D2D2B] dark:text-white">
              Sneha India: <span className="text-teal-700 dark:text-teal-400">044-24640050</span> (Chennai, TN)
            </a>
            <span>•</span>
            <a href="tel:18005990019" className="hover:underline font-semibold text-[#2D2D2B] dark:text-white">
              KIRAN: <span className="text-teal-700 dark:text-teal-400">1800-599-0019</span>
            </a>
          </div>
        </div>

        {/* Footer Navigation Links & Founder Credits */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-[#4A8B8D] text-white flex items-center justify-center font-serif italic text-xs">
              M
            </div>
            <span className="font-serif italic font-bold text-sm text-[#2D2D2B] dark:text-white">
              MindBridge 360
            </span>
            <span className="text-[11px] text-[#7A756D]">
              • Developed by Deva Dharshini, Anusha, Astra Shylin & Priya
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center space-x-5 text-[11px]">
            <a href="#what-we-do" className="hover:underline cursor-pointer">
              About Platform
            </a>
            <a href="#vision-mission" className="hover:underline cursor-pointer">
              Vision & Mission
            </a>
            <a href="#founders" className="hover:underline cursor-pointer font-bold text-[#4A8B8D]">
              Founders
            </a>
            <button onClick={() => onOpenAuth('student')} className="hover:underline cursor-pointer">
              Student Login
            </button>
            <button onClick={() => onOpenAuth('admin')} className="hover:underline cursor-pointer">
              Admin Radar
            </button>
            <button onClick={() => onEnterApp('student', 'home')} className="hover:underline cursor-pointer">
              Launch App
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
