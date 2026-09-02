import { supabase } from './supabase';
import { getAllLessons } from '@/data/lessons';

// ─── Types ───

export type Profile = {
  id: string;
  name: string;
  avatar: string;
  age: number;
  age_group: string;
  level: number;
  xp: number;
  stars: number;
  coins: number;
  day_streak: number;
  last_played_date: string | null;
  created_at: string;
  updated_at: string;
};

export type GameProgress = {
  id: string;
  game_id: string;
  stars_earned: number;
  best_score: number | null;
  times_played: number;
  completed: boolean;
  last_played_at: string | null;
};

export type GameStat = {
  id: string;
  game_id: string;
  total_plays: number;
  total_stars: number;
  rating_sum: number;
  rating_count: number;
  updated_at?: string;
};

export type Achievement = {
  id: string;
  achievement_key: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  progress: number;
  total: number;
  unlocked_at: string | null;
  updated_at?: string;
};

export type Badge = {
  id: string;
  badge_key: string;
  label: string;
  icon: string;
  color: string;
  earned_at: string;
};

export type DailyChallenge = {
  id: string;
  challenge_key: string;
  title: string;
  reward: number;
  icon: string;
  color: string;
  completed: boolean;
  updated_at?: string;
};

export type Favorite = {
  id: string;
  game_id: string;
  created_at: string;
};

export type Settings = {
  id: string;
  sound: boolean;
  music: boolean;
  large_text: boolean;
  high_contrast: boolean;
  notifications: boolean;
  dark_mode: boolean;
  language: string;
  theme: string;
  screen_time_limit: number;
  safe_mode: boolean;
  pin: string | null;
};

export type ActivityLog = {
  id: string;
  game_id: string;
  game_title: string;
  game_icon: string;
  detail: string;
  created_at: string;
};

export type Testimonial = {
  id: string;
  name: string;
  text: string;
  avatar: string;
  rating: number;
  created_at?: string;
};

export type LessonProgress = {
  id: string;
  lesson_id: string;
  status: 'not-started' | 'in-progress' | 'completed';
  score: number;
  xp_earned: number;
  steps_completed: number;
  total_steps: number;
  started_at: string | null;
  completed_at: string | null;
  last_step_index: number;
};

export type DailyGoal = {
  id: string;
  goal_date: string;
  target_lessons: number;
  lessons_completed: number;
  target_xp: number;
  xp_earned: number;
  completed: boolean;
  updated_at?: string;
};

export type SkillProgress = {
  id: string;
  skill_key: string;
  lessons_completed: number;
  total_lessons: number;
  mastery_level: number;
  updated_at?: string;
};

export type ShopPurchase = {
  id: string;
  item_key: string;
  item_type: string;
  purchased_at: string;
};

export type SavedDrawing = {
  id: string;
  title: string;
  template_id: string;
  image_data: string;
  created_at: string;
  updated_at: string;
};

export type ShopItem = {
  key: string;
  type: 'avatar' | 'theme' | 'sticker';
  name: string;
  emoji: string;
  price: number;
  color: string;
  description: string;
  value: string;
};

export const SHOP_ITEMS: ShopItem[] = [
  { key: 'avatar-fox', type: 'avatar', name: 'Fox', emoji: '🦊', price: 0, color: 'from-peach-200 to-blush-200', description: 'Your starter friend', value: '🦊' },
  { key: 'avatar-owl', type: 'avatar', name: 'Owl', emoji: '🦉', price: 50, color: 'from-lavender-200 to-sky-200', description: 'Wise and watchful', value: '🦉' },
  { key: 'avatar-panda', type: 'avatar', name: 'Panda', emoji: '🐼', price: 80, color: 'from-sky-200 to-mint-200', description: 'Cuddly and calm', value: '🐼' },
  { key: 'avatar-lion', type: 'avatar', name: 'Lion', emoji: '🦁', price: 120, color: 'from-lemon-200 to-peach-200', description: 'Brave and bold', value: '🦁' },
  { key: 'avatar-unicorn', type: 'avatar', name: 'Unicorn', emoji: '🦄', price: 200, color: 'from-blush-200 to-lavender-200', description: 'Magical and rare', value: '🦄' },
  { key: 'avatar-dragon', type: 'avatar', name: 'Dragon', emoji: '🐉', price: 350, color: 'from-mint-200 to-lemon-200', description: 'Legendary guardian', value: '🐉' },
  { key: 'avatar-astronaut', type: 'avatar', name: 'Astronaut', emoji: '🧑\u200d🚀', price: 300, color: 'from-sky-200 to-lavender-200', description: 'Space explorer', value: '🧑\u200d🚀' },
  { key: 'avatar-wizard', type: 'avatar', name: 'Wizard', emoji: '🧙', price: 280, color: 'from-lavender-200 to-blush-200', description: 'Master of spells', value: '🧙' },
  { key: 'theme-sky', type: 'theme', name: 'Sky Default', emoji: '☁️', price: 0, color: 'from-sky-200 to-lavender-200', description: 'The classic look', value: 'sky' },
  { key: 'theme-sunset', type: 'theme', name: 'Sunset', emoji: '🌅', price: 100, color: 'from-peach-200 to-blush-200', description: 'Warm evening glow', value: 'sunset' },
  { key: 'theme-forest', type: 'theme', name: 'Forest', emoji: '🌲', price: 100, color: 'from-mint-200 to-lemon-200', description: 'Fresh and green', value: 'forest' },
  { key: 'theme-galaxy', type: 'theme', name: 'Galaxy', emoji: '🌌', price: 250, color: 'from-lavender-200 to-sky-300', description: 'Deep space vibes', value: 'galaxy' },
  { key: 'theme-candy', type: 'theme', name: 'Candy', emoji: '🍭', price: 180, color: 'from-blush-200 to-peach-200', description: 'Sweet and playful', value: 'candy' },
  { key: 'sticker-stars', type: 'sticker', name: 'Star Pack', emoji: '⭐', price: 30, color: 'from-lemon-200 to-peach-200', description: 'Shiny star stickers', value: '⭐✨🌟' },
  { key: 'sticker-animals', type: 'sticker', name: 'Animal Pack', emoji: '🐾', price: 40, color: 'from-mint-200 to-sky-200', description: 'Cute animal friends', value: '🐶🐱🐰🦁' },
  { key: 'sticker-food', type: 'sticker', name: 'Food Pack', emoji: '🍕', price: 35, color: 'from-peach-200 to-blush-200', description: 'Yummy treats', value: '🍕🍔🍩🍓' },
  { key: 'sticker-space', type: 'sticker', name: 'Space Pack', emoji: '🚀', price: 50, color: 'from-lavender-200 to-sky-300', description: 'Cosmic adventures', value: '🚀🌟🪐👽' },
  { key: 'sticker-weather', type: 'sticker', name: 'Weather Pack', emoji: '🌈', price: 45, color: 'from-sky-200 to-mint-200', description: 'Sun, rain, and rainbows', value: '☀️🌧️🌈⚡' },
];

// ─── Helpers ───

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

const ALL_LESSON_META: Record<string, { title: string; emoji: string; skills: string[]; categoryId: string }> = (() => {
  const meta: Record<string, { title: string; emoji: string; skills: string[]; categoryId: string }> = {};
  for (const l of getAllLessons()) {
    meta[l.id] = { title: l.title, emoji: l.emoji, skills: l.skills, categoryId: l.categoryId };
  }
  return meta;
})();

// ─── PROFILE ───
export async function getProfile(): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(updates: Partial<Profile>): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ─── GAME PROGRESS ───
export async function getGameProgress(gameId: string): Promise<GameProgress | null> {
  const { data, error } = await supabase
    .from('game_progress')
    .select('*')
    .eq('game_id', gameId)
    .maybeSingle();
  if (error) throw error;
  return data as GameProgress | null;
}

export async function getAllGameProgress(): Promise<GameProgress[]> {
  const { data, error } = await supabase
    .from('game_progress')
    .select('*');
  if (error) throw error;
  return (data ?? []) as GameProgress[];
}

export async function recordGamePlay(gameId: string, stars: number, score: number | null): Promise<void> {
  const today = todayStr();

  const existing = await getGameProgress(gameId);
  if (existing) {
    const { error } = await supabase
      .from('game_progress')
      .update({
        stars_earned: Math.max(existing.stars_earned, stars),
        best_score: score !== null ? Math.max(existing.best_score ?? 0, score) : existing.best_score,
        completed: existing.completed || stars > 0,
        times_played: existing.times_played + 1,
        last_played_at: today,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('game_progress')
      .insert({
        game_id: gameId,
        stars_earned: stars,
        best_score: score,
        times_played: 1,
        completed: stars > 0,
        last_played_at: today,
      });
    if (error) throw error;
  }

  const { data: stat } = await supabase
    .from('game_stats')
    .select('*')
    .eq('game_id', gameId)
    .maybeSingle();

  if (stat) {
    const { error } = await supabase
      .from('game_stats')
      .update({
        total_plays: stat.total_plays + 1,
        total_stars: stat.total_stars + stars,
        updated_at: new Date().toISOString(),
      })
      .eq('id', stat.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('game_stats')
      .insert({
        game_id: gameId,
        total_plays: 1,
        total_stars: stars,
        rating_sum: 0,
        rating_count: 0,
      });
    if (error) throw error;
  }

  const profile = await getProfile();
  if (profile) {
    const xpGain = stars * 50;
    const coinGain = stars * 10;
    let newStreak = profile.day_streak;
    if (profile.last_played_date !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      newStreak = profile.last_played_date === yesterday ? profile.day_streak + 1 : 1;
    }
    const newXp = profile.xp + xpGain;
    const newLevel = Math.floor(newXp / 300) + 1;
    const { error } = await supabase
      .from('profiles')
      .update({
        xp: newXp,
        level: newLevel,
        stars: profile.stars + stars,
        coins: profile.coins + coinGain,
        day_streak: newStreak,
        last_played_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);
    if (error) throw error;
  }

  await updateAchievements(gameId);
}

async function updateAchievements(gameId: string): Promise<void> {
  const profile = await getProfile();
  if (!profile) return;

  const [{ data: progress }, { data: logs }, { data: drawings }] = await Promise.all([
    supabase.from('game_progress').select('game_id, times_played, best_score'),
    supabase.from('activity_log').select('game_id, created_at, detail'),
    supabase.from('saved_drawings').select('id'),
  ]);

  const gameRows = progress ?? [];
  const activityRows = logs ?? [];
  const gamesPlayed = gameRows.length;
  const memoryPlays = gameRows.find((row) => row.game_id === 'memory-match')?.times_played ?? 0;
  const quizCorrect = activityRows
    .filter((row) => row.game_id === 'brain-quiz')
    .reduce((sum, row) => {
      const match = row.detail.match(/(?:got|correct)\s+(\d+)/i);
      return sum + (match ? Number(match[1]) : 0);
    }, 0);
  const artistProgress = drawings?.length ?? 0;
  const isEarlyBird = new Date().getHours() < 8;
  const totalStars = profile.stars;
  const streak = profile.day_streak;

  const updates = [
    { key: 'first-steps', progress: Math.min(gamesPlayed, 1), unlocked: gamesPlayed >= 1 },
    { key: 'streak-7', progress: Math.min(streak, 7), unlocked: streak >= 7 },
    { key: 'star-collector', progress: Math.min(totalStars, 50), unlocked: totalStars >= 50 },
    { key: 'memory-master', progress: Math.min(memoryPlays, 10), unlocked: memoryPlays >= 10 },
    { key: 'quiz-champion', progress: Math.min(quizCorrect, 100), unlocked: quizCorrect >= 100 },
    { key: 'artist', progress: Math.min(artistProgress, 5), unlocked: artistProgress >= 5 },
    { key: 'explorer', progress: Math.min(gamesPlayed, 15), unlocked: gamesPlayed >= 15 },
    { key: 'early-bird', progress: isEarlyBird ? 1 : 0, unlocked: isEarlyBird },
  ];

  for (const u of updates) {
    const { data: ach } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('achievement_key', u.key)
      .maybeSingle();

    if (!ach) continue;

    const updateData: Record<string, unknown> = {
      progress: u.progress,
      total: ach.total || 1,
      updated_at: new Date().toISOString(),
    };
    if (u.unlocked && !ach.unlocked) {
      updateData.unlocked = true;
      updateData.unlocked_at = new Date().toISOString();
    }
    const { error } = await supabase.from('user_achievements').update(updateData).eq('id', ach.id);
    if (error) console.error(`[achievements] failed to update ${u.key}:`, error);
  }
}

// ─── GAME STATS ───
export async function getGameStats(gameId: string): Promise<GameStat | null> {
  const { data, error } = await supabase
    .from('game_stats')
    .select('*')
    .eq('game_id', gameId)
    .maybeSingle();
  if (error) throw error;
  return data as GameStat | null;
}

export async function getAllGameStats(): Promise<GameStat[]> {
  const { data, error } = await supabase
    .from('game_stats')
    .select('*');
  if (error) throw error;
  return (data ?? []) as GameStat[];
}

export async function rateGame(gameId: string, rating: number): Promise<void> {
  const { data: stat } = await supabase
    .from('game_stats')
    .select('*')
    .eq('game_id', gameId)
    .maybeSingle();

  if (stat) {
    const { error } = await supabase
      .from('game_stats')
      .update({
        rating_sum: stat.rating_sum + rating,
        rating_count: stat.rating_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', stat.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('game_stats')
      .insert({
        game_id: gameId,
        total_plays: 0,
        total_stars: 0,
        rating_sum: rating,
        rating_count: 1,
      });
    if (error) throw error;
  }
}

// ─── ACHIEVEMENTS ───
export async function getAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*');
  if (error) throw error;
  return (data ?? []) as Achievement[];
}

// ─── BADGES ───
export async function getBadges(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*')
    .order('earned_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Badge[];
}

export async function addBadge(badgeKey: string, label: string, icon: string, color: string): Promise<void> {
  const { error } = await supabase
    .from('user_badges')
    .insert({ badge_key: badgeKey, label, icon, color });
  if (error) throw error;
}

// ─── DAILY CHALLENGES ───
export async function getDailyChallenges(): Promise<DailyChallenge[]> {
  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*');
  if (error) throw error;
  return (data ?? []) as DailyChallenge[];
}

export async function completeDailyChallenge(challengeKey: string): Promise<void> {
  const { data: ch } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('challenge_key', challengeKey)
    .maybeSingle();
  if (!ch || ch.completed) return;

  const { error } = await supabase
    .from('daily_challenges')
    .update({ completed: true, updated_at: new Date().toISOString() })
    .eq('id', ch.id);
  if (error) throw error;

  const profile = await getProfile();
  if (profile) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ coins: profile.coins + ch.reward, updated_at: new Date().toISOString() })
      .eq('id', profile.id);
    if (profileError) throw profileError;
  }
}

// ─── FAVORITES ───
export async function getFavorites(): Promise<Favorite[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Favorite[];
}

export async function toggleFavorite(gameId: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('game_id', gameId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('favorites').delete().eq('id', existing.id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase.from('favorites').insert({ game_id: gameId });
  if (error) throw error;
  return true;
}

// ─── SETTINGS ───
export async function getSettings(): Promise<Settings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data as Settings | null;
}

export async function updateSettings(updates: Partial<Settings>): Promise<void> {
  const { data: existing } = await supabase.from('settings').select('id').maybeSingle();
  if (!existing) {
    const { error } = await supabase.from('settings').insert(updates);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw error;
  }
}

// ─── ACTIVITY LOG ───
export async function getActivityLog(limit: number = 10): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ActivityLog[];
}

export async function addActivityLog(gameId: string, gameTitle: string, gameIcon: string, detail: string): Promise<void> {
  const { error } = await supabase
    .from('activity_log')
    .insert({ game_id: gameId, game_title: gameTitle, game_icon: gameIcon, detail });
  if (error) throw error;

  const { data: allLogs } = await supabase
    .from('activity_log')
    .select('id')
    .order('created_at', { ascending: false });
  if (allLogs && allLogs.length > 100) {
    const toDelete = allLogs.slice(100).map((l) => l.id);
    if (toDelete.length > 0) {
      await supabase.from('activity_log').delete().in('id', toDelete);
    }
  }
}

// ─── TESTIMONIALS ───
export async function getTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as Testimonial[];
}

export async function addTestimonial(name: string, text: string, avatar: string, rating: number): Promise<void> {
  const { error } = await supabase
    .from('testimonials')
    .insert({ name, text, avatar, rating });
  if (error) throw error;
}

// ─── Lesson Progress ───
export async function getAllLessonProgress(): Promise<LessonProgress[]> {
  const { data, error } = await supabase.from('lesson_progress').select('*');
  if (error) throw error;
  return (data ?? []) as LessonProgress[];
}

export async function getLessonProgressById(lessonId: string): Promise<LessonProgress | null> {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('lesson_id', lessonId)
    .maybeSingle();
  if (error) throw error;
  return data as LessonProgress | null;
}

export async function startLesson(lessonId: string, totalSteps: number): Promise<void> {
  const existing = await getLessonProgressById(lessonId);
  const now = new Date().toISOString();
  if (existing && existing.status !== 'not-started') return;

  if (existing) {
    const { error } = await supabase.from('lesson_progress').update({
      status: 'in-progress', started_at: now, total_steps: totalSteps, updated_at: now,
    }).eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('lesson_progress').insert({
      lesson_id: lessonId, status: 'in-progress', score: 0, xp_earned: 0,
      steps_completed: 0, total_steps: totalSteps, started_at: now, last_step_index: 0,
    });
    if (error) throw error;
  }
}

export async function updateLessonStep(lessonId: string, stepIndex: number, stepsCompleted: number): Promise<void> {
  const { error } = await supabase.from('lesson_progress').update({
    last_step_index: stepIndex, steps_completed: stepsCompleted, updated_at: new Date().toISOString(),
  }).eq('lesson_id', lessonId);
  if (error) throw error;
}

export async function completeLesson(lessonId: string, score: number, xpEarned: number, totalSteps: number): Promise<void> {
  const now = new Date().toISOString();
  const existing = await getLessonProgressById(lessonId);

  if (existing) {
    const { error } = await supabase.from('lesson_progress').update({
      status: 'completed',
      score: Math.max(existing.score, score),
      xp_earned: Math.max(existing.xp_earned, xpEarned),
      steps_completed: totalSteps,
      total_steps: totalSteps,
      completed_at: now,
      updated_at: now,
    }).eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('lesson_progress').insert({
      lesson_id: lessonId, status: 'completed', score, xp_earned: xpEarned,
      steps_completed: totalSteps, total_steps: totalSteps,
      started_at: now, completed_at: now, last_step_index: 0,
    });
    if (error) throw error;
  }

  const coinReward = Math.round(xpEarned / 5);
  const meta = ALL_LESSON_META[lessonId];
  await addActivityLog(lessonId, meta?.title || 'Lesson', meta?.emoji || '📚', `Completed lesson — ${xpEarned} XP & ${coinReward} coins earned`);
  await updateSkillProgress(lessonId);
  await updateDailyGoalOnLessonComplete(xpEarned);
  await updateProfileXp(xpEarned);
  await addProfileCoins(coinReward);
}

async function updateSkillProgress(lessonId: string): Promise<void> {
  const categoryId = ALL_LESSON_META[lessonId]?.categoryId;
  if (!categoryId) return;

  const allLessons = getAllLessons();
  const categoryLessons = allLessons.filter((l) => l.categoryId === categoryId);
  const totalLessons = categoryLessons.length;
  const { data: completed } = await supabase.from('lesson_progress').select('lesson_id').eq('status', 'completed');
  const completedIds = new Set((completed ?? []).map((l) => l.lesson_id));
  const completedCount = categoryLessons.filter((l) => completedIds.has(l.id)).length;
  const mastery = completedCount >= totalLessons ? 3 : completedCount >= Math.ceil(totalLessons * 0.66) ? 2 : completedCount >= Math.ceil(totalLessons * 0.33) ? 1 : 0;

  const skillKey = `category:${categoryId}`;
  const { data: existing } = await supabase.from('skill_progress').select('*').eq('skill_key', skillKey).maybeSingle();
  const now = new Date().toISOString();
  if (existing) {
    await supabase.from('skill_progress').update({ lessons_completed: completedCount, total_lessons: totalLessons, mastery_level: mastery, updated_at: now }).eq('id', existing.id);
  } else {
    await supabase.from('skill_progress').insert({ skill_key: skillKey, lessons_completed: completedCount, total_lessons: totalLessons, mastery_level: mastery });
  }
}

async function updateProfileXp(xpEarned: number): Promise<void> {
  const profile = await getProfile();
  if (!profile) return;
  const newXp = profile.xp + xpEarned;
  const newLevel = Math.floor(newXp / 300) + 1;
  const { error } = await supabase.from('profiles').update({ xp: newXp, level: newLevel, updated_at: new Date().toISOString() }).eq('id', profile.id);
  if (error) throw error;
}

async function addProfileCoins(amount: number): Promise<void> {
  const profile = await getProfile();
  if (!profile) return;
  const { error } = await supabase.from('profiles').update({ coins: profile.coins + amount, updated_at: new Date().toISOString() }).eq('id', profile.id);
  if (error) throw error;
}

// ─── Daily Goals ───
export async function getTodayDailyGoal(): Promise<DailyGoal | null> {
  const today = todayStr();
  const { data, error } = await supabase.from('daily_goals').select('*').eq('goal_date', today).maybeSingle();
  if (error) throw error;
  if (data) return data as DailyGoal;

  const { data: newGoal, error: insertError } = await supabase.from('daily_goals').insert({
    goal_date: today, target_lessons: 3, lessons_completed: 0, target_xp: 150, xp_earned: 0, completed: false,
  }).select().maybeSingle();
  if (insertError) throw insertError;
  return newGoal as DailyGoal | null;
}

async function updateDailyGoalOnLessonComplete(xpEarned: number): Promise<void> {
  const today = todayStr();
  const { data: goal } = await supabase.from('daily_goals').select('*').eq('goal_date', today).maybeSingle();
  if (!goal) return;

  const newLessonsCompleted = goal.lessons_completed + 1;
  const newXpEarned = goal.xp_earned + xpEarned;
  const wasComplete = goal.completed;
  const isComplete = newLessonsCompleted >= goal.target_lessons && newXpEarned >= goal.target_xp;
  const updateData: Record<string, unknown> = {
    lessons_completed: newLessonsCompleted, xp_earned: newXpEarned, completed: isComplete, updated_at: new Date().toISOString(),
  };

  if (!wasComplete && isComplete) {
    const profile = await getProfile();
    if (profile) {
      await supabase.from('profiles').update({ coins: profile.coins + 50, updated_at: new Date().toISOString() }).eq('id', profile.id);
    }
  }
  await supabase.from('daily_goals').update(updateData).eq('id', goal.id);
}

export async function getRecentDailyGoals(limit: number = 7): Promise<DailyGoal[]> {
  const { data, error } = await supabase.from('daily_goals').select('*').order('goal_date', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as DailyGoal[];
}

// ─── Skill Progress ───
export async function getAllSkillProgress(): Promise<SkillProgress[]> {
  const { data, error } = await supabase.from('skill_progress').select('*');
  if (error) throw error;
  return (data ?? []) as SkillProgress[];
}

export async function getSkillProgressByKey(key: string): Promise<SkillProgress | null> {
  const { data, error } = await supabase.from('skill_progress').select('*').eq('skill_key', key).maybeSingle();
  if (error) throw error;
  return data as SkillProgress | null;
}

// ─── SHOP ───
export async function getShopPurchases(): Promise<ShopPurchase[]> {
  const { data, error } = await supabase.from('shop_purchases').select('*').order('purchased_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ShopPurchase[];
}

export async function purchaseShopItem(itemKey: string): Promise<{ success: boolean; error?: string }> {
  const item = SHOP_ITEMS.find((i) => i.key === itemKey);
  if (!item) return { success: false, error: 'Item not found' };

  const { data: existing } = await supabase.from('shop_purchases').select('id').eq('item_key', itemKey).maybeSingle();
  if (existing) return { success: false, error: 'Already owned' };

  const profile = await getProfile();
  if (!profile) return { success: false, error: 'No profile' };
  if (profile.coins < item.price) return { success: false, error: 'Not enough coins' };

  const { error: purchaseError } = await supabase.from('shop_purchases').insert({ item_key: itemKey, item_type: item.type });
  if (purchaseError) throw purchaseError;

  const { error: profileError } = await supabase.from('profiles').update({
    coins: profile.coins - item.price,
    updated_at: new Date().toISOString(),
  }).eq('id', profile.id);
  if (profileError) {
    await supabase.from('shop_purchases').delete().eq('item_key', itemKey);
    throw profileError;
  }

  return { success: true };
}

export async function equipAvatar(itemKey: string): Promise<void> {
  const item = SHOP_ITEMS.find((i) => i.key === itemKey && i.type === 'avatar');
  if (!item) throw new Error('Avatar not found');

  if (item.price > 0) {
    const { data: owned } = await supabase.from('shop_purchases').select('id').eq('item_key', itemKey).maybeSingle();
    if (!owned) throw new Error('Avatar is locked. Purchase it first.');
  }

  await updateProfile({ avatar: item.value });
}

export async function equipTheme(itemKey: string): Promise<void> {
  const item = SHOP_ITEMS.find((i) => i.key === itemKey && i.type === 'theme');
  if (!item) throw new Error('Theme not found');

  if (item.price > 0) {
    const { data: owned } = await supabase.from('shop_purchases').select('id').eq('item_key', itemKey).maybeSingle();
    if (!owned) throw new Error('Theme is locked. Purchase it first.');
  }

  await updateSettings({ theme: item.value });
}

// ─── SAVED DRAWINGS ───
export async function getSavedDrawings(): Promise<SavedDrawing[]> {
  const { data, error } = await supabase.from('saved_drawings').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SavedDrawing[];
}

export async function saveDrawing(title: string, templateId: string, imageData: string): Promise<SavedDrawing | null> {
  const { data, error } = await supabase.from('saved_drawings').insert({ title, template_id: templateId, image_data: imageData }).select().maybeSingle();
  if (error) throw error;
  return data as SavedDrawing | null;
}

export async function deleteDrawing(id: string): Promise<void> {
  const { error } = await supabase.from('saved_drawings').delete().eq('id', id);
  if (error) throw error;
}
