import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Video, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Award, 
  FileText, 
  Heart, 
  Info,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  LicensedProfessional, 
  VETTED_PROFESSIONALS, 
  ProfessionalBookingRecord, 
  createProfessionalBooking, 
  getStudentProfessionalBookings 
} from '../services/professionalBooking';
import { ProfessionalIntakeModal } from './ProfessionalIntakeModal';

interface ProfessionalTeleconsultProps {
  currentUserId?: string;
  onOpenSandboxPractice?: (context: string) => void;
  onOpenCrisisBar?: () => void;
}

export const ProfessionalTeleconsult: React.FC<ProfessionalTeleconsultProps> = ({
  currentUserId = 'student-guest',
  onOpenSandboxPractice,
  onOpenCrisisBar,
}) => {
  const [professionals] = useState<LicensedProfessional[]>(VETTED_PROFESSIONALS);
  const [selectedProfessional, setSelectedProfessional] = useState<LicensedProfessional | null>(null);
  const [myBookings, setMyBookings] = useState<ProfessionalBookingRecord[]>([]);
  const [bookingSuccessAlert, setBookingSuccessAlert] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'Psychiatrist' | 'Clinical Psychologist'>('all');

  useEffect(() => {
    const loadBookings = async () => {
      const records = await getStudentProfessionalBookings(currentUserId);
      setMyBookings(records);
    };
    loadBookings();
  }, [currentUserId]);

  const handleBookingConfirm = async (data: {
    consultationType: 'video' | 'audio' | 'human-chat';
    scheduledDate: string;
    scheduledTime: string;
    intakeNoteInStudentWords: string;
    consentAgreed: boolean;
  }) => {
    if (!selectedProfessional) return;

    await createProfessionalBooking({
      studentId: currentUserId,
      professionalId: selectedProfessional.id,
      professionalName: selectedProfessional.name,
      professionalRole: selectedProfessional.role,
      consultationType: data.consultationType,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      intakeNoteInStudentWords: data.intakeNoteInStudentWords,
      consentAgreed: data.consentAgreed,
      status: 'confirmed',
    });

    const updated = await getStudentProfessionalBookings(currentUserId);
    setMyBookings(updated);
    setBookingSuccessAlert(
      `Your teleconsultation with ${selectedProfessional.name} (${data.scheduledDate} at ${data.scheduledTime}) has been confirmed! An encrypted link will be delivered 15 minutes before the session.`
    );
    setSelectedProfessional(null);
  };

  const filteredProfessionals = professionals.filter((p) => {
    if (activeFilter === 'all') return true;
    return p.role === activeFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Pilot Transparency Notice & Partner Clarity */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300/60 dark:border-amber-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Award className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider text-[11px]">
              Verified Partner Network • Student Care Pilot
            </div>
            <p className="text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
              Real licensed psychiatrists and clinical psychologists vetted by institutional clinical advisory. MindBridge 360 facilitates scheduling and intake; consultations are conducted privately by independent human professionals.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 font-semibold text-[10px]">
            100% Student Grant Covered
          </span>
        </div>
      </div>

      {/* Persistent Crisis Safety Banner */}
      <div className="p-3.5 rounded-xl bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>In acute distress or crisis right now? Professional teleconsultations are scheduled, not emergency care.</span>
        </div>
        <button
          type="button"
          onClick={onOpenCrisisBar}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] shadow-xs transition-colors cursor-pointer"
        >
          Immediate SOS / Tele-MANAS (14416)
        </button>
      </div>

      {/* Booking Success Notification */}
      {bookingSuccessAlert && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Appointment Confirmed!</div>
              <p className="mt-0.5">{bookingSuccessAlert}</p>
              {onOpenSandboxPractice && (
                <button
                  type="button"
                  onClick={() => onOpenSandboxPractice('I booked a teleconsultation with a psychiatrist and want to practice explaining my recent anxiety and sleep issues.')}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2C6E70] dark:text-[#6CB2B5] underline hover:no-underline cursor-pointer"
                >
                  <span>Practice what to say beforehand in the Sandbox</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => setBookingSuccessAlert(null)}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 p-1 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Upcoming Sessions */}
      {myBookings.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E252B] border border-[#E8E2D5] dark:border-[#2F3A46] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#718096] dark:text-[#A0AEC0] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#2C6E70]" />
              Your Confirmed Teleconsultations ({myBookings.length})
            </h4>
            <span className="text-[11px] text-[#718096] dark:text-[#A0AEC0]">
              Private • Never logged to campus radar
            </span>
          </div>
          <div className="grid gap-2.5">
            {myBookings.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl bg-stone-50 dark:bg-[#252E38] border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-[#2D3748] dark:text-white flex items-center gap-2">
                    <span>{b.professionalName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-medium">
                      {b.professionalRole}
                    </span>
                  </div>
                  <div className="text-[#718096] dark:text-[#A0AEC0] flex items-center gap-3 mt-1 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#2C6E70]" />
                      {b.scheduledDate} at {b.scheduledTime}
                    </span>
                    <span className="uppercase font-semibold tracking-wider text-[10px] text-[#2C6E70]">
                      {b.consultationType}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-semibold">
                    Link Ready Soon
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Directory Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#2D3748] dark:text-white font-['Playfair_Display',serif]">
            Verified Partner Directory
          </h3>
          <p className="text-xs text-[#718096] dark:text-[#A0AEC0]">
            Browse licensed clinical practitioners with verified state board and RCI/NMC registration.
          </p>
        </div>
        <div className="inline-flex rounded-xl bg-[#F0ECE1] dark:bg-[#252E38] p-1 border border-[#E0D7C3] dark:border-[#384654] text-xs">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-[#1E252B] text-[#2D3748] dark:text-white shadow-xs'
                : 'text-[#718096] dark:text-[#A0AEC0] hover:text-[#2D3748]'
            }`}
          >
            All Partners
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('Psychiatrist')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeFilter === 'Psychiatrist'
                ? 'bg-white dark:bg-[#1E252B] text-[#2D3748] dark:text-white shadow-xs'
                : 'text-[#718096] dark:text-[#A0AEC0] hover:text-[#2D3748]'
            }`}
          >
            Psychiatrists (MD)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('Clinical Psychologist')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeFilter === 'Clinical Psychologist'
                ? 'bg-white dark:bg-[#1E252B] text-[#2D3748] dark:text-white shadow-xs'
                : 'text-[#718096] dark:text-[#A0AEC0] hover:text-[#2D3748]'
            }`}
          >
            Clinical Psychologists
          </button>
        </div>
      </div>

      {/* Directory Cards */}
      <div className="grid gap-4 md:grid-cols-1">
        {filteredProfessionals.map((prof) => (
          <div
            key={prof.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#1E252B] border border-[#E8E2D5] dark:border-[#2F3A46] shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row gap-5"
          >
            {/* Avatar & Fast Credentials */}
            <div className="shrink-0 flex sm:flex-col items-center gap-3">
              <img
                src={prof.avatarUrl}
                alt={prof.name}
                className="w-20 h-20 rounded-2xl object-cover border border-[#E2E8F0] dark:border-[#384654]"
                referrerPolicy="no-referrer"
              />
              <div className="text-center sm:text-left">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0 space-y-2.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-[#2D3748] dark:text-white">
                    {prof.name}
                  </h4>
                  <p className="text-xs font-medium text-[#2C6E70] dark:text-[#6CB2B5]">
                    {prof.title} • {prof.experienceYears} Years Exp.
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block text-[11px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800">
                    {prof.feeStructure}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#4A5568] dark:text-[#CBD5E0] leading-relaxed">
                {prof.bio}
              </p>

              {/* Auditable Credentials & Registration Numbers */}
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#252E38] border border-stone-200 dark:border-stone-700 text-[11px] space-y-1">
                <div className="text-[#2D3748] dark:text-white font-medium">
                  <strong>Credentials:</strong> {prof.credentials}
                </div>
                <div className="text-[#718096] dark:text-[#A0AEC0] flex flex-wrap items-center gap-3">
                  <span><strong>License:</strong> {prof.licenseNumber}</span>
                  <span>•</span>
                  <span><strong>Verified by:</strong> {prof.verifiedBy}</span>
                  <span>•</span>
                  <span><strong>Audited:</strong> {prof.verifiedDate}</span>
                </div>
              </div>

              {/* Specializations and Languages */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {prof.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-[#293440] text-[#4A5568] dark:text-[#CBD5E0]"
                  >
                    {spec}
                  </span>
                ))}
                <span className="text-[11px] text-[#718096] dark:text-[#A0AEC0] ml-2">
                  Speaks: {prof.languages.join(', ')}
                </span>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#F0ECE1] dark:border-[#2D3748]">
                <div className="flex items-center gap-3 text-xs text-[#718096] dark:text-[#A0AEC0]">
                  <span className="flex items-center gap-1 font-medium">
                    <Video className="w-3.5 h-3.5 text-[#2C6E70]" /> Video
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#2C6E70]" /> Audio
                  </span>
                  {prof.consultationTypes.includes('human-chat') && (
                    <span className="flex items-center gap-1 font-medium">
                      <MessageSquare className="w-3.5 h-3.5 text-[#2C6E70]" /> Chat
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProfessional(prof)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#2C6E70] hover:bg-[#23585A] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Teleconsultation</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for intake and appointment confirmation */}
      {selectedProfessional && (
        <ProfessionalIntakeModal
          professional={selectedProfessional}
          isOpen={true}
          onClose={() => setSelectedProfessional(null)}
          onConfirmBooking={handleBookingConfirm}
        />
      )}
    </div>
  );
};
