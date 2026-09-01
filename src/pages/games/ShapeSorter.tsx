import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';


type ShapeKind = 'circle' | 'square' | 'triangle';

const SHAPE_EMOJI: Record<ShapeKind, string> = {
  circle: '🔵',
  square: '🟥',
  triangle: '🔺',
};

const SHAPE_LABEL: Record<ShapeKind, string> = {
  circle: 'Circle',
  square: 'Square',
  triangle: 'Triangle',
};

const ALL_SHAPES: ShapeKind[] = ['circle', 'square', 'triangle'];

const randomShape = (): ShapeKind => ALL_SHAPES[Math.floor(Math.random() * ALL_SHAPES.length)];

const TIME_LIMIT = 30;

export default function ShapeSorter({ onClose, onWin }: GameProps) {
  const [current, setCurrent] = useState<ShapeKind>(() => randomShape());
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);
  const [time, setTime] = useState(TIME_LIMIT);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [feedback, setFeedback] = useState<{ basket: ShapeKind; correct: boolean } | null>(null);
  const [sorted, setSorted] = useState(0);

  const reset = useCallback(() => {
    setCurrent(randomShape());
    setScore(0);
    setLives(3);
    setTime(TIME_LIMIT);
    setRunning(true);
    setStatus('playing');
    setFeedback(null);
    setSorted(0);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTime((s) => {
        if (s <= 1) {
          setRunning(false);
          setStatus('won');
          onWin(computeStars(livesRef.current, 3));
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const handleSort = (basket: ShapeKind) => {
    if (status !== 'playing' || feedback) return;
    const correct = basket === current;
    if (correct) {
      setScore((s) => s + 1);
      setSorted((s) => s + 1);
      setFeedback({ basket, correct: true });
      setTimeout(() => {
        setCurrent(randomShape());
        setFeedback(null);
      }, 400);
    } else {
      setFeedback({ basket, correct: false });
      setLives((l) => {
        const nl = l - 1;
        livesRef.current = nl;
        if (nl <= 0) {
          setRunning(false);
          setStatus('lost');
        }
        return nl;
      });
      setTimeout(() => setFeedback(null), 500);
    }
  };

  const stars = computeStars(livesRef.current, 3);

  return (
    <GameShell
      title="Shape Sorter"
      gradient="from-lavender-200 to-blush-200"
      emoji="🔷"
      onClose={onClose}
      onRestart={reset}
      status={status}
      stars={stars}
      winMessage="Sorting Superstar!"
      winDetail={`You sorted ${score} shapes correctly in ${TIME_LIMIT} seconds!`}
      loseMessage="Time's up!"
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'score', value: `${score}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💔', color: 'text-blush-500' },
      ]}
    >
      <div className="text-center mb-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-display text-lg text-lavender-500"
        >
          Tap the basket that matches!
        </motion.p>
      </div>

      {/* Current shape */}
      <div className="flex justify-center mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current + sorted}
            initial={{ scale: 0, rotate: -180, y: -50 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            exit={{ scale: 0, y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-28 h-28 rounded-3xl bg-white shadow-soft-lg flex items-center justify-center"
          >
            <span className="text-6xl">{SHAPE_EMOJI[current]}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Baskets */}
      <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
        {ALL_SHAPES.map((shape) => {
          const isFeedback = feedback?.basket === shape;
          return (
            <motion.button
              key={shape}
              onClick={() => handleSort(shape)}
              disabled={!!feedback}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.92 }}
              animate={isFeedback && feedback?.correct ? { scale: [1, 1.15, 1] } : isFeedback ? { x: [-4, 4, -4, 4, 0] } : {}}
              className={`rounded-3xl p-5 shadow-soft transition-colors flex flex-col items-center gap-2 ${
                isFeedback && feedback?.correct
                  ? 'bg-mint-200 ring-2 ring-mint-400'
                  : isFeedback
                  ? 'bg-blush-200 ring-2 ring-blush-400'
                  : 'bg-white hover:bg-lavender-50'
              }`}
            >
              <span className="text-5xl">{SHAPE_EMOJI[shape]}</span>
              <span className="font-display font-bold text-sm text-lavender-500">{SHAPE_LABEL[shape]}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center mt-5 font-display font-bold text-lg ${
              feedback.correct ? 'text-mint-500' : 'text-blush-500'
            }`}
          >
            {feedback.correct ? '🎉 Sorted!' : '❌ Wrong basket!'}
          </motion.p>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
