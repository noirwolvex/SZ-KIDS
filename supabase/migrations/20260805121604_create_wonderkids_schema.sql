/*
# WonderKids — Complete Database Schema with Auth & RLS

## Overview
Creates 15 owner-scoped tables for the WonderKids learning app, with Supabase Authentication,
Row Level Security, and auto-provisioning triggers for new users.

## New Tables
1. profiles — User display profile (name, avatar, age, level, xp, stars, coins, streak)
2. game_progress — Per-game progress (stars, best score, times played, completion)
3. game_stats — Aggregate per-game statistics (shared read, owner write)
4. user_achievements — Achievement definitions + per-user unlock progress
5. user_badges — Earned badges per user
6. daily_challenges — Daily challenge completions per user
7. favorites — Favorited games per user
8. settings — User settings (sound, music, theme, accessibility, parental controls)
9. activity_log — Recent activity history per user
10. testimonials — Community testimonials (shared read, owner write)
11. lesson_progress — Per-lesson progress (status, score, step tracking)
12. daily_goals — Daily learning goals per user
13. skill_progress — Per-skill-category mastery tracking
14. shop_purchases — Purchased shop items per user
15. saved_drawings — Saved coloring canvas drawings per user

## Security
- RLS enabled on ALL tables
- Owner-scoped CRUD on user tables (4 policies each: SELECT/INSERT/UPDATE/DELETE)
- game_stats and testimonials: shared read, owner write
- All policies use auth.uid() for ownership checks
- user_id columns default to auth.uid() so inserts work without client passing user_id

## Triggers
- on_auth_user_created: auto-creates profile, settings, and starter achievements on signup
- update_updated_at: auto-updates updated_at timestamps on all owner-scoped tables
*/

-- ═══════════════════════════════════════════
-- 1. PROFILES
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name text NOT NULL DEFAULT 'Young Learner',
  avatar text NOT NULL DEFAULT '🦊',
  age int NOT NULL DEFAULT 5,
  age_group text NOT NULL DEFAULT '3-6',
  level int NOT NULL DEFAULT 1,
  xp int NOT NULL DEFAULT 0,
  stars int NOT NULL DEFAULT 0,
  coins int NOT NULL DEFAULT 0,
  day_streak int NOT NULL DEFAULT 0,
  last_played_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 2. GAME_PROGRESS
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS game_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id text NOT NULL,
  stars_earned int NOT NULL DEFAULT 0,
  best_score int,
  times_played int NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  last_played_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_id)
);
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_game_progress_user_id ON game_progress(user_id);
DROP POLICY IF EXISTS "select_own_game_progress" ON game_progress;
CREATE POLICY "select_own_game_progress" ON game_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_game_progress" ON game_progress;
CREATE POLICY "insert_own_game_progress" ON game_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_game_progress" ON game_progress;
CREATE POLICY "update_own_game_progress" ON game_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_game_progress" ON game_progress;
CREATE POLICY "delete_own_game_progress" ON game_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 3. GAME_STATS (shared read, owner write)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS game_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id text NOT NULL,
  total_plays int NOT NULL DEFAULT 0,
  total_stars int NOT NULL DEFAULT 0,
  rating_sum int NOT NULL DEFAULT 0,
  rating_count int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_id)
);
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_game_stats_user_id ON game_stats(user_id);
DROP POLICY IF EXISTS "select_all_game_stats" ON game_stats;
CREATE POLICY "select_all_game_stats" ON game_stats FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_game_stats" ON game_stats;
CREATE POLICY "insert_own_game_stats" ON game_stats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_game_stats" ON game_stats;
CREATE POLICY "update_own_game_stats" ON game_stats FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_game_stats" ON game_stats;
CREATE POLICY "delete_own_game_stats" ON game_stats FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 4. USER_ACHIEVEMENTS
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  unlocked boolean NOT NULL DEFAULT false,
  progress int NOT NULL DEFAULT 0,
  total int NOT NULL DEFAULT 1,
  unlocked_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_key)
);
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
DROP POLICY IF EXISTS "select_own_achievements" ON user_achievements;
CREATE POLICY "select_own_achievements" ON user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_achievements" ON user_achievements;
CREATE POLICY "insert_own_achievements" ON user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_achievements" ON user_achievements;
CREATE POLICY "update_own_achievements" ON user_achievements FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_achievements" ON user_achievements;
CREATE POLICY "delete_own_achievements" ON user_achievements FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 5. USER_BADGES
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_key text NOT NULL,
  label text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_key)
);
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
DROP POLICY IF EXISTS "select_own_badges" ON user_badges;
CREATE POLICY "select_own_badges" ON user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_badges" ON user_badges;
CREATE POLICY "insert_own_badges" ON user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_badges" ON user_badges;
CREATE POLICY "update_own_badges" ON user_badges FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_badges" ON user_badges;
CREATE POLICY "delete_own_badges" ON user_badges FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 6. DAILY_CHALLENGES
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_key text NOT NULL,
  title text NOT NULL,
  reward int NOT NULL DEFAULT 0,
  icon text NOT NULL,
  color text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_key)
);
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_daily_challenges_user_id ON daily_challenges(user_id);
DROP POLICY IF EXISTS "select_own_daily_challenges" ON daily_challenges;
CREATE POLICY "select_own_daily_challenges" ON daily_challenges FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_daily_challenges" ON daily_challenges;
CREATE POLICY "insert_own_daily_challenges" ON daily_challenges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_daily_challenges" ON daily_challenges;
CREATE POLICY "update_own_daily_challenges" ON daily_challenges FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_daily_challenges" ON daily_challenges;
CREATE POLICY "delete_own_daily_challenges" ON daily_challenges FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 7. FAVORITES
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_id)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_favorites" ON favorites;
CREATE POLICY "update_own_favorites" ON favorites FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 8. SETTINGS
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  sound boolean NOT NULL DEFAULT true,
  music boolean NOT NULL DEFAULT true,
  large_text boolean NOT NULL DEFAULT false,
  high_contrast boolean NOT NULL DEFAULT false,
  notifications boolean NOT NULL DEFAULT true,
  dark_mode boolean NOT NULL DEFAULT false,
  language text NOT NULL DEFAULT 'English',
  theme text NOT NULL DEFAULT 'sky',
  screen_time_limit int NOT NULL DEFAULT 60,
  safe_mode boolean NOT NULL DEFAULT true,
  pin text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);
DROP POLICY IF EXISTS "select_own_settings" ON settings;
CREATE POLICY "select_own_settings" ON settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_settings" ON settings;
CREATE POLICY "insert_own_settings" ON settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_settings" ON settings;
CREATE POLICY "update_own_settings" ON settings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_settings" ON settings;
CREATE POLICY "delete_own_settings" ON settings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 9. ACTIVITY_LOG
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id text NOT NULL,
  game_title text NOT NULL,
  game_icon text NOT NULL,
  detail text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_created ON activity_log(user_id, created_at DESC);
DROP POLICY IF EXISTS "select_own_activity_log" ON activity_log;
CREATE POLICY "select_own_activity_log" ON activity_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_activity_log" ON activity_log;
CREATE POLICY "insert_own_activity_log" ON activity_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_activity_log" ON activity_log;
CREATE POLICY "update_own_activity_log" ON activity_log FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_activity_log" ON activity_log;
CREATE POLICY "delete_own_activity_log" ON activity_log FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 10. TESTIMONIALS (shared read, owner write)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  text text NOT NULL,
  avatar text NOT NULL DEFAULT '🦊',
  rating int NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_testimonials_created ON testimonials(created_at DESC);
DROP POLICY IF EXISTS "select_all_testimonials" ON testimonials;
CREATE POLICY "select_all_testimonials" ON testimonials FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_testimonials" ON testimonials;
CREATE POLICY "insert_own_testimonials" ON testimonials FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_testimonials" ON testimonials;
CREATE POLICY "update_own_testimonials" ON testimonials FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_testimonials" ON testimonials;
CREATE POLICY "delete_own_testimonials" ON testimonials FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 11. LESSON_PROGRESS
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,
  status text NOT NULL DEFAULT 'not-started',
  score int NOT NULL DEFAULT 0,
  xp_earned int NOT NULL DEFAULT 0,
  steps_completed int NOT NULL DEFAULT 0,
  total_steps int NOT NULL DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  last_step_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
DROP POLICY IF EXISTS "select_own_lesson_progress" ON lesson_progress;
CREATE POLICY "select_own_lesson_progress" ON lesson_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_lesson_progress" ON lesson_progress;
CREATE POLICY "insert_own_lesson_progress" ON lesson_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_lesson_progress" ON lesson_progress;
CREATE POLICY "update_own_lesson_progress" ON lesson_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_lesson_progress" ON lesson_progress;
CREATE POLICY "delete_own_lesson_progress" ON lesson_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 12. DAILY_GOALS
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS daily_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_date date NOT NULL,
  target_lessons int NOT NULL DEFAULT 3,
  lessons_completed int NOT NULL DEFAULT 0,
  target_xp int NOT NULL DEFAULT 150,
  xp_earned int NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, goal_date)
);
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_id ON daily_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_date ON daily_goals(user_id, goal_date DESC);
DROP POLICY IF EXISTS "select_own_daily_goals" ON daily_goals;
CREATE POLICY "select_own_daily_goals" ON daily_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_daily_goals" ON daily_goals;
CREATE POLICY "insert_own_daily_goals" ON daily_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_daily_goals" ON daily_goals;
CREATE POLICY "update_own_daily_goals" ON daily_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_daily_goals" ON daily_goals;
CREATE POLICY "delete_own_daily_goals" ON daily_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 13. SKILL_PROGRESS
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS skill_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_key text NOT NULL,
  lessons_completed int NOT NULL DEFAULT 0,
  total_lessons int NOT NULL DEFAULT 0,
  mastery_level int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_key)
);
ALTER TABLE skill_progress ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_skill_progress_user_id ON skill_progress(user_id);
DROP POLICY IF EXISTS "select_own_skill_progress" ON skill_progress;
CREATE POLICY "select_own_skill_progress" ON skill_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_skill_progress" ON skill_progress;
CREATE POLICY "insert_own_skill_progress" ON skill_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_skill_progress" ON skill_progress;
CREATE POLICY "update_own_skill_progress" ON skill_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_skill_progress" ON skill_progress;
CREATE POLICY "delete_own_skill_progress" ON skill_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 14. SHOP_PURCHASES
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS shop_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  item_key text NOT NULL,
  item_type text NOT NULL,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_key)
);
ALTER TABLE shop_purchases ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_shop_purchases_user_id ON shop_purchases(user_id);
DROP POLICY IF EXISTS "select_own_shop_purchases" ON shop_purchases;
CREATE POLICY "select_own_shop_purchases" ON shop_purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_shop_purchases" ON shop_purchases;
CREATE POLICY "insert_own_shop_purchases" ON shop_purchases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_shop_purchases" ON shop_purchases;
CREATE POLICY "update_own_shop_purchases" ON shop_purchases FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_shop_purchases" ON shop_purchases;
CREATE POLICY "delete_own_shop_purchases" ON shop_purchases FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 15. SAVED_DRAWINGS
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS saved_drawings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'My Art',
  template_id text NOT NULL DEFAULT 'star',
  image_data text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE saved_drawings ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_saved_drawings_user_id ON saved_drawings(user_id);
DROP POLICY IF EXISTS "select_own_saved_drawings" ON saved_drawings;
CREATE POLICY "select_own_saved_drawings" ON saved_drawings FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_saved_drawings" ON saved_drawings;
CREATE POLICY "insert_own_saved_drawings" ON saved_drawings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_saved_drawings" ON saved_drawings;
CREATE POLICY "update_own_saved_drawings" ON saved_drawings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_saved_drawings" ON saved_drawings;
CREATE POLICY "delete_own_saved_drawings" ON saved_drawings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- TRIGGER: Auto-create profile + settings + achievements on signup
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name text;
BEGIN
  user_name := COALESCE(new.raw_user_meta_data->>'name', 'Young Learner');
  INSERT INTO profiles (user_id, name) VALUES (new.id, user_name) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO settings (user_id) VALUES (new.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO user_achievements (user_id, achievement_key, title, description, icon, color, total) VALUES
    (new.id, 'first-steps', 'First Steps', 'Play your first game', '🌱', 'from-mint-200 to-mint-300', 1),
    (new.id, 'streak-7', 'Week Warrior', '7-day learning streak', '🔥', 'from-lemon-200 to-peach-200', 7),
    (new.id, 'star-collector', 'Star Collector', 'Collect 50 stars', '⭐', 'from-lemon-200 to-lemon-300', 50),
    (new.id, 'memory-master', 'Memory Master', 'Win 10 memory games', '🧠', 'from-blush-200 to-blush-300', 10),
    (new.id, 'quiz-champion', 'Quiz Champion', 'Answer 100 questions', '🏆', 'from-sky-200 to-sky-300', 100),
    (new.id, 'artist', 'Little Artist', 'Complete 5 drawings', '🎨', 'from-peach-200 to-blush-200', 5),
    (new.id, 'explorer', 'Curious Explorer', 'Try 15 different games', '🧭', 'from-lavender-200 to-sky-200', 15),
    (new.id, 'early-bird', 'Early Bird', 'Learn before 8 AM', '🐦', 'from-sky-200 to-lemon-200', 1)
  ON CONFLICT (user_id, achievement_key) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
GRANT EXECUTE ON FUNCTION handle_new_user TO authenticated;

-- ═══════════════════════════════════════════
-- TRIGGER: Auto-update updated_at timestamps
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN new.updated_at = now(); RETURN new; END; $$;
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_game_progress_updated_at BEFORE UPDATE ON game_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_game_stats_updated_at BEFORE UPDATE ON game_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_user_achievements_updated_at BEFORE UPDATE ON user_achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_daily_challenges_updated_at BEFORE UPDATE ON daily_challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_daily_goals_updated_at BEFORE UPDATE ON daily_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_skill_progress_updated_at BEFORE UPDATE ON skill_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_saved_drawings_updated_at BEFORE UPDATE ON saved_drawings FOR EACH ROW EXECUTE FUNCTION update_updated_at();