import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X as XIcon, Zap } from 'lucide-react';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';

type Problem = { a: number; b: number; answer: number; options: number[] };

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateProblem(maxTable: number): Problem {
  const a = randInt(2, maxTable);
  const b = randInt(2, maxTable);
  const answer = a * b;
  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const delta = randInt(-6, 6);
    if (delta !== 0) options.add(Math.max(0, answer + delta));
  }
  return { a, b, answer, options: shuffle(Array.from(options)) };
}

type Difficulty = 'easy' | 'medium' | 'hard';
const MAX_TABLE: Record<Difficulty, number> = { easy: 5, medium: 10, hard: 12 };
const TOTAL = 10;


export default function MultiplyQuest({ onClose, onWin }: GameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [problem, setProblem] = useState<Problem>(() => generateProblem(5));
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const reset = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setProblem(generateProblem(MAX_TABLE[diff]));
    setSelected(null);
    setScore(0);
    setSolved(0);
    setLives(3);
    setStreak(0);
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

  const advance = () => {
    setProblem(generateProblem(MAX_TABLE[difficulty]));
    setSelected(null);
    setFeedback(null);
  };

  const handleSelect = (val: number) => {
    if (selected || status !== 'playing') return;
    setSelected(val);
    if (val === problem.answer) {
      setFeedback('correct');
      setScore((s) => s + 10 + streak * 5);
      setStreak((s) => s + 1);
      setSolved((s) => {
        const ns = s + 1;
        if (ns >= TOTAL) {
          setStatus('won');
          setRunning(false);
          onWin(computeStars(lives, 3));
        } else {
          setTimeout(advance, 600);
        }
        return ns;
      });
    } else {
      setFeedback('wrong');
      setStreak(0);
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) { setStatus('lost'); setRunning(false); }
        return nl;
      });
      setTimeout(() => { if (lives > 1) advance(); }, 1000);
    }
  };

  const stars = computeStars(lives, 3);
  const diffs: Difficulty[] = ['easy', 'medium', 'hard'];

  return (
    <GameShell
      title="Multiply Quest"
      gradient="from-mint-200 to-lemon-200"
      emoji="✖️"
      onClose={onClose}
      onRestart={() => reset(difficulty)}
      status={status}
      stars={stars}
      winMessage="Times Table Hero!"
      winDetail={`You solved ${solved} problems and scored ${score} points!`}
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'score', value: `${score}`, color: 'text-mint-500' },
        { icon: 'star', value: `${solved}/${TOTAL}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💀', color: 'text-blush-500' },
      ]}
      difficultySelector={diffs.map((d) => (
        <button
          key={d}
          onClick={() => reset(d)}
          className={`px-4 py-1.5 rounded-2xl font-display font-semibold text-sm transition-all ${
            difficulty === d ? 'bg-mint-400 text-white' : 'bg-mint-100 text-mint-500'
          }`}
        >
          {d === 'easy' ? 'Tables 2-5' : d === 'medium' ? 'Tables 2-10' : 'Tables 2-12'}
        </button>
      ))}
    >
      <div className="text-center">
        {streak >= 2 && (
          <motion.div
            initial={{ scale: 0, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-lemon-100 text-lemon-500 font-display font-bold mb-4"
          >
            <Zap size={16} /> {streak}x Streak! +{streak * 5} bonus
          </motion.div>
        )}

        <div className="font-display text-2xl font-bold text-lavender-500 mb-4">
          Score: <span className="text-mint-500">{score}</span>
        </div>

        <motion.div
          key={solved}
          initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className={`relative inline-block px-10 py-6 rounded-4xl mb-6 overflow-hidden ${
            feedback === 'correct' ? 'bg-mint-200 shadow-glow' :
            feedback === 'wrong' ? 'bg-blush-200 shadow-glow' : 'bg-white shadow-soft'
          }`}
        >
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-lemon-100/50" />
          <span className="relative text-5xl font-display font-bold text-lavender-500">
            {problem.a} × {problem.b} = ?
          </span>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {problem.options.map((opt) => {
            const isCorrect = opt === problem.answer;
            let style = 'bg-white border-lavender-100 text-lavender-500 hover:bg-lavender-50 hover:border-lavender-200';
            if (selected === opt && isCorrect) style = 'bg-mint-200 border-mint-400 text-mint-500 shadow-glow';
            else if (selected === opt && !isCorrect) style = 'bg-blush-200 border-blush-400 text-blush-500';
            else if (selected && isCorrect) style = 'bg-mint-100 border-mint-300 text-mint-400';
            return (
              <motion.button
                key={opt}
                whileHover={!selected ? { scale: 1.05, y: -2 } : {}}
                whileTap={!selected ? { scale: 0.95 } : {}}
                onClick={() => handleSelect(opt)}
                disabled={!!selected}
                className={`relative p-4 rounded-2xl border-2 font-display font-bold text-2xl transition-colors ${style}`}
              >
                {opt}
                {selected === opt && isCorrect && <Check size={18} className="absolute top-2 right-2 text-mint-500" />}
                {selected === opt && !isCorrect && <XIcon size={18} className="absolute top-2 right-2 text-blush-500" />}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-6 max-w-xs mx-auto">
          <div className="flex justify-between text-xs text-lavender-400 mb-1">
            <span>Progress</span>
            <span>{solved}/{TOTAL}</span>
          </div>
          <div className="h-3 rounded-full bg-lavender-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-mint-300 to-lemon-400"
              animate={{ width: `${(solved / TOTAL) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </GameShell>
  );
}
