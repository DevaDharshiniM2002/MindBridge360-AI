import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
  UserCheck,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lock,
  Calendar,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { CounsellorBooking, MyCounsellingNotes, AppLanguage } from '../types';
import { TalkToSomeoneView } from './TalkToSomeoneView';
import { CounsellorTrainingSimulator } from './CounsellorTrainingSimulator';
import { ProfessionalTeleconsult } from './ProfessionalTeleconsult';

interface CounsellingPreparationViewProps {
  activeBooking: CounsellorBooking | null;
  onBookCounsellor: (booking: CounsellorBooking) => void;
  onUpdateFollowUp: (weekNumber: number, status: 'completed' | 'skipped', note?: string) => void;
  onOpenCrisisBar?: () => void;
  initialSimulatorContext?: string;
  language?: AppLanguage;
}

export const CounsellingPreparationView: React.FC<CounsellingPreparationViewProps> = ({
  activeBooking,
  onBookCounsellor,
  onUpdateFollowUp,
  onOpenCrisisBar,
  initialSimulatorContext,
  language = 'en',
}) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'book-session' | 'teleconsult' | 'prep-guide'>('simulator');

  // Interactive Self-Reflection Worksheet State
  const [reflectionReason, setReflectionReason] = useState<string>('');
  const [durationFeeling, setDurationFeeling] = useState<string>('');
  const [triedStrategies, setTriedStrategies] = useState<string[]>([]);
  const [sessionHope, setSessionHope] = useState<string>('');
  const [generatedNotes, setGeneratedNotes] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Common Reflection FAQ dropdowns
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const STRATEGY_OPTIONS = [
    'Deep breathing & pacing',
    'Talking to friends/hostel mates',
    'Late-night study schedules',
    'Ignoring/suppressing the feeling',
    'Exercising/walking',
    'Audio ambient sleep sounds',
  ];

  const handleToggleStrategy = (s: string) => {
    setTriedStrategies((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const handleGenerateSummary = () => {
    const summary = `Session Preparation Note:
• Main Concern: ${reflectionReason || 'General academic & personal strain'}
• Duration: ${durationFeeling || 'A few weeks / ongoing'}
• What I've tried so far: ${triedStrategies.length > 0 ? triedStrategies.join(', ') : 'Self-management'}
• What I hope to get: ${sessionHope || 'Clarity and practical coping steps'}`;
    setGeneratedNotes(summary);
  };

  const handleCopyNotes = () => {
    if (!generatedNotes) return;
    navigator.clipboard.writeText(generatedNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header Banner */}
      <div className="bg-linear-to-br from-[#4A8B8D]/15 via-white to-[#E98A72]/10 dark:from-[#1A2528] dark:via-[#161E20] dark:to-[#221C1B] rounded-3xl p-5 sm:p-6 border border-[#E8E4D9] dark:border-[#263539] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎓</span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                Counselling Preparation & Booking
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7A756D] dark:text-[#9BA3AF]">
              Not sure what a counsellor may ask? Practice here before your real session.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-[#F0EDE4] dark:bg-[#253235] p-1 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'simulator'
                  ? 'bg-white dark:bg-[#1A2326] text-[#4A8B8D] dark:text-[#63C1C4] shadow-2xs'
                  : 'text-[#7A756D] hover:text-[#2D2D2B]'
              }`}
            >
              <span>🎓</span>
              <span>Train for Counselling</span>
            </button>
            <button
              onClick={() => setActiveTab('book-session')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'book-session'
                  ? 'bg-white dark:bg-[#1A2326] text-[#4A8B8D] dark:text-[#63C1C4] shadow-2xs'
                  : 'text-[#7A756D] hover:text-[#2D2D2B]'
              }`}
            >
              <span>📅</span>
              <span>Campus Counsellor</span>
            </button>
            <button
              onClick={() => setActiveTab('teleconsult')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'teleconsult'
                  ? 'bg-white dark:bg-[#1A2326] text-[#4A8B8D] dark:text-[#63C1C4] shadow-2xs'
                  : 'text-[#7A756D] hover:text-[#2D2D2B]'
              }`}
            >
              <span>🩺</span>
              <span>Licensed Psychiatrist / Therapist</span>
            </button>
            <button
              onClick={() => setActiveTab('prep-guide')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'prep-guide'
                  ? 'bg-white dark:bg-[#1A2326] text-[#4A8B8D] dark:text-[#63C1C4] shadow-2xs'
                  : 'text-[#7A756D] hover:text-[#2D2D2B]'
              }`}
            >
              <span>📝</span>
              <span>Thought Clarifier</span>
            </button>
          </div>
        </div>

        {/* 3 Reassurance Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5">
          <div className="bg-white/90 dark:bg-[#1E292B]/90 p-3 rounded-2xl border border-[#E8E4D9]/80 dark:border-[#2F3D42]/80 flex items-center gap-2.5 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
            <div className="text-[11px]">
              <span className="font-bold text-[#2D2D2B] dark:text-[#F3F6F8] block">100% Confidential</span>
              <span className="text-[#7A756D] dark:text-[#9BA3AF]">Never shared with faculty</span>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-[#1E292B]/90 p-3 rounded-2xl border border-[#E8E4D9]/80 dark:border-[#2F3D42]/80 flex items-center gap-2.5 shadow-2xs">
            <Clock className="w-5 h-5 text-indigo-500 shrink-0" />
            <div className="text-[11px]">
              <span className="font-bold text-[#2D2D2B] dark:text-[#F3F6F8] block">Zero Judgment</span>
              <span className="text-[#7A756D] dark:text-[#9BA3AF]">Go at your own pace</span>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-[#1E292B]/90 p-3 rounded-2xl border border-[#E8E4D9]/80 dark:border-[#2F3D42]/80 flex items-center gap-2.5 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-[11px]">
              <span className="font-bold text-[#2D2D2B] dark:text-[#F3F6F8] block">100% Free for Students</span>
              <span className="text-[#7A756D] dark:text-[#9BA3AF]">Supported by campus wellbeing</span>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: COUNSELLOR TRAINING SIMULATOR */}
      {activeTab === 'simulator' && (
        <CounsellorTrainingSimulator
          initialContext={initialSimulatorContext}
          initialLanguage={language}
          onBookRealCounsellor={(notes) => {
            if (notes) {
              setGeneratedNotes(`Session Preparation Notes:\n• Main Concern: ${notes.mainConcern}\n• What I am experiencing: ${notes.whatIAmExperiencing}\n• What triggers it: ${notes.whatTriggersIt}\n• How it affects me: ${notes.howItAffectsMe}\n• What I have tried: ${notes.whatIHaveTried}\n• What I want help with: ${notes.whatIWantHelpWith}`);
            }
            setActiveTab('book-session');
          }}
          onOpenCrisisBar={onOpenCrisisBar}
        />
      )}

      {activeTab === 'prep-guide' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Step 1: Self-Reflection Builder */}
          <div className="bg-white dark:bg-[#161E20] rounded-3xl p-5 sm:p-6 border border-[#E8E4D9] dark:border-[#223034] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E8E4D9] dark:border-[#2F3D42]">
              <FileText className="w-5 h-5 text-[#4A8B8D]" />
              <div>
                <h3 className="font-serif font-bold text-base text-[#2D2D2B] dark:text-[#F3F6F8]">
                  Session Preparation Clarifier
                </h3>
                <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
                  Fill this optional worksheet to organize your thoughts before your appointment.
                </p>
              </div>
            </div>

            {/* Question 1 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8] block">
                1. What has been weighing on you the most recently?
              </label>
              <textarea
                value={reflectionReason}
                onChange={(e) => setReflectionReason(e.target.value)}
                placeholder="e.g. Exam anxiety in IA-2, feeling disconnected from hostel roommates, fear of placement coding rounds..."
                rows={2}
                className="w-full text-xs p-3 rounded-2xl bg-[#F9F7F2] dark:bg-[#1C2527] border border-[#E8E4D9] dark:border-[#2F3D42] text-[#2D2D2B] dark:text-[#F3F6F8] focus:outline-none focus:border-[#4A8B8D]"
              />
            </div>

            {/* Question 2 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8] block">
                2. How long have you felt this way?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Just this week', '2 to 4 weeks', 'Most of the semester', 'Longer than 6 months'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationFeeling(d)}
                    className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                      durationFeeling === d
                        ? 'border-[#4A8B8D] bg-teal-50 dark:bg-teal-950/40 text-[#4A8B8D] dark:text-[#63C1C4] font-bold'
                        : 'border-[#E8E4D9] dark:border-[#2F3D42] bg-[#F9F7F2] dark:bg-[#1C2527] text-[#7A756D]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8] block">
                3. What coping approaches have you tried? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STRATEGY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleToggleStrategy(opt)}
                    className={`p-2 rounded-xl text-[11px] border text-left transition-all cursor-pointer ${
                      triedStrategies.includes(opt)
                        ? 'border-[#4A8B8D] bg-teal-50 dark:bg-teal-950/40 text-[#4A8B8D] dark:text-[#63C1C4] font-bold'
                        : 'border-[#E8E4D9] dark:border-[#2F3D42] bg-[#F9F7F2] dark:bg-[#1C2527] text-[#7A756D]'
                    }`}
                  >
                    {triedStrategies.includes(opt) ? '✓ ' : '+ '} {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 4 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8] block">
                4. What is one helpful outcome you hope to achieve?
              </label>
              <input
                type="text"
                value={sessionHope}
                onChange={(e) => setSessionHope(e.target.value)}
                placeholder="e.g. Practical techniques to manage panic, clarity on managing parents' expectations..."
                className="w-full text-xs p-3 rounded-2xl bg-[#F9F7F2] dark:bg-[#1C2527] border border-[#E8E4D9] dark:border-[#2F3D42] text-[#2D2D2B] dark:text-[#F3F6F8] focus:outline-none focus:border-[#4A8B8D]"
              />
            </div>

            {/* Generate & Copy Summary Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={handleGenerateSummary}
                className="px-4 py-2.5 bg-[#4A8B8D] hover:bg-[#376F71] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Session Starter Notes</span>
              </button>
              <button
                onClick={() => setActiveTab('book-session')}
                className="px-4 py-2.5 bg-[#F0EDE4] dark:bg-[#253235] hover:bg-[#E8E4D9] text-[#2D2D2B] dark:text-[#F3F6F8] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Proceed to Book Slot →</span>
              </button>
            </div>

            {generatedNotes && (
              <div className="mt-3 p-4 bg-[#F9F7F2] dark:bg-[#1C2527] rounded-2xl border border-teal-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800 dark:text-teal-200">
                    📋 Generated Notes (Keep or Share with Counsellor)
                  </span>
                  <button
                    onClick={handleCopyNotes}
                    className="flex items-center gap-1 text-xs font-bold text-[#4A8B8D] hover:underline cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                  </button>
                </div>
                <pre className="text-xs text-[#2D2D2B] dark:text-[#F3F6F8] font-mono whitespace-pre-wrap leading-relaxed">
                  {generatedNotes}
                </pre>
              </div>
            )}
          </div>

          {/* FAQs: What to Expect in Counselling */}
          <div className="bg-white dark:bg-[#161E20] rounded-3xl p-5 border border-[#E8E4D9] dark:border-[#223034] shadow-xs space-y-3">
            <h3 className="font-serif font-bold text-base text-[#2D2D2B] dark:text-[#F3F6F8] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#4A8B8D]" /> Frequently Asked Questions
            </h3>

            <div className="space-y-2">
              {[
                {
                  q: 'Will my professors or parents find out that I booked a session?',
                  a: 'No. All campus counselling sessions are bound by medical and psychological confidentiality ethics. Your academic record and parents receive zero notifications.',
                },
                {
                  q: 'What actually happens during the first 30 minutes?',
                  a: 'The counsellor will introduce themselves, explain confidentiality, and listen to what you want to talk about. You do not have to share anything you are uncomfortable with.',
                },
                {
                  q: 'What if I feel nervous or don’t know what to say?',
                  a: 'It is completely normal! Counsellors are trained listeners. You can use the Thought Clarifier notes generated above or simply say "I’m just feeling overwhelmed and don’t know where to start."',
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#F9F7F2] dark:bg-[#1C2527] border border-[#E8E4D9] dark:border-[#2F3D42] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-3.5 text-left text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8] flex items-center justify-between cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-[#7A756D]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#7A756D]" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="p-3.5 pt-0 text-xs text-[#7A756D] dark:text-[#9BA3AF] leading-relaxed border-t border-[#E8E4D9]/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'book-session' && (
        <TalkToSomeoneView
          activeBooking={activeBooking}
          onBookCounsellor={onBookCounsellor}
          onUpdateFollowUp={onUpdateFollowUp}
        />
      )}

      {activeTab === 'teleconsult' && (
        <ProfessionalTeleconsult
          onOpenSandboxPractice={(context) => {
            setActiveTab('simulator');
          }}
          onOpenCrisisBar={onOpenCrisisBar}
        />
      )}
    </div>
  );
};
