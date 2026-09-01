import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X as XIcon } from 'lucide-react';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';

type Problem = {
  question: string;
  numerator: number;
  denominator: number;
  total: number;
  answer: number;
  options: number[];
};

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateProblem(mode: 'simple' | 'mixed' | 'addition'): Problem {
  const denominators = [2, 3, 4, 6, 8];
  const denominator = denominators[randInt(0, denominators.length - 1)];
  const total = denominator * randInt(1, 2);
  const numerator = randInt(1, denominator - 1);
  const answer = (total * numerator) / denominator;

  if (mode === 'addition') {
    const d2 = denominators[randInt(0, denominators.length - 1)];
    const n2 = randInt(1, d2 - 1);
    const ans2 = (total * n2) / d2;
    const sum = answer + ans2;
    const options = new Set<number>([sum]);
    while (options.size < 4) {
      const delta = randInt(-4, 4);
      if (delta !== 0) options.add(Math.max(0, sum + delta));
    }
    return {
      question: `What is ${numerator}/${denominator} + ${n2}/${d2} of ${total} slices?`,
      numerator, denominator, total, answer: sum, options: shuffle(Array.from(options)),
    };
  }

  if (mode === 'mixed') {
    const whole = randInt(1, 3);
    const sum = whole * total + answer;
    const options = new Set<number>([sum]);
    while (options.size < 4) {
      const delta = randInt(-5, 5);
      if (delta !== 0) options.add(Math.max(0, sum + delta));
    }
    return {
      question: `What is ${whole} and ${numerator}/${denominator} of ${total} slices?`,
      numerator, denominator, total, answer: sum, options: shuffle(Array.from(options)),
    };
  }

  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const delta = randInt(-4, 4);
    if (delta !== 0) options.add(Math.max(0, answer + delta));
  }
  return {
    question: `What is ${numerator}/${denominator} of ${total} slices?`,
    numerator, denominator, total, answer, options: shuffle(Array.from(options)),
  };
}

type Difficulty = 'simple' | 'mixed' | 'addition';
const TOTAL = 8;


export default function FractionPizza({ onClose, onWin }: GameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('simple');
  const [problem, setProblem] = useState<Problem>(() => generateProblem('simple'));
  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const reset = useCallback((mode: Difficulty) => {
    setDifficulty(mode);
    setProblem(generateProblem(mode));
    setSelected(null);
    setSolved(0);
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

  const advance = () => {
    setProblem(generateProblem(difficulty));
    setSelected(null);
    setFeedback(null);
  };

  const handleSelect = (val: number) => {
    if (selected || status !== 'playing') return;
    setSelected(val);
    if (val === problem.answer) {
      setFeedback('correct');
      setSolved((s) => {
        const ns = s + 1;
        if (ns >= TOTAL) {
          setStatus('won');
          setRunning(false);
          onWin(computeStars(lives, 3));
        } else {
          setTimeout(advance, 700);
        }
        return ns;
      });
    } else {
      setFeedback('wrong');
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) { setStatus('lost'); setRunning(false); }
        return nl;
      });
      setTimeout(() => { if (lives > 1) advance(); }, 1000);
    }
  };

  const stars = computeStars(lives, 3);
  const diffs: Difficulty[] = ['simple', 'mixed', 'addition'];
  const highlighted = Math.round((problem.total * problem.numerator) / problem.denominator);

  return (
    <GameShell
      title="Fraction Pizza"
      gradient="from-peach-200 to-blush-200"
      emoji="🍕"
      onClose={onClose}
      onRestart={() => reset(difficulty)}
      status={status}
      stars={stars}
      winMessage="Fraction Master!"
      winDetail={`You solved ${solved} fraction problems in ${formatTime(time)}!`}
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'star', value: `${solved}/${TOTAL}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💀', color: 'text-blush-500' },
      ]}
      difficultySelector={diffs.map((d) => (
        <button
          key={d}
          onClick={() => reset(d)}
          className={`px-4 py-1.5 rounded-2xl font-display font-semibold text-sm transition-all capitalize ${
            difficulty === d ? 'bg-peach-400 text-white' : 'bg-peach-100 text-peach-500'
          }`}
        >
          {d}
        </button>
      ))}
    >
      <div className="text-center">
        <motion.p
          key={solved}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-xl font-bold text-lavender-500 mb-4"
        >
          {problem.question}
        </motion.p>

        {/* Pizza visual */}
        <div className="flex flex-wrap justify-center gap-1 max-w-xs mx-auto mb-6">
          {Array.from({ length: problem.total }).map((_, i) => (
            <motion.span
              key={`${solved}-${i}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 200 }}
              className={`text-3xl ${i < highlighted ? 'opacity-100' : 'opacity-25 grayscale'}`}
            >
              🍕
            </motion.span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {problem.options.map((opt) => {
            const isCorrect = opt === problem.answer;
            let style = 'bg-white border-peach-100 text-lavender-500 hover:bg-peach-50 hover:border-peach-200';
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
              className="h-full rounded-full bg-gradient-to-r from-peach-300 to-blush-400"
              animate={{ width: `${(solved / TOTAL) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </GameShell>
  );
}
