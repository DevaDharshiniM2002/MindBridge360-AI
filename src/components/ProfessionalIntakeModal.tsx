import React, { useState } from 'react';
import { ShieldCheck, Video, Phone, MessageSquare, AlertCircle, CheckCircle2, Lock, X } from 'lucide-react';
import { LicensedProfessional, validateIntakeSafety } from '../services/professionalBooking';

interface ProfessionalIntakeModalProps {
  professional: LicensedProfessional;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (bookingData: {
    consultationType: 'video' | 'audio' | 'human-chat';
    scheduledDate: string;
    scheduledTime: string;
    intakeNoteInStudentWords: string;
    consentAgreed: boolean;
  }) => void;
}

export const ProfessionalIntakeModal: React.FC<ProfessionalIntakeModalProps> = ({
  professional,
  isOpen,
  onClose,
  onConfirmBooking,
}) => {
  const [selectedType, setSelectedType] = useState<'video' | 'audio' | 'human-chat'>('video');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<{ dayIdx: number; timeIdx: number }>({
    dayIdx: 0,
    timeIdx: 0,
  });
  const [intakeText, setIntakeText] = useState<string>('');
  const [consentAcknowledged, setConsentAcknowledged] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentDay = professional.availabilitySlots[selectedSlotIndex.dayIdx] || professional.availabilitySlots[0];
  const currentTime = currentDay?.times[selectedSlotIndex.timeIdx] || currentDay?.times[0] || '10:00 AM';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentAcknowledged) {
      setErrorMsg('Please review and check the clinical teleconsultation consent acknowledgment.');
      return;
    }
    if (intakeText.trim().length < 10) {
      setErrorMsg('Please provide a brief sentence in your own words describing what you would like to discuss with the doctor.');
      return;
    }

    const safetyCheck = validateIntakeSafety(intakeText);
    if (!safetyCheck.safe) {
      setErrorMsg(safetyCheck.feedback || 'Please edit your intake description.');
      return;
    }

    setErrorMsg(null);
    onConfirmBooking({
      consultationType: selectedType,
      scheduledDate: currentDay.date,
      scheduledTime: currentTime,
      intakeNoteInStudentWords: intakeText.trim(),
      consentAgreed: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-[#FDFBF7] dark:bg-[#1C242C] border border-[#E8E2D5] dark:border-[#2F3A46] rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intake-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E8E2D5] dark:border-[#2D3845] shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/50 mb-1">
              <ShieldCheck className="w-3 h-3" />
              Verified Licensed Professional
            </div>
            <h3 id="intake-modal-title" className="text-lg font-bold text-[#2D3748] dark:text-white font-['Playfair_Display',serif]">
              Book Teleconsultation with {professional.name}
            </h3>
            <p className="text-xs text-[#718096] dark:text-[#A0AEC0]">
              {professional.credentials} • Lic: {professional.licenseNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#A0AEC0] hover:text-[#4A5568] dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1 text-xs sm:text-sm">
          {/* Real Human Professional Disclaimer */}
          <div className="p-3 rounded-xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/40 text-[#1F4647] dark:text-[#A7D7D9] text-xs leading-relaxed">
            <strong className="block font-semibold mb-0.5 text-[#133A3B] dark:text-teal-200">
              100% Real Clinical Teleconsultation:
            </strong>
            You will meet directly with a licensed human professional over an encrypted link. Mitra (AI) does not participate in your consultation, does not listen to your call, and does not provide psychiatric diagnoses or medical treatments.
          </div>

          {/* Consultation Mode */}
          <div>
            <label className="block text-xs font-semibold text-[#4A5568] dark:text-[#CBD5E0] mb-2">
              Select Consultation Type:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {professional.consultationTypes.includes('video') && (
                <button
                  type="button"
                  onClick={() => setSelectedType('video')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-medium cursor-pointer ${
                    selectedType === 'video'
                      ? 'bg-[#2C6E70] text-white border-[#2C6E70] shadow-xs'
                      : 'bg-white dark:bg-[#252F3A] text-[#4A5568] dark:text-[#CBD5E0] border-[#E2E8F0] dark:border-[#384654] hover:border-[#2C6E70]'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Encrypted Video</span>
                </button>
              )}

              {professional.consultationTypes.includes('audio') && (
                <button
                  type="button"
                  onClick={() => setSelectedType('audio')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-medium cursor-pointer ${
                    selectedType === 'audio'
                      ? 'bg-[#2C6E70] text-white border-[#2C6E70] shadow-xs'
                      : 'bg-white dark:bg-[#252F3A] text-[#4A5568] dark:text-[#CBD5E0] border-[#E2E8F0] dark:border-[#384654] hover:border-[#2C6E70]'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>Private Audio Call</span>
                </button>
              )}

              {professional.consultationTypes.includes('human-chat') && (
                <button
                  type="button"
                  onClick={() => setSelectedType('human-chat')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-medium cursor-pointer ${
                    selectedType === 'human-chat'
                      ? 'bg-[#2C6E70] text-white border-[#2C6E70] shadow-xs'
                      : 'bg-white dark:bg-[#252F3A] text-[#4A5568] dark:text-[#CBD5E0] border-[#E2E8F0] dark:border-[#384654] hover:border-[#2C6E70]'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Live Human Chat</span>
                </button>
              )}
            </div>
          </div>

          {/* Select Date & Slot */}
          <div>
            <label className="block text-xs font-semibold text-[#4A5568] dark:text-[#CBD5E0] mb-2">
              Available Schedule Slots:
            </label>
            <div className="space-y-2">
              {professional.availabilitySlots.map((slot, dayIdx) => (
                <div key={slot.date} className="p-2.5 rounded-xl bg-white dark:bg-[#252F3A] border border-[#E2E8F0] dark:border-[#384654]">
                  <div className="text-[11px] font-semibold text-[#718096] dark:text-[#A0AEC0] mb-1.5">
                    {slot.day} ({slot.date})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {slot.times.map((t, timeIdx) => {
                      const isSelected = selectedSlotIndex.dayIdx === dayIdx && selectedSlotIndex.timeIdx === timeIdx;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedSlotIndex({ dayIdx, timeIdx })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#2C6E70] text-white border-[#2C6E70]'
                              : 'bg-stone-50 dark:bg-[#1C242C] text-[#4A5568] dark:text-[#CBD5E0] border-stone-200 dark:border-stone-700 hover:border-[#2C6E70]'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Intake Note in Student's Own Words */}
          <div>
            <label className="block text-xs font-semibold text-[#4A5568] dark:text-[#CBD5E0] mb-1">
              What would you like to share or work through? <span className="font-normal text-[#718096]">(in your own words)</span>
            </label>
            <textarea
              rows={3}
              value={intakeText}
              onChange={(e) => setIntakeText(e.target.value)}
              placeholder="e.g., I've been feeling deeply drained preparing for final viva exams and have had trouble falling asleep. I'd like guidance on handling panic when studying."
              className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-[#252F3A] border border-[#DCD5C3] dark:border-[#384654] text-[#2D3748] dark:text-white placeholder-[#A0AEC0] focus:outline-hidden focus:ring-2 focus:ring-[#2C6E70] transition-all"
            />
            <p className="text-[11px] text-[#718096] dark:text-[#A0AEC0] mt-1">
              Note: Mitra preserves your exact phrasing for the doctor. No AI summaries or labels are added.
            </p>
          </div>

          {/* Standard Consent & Privacy Terms */}
          <div className="p-3 rounded-xl bg-stone-100 dark:bg-[#242D37] border border-stone-200 dark:border-stone-700 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2D3748] dark:text-white">
              <Lock className="w-3.5 h-3.5 text-[#2C6E70] dark:text-[#6CB2B5]" />
              Confidentiality & Care Agreement
            </div>
            <p className="text-[11px] text-[#718096] dark:text-[#A0AEC0] leading-relaxed">
              • Direct clinical confidentiality applies under standard psychiatric/psychological ethics.<br />
              • Nothing discussed with the professional is ever shared with campus administration, faculty, or parents.<br />
              • Session subsidized under student wellness sponsorship (₹0 copay for enrolled campus students).
            </p>
            <label className="flex items-start gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={consentAcknowledged}
                onChange={(e) => setConsentAcknowledged(e.target.checked)}
                className="mt-0.5 rounded text-[#2C6E70] focus:ring-[#2C6E70]"
              />
              <span className="text-[11px] font-medium text-[#4A5568] dark:text-[#CBD5E0]">
                I acknowledge this is an appointment with a real licensed human clinician and agree to the care guidelines.
              </span>
            </label>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer CTA */}
          <div className="pt-2 border-t border-[#E8E2D5] dark:border-[#2D3845] flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl text-[#718096] dark:text-[#A0AEC0] hover:text-[#2D3748] dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#2C6E70] hover:bg-[#23585A] text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Teleconsultation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
