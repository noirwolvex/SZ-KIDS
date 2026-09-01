import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X as XIcon, Lightbulb, Volume2 } from 'lucide-react';
import GameShell, { computeStars, type GameProps } from './GameShell';

type Question = {
  emoji: string;
  prompt: string;
  options: string[];
  answer: number;
  hint: string;
};

const QUESTIONS: Question[] = [
  { emoji: '🦁', prompt: 'Which animal is this?', options: ['Tiger', 'Lion', 'Bear', 'Dog'], answer: 1, hint: 'It has a big mane and roars!' },
  { emoji: '🍎', prompt: 'What color is this fruit?', options: ['Green', 'Blue', 'Red', 'Purple'], answer: 2, hint: 'It is the same color as a fire truck.' },
  { emoji: '🔵', prompt: 'What shape is this?', options: ['Square', 'Circle', 'Triangle', 'Star'], answer: 1, hint: 'It is round with no corners.' },
  { emoji: '3', prompt: 'What comes after 3?', options: ['2', '5', '4', '6'], answer: 2, hint: 'Count up: 1, 2, 3, ...' },
  { emoji: '🅰️', prompt: 'What letter is this?', options: ['B', 'A', 'D', 'P'], answer: 1, hint: 'It is the first letter of the alphabet.' },
  { emoji: '🌙', prompt: 'When do we see the moon?', options: ['Morning', 'Night', 'Noon', 'Always'], answer: 1, hint: 'The sky is dark and full of stars.' },
  { emoji: '🐘', prompt: 'Which is the biggest land animal?', options: ['Mouse', 'Cat', 'Elephant', 'Rabbit'], answer: 2, hint: 'It has a long trunk and big ears.' },
  { emoji: '🌈', prompt: 'How many colors in a rainbow?', options: ['5', '7', '10', '3'], answer: 1, hint: 'Red, orange, yellow, green, blue, indigo, violet.' },
];


export default function QuizGame({ onClose, onWin }: GameProps) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const [answered, setAnswered] = useState(false);

  const q = QUESTIONS[idx];

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9; u.pitch = 1.2;
      window.speechSynthesis.speak(u);
    }
  };

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === q.answer) {
      setScore((s) => s + 1);
    } else {
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) setFinished(true);
        return nl;
      });
    }
  };

  const next = () => {
    if (idx + 1 >= QUESTIONS.length || lives <= 0) {
      setFinished(true);
      if (lives > 0) {
        const earnedStars = score >= 6 ? 3 : score >= 4 ? 2 : 1;
        onWin(earnedStars);
      }
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setShowHint(false);
    setAnswered(false);
  };

  const restart = () => {
    setIdx(0); setSelected(null); setScore(0); setLives(3);
    setShowHint(false); setFinished(false); setAnswered(false);
  };

  const stars = score >= 6 ? 3 : score >= 4 ? 2 : 1;

  return (
    <GameShell
      title="Brain Quiz"
      gradient="from-lemon-200 to-peach-200"
      emoji="💡"
      onClose={onClose}
      onRestart={restart}
      status={finished ? (lives > 0 ? 'won' : 'lost') : 'playing'}
      stars={stars}
      winMessage={score >= 6 ? 'Amazing!' : score >= 4 ? 'Great job!' : 'Nice try!'}
      winDetail={`You got ${score} out of ${QUESTIONS.length} correct!`}
      stats={[
        { icon: 'star', value: `${score}/${QUESTIONS.length}`, color: 'text-lemon-500' },
        { icon: 'heart', value: `${Math.max(0, lives)}❤️`, color: 'text-blush-500' },
      ]}
    >
      {/* Progress bar */}
      <div className="h-2.5 rounded-full bg-lavender-100 mb-6 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-lemon-300 to-peach-400"
          animate={{ width: `${((idx + (answered ? 1 : 0)) / QUESTIONS.length) * 100}%` }}
          transition={{ type: 'spring', stiffness: 200 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!finished && (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="text-center mb-6">
              <motion.div
                className="relative inline-block mb-3"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-lemon-200/50 blur-2xl"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <span className="relative text-7xl drop-shadow-lg">{q.emoji}</span>
                <button
                  onClick={() => speak(q.prompt)}
                  className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-sky-300 text-white flex items-center justify-center shadow-soft hover:bg-sky-400 active:scale-90"
                  aria-label="Listen"
                >
                  <Volume2 size={16} />
                </button>
              </motion.div>
              <h3 className="font-display text-2xl font-bold text-lavender-500">{q.prompt}</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {q.options.map((opt, i) => {
                const isCorrect = i === q.answer;
                const isSelected = i === selected;
                let style = 'bg-white border-lavender-100 text-lavender-500 hover:bg-lavender-50 hover:border-lavender-200';
                if (answered && isCorrect) style = 'bg-mint-200 border-mint-400 text-mint-500 shadow-soft';
                else if (answered && isSelected && !isCorrect) style = 'bg-blush-200 border-blush-400 text-blush-500';
                else if (answered) style = 'bg-white border-lavender-50 text-lavender-300 opacity-50';
                return (
                  <motion.button
                    key={i}
                    whileHover={!answered ? { scale: 1.04, y: -3 } : {}}
                    whileTap={!answered ? { scale: 0.96 } : {}}
                    onClick={() => handleSelect(i)}
                    disabled={answered}
                    className={`relative p-4 rounded-2xl border-2 font-display font-semibold text-lg transition-all ${style}`}
                  >
                    {opt}
                    {answered && isCorrect && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2">
                        <Check size={18} className="text-mint-500" />
                      </motion.span>
                    )}
                    {answered && isSelected && !isCorrect && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2">
                        <XIcon size={18} className="text-blush-500" />
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 text-sm font-display font-semibold text-lemon-500 hover:text-lemon-400 transition-colors"
              >
                <Lightbulb size={16} /> {showHint ? 'Hide hint' : 'Need a hint?'}
              </button>
              {answered && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={next}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-300 to-lavender-400 text-white font-display font-semibold shadow-soft"
                >
                  {idx + 1 >= QUESTIONS.length ? 'Finish' : 'Next →'}
                </motion.button>
              )}
            </div>
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-3.5 rounded-2xl bg-lemon-100 text-lemon-500 font-medium text-sm flex items-start gap-2"
                >
                  <Lightbulb size={18} className="shrink-0 mt-0.5" />
                  {q.hint}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
