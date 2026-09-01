import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X as XIcon, Zap } from 'lucide-react';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';

type WordEntry = { word: string; definition: string };
type Question = { entry: WordEntry; options: string[] };

const WORDS: WordEntry[] = [
  { word: 'Enormous', definition: 'Very, very big in size' },
  { word: 'Fragile', definition: 'Easily broken or damaged' },
  { word: 'Ancient', definition: 'Very old, from long ago' },
  { word: 'Rapid', definition: 'Moving very quickly' },
  { word: 'Glimpse', definition: 'A quick, short look at something' },
  { word: 'Courageous', definition: 'Brave and not afraid' },
  { word: 'Peculiar', definition: 'Strange or unusual' },
  { word: 'Vivid', definition: 'Very bright and colorful' },
  { word: 'Cautious', definition: 'Being careful to avoid danger' },
  { word: 'Triumph', definition: 'A great victory or success' },
  { word: 'Wander', definition: 'To walk around without a plan' },
  { word: 'Murmur', definition: 'To speak very softly and quietly' },
  { word: 'Sturdy', definition: 'Strong and solidly built' },
  { word: 'Glimmer', definition: 'A faint or unsteady light' },
  { word: 'Diligent', definition: 'Working hard and carefully' },
  { word: 'Cozy', definition: 'Warm and comfortable' },
  { word: 'Vast', definition: 'Extremely large in area' },
  { word: 'Soggy', definition: 'Very wet and soft' },
];

const DISTRACTORS = [
  'Very small and tiny', 'Always moving slowly', 'Loud and noisy',
  'Cold and frozen', 'Made of metal', 'Found only in water',
  'Happening at night', 'A type of plant', 'Used for cooking',
  'Very sour tasting', 'Full of holes', 'Shaped like a circle',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeQuestion(pool: WordEntry[], used: Set<string>): Question {
  const available = pool.filter((w) => !used.has(w.word));
  const entry = available[Math.floor(Math.random() * available.length)];
  const distract = shuffle(DISTRACTORS.filter((d) => d !== entry.definition)).slice(0, 3);
  return { entry, options: shuffle([entry.definition, ...distract]) };
}

type Difficulty = 'common' | 'intermediate' | 'advanced';
const TOTAL = 6;

const POOLS: Record<Difficulty, WordEntry[]> = {
  common: WORDS.slice(14),
  intermediate: WORDS.slice(6, 14),
  advanced: WORDS.slice(0, 8),
};


export default function VocabMatch({ onClose, onWin }: GameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('common');
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [question, setQuestion] = useState<Question>(() => makeQuestion(POOLS.common, new Set()));
  const [selected, setSelected] = useState<string | null>(null);
  const [solved, setSolved] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const reset = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    const fresh = new Set<string>();
    setUsed(fresh);
    setQuestion(makeQuestion(POOLS[diff], fresh));
    setSelected(null);
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
    const nu = new Set(used);
    nu.add(question.entry.word);
    setUsed(nu);
    setQuestion(makeQuestion(POOLS[difficulty], nu));
    setSelected(null);
    setFeedback(null);
  };

  const handleSelect = (opt: string) => {
    if (selected || status !== 'playing') return;
    setSelected(opt);
    if (opt === question.entry.definition) {
      setFeedback('correct');
      setStreak((s) => s + 1);
      setSolved((s) => {
        const ns = s + 1;
        if (ns >= TOTAL) {
          setStatus('won');
          setRunning(false);
          onWin(computeStars(lives, 3));
        } else {
          setTimeout(advance, 800);
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
      setTimeout(() => { if (lives > 1) advance(); }, 1200);
    }
  };

  const stars = computeStars(lives, 3);
  const diffs: Difficulty[] = ['common', 'intermediate', 'advanced'];

  return (
    <GameShell
      title="Vocab Match"
      gradient="from-lavender-200 to-sky-200"
      emoji="📚"
      onClose={onClose}
      onRestart={() => reset(difficulty)}
      status={status}
      stars={stars}
      winMessage="Word Wizard!"
      winDetail={`You matched ${solved} words in ${formatTime(time)}!`}
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
            difficulty === d ? 'bg-lavender-400 text-white' : 'bg-lavender-100 text-lavender-500'
          }`}
        >
          {d}
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
            <Zap size={16} /> {streak}x Streak!
          </motion.div>
        )}

        <p className="text-lavender-400 font-display mb-2">What does this word mean?</p>

        <motion.div
          key={solved}
          initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className={`relative inline-block px-10 py-6 rounded-4xl mb-6 overflow-hidden ${
            feedback === 'correct' ? 'bg-mint-200 shadow-glow' :
            feedback === 'wrong' ? 'bg-blush-200' : 'bg-white shadow-soft'
          }`}
        >
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-lavender-100/50" />
          <span className="relative text-4xl font-display font-bold text-lavender-500">
            {question.entry.word}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 gap-2.5 max-w-sm mx-auto">
          {question.options.map((opt) => {
            const isCorrect = opt === question.entry.definition;
            let style = 'bg-white border-lavender-100 text-lavender-500 hover:bg-lavender-50 hover:border-lavender-200';
            if (selected === opt && isCorrect) style = 'bg-mint-200 border-mint-400 text-mint-500 shadow-glow';
            else if (selected === opt && !isCorrect) style = 'bg-blush-200 border-blush-400 text-blush-500';
            else if (selected && isCorrect) style = 'bg-mint-100 border-mint-300 text-mint-400';
            return (
              <motion.button
                key={opt}
                whileHover={!selected ? { scale: 1.02, x: 2 } : {}}
                whileTap={!selected ? { scale: 0.98 } : {}}
                onClick={() => handleSelect(opt)}
                disabled={!!selected}
                className={`relative p-3.5 rounded-2xl border-2 font-display font-semibold text-base transition-colors text-left ${style}`}
              >
                <span className="flex items-center gap-2">
                  {selected === opt && isCorrect && <Check size={18} className="text-mint-500 shrink-0" />}
                  {selected === opt && !isCorrect && <XIcon size={18} className="text-blush-500 shrink-0" />}
                  {opt}
                </span>
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
              className="h-full rounded-full bg-gradient-to-r from-lavender-300 to-sky-400"
              animate={{ width: `${(solved / TOTAL) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </GameShell>
  );
}
