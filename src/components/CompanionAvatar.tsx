import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CompanionAvatarType, CompanionEmotion } from '../types';

export type AvatarAnimationState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface CompanionAvatarProps {
  avatar: CompanionAvatarType;
  emotion?: CompanionEmotion;
  state?: AvatarAnimationState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isAnimated?: boolean;
  lipSyncValue?: number; // 0 to 1 open amount or viseme
}

export const CompanionAvatar: React.FC<CompanionAvatarProps> = ({
  avatar = 'blob',
  emotion = 'happy',
  state = 'idle',
  size = 'md',
  className = '',
  isAnimated = true,
  lipSyncValue,
}) => {
  const safeAvatar = avatar || 'blob';
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-44 h-44',
  };

  // State-driven Eye Movement (Natural Saccades & Blinking)
  const [isBlinking, setIsBlinking] = useState(false);
  const [eyeGaze, setEyeGaze] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [visemeFrame, setVisemeFrame] = useState(0);

  // Natural Blinking Loop
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const scheduleNextBlink = () => {
      const delay = 2500 + Math.random() * 3500;
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 180);
      }, delay);
    };

    scheduleNextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Natural Eye Saccades based on state
  useEffect(() => {
    if (state === 'thinking') {
      // In thinking state: eyes look thoughtfully upward-left or upward-right
      setEyeGaze({ x: -2.5, y: -2.5 });
      return;
    }

    if (state === 'listening') {
      // In listening state: eyes lock attentively forward, slightly downward towards user
      setEyeGaze({ x: 0, y: 1 });
      return;
    }

    if (state === 'speaking') {
      // In speaking state: dynamic empathetic gaze with slight expressive shifts
      const interval = setInterval(() => {
        const xShift = (Math.random() - 0.5) * 1.5;
        const yShift = (Math.random() - 0.5) * 1;
        setEyeGaze({ x: xShift, y: yShift });
      }, 800);
      return () => clearInterval(interval);
    }

    // Default 'idle' state: periodic gentle glancing
    const interval = setInterval(() => {
      const glances = [
        { x: 0, y: 0 },
        { x: 1.5, y: 0 },
        { x: -1.5, y: 0 },
        { x: 0, y: -1 },
        { x: 0, y: 0 },
      ];
      const nextGaze = glances[Math.floor(Math.random() * glances.length)];
      setEyeGaze(nextGaze);
    }, 2800);

    return () => clearInterval(interval);
  }, [state]);

  // Lip-Sync Simulation Oscillator when Speaking
  useEffect(() => {
    if (state !== 'speaking') {
      setVisemeFrame(0);
      return;
    }

    // Viseme cycling: 0 = closed/small, 1 = open 'ah', 2 = rounded 'oh', 3 = wide 'ee'
    const visemePatterns = [1, 2, 0, 3, 1, 0, 2, 1, 3, 0];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % visemePatterns.length;
      setVisemeFrame(visemePatterns[index]);
    }, 120);

    return () => clearInterval(interval);
  }, [state]);

  // Derived effective emotion / posture based on state
  const effectiveEmotion: CompanionEmotion = (
    state === 'listening'
      ? 'listening'
      : state === 'thinking'
      ? 'concerned'
      : state === 'speaking'
      ? 'happy'
      : (emotion || 'happy')
  ) as CompanionEmotion;

  // Variants for animations based on state & emotion
  const getAnimationVariants = () => {
    if (!isAnimated) return {};

    if (state === 'listening') {
      return {
        animate: {
          scale: [1, 1.06, 1],
          y: [0, -3, 0],
          rotate: [0, 2.5, -1, 0],
          transition: { repeat: Infinity, duration: 2.0, ease: 'easeInOut' },
        },
      };
    }

    if (state === 'thinking') {
      return {
        animate: {
          rotate: [-3, 3, -3],
          y: [0, -4, 0],
          scale: [0.98, 1.02, 0.98],
          transition: { repeat: Infinity, duration: 2.6, ease: 'easeInOut' },
        },
      };
    }

    if (state === 'speaking') {
      return {
        animate: {
          y: [0, -5, 0, -3, 0],
          rotate: [0, 1.5, -1.5, 0],
          scale: [1, 1.03, 1],
          transition: { repeat: Infinity, duration: 1.4, ease: 'easeInOut' },
        },
      };
    }

    // Idle
    switch (effectiveEmotion) {
      case 'happy':
        return {
          animate: {
            y: [0, -5, 0],
            rotate: [0, 1.5, -1.5, 0],
            transition: { repeat: Infinity, duration: 3.2, ease: 'easeInOut' },
          },
        };
      case 'celebrating':
        return {
          animate: {
            y: [0, -12, 0],
            scale: [1, 1.08, 1],
            rotate: [0, -5, 5, 0],
            transition: { repeat: Infinity, duration: 1.2, ease: 'easeOut' },
          },
        };
      case 'concerned':
        return {
          animate: {
            rotate: [-2, 2, -2],
            scale: [0.98, 1, 0.98],
            transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
          },
        };
      case 'listening':
        return {
          animate: {
            scale: [1, 1.05, 1],
            rotate: [0, 3, 0],
            transition: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' },
          },
        };
      case 'sleepy':
        return {
          animate: {
            y: [0, 3, 0],
            scale: [1, 0.97, 1],
            transition: { repeat: Infinity, duration: 5, ease: 'easeInOut' },
          },
        };
      case 'breathing':
        return {
          animate: {
            scale: [0.9, 1.14, 0.9],
            transition: { repeat: Infinity, duration: 6, ease: 'easeInOut' },
          },
        };
      default:
        return {
          animate: {
            y: [0, -4, 0],
            transition: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' },
          },
        };
    }
  };

  // Eyes rendering with natural blinking & saccade eye gaze tracking
  const renderEyes = (cx1: number, cx2: number, cy: number, radius = 4) => {
    // If blinking, show closed crescent eyes
    if (isBlinking) {
      return (
        <g stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d={`M ${cx1 - 4.5} ${cy} Q ${cx1} ${cy + 3} ${cx1 + 4.5} ${cy}`} />
          <path d={`M ${cx2 - 4.5} ${cy} Q ${cx2} ${cy + 3} ${cx2 + 4.5} ${cy}`} />
        </g>
      );
    }

    if (state === 'thinking') {
      return (
        <g>
          {/* Eyebrows angled in deep thoughtful curiosity */}
          <path d={`M ${cx1 - 5} ${cy - 7} L ${cx1 + 3} ${cy - 9}`} stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          <path d={`M ${cx2 + 5} ${cy - 7} L ${cx2 - 3} ${cy - 9}`} stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          {/* Eye whites/base */}
          <circle cx={cx1} cy={cy} r={radius * 1.05} fill="#1e293b" />
          <circle cx={cx2} cy={cy} r={radius * 1.05} fill="#1e293b" />
          {/* Pupil looking up-left */}
          <circle cx={cx1 + eyeGaze.x} cy={cy + eyeGaze.y} r={radius / 2.2} fill="#ffffff" />
          <circle cx={cx2 + eyeGaze.x} cy={cy + eyeGaze.y} r={radius / 2.2} fill="#ffffff" />
        </g>
      );
    }

    if (state === 'listening' || effectiveEmotion === 'listening') {
      return (
        <g>
          {/* Wide, attentive eyes with sparkle */}
          <circle cx={cx1} cy={cy} r={radius * 1.25} fill="#0f766e" />
          <circle cx={cx2} cy={cy} r={radius * 1.25} fill="#0f766e" />
          <circle cx={cx1 + eyeGaze.x - 1.5} cy={cy + eyeGaze.y - 1.5} r={radius / 1.8} fill="#ffffff" />
          <circle cx={cx2 + eyeGaze.x - 1.5} cy={cy + eyeGaze.y - 1.5} r={radius / 1.8} fill="#ffffff" />
          <circle cx={cx1 + eyeGaze.x + 1.2} cy={cy + eyeGaze.y + 1.2} r={radius / 3.5} fill="#ffffff" />
          <circle cx={cx2 + eyeGaze.x + 1.2} cy={cy + eyeGaze.y + 1.2} r={radius / 3.5} fill="#ffffff" />
        </g>
      );
    }

    if (effectiveEmotion === 'sleepy') {
      return (
        <g stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d={`M ${cx1 - 5} ${cy} Q ${cx1} ${cy + 4} ${cx1 + 5} ${cy}`} />
          <path d={`M ${cx2 - 5} ${cy} Q ${cy + 4} ${cx2 + 5} ${cy}`} />
        </g>
      );
    }

    if (effectiveEmotion === 'happy' || effectiveEmotion === 'celebrating') {
      return (
        <g stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d={`M ${cx1 - 5} ${cy} Q ${cx1} ${cy - 5} ${cx1 + 5} ${cy}`} />
          <path d={`M ${cx2 - 5} ${cy} Q ${cx2} ${cy - 5} ${cx2 + 5} ${cy}`} />
        </g>
      );
    }

    if (effectiveEmotion === 'concerned') {
      return (
        <g>
          {/* Eyebrows angled with care */}
          <path d={`M ${cx1 - 6} ${cy - 7} L ${cx1 + 4} ${cy - 10}`} stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          <path d={`M ${cx2 + 6} ${cy - 7} L ${cx2 - 4} ${cy - 10}`} stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          <circle cx={cx1} cy={cy} r={radius} fill="#1e293b" />
          <circle cx={cx2} cy={cy} r={radius} fill="#1e293b" />
          <circle cx={cx1 + eyeGaze.x - 1.5} cy={cy + eyeGaze.y - 1.5} r={radius / 2.5} fill="#ffffff" />
          <circle cx={cx2 + eyeGaze.x - 1.5} cy={cy + eyeGaze.y - 1.5} r={radius / 2.5} fill="#ffffff" />
        </g>
      );
    }

    // Default neutral/curious with active gaze tracking
    return (
      <g>
        <circle cx={cx1} cy={cy} r={radius} fill="#1e293b" />
        <circle cx={cx2} cy={cy} r={radius} fill="#1e293b" />
        <circle cx={cx1 + eyeGaze.x - 1.2} cy={cy + eyeGaze.y - 1.2} r={radius / 2.4} fill="#ffffff" />
        <circle cx={cx2 + eyeGaze.x - 1.2} cy={cy + eyeGaze.y - 1.2} r={radius / 2.4} fill="#ffffff" />
      </g>
    );
  };

  // Mouth rendering with dynamic Lip-Sync Simulation
  const renderMouth = (cx: number, cy: number) => {
    // 1. Dynamic Lip-Sync Simulation during 'speaking' state
    if (state === 'speaking') {
      const activeViseme = lipSyncValue !== undefined ? Math.round(lipSyncValue * 3) : visemeFrame;

      switch (activeViseme) {
        case 1: // Medium Open (Ah / Eh)
          return (
            <g>
              <ellipse cx={cx} cy={cy + 2.5} rx="5.5" ry="4.5" fill="#f43f5e" stroke="#1e293b" strokeWidth="1.8" />
              <ellipse cx={cx} cy={cy + 4.2} rx="3.5" ry="2" fill="#fb7185" />
            </g>
          );
        case 2: // Rounded Open (Oh / Oo)
          return (
            <g>
              <circle cx={cx} cy={cy + 2.5} r="4" fill="#f43f5e" stroke="#1e293b" strokeWidth="1.8" />
              <circle cx={cx} cy={cy + 3.2} r="2" fill="#fb7185" />
            </g>
          );
        case 3: // Wide Open (Happy Ahh)
          return (
            <g>
              <path
                d={`M ${cx - 7} ${cy + 0.5} Q ${cx} ${cy + 8} ${cx + 7} ${cy + 0.5} Z`}
                fill="#f43f5e"
                stroke="#1e293b"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d={`M ${cx - 4} ${cy + 5.5} Q ${cx} ${cy + 7.5} ${cx + 4} ${cy + 5.5}`} stroke="#ffffff" strokeWidth="1.5" fill="none" />
            </g>
          );
        case 0:
        default: // Small smile / resting consonant
          return (
            <path
              d={`M ${cx - 5} ${cy + 1} Q ${cx} ${cy + 5} ${cx + 5} ${cy + 1}`}
              stroke="#1e293b"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          );
      }
    }

    // 2. Listening state mouth (attentive small 'o')
    if (state === 'listening' || effectiveEmotion === 'listening') {
      return <circle cx={cx} cy={cy + 2} r="3" fill="#1e293b" opacity="0.8" />;
    }

    // 3. Thinking state mouth (thoughtful small pout/line)
    if (state === 'thinking') {
      return (
        <path
          d={`M ${cx - 4} ${cy + 2} Q ${cx} ${cy + 0.5} ${cx + 4} ${cy + 2}`}
          stroke="#1e293b"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      );
    }

    if (effectiveEmotion === 'celebrating' || effectiveEmotion === 'happy') {
      return (
        <path
          d={`M ${cx - 7} ${cy} Q ${cx} ${cy + 8} ${cx + 7} ${cy}`}
          stroke="#1e293b"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="#f43f5e"
        />
      );
    }

    if (effectiveEmotion === 'concerned') {
      return (
        <path
          d={`M ${cx - 5} ${cy + 4} Q ${cx} ${cy + 1} ${cx + 5} ${cy + 4}`}
          stroke="#1e293b"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      );
    }

    // Default gentle smile
    return (
      <path
        d={`M ${cx - 5} ${cy + 1} Q ${cx} ${cy + 5} ${cx + 5} ${cy + 1}`}
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    );
  };

  // Cheeks
  const renderCheeks = (x1: number, x2: number, y: number) => (
    <g opacity="0.65">
      <ellipse cx={x1} cy={y} rx="5.5" ry="3.2" fill="#fb7185" />
      <ellipse cx={x2} cy={y} rx="5.5" ry="3.2" fill="#fb7185" />
    </g>
  );

  // Human-like Eyebrows that adapt to state & emotion
  const renderHumanBrows = (
    x1: number,
    x2: number,
    y: number,
    gender: 'female' | 'male' = 'female'
  ) => {
    const strokeW = gender === 'male' ? 2.4 : 1.8;
    const color = gender === 'male' ? '#1E1B18' : '#261C19';

    if (state === 'thinking') {
      // Thoughtful, tilted brows (left brow raised, right brow furrowed)
      return (
        <g stroke={color} strokeWidth={strokeW} strokeLinecap="round" fill="none">
          <path d={`M ${x1 - 6} ${y + 1} Q ${x1} ${y - 4} ${x1 + 6} ${y - 1}`} />
          <path d={`M ${x2 - 6} ${y - 3} Q ${x2} ${y - 5} ${x2 + 6} ${y + 1}`} />
        </g>
      );
    }

    if (state === 'listening' || effectiveEmotion === 'listening') {
      // Raised attentive brows (curious and deeply present)
      return (
        <g stroke={color} strokeWidth={strokeW} strokeLinecap="round" fill="none">
          <path d={`M ${x1 - 6} ${y - 2} Q ${x1} ${y - 5} ${x1 + 6} ${y - 2}`} />
          <path d={`M ${x2 - 6} ${y - 2} Q ${x2} ${y - 5} ${x2 + 6} ${y - 2}`} />
        </g>
      );
    }

    if (effectiveEmotion === 'concerned') {
      // Empathetic, caring inner-raised brows
      return (
        <g stroke={color} strokeWidth={strokeW} strokeLinecap="round" fill="none">
          <path d={`M ${x1 - 6} ${y} Q ${x1} ${y - 4} ${x1 + 6} ${y - 3}`} />
          <path d={`M ${x2 - 6} ${y - 3} Q ${x2} ${y - 4} ${x2 + 6} ${y}`} />
        </g>
      );
    }

    // Default gentle relaxed arch
    return (
      <g stroke={color} strokeWidth={strokeW} strokeLinecap="round" fill="none">
        <path d={`M ${x1 - 6} ${y} Q ${x1} ${y - 3.5} ${x1 + 6} ${y}`} />
        <path d={`M ${x2 - 6} ${y} Q ${x2} ${y - 3.5} ${x2 + 6} ${y}`} />
      </g>
    );
  };

  // Human-like Realistic Eyes (with sclera, amber/brown iris, light reflections, eyelid folds, and blinking)
  const renderHumanEyes = (
    cx1: number,
    cx2: number,
    cy: number,
    gender: 'female' | 'male' = 'female'
  ) => {
    // 1. Blinking State: Smooth curved closed eyelids with eyelashes
    if (isBlinking) {
      return (
        <g stroke="#1F1A17" strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d={`M ${cx1 - 6.5} ${cy} Q ${cx1} ${cy + 3.8} ${cx1 + 6.5} ${cy}`} />
          <path d={`M ${cx2 - 6.5} ${cy} Q ${cx2} ${cy + 3.8} ${cx2 + 6.5} ${cy}`} />
          {gender === 'female' && (
            <>
              {/* Subtle delicate eyelashes */}
              <path d={`M ${cx1 + 4.5} ${cy + 1} L ${cx1 + 7.5} ${cy - 1}`} strokeWidth="1.2" />
              <path d={`M ${cx2 - 4.5} ${cy + 1} L ${cx2 - 7.5} ${cy - 1}`} strokeWidth="1.2" />
            </>
          )}
        </g>
      );
    }

    // Gaze offsets
    const gx = eyeGaze.x;
    const gy = eyeGaze.y;

    const irisColor = gender === 'male' ? '#3B261D' : '#45261C';
    const pupilColor = '#120D0A';

    return (
      <g>
        {/* Upper eyelid crease / fold */}
        <path
          d={`M ${cx1 - 6.5} ${cy - 4} Q ${cx1} ${cy - 5.5} ${cx1 + 6.5} ${cy - 4}`}
          stroke="#B37E5C"
          strokeWidth="0.8"
          fill="none"
          opacity="0.75"
        />
        <path
          d={`M ${cx2 - 6.5} ${cy - 4} Q ${cx2} ${cy - 5.5} ${cx2 + 6.5} ${cy - 4}`}
          stroke="#B37E5C"
          strokeWidth="0.8"
          fill="none"
          opacity="0.75"
        />

        {/* Eye 1 (Left Eye) Sclera */}
        <clipPath id={`humanEyeClip1-${gender}`}>
          <path d={`M ${cx1 - 6.5} ${cy} C ${cx1 - 3} ${cy - 4.5}, ${cx1 + 3} ${cy - 4.5}, ${cx1 + 6.5} ${cy} C ${cx1 + 3} ${cy + 4.5}, ${cx1 - 3} ${cy + 4.5}, ${cx1 - 6.5} ${cy} Z`} />
        </clipPath>
        {/* Eye 2 (Right Eye) Sclera */}
        <clipPath id={`humanEyeClip2-${gender}`}>
          <path d={`M ${cx2 - 6.5} ${cy} C ${cx2 - 3} ${cy - 4.5}, ${cx2 + 3} ${cy - 4.5}, ${cx2 + 6.5} ${cy} C ${cx2 + 3} ${cy + 4.5}, ${cx2 - 3} ${cy + 4.5}, ${cx2 - 6.5} ${cy} Z`} />
        </clipPath>

        {/* Eye 1 Base */}
        <path
          d={`M ${cx1 - 6.5} ${cy} C ${cx1 - 3} ${cy - 4.5}, ${cx1 + 3} ${cy - 4.5}, ${cx1 + 6.5} ${cy} C ${cx1 + 3} ${cy + 4.5}, ${cx1 - 3} ${cy + 4.5}, ${cx1 - 6.5} ${cy} Z`}
          fill="#FAF6F0"
          stroke="#7A533E"
          strokeWidth="0.6"
        />
        {/* Eye 2 Base */}
        <path
          d={`M ${cx2 - 6.5} ${cy} C ${cx2 - 3} ${cy - 4.5}, ${cx2 + 3} ${cy - 4.5}, ${cx2 + 6.5} ${cy} C ${cx2 + 3} ${cy + 4.5}, ${cx2 - 3} ${cy + 4.5}, ${cx2 - 6.5} ${cy} Z`}
          fill="#FAF6F0"
          stroke="#7A533E"
          strokeWidth="0.6"
        />

        {/* Eye 1 Iris & Pupil with Saccade Tracking */}
        <g clipPath={`url(#humanEyeClip1-${gender})`}>
          {/* Iris outer */}
          <circle cx={cx1 + gx} cy={cy + gy} r="3.6" fill={irisColor} />
          {/* Pupil */}
          <circle cx={cx1 + gx} cy={cy + gy} r="2.1" fill={pupilColor} />
          {/* Primary light reflection / sparkle */}
          <circle cx={cx1 + gx - 1.1} cy={cy + gy - 1.1} r="0.95" fill="#FFFFFF" opacity="0.95" />
          {/* Secondary soft reflection */}
          <circle cx={cx1 + gx + 1.1} cy={cy + gy + 1.1} r="0.5" fill="#FFFFFF" opacity="0.6" />
        </g>

        {/* Eye 2 Iris & Pupil with Saccade Tracking */}
        <g clipPath={`url(#humanEyeClip2-${gender})`}>
          {/* Iris outer */}
          <circle cx={cx2 + gx} cy={cy + gy} r="3.6" fill={irisColor} />
          {/* Pupil */}
          <circle cx={cx2 + gx} cy={cy + gy} r="2.1" fill={pupilColor} />
          {/* Primary light reflection / sparkle */}
          <circle cx={cx2 + gx - 1.1} cy={cy + gy - 1.1} r="0.95" fill="#FFFFFF" opacity="0.95" />
          {/* Secondary soft reflection */}
          <circle cx={cx2 + gx + 1.1} cy={cy + gy + 1.1} r="0.5" fill="#FFFFFF" opacity="0.6" />
        </g>

        {/* Upper Eyelash line for natural framing */}
        <path
          d={`M ${cx1 - 6.8} ${cy} C ${cx1 - 3} ${cy - 4.8}, ${cx1 + 3} ${cy - 4.8}, ${cx1 + 6.8} ${cy}`}
          stroke="#1F1A17"
          strokeWidth={gender === 'female' ? '1.8' : '1.3'}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M ${cx2 - 6.8} ${cy} C ${cx2 - 3} ${cy - 4.8}, ${cx2 + 3} ${cy - 4.8}, ${cx2 + 6.8} ${cy}`}
          stroke="#1F1A17"
          strokeWidth={gender === 'female' ? '1.8' : '1.3'}
          strokeLinecap="round"
          fill="none"
        />

        {/* Eyelash flicks for Mithra */}
        {gender === 'female' && (
          <>
            <path d={`M ${cx1 + 5.5} ${cy - 1} L ${cx1 + 8.2} ${cy - 3}`} stroke="#1F1A17" strokeWidth="1.2" strokeLinecap="round" />
            <path d={`M ${cx2 - 5.5} ${cy - 1} L ${cx2 - 8.2} ${cy - 3}`} stroke="#1F1A17" strokeWidth="1.2" strokeLinecap="round" />
          </>
        )}
      </g>
    );
  };

  // Human-like Realistic Lip-Sync Visemes for Natural Speech
  const renderHumanMouth = (
    cx: number,
    cy: number,
    gender: 'female' | 'male' = 'female'
  ) => {
    const lipBaseColor = gender === 'female' ? '#E17066' : '#C87B6A';
    const lipDark = gender === 'female' ? '#B8453D' : '#9E5245';
    const lipHighlight = gender === 'female' ? '#F6A89F' : '#EAA99E';

    // 1. Dynamic Lip-Sync Viseme Animation when Speaking
    if (state === 'speaking') {
      const activeViseme = lipSyncValue !== undefined ? Math.round(lipSyncValue * 5) : visemeFrame;

      switch (activeViseme) {
        case 1: // Viseme: Ah / Open Vowel (A, Ka, Na, etc.)
          return (
            <g>
              {/* Mouth Cavity */}
              <ellipse cx={cx} cy={cy + 2.5} rx="6" ry="4.5" fill="#4A141A" stroke={lipDark} strokeWidth="1" />
              {/* Upper Teeth */}
              <path d={`M ${cx - 4} ${cy + 0.8} Q ${cx} ${cy + 1.8} ${cx + 4} ${cy + 0.8}`} stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
              {/* Tongue Base */}
              <ellipse cx={cx} cy={cy + 4.8} rx="3.8" ry="2" fill="#E26D68" />
              {/* Upper Lip Contour */}
              <path d={`M ${cx - 6.5} ${cy} Q ${cx - 2} ${cy - 1.2} ${cx} ${cy} Q ${cx + 2} ${cy - 1.2} ${cx + 6.5} ${cy}`} stroke={lipBaseColor} strokeWidth="1.6" strokeLinecap="round" fill="none" />
              {/* Lower Lip Contour */}
              <path d={`M ${cx - 5.5} ${cy + 4.5} Q ${cx} ${cy + 7.5} ${cx + 5.5} ${cy + 4.5}`} stroke={lipBaseColor} strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          );

        case 2: // Viseme: Oh / Rounded Vowel (O, U, Po, etc.)
          return (
            <g>
              {/* Rounded Cavity */}
              <ellipse cx={cx} cy={cy + 2.5} rx="4" ry="4.2" fill="#4A141A" stroke={lipDark} strokeWidth="1.2" />
              {/* Tongue depth */}
              <ellipse cx={cx} cy={cy + 4} rx="2.5" ry="1.6" fill="#D45C57" />
              {/* Rounded Outer Lips */}
              <ellipse cx={cx} cy={cy + 2.5} rx="5.2" ry="5.5" fill="none" stroke={lipBaseColor} strokeWidth="1.8" />
            </g>
          );

        case 3: // Viseme: Ee / Wide Smile (E, I, Che, etc.)
          return (
            <g>
              {/* Wide Oral Opening */}
              <path d={`M ${cx - 7.5} ${cy + 1} Q ${cx} ${cy + 5.5} ${cx + 7.5} ${cy + 1} Q ${cx} ${cy - 0.5} ${cx - 7.5} ${cy + 1} Z`} fill="#4A141A" stroke={lipDark} strokeWidth="0.8" />
              {/* Clean White Teeth Band */}
              <path d={`M ${cx - 5.5} ${cy + 2} Q ${cx} ${cy + 3.2} ${cx + 5.5} ${cy + 2}`} stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
              {/* Upper Lip */}
              <path d={`M ${cx - 8} ${cy} Q ${cx} ${cy - 1.5} ${cx + 8} ${cy}`} stroke={lipBaseColor} strokeWidth="1.5" strokeLinecap="round" fill="none" />
              {/* Lower Lip */}
              <path d={`M ${cx - 6} ${cy + 3.5} Q ${cx} ${cy + 6.2} ${cx + 6} ${cy + 3.5}`} stroke={lipBaseColor} strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          );

        case 4: // Viseme: M / B / P (Closed pressed lips)
          return (
            <g>
              {/* Pressed Lip Line */}
              <path d={`M ${cx - 6} ${cy + 1.5} Q ${cx} ${cy + 2.2} ${cx + 6} ${cy + 1.5}`} stroke="#3D1D18" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              {/* Soft Lip Highlight */}
              <path d={`M ${cx - 3.5} ${cy + 3.2} Q ${cx} ${cy + 4.5} ${cx + 3.5} ${cy + 3.2}`} stroke={lipHighlight} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.8" />
            </g>
          );

        case 5: // Viseme: Th / L / D (Tongue touch)
          return (
            <g>
              {/* Semi-open opening */}
              <ellipse cx={cx} cy={cy + 2} rx="5" ry="3" fill="#4A141A" />
              {/* Upper Teeth */}
              <path d={`M ${cx - 3.5} ${cy + 0.8} L ${cx + 3.5} ${cy + 0.8}`} stroke="#FFFFFF" strokeWidth="1.5" />
              {/* Tongue Tip */}
              <ellipse cx={cx} cy={cy + 2.2} rx="2.5" ry="1.4" fill="#E26D68" />
              {/* Lip Contour */}
              <path d={`M ${cx - 6} ${cy + 1} Q ${cx} ${cy + 4.8} ${cx + 6} ${cy + 1}`} stroke={lipBaseColor} strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          );

        case 0:
        default: // Resting Speech Cadence (Warm gentle speaking contour)
          return (
            <g>
              <path d={`M ${cx - 5.5} ${cy + 1} Q ${cx} ${cy + 4.2} ${cx + 5.5} ${cy + 1}`} stroke="#381D18" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d={`M ${cx - 3} ${cy + 3.2} Q ${cx} ${cy + 4.8} ${cx + 3} ${cy + 3.2}`} stroke={lipHighlight} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.75" />
            </g>
          );
      }
    }

    // 2. Listening State: Attentive soft mouth
    if (state === 'listening' || effectiveEmotion === 'listening') {
      return (
        <g>
          <ellipse cx={cx} cy={cy + 2} rx="2.8" ry="2.2" fill="#3D1D18" opacity="0.85" />
          <path d={`M ${cx - 4.5} ${cy + 1} Q ${cx} ${cy + 3.5} ${cx + 4.5} ${cy + 1}`} stroke={lipBaseColor} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>
      );
    }

    // 3. Thinking State: Reflective subtle expression
    if (state === 'thinking') {
      return (
        <g>
          <path d={`M ${cx - 4.5} ${cy + 2.5} Q ${cx + 1} ${cy + 1} ${cx + 4.5} ${cy + 1.8}`} stroke="#3D1D18" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d={`M ${cx - 2} ${cy + 4} Q ${cx + 1} ${cy + 3.2} ${cx + 3} ${cy + 3.5}`} stroke={lipHighlight} strokeWidth="1" fill="none" opacity="0.6" />
        </g>
      );
    }

    if (effectiveEmotion === 'celebrating' || effectiveEmotion === 'happy') {
      return (
        <g>
          {/* Happy Open Smile with teeth */}
          <path d={`M ${cx - 7} ${cy + 0.5} Q ${cx} ${cy + 7.5} ${cx + 7} ${cy + 0.5} Z`} fill="#4A141A" stroke={lipDark} strokeWidth="1" strokeLinejoin="round" />
          <path d={`M ${cx - 5} ${cy + 1.8} Q ${cx} ${cy + 3.2} ${cx + 5} ${cy + 1.8}`} stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <path d={`M ${cx - 3.5} ${cy + 5.5} Q ${cx} ${cy + 6.8} ${cx + 3.5} ${cy + 5.5}`} stroke="#E26D68" strokeWidth="1.5" strokeLinecap="round" />
          <path d={`M ${cx - 7.5} ${cy} Q ${cx} ${cy - 1.2} ${cx + 7.5} ${cy}`} stroke={lipBaseColor} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>
      );
    }

    // Default Relaxed Warm Smile
    return (
      <g>
        <path d={`M ${cx - 6} ${cy + 1} Q ${cx} ${cy + 4.8} ${cx + 6} ${cy + 1}`} stroke="#3D1D18" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d={`M ${cx - 3.5} ${cy + 3.2} Q ${cx} ${cy + 5.2} ${cx + 3.5} ${cy + 3.2}`} stroke={lipHighlight} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.8" />
      </g>
    );
  };

  return (
    <motion.div
      {...getAnimationVariants()}
      className={`relative inline-flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}
    >
      {/* 1. MITHRA (Warm, Empathetic Female Human-Like Companion) */}
      {safeAvatar === 'mithra' && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="mithraSkin" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FBD8BC" />
              <stop offset="50%" stopColor="#F5C4A3" />
              <stop offset="100%" stopColor="#E5A882" />
            </linearGradient>
            <linearGradient id="mithraHair" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2D1C19" />
              <stop offset="50%" stopColor="#1C1210" />
              <stop offset="100%" stopColor="#100A09" />
            </linearGradient>
            <linearGradient id="mithraHairHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4A322C" />
              <stop offset="100%" stopColor="#2A1B17" />
            </linearGradient>
            <linearGradient id="mithraClothing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F766E" />
              <stop offset="100%" stopColor="#094D48" />
            </linearGradient>
            <linearGradient id="mithraScarf" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E98A72" />
              <stop offset="100%" stopColor="#D96E54" />
            </linearGradient>
          </defs>

          {/* Background Hair Volume */}
          <path
            d="M 22 42 C 20 20, 32 6, 50 6 C 68 6, 80 20, 78 42 C 77 62, 75 74, 84 88 L 16 88 C 25 74, 23 62, 22 42 Z"
            fill="url(#mithraHair)"
          />

          {/* Shoulders / Attire */}
          <path
            d="M 20 84 C 20 71, 33 67, 50 67 C 67 67, 80 71, 80 84 L 86 100 L 14 100 Z"
            fill="url(#mithraClothing)"
          />
          {/* Inner kurti / scarf neckline */}
          <path
            d="M 38 67 Q 50 78 62 67 Q 50 83 38 67 Z"
            fill="url(#mithraScarf)"
          />
          {/* Scarf drape fold line */}
          <path d="M 44 72 Q 50 82 56 72" stroke="#F5A08A" strokeWidth="1" fill="none" opacity="0.8" />

          {/* Neck with collarbone subtle shading */}
          <rect x="44" y="57" width="12" height="14" rx="4" fill="url(#mithraSkin)" />
          <ellipse cx="50" cy="62" rx="7" ry="2.5" fill="#D39870" opacity="0.45" />

          {/* Ears */}
          <circle cx="27" cy="45" r="5" fill="url(#mithraSkin)" />
          <circle cx="73" cy="45" r="5" fill="url(#mithraSkin)" />
          {/* Tiny gentle pearl earrings */}
          <circle cx="26.5" cy="48" r="1.8" fill="#FFFBF5" stroke="#D39870" strokeWidth="0.5" />
          <circle cx="73.5" cy="48" r="1.8" fill="#FFFBF5" stroke="#D39870" strokeWidth="0.5" />

          {/* Face Base */}
          <path
            d="M 28 35 C 28 19, 72 19, 72 35 C 72 54, 62 66, 50 66 C 38 66, 28 54, 28 35 Z"
            fill="url(#mithraSkin)"
          />

          {/* Front Hair Strands / Soft Styling */}
          <path
            d="M 26 33 C 28 13, 48 9, 50 13 C 54 9, 74 13, 74 33 C 68 21, 54 19, 48 23 C 42 19, 32 21, 26 33 Z"
            fill="url(#mithraHair)"
          />
          {/* Hair shine highlight arc */}
          <path
            d="M 32 17 Q 50 12 68 17"
            stroke="url(#mithraHairHighlight)"
            strokeWidth="2.5"
            fill="none"
            opacity="0.6"
            strokeLinecap="round"
          />

          {/* Side swept strand with cute clip */}
          <path
            d="M 28 27 C 36 21, 45 22, 49 26 C 40 26, 34 31, 30 37 Z"
            fill="#3B2622"
          />
          {/* Terracotta/Gold Hair Pin */}
          <rect x="30" y="23" width="7" height="2.2" rx="1.1" transform="rotate(-15 30 23)" fill="#E98A72" stroke="#B85D46" strokeWidth="0.4" />

          {/* Eyebrows */}
          {renderHumanBrows(39, 61, 33, 'female')}

          {/* Small gentle traditional Bindi */}
          <circle cx="50" cy="32" r="1.2" fill="#991B1B" opacity="0.9" />

          {/* Rosy Cheeks */}
          {renderCheeks(35, 65, 47)}

          {/* Nose */}
          <path
            d="M 50 40 Q 52 44.5 49 46"
            stroke="#B87B54"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Expressive Lifelike Human Eyes */}
          {renderHumanEyes(39, 61, 40, 'female')}

          {/* Realistic Mouth with Phoneme Visemes */}
          {renderHumanMouth(50, 52, 'female')}

          {/* Listening State: Attentive Headset Indicator */}
          {(state === 'listening' || effectiveEmotion === 'listening') && (
            <g>
              <path d="M 22 44 C 22 17, 78 17, 78 44" stroke="#0F766E" strokeWidth="2.8" fill="none" strokeLinecap="round" />
              <rect x="18" y="37" width="7" height="14" rx="3.5" fill="#0F766E" />
              <rect x="75" y="37" width="7" height="14" rx="3.5" fill="#0F766E" />
            </g>
          )}

          {/* Thinking State: Thought Aura */}
          {state === 'thinking' && (
            <g className="animate-pulse">
              <circle cx="76" cy="16" r="3" fill="#E98A72" opacity="0.85" />
              <circle cx="84" cy="9" r="4.5" fill="#0F766E" opacity="0.9" />
              <circle cx="92" cy="3" r="5.5" fill="#FBD5B5" />
            </g>
          )}
        </svg>
      )}

      {/* 2. MITHRAN (Calm, Supportive Male Human-Like Companion) */}
      {safeAvatar === 'mithran' && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="mithranSkin" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F7D4B2" />
              <stop offset="50%" stopColor="#ECC09A" />
              <stop offset="100%" stopColor="#DBA278" />
            </linearGradient>
            <linearGradient id="mithranHair" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#251E1C" />
              <stop offset="100%" stopColor="#14100F" />
            </linearGradient>
            <linearGradient id="mithranClothing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#172554" />
            </linearGradient>
          </defs>

          {/* Background Hair Volume */}
          <path
            d="M 26 34 C 26 12, 74 12, 74 34 L 74 46 L 26 46 Z"
            fill="url(#mithranHair)"
          />

          {/* Shoulders / Campus Crewneck / Polo */}
          <path
            d="M 18 84 C 18 70, 32 66, 50 66 C 68 66, 82 70, 82 84 L 88 100 L 12 100 Z"
            fill="url(#mithranClothing)"
          />
          {/* Inner collar trim */}
          <path
            d="M 42 66 L 50 75 L 58 66 Z"
            fill="#E0E7FF"
          />

          {/* Neck */}
          <rect x="43" y="56" width="14" height="14" rx="4" fill="url(#mithranSkin)" />
          <ellipse cx="50" cy="61" rx="7.5" ry="2.8" fill="#C89269" opacity="0.4" />

          {/* Ears */}
          <circle cx="26" cy="45" r="5.2" fill="url(#mithranSkin)" />
          <circle cx="74" cy="45" r="5.2" fill="url(#mithranSkin)" />

          {/* Face Base */}
          <path
            d="M 28 34 C 28 18, 72 18, 72 34 C 72 54, 62 65, 50 65 C 38 65, 28 54, 28 34 Z"
            fill="url(#mithranSkin)"
          />

          {/* Modern Styled Hairstyle (textured top cut) */}
          <path
            d="M 26 27 C 28 9, 42 6, 52 8 C 64 6, 74 10, 74 25 C 70 18, 58 16, 50 19 C 44 16, 34 18, 26 27 Z"
            fill="url(#mithranHair)"
          />
          {/* Soft Hair Texture Streaks */}
          <path d="M 44 10 Q 48 15 52 10" stroke="#3F3330" strokeWidth="1.2" fill="none" />
          <path d="M 54 12 Q 58 16 62 12" stroke="#3F3330" strokeWidth="1.2" fill="none" />

          {/* Eyebrows */}
          {renderHumanBrows(38, 62, 31, 'male')}

          {/* Rosy/Warm Cheeks */}
          {renderCheeks(35, 65, 47)}

          {/* Nose */}
          <path
            d="M 50 39 L 51.5 44.5 L 48.5 45.5"
            stroke="#B87B54"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Expressive Lifelike Human Eyes */}
          {renderHumanEyes(38, 62, 38, 'male')}

          {/* Realistic Mouth with Phoneme Visemes */}
          {renderHumanMouth(50, 51, 'male')}

          {/* Listening State: Headband / Attentive aura */}
          {(state === 'listening' || effectiveEmotion === 'listening') && (
            <g>
              <path d="M 22 44 C 22 17, 78 17, 78 44" stroke="#3B82F6" strokeWidth="2.8" fill="none" strokeLinecap="round" />
              <rect x="18" y="37" width="7" height="14" rx="3.5" fill="#1E3A8A" />
              <rect x="75" y="37" width="7" height="14" rx="3.5" fill="#1E3A8A" />
            </g>
          )}

          {/* Thinking State: Thought Aura */}
          {state === 'thinking' && (
            <g className="animate-pulse">
              <circle cx="76" cy="16" r="3" fill="#3B82F6" opacity="0.85" />
              <circle cx="84" cy="9" r="4.5" fill="#60A5FA" opacity="0.9" />
              <circle cx="92" cy="3" r="5.5" fill="#DBEAFE" />
            </g>
          )}
        </svg>
      )}

      {/* 3. SOFT BLOB CREATURE (Whimsical option) */}
      {safeAvatar === 'blob' && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          <defs>
            <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#77B9BB" />
              <stop offset="60%" stopColor="#4A8B8D" />
              <stop offset="100%" stopColor="#316365" />
            </linearGradient>
            <linearGradient id="blobBelly" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D1E5E6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#A8D4D6" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          {/* Main Blob Body */}
          <path
            d="M 50 14 C 74 14, 88 32, 86 56 C 84 80, 68 88, 50 88 C 32 88, 16 80, 14 56 C 12 32, 26 14, 50 14 Z"
            fill="url(#blobGrad)"
          />
          {/* Belly patch */}
          <ellipse cx="50" cy="62" rx="22" ry="16" fill="url(#blobBelly)" />
          {/* Cheeks */}
          {renderCheeks(32, 68, 56)}
          {/* Eyes */}
          {renderEyes(38, 62, 50, 4)}
          {/* Mouth with Lip-Sync */}
          {renderMouth(50, 56)}
          {/* Little Sprout/Antenna on top */}
          <path
            d="M 50 16 C 50 8, 44 4, 38 7 C 43 9, 47 13, 49 16 Z"
            fill="#F5D5CB"
          />
          <path
            d="M 50 16 C 50 7, 56 3, 62 6 C 57 8, 53 12, 51 16 Z"
            fill="#E98A72"
          />
          {/* Party Hat when celebrating */}
          {effectiveEmotion === 'celebrating' && (
            <polygon points="50,2 40,20 60,20" fill="#E98A72" />
          )}
          {/* Headphones when listening */}
          {(state === 'listening' || effectiveEmotion === 'listening') && (
            <g>
              <path d="M 22 52 C 22 28, 78 28, 78 52" stroke="#E98A72" strokeWidth="4" fill="none" strokeLinecap="round" />
              <rect x="15" y="44" width="9" height="18" rx="4" fill="#D36B51" />
              <rect x="76" y="44" width="9" height="18" rx="4" fill="#D36B51" />
            </g>
          )}
          {/* Thinking Aura / Dots */}
          {state === 'thinking' && (
            <g className="animate-pulse">
              <circle cx="76" cy="22" r="3" fill="#E98A72" opacity="0.8" />
              <circle cx="83" cy="15" r="4.5" fill="#E98A72" opacity="0.9" />
              <circle cx="92" cy="8" r="6" fill="#F5D5CB" />
            </g>
          )}
        </svg>
      )}

      {/* 2. GENTLE OTTER */}
      {safeAvatar === 'otter' && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          <defs>
            <linearGradient id="otterBrown" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          {/* Ears */}
          <circle cx="28" cy="30" r="10" fill="#92400e" />
          <circle cx="28" cy="30" r="6" fill="#fde68a" />
          <circle cx="72" cy="30" r="10" fill="#92400e" />
          <circle cx="72" cy="30" r="6" fill="#fde68a" />
          {/* Head & Body */}
          <ellipse cx="50" cy="55" rx="34" ry="32" fill="url(#otterBrown)" />
          {/* Snout patch */}
          <ellipse cx="50" cy="58" rx="20" ry="14" fill="#fef3c7" />
          {/* Nose */}
          <ellipse cx="50" cy="53" rx="4.5" ry="3.5" fill="#1e293b" />
          {/* Cheeks */}
          {renderCheeks(30, 70, 56)}
          {/* Eyes */}
          {renderEyes(38, 62, 46, 3.8)}
          {/* Mouth with Lip-Sync */}
          {renderMouth(50, 60)}
          {/* Paws resting */}
          <ellipse cx="38" cy="78" rx="8" ry="6" fill="#92400e" />
          <ellipse cx="62" cy="78" rx="8" ry="6" fill="#92400e" />
          {/* Thinking Aura */}
          {state === 'thinking' && (
            <g className="animate-pulse">
              <circle cx="76" cy="20" r="3" fill="#f59e0b" opacity="0.8" />
              <circle cx="84" cy="14" r="4.5" fill="#f59e0b" opacity="0.9" />
            </g>
          )}
        </svg>
      )}

      {/* 3. GLOWING SPROUT */}
      {safeAvatar === 'sprout' && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          <defs>
            <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          {/* Leaves on top */}
          <path
            d="M 50 45 C 32 30, 20 40, 32 50 C 40 52, 48 48, 50 45 Z"
            fill="url(#leafGrad)"
          />
          <path
            d="M 50 45 C 68 30, 80 40, 68 50 C 60 52, 52 48, 50 45 Z"
            fill="url(#leafGrad)"
          />
          <path d="M 50 45 L 50 56" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
          {/* Clay Pot (The character body) */}
          <path
            d="M 28 54 L 72 54 L 66 86 C 65 89, 35 89, 34 86 Z"
            fill="url(#potGrad)"
          />
          {/* Pot Rim */}
          <rect x="24" y="50" width="52" height="7" rx="3.5" fill="#fdba74" />
          {/* Cheeks */}
          {renderCheeks(36, 64, 70)}
          {/* Eyes */}
          {renderEyes(40, 60, 65, 3.5)}
          {/* Mouth with Lip-Sync */}
          {renderMouth(50, 71)}
          {/* Thinking Aura */}
          {state === 'thinking' && (
            <g className="animate-pulse">
              <circle cx="76" cy="34" r="3" fill="#22c55e" opacity="0.8" />
              <circle cx="84" cy="26" r="4.5" fill="#86efac" opacity="0.9" />
            </g>
          )}
        </svg>
      )}

      {/* 4. LITTLE OWL */}
      {safeAvatar === 'owl' && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          <defs>
            <linearGradient id="owlBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
          </defs>
          {/* Feather tufts / ears */}
          <polygon points="30,34 22,18 42,26" fill="#3730a3" />
          <polygon points="70,34 78,18 58,26" fill="#3730a3" />
          {/* Body */}
          <ellipse cx="50" cy="56" rx="33" ry="31" fill="url(#owlBlue)" />
          {/* Belly */}
          <ellipse cx="50" cy="65" rx="18" ry="16" fill="#e0e7ff" />
          {/* Eye rings */}
          <circle cx="38" cy="46" r="12" fill="#ffffff" />
          <circle cx="62" cy="46" r="12" fill="#ffffff" />
          {/* Eyes with gaze */}
          {renderEyes(38, 62, 46, 4.5)}
          {/* Beak with subtle speaking movement */}
          {state === 'speaking' ? (
            <g>
              <polygon points="50,47 45,53 55,53" fill="#f59e0b" />
              <polygon points="50,57 46,54 54,54" fill="#d97706" />
            </g>
          ) : (
            <polygon points="50,48 46,55 54,55" fill="#f59e0b" />
          )}
          {/* Cheeks */}
          {renderCheeks(28, 72, 56)}
          {/* Thinking Aura */}
          {state === 'thinking' && (
            <g className="animate-pulse">
              <circle cx="76" cy="18" r="3" fill="#818cf8" opacity="0.8" />
              <circle cx="84" cy="10" r="4.5" fill="#c7d2fe" opacity="0.9" />
            </g>
          )}
        </svg>
      )}
    </motion.div>
  );
};
