import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import {
  Sparkles, Target, Flame, Star, Lock, CheckCircle2, PlayCircle,
  ArrowRight, Trophy, Search, Zap, BookOpen, TrendingUp, Clock,
  Rocket, GraduationCap,
} from 'lucide-react';
import { Card, Badge, ProgressRing, Spinner } from '@/components/ui';
import { useLessonProgress, useDailyGoal, useSkillProgress } from '@/lib/learn-hooks';
import { useProfile } from '@/lib/hooks';
import { lessonCategories, getLessonsByAge, getLessonsByCategory } from '@/data/lessons';
import type { Lesson } from '@/data/lessons';
import type { AgeGroup } from '@/data/content';
import { ageGroups } from '@/data/content';

type Props = {
  onOpenLesson: (lessonId: string) => void;
};

export default function LearnHub({ onOpenLesson }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAge, setSelectedAge] = useState<AgeGroup | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { progress, loading: progressLoading, isCompleted, isInProgress } = useLessonProgress();
  const { goal, loading: goalLoading } = useDailyGoal();
  const { skills, loading: skillsLoading, getSkill } = useSkillProgress();
  const { profile } = useProfile();

  const userAgeGroup: AgeGroup = (profile?.age_group && ['3-6', '7-11', '12+'].includes(profile.age_group as AgeGroup))
    ? (profile.age_group as AgeGroup)
    : '3-6';

  const recommendations = useMemo(() => {
    const allLessons = getLessonsByAge(userAgeGroup);
    const completedIds = new Set(progress.filter((p) => p.status === 'completed').map((p) => p.lesson_id));
    const inProgressIds = new Set(progress.filter((p) => p.status === 'in-progress').map((p) => p.lesson_id));

    const resume = allLessons.filter((l) => inProgressIds.has(l.id));
    const available = allLessons.filter((l) => {
      if (completedIds.has(l.id) || inProgressIds.has(l.id)) return false;
      return l.prerequisites.every((pre) => completedIds.has(pre));
    });
    const locked = allLessons.filter((l) => {
      if (completedIds.has(l.id) || inProgressIds.has(l.id)) return false;
      return !l.prerequisites.every((pre) => completedIds.has(pre));
    });

    return { resume, available: available.slice(0, 4), locked: locked.slice(0, 2), completed: completedIds };
  }, [progress, userAgeGroup]);

  const filteredLessons = useMemo(() => {
    let lessons: Lesson[] = [];
    if (selectedCategory) {
      if (selectedAge === 'all') {
        (['3-6', '7-11', '12+'] as AgeGroup[]).forEach((ag) => {
          lessons = [...lessons, ...getLessonsByCategory(selectedCategory, ag)];
        });
      } else {
        lessons = getLessonsByCategory(selectedCategory, selectedAge);
      }
    } else if (selectedAge !== 'all') {
      lessons = getLessonsByAge(selectedAge);
    } else {
      (['3-6', '7-11', '12+'] as AgeGroup[]).forEach((ag) => {
        lessons = [...lessons, ...getLessonsByAge(ag)];
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      lessons = lessons.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.skills.some((s) => s.toLowerCase().includes(q)),
      );
    }
    return lessons;
  }, [selectedCategory, selectedAge, searchQuery]);

  const completedCount = progress.filter((p) => p.status === 'completed').length;
  const totalLessons = getLessonsByAge('3-6').length + getLessonsByAge('7-11').length + getLessonsByAge('12+').length;
  const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const xpForNextLevel = 300 - ((profile?.xp || 0) % 300);
  const xpProgressPct = Math.min(100, Math.round(((profile?.xp || 0) % 300) / 300 * 100));

  const pathSteps = [
    { label: 'Resume', count: recommendations.resume.length, color: 'peach' as const },
    { label: 'Ready', count: recommendations.available.length, color: 'mint' as const },
    { label: 'Locked', count: recommendations.locked.length, color: 'lavender' as const },
  ];

  return (
    <div className="relative pt-24 pb-20 md:pb-8 px-4">
      <div className="mx-auto max-w-7xl">
        {/* ── Immersive Hero Panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-5xl overflow-hidden shadow-soft-lg border border-white mb-6 sm:mb-8"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-lavender-200 via-sky-200 to-mint-200" />
          {/* Floating decorative blobs */}
          <motion.div
            className="absolute -top-12 -left-8 w-40 h-40 rounded-full bg-white/20 blur-2xl"
            animate={{ scale: [1, 1.2, 1], x: [0, 15, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-16 -right-10 w-48 h-48 rounded-full bg-peach-200/30 blur-2xl"
            animate={{ scale: [1, 1.15, 1], x: [0, -15, 0] }}
            transition={{ duration: 7, repeat: Infinity }}
          />
          {/* Floating emojis — hidden on mobile to prevent overlap */}
          {['⭐', '☁️', '🌈', '✨', '🦋', '🌟'].map((e, i) => (
            <motion.span
              key={i}
              className="absolute text-lg sm:text-2xl opacity-40 hidden sm:inline"
              style={{
                top: `${15 + i * 12}%`,
                left: `${8 + i * 15}%`,
              }}
              animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
            >
              {e}
            </motion.span>
          ))}

          <div className="relative z-10 px-5 sm:px-10 py-8 sm:py-10">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
              {/* Left: title + search */}
              <div className="flex-1 min-w-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Badge color="lavender" className="mb-3 bg-white/60">
                    <motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                      <Sparkles size={14} />
                    </motion.span>
                    Learning Hub
                  </Badge>
                </motion.div>
                <h1 className="font-display text-fluid-hero font-bold text-lavender-500 leading-tight">
                  Your Magical
                  <br />
                  <span className="relative inline-block">
                    <span className="text-white drop-shadow-sm">Learning Adventure</span>
                    <motion.span
                      className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-white/80"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      style={{ originX: 0 }}
                    />
                  </span>
                </h1>
                <p className="text-lavender-500/80 mt-3 text-fluid-body max-w-lg">
                  Explore worlds of knowledge, complete lessons, earn XP, and become a learning champion!
                </p>

                {/* Search bar */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-5 relative max-w-md"
                >
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-lavender-300" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search lessons, skills..."
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-soft text-sm font-display text-lavender-500 placeholder:text-lavender-300 focus:outline-none focus:ring-2 focus:ring-lavender-300 focus:bg-white transition-all"
                  />
                  <AnimatePresence>
                    {searchQuery && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-lavender-100 flex items-center justify-center text-lavender-400 hover:bg-lavender-200 transition-colors"
                      >
                        ×
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Right: path summary circle */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35, type: 'spring' }}
                className="hidden lg:flex flex-col items-center gap-3 shrink-0"
              >
                <div className="relative w-36 h-36 rounded-5xl bg-white/70 backdrop-blur-md border border-white shadow-soft flex flex-col items-center justify-center">
                  <ProgressRing value={overallProgress} size={96} stroke={8} color="#9d7ce6" label="Complete" />
                  <p className="text-xs font-display font-semibold text-lavender-400 mt-1">{completedCount} of {totalLessons} done</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Dashboard ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
          {/* Daily Goal */}
          <Card hover={false} className="relative overflow-hidden p-5 sm:p-6 bg-gradient-to-br from-lemon-100 to-peach-100 border-peach-200">
            <motion.div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-peach-200/40 blur-2xl"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <motion.div
                    className="w-10 h-10 rounded-2xl bg-peach-200 flex items-center justify-center shrink-0"
                    whileHover={{ rotate: 15 }}
                  >
                    <Target size={20} className="text-peach-500" />
                  </motion.div>
                  <h3 className="font-display font-bold text-lavender-500 text-sm sm:text-base">Daily Goal</h3>
                </div>
                {goal?.completed && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                    <Badge color="mint"><CheckCircle2 size={12} /> Done!</Badge>
                  </motion.div>
                )}
              </div>
              {goalLoading ? (
                <div className="py-4"><Spinner size={20} /></div>
              ) : goal ? (
                <>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-display font-semibold text-lavender-400 mb-1.5">
                        <span>Lessons</span>
                        <span>{goal.lessons_completed} / {goal.target_lessons}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-white/60 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-peach-300 to-blush-400 relative"
                          animate={{ width: `${Math.min(100, Math.round((goal.lessons_completed / goal.target_lessons) * 100))}%` }}
                          transition={{ duration: 0.6 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-white/30 rounded-full"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        </motion.div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-display font-semibold text-lavender-400 mb-1.5">
                        <span>XP Earned</span>
                        <span>{goal.xp_earned} / {goal.target_xp}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-white/60 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-lemon-300 to-peach-400 relative"
                          animate={{ width: `${Math.min(100, Math.round((goal.xp_earned / goal.target_xp) * 100))}%` }}
                          transition={{ duration: 0.6 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-white/30 rounded-full"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-lavender-400 mt-4 font-medium">
                    {goal.completed ? "Amazing! You completed today's goal!" : 'Complete lessons to reach your daily goal!'}
                  </p>
                </>
              ) : (
                <p className="text-sm text-lavender-400">Start a lesson to begin today's goal!</p>
              )}
            </div>
          </Card>

          {/* Overall Progress */}
          <Card hover={false} className="relative overflow-hidden p-5 sm:p-6 bg-gradient-to-br from-sky-100 to-lavender-100 border-lavender-200">
            <motion.div
              className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-lavender-200/40 blur-2xl"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            <div className="relative z-10 flex items-center gap-4">
              <ProgressRing
                value={overallProgress}
                size={72}
                stroke={7}
                color="#9d7ce6"
                label="Done"
              />
              <div className="min-w-0">
                <h3 className="font-display font-bold text-lavender-500 text-sm sm:text-base">Overall Progress</h3>
                <p className="text-xs sm:text-sm text-lavender-400 mt-1">
                  {completedCount} of {totalLessons} lessons completed
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Flame size={14} className="text-peach-400" />
                  </motion.span>
                  <span className="text-xs font-display font-semibold text-peach-500">{profile?.day_streak || 0} day streak</span>
                </div>
              </div>
            </div>
          </Card>

          {/* XP & Level */}
          <Card hover={false} className="relative overflow-hidden p-5 sm:p-6 bg-gradient-to-br from-mint-100 to-sky-100 border-mint-200 sm:col-span-2 lg:col-span-1">
            <motion.div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-mint-200/40 blur-2xl"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 4.5, repeat: Infinity }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-3">
                <motion.div
                  className="w-10 h-10 rounded-2xl bg-mint-200 flex items-center justify-center shrink-0"
                  whileHover={{ rotate: -15 }}
                >
                  <Trophy size={20} className="text-mint-500" />
                </motion.div>
                <h3 className="font-display font-bold text-lavender-500 text-sm sm:text-base">Your Level</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="font-display font-bold text-3xl sm:text-4xl text-mint-500"
                >
                  {profile?.level || 1}
                </motion.span>
                <span className="text-sm text-lavender-400 font-display font-semibold">Level</span>
                <span className="ml-auto text-xs text-lavender-400 font-display font-semibold">
                  {(profile?.xp || 0).toLocaleString()} XP
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-white/60 overflow-hidden mt-3 relative">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-mint-300 to-sky-400 relative"
                  animate={{ width: `${xpProgressPct}%` }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/30 rounded-full"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
              </div>
              <p className="text-[10px] text-lavender-400 mt-1.5 font-medium">{xpForNextLevel.toLocaleString()} XP to next level</p>
            </div>
          </Card>
        </div>

        {/* ── Personalized Learning Path ── */}
        <section className="mb-8">
          <div className="flex items-end justify-between mb-4 sm:mb-5 gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-fluid-h2 font-bold text-lavender-500 leading-tight">
                Your Learning Path
              </h2>
              <p className="text-lavender-400 mt-1 text-sm sm:text-base">Recommended just for you</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass">
              <Zap size={14} className="text-lemon-400" fill="currentColor" />
              <span className="text-xs font-display font-semibold text-lavender-500">AI Personalized</span>
            </div>
          </div>

          {/* Path step indicators */}
          {!progressLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-6 p-3 rounded-3xl bg-white/60 border border-white shadow-soft"
            >
              {pathSteps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl flex-1 min-w-0 ${
                    step.color === 'peach' ? 'bg-peach-100' :
                    step.color === 'mint' ? 'bg-mint-100' : 'bg-lavender-100'
                  }`}>
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      step.color === 'peach' ? 'bg-peach-300' :
                      step.color === 'mint' ? 'bg-mint-300' : 'bg-lavender-300'
                    }`}>
                      {step.label === 'Resume' ? <PlayCircle size={14} className="text-white" /> :
                       step.label === 'Ready' ? <Sparkles size={14} className="text-white" /> :
                       <Lock size={14} className="text-white" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-display font-bold text-lavender-500 leading-tight">{step.label}</p>
                      <p className="text-[10px] text-lavender-400 font-medium">{step.count} lesson{step.count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  {i < pathSteps.length - 1 && <ArrowRight size={14} className="text-lavender-300 shrink-0 hidden sm:block" />}
                </div>
              ))}
            </motion.div>
          )}

          {progressLoading ? (
            <div className="py-8"><Spinner label="Loading your path..." /></div>
          ) : (
            <div className="space-y-5">
              {/* Resume lessons */}
              <AnimatePresence>
                {recommendations.resume.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-peach-200 flex items-center justify-center shrink-0">
                        <PlayCircle size={16} className="text-peach-500" />
                      </div>
                      <p className="text-xs font-display font-bold text-peach-500 uppercase tracking-wide">Continue Learning</p>
                      <div className="flex-1 h-px bg-peach-100" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      {recommendations.resume.map((lesson, i) => (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          status="in-progress"
                          onClick={() => onOpenLesson(lesson.id)}
                          index={i}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Available lessons */}
              <AnimatePresence>
                {recommendations.available.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-mint-200 flex items-center justify-center shrink-0">
                        <Sparkles size={16} className="text-mint-500" />
                      </div>
                      <p className="text-xs font-display font-bold text-mint-500 uppercase tracking-wide">Ready to Start</p>
                      <div className="flex-1 h-px bg-mint-100" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      {recommendations.available.map((lesson, i) => (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          status="available"
                          onClick={() => onOpenLesson(lesson.id)}
                          index={i}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Locked lessons */}
              <AnimatePresence>
                {recommendations.locked.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-lavender-100 flex items-center justify-center shrink-0">
                        <Lock size={16} className="text-lavender-400" />
                      </div>
                      <p className="text-xs font-display font-bold text-lavender-300 uppercase tracking-wide">Coming Soon</p>
                      <div className="flex-1 h-px bg-lavender-100" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      {recommendations.locked.map((lesson, i) => (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          status="locked"
                          onClick={() => {}}
                          index={i}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty state */}
              {recommendations.resume.length === 0 && recommendations.available.length === 0 && recommendations.locked.length === 0 && (
                <Card hover={false} className="p-8 text-center">
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-5xl mb-3 inline-block">📚</motion.div>
                  <p className="font-display font-bold text-lavender-500">All Caught Up!</p>
                  <p className="text-sm text-lavender-400 mt-1">You've completed all available lessons. Check back soon for more!</p>
                </Card>
              )}
            </div>
          )}
        </section>

        {/* ── Category Worlds ── */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <div className="w-9 h-9 rounded-2xl bg-lavender-100 flex items-center justify-center shrink-0">
              <BookOpen size={18} className="text-lavender-400" />
            </div>
            <h2 className="font-display text-fluid-h2 font-bold text-lavender-500 leading-tight">
              Explore Learning Worlds
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {lessonCategories.map((cat, idx) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              const skill = getSkill(`category:${cat.id}`);
              const lessonsInCat = getLessonsByCategory(cat.id);
              const completedInCat = skill?.lessons_completed || 0;
              const pct = lessonsInCat.length > 0 ? Math.round((completedInCat / lessonsInCat.length) * 100) : 0;
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -6, scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedCategory(isActive ? null : cat.id)}
                  className={`relative p-4 sm:p-5 rounded-3xl bg-gradient-to-br ${cat.gradient} shadow-soft overflow-hidden text-left transition-all ${isActive ? 'ring-2 ring-lavender-400 shadow-glow scale-105' : ''}`}
                >
                  <motion.div
                    className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/20"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3 + idx * 0.3, repeat: Infinity }}
                  />
                  <div className="relative z-10">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center mb-3 shadow-soft">
                      <Icon className={cat.color} size={26} />
                    </div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-lavender-500 leading-tight">{cat.label}</h3>
                    <p className="text-xs text-lavender-400 mt-0.5 line-clamp-1">{cat.description}</p>
                    {completedInCat > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-white/50 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-white"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          />
                        </div>
                        <span className="text-[10px] font-display font-bold text-lavender-500">{completedInCat}/{lessonsInCat.length}</span>
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* ── Skill Development Map ── */}
        {skills.length > 0 && !skillsLoading && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <div className="w-9 h-9 rounded-2xl bg-sky-100 flex items-center justify-center shrink-0">
                <TrendingUp size={18} className="text-sky-400" />
              </div>
              <h2 className="font-display text-fluid-h2 font-bold text-lavender-500 leading-tight">
                Skill Development
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {lessonCategories.map((cat) => {
                const skill = getSkill(`category:${cat.id}`);
                if (!skill) return null;
                const Icon = cat.icon;
                const pct = skill.total_lessons > 0 ? Math.round((skill.lessons_completed / skill.total_lessons) * 100) : 0;
                const masteryLabels = ['Beginner', 'Intermediate', 'Advanced', 'Master'];
                const masteryColors = ['text-lavender-400', 'text-sky-500', 'text-peach-500', 'text-mint-500'];
                return (
                  <Card key={cat.id} hover={false} className="p-4 sm:p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-2xl ${cat.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={cat.color} size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display font-bold text-sm text-lavender-500 truncate">{cat.label}</h3>
                        <p className={`text-xs font-semibold ${masteryColors[skill.mastery_level] || 'text-lavender-400'}`}>
                          {masteryLabels[skill.mastery_level] || 'Beginner'}
                        </p>
                      </div>
                      {skill.mastery_level >= 3 && (
                        <motion.span animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                          <Trophy size={18} className="text-lemon-400" fill="currentColor" />
                        </motion.span>
                      )}
                    </div>
                    <div className="h-2.5 rounded-full bg-lavender-100 overflow-hidden relative">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${cat.gradient} relative`}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-white/30 rounded-full"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      </motion.div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-lavender-400 font-medium">{skill.lessons_completed} / {skill.total_lessons} lessons</p>
                      <span className="text-xs font-display font-bold text-lavender-500">{pct}%</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Lesson Browser ── */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-5">
            <h2 className="font-display text-fluid-h2 font-bold text-lavender-500 leading-tight">
              {selectedCategory ? (() => {
                const cat = lessonCategories.find((c) => c.id === selectedCategory);
                return cat ? `${cat.emoji} ${cat.label} Lessons` : 'All Lessons';
              })() : searchQuery ? `Search: "${searchQuery}"` : 'All Lessons'}
            </h2>
            <div className="flex gap-2 flex-wrap">
              {(['all', '3-6', '7-11', '12+'] as const).map((ag) => {
                const labels: Record<string, string> = { all: 'All Ages', '3-6': 'Ages 3-6', '7-11': 'Ages 7-11', '12+': 'Ages 12+' };
                return (
                  <motion.button
                    key={ag}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAge(ag)}
                    className={`px-3 py-2 rounded-2xl font-display font-semibold text-xs sm:text-sm transition-all touch-target-sm ${
                      selectedAge === ag ? 'bg-lavender-400 text-white shadow-soft' : 'glass text-lavender-500 hover:bg-white'
                    }`}
                  >
                    {labels[ag]}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {filteredLessons.length === 0 ? (
            <Card hover={false} className="p-8 text-center">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2 inline-block">🔍</motion.div>
              <p className="text-sm text-lavender-400">No lessons found. Try a different filter!</p>
            </Card>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filteredLessons.map((lesson, i) => {
                  const status = isCompleted(lesson.id) ? 'completed' : isInProgress(lesson.id) ? 'in-progress' : 'available';
                  return (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      status={status}
                      onClick={() => onOpenLesson(lesson.id)}
                      index={i}
                    />
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        {/* ── Age Group Info ── */}
        {!selectedCategory && !searchQuery && (
          <section className="mt-8">
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <div className="w-9 h-9 rounded-2xl bg-mint-100 flex items-center justify-center shrink-0">
                <GraduationCap size={18} className="text-mint-500" />
              </div>
              <h2 className="font-display text-fluid-h2 font-bold text-lavender-500 leading-tight">
                Learning by Age
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
              {ageGroups.map((ag, idx) => {
                const lessonsForAge = getLessonsByAge(ag.id);
                const completedForAge = progress.filter((p) =>
                  p.status === 'completed' && lessonsForAge.some((l) => l.id === p.lesson_id)
                ).length;
                const agePct = lessonsForAge.length > 0 ? Math.round((completedForAge / lessonsForAge.length) * 100) : 0;
                return (
                  <motion.div
                    key={ag.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card hover={false} className={`relative overflow-hidden p-5 sm:p-6 bg-gradient-to-br ${ag.gradient}`}>
                      <motion.div
                        className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/20 blur-xl"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 4 + idx, repeat: Infinity }}
                      />
                      <div className="relative z-10">
                        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: idx * 0.5 }} className="text-3xl mb-2 inline-block">{ag.emoji}</motion.div>
                        <h3 className="font-display font-bold text-lg text-lavender-500">{ag.title}</h3>
                        <p className="text-xs text-lavender-400 mb-2">{ag.label}</p>
                        <p className="text-sm text-lavender-500/80 mb-3 leading-relaxed">{ag.description}</p>
                        {completedForAge > 0 && (
                          <div className="mb-3">
                            <div className="h-2 rounded-full bg-white/40 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-white"
                                initial={{ width: 0 }}
                                whileInView={{ width: `${agePct}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge color="lavender">{lessonsForAge.length} lessons</Badge>
                          {completedForAge > 0 && <Badge color="mint">{completedForAge} done</Badge>}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── Lesson Card Component ───

function LessonCard({ lesson, status, onClick, index = 0 }: {
  lesson: Lesson;
  status: 'available' | 'in-progress' | 'completed' | 'locked';
  onClick: () => void;
  index?: number;
}) {
  const cat = lessonCategories.find((c) => c.id === lesson.categoryId);
  const lessonProgress = status === 'completed' ? 100 : status === 'in-progress' ? 50 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={status === 'locked' ? undefined : { y: -8, scale: 1.03 }}
      whileTap={status === 'locked' ? undefined : { scale: 0.97 }}
      onClick={status === 'locked' ? undefined : onClick}
      className={`relative bg-white rounded-4xl shadow-soft border border-white overflow-hidden h-full flex flex-col group ${
        status === 'locked' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {/* Header with gradient and animated emoji */}
      <div className={`relative aspect-[16/10] bg-gradient-to-br ${cat?.gradient || 'from-lavender-200 to-sky-200'} flex items-center justify-center overflow-hidden`}>
        <motion.div
          className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-white/15"
          animate={{ scale: [1, 1.3, 1], x: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-white/10"
          animate={{ scale: [1, 1.2, 1], x: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
          className="relative z-10 text-5xl sm:text-6xl"
        >
          {lesson.emoji}
        </motion.div>

        {/* Status badge */}
        <div className="absolute top-3 right-3 z-20">
          {status === 'completed' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="w-8 h-8 rounded-full bg-mint-400 flex items-center justify-center shadow-soft"
            >
              <CheckCircle2 size={18} className="text-white" />
            </motion.div>
          )}
          {status === 'in-progress' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2.5 py-1 rounded-full bg-peach-400 text-white text-xs font-display font-bold shadow-soft flex items-center gap-1"
            >
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <PlayCircle size={12} />
              </motion.span>
              Resume
            </motion.div>
          )}
          {status === 'locked' && (
            <div className="w-8 h-8 rounded-full bg-lavender-200 flex items-center justify-center">
              <Lock size={16} className="text-lavender-400" />
            </div>
          )}
        </div>

        {/* Progress bar at bottom of header */}
        {lessonProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/10">
            <motion.div
              className={`h-full ${status === 'completed' ? 'bg-mint-400' : 'bg-peach-400'}`}
              initial={{ width: 0 }}
              animate={{ width: `${lessonProgress}%` }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge color="lavender">{cat?.label || 'Lesson'}</Badge>
          <span className={`text-xs font-display font-semibold px-2 py-0.5 rounded-full ${
            lesson.difficulty === 'Easy' ? 'bg-mint-100 text-mint-500' :
            lesson.difficulty === 'Medium' ? 'bg-lemon-100 text-lemon-500' :
            'bg-blush-100 text-blush-500'
          }`}>{lesson.difficulty}</span>
        </div>
        <h3 className="font-display font-bold text-base sm:text-lg text-lavender-500 leading-tight line-clamp-1 group-hover:text-lavender-400 transition-colors">{lesson.title}</h3>
        <p className="text-xs sm:text-sm text-lavender-400 mt-1.5 flex-1 leading-relaxed line-clamp-2">{lesson.description}</p>

        {/* Objectives preview */}
        <div className="mt-3 space-y-1">
          {lesson.objectives.slice(0, 2).map((obj, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-lavender-400">
              <motion.div
                className={`w-1.5 h-1.5 rounded-full ${status === 'completed' ? 'bg-mint-400' : 'bg-lavender-300'} shrink-0`}
                animate={status === 'in-progress' ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              />
              <span className="line-clamp-1">{obj}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-lavender-50 gap-2">
          <div className="flex items-center gap-3 text-xs text-lavender-300 font-semibold min-w-0">
            <span className="flex items-center gap-1 shrink-0">
              <Star size={12} className="text-lemon-400" fill="currentColor" /> {lesson.xpReward} XP
            </span>
            <span className="shrink-0">·</span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock size={12} /> {lesson.estTime}
            </span>
          </div>
          {status !== 'locked' && (
            <motion.div
              className="flex items-center gap-1 text-lavender-500 font-display font-semibold text-xs sm:text-sm shrink-0"
              whileHover={{ x: 4 }}
            >
              {status === 'completed' ? 'Review' : status === 'in-progress' ? 'Continue' : 'Start'}
              <ArrowRight size={14} />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
