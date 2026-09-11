import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserCheck,
  Calendar,
  Clock,
  ShieldCheck,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Heart,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { CounsellorBooking, FollowUpItem } from '../types';

interface TalkToSomeoneViewProps {
  activeBooking: CounsellorBooking | null;
  onBookCounsellor: (booking: CounsellorBooking) => void;
  onUpdateFollowUp: (weekNumber: number, status: 'completed' | 'skipped', note?: string) => void;
}

const AVAILABLE_COUNSELLORS = [
  {
    name: 'Dr. Ananya Sharma, Ph.D.',
    title: 'Senior Clinical Psychologist (Campus Wellbeing Centre)',
    specialties: 'Academic burnout, Exam anxiety, Transition stress',
    nextRoutineSlot: 'Tomorrow, 10:30 AM',
    nextUrgentSlot: 'Today, 4:00 PM (Emergency Walk-in)',
    avatarBg: 'bg-emerald-100 text-emerald-800',
  },
  {
    name: 'Prof. K. Ramanathan, M.Phil',
    title: 'Student Guidance Counsellor',
    specialties: 'Hostel adaptation, Family expectations, Career clarity',
    nextRoutineSlot: 'Tomorrow, 2:15 PM',
    nextUrgentSlot: 'Today, 5:30 PM',
    avatarBg: 'bg-teal-100 text-teal-800',
  },
  {
    name: 'Meera Deshmukh, M.Sc.',
    title: 'Peer Support & Youth Listener Lead',
    specialties: 'Placement pressure, Relationship boundaries, Low mood',
    nextRoutineSlot: 'Friday, 11:00 AM',
    nextUrgentSlot: 'Today, 3:30 PM',
    avatarBg: 'bg-sky-100 text-sky-800',
  },
];

export const TalkToSomeoneView: React.FC<TalkToSomeoneViewProps> = ({
  activeBooking,
  onBookCounsellor,
  onUpdateFollowUp,
}) => {
  const [urgency, setUrgency] = useState<'routine' | 'urgent'>('routine');
  const [selectedCounsellorIdx, setSelectedCounsellorIdx] = useState(0);
  const [topic, setTopic] = useState('Academic stress & burnout');
  const [customNote, setCustomNote] = useState('');
  const [mode, setMode] = useState<'in-person' | 'private-voice' | 'secure-chat'>('private-voice');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const selectedCounsellor = AVAILABLE_COUNSELLORS[selectedCounsellorIdx];

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate 4-week gentle follow-up schedule
    const followUps: FollowUpItem[] = [
      {
        id: `fu-1`,
        weekNumber: 1,
        scheduledDate: '7 days after session',
        prompt: 'Week 1 check-in: How are you feeling after your chat with the counsellor?',
        status: 'pending',
      },
      {
        id: `fu-2`,
        weekNumber: 2,
        scheduledDate: '14 days after session',
        prompt: 'Week 2 check-in: Have you had time to try any of the pacing tools you discussed?',
        status: 'pending',
      },
      {
        id: `fu-3`,
        weekNumber: 3,
        scheduledDate: '21 days after session',
        prompt: 'Week 3 check-in: How is your sleep and energy level this week?',
        status: 'pending',
      },
      {
        id: `fu-4`,
        weekNumber: 4,
        scheduledDate: '28 days after session',
        prompt: 'Week 4 check-in: Monthly check: would you like to book a follow-up session?',
        status: 'pending',
      },
    ];

    const newBooking: CounsellorBooking = {
      id: `booking-${Date.now()}`,
      urgency,
      topic,
      slotTime:
        urgency === 'urgent'
          ? selectedCounsellor.nextUrgentSlot
          : selectedCounsellor.nextRoutineSlot,
      counsellorName: selectedCounsellor.name,
      counsellorTitle: selectedCounsellor.title,
      mode,
      status: 'booked',
      createdAt: new Date().toISOString(),
      estimatedWaitMinutes: urgency === 'urgent' ? 25 : 1440,
      followUpSchedule: followUps,
    };

    onBookCounsellor(newBooking);
    setIsBookingModalOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-[#E8E4D9] shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-[#D1E5E6]/50 rounded-[22px] border border-[#4A8B8D]/20 text-[#4A8B8D]">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif italic text-2xl sm:text-3xl font-normal text-[#2D2D2B]">
              Connect with a Campus Counsellor
            </h2>
            <p className="text-xs sm:text-sm text-[#7A756D] mt-0.5">
              Confidential, professional, and free. Your faculty and parents are never notified.
            </p>
          </div>
        </div>

        {/* Real-time Capacity Engine Bar */}
        <div className="p-4 bg-[#D1E5E6]/40 rounded-[24px] border border-[#4A8B8D]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-[#1F4647]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A8B8D] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4A8B8D]"></span>
            </span>
            <span className="font-semibold text-[#1F4647]">Counsellor Capacity Engine: </span>
            <span className="text-[#3D3A35]">3 Counsellors on Duty Today</span>
          </div>
          <span className="font-medium bg-white px-3 py-1 rounded-full border border-[#E8E4D9] text-[#4A8B8D] self-start sm:self-auto text-xs shadow-2xs">
            ⚡ Fastest human slot: Today at 3:30 PM
          </span>
        </div>
      </div>

      {/* ACTIVE BOOKING CARD (If exists) with 4-Week Follow-up Loop */}
      {activeBooking && (
        <div className="bg-white p-6 sm:p-8 rounded-[36px] border-2 border-[#4A8B8D]/30 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8E4D9] pb-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#4A8B8D]" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#4A8B8D]">
                  Confirmed Appointment
                </span>
                <h4 className="text-base sm:text-lg font-serif font-bold text-[#2D2D2B]">{activeBooking.counsellorName}</h4>
              </div>
            </div>
            <span className="text-xs font-bold px-3.5 py-1 bg-[#F0EDE4] text-[#4A8B8D] rounded-full border border-[#E8E4D9]">
              {activeBooking.urgency === 'urgent' ? '⚡ Priority Slot' : 'Routine Slot'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs sm:text-sm">
            <div className="p-3.5 bg-[#F9F7F2] rounded-[20px] border border-[#E8E4D9] space-y-0.5">
              <span className="text-[#7A756D] font-medium text-xs">Scheduled Time</span>
              <div className="font-bold text-[#2D2D2B] flex items-center gap-1.5 pt-0.5">
                <Clock className="w-4 h-4 text-[#4A8B8D]" />
                {activeBooking.slotTime}
              </div>
            </div>

            <div className="p-3.5 bg-[#F9F7F2] rounded-[20px] border border-[#E8E4D9] space-y-0.5">
              <span className="text-[#7A756D] font-medium text-xs">Session Mode</span>
              <div className="font-bold text-[#2D2D2B] capitalize pt-0.5">
                {activeBooking.mode.replace('-', ' ')}
              </div>
            </div>

            <div className="p-3.5 bg-[#F9F7F2] rounded-[20px] border border-[#E8E4D9] space-y-0.5">
              <span className="text-[#7A756D] font-medium text-xs">Topic Focus</span>
              <div className="font-bold text-[#2D2D2B] truncate pt-0.5">
                {activeBooking.topic}
              </div>
            </div>
          </div>

          {/* POST-ESCALATION 4-WEEK GENTLE FOLLOW-UP LOOP */}
          <div className="pt-2 space-y-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4A8B8D]" />
              <h5 className="font-serif italic font-bold text-sm text-[#2D2D2B]">
                Post-Escalation 4-Week Care Roadmap
              </h5>
            </div>
            <p className="text-xs text-[#7A756D]">
              Automated low-pressure re-check-ins scheduled after your session to ensure ongoing support.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeBooking.followUpSchedule.map((fu) => (
                <div
                  key={fu.id}
                  className={`p-4 rounded-[24px] border text-xs space-y-2 ${
                    fu.status === 'completed'
                      ? 'bg-[#D1E5E6]/30 border-[#4A8B8D]/30 text-[#1F4647]'
                      : fu.status === 'skipped'
                      ? 'bg-[#F9F7F2] border-[#E8E4D9] text-[#7A756D]'
                      : 'bg-white border-[#E8E4D9] text-[#2D2D2B] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#4A8B8D]">Week {fu.weekNumber}</span>
                    <span className="text-[11px] text-[#7A756D]">{fu.scheduledDate}</span>
                  </div>
                  <p className="text-xs text-[#3D3A35] leading-relaxed">{fu.prompt}</p>

                  {fu.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onUpdateFollowUp(fu.weekNumber, 'completed', 'Feeling supported')}
                        className="px-3 py-1 bg-[#4A8B8D] hover:bg-[#376F71] text-white rounded-full font-medium text-xs cursor-pointer"
                      >
                        Log Quick Check
                      </button>
                      <button
                        onClick={() => onUpdateFollowUp(fu.weekNumber, 'skipped')}
                        className="px-3 py-1 bg-[#F0EDE4] hover:bg-[#E8E4D9] text-[#7A756D] rounded-full font-medium text-xs cursor-pointer"
                      >
                        Skip
                      </button>
                    </div>
                  )}
                  {fu.status === 'completed' && (
                    <span className="text-xs text-[#4A8B8D] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Checked in
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BOOKING FLOW CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-[#E8E4D9] shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif italic font-normal text-xl sm:text-2xl text-[#2D2D2B]">
            Book an Individual Session
          </h3>
          <span className="text-xs text-[#7A756D] font-medium px-3 py-1 bg-[#F0EDE4] rounded-full">Step 1 of 2</span>
        </div>

        {/* Urgency Selector */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D]">
            Select Urgency Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => setUrgency('routine')}
              className={`p-4 rounded-[24px] border text-left transition-all cursor-pointer ${
                urgency === 'routine'
                  ? 'bg-[#D1E5E6]/30 border-[#4A8B8D] ring-2 ring-[#4A8B8D]/20 shadow-xs'
                  : 'bg-[#F9F7F2] border-[#E8E4D9] hover:bg-[#F0EDE4]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-[#2D2D2B]">Routine Check-in</span>
                <span className="text-xs text-[#4A8B8D] font-semibold">Within 24-48 hrs</span>
              </div>
              <p className="text-xs text-[#7A756D] mt-1.5 leading-relaxed">
                For regular guidance on study stress, habits, or relationship questions.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setUrgency('urgent')}
              className={`p-4 rounded-[24px] border text-left transition-all cursor-pointer ${
                urgency === 'urgent'
                  ? 'bg-[#F5D5CB]/40 border-[#E98A72] ring-2 ring-[#E98A72]/20 shadow-xs'
                  : 'bg-[#F9F7F2] border-[#E8E4D9] hover:bg-[#F0EDE4]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-[#A84832]">"I need to talk soon"</span>
                <span className="text-[11px] text-[#A84832] font-bold bg-[#F5D5CB] px-2.5 py-0.5 rounded-full">
                  Same Day (Fast-Track)
                </span>
              </div>
              <p className="text-xs text-[#7A756D] mt-1.5 leading-relaxed">
                For acute overwhelm, breakdown before exams, or urgent emotional support.
              </p>
            </button>
          </div>
        </div>

        {/* Counsellor Roster */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D]">
            Available Campus Counsellors & Listeners
          </label>
          <div className="space-y-3">
            {AVAILABLE_COUNSELLORS.map((c, idx) => {
              const isSelected = selectedCounsellorIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedCounsellorIdx(idx)}
                  className={`p-5 rounded-[28px] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#D1E5E6]/30 border-[#4A8B8D] ring-2 ring-[#4A8B8D]/20 shadow-xs'
                      : 'bg-white border-[#E8E4D9] hover:border-[#4A8B8D]/40'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-11 h-11 rounded-[18px] flex items-center justify-center font-bold text-xs shrink-0 ${c.avatarBg}`}>
                      {c.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm sm:text-base text-[#2D2D2B]">{c.name}</h4>
                      <p className="text-xs text-[#4A8B8D] font-medium">{c.title}</p>
                      <p className="text-xs text-[#7A756D] mt-1">
                        <span className="font-medium text-[#2D2D2B]">Specialties: </span>
                        {c.specialties}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2.5 sm:pt-0 border-[#E8E4D9] shrink-0">
                    <span className="text-[11px] text-[#7A756D]">Next Slot:</span>
                    <span className="text-xs font-bold text-[#1F4647] bg-[#F0EDE4] px-3 py-1 rounded-full border border-[#E8E4D9] mt-0.5">
                      {urgency === 'urgent' ? c.nextUrgentSlot : c.nextRoutineSlot}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          id="proceed-booking-modal-btn"
          onClick={() => setIsBookingModalOpen(true)}
          className="w-full py-4 px-6 bg-[#4A8B8D] hover:bg-[#376F71] active:scale-[0.99] text-white rounded-full font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue Booking with {selectedCounsellor.name}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2D2D2B]/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[36px] shadow-2xl border border-[#E8E4D9] overflow-hidden"
            >
              <div className="p-5 bg-[#4A8B8D] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-5 h-5 text-[#F5D5CB]" />
                  <h4 className="font-serif italic text-lg font-bold">Confirm Counsellor Session</h4>
                </div>
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
                <div className="p-4 bg-[#D1E5E6]/40 rounded-[20px] border border-[#4A8B8D]/30 text-xs text-[#1F4647] space-y-1">
                  <div className="font-bold text-sm">{selectedCounsellor.name}</div>
                  <div>Slot: <strong>{urgency === 'urgent' ? selectedCounsellor.nextUrgentSlot : selectedCounsellor.nextRoutineSlot}</strong></div>
                  <div className="text-[11px] text-[#4A8B8D]">Campus Wellbeing Centre / Private Room 204</div>
                </div>

                {/* Session Mode */}
                <div>
                  <label className="block text-xs font-bold text-[#2D2D2B] mb-1.5">Preferred Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'private-voice', label: 'Private Voice' },
                      { id: 'in-person', label: 'In-Person (Rm 204)' },
                      { id: 'secure-chat', label: 'Encrypted Chat' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMode(m.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                          mode === m.id
                            ? 'bg-[#4A8B8D] text-white border-[#4A8B8D]'
                            : 'bg-[#F9F7F2] border-[#E8E4D9] text-[#7A756D] hover:bg-[#F0EDE4]'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Topic */}
                <div>
                  <label className="block text-xs font-bold text-[#2D2D2B] mb-1.5">Primary Topic</label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full p-3 bg-[#F9F7F2] border border-[#E8E4D9] rounded-xl text-xs font-medium text-[#2D2D2B]"
                  >
                    <option value="Academic stress & burnout">Academic stress & burnout</option>
                    <option value="Exam / Placement anxiety">Exam / Placement anxiety</option>
                    <option value="Hostel isolation & homesickness">Hostel isolation & homesickness</option>
                    <option value="Relationship & family conflict">Relationship & family conflict</option>
                    <option value="Low motivation / grief">Low motivation / grief</option>
                  </select>
                </div>

                {/* Optional Note */}
                <div>
                  <label className="block text-xs font-bold text-[#2D2D2B] mb-1.5">
                    Optional Note for the Counsellor
                  </label>
                  <textarea
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    rows={2}
                    placeholder="Anything specific you'd like them to know in advance..."
                    className="w-full p-3 bg-[#F9F7F2] border border-[#E8E4D9] rounded-xl text-xs text-[#2D2D2B] resize-none"
                  />
                </div>

                <div className="p-3 bg-[#F0EDE4] rounded-[16px] border border-[#E8E4D9] text-xs text-[#7A756D]">
                  🔒 <strong>Privacy note:</strong> Sessions are strictly private. No disciplinary records or academic transcripts are touched.
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="flex-1 py-3 bg-[#F0EDE4] hover:bg-[#E8E4D9] text-[#3D3A35] text-xs font-semibold rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#4A8B8D] hover:bg-[#376F71] text-white text-xs font-bold rounded-full shadow-xs"
                  >
                    Confirm Appointment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
