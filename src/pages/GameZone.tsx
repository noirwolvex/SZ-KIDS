import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Gamepad2,
  Sparkles,
  Trophy,
  GraduationCap,
  Brain,
  Search,
  Zap,
  Star,
  Play,
  Clock,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Badge } from '@/components/ui';
import { games, categories, ageGroups } from '@/data/content';
import type { AgeGroup, Game } from '@/data/content';

type GameZoneProps = {
  onPlayGame: (gameId: string) => void;
};

type Filter = 'all' | 'entertainment' | 'learning';

function getGameAudience(game: Game): 'entertainment' | 'learning' {
  const learningTypes = new Set([
    'quiz',
    'number',
    'word',
    'math',
    'science',
    'geography',
    'counting',
    'alphabet',
    'phonics',
    'reading',
    'spelling',
    'patterns',
    'colors',
    'shapes',
    'addition',
    'subtraction',
    'multiplication',
    'division',
    'fractions',
    'logic',
    'coding',
    'typing',
    'vocabulary',
    'critical-thinking',
  ]);

  return learningTypes.has(game.type) ? 'learning' : 'entertainment';
}

export default function GameZone({ onPlayGame }: GameZoneProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [activeAge, setActiveAge] = useState<AgeGroup | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');

  const filteredGames = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return games.filter((game) => {
      if (filter !== 'all' && getGameAudience(game) !== filter) return false;
      if (activeAge !== 'all' && game.ageGroup !== activeAge) return false;
      if (activeCategory !== 'all' && game.category.toLowerCase() !== activeCategory.toLowerCase()) return false;

      if (normalizedQuery) {
        const searchable = [
          game.title,
          game.category,
          game.description,
          game.ageRange,
          ...game.skills,
        ]
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(normalizedQuery)) return false;
      }

      return true;
    });
  }, [activeAge, activeCategory, filter, query]);

  const featuredGame = games[0];
  const secondaryFeatured = games.slice(1, 4);

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream">
      <AnimatedBackground density="medium" />

      {/* Ambient glow layers */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 left-[12%] h-96 w-96 rounded-full bg-sky-200/35 blur-3xl"
          animate={{ x: [0, 45, 0], y: [0, 25, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[28%] right-[-8%] h-[30rem] w-[30rem] rounded-full bg-lavender-200/30 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 35, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-10%] left-[28%] h-80 w-80 rounded-full bg-mint-200/25 blur-3xl"
          animate={{ x: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 px-4 pb-24 pt-24 sm:px-6 sm:pb-16 sm:pt-28">
        <div className="mx-auto max-w-7xl">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/50 p-5 shadow-soft-lg backdrop-blur-xl sm:rounded-[2.5rem] sm:p-8 lg:p-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/30 to-sky-100/40" />

            {[
              { icon: '✦', className: 'left-[8%] top-[18%]', delay: 0 },
              { icon: '✧', className: 'right-[16%] top-[18%]', delay: 0.7 },
              { icon: '✦', className: 'right-[8%] bottom-[16%]', delay: 1.2 },
              { icon: '·', className: 'left-[28%] bottom-[12%]', delay: 0.3 },
            ].map((sparkle, index) => (
              <motion.span
                key={`${sparkle.icon}-${index}`}
                className={`absolute ${sparkle.className} text-2xl text-lavender-300/70 sm:text-3xl`}
                animate={{ y: [0, -10, 0], rotate: [0, 8, -8, 0], opacity: [0.45, 1, 0.45] }}
                transition={{ duration: 3 + index * 0.4, delay: sparkle.delay, repeat: Infinity }}
              >
                {sparkle.icon}
              </motion.span>
            ))}

            <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  <Badge color="lavender" className="bg-white/70">
                    <Sparkles size={14} />
                    SPACE ZONE PLAYGROUND
                  </Badge>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.08 }}
                  className="mt-4 max-w-3xl font-display text-fluid-hero font-bold leading-[0.98] text-lavender-500"
                >
                  Play. Learn.
                  <br />
                  <span className="bg-gradient-to-r from-sky-400 via-lavender-400 to-blush-400 bg-clip-text text-transparent">
                    Explore everything.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.16 }}
                  className="mt-5 max-w-2xl text-base leading-relaxed text-lavender-400 sm:text-lg"
                >
                  One immersive home for every SPACE ZONE game — from quick entertainment to hands-on learning adventures.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.24 }}
                  className="mt-6 flex flex-wrap items-center gap-3"
                >
                  <button
                    onClick={() => onPlayGame(featuredGame.id)}
                    className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-400 via-lavender-400 to-lavender-500 px-5 py-3.5 font-display font-bold text-white shadow-soft-lg transition-transform hover:-translate-y-0.5 active:scale-95"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                      <Play size={17} fill="currentColor" />
                    </span>
                    Start Playing
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </button>

                  <div className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/60 px-4 py-3 text-sm font-semibold text-lavender-400 backdrop-blur-md">
                    <Gamepad2 size={17} />
                    {games.length} games ready
                  </div>
                </motion.div>
              </div>

              {/* Featured glass card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.15 }}
                className="relative mx-auto w-full max-w-sm"
              >
                <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-sky-200/50 via-lavender-200/40 to-blush-200/40 blur-2xl" />

                <motion.button
                  type="button"
                  onClick={() => onPlayGame(featuredGame.id)}
                  whileHover={{ y: -10, rotateX: 2, rotateY: -2, scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 18 }}
                  className="group relative w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white/20 p-4 text-left shadow-[0_25px_70px_rgba(79,70,229,0.16)] backdrop-blur-2xl [transform-style:preserve-3d]"
                  aria-label={`Play ${featuredGame.title}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/55 via-white/15 to-sky-100/20" />
                  <motion.div
                    className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-sky-200/30 blur-2xl"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 7, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-lavender-200/25 blur-2xl"
                    animate={{ scale: [1, 1.15, 1], x: [0, 14, 0] }}
                    transition={{ duration: 8, repeat: Infinity }}
                  />

                  <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-sky-200/80 via-lavender-200/70 to-mint-200/70 p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full bg-white/60 px-3 py-1 text-[11px] font-display font-bold uppercase tracking-wider text-lavender-500 backdrop-blur-md">
                        Featured game
                      </span>
                      <span className="rounded-full bg-white/55 px-3 py-1 text-[11px] font-display font-bold text-lavender-500">
                        {featuredGame.difficulty}
                      </span>
                    </div>

                    <motion.div
                      className="mt-8 flex items-center justify-center"
                      animate={{ y: [0, -9, 0], rotate: [0, -4, 4, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] border border-white/70 bg-white/45 shadow-soft backdrop-blur-md sm:h-36 sm:w-36">
                        <div className="absolute inset-2 rounded-[1.5rem] border border-white/60" />
                        <featuredGame.icon size={56} strokeWidth={1.7} className={featuredGame.color} />
                        <span className="absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/85 text-xl shadow-soft">
                          {featuredGame.emoji}
                        </span>
                      </div>
                    </motion.div>

                    <div className="mt-7 text-center">
                      <h2 className="font-display text-2xl font-bold text-lavender-500">{featuredGame.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-lavender-400">{featuredGame.description}</p>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-2 text-xs font-semibold text-lavender-400">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/50 px-3 py-1.5">
                        <Clock size={13} /> {featuredGame.estTime}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/50 px-3 py-1.5">
                        <Star size={13} /> {featuredGame.skills[0]}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/45 px-4 py-3 backdrop-blur-md">
                      <span className="font-display text-sm font-bold text-lavender-500">Enter game</span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lavender-400 text-white transition-transform group-hover:translate-x-1">
                        <ArrowRight size={17} />
                      </span>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            </div>
          </section>

          {/* Quick categories */}
          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'All adventures', value: games.length, icon: Gamepad2, gradient: 'from-sky-100 to-lavender-100' },
              { label: 'Learning games', value: games.filter((game) => getGameAudience(game) === 'learning').length, icon: GraduationCap, gradient: 'from-mint-100 to-sky-100' },
              { label: 'Playful challenges', value: games.filter((game) => getGameAudience(game) === 'entertainment').length, icon: Trophy, gradient: 'from-lemon-100 to-peach-100' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className={`rounded-3xl border border-white/80 bg-gradient-to-br ${stat.gradient} p-4 shadow-soft backdrop-blur-xl sm:p-5`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-display font-semibold uppercase tracking-wide text-lavender-400">{stat.label}</p>
                      <p className="mt-1 font-display text-2xl font-bold text-lavender-500">{stat.value}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/65 text-lavender-500 shadow-sm">
                      <Icon size={20} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </section>

          {/* Filter system */}
          <section className="mt-10 rounded-[2rem] border border-white/80 bg-white/45 p-4 shadow-soft backdrop-blur-xl sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-lavender-400">
                  <Sparkles size={16} />
                  <span className="text-xs font-display font-bold uppercase tracking-[0.16em]">Explore the library</span>
                </div>
                <h2 className="mt-1 font-display text-2xl font-bold text-lavender-500 sm:text-3xl">All games in one place</h2>
              </div>

              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-lavender-300" size={18} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search games, skills, categories..."
                  className="w-full rounded-2xl border border-white/90 bg-white/70 py-3.5 pl-11 pr-4 text-sm font-medium text-lavender-500 outline-none transition-all placeholder:text-lavender-300 focus:border-lavender-300 focus:ring-2 focus:ring-lavender-200"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { id: 'all' as const, label: 'Everything', icon: Sparkles },
                { id: 'entertainment' as const, label: 'Entertainment', icon: Gamepad2 },
                { id: 'learning' as const, label: 'Learning', icon: GraduationCap },
              ].map((item) => {
                const Icon = item.icon;
                const active = filter === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setFilter(item.id)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-display font-bold transition-all ${
                      active
                        ? 'bg-gradient-to-r from-sky-300 to-lavender-400 text-white shadow-soft'
                        : 'border border-white/80 bg-white/55 text-lavender-400 hover:bg-white/85'
                    }`}
                  >
                    <Icon size={15} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveAge('all')}
                className={`rounded-2xl px-3.5 py-2 text-xs font-display font-bold transition-all ${
                  activeAge === 'all' ? 'bg-lavender-400 text-white' : 'bg-white/55 text-lavender-400 hover:bg-white/85'
                }`}
              >
                All ages
              </button>
              {ageGroups.map((age) => (
                <button
                  key={age.id}
                  onClick={() => setActiveAge(age.id)}
                  className={`rounded-2xl px-3.5 py-2 text-xs font-display font-bold transition-all ${
                    activeAge === age.id ? 'bg-lavender-400 text-white' : 'bg-white/55 text-lavender-400 hover:bg-white/85'
                  }`}
                >
                  {age.emoji} {age.label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setActiveCategory('all')}
                className={`shrink-0 rounded-2xl px-3.5 py-2 text-xs font-display font-bold transition-all ${
                  activeCategory === 'all' ? 'bg-sky-300 text-white' : 'bg-white/55 text-lavender-400 hover:bg-white/85'
                }`}
              >
                All categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.label)}
                  className={`shrink-0 rounded-2xl px-3.5 py-2 text-xs font-display font-bold transition-all ${
                    activeCategory === category.label ? 'bg-sky-300 text-white' : 'bg-white/55 text-lavender-400 hover:bg-white/85'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/70 pt-4 text-sm">
              <span className="font-display font-semibold text-lavender-400">
                {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
              </span>
              <span className="inline-flex items-center gap-1.5 font-display font-semibold text-lavender-300">
                <Zap size={14} /> Pick your next adventure
              </span>
            </div>
          </section>

          {/* Featured row */}
          <section className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-display font-bold uppercase tracking-[0.16em] text-lavender-300">Curated picks</p>
                <h2 className="mt-1 font-display text-2xl font-bold text-lavender-500 sm:text-3xl">More ways to play</h2>
              </div>
              <span className="hidden items-center gap-1.5 rounded-full bg-white/60 px-3 py-1.5 text-xs font-display font-bold text-lavender-400 sm:inline-flex">
                <Brain size={13} /> Fresh challenges
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {secondaryFeatured.map((game, index) => (
                <MiniGlassCard key={game.id} game={game} index={index} onPlayGame={onPlayGame} />
              ))}
            </div>
          </section>

          {/* Full library */}
          <section className="mt-10">
            <AnimatePresence mode="popLayout">
              {filteredGames.length > 0 ? (
                <motion.div
                  layout
                  className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
                >
                  {filteredGames.map((game, index) => (
                    <GameGlassCard key={game.id} game={game} index={index} onPlayGame={onPlayGame} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-[2rem] border border-white/80 bg-white/55 px-6 py-16 text-center shadow-soft backdrop-blur-xl"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-100 to-lavender-100 text-lavender-400">
                    <Search size={28} />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-lavender-500">Nothing found yet</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-lavender-400">
                    Try another search or reset one of the filters to discover more adventures.
                  </p>
                  <button
                    onClick={() => {
                      setFilter('all');
                      setActiveAge('all');
                      setActiveCategory('all');
                      setQuery('');
                    }}
                    className="mt-5 rounded-2xl bg-lavender-400 px-4 py-2.5 font-display text-sm font-bold text-white shadow-soft transition-transform hover:-translate-y-0.5 active:scale-95"
                  >
                    Show every game
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/55 px-4 py-2 text-xs font-display font-semibold text-lavender-400 backdrop-blur-xl">
              <Trophy size={14} />
              Every game is ready to launch from this hub
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniGlassCard({ game, index, onPlayGame }: { game: Game; index: number; onPlayGame: (gameId: string) => void }) {
  const Icon = game.icon;

  return (
    <motion.button
      type="button"
      onClick={() => onPlayGame(game.id)}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -7, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="group relative overflow-hidden rounded-[1.7rem] border border-white/80 bg-white/30 p-3 text-left shadow-soft backdrop-blur-2xl"
    >
      <div className={`relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br ${game.bg} p-5`}>
        <div className="absolute inset-0 bg-white/15" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/55 text-lavender-500 shadow-sm backdrop-blur-md">
            <Icon size={26} className={game.color} />
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/55 text-lavender-400 transition-transform group-hover:translate-x-1">
            <ArrowRight size={16} />
          </span>
        </div>
        <div className="relative mt-5">
          <p className="text-[11px] font-display font-bold uppercase tracking-wider text-lavender-400">{game.category}</p>
          <h3 className="mt-1 font-display text-xl font-bold text-lavender-500">{game.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-lavender-400">{game.description}</p>
        </div>
      </div>
    </motion.button>
  );
}

function GameGlassCard({ game, index, onPlayGame }: { game: Game; index: number; onPlayGame: (gameId: string) => void }) {
  const Icon = game.icon;
  const audience = getGameAudience(game);

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: Math.min(index, 7) * 0.035, duration: 0.35 }}
      whileHover={{ y: -9, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onPlayGame(game.id)}
      className="group relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-white/80 bg-white/20 p-3 text-left shadow-[0_22px_55px_rgba(86,74,148,0.12)] backdrop-blur-2xl [transform-style:preserve-3d]"
      aria-label={`Play ${game.title}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/10 to-white/20" />
      <motion.div
        className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/35 blur-2xl"
        animate={{ scale: [1, 1.18, 1], x: [0, 8, 0], y: [0, 8, 0] }}
        transition={{ duration: 6 + (index % 3), repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className={`relative flex h-full flex-col overflow-hidden rounded-[1.6rem] bg-gradient-to-br ${game.bg} p-5`}>
        <div className="absolute inset-0 bg-white/10" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {game.isNew && <span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-display font-bold uppercase tracking-wider text-lavender-500">New</span>}
            {game.isTrending && <span className="rounded-full bg-white/60 px-2.5 py-1 text-[10px] font-display font-bold uppercase tracking-wider text-lavender-500">Trending</span>}
          </div>
          <motion.span
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, delay: index * 0.05 }}
            className="text-2xl drop-shadow-sm"
          >
            {game.emoji}
          </motion.span>
        </div>

        <div className="relative mt-5 flex justify-center">
          <motion.div
            whileHover={{ rotate: -4, scale: 1.07 }}
            className="relative flex h-28 w-28 items-center justify-center rounded-[1.9rem] border border-white/70 bg-white/40 shadow-soft backdrop-blur-md"
          >
            <div className="absolute inset-2 rounded-[1.4rem] border border-white/45" />
            <Icon size={46} strokeWidth={1.7} className={game.color} />
            <span className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-lg shadow-soft">
              {game.emoji}
            </span>
          </motion.div>
        </div>

        <div className="relative mt-6 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-display font-bold uppercase tracking-[0.14em] text-lavender-400">{game.category}</span>
            <span className="rounded-full bg-white/50 px-2.5 py-1 text-[10px] font-display font-bold text-lavender-400">{game.ageRange}</span>
          </div>
          <h3 className="mt-1 font-display text-xl font-bold leading-tight text-lavender-500">{game.title}</h3>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-lavender-400">{game.description}</p>
        </div>

        <div className="relative mt-auto pt-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-lavender-400">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/55 px-2.5 py-1.5">
              <Clock size={12} /> {game.estTime}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/55 px-2.5 py-1.5">
              {audience === 'learning' ? <GraduationCap size={12} /> : <Gamepad2 size={12} />}
              {audience === 'learning' ? 'Learn' : 'Play'}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-white/65 bg-white/45 px-3.5 py-3 backdrop-blur-md">
            <span className="font-display text-xs font-bold text-lavender-500">Play now</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 text-lavender-400 shadow-sm transition-all group-hover:translate-x-1 group-hover:bg-white">
              <Play size={13} fill="currentColor" />
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
