import { motion } from 'framer-motion';
import { Play, Star, Gift, TrendingUp, Sparkles, ArrowRight, Calendar, Zap, GraduationCap } from 'lucide-react';
import Mascot from '@/components/Mascot';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Button, Card, Badge, ProgressRing, Spinner, EmptyState, SectionTitle, staggerContainer, staggerItem } from '@/components/ui';
import { games, categories, ageGroups, gamesByAge, getGameById } from '@/data/content';
import { useProfile, useGameProgress, useDailyChallenges, useTestimonials, useAchievements } from '@/lib/hooks';

type HomeProps = {
  onNavigate: (page: string) => void;
  onPlayGame: (gameId: string) => void;
};

const container = staggerContainer;
const item = staggerItem;

export default function Home({ onNavigate, onPlayGame }: HomeProps) {
  const { profile, loading: profileLoading } = useProfile();
  const { progress, loading: progressLoading } = useGameProgress();
  const { challenges, loading: challengesLoading, complete } = useDailyChallenges();
  const { testimonials, loading: testimonialsLoading } = useTestimonials();
  const { achievements, loading: achievementsLoading } = useAchievements();

  // Real profile-derived floating chips
  const floatingChips: { className: string; icon: string; label: string; delay: number }[] = [];
  if (profile && !profileLoading) {
    if (profile.xp > 0) {
      floatingChips.push({ className: 'top-2 left-0', icon: '⭐', label: `${profile.xp.toLocaleString()} XP`, delay: 0 });
    }
    if (profile.level > 0) {
      floatingChips.push({ className: 'bottom-10 right-0', icon: '🏆', label: `Level ${profile.level}`, delay: 0.5 });
    }
    if (profile.day_streak > 0) {
      floatingChips.push({ className: 'top-1/2 left-0', icon: '🔥', label: `${profile.day_streak} day streak`, delay: 1 });
    }
  }
  // Fallback chip for fresh profiles
  if (profile && !profileLoading && floatingChips.length === 0) {
    floatingChips.push({ className: 'top-2 left-0', icon: '🎮', label: 'Start playing!', delay: 0 });
  }

  // Continue Learning: real progress entries sorted by most recently played
  const continueLearning = [...progress]
    .sort((a, b) => (new Date(b.last_played_at ?? 0).getTime() || 0) - (new Date(a.last_played_at ?? 0).getTime() || 0))
    .slice(0, 3)
    .map((p) => {
      const game = getGameById(p.game_id);
      const pct = p.completed ? 100 : Math.min(100, Math.round((p.stars_earned / 3) * 100));
      return { progress: p, game, pct };
    })
    .filter((entry) => entry.game);

  // Unlocked achievements for preview
  const unlockedAchievements = achievements.filter((a) => a.unlocked).slice(0, 4);

  // Progress rings: derive category mastery from real game progress
  const categoryMastery = (() => {
    if (!progress.length) return [];
    const byCategory = new Map<string, { total: number; earned: number }>();
    for (const p of progress) {
      const game = getGameById(p.game_id);
      if (!game) continue;
      const cat = game.category;
      const cur = byCategory.get(cat) ?? { total: 0, earned: 0 };
      cur.total += 3;
      cur.earned += p.stars_earned;
      byCategory.set(cat, cur);
    }
    return Array.from(byCategory.entries())
      .map(([cat, { total, earned }]) => ({ label: cat, value: total > 0 ? Math.round((earned / total) * 100) : 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 2);
  })();

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground density="medium" />

      {/* HERO */}
      <section className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 px-4">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge color="lemon" className="mb-4">
                <motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles size={14} />
                </motion.span>
                A safe, ad-free playground
              </Badge>
            </motion.div>
            <h1 className="font-display text-fluid-hero font-bold text-lavender-500">
              Where learning
              <br />
              feels like magic
            </h1>
            <p className="mt-4 sm:mt-5 text-fluid-body text-lavender-400 max-w-md leading-relaxed">
              A joyful playground where kids aged 3–12 play games, solve puzzles, read stories, and grow — all in a safe, ad-free world.
            </p>
            <div className="mt-6 sm:mt-7 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => onPlayGame('memory-match')} icon>
                Start Playing
              </Button>
              <Button size="lg" variant="secondary" onClick={() => onNavigate('learn')}>
                Start Learning
              </Button>
            </div>

            {/* Live XP bar */}
            {profile && !profileLoading && profile.xp > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-5 p-3 rounded-2xl glass shadow-soft max-w-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-display font-semibold text-lavender-500">Level {profile.level}</span>
                  <span className="text-xs text-lavender-400 font-semibold">{profile.xp.toLocaleString()} XP</span>
                </div>
                <div className="h-2.5 rounded-full bg-lavender-100 overflow-hidden relative">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-lavender-400 to-blush-400 relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (profile.xp % 300) / 3)}%` }}
                    transition={{ delay: 0.7, duration: 0.8, ease: 'easeOut' }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full bg-white/40"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>
                </div>
                <p className="text-[10px] text-lavender-300 mt-1 font-semibold">{300 - (profile.xp % 300)} XP to next level</p>
              </motion.div>
            )}

            <div className="mt-6 sm:mt-8 flex items-center gap-4 sm:gap-6">
              <div className="flex -space-x-3">
                {['👧', '👦', '🧒', '👶'].map((e, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 300 }}
                    className="w-11 h-11 rounded-full bg-white shadow-soft flex items-center justify-center text-lg border-2 border-cream"
                  >
                    {e}
                  </motion.div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-lemon-400">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5 + i * 0.08, type: 'spring' }}
                    >
                      <Star size={16} fill="currentColor" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm text-lavender-400 font-semibold mt-0.5">Loved by kids & parents</p>
              </div>
            </div>
          </motion.div>

          {/* Mascot scene — futuristic orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Orbiting rings — hidden on small screens to prevent overflow */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-lavender-200/40 hidden sm:block"
                style={{ width: 320, height: 320, top: -60, left: -60 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_12px_4px_rgba(56,189,248,0.5)]" />
              </motion.div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blush-200/40 hidden sm:block"
                style={{ width: 380, height: 380, top: -90, left: -90 }}
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-blush-400 shadow-[0_0_10px_3px_rgba(255,127,191,0.5)]" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-lemon-400 shadow-[0_0_8px_3px_rgba(255,210,77,0.5)]" />
              </motion.div>

              {/* Glow orb */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-200/50 to-lavender-200/50 blur-2xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <Mascot size={200} expression="excited" className="relative z-10 w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] lg:w-[280px] lg:h-[280px] max-w-[60vw] max-h-[60vw]" />
              {floatingChips.map((chip, i) => (
                <div key={i} className="hidden sm:block">
                  <FloatingChip className={chip.className} icon={chip.icon} label={chip.label} delay={chip.delay} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURED GAME — immersive banner */}
      <section className="relative px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-4xl sm:rounded-5xl bg-gradient-to-br from-lavender-300 via-sky-300 to-mint-300 p-6 sm:p-8 lg:p-10"
          >
            {/* Animated mesh overlay */}
            <motion.div
              className="absolute inset-0 opacity-20"
              style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.4), transparent 50%), radial-gradient(circle at 70% 50%, rgba(255,255,255,0.3), transparent 50%)' }}
              animate={{ x: ['-10%', '10%', '-10%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-white text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur-sm mb-3">
                  <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Zap size={12} fill="currentColor" />
                  </motion.span>
                  <span className="text-xs font-display font-bold uppercase tracking-wider">Featured Today</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                  Space Explorer
                </h2>
                <p className="mt-2 text-white/90 text-sm sm:text-base max-w-md">
                  Blast off into the cosmos! Discover planets, collect stardust, and learn about our solar system.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                  {['🚀 Space', '⭐ Easy', '⏱️ 5 min'].map((tag, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-display font-semibold"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
                <div className="mt-5">
                  <Button size="md" onClick={() => onPlayGame('space-explorer')} icon>
                    Launch Now
                  </Button>
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, -8, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-7xl sm:text-8xl shrink-0 relative"
              >
                🚀
                <motion.div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-2 rounded-full bg-gradient-to-r from-transparent via-lemon-300 to-transparent blur-sm"
                  animate={{ scaleX: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              </motion.div>
            </div>
            {/* Decorative orbits */}
            <motion.div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full border-2 border-white/10"
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white/30" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="relative px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <SectionTitle title="Pick an adventure" subtitle="Explore by category" />
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 sm:gap-3"
          >
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <motion.div key={c.id} variants={item} whileHover={{ y: -6, scale: 1.05 }}>
                  <button
                    onClick={() => onNavigate('games')}
                    className="w-full flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/70 glass shadow-soft hover:shadow-glow transition-shadow touch-target"
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${c.bg} flex items-center justify-center`}>
                      <Icon className={`${c.color} w-[22px] h-[22px] sm:w-[26px] sm:h-[26px]`} />
                    </div>
                    <span className="font-display font-semibold text-xs sm:text-sm text-lavender-500 text-center leading-tight">{c.label}</span>
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* TODAY'S CHALLENGE + CONTINUE LEARNING */}
      <section className="relative px-4 py-10">
        <div className="mx-auto max-w-7xl grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Daily challenge */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card className="p-5 sm:p-6 h-full bg-gradient-to-br from-lemon-100 to-peach-100 border-peach-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-lemon-200 flex items-center justify-center">
                  <Calendar className="text-lemon-500" size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lavender-500">Today's Challenges</h3>
                  <p className="text-xs text-lavender-400">Complete for extra rewards</p>
                </div>
              </div>
              {challengesLoading ? (
                <Spinner />
              ) : challenges.length === 0 ? (
                <EmptyState
                  emoji="🗓️"
                  message="No challenges today — check back soon!"
                />
              ) : (
                <div className="space-y-3">
                  {challenges.map((c) => (
                    <div key={c.challenge_key} className="flex items-center gap-3 p-3 rounded-2xl bg-white/70">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-lg`}>
                        {c.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-display font-semibold text-sm text-lavender-500">{c.title}</p>
                        <p className="text-xs text-peach-500 font-semibold">+{c.reward} coins</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => !c.completed && complete(c.challenge_key)}
                        disabled={c.completed}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${c.completed ? 'bg-mint-200 text-mint-500' : 'bg-mint-300 text-white'}`}
                      >
                        {c.completed ? <Star size={14} fill="currentColor" /> : <Play size={14} fill="white" />}
                      </motion.button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Continue learning */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <Card className="p-5 sm:p-6 h-full bg-gradient-to-br from-sky-100 to-lavender-100 border-lavender-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-sky-200 flex items-center justify-center">
                  <Zap className="text-sky-500" size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lavender-500">Continue Learning</h3>
                  <p className="text-xs text-lavender-400">Pick up where you left off</p>
                </div>
              </div>
              {progressLoading ? (
                <Spinner />
              ) : continueLearning.length === 0 ? (
                <EmptyState
                  emoji="🚀"
                  message="Start your first game!"
                  actionLabel="Browse Games"
                  onAction={() => onNavigate('games')}
                />
              ) : (
                <div className="space-y-3">
                  {continueLearning.map(({ progress: p, game, pct }) => {
                    if (!game) return null;
                    return (
                      <button
                        key={p.game_id}
                        onClick={() => onPlayGame(p.game_id)}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/70 hover:bg-white transition-colors text-left"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${game.bg} flex items-center justify-center text-xl`}>
                          {game.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-semibold text-sm text-lavender-500 truncate">{game.title}</p>
                          <div className="mt-1 h-1.5 rounded-full bg-lavender-100 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-sky-300 to-lavender-400"
                              initial={{ width: 0 }}
                              whileInView={{ width: `${pct}%` }}
                              viewport={{ once: true }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-lavender-400">{pct}%</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <Card className="p-5 sm:p-6 h-full bg-gradient-to-br from-mint-100 to-sky-100 border-mint-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-mint-200 flex items-center justify-center">
                  <TrendingUp className="text-mint-500" size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lavender-500">Your Progress</h3>
                  <p className="text-xs text-lavender-400">Keep it up, superstar!</p>
                </div>
              </div>
              {profileLoading ? (
                <Spinner />
              ) : !profile || profile.xp === 0 ? (
                <EmptyState
                  emoji="🌱"
                  message="Your journey begins now — play a game to earn your first XP!"
                  actionLabel="Start Playing"
                  onAction={() => onPlayGame('memory-match')}
                />
              ) : (
                <>
                  <div className="flex items-center justify-around py-2">
                    {categoryMastery.length > 0 ? (
                      categoryMastery.map((m) => (
                        <div key={m.label} className="text-center">
                          <ProgressRing value={m.value} color={m.label === 'Math' ? '#34c187' : '#9d7ce6'} label={m.label} />
                        </div>
                      ))
                    ) : (
                      <div className="text-center w-full">
                        <ProgressRing value={0} color="#34c187" label="New" />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <StatBox value={profile.xp.toLocaleString()} label="XP" icon="⚡" />
                    <StatBox value={String(profile.stars)} label="Stars" icon="⭐" />
                    <StatBox value={String(profile.coins)} label="Coins" icon="🪙" />
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        </div>
      </section>

      {/* LEARNING HUB PROMO */}
      <section className="relative px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-4xl sm:rounded-5xl bg-gradient-to-r from-sky-200 via-lavender-200 to-mint-200 p-6 sm:p-8 lg:p-10"
          >
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <Badge color="lavender" className="mb-2"><GraduationCap size={14} /> New!</Badge>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-lavender-500 leading-tight">
                  Discover the Learning Hub
                </h2>
                <p className="mt-2 text-lavender-500/80 text-sm sm:text-base max-w-md">
                  Interactive lessons, quizzes, and adventures across 10 subjects. Earn XP, track your skills, and reach your daily goals!
                </p>
                <div className="mt-4">
                  <Button size="md" onClick={() => onNavigate('learn')} icon>
                    Start Learning
                  </Button>
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-6xl sm:text-7xl shrink-0"
              >
                🎓
              </motion.div>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/15" />
            <div className="absolute -bottom-12 -left-8 w-52 h-52 rounded-full bg-white/10" />
          </motion.div>
        </div>
      </section>

      {/* AGE GROUP SECTIONS */}
      <section className="relative px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <SectionTitle title="Learn by age" subtitle="Games designed for every stage" action={() => onNavigate('games')} />
          <div className="space-y-8">
            {ageGroups.map((ag, agIdx) => (
              <div key={ag.id}>
                {/* Age group banner */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: agIdx * 0.1 }}
                  className={`relative overflow-hidden rounded-4xl p-5 mb-4 bg-gradient-to-r ${ag.gradient}`}
                >
                  <motion.div
                    className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/15"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 10, repeat: Infinity }}
                  />
                  <div className="relative flex items-center gap-4">
                    <motion.div
                      className="w-14 h-14 rounded-3xl bg-white/40 backdrop-blur-sm flex items-center justify-center text-3xl shadow-soft shrink-0"
                      animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
                      transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
                    >
                      {ag.mascot}
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{ag.emoji}</span>
                        <h3 className="font-display text-xl font-bold text-lavender-500">{ag.title}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-white/60 text-xs font-display font-bold text-lavender-500">{ag.label}</span>
                      </div>
                      <p className="text-sm text-lavender-500/80 mt-0.5">{ag.subtitle}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Games for this age */}
                <motion.div
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
                >
                  {gamesByAge(ag.id).slice(0, 4).map((g, i) => {
                    const Icon = g.icon;
                    return (
                      <motion.div key={g.id} variants={item} whileHover={{ y: -8 }} className="group">
                        <Card className="overflow-hidden cursor-pointer h-full" onClick={() => onPlayGame(g.id)}>
                          <div className={`relative h-28 sm:h-32 bg-gradient-to-br ${g.bg} flex items-center justify-center overflow-hidden`}>
                            <motion.div
                              className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/15"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 6, repeat: Infinity }}
                            />
                            <motion.div
                              animate={{ y: [0, -8, 0], rotate: [0, -5, 5, 0] }}
                              transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                            >
                              <span className="text-5xl drop-shadow-lg">{g.emoji}</span>
                            </motion.div>
                            {g.isNew && <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-mint-400 text-white text-[10px] font-display font-bold">NEW</span>}
                            <div className="absolute inset-0 bg-lavender-500/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-14 h-14 rounded-full bg-white shadow-soft-lg flex items-center justify-center">
                                <Play size={24} className="text-lavender-500 ml-1" fill="currentColor" />
                              </div>
                            </div>
                          </div>
                          <div className="p-4 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 min-w-0">
                              <Icon className="text-lavender-400 shrink-0" size={16} />
                              <h3 className="font-display font-bold text-sm sm:text-base text-lavender-500 leading-tight line-clamp-1 min-w-0">{g.title}</h3>
                            </div>
                            <p className="text-xs sm:text-sm text-lavender-400 mt-1 line-clamp-2">{g.description}</p>
                            <div className="flex items-center justify-between mt-3 gap-2">
                              <span className="text-xs text-lavender-300 shrink-0">{g.estTime}</span>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="w-9 h-9 rounded-full bg-gradient-to-r from-sky-300 to-lavender-400 flex items-center justify-center shrink-0"
                              >
                                <Play size={16} className="text-white" fill="white" />
                              </motion.div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DAILY REWARDS BANNER */}
      <section className="relative px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-4xl sm:rounded-5xl bg-gradient-to-r from-lavender-300 via-blush-300 to-peach-300 p-6 sm:p-8 lg:p-12"
          >
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Gift size={24} />
                  <span className="font-display font-semibold text-lg">Daily Reward</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">Open your mystery box!</h2>
                <p className="mt-2 text-white/90 text-sm sm:text-base max-w-md">Come back every day for coins, stars, and surprise rewards. Don't break your streak!</p>
              </div>
              <motion.div
                animate={{ rotate: [0, -5, 5, 0], y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl sm:text-7xl lg:text-8xl shrink-0"
              >
                🎁
              </motion.div>
            </div>
            {/* decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-8 w-52 h-52 rounded-full bg-white/10" />
          </motion.div>
        </div>
      </section>

      {/* ACHIEVEMENTS PREVIEW */}
      <section className="relative px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <SectionTitle title="Recent achievements" subtitle="Badges you've earned" action={() => onNavigate('achievements')} />
          {achievementsLoading ? (
            <Spinner />
          ) : unlockedAchievements.length === 0 ? (
            <EmptyState
              emoji="🏅"
              message="No achievements yet — play games to unlock your first badge!"
              actionLabel="Browse Games"
              onAction={() => onNavigate('games')}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {unlockedAchievements.map((a, i) => (
                <motion.div
                  key={a.achievement_key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                >
                  <Card className="p-4 sm:p-5 text-center overflow-hidden">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-2xl sm:text-3xl mb-3 shrink-0`}>
                      {a.icon}
                    </div>
                    <h3 className="font-display font-bold text-sm text-lavender-500 line-clamp-1">{a.title}</h3>
                    <p className="text-xs text-lavender-400 mt-1 line-clamp-2">{a.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative px-4 py-10 pb-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle title="Kids & parents love it" subtitle="What our friends say" />
          {testimonialsLoading ? (
            <Spinner />
          ) : testimonials.length === 0 ? (
            <EmptyState
              emoji="💬"
              message="No reviews yet — be the first to share your experience!"
            />
          ) : (
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name + i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <Card className="p-5 sm:p-6 h-full overflow-hidden">
                    <div className="flex items-center gap-3 mb-3 min-w-0">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-sky-200 to-lavender-200 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                        {t.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-bold text-lavender-500 truncate">{t.name}</p>
                        <div className="flex gap-0.5 text-lemon-400">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} size={12} fill={j < t.rating ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-lavender-400 leading-relaxed line-clamp-4">"{t.text}"</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative px-4 pb-20 md:pb-8">
        <div className="mx-auto max-w-7xl glass-strong rounded-4xl p-6 sm:p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">🦉</span>
            <span className="font-display text-xl font-semibold text-lavender-500">
              Wonder<span className="text-blush-400">Kids</span>
            </span>
          </div>
          <p className="text-sm text-lavender-400 max-w-md mx-auto">
            A safe, joyful learning world for curious minds. No ads, no tracking, just pure educational fun.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-lavender-400">
            <button onClick={() => onNavigate('games')} className="hover:text-lavender-500">Games</button>
            <button onClick={() => onNavigate('parent')} className="hover:text-lavender-500">For Parents</button>
            <button onClick={() => onNavigate('achievements')} className="hover:text-lavender-500">Achievements</button>
            <button onClick={() => onNavigate('settings')} className="hover:text-lavender-500">Settings</button>
          </div>
          <p className="text-xs text-lavender-300 mt-4">Made with love for young learners. COPPA-friendly & ad-free.</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: () => void }) {
  return <SectionTitle title={title} subtitle={subtitle} action={action} />;
}

function FloatingChip({ className, icon, label, delay }: { className: string; icon: string; label: string; delay: number }) {
  return (
    <motion.div
      className={`absolute ${className} z-20`}
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 3, repeat: Infinity, delay }}
    >
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl glass-strong shadow-soft">
        <span className="text-lg">{icon}</span>
        <span className="font-display font-semibold text-sm text-lavender-500">{label}</span>
      </div>
    </motion.div>
  );
}

function StatBox({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div className="p-2.5 rounded-2xl bg-white/60">
      <div className="text-lg">{icon}</div>
      <p className="font-display font-bold text-lavender-500 text-sm mt-0.5">{value}</p>
      <p className="text-[10px] text-lavender-400 font-semibold">{label}</p>
    </div>
  );
}


