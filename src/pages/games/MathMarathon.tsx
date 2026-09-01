import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X as XIcon, Zap } from 'lucide-react';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';

type Problem = { question: string; answer: number; options: number[] };

type Op = '+' | '-' | '×';

function generateProblem(level: number): Problem {
  const ops: Op[] = level <= 2 ? ['+', '-'] : ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;
  if (op === '+') {
    a = randInt(1, level * 5 + 5);
    b = randInt(1, level * 5 + 5);
    answer = a + b;
  } else if (op === '-') {
    a = randInt(1, level * 5 + 5);
    b = randInt(1, a);
    answer = a - b;
  } else {
    a = randInt(1, level + 3);
    b = randInt(1, level + 3);
    answer = a * b;
  }
  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const delta = randInt(-5, 5);
    if (delta !== 0) options.add(Math.max(0, answer + delta));
  }
  return {
    question: `${a} ${op} ${b}`,
    answer,
    options: shuffle(Array.from(options)),
  };
}

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


export default function MathMarathon({ onClose, onWin }: GameProps) {
  const [level, setLevel] = useState(2);
  const [problem, setProblem] = useState<Problem>(() => generateProblem(2));
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const totalNeeded = 10;

  const reset = useCallback((lvl: number) => {
    setLevel(lvl);
    setProblem(generateProblem(lvl));
    setSelected(null);
    setScore(0);
    setSolved(0);
    setLives(3);
    setTime(0);
    setRunning(true);
    setStatus('playing');
    setStreak(0);
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const handleSelect = (val: number) => {
    if (selected || status !== 'playing') return;
    setSelected(val);
    if (val === problem.answer) {
      setFeedback('correct');
      setScore((s) => s + 10 + streak * 5);
      setStreak((s) => s + 1);
      setSolved((s) => {
        const ns = s + 1;
        if (ns >= totalNeeded) {
          setStatus('won');
          setRunning(false);
          onWin(computeStars(lives, 3));
        } else {
          setTimeout(() => {
            setProblem(generateProblem(level));
            setSelected(null);
            setFeedback(null);
          }, 600);
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
      setTimeout(() => {
        if (lives > 1) {
          setProblem(generateProblem(level));
          setSelected(null);
          setFeedback(null);
        }
      }, 1000);
    }
  };

  const stars = computeStars(lives, 3);

  return (
    <GameShell
      title="Math Marathon"
      gradient="from-mint-200 to-sky-200"
      emoji="➕"
      onClose={onClose}
      onRestart={() => reset(level)}
      status={status}
      stars={stars}
      winMessage="Math Champion!"
      winDetail={`You solved ${solved} problems and scored ${score} points!`}
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'star', value: `${solved}/${totalNeeded}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💀', color: 'text-blush-500' },
      ]}
      difficultySelector={
        ([1, 2, 3] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => reset(lvl)}
            className={`px-4 py-1.5 rounded-2xl font-display font-semibold text-sm transition-all ${
              level === lvl ? 'bg-lavender-400 text-white' : 'bg-lavender-100 text-lavender-500'
            }`}
          >
            {lvl === 1 ? 'Easy' : lvl === 2 ? 'Medium' : 'Hard'}
          </button>
        ))
      }
    >
      <div className="text-center">
        {/* Streak indicator */}
        {streak >= 2 && (
          <motion.div
            initial={{ scale: 0, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-lemon-100 text-lemon-500 font-display font-bold mb-4"
          >
            <Zap size={16} /> {streak}x Streak! +{streak * 5} bonus
          </motion.div>
        )}

        {/* Score */}
        <div className="font-display text-2xl font-bold text-lavender-500 mb-4">
          Score: <span className="text-mint-500">{score}</span>
        </div>

        {/* Problem */}
        <motion.div
          key={solved}
          initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className={`relative inline-block px-10 py-6 rounded-4xl mb-6 transition-colors overflow-hidden ${
            feedback === 'correct' ? 'bg-mint-200 shadow-glow' :
            feedback === 'wrong' ? 'bg-blush-200 shadow-glow' :
            'bg-white shadow-soft'
          }`}
        >
          {/* Decorative corner shapes */}
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-lavender-100/50" />
          <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-mint-100/50" />
          <span className="relative text-5xl font-display font-bold text-lavender-500">
            {problem.question} = ?
          </span>
        </motion.div>

        {/* Options */}
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

        {/* Progress */}
        <div className="mt-6 max-w-xs mx-auto">
          <div className="flex justify-between text-xs text-lavender-400 mb-1">
            <span>Progress</span>
            <span>{solved}/{totalNeeded}</span>
          </div>
          <div className="h-3 rounded-full bg-lavender-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-mint-300 to-sky-400"
              animate={{ width: `${(solved / totalNeeded) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </GameShell>
  );
}
