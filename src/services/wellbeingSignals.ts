import { CheckinData, AcademicEvent } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface WellbeingSignal {
  id: 'frequency_drop' | 'sentiment_shift' | 'exam_proximity' | 'late_night_usage';
  label: string;
  explanation: string;
  detail: string;
  weight: number; // 0.1 to 1.0
  severity: 'gentle' | 'notable';
  icon: string;
}

export interface WellbeingEvaluation {
  shouldSurface: boolean;
  overallScore: number;
  signals: WellbeingSignal[];
  primaryContext: string;
  suggestedPracticeTopic: string;
  evaluatedAt: string;
}

/**
 * Plain-language, transparent signal scoring rule.
 * Inspectable, non-blackbox, completely non-diagnostic.
 * Evaluates observable patterns:
 * (a) drop in check-in frequency over 7-14 days
 * (b) shift toward elevated stress / anxious sentiment in check-in notes
 * (c) proximity to upcoming exams / placement deadlines
 * (d) late-night app usage patterns
 */
export const evaluateWellbeingSignals = (
  checkins: CheckinData[],
  academicEvents: AcademicEvent[],
  recentUsageHours?: number[]
): WellbeingEvaluation => {
  const firedSignals: WellbeingSignal[] = [];
  const now = new Date();

  // (a) Frequency Drop Check (7 - 14 days)
  if (checkins.length > 0) {
    const sortedCheckins = [...checkins].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const mostRecentTime = new Date(sortedCheckins[0].timestamp).getTime();
    const daysSinceLastCheckin = (now.getTime() - mostRecentTime) / (1000 * 60 * 60 * 24);

    // Count how many checkins occurred in the past 7 days vs previous 7-14 days
    const past7DaysCount = sortedCheckins.filter((c) => {
      const diff = (now.getTime() - new Date(c.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }).length;

    const prev7DaysCount = sortedCheckins.filter((c) => {
      const diff = (now.getTime() - new Date(c.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      return diff > 7 && diff <= 14;
    }).length;

    if (daysSinceLastCheckin >= 3.5 || (prev7DaysCount >= 3 && past7DaysCount <= 1)) {
      firedSignals.push({
        id: 'frequency_drop',
        label: 'Check-in rhythm has slowed',
        explanation: "You've checked in less frequently this week compared to your usual rhythm.",
        detail: daysSinceLastCheckin >= 3.5 
          ? `It has been ${Math.round(daysSinceLastCheckin)} days since your last reflection.`
          : `You checked in ${past7DaysCount} time this week compared to ${prev7DaysCount} last week.`,
        weight: 0.35,
        severity: 'gentle',
        icon: 'Activity',
      });
    }
  } else {
    // If brand new with no checkins yet
    firedSignals.push({
      id: 'frequency_drop',
      label: 'Getting started together',
      explanation: "You haven't logged a daily reflection yet this week.",
      detail: 'Starting with a quick 30-second pulse helps Mitra learn your rhythms.',
      weight: 0.25,
      severity: 'gentle',
      icon: 'Calendar',
    });
  }

  // (b) Shift toward elevated stress or heavy sentiment in recent checkins
  if (checkins.length > 0) {
    const recentCheckins = checkins.slice(0, 5);
    const highStressCount = recentCheckins.filter(c => c.stress >= 4).length;
    const avgStress = recentCheckins.reduce((acc, c) => acc + c.stress, 0) / recentCheckins.length;

    const anxiousKeywords = ['overwhelm', 'anxious', 'scared', 'tired', 'cant sleep', "can't sleep", 'failing', 'stuck', 'alone', 'panic', 'deadline', 'viva', 'arrear'];
    const hasAnxiousNotes = recentCheckins.some(c => 
      c.journalNote && anxiousKeywords.some(k => c.journalNote!.toLowerCase().includes(k))
    );

    if (avgStress >= 3.4 || highStressCount >= 2 || hasAnxiousNotes) {
      firedSignals.push({
        id: 'sentiment_shift',
        label: 'Stress signals noted in recent reflections',
        explanation: 'Your recent check-in reflections indicate higher stress or heavier emotional workload.',
        detail: hasAnxiousNotes 
          ? 'Journal notes mentioned feeling pressed for time or tired.'
          : `Average stress level reported at ${avgStress.toFixed(1)}/5 in recent days.`,
        weight: 0.45,
        severity: 'notable',
        icon: 'Sparkles',
      });
    }
  }

  // (c) Proximity to exam / placement dates from existing academic calendar
  if (academicEvents && academicEvents.length > 0) {
    const upcomingCrucial = academicEvents.filter(e => {
      const days = typeof e.daysRemaining === 'number' ? e.daysRemaining : 99;
      return days >= 0 && days <= 10;
    }).sort((a, b) => (a.daysRemaining || 0) - (b.daysRemaining || 0));

    if (upcomingCrucial.length > 0) {
      const nextEvent = upcomingCrucial[0];
      const countText = upcomingCrucial.length === 1 
        ? `"${nextEvent.title}" is in ${nextEvent.daysRemaining} days`
        : `${upcomingCrucial.length} major milestones approaching (closest: "${nextEvent.title}" in ${nextEvent.daysRemaining} days)`;

      firedSignals.push({
        id: 'exam_proximity',
        label: 'Upcoming academic pressure milestone',
        explanation: `${countText} on your academic timeline.`,
        detail: `Preparing mental space before ${nextEvent.category.replace('-', ' ')} deadlines helps mitigate acute anxiety.`,
        weight: 0.50,
        severity: nextEvent.daysRemaining <= 4 ? 'notable' : 'gentle',
        icon: 'GraduationCap',
      });
    }
  }

  // (d) Late-night app usage (e.g. between 12:30 AM and 5:00 AM)
  const currentHour = now.getHours();
  const isLateNightNow = currentHour >= 0 && currentHour < 5;
  const hasLateNightHistory = recentUsageHours && recentUsageHours.some(h => h >= 0 && h < 5);

  if (isLateNightNow || hasLateNightHistory) {
    firedSignals.push({
      id: 'late_night_usage',
      label: 'Late-night activity detected',
      explanation: 'You are using the app during late night or early morning quiet hours.',
      detail: 'Disrupted sleep schedules or late-night study cycles frequently compound cognitive fatigue.',
      weight: 0.3,
      severity: 'gentle',
      icon: 'Moon',
    });
  }

  // Inspectable weighted score (conservative threshold)
  const overallScore = firedSignals.reduce((sum, s) => sum + s.weight, 0);

  // Suggested rehearsal / talk context formatted in clear, plain language
  const contextParts: string[] = [];
  if (firedSignals.some(s => s.id === 'exam_proximity')) {
    contextParts.push('upcoming academic pressure & exam timelines');
  }
  if (firedSignals.some(s => s.id === 'sentiment_shift')) {
    contextParts.push('feeling overwhelmed or emotionally tired lately');
  }
  if (firedSignals.some(s => s.id === 'frequency_drop')) {
    contextParts.push('stepping away from daily reflection rhythms');
  }
  if (firedSignals.some(s => s.id === 'late_night_usage')) {
    contextParts.push('late-night study fatigue and sleep disruptions');
  }

  const primaryContext = contextParts.length > 0 
    ? contextParts.join(', ')
    : 'general campus wellbeing check-in';

  const suggestedPracticeTopic = contextParts.length > 0
    ? `I've been dealing with ${primaryContext}. It's making it tough to focus and I wanted to talk about managing this.`
    : "I've been feeling a bit off recently and wanted to practice talking about what's on my mind.";

  // Conservative threshold: requires either 1 notable signal or >= 2 gentle signals
  const shouldSurface = firedSignals.length > 0 && overallScore >= 0.35;

  return {
    shouldSurface,
    overallScore,
    signals: firedSignals,
    primaryContext,
    suggestedPracticeTopic,
    evaluatedAt: now.toISOString(),
  };
};

/**
 * Persist fired signals to the NEW dedicated Firestore collection:
 * `wellbeingNudges/{studentId}/signals/{autoId}`
 * Completely isolated from Admin Radar and all existing collections.
 */
export const recordNudgeSignalInFirestore = async (
  studentId: string,
  evaluation: WellbeingEvaluation
) => {
  try {
    // Only attempt Firestore write if user is authenticated with Firebase
    if (auth.currentUser && db && studentId && evaluation.signals.length > 0) {
      const nudgeColRef = collection(db, 'wellbeingNudges', studentId, 'signals');
      await addDoc(nudgeColRef, {
        studentId,
        overallScore: evaluation.overallScore,
        signals: evaluation.signals.map(s => ({
          id: s.id,
          label: s.label,
          explanation: s.explanation,
          severity: s.severity,
          weight: s.weight,
        })),
        primaryContext: evaluation.primaryContext,
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    // Fail quietly — never break UI for telemetry/nudge storage
    console.info('Private wellbeing nudge recorded locally:', err);
  }
};
