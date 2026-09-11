import React, { useState } from 'react';
import { Compass, Sparkles, RefreshCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export const MindfulMaze: React.FC = () => {
  // 6x6 friendly maze
  // 0 = path, 1 = garden hedge wall, 2 = start, 3 = goal pond
  const INITIAL_GRID = [
    [0, 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 1, 0],
    [0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0],
  ];

  const [playerPos, setPlayerPos] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [visited, setVisited] = useState<{ [key: string]: boolean }>({ '0-0': true });
  const goalPos = { r: 5, c: 5 };

  const isGoal = playerPos.r === goalPos.r && playerPos.c === goalPos.c;

  const playStepSound = (isWin = false) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isWin ? 587 : 440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isWin ? 0.8 : 0.2));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (isWin ? 0.8 : 0.2));
    } catch (_) {}
  };

  const move = (dr: number, dc: number) => {
    if (isGoal) return;
    const nr = playerPos.r + dr;
    const nc = playerPos.c + dc;

    // Check bounds
    if (nr < 0 || nr >= 6 || nc < 0 || nc >= 6) return;
    // Check walls
    if (INITIAL_GRID[nr][nc] === 1) return;

    setPlayerPos({ r: nr, c: nc });
    setVisited((prev) => ({ ...prev, [`${nr}-${nc}`]: true }));

    const won = nr === goalPos.r && nc === goalPos.c;
    playStepSound(won);
  };

  const handleReset = () => {
    setPlayerPos({ r: 0, c: 0 });
    setVisited({ '0-0': true });
  };

  return (
    <div className="flex flex-col items-center p-6 rounded-3xl bg-[#F6FAF7] dark:bg-[#192421] border border-[#D3E8D9] dark:border-[#2C4136] min-h-[440px]">
      <div className="text-center mb-4">
        <h4 className="text-base font-serif font-bold text-[#2D3748] dark:text-white flex items-center justify-center gap-2">
          <Compass className="w-4 h-4 text-[#3C8C64]" />
          Mindful Path Maze
        </h4>
        <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-0.5">
          Step gently from the stone path to the lotus pond. No clock, no traps.
        </p>
      </div>

      {/* Maze Grid */}
      <div className="grid grid-cols-6 gap-1.5 p-3 bg-stone-100 dark:bg-[#202E2A] rounded-2xl border border-stone-200 dark:border-[#2C4136] mb-4">
        {INITIAL_GRID.map((row, r) =>
          row.map((cell, c) => {
            const isPlayer = playerPos.r === r && playerPos.c === c;
            const isTarget = goalPos.r === r && goalPos.c === c;
            const isWall = cell === 1;
            const isPathVisited = visited[`${r}-${c}`];

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => {
                  // Direct tap to neighbor
                  if (Math.abs(playerPos.r - r) + Math.abs(playerPos.c - c) === 1 && !isWall) {
                    move(r - playerPos.r, c - playerPos.c);
                  }
                }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                  isWall
                    ? 'bg-[#B0C8B5] dark:bg-[#344E41] shadow-2xs'
                    : isPlayer
                    ? 'bg-[#3C8C64] text-white shadow-md scale-105 z-10'
                    : isTarget
                    ? 'bg-[#E3F2FD] dark:bg-[#153448] text-[#1976D2] border border-blue-300 dark:border-blue-700'
                    : isPathVisited
                    ? 'bg-emerald-50/70 dark:bg-[#1E3029]'
                    : 'bg-white dark:bg-[#273832]'
                }`}
              >
                {isPlayer ? '🚶' : isTarget ? '🪷' : isWall ? '🌿' : ''}
              </div>
            );
          })
        )}
      </div>

      {/* Completion message or directional controls */}
      {isGoal ? (
        <div className="text-center p-3 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 mb-3 animate-in fade-in">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>You got there! Peaceful step by step.</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 w-36 mb-3">
          <div />
          <button
            type="button"
            onClick={() => move(-1, 0)}
            className="p-2 rounded-xl bg-white dark:bg-[#24332D] text-[#3C8C64] dark:text-[#88C6A5] border border-stone-200 dark:border-[#354B42] flex justify-center hover:bg-stone-50 cursor-pointer"
            aria-label="Up"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <div />
          <button
            type="button"
            onClick={() => move(0, -1)}
            className="p-2 rounded-xl bg-white dark:bg-[#24332D] text-[#3C8C64] dark:text-[#88C6A5] border border-stone-200 dark:border-[#354B42] flex justify-center hover:bg-stone-50 cursor-pointer"
            aria-label="Left"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => move(1, 0)}
            className="p-2 rounded-xl bg-white dark:bg-[#24332D] text-[#3C8C64] dark:text-[#88C6A5] border border-stone-200 dark:border-[#354B42] flex justify-center hover:bg-stone-50 cursor-pointer"
            aria-label="Down"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => move(0, 1)}
            className="p-2 rounded-xl bg-white dark:bg-[#24332D] text-[#3C8C64] dark:text-[#88C6A5] border border-stone-200 dark:border-[#354B42] flex justify-center hover:bg-stone-50 cursor-pointer"
            aria-label="Right"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleReset}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#24332D] text-[#718096] dark:text-[#A0AEC0] hover:text-[#2D3748] border border-stone-200 dark:border-[#354B42] text-xs font-medium cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Restart Walk</span>
      </button>
    </div>
  );
};
