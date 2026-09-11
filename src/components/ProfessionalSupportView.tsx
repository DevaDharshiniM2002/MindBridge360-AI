import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  PhoneCall,
  ShieldCheck,
  AlertTriangle,
  Heart,
  Clock,
  Building,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CRISIS_HELPLINES } from '../data/mockData';

interface ProfessionalSupportViewProps {
  onOpenCounsellorBooking?: () => void;
  onOpenChatbot?: () => void;
}

export const ProfessionalSupportView: React.FC<ProfessionalSupportViewProps> = ({
  onOpenCounsellorBooking,
  onOpenChatbot,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'govt' | 'student'>('all');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const filteredHelplines = CRISIS_HELPLINES.filter((h) => {
    if (selectedCategory === 'govt') return h.isGovernment;
    return true;
  });

  return (
    <div className="space-y-5 pb-8">
      {/* Header Banner */}
      <div className="bg-linear-to-br from-rose-500/15 via-white to-amber-500/10 dark:from-[#25181A] dark:via-[#1A1617] dark:to-[#221A15] rounded-3xl p-5 sm:p-6 border border-rose-200 dark:border-rose-950/60 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shrink-0">
            <PhoneCall className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded-full">
                24/7 Available
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2D2D2B] dark:text-[#F3F6F8] mt-0.5">
              Professional & Emergency Support
            </h2>
            <p className="text-xs sm:text-sm text-[#7A756D] dark:text-[#9BA3AF]">
              Verified, confidential, and free mental health helplines across India. You are never alone.
            </p>
          </div>
        </div>

        {/* Quick SOS Action Banner */}
        <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-rose-900 dark:text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              If you or someone you know is in immediate crisis, please call Tele-MANAS toll-free now.
            </span>
          </div>
          <a
            href="tel:14416"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 14416 (Toll-Free)</span>
          </a>
        </div>
      </div>

      {/* 4-Tier Care Architecture Guide */}
      <div className="bg-white dark:bg-[#161E20] rounded-3xl p-5 border border-[#E8E4D9] dark:border-[#223034] shadow-xs space-y-3">
        <h3 className="font-serif font-bold text-base text-[#2D2D2B] dark:text-[#F3F6F8] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#4A8B8D]" /> 4-Tier Stepped Care Protocol
        </h3>
        <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
          MindMitra connects you with the right level of support based on what you are going through:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3 bg-[#F9F7F2] dark:bg-[#1C2527] rounded-2xl border border-[#E8E4D9] dark:border-[#2F3D42] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Tier 1: Self Care
            </span>
            <h4 className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">Mind Relax & Grounding</h4>
            <p className="text-[11px] text-[#7A756D] leading-tight">4-7-8 breathing, sensory grounding, zen sand.</p>
          </div>

          <div className="p-3 bg-[#F9F7F2] dark:bg-[#1C2527] rounded-2xl border border-[#E8E4D9] dark:border-[#2F3D42] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Tier 2: Peer & AI
            </span>
            <h4 className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">Talk to Mithra & Community</h4>
            <p className="text-[11px] text-[#7A756D] leading-tight">Anonymous peer forum & empathetic companion.</p>
          </div>

          <div className="p-3 bg-[#F9F7F2] dark:bg-[#1C2527] rounded-2xl border border-[#E8E4D9] dark:border-[#2F3D42] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Tier 3: Professional
            </span>
            <h4 className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">Campus Counsellor</h4>
            <p className="text-[11px] text-[#7A756D] leading-tight">Private, scheduled human psychologist sessions.</p>
          </div>

          <div className="p-3 bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Tier 4: Emergency
            </span>
            <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">24/7 Helplines & SOS</h4>
            <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-tight">Tele-MANAS, iCall, NIMHANS crisis teams.</p>
          </div>
        </div>
      </div>

      {/* Verified National & Regional Helplines Directory */}
      <div className="bg-white dark:bg-[#161E20] rounded-3xl p-5 border border-[#E8E4D9] dark:border-[#223034] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E4D9]/60 dark:border-[#2F3D42]/60 pb-3">
          <div>
            <h3 className="font-serif font-bold text-base text-[#2D2D2B] dark:text-[#F3F6F8] flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-500" /> Verified Student Helplines
            </h3>
            <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
              Direct toll-free numbers accessible across India 24 hours a day
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#F0EDE4] dark:bg-[#253235] p-1 rounded-xl self-start sm:self-auto">
            {[
              { id: 'all', label: 'All Helplines' },
              { id: 'govt', label: 'Govt Toll-Free' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedCategory(f.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === f.id
                    ? 'bg-white dark:bg-[#1A2326] text-[#4A8B8D] dark:text-[#63C1C4] shadow-2xs'
                    : 'text-[#7A756D] hover:text-[#2D2D2B]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredHelplines.map((helpline, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#F9F7F2] dark:bg-[#1C2527] border border-[#E8E4D9] dark:border-[#2F3D42] space-y-3 flex flex-col justify-between hover:border-[#4A8B8D]/40 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-[#2D2D2B] dark:text-[#F3F6F8]">
                      {helpline.name}
                    </h4>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {helpline.available}
                    </span>
                  </div>
                  {helpline.isGovernment && (
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 rounded-full">
                      Govt Toll-Free
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF] leading-relaxed">
                  {helpline.description}
                </p>

                <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF]">
                  <strong className="text-[#2D2D2B] dark:text-[#F3F6F8]">Languages:</strong> {helpline.languages}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E8E4D9]/60 dark:border-[#2F3D42]/60 flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-[#2D2D2B] dark:text-[#F3F6F8]">
                  {helpline.number}
                </span>
                <a
                  href={`tel:${helpline.number.replace(/[^0-9+]/g, '')}`}
                  className="px-3.5 py-1.5 bg-[#4A8B8D] hover:bg-[#376F71] active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campus Health Center & Emergency Contacts */}
      <div className="bg-white dark:bg-[#161E20] rounded-3xl p-5 border border-[#E8E4D9] dark:border-[#223034] shadow-xs space-y-3">
        <h3 className="font-serif font-bold text-base text-[#2D2D2B] dark:text-[#F3F6F8] flex items-center gap-2">
          <Building className="w-4 h-4 text-[#4A8B8D]" /> Campus Health & Residence Support
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 bg-[#F9F7F2] dark:bg-[#1C2527] rounded-2xl border border-[#E8E4D9] dark:border-[#2F3D42] space-y-1">
            <span className="text-[11px] text-[#7A756D] font-medium">Campus Health Centre & Ambulance</span>
            <div className="font-bold text-sm text-[#2D2D2B] dark:text-[#F3F6F8]">Health Wing, Student Block A</div>
            <p className="text-xs text-[#7A756D]">24-Hour Duty Doctor & Emergency Transport</p>
            <div className="pt-2">
              <a
                href="tel:04422578333"
                className="text-xs font-bold text-[#4A8B8D] hover:underline flex items-center gap-1"
              >
                <PhoneCall className="w-3 h-3" /> 044-2257-8333 (Campus Desk)
              </a>
            </div>
          </div>

          <div className="p-3.5 bg-[#F9F7F2] dark:bg-[#1C2527] rounded-2xl border border-[#E8E4D9] dark:border-[#2F3D42] space-y-1">
            <span className="text-[11px] text-[#7A756D] font-medium">Student Welfare & Dean Care Cell</span>
            <div className="font-bold text-sm text-[#2D2D2B] dark:text-[#F3F6F8]">Confidential Student Support Desk</div>
            <p className="text-xs text-[#7A756D]">Mon - Fri, 9:00 AM - 5:30 PM (Walk-ins Welcome)</p>
            <div className="pt-2">
              {onOpenCounsellorBooking && (
                <button
                  onClick={onOpenCounsellorBooking}
                  className="text-xs font-bold text-[#4A8B8D] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Book Counsellor Appointment →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
