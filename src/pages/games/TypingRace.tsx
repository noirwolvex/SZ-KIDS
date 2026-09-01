import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X as XIcon, Keyboard } from 'lucide-react';
import GameShell, { formatTime, type GameProps } from './GameShell';

const WORDS_3 = ['cat', 'dog', 'sun', 'hat', 'bee', 'fox', 'owl', 'pig', 'cow', 'bus', 'red', 'big', 'run', 'sky', 'top'];
const WORDS_5 = ['apple', 'happy', 'house', 'plant', 'river', 'cloud', 'bread', 'chair', 'dance', 'eagle', 'flame', 'grape', 'lemon', 'mouse', 'ocean'];
const WORDS_7 = ['butterfly', 'adventure', 'chocolate', 'dinosaur', 'elephant', 'friendship', 'gardeners', 'happiness', 'instrument', 'jellybean', 'kangaroo', 'lightning', 'mountains', 'notebook', 'pineapple'];

type Difficulty = 'easy' | 'medium' | 'hard';
const WORD_LIST: Record<Difficulty, string[]> = { easy: WORDS_3, medium: WORDS_5, hard: WORDS_7 };
const GAME_TIME = 30;


export default function TypingRace({ onClose, onWin }: GameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [word, setWord] = useState<string>(() => WORD_LIST.easy[Math.floor(Math.random() * WORD_LIST.easy.length)]);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(GAME_TIME);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scoreRef = useRef(0);
  const onWinRef = useRef(onWin);

  scoreRef.current = score;
  onWinRef.current = onWin;

  const nextWord = useCallback((diff: Difficulty) => {
    const list = WORD_LIST[diff];
    let nw = list[Math.floor(Math.random() * list.length)];
    while (nw === word) nw = list[Math.floor(Math.random() * list.length)];
    setWord(nw);
    setInput('');
    setFeedback(null);
  }, [word]);

  const reset = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setWord(WORD_LIST[diff][Math.floor(Math.random() * WORD_LIST[diff].length)]);
    setInput('');
    setScore(0);
    setTime(GAME_TIME);
    setStreak(0);
    setRunning(true);
    setStatus('playing');
    setFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTime((s) => {
        const ns = s - 1;
        if (ns <= 0) {
          setRunning(false);
          const stars = scoreRef.current >= 15 ? 3 : scoreRef.current >= 10 ? 2 : scoreRef.current >= 5 ? 1 : 0;
          setStatus(stars > 0 ? 'won' : 'lost');
          if (stars > 0) onWinRef.current(stars);
        }
        return ns;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const handleChange = (val: string) => {
    if (status !== 'playing') return;
    setInput(val.toLowerCase());
    if (val.toLowerCase() === word) {
      setFeedback('correct');
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      setTimeout(() => nextWord(difficulty), 300);
    } else if (word.startsWith(val.toLowerCase()) === false && val.length > 0) {
      setFeedback('wrong');
      setStreak(0);
    } else {
      setFeedback(null);
    }
  };

  const stars = score >= 15 ? 3 : score >= 10 ? 2 : score >= 5 ? 1 : 0;
  const diffs: Difficulty[] = ['easy', 'medium', 'hard'];

  return (
    <GameShell
      title="Typing Race"
      gradient="from-sky-200 to-lavender-200"
      emoji="⌨️"
      onClose={onClose}
      onRestart={() => reset(difficulty)}
      status={status}
      stars={stars}
      winMessage="Fast Fingers!"
      winDetail={`You typed ${score} words correctly in ${GAME_TIME} seconds!`}
      loseMessage="Time's Up!"
      stats={[
        { icon: 'clock', value: `${time}s`, color: 'text-sky-500' },
        { icon: 'score', value: `${score}`, color: 'text-mint-500' },
      ]}
      difficultySelector={diffs.map((d) => (
        <button
          key={d}
          onClick={() => reset(d)}
          className={`px-4 py-1.5 rounded-2xl font-display font-semibold text-sm transition-all ${
            difficulty === d ? 'bg-sky-400 text-white' : 'bg-sky-100 text-sky-500'
          }`}
        >
          {d === 'easy' ? '3-letter' : d === 'medium' ? '5-letter' : '7+ letter'}
        </button>
      ))}
    >
      <div className="text-center">
        {streak >= 3 && (
          <motion.div
            initial={{ scale: 0, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-lemon-100 text-lemon-500 font-display font-bold mb-4"
          >
            🔥 {streak}x Streak!
          </motion.div>
        )}

        {/* Timer bar */}
        <div className="max-w-xs mx-auto mb-6">
          <div className="h-4 rounded-full bg-lavender-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-300 to-lavender-400"
              animate={{ width: `${(time / GAME_TIME) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Word display */}
        <motion.div
          key={word}
          initial={{ scale: 0.5, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className={`relative inline-block px-10 py-6 rounded-4xl mb-6 ${
            feedback === 'correct' ? 'bg-mint-200 shadow-glow' :
            feedback === 'wrong' ? 'bg-blush-200' : 'bg-white shadow-soft'
          }`}
        >
          <Keyboard size={20} className="absolute top-3 left-3 text-lavender-300" />
          <span className="text-4xl font-display font-bold text-lavender-500 tracking-wider">
            {word.split('').map((ch, i) => {
              const typed = input[i];
              const done = i < input.length;
              const correct = done && typed === ch;
              const wrong = done && typed !== ch;
              return (
                <span
                  key={i}
                  className={
                    correct ? 'text-mint-500' : wrong ? 'text-blush-500' : 'text-lavender-500'
                  }
                >
                  {ch}
                </span>
              );
            })}
          </span>
        </motion.div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          disabled={status !== 'playing'}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Type the word..."
          className={`w-full max-w-xs mx-auto block px-6 py-4 rounded-2xl border-2 text-center text-2xl font-display font-bold text-lavender-500 bg-white outline-none transition-all ${
            feedback === 'correct' ? 'border-mint-400' :
            feedback === 'wrong' ? 'border-blush-400' : 'border-lavender-200 focus:border-sky-400'
          }`}
        />

        <div className="flex justify-center gap-4 mt-4 text-sm font-display font-semibold">
          <span className="text-mint-500 flex items-center gap-1"><Check size={16} /> {score} correct</span>
          <span className="text-lavender-400">Goal: 5 / 10 / 15 for ⭐⭐⭐</span>
        </div>
      </div>
    </GameShell>
  );
}
