import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';


const NUMBERS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export default function NumberHunt({ onClose, onWin }: GameProps) {
  const [target, setTarget] = useState(5);
  const [maxNum, setMaxNum] = useState(10);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [feedback, setFeedback] = useState<{ n: number; correct: boolean } | null>(null);
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(5);
  const [collected, setCollected] = useState(0);

  const reset = useCallback((max: number) => {
    setMaxNum(max);
    setTarget(Math.floor(Math.random() * max) + 1);
    setFound(new Set());
    setLives(3);
    setTime(0);
    setRunning(true);
    setStatus('playing');
    setFeedback(null);
    setRound(1);
    setCollected(0);
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const handleClick = (n: number) => {
    if (status !== 'playing' || found.has(n)) return;
    if (n === target) {
      const nf = new Set(found);
      nf.add(n);
      setFound(nf);
      setFeedback({ n, correct: true });
      setCollected((c) => c + 1);
      setTimeout(() => {
        setFeedback(null);
        if (round >= totalRounds) {
          setStatus('won');
          setRunning(false);
          onWin(computeStars(lives, 3));
        } else {
          setRound((r) => r + 1);
          setTarget(Math.floor(Math.random() * maxNum) + 1);
          setFound(new Set());
        }
      }, 800);
    } else {
      setFeedback({ n, correct: false });
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) { setStatus('lost'); setRunning(false); }
        return nl;
      });
      setTimeout(() => setFeedback(null), 500);
    }
  };

  const stars = computeStars(lives, 3);

  return (
    <GameShell
      title="Number Hunt"
      gradient="from-blush-200 to-lavender-200"
      emoji="🔢"
      onClose={onClose}
      onRestart={() => reset(maxNum)}
      status={status}
      stars={stars}
      winMessage="Number Hunter!"
      winDetail={`You found ${collected} hidden numbers in ${formatTime(time)}!`}
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'star', value: `${round}/${totalRounds}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💀', color: 'text-blush-500' },
      ]}
      difficultySelector={
        ([5, 10, 15] as const).map((m) => (
          <button
            key={m}
            onClick={() => reset(m)}
            className={`px-4 py-1.5 rounded-2xl font-display font-semibold text-sm transition-all ${
              maxNum === m ? 'bg-lavender-400 text-white' : 'bg-lavender-100 text-lavender-500'
            }`}
          >
            {m === 5 ? 'Easy' : m === 10 ? 'Medium' : 'Hard'}
          </button>
        ))
      }
    >
      <div className="text-center mb-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-display text-lg text-lavender-500"
        >
          Find the number:
        </motion.p>
        <motion.div
          key={target}
          initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="relative inline-block mt-3 px-8 py-4 rounded-3xl bg-gradient-to-br from-blush-200 to-lavender-300 shadow-soft-lg"
        >
          <motion.div
            className="absolute inset-0 rounded-3xl bg-lavender-300/30 blur-xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="relative text-5xl font-display font-bold text-white drop-shadow-lg">{target}</span>
        </motion.div>
      </div>

      {/* Number grid */}
      <div className={`grid gap-2 ${maxNum <= 5 ? 'grid-cols-3' : maxNum <= 10 ? 'grid-cols-5' : 'grid-cols-5'}`}>
        {Array.from({ length: maxNum }, (_, i) => i + 1).map((n) => {
          const isFound = found.has(n);
          const isFeedback = feedback?.n === n;
          return (
            <motion.button
              key={n}
              whileHover={!isFound ? { scale: 1.1, y: -3 } : {}}
              whileTap={!isFound ? { scale: 0.9 } : {}}
              onClick={() => handleClick(n)}
              disabled={isFound || status !== 'playing'}
              className={`aspect-square rounded-2xl flex items-center justify-center text-2xl font-display font-bold transition-all ${
                isFound ? 'bg-mint-200 text-mint-500 scale-90 shadow-inner' :
                isFeedback && feedback?.correct ? 'bg-mint-300 text-white scale-110 shadow-glow' :
                isFeedback && !feedback?.correct ? 'bg-blush-300 text-white animate-wiggle' :
                'bg-white shadow-soft text-lavender-500 hover:bg-lavender-50 hover:shadow-glow'
              }`}
            >
              {isFound ? '✓' : n}
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
            className={`text-center mt-4 font-display font-bold ${feedback.correct ? 'text-mint-500' : 'text-blush-500'}`}
          >
            {feedback.correct ? '🎉 You found it!' : '❌ Not quite! Try again!'}
          </motion.p>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
