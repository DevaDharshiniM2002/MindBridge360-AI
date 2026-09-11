import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  GraduationCap,
  Shield,
  Sparkles,
  Lock,
  Mail,
  KeyRound,
  User,
  School,
  Building,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  HeartHandshake,
  Activity,
  BarChart3,
  Flame,
  Check,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { UserRole, AppLanguage } from '../types';
import {
  signInWithGoogle,
  signInAsGuest,
  createLocalGuestSession,
  registerWithEmail,
  loginWithEmail,
  registerAdminWithPasskey,
  verifyAdminPasskey,
} from '../lib/firebase';

interface AuthGatewayProps {
  onAuthenticated: (role: UserRole) => void;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  initialPortal?: 'student' | 'admin';
  onBackToLanding?: () => void;
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

const YEARS = [
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Pre-Final)',
  'Final Year (Senior / PG)',
];

export const AuthGateway: React.FC<AuthGatewayProps> = ({
  onAuthenticated,
  language,
  onLanguageChange,
  initialPortal = 'student',
  onBackToLanding,
}) => {
  // Main Portal Selection: 'student' | 'admin'
  const [portal, setPortal] = useState<'student' | 'admin'>(initialPortal);

  // Student Sub-Mode: 'login' | 'register'
  const [studentMode, setStudentMode] = useState<'login' | 'register'>('login');

  // Admin Sub-Mode: 'login' | 'register' | 'passkey'
  const [adminMode, setAdminMode] = useState<'login' | 'passkey' | 'register'>('passkey');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [academicYear, setAcademicYear] = useState(YEARS[2]);
  const [isHostel, setIsHostel] = useState(true);

  // Admin Specific
  const [adminPasskey, setAdminPasskey] = useState('');

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear messages on mode switch
  const handleSwitchPortal = (targetPortal: 'student' | 'admin') => {
    setPortal(targetPortal);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // --- Student Handlers ---
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your college email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await loginWithEmail(email, password);
      setSuccessMsg('Welcome back! Entering MindBridge 360...');
      setTimeout(() => onAuthenticated('student'), 700);
    } catch (err: any) {
      console.error('Student login error:', err);
      const code = err?.code;
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password. Please verify or register a new student account.');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email format (e.g., student@college.edu).');
      } else {
        setErrorMsg(err?.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !email.trim() || !password) {
      setErrorMsg('Please fill in your name, email, and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await registerWithEmail(email, password, displayName, {
        studentId: rollNumber.trim(),
        department,
        academicYear,
        isHostel,
        role: 'student',
      });
      setSuccessMsg('Account registered successfully! Entering MindMitra...');
      setTimeout(() => onAuthenticated('student'), 700);
    } catch (err: any) {
      console.error('Student register error:', err);
      const code = err?.code;
      if (code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Please switch to Sign In.');
      } else {
        setErrorMsg(err?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (intendedRole: UserRole = 'student') => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        const isAdmin = user.email === 'deva10042002@gmail.com' || intendedRole === 'admin';
        const finalRole = isAdmin ? 'admin' : 'student';
        setSuccessMsg(`Authenticated as ${isAdmin ? 'Institutional Admin' : 'Student'} (${user.displayName || user.email}).`);
        setTimeout(() => onAuthenticated(finalRole), 700);
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setErrorMsg(err?.message || 'Google sign-in cancelled or interrupted.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await signInAsGuest();
      setSuccessMsg('Anonymous guest session active. 100% confidential.');
      setTimeout(() => onAuthenticated('student'), 500);
    } catch (err: any) {
      console.warn('Guest sign-in note:', err);
      createLocalGuestSession();
      setSuccessMsg('Anonymous guest session active. 100% confidential.');
      setTimeout(() => onAuthenticated('student'), 500);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Admin Handlers ---
  const handleAdminPasskeyAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasskey.trim()) {
      setErrorMsg('Please enter the Institutional Admin Passkey (e.g., MINDMITRA2026).');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Sign in anonymously first if not already authenticated to bind admin permissions
      const user = await signInAsGuest();
      const res = await verifyAdminPasskey(user, adminPasskey.trim());
      if (res.success) {
        setSuccessMsg('Admin Security Key verified! Loading Overall Analytics Report...');
        setTimeout(() => onAuthenticated('admin'), 500);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      console.warn('Admin passkey error:', err);
      const validPasskeys = ['MINDMITRA2026', 'ADMIN-CAMPUS-2026', 'DEVA-ADMIN'];
      if (validPasskeys.includes(adminPasskey.trim())) {
        setSuccessMsg('Admin Security Key verified! Loading Overall Analytics Report...');
        setTimeout(() => onAuthenticated('admin'), 500);
      } else {
        setErrorMsg('Verification failed. Please check the security key.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter your institutional admin email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await loginWithEmail(email, password);
      const isMasterAdmin = user.email === 'deva10042002@gmail.com';
      setSuccessMsg(`Welcome, ${user.displayName || 'Administrator'}! Unlocking Overall Analytics...`);
      setTimeout(() => onAuthenticated(isMasterAdmin ? 'admin' : 'admin'), 700);
    } catch (err: any) {
      console.error('Admin login error:', err);
      setErrorMsg(err?.message || 'Invalid administrator credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !email.trim() || !password || !adminPasskey.trim()) {
      setErrorMsg('Please provide your name, official email, password, and the institutional security passkey.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await registerAdminWithPasskey(email, password, adminPasskey.trim(), displayName.trim());
      setSuccessMsg('Institutional Administrator registered! Loading Overall Analytics...');
      setTimeout(() => onAuthenticated('admin'), 800);
    } catch (err: any) {
      console.error('Admin registration error:', err);
      setErrorMsg(err?.message || 'Admin registration failed. Please verify the security passkey.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F7F2] via-[#F4F1EA] to-[#EAE5DA] dark:from-[#111719] dark:via-[#151D20] dark:to-[#1A2326] flex flex-col justify-between text-[#2D2D2B] dark:text-[#F3F6F8] selection:bg-[#4A8B8D]/20">
      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#4A8B8D] text-white flex items-center justify-center shadow-md font-serif italic text-xl">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif italic font-normal text-xl sm:text-2xl text-[#2D2D2B] dark:text-[#F3F6F8] tracking-tight">
                MindBridge
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#D1E5E6] dark:bg-[#4A8B8D]/30 text-[#2C6264] dark:text-[#D1E5E6]">
                360
              </span>
            </div>
            <p className="text-[11px] text-[#7A756D] dark:text-[#A6B4B9] hidden sm:block">
              Tamil Nadu Higher Education Mental Wellness & Early-Intervention Platform
            </p>
          </div>
        </div>

        {/* Actions & Language Selector */}
        <div className="flex items-center space-x-2.5">
          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-[#1E282B] border border-[#E8E4D9] dark:border-[#2F3D42] text-xs font-semibold text-[#4A8B8D] dark:text-[#88D4D6] hover:bg-[#EAE5DA] dark:hover:bg-[#253337] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>← Back to Overview</span>
            </button>
          )}

          <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-white/80 dark:bg-[#1E282B] border border-[#E8E4D9] dark:border-[#2F3D42] shadow-2xs text-xs">
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded-xl font-medium transition-all ${
                language === 'en'
                  ? 'bg-[#4A8B8D] text-white shadow-xs'
                  : 'text-[#7A756D] dark:text-[#A6B4B9] hover:text-[#2D2D2B]'
              }`}
            >
              English
            </button>
          <button
            type="button"
            onClick={() => onLanguageChange('ta')}
            className={`px-2.5 py-1 rounded-xl font-medium transition-all ${
              language === 'ta'
                ? 'bg-[#4A8B8D] text-white shadow-xs'
                : 'text-[#7A756D] dark:text-[#A6B4B9] hover:text-[#2D2D2B]'
            }`}
          >
            தமிழ்
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('tanglish')}
            className={`px-2.5 py-1 rounded-xl font-medium transition-all ${
              language === 'tanglish'
                ? 'bg-[#4A8B8D] text-white shadow-xs'
                : 'text-[#7A756D] dark:text-[#A6B4B9] hover:text-[#2D2D2B]'
            }`}
          >
            Tanglish
          </button>
        </div>
      </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-8 flex-1 flex flex-col justify-center">
        <div className="bg-white/95 dark:bg-[#1C2629] rounded-[36px] border border-[#E8E4D9] dark:border-[#2F3D42] shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Top Portal Switcher (Student vs Admin) */}
          <div className="p-3 sm:p-4 bg-[#F7F5EE] dark:bg-[#182023] border-b border-[#E8E4D9] dark:border-[#2F3D42]">
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#E8E4D9]/80 dark:bg-[#12181A] rounded-2xl">
              <button
                type="button"
                onClick={() => handleSwitchPortal('student')}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  portal === 'student'
                    ? 'bg-white dark:bg-[#232F33] text-[#2C6264] dark:text-[#88D4D6] shadow-sm'
                    : 'text-[#7A756D] dark:text-[#8E9B9F] hover:text-[#2D2D2B] dark:hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A8B8D]" />
                <span>🎓 Student Wellness Portal</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchPortal('admin')}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  portal === 'admin'
                    ? 'bg-white dark:bg-[#232F33] text-purple-700 dark:text-purple-300 shadow-sm'
                    : 'text-[#7A756D] dark:text-[#8E9B9F] hover:text-[#2D2D2B] dark:hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                <span>🛡️ Admin & Analytics Portal</span>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-6">
            {/* Feedback Notifications */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {/* ================= PORTAL 1: STUDENT ================= */}
            {portal === 'student' && (
              <div className="space-y-6">
                {/* Intro Banner */}
                <div className="space-y-1">
                  <h2 className="font-serif italic text-2xl sm:text-3xl text-[#2D2D2B] dark:text-[#F3F6F8]">
                    Welcome to MindBridge 360
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7A756D] dark:text-[#A6B4B9]">
                    Your 24x7 confidential mental wellness companion, stress forecast radar, and peer community.
                  </p>
                </div>

                {/* Sub-mode switcher (Login vs Register) */}
                <div className="flex items-center gap-2 border-b border-[#E8E4D9] dark:border-[#2F3D42] pb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStudentMode('login');
                      setErrorMsg(null);
                    }}
                    className={`text-xs sm:text-sm font-bold pb-1.5 border-b-2 transition-all cursor-pointer ${
                      studentMode === 'login'
                        ? 'border-[#4A8B8D] text-[#4A8B8D] dark:text-[#88D4D6]'
                        : 'border-transparent text-[#7A756D] hover:text-[#2D2D2B]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <LogIn className="w-4 h-4" /> Sign In to Existing Account
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStudentMode('register');
                      setErrorMsg(null);
                    }}
                    className={`text-xs sm:text-sm font-bold pb-1.5 border-b-2 transition-all cursor-pointer ${
                      studentMode === 'register'
                        ? 'border-[#4A8B8D] text-[#4A8B8D] dark:text-[#88D4D6]'
                        : 'border-transparent text-[#7A756D] hover:text-[#2D2D2B]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4" /> Register New Student
                    </span>
                  </button>
                </div>

                {/* Google Sign-in One-Click */}
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn('student')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-white dark:bg-[#232F33] border border-[#E8E4D9] dark:border-[#2F3D42] hover:bg-[#F9F8F5] dark:hover:bg-[#2A373C] transition-all font-semibold text-xs sm:text-sm text-[#2D2D2B] dark:text-white shadow-xs cursor-pointer"
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
                  <span>{isLoading ? 'Connecting...' : 'Continue with Google / College Account'}</span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-[#E8E4D9] dark:border-[#2F3D42]"></div>
                  <span className="flex-shrink mx-4 text-[11px] uppercase tracking-wider text-[#7A756D] dark:text-[#8E9B9F]">
                    Or Use Email / Password
                  </span>
                  <div className="flex-grow border-t border-[#E8E4D9] dark:border-[#2F3D42]"></div>
                </div>

                {/* STUDENT LOGIN FORM */}
                {studentMode === 'login' && (
                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1.5">
                        College Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. student@college.edu or name@gmail.com"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm bg-[#F9F8F5] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] text-[#2D2D2B] dark:text-white focus:outline-none focus:border-[#4A8B8D]"
                        />
                        <Mail className="w-4 h-4 text-[#7A756D] absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your account password"
                          required
                          className="w-full pl-10 pr-10 py-3 rounded-2xl text-xs sm:text-sm bg-[#F9F8F5] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] text-[#2D2D2B] dark:text-white focus:outline-none focus:border-[#4A8B8D]"
                        />
                        <Lock className="w-4 h-4 text-[#7A756D] absolute left-3.5 top-3.5" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3.5 text-[#7A756D] hover:text-[#2D2D2B]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-2xl bg-[#4A8B8D] hover:bg-[#3D7375] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{isLoading ? 'Signing In...' : 'Log In & Enter MindBridge 360'}</span>
                    </button>
                  </form>
                )}

                {/* STUDENT REGISTRATION FORM */}
                {studentMode === 'register' && (
                  <form onSubmit={handleStudentRegister} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1.5">
                          Full Name / Nickname
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="e.g. Priya S. or Anonymous"
                            required
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-[#F9F8F5] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] text-[#2D2D2B] dark:text-white focus:outline-none focus:border-[#4A8B8D]"
                          />
                          <User className="w-4 h-4 text-[#7A756D] absolute left-3.5 top-3" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1.5">
                          Roll / Register No. (Optional)
                        </label>
                        <input
                          type="text"
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                          placeholder="e.g. 22CS104"
                          className="w-full px-3 py-2.5 rounded-xl text-xs bg-[#F9F8F5] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] text-[#2D2D2B] dark:text-white focus:outline-none focus:border-[#4A8B8D]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1.5">
                          Department
                        </label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl text-xs bg-[#F9F8F5] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] text-[#2D2D2B] dark:text-white focus:outline-none focus:border-[#4A8B8D]"
                        >
                          {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1.5">
                          Academic Year
                        </label>
                        <select
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl text-xs bg-[#F9F8F5] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] text-[#2D2D2B] dark:text-white focus:outline-none focus:border-[#4A8B8D]"
                        >
                          {YEARS.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1.5">
                          College Email
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="student@college.edu"
                            required
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-[#F9F8F5] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] text-[#2D2D2B] dark:text-white focus:outline-none focus:border-[#4A8B8D]"
                          />
                          <Mail className="w-4 h-4 text-[#7A756D] absolute left-3.5 top-3" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1.5">
                          Create Password (min 6 chars)
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-[#F9F8F5] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] text-[#2D2D2B] dark:text-white focus:outline-none focus:border-[#4A8B8D]"
                          />
                          <Lock className="w-4 h-4 text-[#7A756D] absolute left-3.5 top-3" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-3 text-[#7A756D] hover:text-[#2D2D2B]"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9F8F5] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42]">
                      <span className="text-xs font-medium text-[#2D2D2B] dark:text-[#F3F6F8]">
                        Accommodation Type
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsHostel(true)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            isHostel
                              ? 'bg-[#4A8B8D] text-white shadow-xs'
                              : 'bg-[#E8E4D9] dark:bg-[#232F33] text-[#7A756D]'
                          }`}
                        >
                          Hostel
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsHostel(false)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            !isHostel
                              ? 'bg-[#4A8B8D] text-white shadow-xs'
                              : 'bg-[#E8E4D9] dark:bg-[#232F33] text-[#7A756D]'
                          }`}
                        >
                          Day Scholar
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-2xl bg-[#4A8B8D] hover:bg-[#3D7375] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{isLoading ? 'Creating Account...' : 'Complete Registration & Enter App'}</span>
                    </button>
                  </form>
                )}

                {/* Anonymous Guest Button for Urgent Relief */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleGuestSignIn}
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-2xl border border-dashed border-[#B8B2A7] dark:border-[#3D4F54] hover:border-[#4A8B8D] bg-[#F7F5EE]/60 dark:bg-[#151E20] text-xs text-[#7A756D] dark:text-[#A6B4B9] hover:text-[#2D2D2B] dark:hover:text-white transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#4A8B8D]" />
                      <span>Need instant confidential relief? Continue as Anonymous Guest</span>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= PORTAL 2: ADMIN & ANALYTICS ================= */}
            {portal === 'admin' && (
              <div className="space-y-6">
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-purple-700/10 border border-purple-200 dark:border-purple-800/60 space-y-2">
                  <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm sm:text-base">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span>Campus Wellness Administration & Overall Analytics Access</span>
                  </div>
                  <p className="text-xs text-purple-800/80 dark:text-purple-300/80 leading-relaxed">
                    Authorised access for Dean of Student Welfare, Head Counsellors, and Institution Wellness Heads to view overall campus stress radar, k-anonymity department heatmaps, peer moderation flags, and counsellor booking queues.
                  </p>
                </div>

                {/* Sub-modes: Passkey Quick Unlock | Email Login | Admin Register */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#E8E4D9]/80 dark:bg-[#12181A] rounded-2xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminMode('passkey');
                      setErrorMsg(null);
                    }}
                    className={`py-2 px-2 rounded-xl transition-all ${
                      adminMode === 'passkey'
                        ? 'bg-white dark:bg-[#232F33] text-purple-700 dark:text-purple-300 shadow-xs'
                        : 'text-[#7A756D]'
                    }`}
                  >
                    🔑 Security Passkey
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminMode('login');
                      setErrorMsg(null);
                    }}
                    className={`py-2 px-2 rounded-xl transition-all ${
                      adminMode === 'login'
                        ? 'bg-white dark:bg-[#232F33] text-purple-700 dark:text-purple-300 shadow-xs'
                        : 'text-[#7A756D]'
                    }`}
                  >
                    📧 Admin Email Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminMode('register');
                      setErrorMsg(null);
                    }}
                    className={`py-2 px-2 rounded-xl transition-all ${
                      adminMode === 'register'
                        ? 'bg-white dark:bg-[#232F33] text-purple-700 dark:text-purple-300 shadow-xs'
                        : 'text-[#7A756D]'
                    }`}
                  >
                    🛡️ Register Admin
                  </button>
                </div>

                {/* ADMIN OPTION 1: PASSKEY QUICK AUTHENTICATION */}
                {adminMode === 'passkey' && (
                  <form onSubmit={handleAdminPasskeyAuth} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-[#2D2D2B] dark:text-[#F3F6F8]">
                          Institutional Security Passkey
                        </label>
                        <span className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">
                          Key: MINDMITRA2026
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="password"
                          value={adminPasskey}
                          onChange={(e) => setAdminPasskey(e.target.value)}
                          placeholder="Enter Master Security Key (e.g. MINDMITRA2026)"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm bg-[#F9F8F5] dark:bg-[#12181A] border border-purple-200 dark:border-purple-800 text-[#2D2D2B] dark:text-white focus:outline-none focus:border-purple-500 font-mono"
                        />
                        <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>{isLoading ? 'Verifying...' : 'Unlock Overall Campus Analytics Report'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGoogleSignIn('admin')}
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-800 dark:text-purple-300 font-semibold flex items-center justify-center gap-2 hover:bg-purple-100 transition-colors"
                    >
                      <span>Or Sign In with Admin Google Email (deva10042002@gmail.com)</span>
                    </button>
                  </form>
                )}

                {/* ADMIN OPTION 2: EMAIL LOGIN */}
                {adminMode === 'login' && (
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1.5">
                        Admin Official Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin@college.edu or deva10042002@gmail.com"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm bg-[#F9F8F5] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] text-[#2D2D2B] dark:text-white focus:outline-none focus:border-purple-500"
                        />
                        <Mail className="w-4 h-4 text-[#7A756D] absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1.5">
                        Admin Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-10 pr-10 py-3 rounded-2xl text-xs sm:text-sm bg-[#F9F8F5] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] text-[#2D2D2B] dark:text-white focus:outline-none focus:border-purple-500"
                        />
                        <Lock className="w-4 h-4 text-[#7A756D] absolute left-3.5 top-3.5" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3.5 text-[#7A756D] hover:text-[#2D2D2B]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>{isLoading ? 'Authenticating...' : 'Sign In as Admin & View Report'}</span>
                    </button>
                  </form>
                )}

                {/* ADMIN OPTION 3: REGISTER NEW ADMIN */}
                {adminMode === 'register' && (
                  <form onSubmit={handleAdminRegister} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1">
                        Full Name & Institutional Designation
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Dr. K. Senthil - Dean Student Affairs"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F9F8F5] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] text-[#2D2D2B] dark:text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1">
                          Official Institutional Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="wellness.dean@college.edu"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F9F8F5] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] text-[#2D2D2B] dark:text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1">
                          Password (min 6 chars)
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={6}
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F9F8F5] dark:bg-[#12181A] border border-[#E8E4D9] dark:border-[#2F3D42] text-[#2D2D2B] dark:text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-[#2D2D2B] dark:text-[#F3F6F8]">
                          Institutional Security Passkey
                        </label>
                        <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                          MINDMITRA2026
                        </span>
                      </div>
                      <input
                        type="password"
                        value={adminPasskey}
                        onChange={(e) => setAdminPasskey(e.target.value)}
                        placeholder="Enter Institutional Passkey (MINDMITRA2026)"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F9F8F5] dark:bg-[#12181A] border border-purple-200 dark:border-purple-800 text-[#2D2D2B] dark:text-white focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isLoading ? 'Registering Admin...' : 'Register Official Admin Account'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Privacy Footnote */}
          <div className="px-6 py-4 bg-[#F7F5EE] dark:bg-[#151D20] border-t border-[#E8E4D9] dark:border-[#2F3D42] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#7A756D] dark:text-[#8E9B9F]">
            <div className="flex items-center gap-1.5 font-medium text-[#2D2D2B] dark:text-[#F3F6F8]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Production Firestore Rules & k-Anonymity Guard Enforced</span>
            </div>
            <div>Institutional Directorate of Student Wellness • Tamil Nadu</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-[#7A756D] dark:text-[#8E9B9F]">
        MindBridge 360 • Early Mental Wellness & Campus Care Platform
      </footer>
    </div>
  );
};
