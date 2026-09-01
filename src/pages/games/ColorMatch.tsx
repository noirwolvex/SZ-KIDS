import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';


type Color = { name: string; hex: string };

const PALETTE: Color[] = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Yellow', hex: '#FACC15' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Orange', hex: '#F97316' },
];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const makeRound = (choices: number) => {
  const picked = shuffle(PALETTE).slice(0, choices);
  const target = picked[Math.floor(Math.random() * picked.length)];
  return { target, options: shuffle(picked) };
};

export default function ColorMatch({ onClose, onWin }: GameProps) {
  const [choices, setChoices] = useState(4);
  const [round, setRound] = useState(() => makeRound(4));
  const [roundNum, setRoundNum] = useState(1);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [feedback, setFeedback] = useState<{ idx: number; correct: boolean } | null>(null);
  const totalRounds = 8;

  const reset = useCallback((c: number) => {
    setChoices(c);
    setRound(makeRound(c));
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

  const handlePick = (idx: number) => {
    if (status !== 'playing' || feedback) return;
    const correct = round.options[idx].name === round.target.name;
    if (correct) {
      setFeedback({ idx, correct: true });
      setTimeout(() => {
        if (roundNum >= totalRounds) {
          setStatus('won');
          setRunning(false);
          onWin(computeStars(lives, 3));
        } else {
          setRoundNum((r) => r + 1);
          setRound(makeRound(choices));
          setFeedback(null);
        }
      }, 700);
    } else {
      setFeedback({ idx, correct: false });
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
      title="Color Match"
      gradient="from-peach-200 to-lemon-200"
      emoji="🎨"
      onClose={onClose}
      onRestart={() => reset(choices)}
      status={status}
      stars={stars}
      winMessage="Color Champion!"
      winDetail={`You matched all ${totalRounds} colors in ${formatTime(time)}!`}
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'star', value: `${roundNum}/${totalRounds}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💔', color: 'text-blush-500' },
      ]}
      difficultySelector={
        ([3, 4, 6] as const).map((c) => (
          <button
            key={c}
            onClick={() => reset(c)}
            className={`px-4 py-1.5 rounded-2xl font-display font-semibold text-sm transition-all ${
              choices === c ? 'bg-lavender-400 text-white shadow-soft' : 'bg-lavender-100 text-lavender-500 hover:bg-lavender-200'
            }`}
          >
            {c === 3 ? 'Easy' : c === 4 ? 'Medium' : 'Hard'}
          </button>
        ))
      }
    >
      <div className="text-center mb-8">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-lg text-lavender-400"
        >
          Tap the color
        </motion.p>
        <motion.div
          key={round.target.name + roundNum}
          initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="inline-block mt-3 px-10 py-5 rounded-3xl bg-gradient-to-br from-peach-100 to-lemon-100 shadow-soft-lg"
        >
          <span className="font-display text-5xl font-bold text-lavender-500 drop-shadow-sm">
            {round.target.name}
          </span>
        </motion.div>
      </div>

      <div className={`grid gap-4 mx-auto max-w-md ${
        choices <= 3 ? 'grid-cols-3' : choices === 4 ? 'grid-cols-2' : 'grid-cols-3'
      }`}>
        {round.options.map((color, i) => {
          const isFeedback = feedback?.idx === i;
          return (
            <motion.button
              key={color.name + i}
              onClick={() => handlePick(i)}
              disabled={!!feedback}
              whileHover={{ scale: 1.08, y: -4 }}
              whileTap={{ scale: 0.9 }}
              animate={isFeedback && feedback?.correct ? { scale: [1, 1.3, 1] } : isFeedback ? { x: [-4, 4, -4, 4, 0] } : {}}
              className="aspect-square rounded-full shadow-soft-lg flex items-center justify-center relative"
              style={{ backgroundColor: color.hex }}
              aria-label={color.name}
            >
              {isFeedback && feedback?.correct && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-4xl">✓</motion.span>
              )}
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
            className={`text-center mt-6 font-display font-bold text-lg ${
              feedback.correct ? 'text-mint-500' : 'text-blush-500'
            }`}
          >
            {feedback.correct ? '🎉 Perfect match!' : '❌ Try again!'}
          </motion.p>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
