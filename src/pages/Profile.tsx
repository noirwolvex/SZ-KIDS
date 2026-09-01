import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Zap, Flame, Pencil, Crown, Check, X, Coins, Trophy,
  Gamepad2, Clock, Heart, Sparkles, TrendingUp, Award, ChevronRight,
  Calendar, Target, BookOpen,
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Card, Badge, ProgressRing, Button, SectionTitle, Skeleton, EmptyState } from '@/components/ui';
import { useProfile, useBadges, useAchievements, useGameProgress, useActivityLog, useFavorites } from '@/lib/hooks';
import { useSkillProgress, useDailyGoal } from '@/lib/learn-hooks';
import { games, getGameById, categories } from '@/data/content';

const AVATAR_OPTIONS = ['🦊', '🐼', '🦄', '🦉', '🐸', '🐙', '🦋', '🐝', '🦁', '🐉', '🧙', '🧑‍🚀'];
const XP_PER_LEVEL = 300;

type ProfileProps = { onNavigate: (page: string) => void };

export default function Profile({ onNavigate }: ProfileProps) {
  const { profile, loading: profileLoading, error: profileError, save } = useProfile();
  const { badges, loading: badgesLoading } = useBadges();
  const { achievements, loading: achievementsLoading } = useAchievements();
  const { progress: gameProgress, loading: progressLoading } = useGameProgress();
  const { log: activityLog, loading: logLoading } = useActivityLog(6);
  const { favorites, loading: favLoading } = useFavorites();
  const { skills, loading: skillsLoading } = useSkillProgress();
  const { goal, loading: goalLoading } = useDailyGoal();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const loading = (profileLoading || !profile) && !profileError;

  // Derived real data
  const stats = useMemo(() => {
    if (!profile) return null;
    const level = profile.level;
    const currentLevelXp = profile.xp % XP_PER_LEVEL;
    const xpToNext = XP_PER_LEVEL - currentLevelXp;
    const progressPct = Math.round((currentLevelXp / XP_PER_LEVEL) * 100);
    return { level, currentLevelXp, xpToNext, progressPct };
  }, [profile]);

  const favoriteGames = useMemo(() => {
    if (favLoading) return [];
    return games.filter((g) => favorites.has(g.id)).slice(0, 4);
  }, [favorites, favLoading]);

  const recentGames = useMemo(() => {
    if (progressLoading || !gameProgress.length) return [];
    return [...gameProgress]
      .sort((a, b) => (b.last_played_at ?? '').localeCompare(a.last_played_at ?? ''))
      .slice(0, 4)
      .map((gp) => ({ ...gp, game: getGameById(gp.game_id) }))
      .filter((gp) => gp.game);
  }, [gameProgress, progressLoading]);

  const unlockedAchievements = useMemo(() => {
    if (achievementsLoading) return [];
    return achievements.filter((a) => a.unlocked);
  }, [achievements, achievementsLoading]);

  const totalStarsEarned = useMemo(() => {
    if (progressLoading) return 0;
    return gameProgress.reduce((sum, gp) => sum + (gp.stars_earned ?? 0), 0);
  }, [gameProgress, progressLoading]);

  const gamesPlayedCount = useMemo(() => {
    if (progressLoading) return 0;
    return gameProgress.length;
  }, [gameProgress, progressLoading]);

  const skillData = useMemo(() => {
    if (skillsLoading || !skills.length) return [];
    return skills
      .map((s) => {
        const cat = categories.find((c) => `category:${c.id}` === s.skill_key);
        return { ...s, category: cat };
      })
      .filter((s) => s.category)
      .sort((a, b) => b.lessons_completed - a.lessons_completed)
      .slice(0, 4);
  }, [skills, skillsLoading]);

  if (loading) return <ProfileSkeleton />;
  if (!profile) return <ProfileError onRetry={() => window.location.reload()} />;

  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const startEditName = () => { setNameDraft(profile.name); setEditingName(true); };
  const cancelEditName = () => { setEditingName(false); setNameDraft(''); };

  const saveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === profile.name) { setEditingName(false); setNameDraft(''); return; }
    setSavingName(true);
    try { await save({ name: trimmed }); }
    finally { setSavingName(false); setEditingName(false); setNameDraft(''); }
  };

  const selectAvatar = async (emoji: string) => {
    if (emoji === profile.avatar || savingAvatar) return;
    setSavingAvatar(true);
    try { await save({ avatar: emoji }); }
    finally { setSavingAvatar(false); }
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground density="low" />
      <div className="relative pt-24 pb-20 md:pb-12 px-4">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* ─── HERO HEADER ─── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative rounded-5xl overflow-hidden shadow-soft-lg border border-white bg-white">
              {/* Banner */}
              <div className="relative h-28 sm:h-36 bg-gradient-to-r from-sky-200 via-lavender-200 to-blush-200 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-around opacity-50">
                  {['⭐', '☁️', '🌈', '✨', '☁️', '⭐', '🦋', '✨'].map((e, i) => (
                    <motion.span
                      key={i}
                      className="text-lg sm:text-2xl"
                      animate={{ y: [0, -10, 0], opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.2 }}
                    >
                      {e}
                    </motion.span>
                  ))}
                </div>
                {/* Level badge floating on banner */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/85 backdrop-blur-sm shadow-soft"
                >
                  <Crown size={14} className="text-lemon-500" />
                  <span className="font-display font-bold text-sm text-lavender-500">Level {stats?.level}</span>
                </motion.div>
              </div>

              {/* Identity section */}
              <div className="px-5 sm:px-8 pb-6 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
                  {/* Avatar — intentionally overlaps banner via its own negative margin */}
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="relative shrink-0 self-center sm:self-end -mt-12 sm:-mt-14"
                  >
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-4xl bg-gradient-to-br from-cream to-white border-4 border-white shadow-soft flex items-center justify-center text-4xl sm:text-5xl"
                    >
                      {profile.avatar}
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-lemon-300 to-lemon-400 border-2 border-white flex items-center justify-center shadow-soft"
                    >
                      <Crown size={11} className="text-white" />
                    </motion.div>
                  </motion.div>

                  {/* Name + meta — own column, fully contained */}
                  <div className="flex-1 min-w-0 text-center sm:text-left pb-1">
                    {editingName ? (
                      <div className="flex items-center gap-2 justify-center sm:justify-start max-w-full">
                        <input
                          value={nameDraft}
                          onChange={(e) => setNameDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveName();
                            if (e.key === 'Escape') cancelEditName();
                          }}
                          autoFocus maxLength={40} disabled={savingName}
                          className="font-display text-xl sm:text-2xl font-bold text-lavender-500 bg-lavender-50 border-2 border-lavender-300 rounded-xl px-3 py-1.5 outline-none focus:border-lavender-500 disabled:opacity-50 flex-1 min-w-0 max-w-[16rem]"
                        />
                        <button onClick={saveName} disabled={savingName}
                          className="touch-target-sm w-9 h-9 rounded-full bg-mint-400 text-white flex items-center justify-center hover:bg-mint-500 disabled:opacity-50 shrink-0" aria-label="Save name">
                          <Check size={16} />
                        </button>
                        <button onClick={cancelEditName} disabled={savingName}
                          className="touch-target-sm w-9 h-9 rounded-full bg-blush-200 text-blush-500 flex items-center justify-center hover:bg-blush-300 disabled:opacity-50 shrink-0" aria-label="Cancel edit">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <h1 className="font-display text-xl sm:text-2xl font-bold text-lavender-500 break-words leading-tight">{profile.name}</h1>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
                      <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-lavender-400 font-medium">
                        <Calendar size={13} className="shrink-0" /> Joined {joinedDate}
                      </span>
                      {profile.day_streak > 0 && (
                        <Badge color="lemon"><Flame size={12} className="shrink-0" /> {profile.day_streak} day streak</Badge>
                      )}
                    </div>
                  </div>

                  {/* Edit button — own column, aligned with profile info */}
                  {!editingName && (
                    <div className="flex justify-center sm:justify-end pb-1 shrink-0">
                      <Button variant="secondary" size="sm" icon={<Pencil size={15} />} onClick={startEditName}>
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── STAT CARDS ROW ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <StatCard icon="🪙" value={profile.coins.toLocaleString()} label="Coins" color="from-lemon-100 to-lemon-200" textColor="text-lemon-500" delay={0} />
            <StatCard icon="⭐" value={totalStarsEarned.toLocaleString()} label="Stars" color="from-peach-100 to-lemon-100" textColor="text-peach-500" delay={0.08} />
            <StatCard icon="⚡" value={profile.xp.toLocaleString()} label="Total XP" color="from-sky-100 to-lavender-100" textColor="text-sky-500" delay={0.16} />
            <StatCard icon="🎮" value={gamesPlayedCount.toLocaleString()} label="Games Played" color="from-mint-100 to-sky-100" textColor="text-mint-500" delay={0.24} />
          </div>

          {/* ─── XP PROGRESS + DAILY GOAL ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* XP Progress */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-3">
              <Card className="p-5 sm:p-6 h-full bg-gradient-to-br from-sky-50 to-lavender-50">
                <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
                  <div className="shrink-0">
                    <ProgressRing value={stats?.progressPct ?? 0} size={120} color="#9d7ce6" label={`Level ${stats?.level}`} />
                  </div>
                  <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                    <p className="text-lavender-400 text-xs font-semibold uppercase tracking-wide">Experience</p>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-lavender-500 mt-0.5 truncate">
                      {stats?.currentLevelXp.toLocaleString()} / {XP_PER_LEVEL.toLocaleString()} XP
                    </h3>
                    <p className="text-lavender-400 text-sm mt-1 truncate">
                      {stats?.xpToNext.toLocaleString()} XP until Level {(stats?.level ?? 1) + 1}
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 mt-4">
                      <MiniStat icon={<Star size={16} className="text-lemon-500" />} value={profile.stars.toLocaleString()} label="Stars" />
                      <MiniStat icon={<Zap size={16} className="text-sky-500" />} value={profile.xp.toLocaleString()} label="XP" />
                      <MiniStat icon={<Flame size={16} className="text-peach-500" />} value={String(profile.day_streak)} label="Streak" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Daily Goal */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
              <Card className="p-5 sm:p-6 h-full bg-gradient-to-br from-mint-50 to-sky-50">
                {goalLoading ? (
                  <div className="flex items-center justify-center h-full min-h-[120px]">
                    <Skeleton className="w-10 h-10 rounded-full" />
                  </div>
                ) : goal ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 rounded-2xl bg-mint-200 flex items-center justify-center">
                        <Target size={18} className="text-mint-500" />
                      </div>
                      <h3 className="font-display font-bold text-lavender-500">Today's Goal</h3>
                    </div>
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <p className="font-display text-2xl font-bold text-mint-500">{goal.lessons_completed}/{goal.target_lessons}</p>
                        <p className="text-xs text-lavender-400 font-medium">lessons completed</p>
                      </div>
                      {goal.completed && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                          <Badge color="mint"><Check size={12} /> Done!</Badge>
                        </motion.div>
                      )}
                    </div>
                    <div className="h-3 rounded-full bg-mint-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-mint-300 to-mint-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.round((goal.lessons_completed / goal.target_lessons) * 100))}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 text-sm text-lavender-400">
                      <Zap size={14} className="text-sky-400" />
                      <span className="font-medium">{goal.xp_earned}/{goal.target_xp} XP earned</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[120px] text-center">
                    <p className="text-lavender-300 text-sm font-medium">No goal set yet</p>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* ─── AVATAR PICKER ─── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-2xl bg-lavender-100 flex items-center justify-center">
                  <Sparkles size={18} className="text-lavender-500" />
                </div>
                <h2 className="font-display text-xl font-bold text-lavender-500">My Buddy</h2>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 sm:gap-3">
                {AVATAR_OPTIONS.map((e, i) => {
                  const selected = e === profile.avatar;
                  return (
                    <motion.button
                      key={e}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.03 }}
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => selectAvatar(e)}
                      disabled={savingAvatar}
                      className={`relative aspect-square rounded-3xl flex items-center justify-center text-2xl sm:text-3xl transition-all ${
                        selected
                          ? 'bg-gradient-to-br from-lavender-100 to-sky-100 ring-2 ring-lavender-400 shadow-soft'
                          : 'bg-lavender-50 hover:bg-lavender-100'
                      } ${savingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label={`Select avatar ${e}`}
                      aria-pressed={selected}
                    >
                      {e}
                      {selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-mint-400 flex items-center justify-center border-2 border-white"
                        >
                          <Check size={10} className="text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* ─── RECENTLY PLAYED + FAVORITES ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Recently Played */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card className="p-5 sm:p-6 h-full" hover={false}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-sky-100 flex items-center justify-center">
                    <Clock size={18} className="text-sky-500" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-lavender-500">Recently Played</h2>
                </div>
                {progressLoading ? (
                  <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
                ) : recentGames.length === 0 ? (
                  <EmptyState emoji="🎮" message="Play games to see your recent activity here!" actionLabel="Browse Games" onAction={() => onNavigate('games')} />
                ) : (
                  <div className="space-y-2.5">
                    {recentGames.map((gp, i) => (
                      <motion.div
                        key={gp.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.08 }}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-lavender-50 hover:bg-lavender-100 transition-colors cursor-pointer"
                        onClick={() => onNavigate('games')}
                      >
                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gp.game?.bg} flex items-center justify-center text-xl shrink-0`}>
                          {gp.game?.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-semibold text-sm text-lavender-500 truncate">{gp.game?.title}</p>
                          <p className="text-xs text-lavender-400">{gp.times_played} {gp.times_played === 1 ? 'play' : 'plays'}</p>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          {[1, 2, 3].map((s) => (
                            <Star key={s} size={14} className={s <= gp.stars_earned ? 'text-lemon-400 fill-lemon-400' : 'text-lavender-200'} fill={s <= gp.stars_earned ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Favorite Games */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <Card className="p-5 sm:p-6 h-full" hover={false}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-blush-100 flex items-center justify-center">
                    <Heart size={18} className="text-blush-500" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-lavender-500">Favorite Games</h2>
                </div>
                {favLoading ? (
                  <div className="grid grid-cols-2 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
                ) : favoriteGames.length === 0 ? (
                  <EmptyState emoji="💛" message="Tap the heart on games you love to save them here!" actionLabel="Find Games" onAction={() => onNavigate('games')} />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {favoriteGames.map((g, i) => (
                      <motion.button
                        key={g.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + i * 0.08 }}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onNavigate('games')}
                        className="flex items-center gap-2.5 p-3 rounded-2xl bg-blush-50 hover:bg-blush-100 transition-colors text-left"
                      >
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${g.bg} flex items-center justify-center text-lg shrink-0`}>
                          {g.emoji}
                        </div>
                        <p className="font-display font-semibold text-xs text-lavender-500 line-clamp-2">{g.title}</p>
                      </motion.button>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* ─── SKILL DEVELOPMENT ─── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Card className="p-5 sm:p-6" hover={false}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-2xl bg-mint-100 flex items-center justify-center">
                  <TrendingUp size={18} className="text-mint-500" />
                </div>
                <h2 className="font-display text-xl font-bold text-lavender-500">Skill Development</h2>
              </div>
              {skillsLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 rounded-2xl" />)}</div>
              ) : skillData.length === 0 ? (
                <EmptyState emoji="📚" message="Complete lessons to track your skill progress!" actionLabel="Start Learning" onAction={() => onNavigate('learn')} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {skillData.map((s, i) => {
                    const pct = s.total_lessons > 0 ? Math.round((s.lessons_completed / s.total_lessons) * 100) : 0;
                    const Icon = s.category?.icon;
                    return (
                      <motion.div
                        key={s.skill_key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.08 }}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-lavender-50"
                      >
                        <div className={`w-10 h-10 rounded-2xl ${s.category?.bg} flex items-center justify-center shrink-0`}>
                          {Icon && <Icon size={18} className={s.category?.color} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-display font-semibold text-sm text-lavender-500 truncate">{s.category?.label}</p>
                            <span className="text-xs text-lavender-400 font-medium shrink-0 ml-2">{s.lessons_completed}/{s.total_lessons}</span>
                          </div>
                          <div className="h-2 rounded-full bg-lavender-100 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-mint-300 to-mint-400"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 1, delay: 0.8 + i * 0.1, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                        {s.mastery_level > 0 && (
                          <div className="flex gap-0.5 shrink-0">
                            {[1, 2, 3].map((m) => (
                              <div key={m} className={`w-2 h-2 rounded-full ${m <= s.mastery_level ? 'bg-lemon-400' : 'bg-lavender-200'}`} />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>

          {/* ─── ACHIEVEMENTS + BADGES ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Achievements preview */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
              <Card className="p-5 sm:p-6 h-full" hover={false}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl bg-lemon-100 flex items-center justify-center">
                      <Trophy size={18} className="text-lemon-500" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-lavender-500">Achievements</h2>
                  </div>
                  <button onClick={() => onNavigate('achievements')} className="text-lavender-400 hover:text-lavender-500 text-sm font-display font-semibold flex items-center gap-0.5 touch-target-sm shrink-0">
                    All <ChevronRight size={16} />
                  </button>
                </div>
                {achievementsLoading ? (
                  <div className="grid grid-cols-3 gap-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}</div>
                ) : unlockedAchievements.length === 0 ? (
                  <EmptyState emoji="🏆" message="Play games to unlock achievements!" />
                ) : (
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                    {unlockedAchievements.slice(0, 6).map((a, i) => (
                      <motion.div
                        key={a.achievement_key}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 + i * 0.06, type: 'spring' }}
                        className="flex flex-col items-center text-center"
                      >
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-2xl mb-1.5`}>
                          {a.icon}
                        </div>
                        <p className="text-[10px] font-display font-semibold text-lavender-500 line-clamp-2 leading-tight">{a.title}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-lavender-100 flex items-center justify-between text-sm">
                  <span className="text-lavender-400 font-medium">{unlockedAchievements.length} unlocked</span>
                  <span className="text-lavender-300 text-xs">{achievements.length - unlockedAchievements.length} remaining</span>
                </div>
              </Card>
            </motion.div>

            {/* Badges */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
              <Card className="p-5 sm:p-6 h-full" hover={false}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-peach-100 flex items-center justify-center">
                    <Award size={18} className="text-peach-500" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-lavender-500">My Badges</h2>
                </div>
                {badgesLoading ? (
                  <div className="grid grid-cols-3 gap-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}</div>
                ) : badges.length === 0 ? (
                  <EmptyState emoji="🏅" message="Complete challenges to earn badges!" />
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    {badges.slice(0, 8).map((b, i) => (
                      <motion.div
                        key={b.badge_key}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.0 + i * 0.06, type: 'spring' }}
                        className="flex flex-col items-center text-center"
                      >
                        <div className={`w-14 h-14 rounded-2xl ${b.color} flex items-center justify-center text-2xl mb-1.5`}>
                          {b.icon}
                        </div>
                        <p className="text-[10px] font-display font-semibold text-lavender-500 line-clamp-2 leading-tight">{b.label}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* ─── ACTIVITY TIMELINE ─── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
            <Card className="p-5 sm:p-6" hover={false}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-2xl bg-sky-100 flex items-center justify-center">
                  <BookOpen size={18} className="text-sky-500" />
                </div>
                <h2 className="font-display text-xl font-bold text-lavender-500">Activity Timeline</h2>
              </div>
              {logLoading ? (
                <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-2xl" />)}</div>
              ) : activityLog.length === 0 ? (
                <EmptyState emoji="📋" message="Your learning activity will appear here!" />
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-lavender-100" />
                  <div className="space-y-3">
                    {activityLog.map((entry, i) => {
                      const game = getGameById(entry.game_id);
                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.1 + i * 0.08 }}
                          className="relative flex items-start gap-3 pl-0"
                        >
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${game?.bg ?? 'from-lavender-100 to-sky-100'} flex items-center justify-center text-base shrink-0 z-10 border-2 border-white shadow-soft`}>
                            {entry.game_icon || game?.emoji || '🎮'}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <p className="font-display font-semibold text-sm text-lavender-500">{entry.game_title}</p>
                            <p className="text-xs text-lavender-400">{entry.detail}</p>
                            <p className="text-[10px] text-lavender-300 mt-0.5">
                              {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* ─── QUICK ACTIONS ─── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="flex flex-wrap gap-3 justify-center pt-2">
            <Button onClick={() => onNavigate('achievements')} icon={<Trophy size={16} />}>View All Achievements</Button>
            <Button variant="secondary" onClick={() => onNavigate('games')} icon={<Gamepad2 size={16} />}>Play Games</Button>
            <Button variant="secondary" onClick={() => onNavigate('shop')} icon={<Coins size={16} />}>Visit Shop</Button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function StatCard({ icon, value, label, color, textColor, delay }: {
  icon: string; value: string; label: string; color: string; textColor: string; delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="p-3 sm:p-4 text-center">
        <div className={`w-11 h-11 sm:w-12 sm:h-12 mx-auto rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-xl sm:text-2xl mb-2`}>
          {icon}
        </div>
        <p className={`font-display text-lg sm:text-xl font-bold ${textColor} line-clamp-1`}>{value}</p>
        <p className="text-[10px] sm:text-xs text-lavender-400 font-semibold">{label}</p>
      </Card>
    </motion.div>
  );
}

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <div className="min-w-0">
        <p className="font-display font-bold text-lavender-500 text-sm">{value}</p>
        <p className="text-[10px] text-lavender-400">{label}</p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground density="low" />
      <div className="relative pt-24 pb-20 px-4">
        <div className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-48 rounded-5xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-4xl" />)}
          </div>
          <Skeleton className="h-36 rounded-4xl" />
          <Skeleton className="h-48 rounded-4xl" />
        </div>
      </div>
    </div>
  );
}

function ProfileError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground density="low" />
      <div className="relative pt-28 pb-20 px-4">
        <div className="mx-auto max-w-4xl">
          <EmptyState emoji="😵" title="Could not load your profile" message="Something went wrong. Please try again!" actionLabel="Try Again" onAction={onRetry} />
        </div>
      </div>
    </div>
  );
}
