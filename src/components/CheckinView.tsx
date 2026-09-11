import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Moon,
  Flame,
  BatteryCharging,
  Users,
  Briefcase,
  Mic,
  MicOff,
  Calendar,
  Upload,
  CheckCircle2,
  Volume2,
  Clock,
  Sparkle,
  BookOpen,
} from 'lucide-react';
import { CheckinData, CompanionConfig, AppLanguage, CompanionEmotion } from '../types';
import { CompanionAvatar } from './CompanionAvatar';

interface CheckinViewProps {
  companion: CompanionConfig;
  language: AppLanguage;
  onSaveCheckin: (checkin: CheckinData) => void;
  streakCount: number;
}

export const CheckinView: React.FC<CheckinViewProps> = ({
  companion = { name: 'Mithra', avatar: 'blob', tone: 'gentle', voiceEnabled: true },
  language,
  onSaveCheckin,
  streakCount,
}) => {
  const safeCompanion = companion || { name: 'Mithra', avatar: 'blob', tone: 'gentle', voiceEnabled: true };
  const [isQuietMode, setIsQuietMode] = useState(false);
  const [quietPulse, setQuietPulse] = useState<'calm' | 'stressed' | 'hanging-on' | 'exhausted'>('calm');

  // Sliders: 1 to 5
  const [sleep, setSleep] = useState(3);
  const [stress, setStress] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [social, setSocial] = useState(3);
  const [workload, setWorkload] = useState(3);
  const [journalNote, setJournalNote] = useState('');

  // Voice recording simulation
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedVoiceNote, setRecordedVoiceNote] = useState<string | null>(null);

  // Timetable upload simulation
  const [uploadedTimetableName, setUploadedTimetableName] = useState<string | null>(null);

  // Companion Live Emotion
  const getLiveEmotion = (): CompanionEmotion => {
    if (stress >= 4 || sleep <= 2) return 'concerned';
    if (energy >= 4 && stress <= 2) return 'happy';
    if (isQuietMode && quietPulse === 'exhausted') return 'concerned';
    return 'happy';
  };

  const handleVoiceRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordedVoiceNote(`Voice entry (${recordingSeconds}s) recorded in ${language === 'hi' ? 'Hindi' : language === 'ta' ? 'Tamil' : 'English'}`);
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      const timer = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 60) {
            clearInterval(timer);
            setIsRecording(false);
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleTimetableUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedTimetableName(file.name);
      setIsQuietMode(true); // Automatically switch to exam week quick mode!
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0d9488', '#f43f5e', '#fbbf24', '#38bdf8'],
    });

    const newCheckin: CheckinData = {
      id: `checkin-${Date.now()}`,
      timestamp: new Date().toISOString(),
      dateStr: new Date().toISOString().split('T')[0],
      sleep: isQuietMode ? 3 : sleep,
      stress: isQuietMode ? (quietPulse === 'stressed' || quietPulse === 'exhausted' ? 4 : 2) : stress,
      energy: isQuietMode ? 3 : energy,
      social: isQuietMode ? 3 : social,
      workload: isQuietMode ? 4 : workload,
      journalNote: journalNote.trim() || undefined,
      voiceNoteUrl: recordedVoiceNote || undefined,
      isQuietPulse: isQuietMode,
      quietPulseMood: isQuietMode ? quietPulse : undefined,
      streakDay: streakCount + 1,
    };

    onSaveCheckin(newCheckin);
  };

  const emotion = getLiveEmotion();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header & Interactive Companion Guide */}
      <div className="bg-white rounded-[36px] p-6 sm:p-8 shadow-sm border border-[#E8E4D9] flex flex-col sm:flex-row items-center gap-6">
        <div className="p-4 bg-[#D1E5E6]/40 rounded-[28px] border border-[#4A8B8D]/20 shrink-0">
          <CompanionAvatar avatar={safeCompanion.avatar} emotion={emotion} size="lg" />
        </div>

        <div className="text-center sm:text-left space-y-1.5 flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-0.5 bg-[#F0EDE4] text-[#4A8B8D] rounded-full border border-[#E8E4D9] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E98A72]" />
              Day {streakCount + 1} Check-in Streak
            </span>
          </div>

          <h2 className="font-serif italic text-2xl sm:text-3xl font-normal text-[#2D2D2B]">
            {isQuietMode ? 'Exam Week Pulse Check' : 'How does your heart feel today?'}
          </h2>

          <p className="text-xs sm:text-sm text-[#7A756D] leading-relaxed">
            {emotion === 'concerned'
              ? `${companion.name} noticed things feel a little heavy. Remember to breathe — we are taking this one gentle moment at a time.`
              : `${companion.name} is right here with you. Take two quiet minutes to tune in with yourself.`}
          </p>
        </div>
      </div>

      {/* Quiet Hours & Timetable Toggle Mode */}
      <div className="bg-[#F0EDE4] p-5 rounded-[28px] border border-[#E8E4D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-[#4A8B8D] shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-[#2D2D2B] flex items-center gap-2">
              <span>Quiet Hours Mode (Exam Weeks)</span>
              {uploadedTimetableName && (
                <span className="text-[10px] bg-[#D1E5E6] text-[#1F4647] px-2 py-0.5 rounded-full font-bold">
                  Schedule synced
                </span>
              )}
            </div>
            <p className="text-xs text-[#7A756D] mt-0.5">
              Reduces check-in to a 1-tap quick pulse during midterms and exam crunches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-[#4A8B8D] font-semibold px-3 py-1.5 bg-white hover:bg-[#FAF7F2] rounded-full border border-[#E8E4D9] shadow-2xs">
            <Upload className="w-3.5 h-3.5 text-[#4A8B8D]" />
            <span className="truncate max-w-[110px]">{uploadedTimetableName || 'Upload Timetable'}</span>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleTimetableUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => setIsQuietMode(!isQuietMode)}
            className={`px-4 py-1.5 text-xs rounded-full font-bold transition-all cursor-pointer ${
              isQuietMode
                ? 'bg-[#4A8B8D] text-white shadow-xs'
                : 'bg-white text-[#7A756D] border border-[#E8E4D9]'
            }`}
          >
            {isQuietMode ? 'Quick Mode: ON' : 'Turn ON'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1-TAP QUIET HOURS EXAM PULSE */}
        {isQuietMode ? (
          <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-[#E8E4D9] shadow-sm space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D]">
              Single-Tap Pulse Check
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'calm', label: 'Holding Up Calmly', emoji: '🌿', color: 'border-[#4A8B8D] bg-[#D1E5E6]/30 text-[#1F4647]' },
                { id: 'hanging-on', label: 'Chai & Hanging On', emoji: '☕', color: 'border-[#E8E4D9] bg-[#F0EDE4] text-[#3D3A35]' },
                { id: 'stressed', label: 'Viva / Exam Pressure', emoji: '⚡', color: 'border-[#E98A72] bg-[#F5D5CB]/40 text-[#A84832]' },
                { id: 'exhausted', label: 'Need Serious Rest', emoji: '💤', color: 'border-[#E98A72] bg-[#F5D5CB]/70 text-[#A84832]' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setQuietPulse(item.id as any)}
                  className={`p-4 rounded-[24px] border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                    quietPulse === item.id
                      ? `ring-2 ring-[#4A8B8D] font-bold ${item.color} shadow-xs`
                      : 'border-[#E8E4D9] bg-[#F9F7F2] hover:bg-[#F0EDE4]'
                  }`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="mt-2 text-xs font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* FULL 5-DIMENSION MICRO-SURVEY */
          <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-[#E8E4D9] shadow-sm space-y-6">
            {/* Sleep Quality */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-[#2D2D2B] flex items-center gap-2">
                  <Moon className="w-4 h-4 text-[#4A8B8D]" />
                  1. Sleep Restfulness (Last Night)
                </span>
                <span className="font-semibold text-[#4A8B8D] bg-[#F0EDE4] px-2.5 py-0.5 rounded-full text-xs">
                  {sleep === 1 ? '😴 Broken / <4h' : sleep === 2 ? '🥱 Light / Restless' : sleep === 3 ? '🛌 Okay (~6h)' : sleep === 4 ? '✨ Restful (7h+)' : '🌟 Deeply Recharged'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={sleep}
                onChange={(e) => setSleep(Number(e.target.value))}
                className="w-full accent-[#4A8B8D] h-2 bg-[#F0EDE4] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#7A756D] font-medium px-1">
                <span>Insomnia / All-nighter</span>
                <span>Balanced</span>
                <span>Fully Rested</span>
              </div>
            </div>

            {/* Stress & Anxiety */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-[#2D2D2B] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#E98A72]" />
                  2. Stress & Pressure Level
                </span>
                <span className={`font-semibold px-2.5 py-0.5 rounded-full text-xs ${
                  stress >= 4 ? 'bg-[#F5D5CB] text-[#A84832]' : 'bg-[#D1E5E6]/40 text-[#1F4647]'
                }`}>
                  {stress === 1 ? '🌿 Very Calm' : stress === 2 ? '🍃 Manageable' : stress === 3 ? '⚖️ Moderate Pressure' : stress === 4 ? '🔥 High Stress' : '💥 Overwhelmed'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={stress}
                onChange={(e) => setStress(Number(e.target.value))}
                className="w-full accent-[#E98A72] h-2 bg-[#F0EDE4] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#7A756D] font-medium px-1">
                <span>Tranquil</span>
                <span>Normal Campus Pace</span>
                <span>Peak Overload</span>
              </div>
            </div>

            {/* Energy & Motivation */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-[#2D2D2B] flex items-center gap-2">
                  <BatteryCharging className="w-4 h-4 text-[#4A8B8D]" />
                  3. Energy & Focus
                </span>
                <span className="font-semibold text-[#4A8B8D] bg-[#F0EDE4] px-2.5 py-0.5 rounded-full text-xs">
                  {energy === 1 ? '🪫 Drained' : energy === 2 ? '🔋 Low Battery' : energy === 3 ? '⚡ Steady' : energy === 4 ? '🚀 Good Momentum' : '🔥 In the Zone'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full accent-[#4A8B8D] h-2 bg-[#F0EDE4] rounded-lg cursor-pointer"
              />
            </div>

            {/* Social Connection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-[#2D2D2B] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#4A8B8D]" />
                  4. Social & Hostel Connection
                </span>
                <span className="font-semibold text-[#4A8B8D] bg-[#F0EDE4] px-2.5 py-0.5 rounded-full text-xs">
                  {social === 1 ? '🍂 Feeling Isolated' : social === 3 ? '☕ Had some chats' : '🫂 Supported by friends'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={social}
                onChange={(e) => setSocial(Number(e.target.value))}
                className="w-full accent-[#4A8B8D] h-2 bg-[#F0EDE4] rounded-lg cursor-pointer"
              />
            </div>

            {/* Academic Workload */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-[#2D2D2B] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#4A8B8D]" />
                  5. Coursework & Deadlines Load
                </span>
                <span className="font-semibold text-[#4A8B8D] bg-[#F0EDE4] px-2.5 py-0.5 rounded-full text-xs">
                  {workload === 1 ? '🍃 Light' : workload === 3 ? '📚 Moderate' : '⛰️ Heavy Submissions'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={workload}
                onChange={(e) => setWorkload(Number(e.target.value))}
                className="w-full accent-[#4A8B8D] h-2 bg-[#F0EDE4] rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Free-text Journal & Voice Note (Optional) */}
        <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-[#E8E4D9] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[#7A756D]">
              Optional Journal / Voice Note
            </label>
            <span className="text-xs text-[#7A756D]">Completely private</span>
          </div>

          <textarea
            value={journalNote}
            onChange={(e) => setJournalNote(e.target.value)}
            placeholder="Unload whatever is on your mind... lab submissions, mess food, homesickness, or small wins today."
            rows={3}
            className="w-full p-4 bg-[#F9F7F2] border border-[#E8E4D9] rounded-[20px] text-xs sm:text-sm text-[#2D2D2B] focus:outline-hidden focus:ring-2 focus:ring-[#4A8B8D] focus:bg-white resize-none"
          />

          {/* Voice logging widget in regional languages */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={handleVoiceRecordToggle}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isRecording
                  ? 'bg-[#E98A72] text-white animate-pulse'
                  : recordedVoiceNote
                  ? 'bg-[#D1E5E6] text-[#1F4647] border border-[#4A8B8D]/30'
                  : 'bg-[#F0EDE4] hover:bg-[#E8E4D9] text-[#4A8B8D]'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Recording ({recordingSeconds}s) - Tap to Stop</span>
                </>
              ) : recordedVoiceNote ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4A8B8D]" />
                  <span>Voice Note Saved</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-[#4A8B8D]" />
                  <span>Record Voice Note ({language === 'hi' ? 'हिन्दी' : language === 'ta' ? 'தமிழ்' : 'English'})</span>
                </>
              )}
            </button>

            {recordedVoiceNote && (
              <button
                type="button"
                onClick={() => setRecordedVoiceNote(null)}
                className="text-xs text-[#E98A72] hover:underline cursor-pointer font-medium"
              >
                Discard Audio
              </button>
            )}
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          className="w-full py-4 px-6 bg-[#4A8B8D] hover:bg-[#376F71] active:scale-[0.99] text-white rounded-full font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#F5D5CB]" />
          <span>Save Today's Check-in & Celebrate Streak</span>
        </button>
      </form>
    </div>
  );
};
