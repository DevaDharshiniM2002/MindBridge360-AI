import React, { useState, useEffect } from 'react';
import {
  Star,
  Award,
  MessageSquare,
  CheckCircle2,
  ThumbsUp,
  Sparkles,
  X,
  Send,
  Users,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { PlatformFeedbackItem } from '../types';
import {
  subscribeToPlatformFeedback,
  submitPlatformFeedback,
  reactToFeedback,
  seedInitialJudgeFeedbackToFirestore,
  INITIAL_DEMO_FEEDBACK,
} from '../lib/firebase';

interface LiveJudgeFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    uid?: string;
    displayName?: string | null;
    email?: string | null;
    role?: string;
  } | null;
}

const CATEGORIES: PlatformFeedbackItem['category'][] = [
  'Real-Time Innovation',
  'AI Empathy & Accuracy',
  'Campus Wellbeing Impact',
  'UI/UX & Design',
  'Overall Platform',
];

const ROLES: PlatformFeedbackItem['userRole'][] = [
  'Judge / Evaluator',
  'Engineering Student',
  'Campus Counsellor / Faculty',
  'Guest Observer',
  'Dean / Administrator',
];

const HIGHLIGHT_FEATURES = [
  'Voice Assistant (English, Tamil & Tanglish)',
  'Privacy Radar with k-Anonymity (N ≥ 10)',
  'Pranayama Pacer & Kolam Zen Canvas',
  'Counselling Preparation & De-Stigmatizer',
  'Stress Forecast & Exam Milestone Radar',
  'Multi-Tier Safety & Emergency Escalation',
];

export const LiveJudgeFeedbackModal: React.FC<LiveJudgeFeedbackModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [feedbackList, setFeedbackList] = useState<PlatformFeedbackItem[]>(INITIAL_DEMO_FEEDBACK);
  const [activeTab, setActiveTab] = useState<'feed' | 'submit'>('feed');
  const [filterRole, setFilterRole] = useState<string>('all');

  // Form State
  const [userName, setUserName] = useState(
    currentUser?.displayName || (currentUser?.role === 'admin' ? 'Hackathon Evaluator' : '')
  );
  const [userRole, setUserRole] = useState<PlatformFeedbackItem['userRole']>(
    currentUser?.role === 'admin' ? 'Judge / Evaluator' : 'Engineering Student'
  );
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<PlatformFeedbackItem['category']>('Real-Time Innovation');
  const [highlightFeature, setHighlightFeature] = useState(HIGHLIGHT_FEATURES[0]);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [seedingLoading, setSeedingLoading] = useState(false);

  // Subscribe to real-time Firestore feedback
  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeToPlatformFeedback((items) => {
      setFeedbackList(items);
    });
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate live rating stats
  const totalCount = feedbackList.length;
  const averageRating =
    totalCount > 0
      ? (feedbackList.reduce((acc, curr) => acc + curr.rating, 0) / totalCount).toFixed(1)
      : '5.0';

  const fiveStarCount = feedbackList.filter((f) => f.rating === 5).length;
  const fiveStarPercent = totalCount > 0 ? Math.round((fiveStarCount / totalCount) * 100) : 100;

  const filteredItems = feedbackList.filter((item) => {
    if (filterRole === 'judges') return item.userRole === 'Judge / Evaluator';
    if (filterRole === 'students') return item.userRole === 'Engineering Student';
    if (filterRole === 'fiveStar') return item.rating === 5;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || !userName.trim()) return;

    setIsSubmitting(true);
    try {
      await submitPlatformFeedback({
        userId: currentUser?.uid || 'evaluator_' + Date.now(),
        userName: userName.trim(),
        userRole,
        rating,
        category,
        highlightFeature,
        feedbackText: feedbackText.trim(),
        verifiedJudge: userRole === 'Judge / Evaluator',
      });

      setSubmittedSuccess(true);
      setFeedbackText('');
      setTimeout(() => {
        setSubmittedSuccess(false);
        setActiveTab('feed');
      }, 1400);
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReact = async (id: string) => {
    await reactToFeedback(id);
  };

  const handleSeedDemoData = async () => {
    setSeedingLoading(true);
    try {
      await seedInitialJudgeFeedbackToFirestore();
    } finally {
      setTimeout(() => setSeedingLoading(false), 600);
    }
  };

  return (
    <div
      id="live-judge-feedback-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="live-judge-feedback-modal-card"
        className="bg-white dark:bg-[#1A2326] w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl border border-[#E8E4D9] dark:border-[#2C3B3F] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E4D9] dark:border-[#2C3B3F] bg-linear-to-r from-teal-500/10 via-emerald-500/5 to-transparent flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif italic text-lg sm:text-xl font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                  Live Judge & Community Ratings
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Real-Time Database
                </span>
              </div>
              <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
                MindBridge 360 live evaluation metrics, verified reviews & rating stream
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#7A756D] dark:text-[#9BA3AF] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Metrics Banner */}
        <div className="bg-[#F8F7F2] dark:bg-[#141C1E] px-4 sm:px-6 py-3 border-b border-[#E8E4D9] dark:border-[#2C3B3F] shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                  {averageRating}
                </span>
                <div className="flex text-amber-400 text-sm">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>
              <div className="h-7 w-[1px] bg-[#E8E4D9] dark:border-[#2C3B3F]"></div>
              <div className="text-xs">
                <div className="font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                  {totalCount} Real-Time Reviews
                </div>
                <div className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF]">
                  {fiveStarPercent}% 5-Star Satisfaction
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSeedDemoData}
                disabled={seedingLoading}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-teal-300 dark:border-teal-700/60 bg-teal-50/80 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 hover:bg-teal-100 transition-colors flex items-center gap-1 cursor-pointer"
                title="Sync default judge feedback to Firestore database"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{seedingLoading ? 'Syncing...' : 'Sync Firestore Samples'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="px-4 sm:px-6 pt-3 flex items-center justify-between border-b border-[#E8E4D9] dark:border-[#2C3B3F] bg-white dark:bg-[#1A2326] shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('feed')}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'feed'
                  ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                  : 'border-transparent text-[#7A756D] dark:text-[#9BA3AF] hover:text-[#2D2D2B]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Live Reviews Stream ({totalCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'submit'
                  ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                  : 'border-transparent text-[#7A756D] dark:text-[#9BA3AF] hover:text-[#2D2D2B]'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Submit Judge / User Rating</span>
            </button>
          </div>

          {activeTab === 'feed' && (
            <div className="hidden sm:flex items-center gap-1 pb-2">
              <span className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF] mr-1">Filter:</span>
              <button
                onClick={() => setFilterRole('all')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                  filterRole === 'all'
                    ? 'bg-teal-600 text-white'
                    : 'bg-black/5 dark:bg-white/5 text-[#7A756D]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterRole('judges')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                  filterRole === 'judges'
                    ? 'bg-teal-600 text-white'
                    : 'bg-black/5 dark:bg-white/5 text-[#7A756D]'
                }`}
              >
                Judges
              </button>
              <button
                onClick={() => setFilterRole('students')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                  filterRole === 'students'
                    ? 'bg-teal-600 text-white'
                    : 'bg-black/5 dark:bg-white/5 text-[#7A756D]'
                }`}
              >
                Students
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'feed' ? (
            <div className="space-y-3.5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 ${
                    item.verifiedJudge
                      ? 'border-amber-200 dark:border-amber-900/60 bg-linear-to-br from-amber-50/50 via-white to-amber-50/20 dark:from-[#21231E] dark:to-[#1A2326] shadow-xs'
                      : 'border-[#E8E4D9] dark:border-[#2C3B3F] bg-white dark:bg-[#1E282B]'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#4A8B8D] to-teal-600 text-white flex items-center justify-center text-xs font-bold font-serif">
                        {item.userName ? item.userName.charAt(0) : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-[#2D2D2B] dark:text-[#F3F6F8]">
                            {item.userName}
                          </span>
                          {item.verifiedJudge && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              Judge Verified
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#7A756D] dark:text-[#9BA3AF]">
                          {item.userRole}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= item.rating ? 'fill-current text-amber-400' : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#4D4944] dark:text-[#D1E0E3] leading-relaxed mb-3">
                    "{item.feedbackText}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-[11px]">
                    {item.highlightFeature ? (
                      <span className="text-[#4A8B8D] dark:text-[#88D4D6] font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Highlighted: {item.highlightFeature}</span>
                      </span>
                    ) : (
                      <span></span>
                    )}

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#7A756D] dark:text-[#8E9B9F]">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>

                      <button
                        onClick={() => handleReact(item.id)}
                        className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                          item.hasReacted
                            ? 'bg-teal-100 dark:bg-teal-900/60 border-teal-400 text-teal-800 dark:text-teal-200'
                            : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-teal-300 text-[#7A756D] dark:text-[#9BA3AF]'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{item.reactionsCount || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="text-center py-12 text-[#7A756D] dark:text-[#9BA3AF]">
                  <p className="text-sm">No reviews in this filter category yet.</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submittedSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in zoom-in-95">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">
                    Thank you! Your evaluation rating was saved to Firestore in real time.
                  </span>
                </div>
              )}

              {/* Evaluator Role Picker */}
              <div>
                <label className="block text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1.5">
                  Your Evaluator / User Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setUserRole(r)}
                      className={`p-2 rounded-xl text-left border text-xs font-medium transition-all cursor-pointer ${
                        userRole === r
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 shadow-xs'
                          : 'border-[#E8E4D9] dark:border-[#2C3B3F] hover:bg-black/5 dark:hover:bg-white/5 text-[#5A554E] dark:text-[#9BA3AF]'
                      }`}
                    >
                      {r === 'Judge / Evaluator' && '⚖️ '}
                      {r === 'Engineering Student' && '🎓 '}
                      {r === 'Campus Counsellor / Faculty' && '🩺 '}
                      {r === 'Guest Observer' && '👀 '}
                      {r === 'Dean / Administrator' && '🏛️ '}
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1.5">
                  Your Name or Title
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Judge Dr. Ananya Sharma or 3rd Year CSE Evaluator"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4D9] dark:border-[#2C3B3F] bg-white dark:bg-[#151E20] text-xs sm:text-sm text-[#2D2D2B] dark:text-[#F3F6F8] focus:outline-hidden focus:ring-2 focus:ring-[#4A8B8D]"
                />
              </div>

              {/* Interactive Star Rating */}
              <div>
                <label className="block text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1.5">
                  Overall Score / Star Rating
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 cursor-pointer transition-transform hover:scale-115 active:scale-95"
                          aria-label={`Rate ${star} star`}
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              isActive
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-bold text-[#4A8B8D] dark:text-[#88D4D6] ml-2">
                    {rating === 5 && 'Outstanding / 5.0 (Hackathon Winner Caliber)'}
                    {rating === 4 && 'Very Good / 4.0 (Strong Clinical & Technical Value)'}
                    {rating === 3 && 'Good / 3.0 (Solid Architecture)'}
                    {rating <= 2 && 'Promising Prototype'}
                  </span>
                </div>
              </div>

              {/* Category & Feature Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1.5">
                    Evaluation Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4D9] dark:border-[#2C3B3F] bg-white dark:bg-[#151E20] text-xs text-[#2D2D2B] dark:text-[#F3F6F8] focus:outline-hidden"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1.5">
                    Standout Feature
                  </label>
                  <select
                    value={highlightFeature}
                    onChange={(e) => setHighlightFeature(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4D9] dark:border-[#2C3B3F] bg-white dark:bg-[#151E20] text-xs text-[#2D2D2B] dark:text-[#F3F6F8] focus:outline-hidden"
                  >
                    {HIGHLIGHT_FEATURES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Feedback Textarea */}
              <div>
                <label className="block text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8] mb-1.5">
                  Detailed Feedback, Evaluation Notes, or Impressions
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your thoughts on the real-time responsiveness, cultural empathy (Tamil/Tanglish), k-anonymity privacy radar, or voice interaction..."
                  rows={4}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4D9] dark:border-[#2C3B3F] bg-white dark:bg-[#151E20] text-xs sm:text-sm text-[#2D2D2B] dark:text-[#F3F6F8] focus:outline-hidden focus:ring-2 focus:ring-[#4A8B8D]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !feedbackText.trim()}
                className="w-full py-3 rounded-2xl bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Syncing to Database...' : 'Submit Real-Time Rating & Review'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E8E4D9] dark:border-[#2C3B3F] bg-[#F8F7F2] dark:bg-[#141C1E] flex flex-wrap items-center justify-between text-[11px] text-[#7A756D] dark:text-[#9BA3AF] shrink-0">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Live Firestore updates stream instantaneously to all connected users
          </span>
          <button
            onClick={onClose}
            className="font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
          >
            Back to MindBridge 360
          </button>
        </div>
      </div>
    </div>
  );
};
