import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';


const SHAPES = ['🔵', '🔴', '🟢', '🟡', '🟣', '🟠'];
const EMOJI_SETS = [SHAPES, ['⭐', '🌙', '☀️', '⚡', '🌈', '❄️'], ['🍎', '🍌', '🍇', '🍓', '🍊', '🥝']];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

type Difficulty = 'easy' | 'medium' | 'hard';

const makeRound = (diff: Difficulty) => {
  const setIdx = Math.floor(Math.random() * EMOJI_SETS.length);
  const set = EMOJI_SETS[setIdx];
  const patternLen = diff === 'easy' ? 5 : diff === 'medium' ? 7 : 9;
  const numItems = diff === 'easy' ? 2 : diff === 'medium' ? 3 : 4;
  const items = shuffle(set).slice(0, numItems);
  // Build a repeating pattern
  const pattern: string[] = [];
  for (let i = 0; i < patternLen; i++) {
    pattern.push(items[i % items.length]);
  }
  const blankIdx = patternLen - 1; // last item is blank
  const correct = pattern[blankIdx];
  const wrong = shuffle(set.filter((s) => s !== correct)).slice(0, 3);
  const options = shuffle([correct, ...wrong]);
  return { pattern, blankIdx, options, correct, setIdx };
};

export default function PatternParty({ onClose, onWin }: GameProps) {
  const [diff, setDiff] = useState<Difficulty>('easy');
  const [round, setRound] = useState(() => makeRound('easy'));
  const [roundNum, setRoundNum] = useState(1);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [feedback, setFeedback] = useState<{ idx: number; correct: boolean } | null>(null);
  const totalRounds = 8;

  const reset = useCallback((d: Difficulty) => {
    setDiff(d);
    setRound(makeRound(d));
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
    const correct = round.options[idx] === round.correct;
    if (correct) {
      setFeedback({ idx, correct: true });
      setTimeout(() => {
        if (roundNum >= totalRounds) {
          setStatus('won');
          setRunning(false);
          onWin(computeStars(lives, 3));
        } else {
          setRoundNum((r) => r + 1);
          setRound(makeRound(diff));
          setFeedback(null);
        }
      }, 800);
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
      title="Pattern Party"
      gradient="from-lemon-200 to-mint-200"
      emoji="🔵"
      onClose={onClose}
      onRestart={() => reset(diff)}
      status={status}
      stars={stars}
      winMessage="Pattern Pro!"
      winDetail={`You solved all ${totalRounds} patterns in ${formatTime(time)}!`}
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'star', value: `${roundNum}/${totalRounds}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💔', color: 'text-blush-500' },
      ]}
      difficultySelector={
        (['easy', 'medium', 'hard'] as const).map((d) => (
          <button
            key={d}
            onClick={() => reset(d)}
            className={`px-4 py-1.5 rounded-2xl font-display font-semibold text-sm capitalize transition-all ${
              diff === d ? 'bg-lavender-400 text-white shadow-soft' : 'bg-lavender-100 text-lavender-500 hover:bg-lavender-200'
            }`}
          >
            {d}
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
          What comes next in the pattern?
        </motion.p>
      </div>

      <motion.div
        key={roundNum}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap justify-center items-center gap-2 mb-8 p-5 rounded-3xl bg-white/60 shadow-soft min-h-[100px]"
      >
        {round.pattern.map((item, i) => (
          i === round.blankIdx ? (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-14 h-14 rounded-2xl border-4 border-dashed border-lavender-300 flex items-center justify-center bg-lavender-50"
            >
              <span className="text-2xl">❓</span>
            </motion.div>
          ) : (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
              className="text-4xl"
            >
              {item}
            </motion.span>
          )
        ))}
      </motion.div>

      <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
        {round.options.map((opt, i) => {
          const isFeedback = feedback?.idx === i;
          return (
            <motion.button
              key={opt + i}
              onClick={() => handlePick(i)}
              disabled={!!feedback}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.88 }}
              animate={isFeedback && feedback?.correct ? { scale: [1, 1.3, 1] } : isFeedback ? { x: [-4, 4, -4, 4, 0] } : {}}
              className={`aspect-square rounded-3xl flex items-center justify-center text-4xl shadow-soft transition-colors ${
                isFeedback && feedback?.correct
                  ? 'bg-mint-200 ring-2 ring-mint-400'
                  : isFeedback
                  ? 'bg-blush-200 ring-2 ring-blush-400'
                  : 'bg-white hover:bg-lavender-50'
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
            {feedback.correct ? '🎉 Pattern solved!' : '❌ Look carefully!'}
          </motion.p>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
