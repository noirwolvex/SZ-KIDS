import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target } from 'lucide-react';
import GameShell, { type GameProps } from './GameShell';

const TARGETS = ['⭐', '🎈', '🎁', '🌟', '🍭', '🦄', '🌈', '⚡'];
const GRID = 9; // 3x3

type Target = { id: number; pos: number; emoji: string; born: number };

type Difficulty = 'slow' | 'fast';
const LIFETIME: Record<Difficulty, number> = { slow: 2200, fast: 1200 };
const SPAWN: Record<Difficulty, number> = { slow: 1000, fast: 600 };
const GAME_TIME = 30;


export default function ReactionRush({ onClose, onWin }: GameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('slow');
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(GAME_TIME);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [hitFlash, setHitFlash] = useState<number | null>(null);
  const idRef = useRef(0);
  const targetsRef = useRef<Target[]>([]);
  const scoreRef = useRef(0);
  const onWinRef = useRef(onWin);

  targetsRef.current = targets;
  scoreRef.current = score;
  onWinRef.current = onWin;

  const reset = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setTargets([]);
    setScore(0);
    setLives(3);
    setTime(GAME_TIME);
    setRunning(true);
    setStatus('playing');
    setHitFlash(null);
    idRef.current = 0;
  }, []);

  // Spawn loop
  useEffect(() => {
    if (!running) return;
    const spawn = setInterval(() => {
      const occupied = new Set(targetsRef.current.map((t) => t.pos));
      let pos = Math.floor(Math.random() * GRID);
      let tries = 0;
      while (occupied.has(pos) && tries < GRID) { pos = (pos + 1) % GRID; tries++; }
      const t: Target = {
        id: idRef.current++,
        pos,
        emoji: TARGETS[Math.floor(Math.random() * TARGETS.length)],
        born: Date.now(),
      };
      setTargets((cur) => [...cur, t]);
      // Expire after lifetime → miss
      setTimeout(() => {
        setTargets((cur) => {
          if (!cur.some((x) => x.id === t.id)) return cur;
          return cur.filter((x) => x.id !== t.id);
        });
        setLives((l) => {
          const nl = l - 1;
          if (nl <= 0) { setRunning(false); setStatus('lost'); }
          return nl;
        });
      }, LIFETIME[difficulty]);
    }, SPAWN[difficulty]);
    return () => clearInterval(spawn);
  }, [running, difficulty]);

  // Countdown
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTime((s) => {
        const ns = s - 1;
        if (ns <= 0) {
          setRunning(false);
          const stars = scoreRef.current >= 20 ? 3 : scoreRef.current >= 12 ? 2 : scoreRef.current >= 6 ? 1 : 0;
          setStatus(stars > 0 ? 'won' : 'lost');
          if (stars > 0) onWinRef.current(stars);
        }
        return ns;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const hit = (id: number) => {
    if (status !== 'playing') return;
    setTargets((cur) => cur.filter((t) => t.id !== id));
    setScore((s) => s + 1);
    setHitFlash(id);
    setTimeout(() => setHitFlash(null), 300);
  };

  const stars = score >= 20 ? 3 : score >= 12 ? 2 : score >= 6 ? 1 : 0;
  const diffs: Difficulty[] = ['slow', 'fast'];

  return (
    <GameShell
      title="Reaction Rush"
      gradient="from-lemon-200 to-peach-200"
      emoji="⚡"
      onClose={onClose}
      onRestart={() => reset(difficulty)}
      status={status}
      stars={stars}
      winMessage="Lightning Fast!"
      winDetail={`You hit ${score} targets in ${GAME_TIME} seconds!`}
      loseMessage="Out of Lives!"
      stats={[
        { icon: 'clock', value: `${time}s`, color: 'text-sky-500' },
        { icon: 'score', value: `${score}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💀', color: 'text-blush-500' },
      ]}
      difficultySelector={diffs.map((d) => (
        <button
          key={d}
          onClick={() => reset(d)}
          className={`px-4 py-1.5 rounded-2xl font-display font-semibold text-sm transition-all capitalize ${
            difficulty === d ? 'bg-lemon-400 text-white' : 'bg-lemon-100 text-lemon-500'
          }`}
        >
          {d === 'slow' ? '🐢 Slow' : '🐇 Fast'}
        </button>
      ))}
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4 text-lavender-400 font-display font-semibold text-sm">
          <Zap size={16} className="text-lemon-400" /> Tap the targets before they vanish!
        </div>

        {/* Timer bar */}
        <div className="max-w-xs mx-auto mb-5">
          <div className="h-3.5 rounded-full bg-lavender-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-lemon-300 to-peach-400"
              animate={{ width: `${(time / GAME_TIME) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* 3x3 grid */}
        <div className="inline-grid grid-cols-3 gap-2.5 p-3 rounded-3xl bg-lavender-100">
          {Array.from({ length: GRID }).map((_, pos) => {
            const target = targets.find((t) => t.pos === pos);
            return (
              <div
                key={pos}
                className="w-20 h-20 rounded-2xl bg-white/60 flex items-center justify-center relative overflow-hidden"
              >
                <AnimatePresence>
                  {target && (
                    <motion.button
                      key={target.id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      onClick={() => hit(target.id)}
                      className="absolute inset-0 flex items-center justify-center text-4xl active:scale-90"
                    >
                      <span className="drop-shadow-md">{target.emoji}</span>
                    </motion.button>
                  )}
                </AnimatePresence>
                {hitFlash !== null && !target && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute text-mint-400"
                  >
                    <Target size={28} />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex justify-center gap-6 text-sm font-display font-semibold">
          <span className="text-mint-500">✅ {score} hits</span>
          <span className="text-lavender-400">Goal: 6 / 12 / 20 for ⭐⭐⭐</span>
        </div>
      </div>
    </GameShell>
  );
}
