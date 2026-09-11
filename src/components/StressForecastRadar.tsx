import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { AcademicEvent, StressForecast } from '../types';

interface StressForecastRadarProps {
  forecast: StressForecast;
  academicEvents: AcademicEvent[];
  onTriggerMoment: () => void;
  onAddAcademicEvent: (event: AcademicEvent) => void;
  onDeleteAcademicEvent: (id: string) => void;
}

export const StressForecastRadar: React.FC<StressForecastRadarProps> = ({
  forecast,
  academicEvents,
  onTriggerMoment,
  onAddAcademicEvent,
  onDeleteAcademicEvent,
}) => {
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<AcademicEvent['category']>('internal-exam');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventWeight, setNewEventWeight] = useState<AcademicEvent['weight']>('high');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate) return;

    const targetDate = new Date(newEventDate);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const createdEvent: AcademicEvent = {
      id: `acad-${Date.now()}`,
      title: newEventTitle.trim(),
      category: newEventCategory,
      dateStr: newEventDate,
      daysRemaining,
      weight: newEventWeight,
    };

    onAddAcademicEvent(createdEvent);
    setNewEventTitle('');
    setNewEventDate('');
    setShowEventModal(false);
  };

  const getRiskBadge = (level: StressForecast['predictedRiskLevel']) => {
    switch (level) {
      case 'peak':
        return { label: 'Peak Stress Window', color: 'bg-rose-500 text-white animate-pulse' };
      case 'high':
        return { label: 'High Surge Window', color: 'bg-amber-500 text-white' };
      case 'elevated':
        return { label: 'Elevated Pressure', color: 'bg-orange-500 text-white' };
      default:
        return { label: 'Stable Baseline', color: 'bg-teal-600 text-white' };
    }
  };

  const badge = getRiskBadge(forecast.predictedRiskLevel);

  return (
    <div className="space-y-6" id="stress-forecast-section">
      {/* 🔮 HERO CARD: Innovation #1 Stress Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white p-6 md:p-8 shadow-xl border border-teal-500/20"
      >
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Row Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300 text-base font-bold">
                🔮
              </span>
              <span className="text-xs font-bold tracking-wider uppercase text-teal-300">
                Innovation #1 • Stress Forecast Engine
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${badge.color} shadow-sm`}>
                {badge.label}
              </span>
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-800/80 text-teal-200 border border-teal-500/30">
                {forecast.confidenceScore}% AI Confidence
              </span>
            </div>
          </div>

          {/* Headline & Timeframe */}
          <div>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-snug">
              {forecast.headline}
            </h3>
            <p className="text-sm text-teal-100/80 mt-2 leading-relaxed max-w-2xl">
              {forecast.actionableInsight}
            </p>
          </div>

          {/* Contributing Factors Pills */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-teal-300/90 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Multivariate Forecast Signals Detected:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {forecast.contributingFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-2 text-xs text-slate-200 bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-xl px-3 py-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                  <span className="truncate">{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Proactive Action Trigger Banner */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-teal-900/40 border border-teal-500/30">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-teal-500 text-slate-900 font-bold shrink-0">
                <Zap className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Act Before Peak: {forecast.recommendedInterventionName}
                </h4>
                <p className="text-xs text-teal-200">
                  Historical stress reduction: <span className="font-bold text-emerald-300">{forecast.recommendedInterventionEfficacy} points</span> for your profile
                </p>
              </div>
            </div>

            <button
              id="launch-moment-btn"
              onClick={onTriggerMoment}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-xs uppercase tracking-wide shadow-lg shadow-teal-500/20 flex items-center justify-center space-x-2 transition"
            >
              <span>Launch 60s MindMitra Moment</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* 📊 CHART + ACADEMIC TIMELINE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Predicted Trajectory Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>7-Day Academic Stress Radar</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Predicted stress curve vs. historical baseline around exam dates
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-1.5 rounded-full bg-teal-500" />
                <span className="text-slate-600 dark:text-slate-400">Predicted</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="text-slate-400">Baseline</span>
              </div>
            </div>
          </div>

          {/* Area Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast.trajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="dayLabel"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  ticks={[25, 50, 75, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any) => [
                    `${value}/100`,
                    name === 'predictedStress' ? 'Predicted Stress' : 'Historical Baseline',
                  ]}
                />
                <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Elevated Threshold', fill: '#f43f5e', fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey="historicalBaseline"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#baselineGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="predictedStress"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#predictedGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              100% Student-Controlled Private Forecast
            </span>
            <span className="font-semibold text-teal-700 dark:text-teal-300">
              Peak Stress Risk: Fri (IA-2)
            </span>
          </div>
        </div>

        {/* Right Col: Academic Milestones & Exam Calendar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Academic Timeline</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Synced with forecasting model
                </p>
              </div>

              <button
                onClick={() => setShowEventModal(true)}
                className="p-1.5 text-xs font-semibold rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition flex items-center gap-1"
                title="Add exam/viva milestone"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* List of Events */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {academicEvents.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 flex items-start justify-between gap-2 text-left transition hover:border-teal-300"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          item.weight === 'critical'
                            ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                            : item.weight === 'high'
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                            : 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300'
                        }`}
                      >
                        {item.category.replace('-', ' ')}
                      </span>
                      <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400">
                        {item.daysRemaining === 0 ? 'Today' : `in ${item.daysRemaining}d`}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {item.title}
                    </p>
                    {item.notes && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteAcademicEvent(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition rounded shrink-0"
                    title="Remove event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center italic">
            Adding your specific IA/Viva dates refines early warning alerts.
          </p>
        </div>
      </div>

      {/* ADD ACADEMIC EVENT MODAL */}
      <AnimatePresence>
        {showEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Academic Milestone
                </h4>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Event Title / Subject
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Operating Systems IA-2 or Viva"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newEventCategory}
                      onChange={(e) => setNewEventCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="internal-exam">Internal Assessment (IA)</option>
                      <option value="lab-viva">Lab Viva</option>
                      <option value="semester-final">Semester Finals</option>
                      <option value="placement-drive">Placement Drive</option>
                      <option value="project-review">Project Review</option>
                      <option value="arrear-exam">Arrear Exam</option>
                      <option value="assignment">Assignment Deadline</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Event Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stress Weight
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['moderate', 'high', 'critical'] as const).map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setNewEventWeight(w)}
                        className={`py-2 rounded-xl text-xs font-bold capitalize transition ${
                          newEventWeight === w
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow"
                  >
                    Save Event
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
