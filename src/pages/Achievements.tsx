import { motion } from 'framer-motion';
import { Lock, Star, Trophy, Zap } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Card, Badge, ProgressRing, SectionTitle, Skeleton } from '@/components/ui';
import { useProfile, useAchievements, useBadges } from '@/lib/hooks';

const XP_PER_LEVEL = 300;

export default function Achievements() {
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const { achievements, loading: achievementsLoading, error: achievementsError } = useAchievements();
  const { badges, loading: badgesLoading, error: badgesError } = useBadges();

  const loading = (profileLoading || achievementsLoading || badgesLoading) && !(profileError && achievementsError && badgesError);

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <AnimatedBackground density="low" />
        <div className="relative pt-24 pb-20 md:pb-8 px-4">
          <div className="mx-auto max-w-5xl">
            {/* Header skeleton */}
            <div className="text-center mb-8">
              <Skeleton className="w-20 h-20 rounded-3xl mx-auto mb-4" />
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-5 w-64 mx-auto" />
            </div>
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-4xl p-6 shadow-soft">
                  <Skeleton className="w-14 h-14 rounded-2xl mx-auto mb-3" />
                  <Skeleton className="h-7 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
            {/* Grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-4xl p-6 shadow-soft flex gap-4">
                  <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-6 w-20 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const unlocked = achievements.filter((a) => a.unlocked).length;
  const totalStars = profile?.stars ?? 0;
  const dayStreak = profile?.day_streak ?? 0;
  const totalXp = profile?.xp ?? 0;

  const level = profile?.level ?? 1;
  const levelXp = totalXp % XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL - levelXp;
  const levelProgress = Math.round((levelXp / XP_PER_LEVEL) * 100);
  const nextLevel = level + 1;

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground density="low" />
      <div className="relative pt-24 pb-20 md:pb-8 px-4">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-lemon-200 to-peach-200 items-center justify-center mb-4 shadow-soft"
            >
              <Trophy className="text-peach-500" size={40} />
            </motion.div>
            <h1 className="font-display text-fluid-h2 font-bold text-lavender-500">My Achievements</h1>
            <p className="text-fluid-body text-lavender-400 mt-2">Look at all the amazing things you've done!</p>
          </motion.div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <StatCard icon="🏆" value={unlocked} label="Badges Unlocked" color="from-lemon-200 to-peach-200" />
            <StatCard icon="⭐" value={totalStars} label="Stars Collected" color="from-lemon-200 to-lemon-300" />
            <StatCard icon="🔥" value={dayStreak} label="Day Streak" color="from-blush-200 to-peach-200" />
            <StatCard icon="🪙" value={(profile?.coins ?? 0).toLocaleString()} label="Coins Earned" color="from-lemon-200 to-peach-200" />
          </div>

          {/* Achievements grid */}
          <SectionTitle title="All Achievements" subtitle="Unlock them all!" />
          {achievements.length === 0 ? (
            <Card className="p-10 text-center">
              <Trophy className="mx-auto text-lavender-300" size={40} />
              <p className="text-lavender-400 mt-3 font-display font-semibold">Play games to start earning achievements!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {achievements.map((a, i) => (
                <motion.div
                  key={a.achievement_key}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08, type: 'spring' }}
                >
                  <Card className={`p-4 sm:p-6 h-full ${a.unlocked ? '' : 'opacity-70'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-3xl shrink-0`}>
                        {a.icon}
                        {!a.unlocked && (
                          <div className="absolute inset-0 rounded-2xl bg-cream/70 flex items-center justify-center">
                            <Lock className="text-lavender-400" size={22} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-lavender-500 line-clamp-2">{a.title}</h3>
                        <p className="text-fluid-body text-sm text-lavender-400 mt-0.5 line-clamp-2 overflow-hidden">{a.description}</p>
                        {a.unlocked ? (
                          <Badge color="mint" className="mt-2"><Star size={12} fill="currentColor" /> Unlocked</Badge>
                        ) : (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-lavender-400 mb-1">
                              <span>{a.progress} / {a.total}</span>
                            </div>
                            <div className="h-2 rounded-full bg-lavender-100 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-sky-300 to-lavender-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, Math.round(((a.progress ?? 0) / (a.total ?? 1)) * 100))}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Badges */}
          <SectionTitle title="My Badges" subtitle="Special rewards just for you" />
          {badges.length === 0 ? (
            <Card className="p-10 text-center">
              <Trophy className="mx-auto text-lavender-300" size={40} />
              <p className="text-lavender-400 mt-3 font-display font-semibold">Complete challenges to earn badges!</p>
            </Card>
          ) : (
            <Card className="p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {badges.map((b, i) => (
                  <motion.div
                    key={b.badge_key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div className={`w-16 h-16 mx-auto rounded-2xl ${b.color} flex items-center justify-center text-3xl mb-2 shrink-0`}>
                      {b.icon}
                    </div>
                    <p className="font-display font-semibold text-sm text-lavender-500 line-clamp-2 overflow-hidden">{b.label}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}

          {/* Level progress */}
          <Card className="p-4 sm:p-6 mt-6 bg-gradient-to-br from-lavender-100 to-sky-100">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
              <ProgressRing value={levelProgress} size={80} color="#9d7ce6" label={`Lvl ${level}`} />
              <div className="min-w-0">
                <h3 className="font-display text-lg sm:text-xl font-bold text-lavender-500 line-clamp-2">Almost Level {nextLevel}!</h3>
                <p className="text-sm text-lavender-400 mt-1 line-clamp-2">Earn {xpToNext.toLocaleString()} more XP to level up and unlock new rewards.</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                  <Zap size={16} className="text-lemon-500 shrink-0" />
                  <span className="font-display font-bold text-sm sm:text-base text-lavender-500">{levelXp.toLocaleString()} / {XP_PER_LEVEL.toLocaleString()} XP</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
  return (
    <Card className="p-3 sm:p-5 text-center overflow-hidden">
      <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-xl sm:text-2xl mb-2 shrink-0`}>
        {icon}
      </div>
      <p className="font-display text-xl sm:text-2xl font-bold text-lavender-500 truncate">{value}</p>
      <p className="text-xs text-lavender-400 font-semibold line-clamp-2">{label}</p>
    </Card>
  );
}
