import React, { useState } from 'react';
import { Heart, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';

interface PuzzlePiece {
  id: number;
  currentPos: number; // 0 to 8 (3x3 grid)
}

const GRATITUDE_PROMPTS = [
  'What is one small kindness someone showed you this week?',
  'What is a place on campus or home where you feel safe and unhurried?',
  'What is a song, sound, or warm drink that brought comfort today?',
  'What is one challenge you navigated recently with courage?',
];

export const GratitudePuzzle: React.FC = () => {
  // A peaceful mountain sunrise image split into a 3x3 grid
  const IMAGE_URL = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=360&auto=format&fit=crop&q=80';

  const generateShuffledPieces = () => {
    // 3x3 positions: [0, 1, 2, 3, 4, 5, 6, 7, 8]
    const initial = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const shuffled = [...initial].sort(() => Math.random() - 0.5);
    return initial.map((origId, idx) => ({
      id: origId,
      currentPos: shuffled[idx],
    }));
  };

  const [pieces, setPieces] = useState<PuzzlePiece[]>(generateShuffledPieces);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);

  // Check if pieces are solved: each piece with id N is at currentPos N
  const isSolved = pieces.every((p) => p.id === p.currentPos);

  const handlePieceClick = (pieceId: number) => {
    if (isSolved) return;

    if (selectedPieceId === null) {
      setSelectedPieceId(pieceId);
    } else {
      if (selectedPieceId === pieceId) {
        setSelectedPieceId(null);
        return;
      }

      // Swap positions
      setPieces((prev) => {
        const pieceA = prev.find((p) => p.id === selectedPieceId)!;
        const pieceB = prev.find((p) => p.id === pieceId)!;
        const posA = pieceA.currentPos;
        const posB = pieceB.currentPos;

        return prev.map((p) => {
          if (p.id === selectedPieceId) return { ...p, currentPos: posB };
          if (p.id === pieceId) return { ...p, currentPos: posA };
          return p;
        });
      });

      setSelectedPieceId(null);
    }
  };

  const handleReset = () => {
    setPieces(generateShuffledPieces());
    setSelectedPieceId(null);
    setPromptIndex((i) => (i + 1) % GRATITUDE_PROMPTS.length);
  };

  // Sort pieces by current visual position (0 to 8) to render them in order
  const sortedByPos = [...pieces].sort((a, b) => a.currentPos - b.currentPos);

  return (
    <div className="flex flex-col items-center p-6 rounded-3xl bg-[#FCFAF6] dark:bg-[#1A2228] border border-[#EBE4D5] dark:border-[#2D3945] min-h-[440px]">
      <div className="text-center mb-4">
        <h4 className="text-base font-serif font-bold text-[#2D3748] dark:text-white flex items-center justify-center gap-2">
          <Heart className="w-4 h-4 text-[#D97762]" />
          Gratitude Puzzle
        </h4>
        <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-0.5">
          Tap two tiles to swap them and restore the peaceful landscape.
        </p>
      </div>

      {/* 3x3 Puzzle Canvas */}
      <div className="w-[270px] h-[270px] grid grid-cols-3 gap-1 p-2 bg-[#8C765C] rounded-2xl shadow-md mb-4 relative">
        {sortedByPos.map((piece) => {
          const isSelected = selectedPieceId === piece.id;
          const origCol = piece.id % 3;
          const origRow = Math.floor(piece.id / 3);

          return (
            <button
              key={piece.id}
              type="button"
              onClick={() => handlePieceClick(piece.id)}
              className={`relative overflow-hidden rounded-lg transition-all cursor-pointer ${
                isSelected
                  ? 'ring-3 ring-amber-400 scale-95 z-10'
                  : 'hover:opacity-95'
              }`}
              style={{
                backgroundImage: `url(${IMAGE_URL})`,
                backgroundSize: '270px 270px',
                backgroundPosition: `-${origCol * 90}px -${origRow * 90}px`,
              }}
              aria-label={`Puzzle piece ${piece.id + 1}`}
            />
          );
        })}

        {isSolved && (
          <div className="absolute inset-2 bg-black/40 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-4 text-center text-white animate-in fade-in duration-500">
            <Sparkles className="w-7 h-7 text-amber-300 mb-2" />
            <div className="text-sm font-bold font-serif mb-1">Landscape Restored</div>
            <p className="text-xs text-amber-100/90 leading-relaxed italic">
              "{GRATITUDE_PROMPTS[promptIndex]}"
            </p>
          </div>
        )}
      </div>

      {/* Gratitude Prompt on completion */}
      {isSolved ? (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-center max-w-sm w-full mb-3">
          <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
            Take a deep breath and hold that memory in your mind.
          </p>
        </div>
      ) : (
        <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mb-3">
          {pieces.filter((p) => p.id === p.currentPos).length} of 9 tiles in place
        </p>
      )}

      <button
        type="button"
        onClick={handleReset}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#253039] text-[#718096] dark:text-[#CBD5E0] hover:text-[#2D3748] border border-[#DDD4C1] dark:border-[#384654] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Mix Again</span>
      </button>
    </div>
  );
};
