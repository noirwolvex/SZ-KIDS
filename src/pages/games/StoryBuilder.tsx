import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { computeStars, formatTime, type GameProps } from './GameShell';


type Story = { prompt: string; options: string[] };

const STORIES: Story[] = [
  {
    prompt: 'The ___ jumped over the fence.',
    options: ['bunny', 'elephant', 'robot', 'dragon'],
  },
  {
    prompt: 'Then it found a magic ___ in the garden.',
    options: ['carrot', 'rock', 'cloud', 'shoe'],
  },
  {
    prompt: 'The magic thing turned into a flying ___!',
    options: ['bird', 'banana', 'spaceship', 'pillow'],
  },
  {
    prompt: 'And they flew to the land of ___ together.',
    options: ['candy', 'dinosaurs', 'bubbles', 'socks'],
  },
];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function StoryBuilder({ onClose, onWin }: GameProps) {
  const [roundNum, setRoundNum] = useState(1);
  const [story, setStory] = useState<string[]>([]);
  const [currentOptions, setCurrentOptions] = useState<string[]>(() => shuffle(STORIES[0].options));
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [feedback, setFeedback] = useState<{ word: string; skipped: boolean } | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const totalRounds = 4;

  const reset = useCallback(() => {
    setRoundNum(1);
    setStory([]);
    setCurrentOptions(shuffle(STORIES[0].options));
    setLives(3);
    setTime(0);
    setRunning(true);
    setStatus('playing');
    setFeedback(null);
    setShowComplete(false);
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const handlePick = (word: string) => {
    if (status !== 'playing' || feedback) return;
    const newStory = [...story, word];
    setStory(newStory);
    setFeedback({ word, skipped: false });
    setTimeout(() => {
      if (roundNum >= totalRounds) {
        setShowComplete(true);
        setTimeout(() => {
          setStatus('won');
          setRunning(false);
          onWin(computeStars(lives, 3));
        }, 2500);
      } else {
        setRoundNum((r) => r + 1);
        setCurrentOptions(shuffle(STORIES[roundNum].options));
        setFeedback(null);
      }
    }, 900);
  };

  const handleSkip = () => {
    if (status !== 'playing' || feedback) return;
    const newStory = [...story, '___'];
    setStory(newStory);
    setFeedback({ word: '', skipped: true });
    setLives((l) => {
      const nl = l - 1;
      if (nl <= 0) {
        setRunning(false);
        setStatus('lost');
      }
      return nl;
    });
    setTimeout(() => {
      if (roundNum >= totalRounds) {
        setShowComplete(true);
        setTimeout(() => {
          setStatus('won');
          setRunning(false);
          onWin(computeStars(Math.max(0, lives - 1), 3));
        }, 2500);
      } else {
        setRoundNum((r) => r + 1);
        setCurrentOptions(shuffle(STORIES[roundNum].options));
        setFeedback(null);
      }
    }, 900);
  };

  const stars = computeStars(lives, 3);

  const buildStoryText = (words: string[]) => {
    let text = '';
    STORIES.forEach((s, i) => {
      const filled = words[i] && words[i] !== '___' ? words[i] : '___';
      text += s.prompt.replace('___', filled) + ' ';
    });
    return text.trim();
  };

  return (
    <GameShell
      title="Story Builder"
      gradient="from-sky-200 to-mint-200"
      emoji="📖"
      onClose={onClose}
      onRestart={reset}
      status={status}
      stars={stars}
      winMessage="Story Teller!"
      winDetail={`You built a silly story in ${formatTime(time)}!`}
      stats={[
        { icon: 'clock', value: formatTime(time), color: 'text-sky-500' },
        { icon: 'star', value: `${roundNum}/${totalRounds}`, color: 'text-lemon-500' },
        { icon: 'heart', value: '❤️'.repeat(Math.max(0, lives)) || '💔', color: 'text-blush-500' },
      ]}
    >
      <AnimatePresence>
        {showComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl mb-4"
            >
              📖✨
            </motion.div>
            <h3 className="font-display text-xl font-bold text-lavender-500 mb-4">Your Silly Story!</h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-sky-100 to-mint-100 shadow-soft-lg font-display text-lg text-lavender-500 leading-relaxed"
            >
              {buildStoryText(story)}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {story.length > 0 && (
              <div className="mb-5 p-4 rounded-2xl bg-lavender-50 border border-lavender-100">
                <p className="font-display text-sm text-lavender-400 mb-1">Story so far:</p>
                <p className="text-lavender-500 leading-relaxed">{buildStoryText(story)}</p>
              </div>
            )}

            {/* Current prompt */}
            <motion.div
              key={roundNum}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-center mb-6 p-6 rounded-3xl bg-gradient-to-br from-sky-100 to-mint-100 shadow-soft-lg"
            >
              <p className="font-display text-2xl font-bold text-lavender-500 leading-relaxed">
                {STORIES[roundNum - 1].prompt}
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-4">
              {currentOptions.map((word) => {
                const isFeedback = feedback?.word === word;
                return (
                  <motion.button
                    key={word}
                    onClick={() => handlePick(word)}
                    disabled={!!feedback}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.92 }}
                    animate={isFeedback ? { scale: [1, 1.2, 1] } : {}}
                    className={`py-4 px-3 rounded-3xl font-display font-bold text-lg shadow-soft transition-colors capitalize ${
                      isFeedback
                        ? 'bg-mint-300 text-white'
                        : 'bg-white text-lavender-500 hover:bg-lavender-50'
                    }`}
                  >
                    {word}
                  </motion.button>
                );
              })}
            </div>

            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSkip}
                disabled={!!feedback}
                className="px-5 py-2 rounded-2xl bg-lavender-100 text-lavender-400 font-display font-semibold text-sm hover:bg-lavender-200 transition-colors"
              >
                Skip (loses a ❤️)
              </motion.button>
            </div>

            <AnimatePresence>
              {feedback && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-center mt-4 font-display font-bold text-lg ${
                    feedback.skipped ? 'text-blush-500' : 'text-mint-500'
                  }`}
                >
                  {feedback.skipped ? 'Skipped!' : '🎉 Added to the story!'}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
