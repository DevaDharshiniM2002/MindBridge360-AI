import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  ShieldCheck,
  Building2,
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle,
  EyeOff,
  Filter,
  Calendar,
  Lock,
  Flag,
  UserCheck,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  Plus,
  Compass,
  HeartHandshake,
  Activity,
  Award,
} from 'lucide-react';
import {
  CampusDepartmentMetric,
  CampusActionRecommendation,
  AcademicCorrelationPoint,
  AcademicEvent,
  PeerPost,
  UserRole,
} from '../types';

interface CampusWellnessRadarViewProps {
  userRole?: UserRole;
  flaggedPosts?: PeerPost[];
  academicEvents?: AcademicEvent[];
  onReviewFlaggedPost?: (postId: string, action: 'dismiss' | 'assign-counsellor') => void;
  onAddAcademicEvent?: (event: Partial<AcademicEvent>) => void;
}

const MOCK_CAMPUS_DEPARTMENTS: CampusDepartmentMetric[] = [
  {
    department: 'Computer Science & Engineering',
    code: 'CSE',
    sampleCount: 342,
    isSuppressed: false,
    stressTrend: 'elevated',
    burnoutPercentage: 64,
    sleepAverageHours: 5.8,
    primaryReportedFactor: 'Higher reported academic pressure (Unit Tests & Coding DSA)',
  },
  {
    department: 'Artificial Intelligence & Data Science',
    code: 'AI & DS',
    sampleCount: 215,
    isSuppressed: false,
    stressTrend: 'elevated',
    burnoutPercentage: 68,
    sleepAverageHours: 5.6,
    primaryReportedFactor: 'Higher reported project submission & GPU lab deadlines',
  },
  {
    department: 'Electronics & Communication',
    code: 'ECE',
    sampleCount: 188,
    isSuppressed: false,
    stressTrend: 'stable',
    burnoutPercentage: 48,
    sleepAverageHours: 6.4,
    primaryReportedFactor: 'Moderate reported lab viva & circuit simulation load',
  },
  {
    department: 'Electrical & Electronics',
    code: 'EEE',
    sampleCount: 140,
    isSuppressed: false,
    stressTrend: 'stable',
    burnoutPercentage: 45,
    sleepAverageHours: 6.5,
    primaryReportedFactor: 'Steady preparation for power systems lab test',
  },
  {
    department: 'Mechanical Engineering',
    code: 'MECH',
    sampleCount: 124,
    isSuppressed: false,
    stressTrend: 'decreasing',
    burnoutPercentage: 38,
    sleepAverageHours: 6.9,
    primaryReportedFactor: 'Normalized study pace post workshop assessments',
  },
  {
    department: 'Civil Engineering',
    code: 'CIVIL',
    sampleCount: 92,
    isSuppressed: false,
    stressTrend: 'stable',
    burnoutPercentage: 41,
    sleepAverageHours: 6.7,
    primaryReportedFactor: 'Survey camp schedule and structural analysis viva',
  },
  {
    department: 'Biotechnology & Bioinformatics',
    code: 'BIOTECH',
    sampleCount: 4, // < 10 threshold -> k-anonymity suppressed!
    isSuppressed: true,
    stressTrend: 'stable',
    burnoutPercentage: 0,
    sleepAverageHours: 0,
    primaryReportedFactor: 'Suppressed for student privacy guarantee',
  },
];

const MOCK_WEEKLY_TRAJECTORY = [
  { week: 'W1 (Orientation)', StressIndex: 28, SleepScore: 82, Workload: 22, AcademicEvent: 'Semester Inauguration' },
  { week: 'W2', StressIndex: 32, SleepScore: 78, Workload: 30, AcademicEvent: 'Lab Batch Setup' },
  { week: 'W3', StressIndex: 40, SleepScore: 72, Workload: 45, AcademicEvent: 'Assignment 1 Due' },
  { week: 'W4 (IA-1 Assessment)', StressIndex: 68, SleepScore: 54, Workload: 76, AcademicEvent: 'Internal Assessment 1' },
  { week: 'W5', StressIndex: 48, SleepScore: 66, Workload: 50, AcademicEvent: 'Feedback Week' },
  { week: 'W6 (Lab Viva Week)', StressIndex: 74, SleepScore: 48, Workload: 82, AcademicEvent: 'Model Practical Exams' },
  { week: 'W7 (Placement Drive)', StressIndex: 72, SleepScore: 52, Workload: 79, AcademicEvent: 'Tier-1 Campus Drives' },
  { week: 'W8 (Current)', StressIndex: 65, SleepScore: 58, Workload: 68, AcademicEvent: 'Pre-IA2 Preparation' },
];

const INITIAL_RECOMMENDED_ACTIONS: CampusActionRecommendation[] = [
  {
    id: 'act-1',
    title: 'Organize Guided Campus Relaxation Sessions',
    category: 'relaxation',
    emoji: '🧘',
    description: 'Host daily 15-minute 4-7-8 breathing and sensory reset circles in hostel common rooms.',
    rationale: 'Reported academic pressure increased +24% leading up to Internal Assessment 2.',
    status: 'planned',
  },
  {
    id: 'act-2',
    title: 'Provide Academic Support & Peer Tutoring Hours',
    category: 'academic',
    emoji: '📚',
    description: 'Schedule student volunteer problem-solving desks for Mathematics 2 and Data Structures.',
    rationale: 'Over 60% of students reporting study fatigue noted complex algorithmic theory backlogs.',
    status: 'in-progress',
  },
  {
    id: 'act-3',
    title: 'Conduct Placement Preparation & Mock Anxiety Drills',
    category: 'placement',
    emoji: '💼',
    description: 'Offer mock technical interview practice with calm communication coaching from senior alumni.',
    rationale: 'Placement drive week correlated with significant sleep debt (avg 5.2 hrs/night).',
    status: 'suggested',
  },
  {
    id: 'act-4',
    title: 'Hostel Support & Nutrition Activities',
    category: 'hostel',
    emoji: '🏠',
    description: 'Extend mess hall warm herbal tea service during late study hours and enhance quiet study spaces.',
    rationale: 'Hostel resident check-ins reflected higher homesickness and fatigue during exam weeks.',
    status: 'suggested',
  },
  {
    id: 'act-5',
    title: 'Increase Counsellor Availability During High-Pressure Windows',
    category: 'counselling',
    emoji: '🎓',
    description: 'Open 4 additional walk-in confidential guidance slots at the campus wellbeing centre.',
    rationale: 'Historical peak stress curve shows highest guidance demand 3 days prior to exam crunch.',
    status: 'planned',
  },
];

export const CampusWellnessRadarView: React.FC<CampusWellnessRadarViewProps> = ({
  userRole = 'counsellor',
  flaggedPosts = [],
  academicEvents = [],
  onReviewFlaggedPost,
  onAddAcademicEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'departments' | 'calendar' | 'actions' | 'safety'>(
    'trends'
  );
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [actionList, setActionList] = useState<CampusActionRecommendation[]>(INITIAL_RECOMMENDED_ACTIONS);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<any>('internal-exam');
  const [newEventDate, setNewEventDate] = useState('2026-09-12');

  const lastUpdatedTime = 'Today, 09:30 AM (Live Sync)';

  const handleToggleActionStatus = (actionId: string) => {
    setActionList((prev) =>
      prev.map((act) => {
        if (act.id === actionId) {
          const nextStatus: any =
            act.status === 'suggested'
              ? 'planned'
              : act.status === 'planned'
              ? 'in-progress'
              : act.status === 'in-progress'
              ? 'completed'
              : 'suggested';
          return { ...act, status: nextStatus };
        }
        return act;
      })
    );
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    if (onAddAcademicEvent) {
      onAddAcademicEvent({
        title: newEventTitle,
        category: newEventCategory,
        dateStr: newEventDate,
        weight: 'high',
        daysRemaining: 10,
      });
    }
    setShowAddEventModal(false);
    setNewEventTitle('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 px-3 sm:px-4">
      {/* 1. Header with Privacy Shield Badge & Freshness Indicator */}
      <div className="bg-white dark:bg-[#161E20] rounded-[36px] border border-[#E8E4D9] dark:border-[#223034] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#4A8B8D] dark:text-[#63C1C4] flex items-center justify-center text-2xl shrink-0">
              🏫
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/60 text-[#4A8B8D] dark:text-[#63C1C4] rounded-full">
                  Module 10 • Institutional Insights
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> k-Anonymity (k ≥ 10)
                </span>
              </div>
              <h2 className="font-serif italic text-2xl sm:text-3xl text-[#2D2D2B] dark:text-[#F3F6F8] mt-1">
                Campus Wellness Radar
              </h2>
              <p className="text-xs sm:text-sm text-[#7A756D] dark:text-[#9BA3AF] mt-0.5 max-w-xl">
                Helping colleges understand student wellbeing trends without individual surveillance.
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#F9F7F2] dark:bg-[#1C2527] rounded-2xl border border-[#E8E4D9] dark:border-[#2F3D42] text-xs text-[#7A756D] dark:text-[#9BA3AF] shrink-0 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
              <Clock className="w-3.5 h-3.5 text-[#4A8B8D]" />
              <span>Last updated: {lastUpdatedTime}</span>
            </div>
            <div className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF]">
              Active Responses: <strong>1,105 students</strong> (Anonymized)
            </div>
          </div>
        </div>

        {/* 🔒 Why is this anonymous? (Transparency Banner) */}
        <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-900/50 flex items-start gap-3">
          <Lock className="w-4 h-4 text-[#4A8B8D] shrink-0 mt-0.5" />
          <div className="text-xs text-teal-900 dark:text-teal-200 space-y-0.5">
            <p className="font-bold">🔒 Why is this anonymous?</p>
            <p className="text-[11px] text-teal-800/90 dark:text-teal-300/80 leading-relaxed">
              MindBridge 360 removes personal identity from campus-level insights. Student names, roll numbers, phone numbers, and individual logs are never collected for this dashboard. Small groups (&lt; 10 responses) are automatically suppressed so individual students cannot be inferred.
            </p>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-[#E8E4D9] dark:border-[#223034]">
          {[
            { id: 'trends', label: 'Campus Trends', icon: TrendingUp, emoji: '📈' },
            { id: 'departments', label: 'Department View', icon: Building2, emoji: '🏢' },
            { id: 'calendar', label: 'Academic Correlation', icon: Calendar, emoji: '🗓️' },
            { id: 'actions', label: 'Recommended Actions', icon: Compass, emoji: '🎯' },
            ...(userRole === 'counsellor' || userRole === 'admin'
              ? [{ id: 'safety', label: 'Safety Workflow', icon: Flag, emoji: '🛡️' }]
              : []),
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#4A8B8D] text-white shadow-2xs'
                    : 'bg-[#F0EDE4]/60 dark:bg-[#253235]/60 text-[#7A756D] dark:text-[#9BA3AF] hover:text-[#2D2D2B]'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TAB CONTENT: 📈 CAMPUS TRENDS */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Main Chart: Weekly Stress & Sleep Trajectory */}
          <div className="bg-white dark:bg-[#161E20] rounded-[36px] border border-[#E8E4D9] dark:border-[#223034] p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif italic text-lg sm:text-xl text-[#2D2D2B] dark:text-[#F3F6F8]">
                  Aggregated Campus Stress & Rest Trajectory
                </h3>
                <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
                  Correlated across 8 academic weeks (0–100 index)
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-rose-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Stress Index
                </span>
                <span className="flex items-center gap-1.5 text-teal-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4A8B8D] inline-block" /> Rest Score
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_WEEKLY_TRAJECTORY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E11D48" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#E11D48" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="restGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4A8B8D" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4A8B8D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      color: '#F8FAFC',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="StressIndex"
                    stroke="#E11D48"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#stressGrad)"
                    name="Stress Index"
                  />
                  <Area
                    type="monotone"
                    dataKey="SleepScore"
                    stroke="#4A8B8D"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#restGrad)"
                    name="Rest / Sleep Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F9F7F2] dark:bg-[#1C2527] border border-[#E8E4D9] dark:border-[#2F3D42] text-xs text-[#7A756D] dark:text-[#9BA3AF] flex items-center justify-between">
              <span>
                💡 <strong>Observed Pattern:</strong> Higher reported academic pressure during assessment and lab viva weeks (W4, W6).
              </span>
              <span className="text-[10px] text-[#7A756D]">Correlation, not sole causation</span>
            </div>
          </div>

          {/* Quick Metrics 3-Col Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#161E20] border border-[#E8E4D9] dark:border-[#223034] shadow-xs space-y-1">
              <span className="text-xs font-bold text-[#7A756D] dark:text-[#9BA3AF]">Average Campus Sleep</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">6.1 hrs</span>
                <span className="text-xs text-rose-500 font-bold">↓ 0.4h vs baseline</span>
              </div>
              <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF]">
                Late-night study reported predominantly in 3rd & 4th year batches.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#161E20] border border-[#E8E4D9] dark:border-[#223034] shadow-xs space-y-1">
              <span className="text-xs font-bold text-[#7A756D] dark:text-[#9BA3AF]">Primary Reported Concern</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#4A8B8D]">Placement & Exams</span>
              </div>
              <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF]">
                52% reported campus interview and semester syllabus concerns.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#161E20] border border-[#E8E4D9] dark:border-[#223034] shadow-xs space-y-1">
              <span className="text-xs font-bold text-[#7A756D] dark:text-[#9BA3AF]">Coping Tool Adoption</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-600">84%</span>
                <span className="text-xs text-emerald-600 font-bold">↑ +18% active</span>
              </div>
              <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF]">
                4-7-8 Breathing and Parent Bridge most frequently utilized this week.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT: 🏢 DEPARTMENT VIEW WITH K-ANONYMITY */}
      {activeTab === 'departments' && (
        <div className="bg-white dark:bg-[#161E20] rounded-[36px] border border-[#E8E4D9] dark:border-[#223034] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E4D9] dark:border-[#223034] pb-4">
            <div>
              <h3 className="font-serif italic text-lg sm:text-xl text-[#2D2D2B] dark:text-[#F3F6F8]">
                Department-Level Aggregated Trends
              </h3>
              <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
                Neutral, non-stigmatizing aggregate patterns. Groups with &lt; 10 responses are auto-suppressed.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {MOCK_CAMPUS_DEPARTMENTS.map((dept) => {
              return (
                <div
                  key={dept.code}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    dept.isSuppressed
                      ? 'bg-[#F9F7F2]/50 dark:bg-[#1C2527]/30 border-dashed border-[#CCC8BD] dark:border-[#3D474A] opacity-75'
                      : 'bg-[#F9F7F2] dark:bg-[#1C2527] border-[#E8E4D9] dark:border-[#2F3D42]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                          {dept.department} ({dept.code})
                        </h4>
                        {dept.isSuppressed ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full flex items-center gap-1">
                            <EyeOff className="w-3 h-3" /> Suppressed for privacy
                          </span>
                        ) : (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              dept.stressTrend === 'elevated'
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                            }`}
                          >
                            {dept.stressTrend === 'elevated' ? 'Higher reported workload' : 'Stable rhythm'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
                        {dept.primaryReportedFactor}
                      </p>
                    </div>

                    {dept.isSuppressed ? (
                      <div className="text-right">
                        <div className="text-xs text-[#7A756D] dark:text-[#9BA3AF] italic">
                          Not enough responses to display this group.
                        </div>
                        <div className="text-[10px] text-[#7A756D]">
                          ({dept.sampleCount} responses &lt; min threshold of 10)
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="text-xs text-[#7A756D] dark:text-[#9BA3AF] block">Sample Size</span>
                          <span className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                            {dept.sampleCount} students
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-[#7A756D] dark:text-[#9BA3AF] block">Avg Sleep</span>
                          <span className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                            {dept.sleepAverageHours} hrs
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-[#7A756D] dark:text-[#9BA3AF] block">Burnout Ratio</span>
                          <span className="text-xs font-bold text-rose-600">
                            {dept.burnoutPercentage}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: 🗓️ ACADEMIC CALENDAR CORRELATION */}
      {activeTab === 'calendar' && (
        <div className="bg-white dark:bg-[#161E20] rounded-[36px] border border-[#E8E4D9] dark:border-[#223034] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E4D9] dark:border-[#223034] pb-4">
            <div>
              <h3 className="font-serif italic text-lg sm:text-xl text-[#2D2D2B] dark:text-[#F3F6F8]">
                Academic Milestone Correlation
              </h3>
              <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
                Correlating exam schedules, submissions, and placement drives with aggregated wellbeing indicators.
              </p>
            </div>
            {(userRole === 'admin' || userRole === 'counsellor') && (
              <button
                onClick={() => setShowAddEventModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#4A8B8D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Academic Event</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Internal Assessment 2 (Theory)',
                type: 'Internal Exam',
                date: 'Sept 4, 2026 (4 days away)',
                trendObservation: 'Reported academic pressure increased during the previous assessment period.',
                status: 'Upcoming Peak',
                badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
              },
              {
                title: 'Operating Systems & DBMS Lab Viva',
                type: 'Lab Practical',
                date: 'Sept 8, 2026 (8 days away)',
                trendObservation: 'Lab viva periods correlate with elevated sleep debt in 2nd and 3rd year groups.',
                status: 'High Load',
                badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
              },
              {
                title: 'Campus Placement Drive (Tier 1 Tech)',
                type: 'Placement Drive',
                date: 'Sept 15, 2026 (15 days away)',
                trendObservation: 'Final year batches reflect highest proactive usage of Parent Bridge and Breathing tools.',
                status: 'Focus Window',
                badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
              },
              {
                title: 'Capstone Phase 1 Project Review',
                type: 'Project Submission',
                date: 'Sept 22, 2026 (22 days away)',
                trendObservation: 'Moderate increase in evening teamwork check-in logs.',
                status: 'Normal',
                badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200',
              },
            ].map((event, eIdx) => (
              <div
                key={eIdx}
                className="p-4 sm:p-5 rounded-2xl bg-[#F9F7F2] dark:bg-[#1C2527] border border-[#E8E4D9] dark:border-[#2F3D42] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📅</span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                      {event.title}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 bg-[#E8E4D9] dark:bg-[#253235] text-[#2D2D2B] dark:text-[#F3F6F8] rounded-md font-bold">
                      {event.type}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${event.badgeColor}`}>
                    {event.status}
                  </span>
                </div>
                <div className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
                  <strong>Timeline:</strong> {event.date}
                </div>
                <div className="text-xs text-teal-900 dark:text-teal-200 bg-teal-50/60 dark:bg-teal-950/40 p-2.5 rounded-xl border border-teal-200/50 dark:border-teal-900/40">
                  📈 <strong>Historical Insight:</strong> {event.trendObservation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: 🎯 CAMPUS ACTION RECOMMENDATIONS */}
      {activeTab === 'actions' && (
        <div className="bg-white dark:bg-[#161E20] rounded-[36px] border border-[#E8E4D9] dark:border-[#223034] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-[#E8E4D9] dark:border-[#223034] pb-4">
            <h3 className="font-serif italic text-lg sm:text-xl text-[#2D2D2B] dark:text-[#F3F6F8]">
              Recommended Institutional Actions
            </h3>
            <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
              Actionable, data-backed wellness initiatives generated from aggregated trends. These are recommendations, not automatic decisions.
            </p>
          </div>

          <div className="space-y-3.5">
            {actionList.map((act) => {
              return (
                <div
                  key={act.id}
                  className="p-5 rounded-2xl bg-[#F9F7F2] dark:bg-[#1C2527] border border-[#E8E4D9] dark:border-[#2F3D42] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{act.emoji}</span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                          {act.title}
                        </h4>
                        <span className="text-[10px] text-[#7A756D] dark:text-[#9BA3AF] uppercase tracking-wider font-bold">
                          Category: {act.category}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleActionStatus(act.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto ${
                        act.status === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : act.status === 'in-progress'
                          ? 'bg-blue-600 text-white'
                          : act.status === 'planned'
                          ? 'bg-[#4A8B8D] text-white'
                          : 'bg-[#E8E4D9] dark:bg-[#253235] text-[#2D2D2B] dark:text-[#F3F6F8]'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span className="capitalize">{act.status.replace('-', ' ')}</span>
                      <span className="text-[9px] opacity-75">(Tap to advance)</span>
                    </button>
                  </div>

                  <p className="text-xs text-[#2D2D2B] dark:text-[#F3F6F8] leading-relaxed">
                    {act.description}
                  </p>

                  <div className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF] bg-white dark:bg-[#161E20] p-2.5 rounded-xl border border-[#E8E4D9] dark:border-[#2F3D42]">
                    📊 <strong>Data Rationale:</strong> {act.rationale}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: 🛡️ CONFIDENTIAL SAFETY WORKFLOW */}
      {activeTab === 'safety' && (
        <div className="bg-white dark:bg-[#161E20] rounded-[36px] border border-[#E8E4D9] dark:border-[#223034] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-[#E8E4D9] dark:border-[#223034] pb-4">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
              <Flag className="w-5 h-5" />
              <h3 className="font-serif italic text-lg sm:text-xl font-bold">
                Confidential Counsellor Safety Workflow
              </h3>
            </div>
            <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF] mt-0.5">
              Urgent peer support cases routed strictly to authorized clinical counsellors. Kept strictly separate from campus-wide analytics.
            </p>
          </div>

          {flaggedPosts.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                No Active High-Risk Cases
              </h4>
              <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
                All community interactions and crisis flags are currently clear and monitored.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {flaggedPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      Case #{post.id.slice(-6)} • {post.room} room
                    </span>
                    <span className="text-[10px] bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 font-bold px-2 py-0.5 rounded-full">
                      Confidential
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">{post.title}</h5>
                  <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF] italic">"{post.content}"</p>
                  {onReviewFlaggedPost && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onReviewFlaggedPost(post.id, 'assign-counsellor')}
                        className="px-3 py-1.5 bg-[#4A8B8D] text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Assign to Duty Counsellor
                      </button>
                      <button
                        onClick={() => onReviewFlaggedPost(post.id, 'dismiss')}
                        className="px-3 py-1.5 bg-white dark:bg-[#161E20] text-[#7A756D] rounded-xl text-xs font-bold border border-[#E8E4D9] dark:border-[#2F3D42] cursor-pointer"
                      >
                        Dismiss Flag
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Event Modal for Admin */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#161E20] rounded-3xl p-6 w-full max-w-md border border-[#E8E4D9] dark:border-[#223034] shadow-2xl space-y-4"
          >
            <h3 className="font-serif italic text-lg font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
              Add Academic Calendar Event
            </h3>
            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#7A756D] dark:text-[#9BA3AF] block mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Model Practical Exam"
                  className="w-full p-2.5 rounded-xl border border-[#E8E4D9] dark:border-[#2F3D42] bg-[#F9F7F2] dark:bg-[#1C2527] text-[#2D2D2B] dark:text-[#F3F6F8]"
                />
              </div>
              <div>
                <label className="font-bold text-[#7A756D] dark:text-[#9BA3AF] block mb-1">
                  Category
                </label>
                <select
                  value={newEventCategory}
                  onChange={(e) => setNewEventCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E8E4D9] dark:border-[#2F3D42] bg-[#F9F7F2] dark:bg-[#1C2527] text-[#2D2D2B] dark:text-[#F3F6F8]"
                >
                  <option value="internal-exam">Internal Assessment Exam</option>
                  <option value="semester-final">Semester Final Exam</option>
                  <option value="lab-viva">Lab Viva / Practical</option>
                  <option value="placement-drive">Placement Drive</option>
                  <option value="project-review">Project Submission</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-[#7A756D] dark:text-[#9BA3AF] block mb-1">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E8E4D9] dark:border-[#2F3D42] bg-[#F9F7F2] dark:bg-[#1C2527] text-[#2D2D2B] dark:text-[#F3F6F8]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#7A756D] hover:text-[#2D2D2B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#4A8B8D] text-white text-xs font-bold shadow-xs"
                >
                  Save to Calendar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
