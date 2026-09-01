import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Search, Star, Play, SlidersHorizontal, Users, Sparkles, Clock, TrendingUp, Heart, Zap, Award } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Badge, Skeleton } from '@/components/ui';
import { games, ageGroups, categories } from '@/data/content';
import type { Game, AgeGroup } from '@/data/content';
import { useGameStats, useFavorites } from '@/lib/hooks';

type GamesProps = {
  onPlayGame: (gameId: string) => void;
};

const difficultyColors: Record<string, string> = {
  Easy: 'bg-mint-100 text-mint-500',
  Medium: 'bg-lemon-100 text-lemon-500',
  Hard: 'bg-blush-100 text-blush-500',
};

type Tab = 'all' | 'recommended' | 'trending' | 'new' | 'favorites' | 'recent';

/** Format a play count for compact display, e.g. 12400 -> "12.4k". */
function formatPlays(n: number): string {
  if (n >= 1000) {
    const v = n / 1000;
    // one decimal, drop trailing .0
    const s = v.toFixed(1).replace(/\.0$/, '');
    return `${s}k`;
  }
  return String(n);
}

export default function Games({ onPlayGame }: GamesProps) {
  const [query, setQuery] = useState('');
  const [activeAge, setActiveAge] = useState<AgeGroup | 'all'>('all');
  const [activeCat, setActiveCat] = useState<string>('all');
  const [tab, setTab] = useState<Tab>('all');

  const { stats, loading: statsLoading } = useGameStats();
  const { favorites, loading: favoritesLoading, toggle: toggleFav } = useFavorites();

  const filtered = useMemo(() => {
    let list = games;
    if (activeAge !== 'all') list = list.filter((g) => g.ageGroup === activeAge);
    if (activeCat !== 'all') list = list.filter((g) => g.category.toLowerCase() === activeCat);
    if (query) list = list.filter((g) =>
      g.title.toLowerCase().includes(query.toLowerCase()) ||
      g.category.toLowerCase().includes(query.toLowerCase()) ||
      g.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))
    );
    if (tab === 'trending') list = list.filter((g) => g.isTrending);
    if (tab === 'new') list = list.filter((g) => g.isNew);
    if (tab === 'favorites') list = list.filter((g) => favorites.has(g.id));
    return list;
  }, [query, activeAge, activeCat, tab, favorites]);

  const grouped = useMemo(() => {
    if (activeAge !== 'all') return [{ age: activeAge, games: filtered }];
    return ageGroups.map((ag) => ({
      age: ag.id,
      games: filtered.filter((g) => g.ageGroup === ag.id),
    })).filter((g) => g.games.length > 0);
  }, [filtered, activeAge]);

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground density="low" />

      <div className="relative pt-24 pb-20 md:pb-12 px-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 5rem)' }}>
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-lavender-400" size={22} />
              <span className="font-display font-semibold text-lavender-400 text-sm uppercase tracking-wide">Play & Learn</span>
            </div>
            <h1 className="font-display text-fluid-h2 font-bold text-lavender-500">Game Library</h1>
            <p className="text-lavender-400 mt-2 text-fluid-body">Pick a game and start your adventure — every one is ready to play!</p>
          </motion.div>

          {/* Tabs */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
            {([
              { id: 'all', label: 'All Games', icon: <Sparkles size={15} /> },
              { id: 'trending', label: 'Trending', icon: <TrendingUp size={15} /> },
              { id: 'new', label: 'New Releases', icon: <Zap size={15} /> },
              { id: 'favorites', label: 'Favorites', icon: <Heart size={15} /> },
            ] as { id: Tab; label: string; icon: React.ReactNode }[]).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-2xl font-display font-semibold text-sm whitespace-nowrap transition-all touch-target-sm ${
                  tab === t.id ? 'bg-gradient-to-r from-sky-300 to-lavender-400 text-white shadow-soft' : 'glass text-lavender-500 hover:bg-white'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </motion.div>

          {/* Search + sort */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-lavender-300 group-focus-within:text-lavender-500 transition-colors" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search games, skills, or categories..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-strong border border-white text-lavender-500 placeholder:text-lavender-300 font-medium text-base focus:outline-none focus:ring-2 focus:ring-lavender-300 transition-all"
              />
            </div>
          </motion.div>

          {/* Age group filter chips */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-4 flex flex-wrap gap-2">
            <AgeChip label="All Ages" emoji="✨" active={activeAge === 'all'} onClick={() => setActiveAge('all')} />
            {ageGroups.map((ag) => (
              <AgeChip
                key={ag.id}
                label={ag.label}
                emoji={ag.emoji}
                active={activeAge === ag.id}
                onClick={() => setActiveAge(ag.id)}
              />
            ))}
          </motion.div>

          {/* Category chips */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-3 flex flex-wrap gap-2">
            <CategoryChip label="All Categories" active={activeCat === 'all'} onClick={() => setActiveCat('all')} icon={<SlidersHorizontal size={15} />} />
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <CategoryChip
                  key={c.id}
                  label={c.label}
                  active={activeCat === c.id}
                  onClick={() => setActiveCat(c.id)}
                  icon={<Icon size={15} />}
                />
              );
            })}
          </motion.div>

          {/* Results count */}
          <p className="mt-4 text-sm text-lavender-400 font-semibold">
            {filtered.length} {filtered.length === 1 ? 'game' : 'games'} found
          </p>

          {/* Loading skeleton */}
          {(statsLoading || favoritesLoading) && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-4xl overflow-hidden shadow-soft">
                  <Skeleton className="aspect-[16/10] rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2 pt-2"><Skeleton className="h-6 w-16" /><Skeleton className="h-6 w-16" /></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Age-grouped sections */}
          <div className="mt-4 space-y-10">
            {grouped.map((section) => {
              const ag = ageGroups.find((a) => a.id === section.age)!;
              return (
                <div key={section.age}>
                  {/* Age group header */}
                  <AgeGroupHeader ageGroup={ag} count={section.games.length} />
                  {/* Game grid */}
                  <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    <AnimatePresence mode="popLayout">
                      {section.games.map((g, i) => (
                        <GameCard
                          key={g.id}
                          game={g}
                          stat={stats.get(g.id)}
                          onPlay={() => onPlayGame(g.id)}
                          index={i}
                          isFav={favorites.has(g.id)}
                          onToggleFav={() => toggleFav(g.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && !statsLoading && !favoritesLoading && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24">
              <motion.div animate={{ y: [0, -10, 0], rotate: [0, -5, 5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-7xl mb-4">
                🔍
              </motion.div>
              <p className="font-display text-xl text-lavender-400">No games found</p>
              <p className="text-lavender-300 mt-1">Try a different search or filter!</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function AgeChip({ label, emoji, active, onClick }: { label: string; emoji: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-2xl font-display font-semibold text-sm transition-all touch-target-sm ${
        active ? 'bg-gradient-to-r from-lavender-300 to-sky-400 text-white shadow-soft' : 'glass text-lavender-500 hover:bg-white'
      }`}
    >
      <span>{emoji}</span>
      {label}
    </motion.button>
  );
}

function CategoryChip({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-display font-semibold text-sm transition-all touch-target-sm ${
        active ? 'bg-lavender-400 text-white shadow-soft' : 'glass text-lavender-500 hover:bg-white'
      }`}
    >
      {icon}
      {label}
    </motion.button>
  );
}

function AgeGroupHeader({ ageGroup, count }: { ageGroup: typeof ageGroups[0]; count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative overflow-hidden rounded-4xl p-4 sm:p-6 mb-5 bg-gradient-to-r ${ageGroup.gradient}`}
    >
      {/* Decorative elements */}
      <motion.div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/15"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-10 left-20 w-24 h-24 rounded-full bg-white/10"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 7, repeat: Infinity, delay: 1 }}
      />
      <div className="relative flex items-center gap-3 sm:gap-4">
        <motion.div
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white/40 backdrop-blur-sm flex items-center justify-center text-3xl sm:text-4xl shadow-soft shrink-0"
          animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
        >
          {ageGroup.mascot}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xl sm:text-2xl">{ageGroup.emoji}</span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-lavender-500">{ageGroup.title}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-white/60 text-xs font-display font-bold text-lavender-500">{ageGroup.label}</span>
          </div>
          <p className="text-xs sm:text-sm text-lavender-500/80 leading-relaxed">{ageGroup.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {ageGroup.skills.map((s) => (
              <span key={s} className="px-2.5 py-0.5 rounded-full bg-white/50 text-xs font-display font-semibold text-lavender-500">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="hidden sm:block text-right shrink-0">
          <p className="font-display text-3xl font-bold text-lavender-500">{count}</p>
          <p className="text-xs text-lavender-400 font-semibold">games</p>
        </div>
      </div>
    </motion.div>
  );
}

function GameCard({ game, stat, onPlay, index, isFav, onToggleFav }: {
  game: Game;
  stat?: { game_id: string; total_plays: number; total_stars: number; rating_sum: number; rating_count: number };
  onPlay: () => void;
  index: number;
  isFav: boolean;
  onToggleFav: () => void;
}) {
  const Icon = game.icon;

  const totalPlays = stat?.total_plays ?? 0;
  const ratingCount = stat?.rating_count ?? 0;
  const ratingSum = stat?.rating_sum ?? 0;
  const avgRating = ratingCount > 0 ? ratingSum / ratingCount : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: index * 0.04 }}
      whileHover={{ y: -10 }}
      onClick={onPlay}
      className="group relative bg-white rounded-3xl shadow-soft border border-white/70 overflow-hidden cursor-pointer h-full flex flex-col hover:shadow-lg transition-shadow duration-300"
    >
      {/* Card glow on hover */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-25 blur-xl transition-opacity duration-500 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${game.accent}, transparent)` }}
      />

      {/* Illustration header with better visual hierarchy */}
      <div className={`relative aspect-[16/10] bg-gradient-to-br ${game.bg} flex items-center justify-center overflow-hidden`}>
        {/* Animated background shapes */}
        <motion.div
          className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/15"
          animate={{ scale: [1, 1.15, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-10 -left-6 w-24 h-24 rounded-full bg-white/10"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        />

        {/* Floating decorative icons */}
        {[{ icon: '✨', top: '18%', left: '14%' }, { icon: '⭐', top: '20%', left: '78%' }, { icon: '🎯', top: '62%', left: '78%' }, { icon: '🚀', top: '70%', left: '18%' }].map((item, i) => (
          <motion.div
            key={item.icon + i}
            className="absolute text-white/70 drop-shadow-md"
            style={{ top: item.top, left: item.left }}
            animate={{
              y: [0, -12, 0],
              rotate: [0, 10, -10, 0],
              scale: [0.9, 1.2, 0.9],
              opacity: [0.5, 1, 0.6],
            }}
            transition={{ duration: 2.8 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          >
            <span className="text-lg sm:text-xl">{item.icon}</span>
          </motion.div>
        ))}

        {/* Twinkle stars - repositioned for better visibility */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/50"
            style={{ top: `${20 + i * 20}%`, left: `${75 + (i % 2) * 15}%` }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.7, 1.3, 0.7] }}
            transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: i * 0.6 }}
          >
            <Star size={14} fill="currentColor" />
          </motion.div>
        ))}

        {/* Big emoji illustration - centered and prominent */}
        <motion.div
          className="relative z-10 flex items-center justify-center"
          animate={{ y: [0, -12, 0], rotate: [0, -6, 6, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 4, repeat: Infinity, delay: index * 0.3, type: 'tween' }}
        >
          <span className="text-6xl sm:text-7xl drop-shadow-lg">{game.emoji}</span>
        </motion.div>

        {/* Icon badge - category identifier */}
        <motion.div
          className="absolute bottom-3 left-3 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white shadow-md flex items-center justify-center"
          animate={{ rotate: [0, -10, 10, 0], y: [0, -4, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon className="text-lavender-500 w-5 h-5 sm:w-6 sm:h-6" />
        </motion.div>

        {/* Top-right section: Rating and Favorite */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
          {/* Rating badge — with better styling */}
          {avgRating !== null && (
            <motion.div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-md backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <Star size={14} fill="currentColor" className="text-lemon-500" />
              <span className="text-xs font-display font-bold text-lemon-500">{avgRating.toFixed(1)}</span>
            </motion.div>
          )}
          
          {/* Favorite button - prominent and clear */}
          <motion.button
            onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart size={18} className={isFav ? 'text-blush-500' : 'text-lavender-300'} fill={isFav ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        {/* New / Trending badges - repositioned */}
        <div className="absolute bottom-3 right-3 flex gap-1.5 z-20">
          {game.isNew && (
            <motion.span
              className="px-2.5 py-1 rounded-full bg-mint-400 text-white text-[11px] font-display font-bold shadow-md"
              animate={{ scale: [1, 1.08, 1], y: [0, -2, 0] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            >
              ✨ NEW
            </motion.span>
          )}
          {game.isTrending && (
            <motion.span
              className="px-2.5 py-1 rounded-full bg-peach-400 text-white text-[11px] font-display font-bold flex items-center gap-1 shadow-md"
              animate={{ scale: [1, 1.08, 1], y: [0, -2, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: 0.2 }}
            >
              <TrendingUp size={11} /> HOT
            </motion.span>
          )}
        </div>

        {/* Play overlay on hover - improved */}
        <motion.div
          className="absolute inset-0 bg-lavender-500/25 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
        >
          <motion.div
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center"
            animate={{ scale: [1, 1.12, 1], rotate: [0, -9, 9, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Play size={28} className="text-lavender-500 ml-1" fill="currentColor" />
          </motion.div>
        </motion.div>
      </div>

      {/* Card body - organized sections */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
        {/* Category and Difficulty badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Badge color="lavender">{game.category}</Badge>
          </motion.div>
          <span className={`text-xs font-display font-semibold px-3 py-1.5 rounded-full shadow-sm ${difficultyColors[game.difficulty]}`}>
            {game.difficulty === 'Easy' && '⭐ Easy'}
            {game.difficulty === 'Medium' && '⭐⭐ Medium'}
            {game.difficulty === 'Hard' && '⭐⭐⭐ Hard'}
          </span>
        </div>

        {/* Title - clear and prominent */}
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-lavender-500 leading-tight line-clamp-2">{game.title}</h3>
          <p className="text-xs sm:text-sm text-lavender-400 mt-1.5 leading-relaxed line-clamp-2">{game.description}</p>
        </div>

        {/* Skills section - organized in a row with icons */}
        <div className="mt-1">
          <p className="text-[10px] font-display font-semibold text-lavender-300 mb-1.5 uppercase tracking-wide">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {game.skills.slice(0, 3).map((s, skillIndex) => (
              <motion.span
                key={s}
                className="px-2.5 py-1 rounded-full bg-gradient-to-r from-lavender-50 to-sky-50 text-[10px] font-display font-semibold text-lavender-500 border border-lavender-100 shadow-xs"
                whileHover={{ scale: 1.08, y: -2, backgroundColor: '#f3e8ff' }}
                animate={{
                  y: [0, -1.5, 0],
                  rotate: [0, skillIndex % 2 === 0 ? -1.5 : 1.5, 0],
                }}
                transition={{ duration: 2.6 + skillIndex * 0.4, repeat: Infinity, ease: 'easeInOut', delay: skillIndex * 0.2 }}
              >
                {s}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Footer - organized stats */}
        <div className="mt-auto pt-3 border-t border-lavender-100 space-y-2">
          {/* First row: Plays and Time */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-lavender-400 font-semibold min-w-0">
              {totalPlays > 0 ? (
                <motion.span className="flex items-center gap-1 shrink-0" whileHover={{ scale: 1.05 }}>
                  <Users size={14} className="text-lavender-400" />
                  <span className="font-display font-bold text-lavender-500">{formatPlays(totalPlays)}</span>
                  <span className="text-lavender-300">plays</span>
                </motion.span>
              ) : (
                <motion.span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-mint-100 text-mint-500 font-display font-semibold shrink-0" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Sparkles size={12} /> New Game
                </motion.span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-lavender-400 font-semibold">
              <Clock size={14} className="text-lavender-400" />
              <span className="font-display font-bold text-lavender-500">{game.estTime}</span>
            </div>
          </div>
          
          {/* Second row: Age range */}
          <div className="text-xs text-lavender-300 font-semibold">
            👧👦 <span className="font-display font-bold text-lavender-500">Ages {game.ageRange}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
