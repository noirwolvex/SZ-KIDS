/*
# Move handle_new_user to non-exposed schema

The function handle_new_user() is only called by the auth trigger, never via REST RPC.
Moving it to a schema outside the API exposure (pg_catalog) prevents anon/authenticated
from calling it via /rest/v1/rpc/. The trigger still works because it references the function by qualified name.
*/

-- Drop and recreate in a private schema
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE SCHEMA IF NOT EXISTS auth_helpers;

CREATE OR REPLACE FUNCTION auth_helpers.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name text;
BEGIN
  user_name := COALESCE(new.raw_user_meta_data->>'name', 'Young Learner');
  INSERT INTO public.profiles (user_id, name) VALUES (new.id, user_name) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.settings (user_id) VALUES (new.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_achievements (user_id, achievement_key, title, description, icon, color, total) VALUES
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auth_helpers.handle_new_user();
