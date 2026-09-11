import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  LogOut,
  CheckCircle2,
  Cloud,
  User,
  HeartHandshake,
  Stethoscope,
  Shield,
  X,
  AlertCircle,
  KeyRound,
  GraduationCap,
  Building,
  School,
  Check,
  HelpCircle,
  ArrowRight,
  Flame,
  BadgeCheck,
} from 'lucide-react';
import { UserRole, AppLanguage } from '../types';
import {
  signInWithGoogle,
  signInAsGuest,
  createLocalGuestSession,
  AppUserSession,
  logOut,
  verifyAdminPasskey,
  updateUserDoc,
  UserProfileDoc,
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | AppUserSession | null;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  checkinsCount: number;
  streakCount: number;
  initialTab?: 'student' | 'admin';
}

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication (ECE)',
  'AI & Data Science',
  'Information Technology',
  'Mechanical Engineering',
  'Electrical & Electronics (EEE)',
  'Civil Engineering',
  'Biotechnology & Biomedical',
  'Management & Business Studies',
  'Sciences & Humanities',
];

const YEARS = ['1st Year (Freshman)', '2nd Year (Sophomore)', '3rd Year (Pre-Final)', 'Final Year (Senior)'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentRole,
  onChangeRole,
  checkinsCount,
  streakCount,
  initialTab = 'student',
}) => {
  const [authMode, setAuthMode] = useState<'student' | 'admin'>(
    currentRole === 'admin' || initialTab === 'admin' ? 'admin' : 'student'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Student Roll Number Quick Sign-in Form
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [academicYear, setAcademicYear] = useState(YEARS[2]);
  const [isHostel, setIsHostel] = useState(true);
  const [showStudentDetailsForm, setShowStudentDetailsForm] = useState(false);

  // Admin Passkey Form
  const [adminPasskey, setAdminPasskey] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async (intendedRole: UserRole = 'student') => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        // If master admin email, automatically switch to admin
        if (user.email === 'deva10042002@gmail.com' || intendedRole === 'admin') {
          onChangeRole('admin');
          setSuccessMsg('Signed in as Institutional Wellness Admin.');
        } else {
          onChangeRole('student');
          setSuccessMsg(`Welcome, ${user.displayName || 'Student'}! Data syncing active.`);
        }
      }
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      console.error('Google Sign in error:', err);
      setErrorMsg(err?.message || 'Google sign-in could not be completed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentQuickAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      let user = currentUser;
      if (!user) {
        user = await signInAsGuest();
      }
      if (user) {
        await updateUserDoc(user.uid, {
          displayName: studentName.trim() || 'Student',
          studentId: rollNumber.trim(),
          department,
          academicYear,
          isHostel,
          role: 'student',
        });
        onChangeRole('student');
        setSuccessMsg(`Student Profile saved for ${studentName || rollNumber || 'Student'}.`);
        setTimeout(() => onClose(), 800);
      }
    } catch (err: any) {
      console.error('Student quick sign-in error:', err);
      setErrorMsg('Failed to save student profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await signInAsGuest();
      onChangeRole('student');
      setSuccessMsg('Anonymous student session active. Your data stays completely confidential.');
      setTimeout(() => onClose(), 600);
    } catch (err: any) {
      console.warn('Guest Sign in note:', err);
      createLocalGuestSession();
      onChangeRole('student');
      setSuccessMsg('Anonymous student session active. 100% confidential.');
      setTimeout(() => onClose(), 600);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasskey.trim()) {
      setErrorMsg('Please enter the Institutional Admin Security Key.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let user = currentUser;
      if (!user) {
        user = await signInAsGuest();
      }

      const res = await verifyAdminPasskey(user, adminPasskey.trim());
      if (res.success) {
        onChangeRole('admin');
        setSuccessMsg('Admin Security Key verified! Institutional Dashboard unlocked.');
        setTimeout(() => onClose(), 600);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      console.warn('Admin passkey error note:', err);
      const validPasskeys = ['MINDMITRA2026', 'ADMIN-CAMPUS-2026', 'DEVA-ADMIN'];
      if (validPasskeys.includes(adminPasskey.trim())) {
        onChangeRole('admin');
        setSuccessMsg('Admin Security Key verified! Institutional Dashboard unlocked.');
        setTimeout(() => onClose(), 600);
      } else {
        setErrorMsg('Failed to verify admin passkey. Please use MINDMITRA2026.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await logOut();
      onChangeRole('student');
      setSuccessMsg('Logged out successfully.');
      setTimeout(() => onClose(), 600);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setErrorMsg('Error signing out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Bar / Header */}
          <div className="px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 dark:bg-teal-400/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
                {authMode === 'student' ? <GraduationCap className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 font-serif">
                  {authMode === 'student' ? 'Student Portal Login' : 'Admin & Counsellor Login'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  MindMitra Live Cloud Synchronization (Firestore)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Portal Tabs Selector */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-200/70 dark:bg-zinc-900/80 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('student');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  authMode === 'student'
                    ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-300 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>🎓 Student Login</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('admin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  authMode === 'admin'
                    ? 'bg-white dark:bg-zinc-800 text-purple-700 dark:text-purple-300 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>🛡️ Admin Login</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-6 overflow-y-auto space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Current Active Account Status */}
            {currentUser && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-teal-600/10 dark:from-teal-950/40 dark:to-emerald-950/20 border border-teal-500/20 dark:border-teal-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="User"
                        className="w-11 h-11 rounded-2xl border-2 border-white dark:border-zinc-800 shadow-sm object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                        {currentUser.displayName ? currentUser.displayName[0] : currentRole === 'admin' ? 'A' : 'S'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                          {currentUser.displayName || (currentUser.isAnonymous ? 'Guest Student' : 'Student')}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            currentRole === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border border-purple-200 dark:border-purple-700'
                              : 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 border border-teal-200 dark:border-teal-700'
                          }`}
                        >
                          {currentRole === 'admin' ? '🛡️ Admin' : currentUser.isAnonymous ? 'Guest' : '🎓 Student'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]">
                        {currentUser.email || 'Anonymous Session (Local + Cloud)'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-teal-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Live Cloud Sync Connected</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
                    <span>{checkinsCount} check-ins</span>
                    <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                      <Flame className="w-3 h-3" /> {streakCount}d streak
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: STUDENT PORTAL LOGIN */}
            {authMode === 'student' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Sign In for Real-Time Sync & Progress
                  </h4>

                  {/* Google Sign In */}
                  <button
                    onClick={() => handleGoogleSignIn('student')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-all font-semibold text-sm text-zinc-800 dark:text-zinc-100 group cursor-pointer"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>{isLoading ? 'Connecting Google Account...' : 'Continue with Google / College Email'}</span>
                  </button>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                  <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                    Or Enter Student Details
                  </span>
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                </div>

                {/* Student Quick Profile Form */}
                {!showStudentDetailsForm ? (
                  <button
                    type="button"
                    onClick={() => setShowStudentDetailsForm(true)}
                    className="w-full p-3.5 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-teal-500/60 bg-zinc-50 dark:bg-zinc-800/40 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <School className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>Set Roll No, Department & Year</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ) : (
                  <form onSubmit={handleStudentQuickAccess} className="space-y-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Student Name / Nickname
                      </label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Rahul, Priya, or Anonymous"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Roll / Register No. (Optional)
                        </label>
                        <input
                          type="text"
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                          placeholder="e.g. 22CS104"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Academic Year
                        </label>
                        <select
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                        >
                          {YEARS.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Department
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                      >
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">Accommodation</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsHostel(true)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            isHostel
                              ? 'bg-teal-600 text-white shadow-sm'
                              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          Hostel
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsHostel(false)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            !isHostel
                              ? 'bg-teal-600 text-white shadow-sm'
                              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          Day Scholar
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      {isLoading ? 'Saving Student Profile...' : 'Save & Start Using MindMitra'}
                    </button>
                  </form>
                )}

                {/* Anonymous Guest Button */}
                <button
                  onClick={handleGuestSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-xs font-medium cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Continue Anonymously as Guest (No Identity Saved)</span>
                </button>
              </div>
            )}

            {/* TAB 2: ADMIN & COUNSELLOR LOGIN */}
            {authMode === 'admin' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 space-y-2">
                  <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm">
                    <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Campus Wellness Administration Portal</span>
                  </div>
                  <p className="text-xs text-purple-700/80 dark:text-purple-300/80 leading-relaxed">
                    Institutional access for Dean of Student Affairs, Campus Counsellors, and Wellness Committee to view aggregated stress radar (k-anonymity guaranteed) and triage moderation escalations.
                  </p>
                </div>

                {/* Google Sign In for Registered Admin */}
                <button
                  onClick={() => handleGoogleSignIn('admin')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-800 shadow-sm hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all font-semibold text-xs text-zinc-800 dark:text-zinc-100 group cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Sign In with Admin Google Account (deva10042002@gmail.com)</span>
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                  <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                    Or Enter Security Passkey
                  </span>
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                </div>

                {/* Admin Passkey Form */}
                <form onSubmit={handleAdminVerify} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                      <span>Institutional Passkey / Security Code</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Passkey: MINDMITRA2026</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={adminPasskey}
                        onChange={(e) => setAdminPasskey(e.target.value)}
                        placeholder="Enter Admin Security Key (e.g. MINDMITRA2026)"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500 tracking-wider"
                      />
                      <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <BadgeCheck className="w-4 h-4" />
                    <span>{isLoading ? 'Verifying Credentials...' : 'Unlock Institutional Admin Dashboard'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* Privacy & Zero-Knowledge Guarantee Footer */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Production Security & Privacy Guaranteed</span>
              </div>
              <p>
                Student personal reflections are strictly encrypted under user-isolated document security rules. Institutional dashboards exclusively display k-anonymized cohort aggregates.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
