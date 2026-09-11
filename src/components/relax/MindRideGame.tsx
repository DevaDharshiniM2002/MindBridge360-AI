import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Compass,
  Wind,
  Sparkles,
  Heart,
  ChevronRight,
  Sun,
  Moon,
  Bike
} from 'lucide-react';
import { AppLanguage } from '../../types';
import { playBicycleBell, playBreathSweep, playChime, setRelaxAudioMuted, getRelaxAudioMuted } from './relaxAudio';

interface MindRideGameProps {
  language: AppLanguage;
  onExit: () => void;
  onFinishSession: (durationMinutes: number) => void;
}

interface StressSign {
  id: string;
  thought: string;
  thoughtTa?: string;
  distance: number; // progress distance on track (0 to 1000+)
  lane: 'left' | 'right';
  dissolvedRatio: number; // 0 to 1 (1 = fully dissolved)
  dissolving: boolean;
}

const DEFAULT_STRESS_THOUGHTS: { en: string; ta: string }[] = [
  { en: 'CGPA', ta: 'CGPA மதிப்பெண்' },
  { en: 'Backlog', ta: 'அரியர்ஸ் பயம்' },
  { en: 'Placement', ta: 'வேலை வாய்ப்பு' },
  { en: 'Viva', ta: 'வைவா பதட்டம்' },
  { en: 'Deadlines', ta: 'கெடு தேதிகள்' },
  { en: 'Future', ta: 'எதிர்கால பயம்' },
  { en: 'Family Expectations', ta: 'குடும்ப எதிர்பார்ப்புகள்' },
];

export const MindRideGame: React.FC<MindRideGameProps> = ({
  language,
  onExit,
  onFinishSession,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(getRelaxAudioMuted());
  const [timeOfDay, setTimeOfDay] = useState<'sunrise' | 'sunset' | 'twilight'>('sunset');
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [distanceRidden, setDistanceRidden] = useState(0);
  const [speed, setSpeed] = useState(0.8); // gentle baseline speed
  const [dissolvedCount, setDissolvedCount] = useState(0);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  // Canvas Ref & Animation Frame
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Audio interval for periodic bird/wind chimes
  useEffect(() => {
    let audioTimer: any;
    if (isPlaying && !isMuted) {
      audioTimer = setInterval(() => {
        if (Math.random() > 0.4) {
          playChime(660 + Math.random() * 200, 1.4, 0.03);
        }
      }, 5000);
    }
    return () => clearInterval(audioTimer);
  }, [isPlaying, isMuted]);

  // Track state in refs for 60fps canvas loop
  const stateRef = useRef({
    distance: 0,
    speed: 0.8,
    targetSpeed: 0.8,
    pedalAngle: 0,
    wheelAngle: 0,
    signs: DEFAULT_STRESS_THOUGHTS.map((t, idx) => ({
      id: `sign-${idx}`,
      thought: t.en,
      thoughtTa: t.ta,
      distance: 180 + idx * 240,
      lane: (idx % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
      dissolvedRatio: 0,
      dissolving: false,
    })),
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
    birds: [
      { x: 50, y: 80, vx: 0.4, vy: -0.05, wing: 0 },
      { x: 120, y: 60, vx: 0.5, vy: 0.02, wing: 0.5 },
      { x: 90, y: 110, vx: 0.35, vy: 0, wing: 1 },
    ],
    leaves: Array.from({ length: 14 }).map(() => ({
      x: Math.random() * 800,
      y: Math.random() * 400,
      speedX: 0.5 + Math.random() * 0.8,
      speedY: 0.2 + Math.random() * 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: 0.02 + Math.random() * 0.03,
      size: 4 + Math.random() * 4,
    })),
  });

  // Elapsed timer
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setSessionSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // User input handling (tap/pedal/keys)
  const boostSpeed = () => {
    stateRef.current.targetSpeed = Math.min(1.8, stateRef.current.targetSpeed + 0.35);
    playBicycleBell();
  };

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        boostSpeed();
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        stateRef.current.targetSpeed = Math.max(0.4, stateRef.current.targetSpeed - 0.3);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 480);

      const state = stateRef.current;

      if (isPlaying) {
        // Smooth speed easing
        state.speed += (state.targetSpeed - state.speed) * 0.04;
        state.targetSpeed += (0.8 - state.targetSpeed) * 0.02; // gently decays back to serene cruise speed
        state.distance += state.speed * 60 * dt;
        state.pedalAngle += state.speed * 4 * dt;
        state.wheelAngle += state.speed * 6 * dt;
      }

      setDistanceRidden(Math.floor(state.distance));
      setSpeed(parseFloat(state.speed.toFixed(1)));

      // 1. SKY GRADIENT (Sunrise / Sunset / Twilight)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.65);
      if (timeOfDay === 'sunset') {
        skyGrad.addColorStop(0, '#3A3258'); // Twilight purple
        skyGrad.addColorStop(0.35, '#9C5874'); // Soft magenta
        skyGrad.addColorStop(0.7, '#E58C6B'); // Warm amber
        skyGrad.addColorStop(1, '#FBD28B'); // Golden horizon
      } else if (timeOfDay === 'sunrise') {
        skyGrad.addColorStop(0, '#2D4B68');
        skyGrad.addColorStop(0.4, '#5C7C8A');
        skyGrad.addColorStop(0.75, '#F5B083');
        skyGrad.addColorStop(1, '#FFECC7');
      } else {
        skyGrad.addColorStop(0, '#151D28');
        skyGrad.addColorStop(0.5, '#223545');
        skyGrad.addColorStop(1, '#3B5768');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. SUN / MOON
      const sunY = height * 0.38;
      const sunX = width * 0.75;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 90);
      sunGrad.addColorStop(0, 'rgba(255, 245, 215, 0.95)');
      sunGrad.addColorStop(0.4, 'rgba(245, 180, 110, 0.4)');
      sunGrad.addColorStop(1, 'rgba(245, 180, 110, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 90, 0, Math.PI * 2);
      ctx.fill();

      // 3. BIRDS IN SKY
      state.birds.forEach((bird) => {
        bird.x += bird.vx;
        bird.y += bird.vy;
        bird.wing += 0.08;
        if (bird.x > width + 40) bird.x = -40;

        ctx.strokeStyle = 'rgba(60, 40, 50, 0.6)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        const wingY = Math.sin(bird.wing) * 4;
        ctx.moveTo(bird.x - 8, bird.y + wingY);
        ctx.quadraticCurveTo(bird.x - 3, bird.y - 2, bird.x, bird.y);
        ctx.quadraticCurveTo(bird.x + 3, bird.y - 2, bird.x + 8, bird.y + wingY);
        ctx.stroke();
      });

      // 4. DISTANT CAMPUS HILLS & HOSTEL SILHOUETTES (Parallax Layer 1)
      const horizonY = height * 0.52;
      ctx.fillStyle = timeOfDay === 'twilight' ? '#1E2C38' : '#725062';
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      for (let x = 0; x <= width; x += 40) {
        const hillOffset = Math.sin((x + state.distance * 0.08) * 0.006) * 22;
        ctx.lineTo(x, horizonY - 25 + hillOffset);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fill();

      // Distant Hostel Arch / Academic Block silhouette
      const hostelX = ((width * 0.3 - state.distance * 0.15) % (width + 300)) - 100;
      ctx.fillStyle = 'rgba(50, 45, 60, 0.45)';
      ctx.fillRect(hostelX, horizonY - 45, 90, 45);
      // Clock tower / arch dome
      ctx.beginPath();
      ctx.arc(hostelX + 45, horizonY - 45, 20, Math.PI, 0);
      ctx.fill();

      // 5. MIDGROUND TREES & MEADOW (Parallax Layer 2)
      const midgroundY = height * 0.58;
      ctx.fillStyle = timeOfDay === 'twilight' ? '#162228' : '#4E5A44';
      ctx.beginPath();
      ctx.moveTo(0, midgroundY);
      for (let x = 0; x <= width; x += 30) {
        const wave = Math.sin((x + state.distance * 0.3) * 0.015) * 12;
        ctx.lineTo(x, midgroundY - 10 + wave);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fill();

      // Road Grass Verge
      ctx.fillStyle = '#3A4D39';
      ctx.fillRect(0, horizonY + 20, width, height);

      // 6. PERSPECTIVE ROAD (College / Hostel pathway)
      const roadTopY = horizonY + 15;
      const roadBottomY = height;
      const roadTopWidth = width * 0.12;
      const roadBottomWidth = width * 0.95;
      const roadCenterX = width * 0.5;

      ctx.fillStyle = '#4A4844';
      ctx.beginPath();
      ctx.moveTo(roadCenterX - roadTopWidth / 2, roadTopY);
      ctx.lineTo(roadCenterX + roadTopWidth / 2, roadTopY);
      ctx.lineTo(roadCenterX + roadBottomWidth / 2, roadBottomY);
      ctx.lineTo(roadCenterX - roadBottomWidth / 2, roadBottomY);
      ctx.closePath();
      ctx.fill();

      // Road curb edge lines
      ctx.strokeStyle = '#D9822B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(roadCenterX - roadTopWidth / 2, roadTopY);
      ctx.lineTo(roadCenterX - roadBottomWidth / 2, roadBottomY);
      ctx.moveTo(roadCenterX + roadTopWidth / 2, roadTopY);
      ctx.lineTo(roadCenterX + roadBottomWidth / 2, roadBottomY);
      ctx.stroke();

      // Road Center Dashes (moving down perspective)
      const dashCount = 8;
      ctx.strokeStyle = 'rgba(245, 235, 220, 0.7)';
      for (let i = 0; i < dashCount; i++) {
        const progress = ((i / dashCount + (state.distance * 0.003) % 1) % 1);
        const pY = roadTopY + Math.pow(progress, 2.2) * (roadBottomY - roadTopY);
        const pLen = 10 + progress * 35;
        const pWidth = 1.5 + progress * 4.5;
        ctx.lineWidth = pWidth;
        ctx.beginPath();
        ctx.moveTo(roadCenterX, pY);
        ctx.lineTo(roadCenterX, pY + pLen);
        ctx.stroke();
      }

      // 7. ROADSIDE TREES (Gulmohar / Campus Neem trees)
      for (let side of [-1, 1]) {
        for (let i = 0; i < 5; i++) {
          const tProgress = ((i / 5 + (state.distance * 0.002) % 1) % 1);
          const tY = roadTopY + Math.pow(tProgress, 2) * (roadBottomY - roadTopY - 40);
          const tRoadW = roadTopWidth + (roadBottomWidth - roadTopWidth) * Math.pow(tProgress, 2);
          const tX = roadCenterX + (side * (tRoadW / 2 + 30 + tProgress * 80));
          const tScale = 0.2 + tProgress * 0.9;

          if (tY > roadTopY && tY < height + 40) {
            // Trunk
            ctx.fillStyle = '#2C1D11';
            ctx.fillRect(tX - 3 * tScale, tY - 60 * tScale, 6 * tScale, 60 * tScale);
            // Foliage Canopy (Warm green/coral flowers)
            ctx.fillStyle = side === 1 ? '#E06D53' : '#3E6B48';
            ctx.beginPath();
            ctx.arc(tX, tY - 70 * tScale, 30 * tScale, 0, Math.PI * 2);
            ctx.arc(tX - 18 * tScale, tY - 60 * tScale, 22 * tScale, 0, Math.PI * 2);
            ctx.arc(tX + 18 * tScale, tY - 60 * tScale, 22 * tScale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 8. STRESS ROAD SIGNS (Dissolving Thoughts)
      let activeDissolvedTotal = 0;
      state.signs.forEach((sign) => {
        const relDist = sign.distance - state.distance;
        // Check if bicycle is passing near the sign
        if (relDist < 120 && relDist > -60) {
          sign.dissolving = true;
          sign.dissolvedRatio = Math.min(1, sign.dissolvedRatio + dt * 1.2);

          // Spawn sparkling dust particles as thought dissolves
          if (sign.dissolvedRatio < 0.95 && Math.random() > 0.4) {
            for (let k = 0; k < 2; k++) {
              state.particles.push({
                x: width * 0.5 + (sign.lane === 'left' ? -120 : 120) + (Math.random() * 40 - 20),
                y: height * 0.65 + (Math.random() * 40 - 20),
                vx: (Math.random() - 0.5) * 1.5,
                vy: -Math.random() * 2 - 1,
                life: 1,
                color: '#FFE28A',
              });
            }
          }
        }

        if (sign.dissolvedRatio >= 1) {
          activeDissolvedTotal++;
        }

        // Draw sign in perspective if within viewing range
        if (relDist > -100 && relDist < 600) {
          const depth = 1 - Math.max(0, relDist) / 600; // 0 (far) to 1 (near)
          const sY = roadTopY + Math.pow(depth, 2) * (roadBottomY - roadTopY - 60);
          const sRoadW = roadTopWidth + (roadBottomWidth - roadTopWidth) * Math.pow(depth, 2);
          const sX = roadCenterX + (sign.lane === 'left' ? -1 : 1) * (sRoadW / 2 + 35 * depth + 15);
          const scale = 0.25 + depth * 0.9;

          const alpha = Math.max(0, 1 - sign.dissolvedRatio);

          if (alpha > 0.02) {
            ctx.save();
            ctx.globalAlpha = alpha;

            // Pole
            ctx.fillStyle = '#6B7280';
            ctx.fillRect(sX - 2 * scale, sY - 50 * scale, 4 * scale, 50 * scale);

            // Sign Board
            const signW = 100 * scale;
            const signH = 40 * scale;
            ctx.fillStyle = '#FDFBF7';
            ctx.strokeStyle = '#4A8B8D';
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.roundRect(sX - signW / 2, sY - 50 * scale - signH, signW, signH, 6 * scale);
            ctx.fill();
            ctx.stroke();

            // Text on sign
            ctx.fillStyle = '#2D2D2B';
            ctx.font = `bold ${Math.max(10, Math.floor(13 * scale))}px system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const displayThought = language === 'ta' && sign.thoughtTa ? sign.thoughtTa : sign.thought;
            ctx.fillText(displayThought, sX, sY - 50 * scale - signH / 2);

            // Red slash or gentle cloud fading icon
            ctx.restore();
          }
        }
      });

      setDissolvedCount(activeDissolvedTotal);

      // Check if all initial signs dissolved
      if (activeDissolvedTotal >= state.signs.length && !showCompletionDialog) {
        setShowCompletionDialog(true);
      }

      // 9. DUST PARTICLES & LEAVES
      state.particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt * 1.5;
        if (p.life > 0) {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else {
          state.particles.splice(idx, 1);
        }
      });

      // Floating wind leaves
      state.leaves.forEach((l) => {
        l.x -= l.speedX * (state.speed * 1.5);
        l.y += l.speedY;
        l.rotation += l.rotSpeed;
        if (l.x < -20) l.x = width + 20;
        if (l.y > height + 20) l.y = -20;

        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rotation);
        ctx.fillStyle = '#E98A72';
        ctx.beginPath();
        ctx.ellipse(0, 0, l.size * 1.5, l.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 10. BICYCLE HANDLEBARS & FOREGROUND (First-Person Perspective)
      const bikeY = height - 10;
      const bikeX = roadCenterX;

      // Handlebar Stem
      ctx.fillStyle = '#222831';
      ctx.fillRect(bikeX - 6, bikeY - 90, 12, 90);

      // Handlebar Curved Bar
      ctx.strokeStyle = '#393E46';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bikeX - 110, bikeY - 70);
      ctx.quadraticCurveTo(bikeX - 60, bikeY - 95, bikeX, bikeY - 90);
      ctx.quadraticCurveTo(bikeX + 60, bikeY - 95, bikeX + 110, bikeY - 70);
      ctx.stroke();

      // Handle Grips (Ergonomic Teal grips)
      ctx.strokeStyle = '#4A8B8D';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(bikeX - 115, bikeY - 68);
      ctx.lineTo(bikeX - 85, bikeY - 78);
      ctx.moveTo(bikeX + 115, bikeY - 68);
      ctx.lineTo(bikeX + 85, bikeY - 78);
      ctx.stroke();

      // Center Bell & Compass
      ctx.fillStyle = '#E8E4D9';
      ctx.beginPath();
      ctx.arc(bikeX - 35, bikeY - 96, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4A8B8D';
      ctx.beginPath();
      ctx.arc(bikeX - 35, bikeY - 96, 6, 0, Math.PI * 2);
      ctx.fill();

      // Front Wheel Rim Peak visible in lower center
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(bikeX, bikeY + 90, 110, Math.PI * 1.25, Math.PI * 1.75);
      ctx.stroke();

      // Wheel Spokes in motion
      const spokeAngle = state.wheelAngle;
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.4)';
      ctx.lineWidth = 1.5;
      for (let s = 0; s < 6; s++) {
        const ang = spokeAngle + (s * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(bikeX, bikeY + 90);
        ctx.lineTo(bikeX + Math.cos(ang) * 105, bikeY + 90 + Math.sin(ang) * 105);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, timeOfDay, language, showCompletionDialog]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current !== null) {
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      if (deltaY > 20) {
        // Swipe Up -> Pedal forward
        boostSpeed();
      }
      touchStartY.current = null;
    }
  };

  const handleFinish = () => {
    onFinishSession(Math.max(1, Math.round(sessionSeconds / 60)));
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-xl select-none bg-black flex flex-col justify-between">
      {/* Interactive Simulation Canvas */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={boostSpeed}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Top Floating Calm HUD */}
      <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between pointer-events-none">
        {/* Left: Ride Title & Dissolved Thoughts Pill */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#161E20]/90 backdrop-blur-md border border-[#E8E4D9] dark:border-[#223034] shadow-xs flex items-center gap-2">
            <span className="text-sm">🚲</span>
            <span className="font-serif font-bold text-xs text-[#2D2D2B] dark:text-[#F3F6F8]">
              Mind Ride
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200">
              {dissolvedCount}/{stateRef.current.signs.length} Thoughts Released
            </span>
          </div>
        </div>

        {/* Right: Controls & Sky Switcher */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Time of Day Switcher */}
          <button
            onClick={() => {
              setTimeOfDay((t) => (t === 'sunset' ? 'sunrise' : t === 'sunrise' ? 'twilight' : 'sunset'));
            }}
            className="w-9 h-9 rounded-full bg-white/85 dark:bg-[#161E20]/85 backdrop-blur-md border border-[#E8E4D9] dark:border-[#223034] flex items-center justify-center text-[#2D2D2B] dark:text-[#F3F6F8] shadow-xs hover:scale-105 transition-all cursor-pointer"
            title="Change Sky Scene"
          >
            {timeOfDay === 'sunset' ? <Sun className="w-4 h-4 text-amber-500" /> : timeOfDay === 'sunrise' ? <Sparkles className="w-4 h-4 text-teal-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Sound Mute */}
          <button
            onClick={() => {
              const newMute = !isMuted;
              setIsMuted(newMute);
              setRelaxAudioMuted(newMute);
            }}
            className="w-9 h-9 rounded-full bg-white/85 dark:bg-[#161E20]/85 backdrop-blur-md border border-[#E8E4D9] dark:border-[#223034] flex items-center justify-center text-[#2D2D2B] dark:text-[#F3F6F8] shadow-xs hover:scale-105 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-[#4A8B8D]" />}
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-full bg-white/85 dark:bg-[#161E20]/85 backdrop-blur-md border border-[#E8E4D9] dark:border-[#223034] flex items-center justify-center text-[#2D2D2B] dark:text-[#F3F6F8] shadow-xs hover:scale-105 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          {/* Exit / Done */}
          <button
            onClick={handleFinish}
            className="px-3.5 py-1.5 rounded-full bg-[#4A8B8D] text-white font-bold text-xs shadow-md hover:bg-[#3B7274] transition-all cursor-pointer flex items-center gap-1"
          >
            <span>Finish</span>
          </button>
        </div>
      </div>

      {/* Floating Center Subtle Objective Guide */}
      <div className="relative z-10 px-4 text-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-medium"
        >
          <span>Slow down</span>
          <span className="opacity-50">→</span>
          <span>Breathe</span>
          <span className="opacity-50">→</span>
          <span>Ride</span>
          <span className="opacity-50">→</span>
          <span className="text-[#FFE28A] font-bold">Release</span>
        </motion.div>
      </div>

      {/* Bottom Floating Interactive Touch & Breathing Banner */}
      <div className="relative z-20 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
        <div className="px-4 py-2 rounded-2xl bg-white/90 dark:bg-[#161E20]/90 backdrop-blur-md border border-[#E8E4D9] dark:border-[#223034] shadow-md flex items-center gap-3 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          <p className="text-xs text-[#2D2D2B] dark:text-[#F3F6F8] font-medium">
            <span className="hidden sm:inline">Tap spacebar, click, or swipe up to pedal gently. </span>
            <span>Watch heavy stress signs dissolve as you ride past.</span>
          </p>
        </div>

        <button
          onClick={boostSpeed}
          className="px-5 py-2.5 rounded-full bg-linear-to-r from-[#4A8B8D] to-[#E98A72] text-white font-bold text-xs shadow-lg hover:scale-103 active:scale-95 transition-all cursor-pointer pointer-events-auto flex items-center gap-2"
        >
          <Bike className="w-4 h-4" />
          <span>Pedal Forward</span>
        </button>
      </div>

      {/* Completion Dialog / Gentle Release Reflection */}
      <AnimatePresence>
        {showCompletionDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/65 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-[#161E20] max-w-md w-full p-6 sm:p-8 rounded-3xl border border-[#E8E4D9] dark:border-[#223034] text-center shadow-2xl space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-[#4A8B8D]/30 flex items-center justify-center mx-auto text-3xl">
                🚲
              </div>

              <div className="space-y-2">
                <h3 className="font-serif italic font-bold text-2xl text-[#2D2D2B] dark:text-[#F3F6F8]">
                  Take a breath. You made it through another moment.
                </h3>
                <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF] leading-relaxed max-w-sm mx-auto">
                  CGPA, backlogs, placements, and deadlines are real pressures, but in this moment, you are safe, grounded, and riding forward one breath at a time.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    // Reset signs for endless peaceful riding
                    stateRef.current.signs.forEach((s, idx) => {
                      s.distance = stateRef.current.distance + 200 + idx * 220;
                      s.dissolvedRatio = 0;
                      s.dissolving = false;
                    });
                    setShowCompletionDialog(false);
                  }}
                  className="px-4 py-2.5 rounded-full border border-[#E8E4D9] dark:border-[#2F3D42] text-xs font-bold text-[#7A756D] dark:text-[#9BA3AF] hover:bg-[#F0EDE4] dark:hover:bg-[#253235] transition-colors cursor-pointer"
                >
                  Keep Riding Freely
                </button>

                <button
                  onClick={handleFinish}
                  className="px-6 py-2.5 rounded-full bg-[#4A8B8D] text-white font-bold text-xs shadow-md hover:bg-[#3B7274] transition-all cursor-pointer"
                >
                  Complete Ride
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
