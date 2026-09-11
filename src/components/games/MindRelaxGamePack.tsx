import React, { useState } from 'react';
import { 
  Sparkles, 
  Wind, 
  Layers, 
  Waves, 
  Heart, 
  Compass, 
  Moon, 
  Send, 
  Music, 
  Eye, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { BreathingBubble } from './BreathingBubble';
import { ColorMatchCalm } from './ColorMatchCalm';
import { ZenGardenDraw } from './ZenGardenDraw';
import { BubbleWrapPop } from './BubbleWrapPop';
import { GratitudePuzzle } from './GratitudePuzzle';
import { MindfulMaze } from './MindfulMaze';
import { ConstellationConnect } from './ConstellationConnect';
import { WordCloudRelease } from './WordCloudRelease';
import { RhythmTapCalm } from './RhythmTapCalm';
import { ColorBreathing } from './ColorBreathing';

export interface RelaxGameMeta {
  id: string;
  title: string;
  category: 'Breath & Focus' | 'Sensory & Tactile' | 'Gentle Puzzles' | 'Release & Rhythm';
  description: string;
  icon: React.ElementType;
  accentColor: string;
  duration: string;
}

export const RELAX_GAMES: RelaxGameMeta[] = [
  {
    id: 'breathing-bubble',
    title: 'Breathing Bubble',
    category: 'Breath & Focus',
    description: 'Expanding/contracting circle synced to 4-7-8, box, and equal pacing.',
    icon: Wind,
    accentColor: '#31797B',
    duration: '2-5 min',
  },
  {
    id: 'bubble-wrap',
    title: 'Infinite Bubble Wrap',
    category: 'Sensory & Tactile',
    description: 'Poppable soothing bubble sheets that regenerate infinitely with gentle pops.',
    icon: Layers,
    accentColor: '#388D90',
    duration: '1-3 min',
  },
  {
    id: 'zen-garden',
    title: 'Zen Sand Rake',
    category: 'Sensory & Tactile',
    description: 'Trace soothing ripples and river stones in a virtual sand tray.',
    icon: Waves,
    accentColor: '#8C765C',
    duration: '2-5 min',
  },
  {
    id: 'color-match',
    title: 'Soft Color Harmony',
    category: 'Gentle Puzzles',
    description: 'Pair pastel hues with relaxing chime tones. Untimed and pressure-free.',
    icon: Sparkles,
    accentColor: '#66999B',
    duration: '3-5 min',
  },
  {
    id: 'gratitude-puzzle',
    title: 'Gratitude Puzzle',
    category: 'Gentle Puzzles',
    description: 'Swap serene nature landscape pieces to unlock calming gratitude prompts.',
    icon: Heart,
    accentColor: '#D97762',
    duration: '2-4 min',
  },
  {
    id: 'mindful-maze',
    title: 'Mindful Path Walk',
    category: 'Gentle Puzzles',
    description: 'A quiet, untimed hedge path to the lotus pond. No traps, no failure states.',
    icon: Compass,
    accentColor: '#3C8C64',
    duration: '2-4 min',
  },
  {
    id: 'constellation',
    title: 'Constellation Connect',
    category: 'Gentle Puzzles',
    description: 'Connect glowing stars against a deep night sky with harmonic ambient bells.',
    icon: Moon,
    accentColor: '#6366F1',
    duration: '2-4 min',
  },
  {
    id: 'word-release',
    title: 'Thought Release Breeze',
    category: 'Release & Rhythm',
    description: 'Type any stressful worry or rumination and watch it harmlessly float and dissolve.',
    icon: Send,
    accentColor: '#3A8E91',
    duration: '1-3 min',
  },
  {
    id: 'rhythm-tap',
    title: 'Singing Bowl Rhythm',
    category: 'Release & Rhythm',
    description: 'Slow-tempo rhythm tapping to harmonic tones. Forgiving, zero game-over.',
    icon: Music,
    accentColor: '#C27D56',
    duration: '2-5 min',
  },
  {
    id: 'color-breathing',
    title: 'Passive Color Bath',
    category: 'Breath & Focus',
    description: 'Completely hands-free soothing chromatic transitions to rest tired eyes.',
    icon: Eye,
    accentColor: '#52525B',
    duration: '3-10 min',
  },
];

export const MindRelaxGamePack: React.FC = () => {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Breath & Focus', 'Sensory & Tactile', 'Gentle Puzzles', 'Release & Rhythm'];

  const filteredGames = RELAX_GAMES.filter(
    (g) => selectedCategory === 'All' || g.category === selectedCategory
  );

  const activeGame = RELAX_GAMES.find((g) => g.id === selectedGameId);

  const renderActiveGameComponent = () => {
    switch (selectedGameId) {
      case 'breathing-bubble':
        return <BreathingBubble />;
      case 'bubble-wrap':
        return <BubbleWrapPop />;
      case 'zen-garden':
        return <ZenGardenDraw />;
      case 'color-match':
        return <ColorMatchCalm />;
      case 'gratitude-puzzle':
        return <GratitudePuzzle />;
      case 'mindful-maze':
        return <MindfulMaze />;
      case 'constellation':
        return <ConstellationConnect />;
      case 'word-release':
        return <WordCloudRelease />;
      case 'rhythm-tap':
        return <RhythmTapCalm />;
      case 'color-breathing':
        return <ColorBreathing />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* If a game is active, render the game player container with back button */}
      {selectedGameId && activeGame ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedGameId(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E252B] text-xs font-semibold text-[#4A8B8D] dark:text-[#6CB2B5] border border-[#E2D8C3] dark:border-[#2F3A46] shadow-2xs hover:bg-stone-50 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Game Pack</span>
            </button>
            <div className="text-xs text-[#718096] dark:text-[#A0AEC0] flex items-center gap-1.5">
              <span className="font-semibold text-[#2D3748] dark:text-white">{activeGame.title}</span>
              <span>•</span>
              <span>{activeGame.duration}</span>
            </div>
          </div>

          <div className="max-w-xl mx-auto">
            {renderActiveGameComponent()}
          </div>
        </div>
      ) : (
        /* Game Pack Grid View */
        <div className="space-y-5">
          {/* Header Banner */}
          <div className="p-5 rounded-2xl bg-linear-to-r from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-200/60 dark:border-teal-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#2C6E70] dark:text-[#6CB2B5] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                10 Low-Stimulation Mini-Games
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#2D3748] dark:text-white font-serif">
                Mind Relax Micro-Interactions
              </h3>
              <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-0.5">
                Zero timers, zero lose states, zero competitive pressure. Designed specifically to reduce sympathetic nervous tension between study sessions.
              </p>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#2C6E70] text-white shadow-xs font-semibold'
                    : 'bg-white dark:bg-[#1E252B] text-[#718096] dark:text-[#A0AEC0] hover:text-[#2D3748] border border-[#E8E2D5] dark:border-[#2F3A46]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Games Grid (10 Games) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredGames.map((game) => {
              const Icon = game.icon;
              return (
                <div
                  key={game.id}
                  onClick={() => setSelectedGameId(game.id)}
                  className="p-4 rounded-2xl bg-white dark:bg-[#1E252B] border border-[#E8E2D5] dark:border-[#2F3A46] shadow-2xs hover:shadow-md hover:border-[#2C6E70] dark:hover:border-[#6CB2B5] transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-2xs group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: game.accentColor }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold text-[#718096] dark:text-[#A0AEC0] bg-stone-100 dark:bg-[#252E38] px-2 py-0.5 rounded-md">
                        {game.duration}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#2D3748] dark:text-white group-hover:text-[#2C6E70] dark:group-hover:text-[#6CB2B5] transition-colors">
                        {game.title}
                      </h4>
                      <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-1 leading-relaxed">
                        {game.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-2 border-t border-[#F3EFE6] dark:border-[#27323C] flex items-center justify-between text-[11px] font-semibold text-[#2C6E70] dark:text-[#6CB2B5]">
                    <span>{game.category}</span>
                    <span className="group-hover:translate-x-1 transition-transform">Play →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
