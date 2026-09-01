import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X as XIcon, Zap } from 'lucide-react';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';

const STARTERS = ['PLANET', 'DRAGON', 'FOREST', 'CASTLE', 'GUITAR', 'PIRATE', 'MEADOW', 'THUNDER'];
const TIME_LIMIT = 30;
const TARGET_CHAIN = 8;


export default function WordChain({ onClose, onWin }: GameProps) {
  const [starter, setStarter] = useState<string>(() => STARTERS[Math.floor(Math.random() * STARTERS.length)]);
  const [chain, setChain] = useState<string[]>(() => [starter]);
  const [input, setInput] = useState('');
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [streak, setStreak] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    const s = STARTERS[Math.floor(Math.random() * STARTERS.length)];
    setStarter(s);
    setChain([s]);
    setInput('');
    setLives(3);
    setTimeLeft(TIME_LIMIT);
    setRunning(true);
    setStatus('playing');
    setFeedback(null);
    setStreak(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTimeLeft((tl) => {
        if (tl <= 1) {
          setRunning(false);
          setStatus((s) => (s === 'playing' ? 'lost' : s));
          return 0;
        }
        return tl - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const lastWord = chain[chain.length - 1];
  const lastLetter = lastWord[lastWord.length - 1];

  const submit = () => {
    if (status !== 'playing' || !input.trim()) return;
    const word = input.trim().toUpperCase();

    if (word.length < 3) { setFeedback({ ok: false, msg: 'Too short! Need 3+ letters.' }); loseLife(); return; }
    if (word[0] !== lastLetter) { setFeedback({ ok: false, msg: `Must start with "${lastLetter}"!` }); loseLife(); return; }
    if (chain.includes(word)) { setFeedback({ ok: false, msg: 'Already used that word!' }); loseLife(); return; }

    setFeedback({ ok: true, msg: 'Nice chain!' });
    setStreak((s) => s + 1);
    setChain((c) => [...c, word]);
    setInput('');
    setTimeout(() => setFeedback(null), 700);

    if (chain.length + 1 >= TARGET_CHAIN) {
      setStatus('won');
      setRunning(false);
      onWin(chainStars(chain.length + 1));
    }
  };

  const loseLife = () => {
    setStreak(0);
    setLives((l) => {
      const nl = l - 1;
      if (nl <= 0) { setStatus('lost'); setRunning(false); }
      return nl;
    });
    setInput('');
    setTimeout(() => setFeedback(null), 900);
  };

  const chainStars = (len: number): number => (len >= 8 ? 3 : len >= 6 ? 2 : len >= 4 ? 1 : 0);

  const stars = status === 'won' ? chainStars(chain.length) : computeStars(lives, 3);

  return (
    <GameShell
      title="Word Chain"
      gradient="from-sky-200 to-lavender-200"
      emoji="💬"
      onClose={onClose}
      onRestart={reset}
      status={status}
      stars={stars}
      winMessage="Chain Champion!"
      winDetail={`You built a ${chain.length}-word chain!`}
      loseMessage={timeLeft === 0 ? "Time's up!" : 'Out of lives!'}
      stats={[
        { icon: 'clock', value: `${timeLeft}s`, color: timeLeft <= 10 ? 'text-blush-500' : 'text-sky-500' },
        { icon: 'star', value: `${chain.length}/${TARGET_CHAIN}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💀', color: 'text-blush-500' },
      ]}
    >
      <div className="text-center">
        {/* Timer bar */}
        <div className="max-w-xs mx-auto mb-4">
          <div className="h-2.5 rounded-full bg-lavender-100 overflow-hidden">
            <motion.div className={`h-full rounded-full ${timeLeft <= 10 ? 'bg-blush-400' : 'bg-gradient-to-r from-sky-300 to-lavender-400'}`}
              animate={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        {streak >= 3 && (
          <motion.div initial={{ scale: 0, y: -10 }} animate={{ scale: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-lemon-100 text-lemon-500 font-display font-bold mb-3">
            <Zap size={16} /> {streak}x Chain Streak!
          </motion.div>
        )}

        <p className="text-sm text-lavender-400 mb-3">Type a word starting with the last letter of the chain!</p>

        {/* Chain display */}
        <div className="flex flex-wrap justify-center gap-2 mb-5 max-h-32 overflow-y-auto no-scrollbar">
          <AnimatePresence>
            {chain.map((w, i) => (
              <motion.div key={i} initial={{ scale: 0, opacity: 0, y: -10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0 }}
                className={`px-3 py-1.5 rounded-xl font-display font-bold text-sm ${i === 0 ? 'bg-sky-200 text-sky-500' : i === chain.length - 1 ? 'bg-lavender-300 text-white shadow-soft' : 'bg-white text-lavender-500 shadow-soft'}`}>
                {w}{i === chain.length - 1 && <span className="ml-1 text-lemon-400">←</span>}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Required letter hint */}
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-lavender-100 mb-4">
          <span className="text-sm text-lavender-400">Next word starts with</span>
          <span className="text-2xl font-display font-bold text-lavender-500">{lastLetter}</span>
        </motion.div>

        {/* Input */}
        <div className="flex gap-2 max-w-sm mx-auto">
          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            disabled={status !== 'playing'}
            placeholder="Type a word..."
            className={`flex-1 px-4 py-3 rounded-2xl border-2 font-display font-bold text-lavender-500 outline-none transition-colors ${
              feedback?.ok === true ? 'border-mint-400 bg-mint-50' : feedback?.ok === false ? 'border-blush-400 bg-blush-50' : 'border-lavender-200 bg-white focus:border-sky-400'
            }`} />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={submit} disabled={status !== 'playing'}
            className="px-5 rounded-2xl bg-gradient-to-r from-sky-300 to-lavender-400 text-white font-display font-bold shadow-soft">
            {feedback?.ok === true ? <Check size={20} /> : feedback?.ok === false ? <XIcon size={20} /> : 'Go'}
          </motion.button>
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`mt-3 font-display font-semibold text-sm ${feedback.ok ? 'text-mint-500' : 'text-blush-500'}`}>
              {feedback.msg}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-5 max-w-xs mx-auto">
          <div className="flex justify-between text-xs text-lavender-400 mb-1"><span>Chain Length</span><span>{chain.length}/{TARGET_CHAIN}</span></div>
          <div className="h-3 rounded-full bg-lavender-100 overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-lavender-400" animate={{ width: `${(chain.length / TARGET_CHAIN) * 100}%` }} />
          </div>
        </div>
      </div>
    </GameShell>
  );
}
