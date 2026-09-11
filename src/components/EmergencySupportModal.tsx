import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  ShieldAlert,
  Send,
  User,
  Users,
  Phone,
  MessageCircle,
  Copy,
  Check,
  X,
  Stethoscope,
  Sparkles,
  ExternalLink,
  Edit2,
  Lock,
} from 'lucide-react';
import { EmergencyContactConfig } from '../types';

interface EmergencySupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectCounsellor: () => void;
  studentName?: string;
}

export const EmergencySupportModal: React.FC<EmergencySupportModalProps> = ({
  isOpen,
  onClose,
  onConnectCounsellor,
  studentName = 'Student',
}) => {
  // Load or initialize saved emergency contacts
  const [contacts, setContacts] = useState<EmergencyContactConfig>(() => {
    try {
      const saved = localStorage.getItem('mb360_emergency_contacts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      favoritePersonName: 'Aravind (Roommate & Best Friend)',
      favoritePersonPhone: '+919840123456',
      favoritePersonRelation: 'Best Friend / Peer',
      parentName: 'Appa / Amma',
      parentPhone: '+919444198765',
      parentRelation: 'Parent / Guardian',
    };
  });

  const [isEditingContacts, setIsEditingContacts] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [dispatchedSuccessNotice, setDispatchedSuccessNotice] = useState<string | null>(null);

  // Form states for editing
  const [favName, setFavName] = useState(contacts.favoritePersonName);
  const [favPhone, setFavPhone] = useState(contacts.favoritePersonPhone);
  const [parentName, setParentName] = useState(contacts.parentName);
  const [parentPhone, setParentPhone] = useState(contacts.parentPhone);

  useEffect(() => {
    try {
      localStorage.setItem('mb360_emergency_contacts', JSON.stringify(contacts));
    } catch {}
  }, [contacts]);

  if (!isOpen) return null;

  // Pre-drafted thoughtful, KIND messages (not alarming, but comforting)
  const favoritePersonMessage = `Hey ${contacts.favoritePersonName.split(' ')[0] || 'friend'}, college feels a little heavy and overwhelming today. I’m taking a breather, but could really use a warm chat or chai when you get 5 minutes? Would mean a lot ❤️ - ${studentName}`;

  const parentMessage = `Hi ${contacts.parentName.split(' ')[0] || 'Appa / Amma'}, taking a small study break today. Feeling a bit tired with semester work, and just wanted to connect and hear a warm hello when you get a moment. Love you! - ${studentName}`;

  const handleSaveContacts = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: EmergencyContactConfig = {
      ...contacts,
      favoritePersonName: favName.trim() || 'Best Friend',
      favoritePersonPhone: favPhone.trim() || '+919840123456',
      parentName: parentName.trim() || 'Parent',
      parentPhone: parentPhone.trim() || '+919444198765',
    };
    setContacts(updated);
    setIsEditingContacts(false);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const cleanPhone = (phone: string) => phone.replace(/[^\d+]/g, '');

  const handleSendWhatsApp = (phone: string, msg: string, targetName: string) => {
    const cleaned = cleanPhone(phone);
    const url = `https://wa.me/${cleaned.startsWith('+') ? cleaned.slice(1) : cleaned}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setDispatchedSuccessNotice(`Sent kind check-in message to ${targetName} via WhatsApp.`);
    setTimeout(() => setDispatchedSuccessNotice(null), 4000);
  };

  const handleSendSMS = (phone: string, msg: string, targetName: string) => {
    const cleaned = cleanPhone(phone);
    const url = `sms:${cleaned}?body=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setDispatchedSuccessNotice(`Opened message composer for ${targetName}.`);
    setTimeout(() => setDispatchedSuccessNotice(null), 4000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white dark:bg-[#182326] rounded-[36px] border border-[#E8E4D9] dark:border-[#28383D] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Banner */}
          <div className="px-6 pt-6 pb-4 border-b border-[#E8E4D9] dark:border-[#28383D] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2D2D2B] dark:text-white">
                  Kind Support & Care Dispatcher
                </h3>
                <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
                  Send a gentle, warm check-in to your favorite person, parent, or connect to a counsellor.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Notification */}
          {dispatchedSuccessNotice && (
            <div className="bg-emerald-600 text-white text-xs font-semibold px-6 py-2.5 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{dispatchedSuccessNotice}</span>
            </div>
          )}

          {/* Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-5">
            {/* Edit / View Contacts Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7A756D] dark:text-[#9BA3AF]">
                Your Care Circle
              </span>
              <button
                onClick={() => setIsEditingContacts(!isEditingContacts)}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isEditingContacts ? 'Done Editing' : 'Customize Contacts'}</span>
              </button>
            </div>

            {/* Editing Form */}
            {isEditingContacts ? (
              <form onSubmit={handleSaveContacts} className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1C282C] border border-[#E8E4D9] dark:border-[#2D3E42] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#2D2D2B] dark:text-white block mb-1">
                      Favorite Person Name
                    </label>
                    <input
                      type="text"
                      value={favName}
                      onChange={(e) => setFavName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-[#152023] border border-[#E8E4D9] dark:border-[#2B3B3F] text-xs"
                      placeholder="e.g. Aravind (Best Friend)"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#2D2D2B] dark:text-white block mb-1">
                      Favorite Person WhatsApp/Phone
                    </label>
                    <input
                      type="text"
                      value={favPhone}
                      onChange={(e) => setFavPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-[#152023] border border-[#E8E4D9] dark:border-[#2B3B3F] text-xs"
                      placeholder="+91 98401 23456"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#2D2D2B] dark:text-white block mb-1">
                      Parent / Guardian Name
                    </label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-[#152023] border border-[#E8E4D9] dark:border-[#2B3B3F] text-xs"
                      placeholder="e.g. Appa / Amma"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#2D2D2B] dark:text-white block mb-1">
                      Parent WhatsApp/Phone
                    </label>
                    <input
                      type="text"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-[#152023] border border-[#E8E4D9] dark:border-[#2B3B3F] text-xs"
                      placeholder="+91 94441 98765"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Care Contacts
                </button>
              </form>
            ) : null}

            {/* Recipient 1: Personal Favorite Person Card */}
            <div className="p-4 rounded-3xl bg-linear-to-br from-rose-50/70 to-pink-50/50 dark:from-rose-950/20 dark:to-pink-950/10 border border-rose-200/80 dark:border-rose-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
                    ❤️
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-950 dark:text-rose-200">
                      Personal Favorite Person: {contacts.favoritePersonName}
                    </h4>
                    <span className="text-[10px] text-rose-800/80 dark:text-rose-300">
                      {contacts.favoritePersonPhone} • {contacts.favoritePersonRelation}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200/60 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200">
                  Comfort Outreach
                </span>
              </div>

              {/* Message preview */}
              <div className="p-3 rounded-2xl bg-white/90 dark:bg-[#162124]/90 border border-rose-200/60 dark:border-rose-900/40 text-xs text-[#2D2D2B] dark:text-[#E2E8F0] italic leading-relaxed">
                "{favoritePersonMessage}"
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  onClick={() => handleCopy(favoritePersonMessage, 'fav')}
                  className="py-1.5 px-3 rounded-xl bg-white dark:bg-[#162124] border border-rose-200 dark:border-rose-900/40 text-xs font-semibold text-[#555] dark:text-[#CCC] hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'fav' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'fav' ? 'Copied' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={() => handleSendSMS(contacts.favoritePersonPhone, favoritePersonMessage, contacts.favoritePersonName)}
                  className="py-1.5 px-3 rounded-xl bg-white dark:bg-[#162124] border border-rose-200 dark:border-rose-900/40 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>SMS</span>
                </button>

                <button
                  onClick={() => handleSendWhatsApp(contacts.favoritePersonPhone, favoritePersonMessage, contacts.favoritePersonName)}
                  className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Send WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Recipient 2: Parent / Guardian Card */}
            <div className="p-4 rounded-3xl bg-linear-to-br from-amber-50/70 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200/80 dark:border-amber-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                    🏡
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200">
                      Parent / Guardian: {contacts.parentName}
                    </h4>
                    <span className="text-[10px] text-amber-800/80 dark:text-amber-300">
                      {contacts.parentPhone} • Loving Support
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                  Home Connection
                </span>
              </div>

              {/* Message preview */}
              <div className="p-3 rounded-2xl bg-white/90 dark:bg-[#162124]/90 border border-amber-200/60 dark:border-amber-900/40 text-xs text-[#2D2D2B] dark:text-[#E2E8F0] italic leading-relaxed">
                "{parentMessage}"
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  onClick={() => handleCopy(parentMessage, 'parent')}
                  className="py-1.5 px-3 rounded-xl bg-white dark:bg-[#162124] border border-amber-200 dark:border-amber-900/40 text-xs font-semibold text-[#555] dark:text-[#CCC] hover:bg-amber-50 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'parent' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'parent' ? 'Copied' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={() => handleSendSMS(contacts.parentPhone, parentMessage, contacts.parentName)}
                  className="py-1.5 px-3 rounded-xl bg-white dark:bg-[#162124] border border-amber-200 dark:border-amber-900/40 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-50 flex items-center gap-1 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>SMS</span>
                </button>

                <button
                  onClick={() => handleSendWhatsApp(contacts.parentPhone, parentMessage, contacts.parentName)}
                  className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Send WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Recipient 3: Campus Counsellor & Emergency Line */}
            <div className="p-4 rounded-3xl bg-linear-to-br from-teal-50/70 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-950/10 border border-teal-200/80 dark:border-teal-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                    🩺
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-teal-950 dark:text-teal-200">
                      Campus Counsellor Priority Connect
                    </h4>
                    <span className="text-[10px] text-teal-800/80 dark:text-teal-300">
                      Dr. S. Radhakrishnan & Campus Care Team • Room W-102
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Duty Slots Available
                </span>
              </div>

              <p className="text-xs text-[#555] dark:text-[#CBD5E1] leading-relaxed">
                If stress feels too intense or persistent, your campus counsellors provide confidential, non-judgmental 1-on-1 support.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <a
                  href="tel:14416"
                  className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>National Tele-MANAS: 14416 (24/7 Free)</span>
                </a>

                <button
                  onClick={() => {
                    onClose();
                    onConnectCounsellor();
                  }}
                  className="py-2 px-4 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Book Urgent Counsellor Slot</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-[#E8E4D9] dark:border-[#28383D] flex items-center justify-between bg-[#FAF8F5] dark:bg-[#162124]">
            <span className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF]">
              All dispatches are student-initiated and strictly private.
            </span>
            <button
              onClick={onClose}
              className="py-1.5 px-4 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-xs font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
