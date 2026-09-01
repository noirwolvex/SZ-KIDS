import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';

type Shape = { id: string; emoji: string; label: string };

const SHAPES: Shape[] = [
  { id: 'circle', emoji: '🔵', label: 'Circle' },
  { id: 'square', emoji: '🟦', label: 'Square' },
  { id: 'triangle', emoji: '🔺', label: 'Triangle' },
  { id: 'star', emoji: '⭐', label: 'Star' },
  { id: 'heart', emoji: '💗', label: 'Heart' },
  { id: 'diamond', emoji: '🔷', label: 'Diamond' },
];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};


export default function ShapePuzzle({ onClose, onWin }: GameProps) {
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(4);
  const [count, setCount] = useState(4);
  const [shapes, setShapes] = useState<Shape[]>(() => shuffle(SHAPES).slice(0, 4));
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const [dragging, setDragging] = useState<string | null>(null);
  const [hoverTarget, setHoverTarget] = useState<string | null>(null);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [wrong, setWrong] = useState<string | null>(null);

  const reset = useCallback((c: number, r = 1) => {
    setCount(c);
    setRound(r);
    setShapes(shuffle(SHAPES).slice(0, c));
    setPlaced(new Set());
    setLives(3);
    setTime(0);
    setRunning(true);
    setStatus('playing');
    setDragging(null);
    setHoverTarget(null);
    setWrong(null);
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const handleDrop = (targetId: string) => {
    if (!dragging || placed.has(targetId) || status !== 'playing') return;
    if (dragging === targetId) {
      const np = new Set(placed);
      np.add(targetId);
      setPlaced(np);
      if (np.size === shapes.length) {
        if (round >= totalRounds) {
          setStatus('won');
          setRunning(false);
          onWin(computeStars(lives, 3));
        } else {
          setTimeout(() => {
            setRound((r) => r + 1);
            setShapes(shuffle(SHAPES).slice(0, count));
            setPlaced(new Set());
          }, 800);
        }
      }
    } else {
      setWrong(targetId);
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) { setStatus('lost'); setRunning(false); }
        return nl;
      });
      setTimeout(() => setWrong(null), 500);
    }
    setDragging(null);
    setHoverTarget(null);
  };

  const stars = computeStars(lives, 3);

  return (
    <GameShell
      title="Shape Puzzle"
      gradient="from-lavender-200 to-sky-200"
      emoji="🧩"
      onClose={onClose}
      onRestart={() => reset(count)}
      status={status}
      stars={stars}
      winMessage="Puzzle Master!"
      winDetail={`Completed ${totalRounds} rounds in ${formatTime(time)}!`}
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'star', value: `${round}/${totalRounds}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💀', color: 'text-blush-500' },
      ]}
      difficultySelector={
        ([3, 4, 6] as const).map((c) => (
          <button
            key={c}
            onClick={() => { setTotalRounds(c === 3 ? 3 : c === 4 ? 4 : 5); reset(c); }}
            className={`px-4 py-1.5 rounded-2xl font-display font-semibold text-sm transition-all ${
              count === c ? 'bg-lavender-400 text-white' : 'bg-lavender-100 text-lavender-500'
            }`}
          >
            {c === 3 ? 'Easy' : c === 4 ? 'Medium' : 'Hard'}
          </button>
        ))
      }
    >
      <div className="mb-5 text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-lg text-lavender-500"
        >
          Drag each shape to its matching outline!
        </motion.p>
        <div className="flex justify-center gap-1.5 mt-2">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < round - 1 ? 'bg-mint-400' : i === round - 1 ? 'bg-lavender-400' : 'bg-lavender-100'}`} />
          ))}
        </div>
      </div>

      {/* Drop targets (outlines) */}
      <div className={`grid gap-4 mb-8 ${count <= 3 ? 'grid-cols-3' : count === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
        {shapes.map((s) => {
          const isPlaced = placed.has(s.id);
          const isHover = hoverTarget === s.id;
          const isWrong = wrong === s.id;
          return (
            <div
              key={`target-${s.id}`}
              onDragOver={(e) => { e.preventDefault(); setHoverTarget(s.id); }}
              onDragLeave={() => setHoverTarget(null)}
              onDrop={() => handleDrop(s.id)}
              className={`aspect-square rounded-3xl border-4 border-dashed flex items-center justify-center text-5xl transition-all ${
                isPlaced ? 'border-mint-400 bg-mint-100 shadow-soft' :
                isHover ? 'border-sky-400 bg-sky-50 scale-105' :
                isWrong ? 'border-blush-400 bg-blush-100 animate-wiggle' :
                'border-lavender-200 bg-lavender-50'
              }`}
            >
              {isPlaced ? (
                <motion.span initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
                  {s.emoji}
                </motion.span>
              ) : (
                <span className="opacity-15 grayscale">{s.emoji}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Draggable shapes */}
      <div className="border-t-2 border-lavender-100 pt-6">
        <p className="text-center text-sm font-display font-semibold text-lavender-400 mb-3">Drag from here</p>
        <div className="flex flex-wrap justify-center gap-3">
          {shapes.filter((s) => !placed.has(s.id)).map((s) => (
            <motion.div
              key={`drag-${s.id}`}
              draggable
              onDragStart={() => setDragging(s.id)}
              onDragEnd={() => { setDragging(null); setHoverTarget(null); }}
              whileHover={{ scale: 1.12, y: -4, rotate: -3 }}
              whileTap={{ scale: 0.95 }}
              className={`w-16 h-16 rounded-2xl bg-white shadow-soft flex items-center justify-center text-4xl cursor-grab active:cursor-grabbing transition-shadow hover:shadow-glow ${
                dragging === s.id ? 'opacity-40' : ''
              }`}
            >
              {s.emoji}
            </motion.div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
