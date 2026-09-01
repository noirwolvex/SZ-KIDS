import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';


const ANIMALS = ['🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐸', '🐵', '🦁', '🐮', '🐷', '🐔'];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const makeRound = (maxCount: number) => {
  const count = Math.floor(Math.random() * maxCount) + 1;
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const others = shuffle(ANIMALS.filter((a) => a !== animal)).slice(0, 5);
  const emojis = shuffle([animal, ...others]).slice(0, count);
  // ensure we have enough; if count > available unique, repeat
  while (emojis.length < count) {
    emojis.push(ANIMALS[Math.floor(Math.random() * ANIMALS.length)]);
  }
  const options = shuffle([count, count + 1, count - 1, count + 2].filter((n) => n >= 1).slice(0, 4));
  // Ensure 4 unique options
  const optSet = new Set<number>([count]);
  let delta = 1;
  while (optSet.size < 4) {
    const v = count + delta;
    if (v >= 1) optSet.add(v);
    const v2 = count - delta;
    if (v2 >= 1) optSet.add(v2);
    delta++;
  }
  const finalOptions = shuffle(Array.from(optSet));
  return { count, emojis, options: finalOptions, animal };
};

export default function CountingFriends({ onClose, onWin }: GameProps) {
  const [maxCount, setMaxCount] = useState(10);
  const [round, setRound] = useState(() => makeRound(10));
  const [roundNum, setRoundNum] = useState(1);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [feedback, setFeedback] = useState<{ val: number; correct: boolean } | null>(null);
  const totalRounds = 8;

  const reset = useCallback((m: number) => {
    setMaxCount(m);
    setRound(makeRound(m));
    setRoundNum(1);
    setLives(3);
    setTime(0);
    setRunning(true);
    setStatus('playing');
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const handlePick = (val: number) => {
    if (status !== 'playing' || feedback) return;
    const correct = val === round.count;
    if (correct) {
      setFeedback({ val, correct: true });
      setTimeout(() => {
        if (roundNum >= totalRounds) {
          setStatus('won');
          setRunning(false);
          onWin(computeStars(lives, 3));
        } else {
          setRoundNum((r) => r + 1);
          setRound(makeRound(maxCount));
          setFeedback(null);
        }
      }, 800);
    } else {
      setFeedback({ val, correct: false });
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) { setStatus('lost'); setRunning(false); }
        return nl;
      });
      setTimeout(() => setFeedback(null), 600);
    }
  };

  const stars = computeStars(lives, 3);

  return (
    <GameShell
      title="Counting Friends"
      gradient="from-blush-200 to-peach-200"
      emoji="🐱"
      onClose={onClose}
      onRestart={() => reset(maxCount)}
      status={status}
      stars={stars}
      winMessage="Counting Star!"
      winDetail={`You counted all the way through ${totalRounds} rounds in ${formatTime(time)}!`}
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'star', value: `${roundNum}/${totalRounds}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💔', color: 'text-blush-500' },
      ]}
      difficultySelector={
        ([5, 10, 15] as const).map((m) => (
          <button
            key={m}
            onClick={() => reset(m)}
            className={`px-4 py-1.5 rounded-2xl font-display font-semibold text-sm transition-all ${
              maxCount === m ? 'bg-lavender-400 text-white shadow-soft' : 'bg-lavender-100 text-lavender-500 hover:bg-lavender-200'
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
          className="font-display text-xl text-lavender-500"
        >
          How many animals do you see?
        </motion.p>
      </div>

      <motion.div
        key={roundNum}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="min-h-[120px] flex flex-wrap justify-center items-center gap-2 mb-8 p-4 rounded-3xl bg-white/60 shadow-soft"
      >
        {round.emojis.map((e, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 200 }}
            className="text-4xl"
          >
            {e}
          </motion.span>
        ))}
      </motion.div>

      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        {round.options.map((opt) => {
          const isFeedback = feedback?.val === opt;
          return (
            <motion.button
              key={opt}
              onClick={() => handlePick(opt)}
              disabled={!!feedback}
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.92 }}
              animate={isFeedback && feedback?.correct ? { scale: [1, 1.2, 1] } : isFeedback ? { x: [-4, 4, -4, 4, 0] } : {}}
              className={`py-5 rounded-3xl font-display font-bold text-3xl shadow-soft transition-colors ${
                isFeedback && feedback?.correct
                  ? 'bg-mint-300 text-white'
                  : isFeedback
                  ? 'bg-blush-300 text-white'
                  : 'bg-white text-lavender-500 hover:bg-lavender-50'
              }`}
            >
              {opt}
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
            {feedback.correct ? '🎉 That\'s right!' : '❌ Count again!'}
          </motion.p>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
