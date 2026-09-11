export type UserRole = 'student' | 'volunteer' | 'counsellor' | 'admin';

export type AppLanguage = 'en' | 'ta' | 'tanglish';

export type CompanionAvatarType = 'mithra' | 'mithran' | 'blob' | 'otter' | 'sprout' | 'owl';

export type CompanionTone = 'gentle' | 'upbeat' | 'straight-talking';

export type CompanionEmotion = 'neutral' | 'happy' | 'concerned' | 'celebrating' | 'listening' | 'sleepy' | 'breathing';

export interface CompanionConfig {
  id?: 'mithra' | 'mithran';
  name: string;
  avatar: CompanionAvatarType;
  tone: CompanionTone;
  voiceEnabled: boolean;
  voicePitch?: number;
  gender?: 'female' | 'male';
  title?: string;
  bio?: string;
  tamilName?: string;
}

export interface CheckinData {
  id: string;
  timestamp: string; // ISO string
  dateStr: string; // e.g. "2026-08-20"
  sleep: number; // 1-5
  stress: number; // 1-5 (1 = very calm, 5 = extremely high)
  energy: number; // 1-5
  social: number; // 1-5
  workload: number; // 1-5
  journalNote?: string;
  voiceNoteUrl?: string;
  voiceNoteDuration?: number;
  isQuietPulse?: boolean;
  quietPulseMood?: 'calm' | 'stressed' | 'hanging-on' | 'exhausted';
  streakDay?: number;
}

export interface FutureMessage {
  id: string;
  title: string;
  content: string;
  audioBlobUrl?: string;
  triggerTag: 'hard-day' | 'exam-anxiety' | 'homesick' | 'lonely' | 'self-doubt' | 'general';
  createdAt: string;
  openedAt?: string;
  isOpened: boolean;
}

export interface PeerReply {
  id: string;
  authorPseudonym: string;
  isVolunteer: boolean;
  volunteerKarma?: number;
  content: string;
  createdAt: string;
  thanked: boolean;
}

export interface PeerPost {
  id: string;
  room: 'exams' | 'homesick' | 'relationships' | 'transitions' | 'research';
  authorPseudonym: string;
  isVolunteer: boolean;
  volunteerKarma?: number;
  title: string;
  content: string;
  upvotes: number;
  hasUpvoted?: boolean;
  helpfulCount: number;
  replies: PeerReply[];
  flaggedForReview: boolean;
  flagReason?: string;
  flaggedBy?: string;
  createdAt: string;
}

export interface CounsellorBooking {
  id: string;
  urgency: 'routine' | 'urgent';
  topic: string;
  slotTime: string;
  counsellorName: string;
  counsellorTitle: string;
  mode: 'in-person' | 'private-voice' | 'secure-chat';
  status: 'booked' | 'in-progress' | 'completed';
  createdAt: string;
  estimatedWaitMinutes: number;
  followUpSchedule: FollowUpItem[];
}

export interface FollowUpItem {
  id: string;
  weekNumber: number;
  scheduledDate: string;
  prompt: string;
  status: 'pending' | 'completed' | 'skipped';
  responseMood?: number;
  responseNote?: string;
}

export interface ParentMessageTemplate {
  message: string;
  tips: string[];
  suggestedTiming: string;
  translatedSummary?: string;
}

export interface DepartmentTrend {
  department: string;
  year: string;
  totalActiveStudents: number; // Must be >= 15 to show breakdown
  burnoutIndex: number; // 0-100%
  stressSpikeRatio: number; // vs baseline
  primaryStressors: string[];
  isSuppressed: boolean; // true if < 15 students (k-anonymity privacy guarantee)
}

export interface CrisisHelpline {
  name: string;
  number: string;
  available: string;
  languages: string;
  description: string;
  isGovernment?: boolean;
  isTollFree?: boolean;
}

export interface AcademicEvent {
  id: string;
  title: string;
  category: 'internal-exam' | 'semester-final' | 'lab-viva' | 'project-review' | 'placement-drive' | 'arrear-exam' | 'assignment';
  dateStr: string; // YYYY-MM-DD
  daysRemaining: number;
  weight: 'low' | 'moderate' | 'high' | 'critical';
  notes?: string;
}

export interface ForecastDayItem {
  dateStr: string;
  dayLabel: string;
  predictedStress: number; // 0 - 100
  historicalBaseline: number; // 0 - 100
  hasAcademicEvent?: boolean;
  eventTitle?: string;
  status: 'normal' | 'elevated' | 'high' | 'peak';
}

export interface StressForecast {
  upcomingWindowName: string;
  daysUntilWindow: number;
  predictedRiskLevel: 'low' | 'elevated' | 'high' | 'peak';
  confidenceScore: number; // e.g. 88
  headline: string;
  actionableInsight: string;
  contributingFactors: string[];
  trajectory: ForecastDayItem[];
  recommendedInterventionId: string;
  recommendedInterventionName: string;
  recommendedInterventionEfficacy: number; // e.g. -22
}

export type InterventionType =
  | 'breathing-478'
  | 'sensory-grounding'
  | 'bubble-pop'
  | 'ambient-sound'
  | 'zen-sand'
  | 'mithra-chat'
  | 'mindmitra-moment'
  | 'counsellor-booking';

export interface InterventionOutcome {
  id: string;
  userId?: string;
  interventionType: InterventionType;
  interventionName: string;
  preStress: number; // 0 - 100
  postStress: number; // 0 - 100
  delta: number; // e.g. -21 (negative means stress reduced!)
  timestamp: string; // ISO String
  dateStr: string;
  feedback?: 'much-better' | 'slightly-better' | 'same' | 'worse';
  contextTag?: string;
  durationSeconds?: number;
}

export interface CopingEfficacyItem {
  type: InterventionType;
  name: string;
  emoji: string;
  avgStressReduction: number; // e.g. 22 points
  sessionsCompleted: number;
  successRate: number; // e.g. 92%
  isTopRecommendation?: boolean;
}

export interface PersonalCopingProfile {
  topEfficacyType: InterventionType;
  topEfficacyName: string;
  totalInterventionsCompleted: number;
  avgOverallReduction: number;
  strategies: CopingEfficacyItem[];
  lastLearnedAt: string;
}

// Module 5: Counsellor Training Simulator Types
export type TrainingMode = 'beginner' | 'intermediate' | 'simulation';

export type TrainingScenarioId =
  | 'exam-stress'
  | 'backlog-anxiety'
  | 'placement-pressure'
  | 'hostel-homesickness'
  | 'family-expectations'
  | 'career-confusion'
  | 'study-sleep'
  | 'social-difficulties'
  | 'custom';

export interface TrainingScenarioItem {
  id: TrainingScenarioId;
  title: string;
  emoji: string;
  description: string;
  sampleConcern: string;
  contextTag: string;
}

export interface TrainerCommunicationFeedback {
  clarity: number; // 0 - 100
  completeness: number; // 0 - 100
  expression: number; // 0 - 100
  confidence: number; // 0 - 100
  feedbackText: string;
  strengths: string[];
  suggestions: string[];
}

export interface TrainingTurn {
  id: string;
  questionIndex: number;
  question: string;
  studentAnswer: string;
  answerMode: 'voice' | 'text';
  firstAttemptAnswer?: string;
  feedback?: TrainerCommunicationFeedback;
  timestamp: string;
}

export interface CounsellingReadinessScorecard {
  clarity: number; // 0 - 100
  confidence: number; // 0 - 100
  expression: number; // 0 - 100
  communication: number; // 0 - 100
  whatYouDidWell: string[]; // 2-3 observations
  whatYouCanImprove: string[]; // 2-3 practical suggestions
  readinessBadge: string;
  sessionSummary: string;
}

export interface MyCounsellingNotes {
  id: string;
  mainConcern: string;
  whatIAmExperiencing: string;
  whatTriggersIt: string;
  howItAffectsMe: string;
  whatIHaveTried: string;
  whatIWantHelpWith: string;
  scenarioTitle?: string;
  trainerName: string;
  createdAt: string;
  updatedAt: string;
  isSharedWithCounsellor: boolean;
  sharedAt?: string;
}

// Module 9: Parent Bridge Types
export type ParentBridgeSituationId =
  | 'exam-stress'
  | 'backlog-pressure'
  | 'placement-pressure'
  | 'career-confusion'
  | 'study-fatigue'
  | 'hostel-homesickness'
  | 'feeling-overwhelmed'
  | 'course-decision'
  | 'custom';

export type ParentBridgeTone = 'gentle' | 'simple' | 'emotional' | 'practical' | 'respectful';

export type ParentNeedType =
  | 'listen'
  | 'give-time'
  | 'reduce-pressure'
  | 'help-plan'
  | 'encourage'
  | 'understand'
  | 'professional-support';

export interface ParentBridgeMessageResult {
  whatsapp: string;
  sms: string;
  inPerson: string;
  tips: string[];
  suggestedTiming: string;
  translatedSummary?: string;
  anticipatedQuestions?: Array<{
    parentSays: string;
    suggestedCalmReply: string;
  }>;
}

export interface ParentPracticeTurn {
  id: string;
  speaker: 'parent' | 'student';
  text: string;
  feedback?: {
    calmness: number; // 0 - 100
    assertiveness: number; // 0 - 100
    clarity: number; // 0 - 100
    coachingTip: string;
    samplePhrasing: string;
  };
  attemptNumber?: number;
  timestamp: string;
}

// Module 10: Campus Wellness Radar Types
export interface CampusActionRecommendation {
  id: string;
  title: string;
  category: 'relaxation' | 'academic' | 'placement' | 'hostel' | 'counselling';
  emoji: string;
  description: string;
  rationale: string;
  status: 'suggested' | 'planned' | 'in-progress' | 'completed';
}

export interface CampusDepartmentMetric {
  department: string;
  code: string;
  sampleCount: number;
  isSuppressed: boolean; // k-anonymity guarantee (true if sampleCount < 10)
  stressTrend: 'decreasing' | 'stable' | 'elevated' | 'high';
  burnoutPercentage: number;
  sleepAverageHours: number;
  primaryReportedFactor: string;
}

export interface AcademicCorrelationPoint {
  dateStr: string;
  eventName: string;
  eventType: 'internal' | 'semester' | 'assignment' | 'project' | 'placement';
  reportedStressIndex: number; // 0 - 100
  sleepHours: number;
  correlationNote: string;
}

// Module 12: Voice-First Accessibility Types
export type VoiceCommandAction =
  | 'navigate'
  | 'checkin'
  | 'talk_companion'
  | 'counselling_practice'
  | 'parent_bridge'
  | 'mind_relax'
  | 'show_stress'
  | 'help'
  | 'unknown';

export interface VoiceParsedIntent {
  action: VoiceCommandAction;
  targetTab?: string;
  confidence: number;
  spokenText: string;
  displayMessage: string;
  suggestedActionLabel: string;
  checkinDraft?: {
    mood?: 'calm' | 'stressed' | 'hanging-on' | 'exhausted';
    stressScore?: number;
    notes?: string;
    category?: string;
  };
}

export type VoiceCommandParsedResult = VoiceParsedIntent;

export interface PlatformFeedbackItem {
  id: string;
  userId: string;
  userName: string;
  userRole: 'Judge / Evaluator' | 'Engineering Student' | 'Campus Counsellor / Faculty' | 'Guest Observer' | 'Dean / Administrator';
  rating: number; // 1 - 5
  category: 'AI Empathy & Accuracy' | 'UI/UX & Design' | 'Campus Wellbeing Impact' | 'Real-Time Innovation' | 'Overall Platform';
  feedbackText: string;
  highlightFeature?: string;
  reactionsCount: number;
  hasReacted?: boolean;
  createdAt: string;
  verifiedJudge?: boolean;
}

// Module 13: Real-Time Student Registry & App Effectiveness Analytics (Admin Panel)
export interface EnrolledStudent {
  id: string;
  studentId: string; // University Roll Number e.g. "21AIDS001"
  name: string;
  email: string;
  department: string; // e.g. "Artificial Intelligence & Data Science"
  year: string; // e.g. "Final Year (4th Year / Sem 8)"
  batch: string; // e.g. "2021-2025"
  registeredAt: string;
  lastActive: string;
  // App Effectiveness & Usage Metrics
  appUsageMinutes: number; // total weekly minutes
  sessionsCompleted: number; // total sessions
  effectivenessScore: number; // 0 - 100% (stress relief efficacy)
  primaryToolUsed: string; // e.g. "Pranayama Pacer 4-7-8", "Kolam Zen Drawing", "Talk to Mithra"
  preStressAvg: number; // 0 - 100
  postStressAvg: number; // 0 - 100
  stressDelta: number; // e.g. -46%
  currentStatus: 'Thriving' | 'Exam Buffer Active' | 'Mild Fatigue' | 'Counsellor Linked' | 'High Friction';
  academicStressor?: string; // e.g. "Capstone AI Model Training & Placement Drive"
  avatarSeed?: string;
  verifiedStudent: boolean;
}

// Alternative Session Suggestions for Academic Restructuring
export interface AlternativeSessionSuggestion {
  id: string;
  title: string;
  department: string; // "Artificial Intelligence & Data Science" or "All Departments"
  targetCohort: string; // "Final Year", "All Years"
  triggerReason: string; // e.g. "Stress Spike (+42%) detected during Final Year Deep Learning Lab Submission & Placement Week"
  originalSchedule: string; // e.g. "3-Hour High-Stakes Model Validation Mock Exam (Friday 2:00 PM)"
  suggestedAlternative: string; // e.g. "30-Min Micro-Buffer + Guided Box Breathing & Asynchronous Peer Model Review"
  expectedBenefit: string; // e.g. "-35% Cognitive Overload, preserves code accuracy and mental stamina"
  status: 'pending_approval' | 'approved_broadcasted' | 'scheduled' | 'completed';
  scheduledDate?: string;
  approvedBy?: string;
  createdAt: string;
  category: 'academic-restructure' | 'stress-buffer' | 'placement-prep' | 'counselling-circle';
}

// Module 14: Campus Counsellor Directory & Roster
export interface CampusCounsellor {
  id: string;
  name: string;
  title: string;
  department: string;
  qualification: string;
  specialization: string[];
  officeLocation: string;
  phoneExt: string;
  email: string;
  status: 'available' | 'in-session' | 'on-duty' | 'leave';
  availableSlotsToday: string[];
  activeAssignedStudents: number;
  rating: number;
  dutyHours: string;
  emergencyDirectLine: string;
}

// Module 15: Emergency Support & Kind Message Configuration
export interface EmergencyContactConfig {
  favoritePersonName: string;
  favoritePersonPhone: string;
  favoritePersonRelation: string;
  parentName: string;
  parentPhone: string;
  parentRelation: string;
  customKindMessage?: string;
  lastSosDispatchedAt?: string;
}

// Module 16: 5-Question Stress Predictor Result
export interface StressPredictionResult {
  score: number; // 0 - 100
  level: 'Low' | 'Moderate' | 'High' | 'Severe';
  academicStrainScore: number;
  fatigueScore: number;
  focusScore: number;
  tensionScore: number;
  emotionalScore: number;
  recommendedFeatureName: string;
  recommendedFeatureId: 'breathing' | 'games' | 'relax' | 'mithra' | 'counsellor';
  rationale: string;
  completedAt: string;
}

// Module 17: Voice Mood NLP Analysis
export interface VoiceMoodNLPAnalysis {
  transcript: string;
  detectedEmotion: string;
  emotionConfidence: number; // 0 - 100
  sentimentValence: 'positive' | 'neutral' | 'stressed' | 'overwhelmed';
  extractedTriggers: string[];
  healingPathway: {
    relax: string;
    calm: string;
    overcome: string;
  };
  recommendedAction: string;
  targetTab: 'relax' | 'breathing' | 'games' | 'talk-mithra' | 'counselling-prep';
  recordedAt: string;
}




