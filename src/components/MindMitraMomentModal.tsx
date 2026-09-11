import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Heart,
  CheckCircle2,
  Volume2,
  VolumeX,
  ArrowRight,
  TrendingDown,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { InterventionOutcome } from '../types';

interface MindMitraMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (outcome: InterventionOutcome) => void;
  initialPreStress?: number;
  triggerReason?: string;
}

export const MindMitraMomentModal: React.FC<MindMitraMomentModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialPreStress = 78,
  triggerReason = 'Predicted High Stress Window (Pre-Internal Exams)',
}) => {
  const [phase, setPhase] = useState<'intro' | 'breathe' | 'ground' | 'affirm' | 'measure' | 'done'>('intro');
  const [preStress, setPreStress] = useState<number>(initialPreStress);
  const [postStress, setPostStress] = useState<number>(Math.max(20, initialPreStress - 22));
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  // Grounding items checked
  const [groundedItems, setGroundedItems] = useState<number[]>([]);

  // Sound generator
  const playTone = (freq: number, type: OscillatorType = 'sine', duration: number = 0.5) => {
    if (!soundEnabled) return;
    try {
      const ctx = audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioCtx) setAudioCtx(ctx);
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  };

  // 60-second master countdown when running
  useEffect(() => {
    let timer: any;
    if (isOpen && (phase === 'breathe' || phase === 'ground' || phase === 'affirm')) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setPhase('measure');
            return 0;
          }
          // Phase switching based on remaining seconds
          if (prev === 40) {
            setPhase('ground');
            playTone(520, 'sine', 0.6);
          } else if (prev === 20) {
            setPhase('affirm');
            playTone(640, 'sine', 0.8);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, phase]);

  // Breathing sub-cycle (In 4s, Hold 7s, Out 8s)
  const [breatheText, setBreatheText] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  useEffect(() => {
    if (phase !== 'breathe') return;
    const interval = setInterval(() => {
      setBreatheText((current) => {
        if (current === 'Inhale') {
          playTone(432, 'sine', 0.8);
          return 'Hold';
        }
        if (current === 'Hold') {
          playTone(392, 'sine', 0.8);
          return 'Exhale';
        }
        playTone(330, 'sine', 0.8);
        return 'Inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [phase]);

  const handleStart = () => {
    setSecondsRemaining(60);
    setPhase('breathe');
    playTone(440, 'sine', 0.6);
  };

  const handleFinishOutcome = () => {
    const outcome: InterventionOutcome = {
      id: `moment-${Date.now()}`,
      interventionType: 'mindmitra-moment',
      interventionName: '60s MindMitra Moment (Vagus + Grounding + Affirmation)',
      preStress,
      postStress,
      delta: postStress - preStress,
      timestamp: new Date().toISOString(),
      dateStr: new Date().toISOString().split('T')[0],
      feedback: postStress < preStress ? 'much-better' : 'same',
      contextTag: triggerReason,
      durationSeconds: 60,
    };
    onComplete(outcome);
    setPhase('done');
    playTone(587.33, 'sine', 0.9);
  };

  if (!isOpen) return null;

  return (
    <div
      id="mindmitra-moment-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md transition-opacity"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-teal-100 dark:border-slate-800 overflow-hidden flex flex-col"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-teal-50/50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-white font-bold text-sm shadow-sm">
              ✨
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">MindBridge Moment</h3>
              <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                60-Second Evidence-Based Micro-Intervention
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
              title={soundEnabled ? 'Mute tone' : 'Enable tone'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-600" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Progress Bar (60s countdown) */}
        {(phase === 'breathe' || phase === 'ground' || phase === 'affirm') && (
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-1000 ease-linear"
              style={{ width: `${((60 - secondsRemaining) / 60) * 100}%` }}
            />
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-center items-center text-center">
          <AnimatePresence mode="wait">
            {/* INTRO STEP */}
            {phase === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5 max-w-md"
              >
                <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 flex items-center justify-center mx-auto text-3xl shadow-inner">
                  🔮
                </div>
                <div>
                  <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-semibold rounded-full mb-2">
                    Proactive Buffer Triggered
                  </span>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                    Buffer Your High-Stress Window
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    MindBridge 360 predicted upcoming pressure from{' '}
                    <span className="font-semibold text-slate-900 dark:text-white">{triggerReason}</span>. In just 60 seconds, reset your vagus nerve and recenter before peak stress sets in.
                  </p>
                </div>

                {/* Pre-Stress Slider */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Current Stress Level
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                      {preStress} / 100
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={preStress}
                    onChange={(e) => setPreStress(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Mild Tension</span>
                    <span>Overwhelmed</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <p className="font-bold text-teal-600 dark:text-teal-400">0 - 20s</p>
                    <p>Vagus Breath</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <p className="font-bold text-teal-600 dark:text-teal-400">20 - 40s</p>
                    <p>Grounding</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <p className="font-bold text-teal-600 dark:text-teal-400">40 - 60s</p>
                    <p>Affirmation</p>
                  </div>
                </div>

                <button
                  onClick={handleStart}
                  className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-lg shadow-teal-600/25 flex items-center justify-center space-x-2 transition"
                >
                  <span>Start 60s MindMitra Moment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* STEP 1: VAGUS BREATH (0 - 20s) */}
            {phase === 'breathe' && (
              <motion.div
                key="breathe"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center space-y-6"
              >
                <div className="flex items-center space-x-2 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Step 1/3 • Vagus Reset ({secondsRemaining}s left)</span>
                </div>

                {/* Pulsing visual circle */}
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: breatheText === 'Inhale' ? 1.3 : breatheText === 'Hold' ? 1.3 : 0.85,
                      opacity: breatheText === 'Hold' ? 0.9 : 0.6,
                    }}
                    transition={{ duration: 3.8, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full bg-teal-400/20 dark:bg-teal-500/20 blur-xl"
                  />
                  <motion.div
                    animate={{
                      scale: breatheText === 'Inhale' ? 1.2 : breatheText === 'Hold' ? 1.2 : 0.8,
                    }}
                    transition={{ duration: 3.8, ease: 'easeInOut' }}
                    className="w-36 h-36 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 shadow-xl flex flex-col items-center justify-center text-white p-4"
                  >
                    <span className="text-xl font-bold tracking-wide">{breatheText}</span>
                    <span className="text-xs opacity-80 mt-1">
                      {breatheText === 'Inhale' ? 'Fill your lungs' : breatheText === 'Hold' ? 'Hold softly' : 'Release slowly'}
                    </span>
                  </motion.div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xs">
                  Drop your shoulders. Let your stomach expand naturally.
                </p>
              </motion.div>
            )}

            {/* STEP 2: SENSORY GROUNDING (20 - 40s) */}
            {phase === 'ground' && (
              <motion.div
                key="ground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 max-w-sm"
              >
                <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-full mx-auto w-fit">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Step 2/3 • 5-4-3-2-1 Sensory Grounding ({secondsRemaining}s left)</span>
                </div>

                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Anchor yourself to this room
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tap each anchor point as you notice it around you:
                </p>

                <div className="space-y-2">
                  {[
                    { id: 1, label: '👀 3 things you can see (screen, table, floor)', num: 1 },
                    { id: 2, label: '🖐️ 2 physical textures (chair fabric, keypad)', num: 2 },
                    { id: 3, label: '👂 1 sound in your room or hostel corridor', num: 3 },
                  ].map((item) => {
                    const isChecked = groundedItems.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (isChecked) {
                            setGroundedItems(groundedItems.filter((i) => i !== item.id));
                          } else {
                            setGroundedItems([...groundedItems, item.id]);
                            playTone(480 + item.num * 40, 'sine', 0.3);
                          }
                        }}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition ${
                          isChecked
                            ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 text-teal-900 dark:text-teal-200'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-300'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: AFFIRMATION (40 - 60s) */}
            {phase === 'affirm' && (
              <motion.div
                key="affirm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-5 max-w-sm"
              >
                <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-full mx-auto w-fit">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Step 3/3 • Campus Resilience Anchor ({secondsRemaining}s left)</span>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-teal-950/40 border border-teal-100 dark:border-slate-700 shadow-inner">
                  <span className="text-3xl mb-3 block">🌱</span>
                  <blockquote className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                    “One exam or viva does not define my capability. I am prepared to take this semester one manageable step at a time.”
                  </blockquote>
                  <p className="text-xs text-teal-700 dark:text-teal-300 mt-3 font-medium">
                    (ஒரு தேர்வு உங்கள் மதிப்பைத் தீர்மானிக்காது. நிதானமாக எதிர்கொள்வோம்.)
                  </p>
                </div>

                <button
                  onClick={() => setPhase('measure')}
                  className="px-4 py-2 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline"
                >
                  Continue to outcome reflection →
                </button>
              </motion.div>
            )}

            {/* STEP 4: DID IT HELP? MEASUREMENT */}
            {phase === 'measure' && (
              <motion.div
                key="measure"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5 max-w-md w-full"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
                  🎯
                </div>
                <div>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                    Closed-Loop Validation
                  </span>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    Did the 60s MindMitra Moment Help?
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Rate your stress right now to train your Personal Coping Engine.
                  </p>
                </div>

                {/* Before vs After Visualizer */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-left">
                    <span className="text-[11px] text-slate-400 block">Before Moment</span>
                    <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">{preStress}</span>
                    <span className="text-[10px] text-slate-400 block">/ 100 Stress</span>
                  </div>
                  <div className="text-left border-l border-slate-200 dark:border-slate-700 pl-3">
                    <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold block">Now</span>
                    <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">{postStress}</span>
                    <div className="flex items-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                      <span>{postStress - preStress} pts reduction</span>
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Adjust your current post-intervention level:
                    </span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">{postStress}/100</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={postStress}
                    onChange={(e) => setPostStress(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                </div>

                <button
                  onClick={handleFinishOutcome}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-teal-600/25 flex items-center justify-center space-x-2 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save to Personal Coping Engine</span>
                </button>
              </motion.div>
            )}

            {/* DONE CONFIRMATION */}
            {phase === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 max-w-sm py-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
                  ✨
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  Buffer Recorded!
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Stress reduced by <span className="font-bold text-emerald-600 dark:text-emerald-400">{preStress - postStress} points</span>. Your Personal Coping Engine has updated its ranking for future exam cycles.
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:opacity-90 transition mt-4"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Guarantee */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Encrypted in your Personal Privacy Vault</span>
          </div>
          <span>Loop 3/7: Measure</span>
        </div>
      </motion.div>
    </div>
  );
};
