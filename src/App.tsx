import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { ToastContainer, showToast } from '@/components/ui';
import Home from '@/pages/Home';
import GameZone from '@/pages/GameZone';
import Coloring from '@/pages/Coloring';
import Achievements from '@/pages/Achievements';
import ParentDashboard from '@/pages/ParentDashboard';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Shop from '@/pages/Shop';
import LearnHub from '@/pages/LearnHub';
import LessonView from '@/pages/LessonView';
import MemoryGame from '@/pages/games/MemoryGame';
import QuizGame from '@/pages/games/QuizGame';
import ShapePuzzle from '@/pages/games/ShapePuzzle';
import AnimalSafari from '@/pages/games/AnimalSafari';
import SpaceExplorer from '@/pages/games/SpaceExplorer';
import NumberHunt from '@/pages/games/NumberHunt';
import WordWizard from '@/pages/games/WordWizard';
import MusicMaker from '@/pages/games/MusicMaker';
import MathMarathon from '@/pages/games/MathMarathon';
import ScienceLab from '@/pages/games/ScienceLab';
import GlobeTrotter from '@/pages/games/GlobeTrotter';
import MultiplyQuest from '@/pages/games/MultiplyQuest';
import FractionPizza from '@/pages/games/FractionPizza';
import CodingMaze from '@/pages/games/CodingMaze';
import TypingRace from '@/pages/games/TypingRace';
import VocabMatch from '@/pages/games/VocabMatch';
import ReactionRush from '@/pages/games/ReactionRush';
import ColorMatch from '@/pages/games/ColorMatch';
import CountingFriends from '@/pages/games/CountingFriends';
import AlphabetTrace from '@/pages/games/AlphabetTrace';
import PatternParty from '@/pages/games/PatternParty';
import ShapeSorter from '@/pages/games/ShapeSorter';
import StoryBuilder from '@/pages/games/StoryBuilder';
import LogicGrid from '@/pages/games/LogicGrid';
import DivisionMaster from '@/pages/games/DivisionMaster';
import WordChain from '@/pages/games/WordChain';
import { games, getGameById } from '@/data/content';
import { recordGamePlay, addActivityLog } from '@/lib/db';
import { useProfile } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import AuthScreen from '@/pages/AuthScreen';
import { FullPageSpinner } from '@/components/ui';
import AIAssistant from '@/components/AIAssistant';
import BackgroundMusic from '@/components/BackgroundMusic';

type Page = 'home' | 'games' | 'coloring' | 'achievements' | 'parent' | 'profile' | 'settings' | 'learn' | 'shop';

type GameProps = { onClose: () => void; onWin: (stars: number) => void };

const GAME_COMPONENTS: Record<string, (props: GameProps) => JSX.Element> = {
  'memory-match': MemoryGame,
  'brain-quiz': QuizGame,
  'shape-puzzle': ShapePuzzle,
  'animal-safari': AnimalSafari,
  'space-explorer': SpaceExplorer,
  'number-hunt': NumberHunt,
  'word-wizard': WordWizard,
  'music-maker': MusicMaker,
  'math-marathon': MathMarathon,
  'science-lab': ScienceLab,
  'globe-trotter': GlobeTrotter,
  'multiply-quest': MultiplyQuest,
  'fraction-pizza': FractionPizza,
  'coding-maze': CodingMaze,
  'typing-race': TypingRace,
  'vocab-match': VocabMatch,
  'reaction-rush': ReactionRush,
  'color-match': ColorMatch,
  'counting-friends': CountingFriends,
  'alphabet-trace': AlphabetTrace,
  'pattern-party': PatternParty,
  'shape-sorter': ShapeSorter,
  'story-builder': StoryBuilder,
  'logic-grid': LogicGrid,
  'divide-master': DivisionMaster,
  'word-chain': WordChain,
};

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const { profile, refresh: refreshProfile } = useProfile();
  const { session, loading: authLoading } = useAuth();

  const navigate = useCallback((p: string) => {
    setPage(p as Page);
    setActiveGame(null);
    setActiveLesson(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const playPortalSound = useCallback(() => {
    if (typeof window === 'undefined') return;

    const AudioContextImpl = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextImpl) return;

    const context = new AudioContextImpl();
    const oscillatorA = context.createOscillator();
    const oscillatorB = context.createOscillator();
    const gainNode = context.createGain();

    oscillatorA.type = 'triangle';
    oscillatorB.type = 'sine';
    oscillatorA.frequency.setValueAtTime(440, context.currentTime);
    oscillatorB.frequency.setValueAtTime(660, context.currentTime);
    oscillatorA.frequency.exponentialRampToValueAtTime(720, context.currentTime + 0.18);
    oscillatorB.frequency.exponentialRampToValueAtTime(980, context.currentTime + 0.18);

    gainNode.gain.setValueAtTime(0.0001, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.32);

    oscillatorA.connect(gainNode);
    oscillatorB.connect(gainNode);
    gainNode.connect(context.destination);

    oscillatorA.start(context.currentTime);
    oscillatorB.start(context.currentTime + 0.02);
    oscillatorA.stop(context.currentTime + 0.32);
    oscillatorB.stop(context.currentTime + 0.34);

    setTimeout(() => context.close(), 500);
  }, []);

  const playGame = useCallback((gameId: string) => {
    const game = games.find((g) => g.id === gameId);
    if (!game) return;
    if (game.type === 'coloring') {
      setPage('coloring');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    playPortalSound();
    setActiveGame(gameId);
  }, [playPortalSound]);

  const handleWin = useCallback(async (stars: number) => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3000);
    if (activeGame) {
      const game = getGameById(activeGame);
      if (game) {
        try {
          await recordGamePlay(activeGame, stars, null);
          await addActivityLog(activeGame, game.title, game.emoji, stars > 0 ? `Earned ${stars} star${stars !== 1 ? 's' : ''} & ${stars * 10} coins` : 'Played');
          await refreshProfile();
          const coins = stars * 10;
          if (coins > 0) {
            showToast(`+${coins} coins earned!`, 'success', '🪙');
          }
        } catch {
          // ignore DB errors silently for kids
        }
      }
    }
  }, [activeGame, refreshProfile]);

  const closeGame = useCallback(() => setActiveGame(null), []);

  const openLesson = useCallback((lessonId: string) => {
    setActiveLesson(lessonId);
  }, []);

  const closeLesson = useCallback(() => setActiveLesson(null), []);

  const renderGame = () => {
    if (!activeGame) return null;
    const GameComponent = GAME_COMPONENTS[activeGame];
    if (!GameComponent) return null;
    return <GameComponent onClose={closeGame} onWin={handleWin} />;
  };

  if (authLoading) return <FullPageSpinner label="Loading WonderKids..." />;
  if (!session) return <AuthScreen />;

  return (
    <BackgroundMusic>
      <div className="min-h-screen">
        <Navbar current={page} onNavigate={navigate} profile={profile} onOpenAssistant={() => setAssistantOpen(true)} />
        <AnimatePresence mode="wait">
          <motion.main
            key={page}
            initial={{ opacity: 0, y: 15, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="pb-16 md:pb-0"
          >
            {page === 'home' && <Home onNavigate={navigate} onPlayGame={playGame} />}
            {page === 'games' && <GameZone onPlayGame={playGame} />}
            {page === 'coloring' && <Coloring />}
            {page === 'achievements' && <Achievements />}
            {page === 'parent' && <ParentDashboard />}
            {page === 'profile' && <Profile onNavigate={navigate} />}
            {page === 'settings' && <Settings />}
            {page === 'shop' && <Shop />}
            {page === 'learn' && <LearnHub onOpenLesson={openLesson} />}
          </motion.main>
        </AnimatePresence>

        <AnimatePresence>
          {activeGame && (
            <motion.div
              key="game"
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-50"
            >
              <motion.div
                initial={{ scale: 0.72, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 30 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                className="absolute inset-0"
              >
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: [0.6, 1.04, 1], opacity: 1 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 bg-gradient-to-br from-lavender-200/20 via-white/10 to-sky-200/20"
                />
                {renderGame()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activeLesson && (
            <motion.div key="lesson" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LessonView lessonId={activeLesson} onClose={closeLesson} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {confetti && <ConfettiBurst />}
        </AnimatePresence>

        <AIAssistant open={assistantOpen} onOpenChange={setAssistantOpen} />
        <ToastContainer />
      </div>
    </BackgroundMusic>
  );
}

function ConfettiBurst() {
  const pieces = Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 2 + Math.random() * 1.5,
    rotate: Math.random() * 360,
    color: ['#ff7fbf', '#ffd24d', '#34c187', '#38bdf8', '#9d7ce6', '#ff8f63'][Math.floor(Math.random() * 6)],
    size: 8 + Math.random() * 10,
  }));

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-0"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, backgroundColor: p.color, borderRadius: '2px' }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}
