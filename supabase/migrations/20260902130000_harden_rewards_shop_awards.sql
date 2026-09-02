/*
# Harden Coins, Shop, Avatar and Awards

- Prevent direct profile-avatar changes unless the avatar is free or owned.
- Keep achievement progress synchronized from persisted game/activity/drawing data.
- Protect achievement updates with a SECURITY DEFINER function scoped to auth.uid().
*/

CREATE OR REPLACE FUNCTION public.guard_profile_avatar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  avatar_item_key text;
BEGIN
  IF NEW.avatar = '🦊' THEN
    RETURN NEW;
  END IF;

  avatar_item_key := CASE NEW.avatar
    WHEN '🦉' THEN 'avatar-owl'
    WHEN '🐼' THEN 'avatar-panda'
    WHEN '🦁' THEN 'avatar-lion'
    WHEN '🦄' THEN 'avatar-unicorn'
    WHEN '🐉' THEN 'avatar-dragon'
    WHEN '🧑‍🚀' THEN 'avatar-astronaut'
    WHEN '🧙' THEN 'avatar-wizard'
    ELSE NULL
  END;

  IF avatar_item_key IS NULL
     OR NOT EXISTS (
       SELECT 1
       FROM public.shop_purchases
       WHERE user_id = NEW.user_id
         AND item_key = avatar_item_key
     ) THEN
    RAISE EXCEPTION 'Avatar is locked. Purchase it from the Shop first.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_guard_profile_avatar ON public.profiles;
CREATE TRIGGER trigger_guard_profile_avatar
BEFORE UPDATE OF avatar ON public.profiles
FOR EACH ROW
WHEN (OLD.avatar IS DISTINCT FROM NEW.avatar)
EXECUTE FUNCTION public.guard_profile_avatar();

REVOKE EXECUTE ON FUNCTION public.guard_profile_avatar() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.guard_profile_avatar() FROM anon;
GRANT EXECUTE ON FUNCTION public.guard_profile_avatar() TO authenticated;

CREATE OR REPLACE FUNCTION public.refresh_user_awards(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  games_played integer := 0;
  memory_plays integer := 0;
  quiz_correct integer := 0;
  drawings_count integer := 0;
  total_stars integer := 0;
  current_streak integer := 0;
  early_bird integer := 0;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> target_user_id THEN
    RETURN;
  END IF;

  SELECT COUNT(*), COALESCE(SUM(CASE WHEN game_id = 'memory-match' THEN times_played ELSE 0 END), 0)
  INTO games_played, memory_plays
  FROM public.game_progress
  WHERE user_id = target_user_id;

  SELECT COALESCE(SUM(
    CASE
      WHEN detail ~* 'got [0-9]+ correct' THEN (regexp_match(detail, 'got ([0-9]+) correct', 'i'))[1]::integer
      ELSE 0
    END
  ), 0)
  INTO quiz_correct
  FROM public.activity_log
  WHERE user_id = target_user_id
    AND game_id = 'brain-quiz';

  SELECT COUNT(*) INTO drawings_count
  FROM public.saved_drawings
  WHERE user_id = target_user_id;

  SELECT COALESCE(stars, 0), COALESCE(day_streak, 0)
  INTO total_stars, current_streak
  FROM public.profiles
  WHERE user_id = target_user_id;

  SELECT CASE WHEN EXISTS (
    SELECT 1
    FROM public.activity_log
    WHERE user_id = target_user_id
      AND created_at::time < time '08:00'
      AND created_at::date = current_date
  ) THEN 1 ELSE 0 END
  INTO early_bird;

  UPDATE public.user_achievements
  SET
    progress = CASE achievement_key
      WHEN 'first-steps' THEN LEAST(games_played, 1)
      WHEN 'streak-7' THEN LEAST(current_streak, 7)
      WHEN 'star-collector' THEN LEAST(total_stars, 50)
      WHEN 'memory-master' THEN LEAST(memory_plays, 10)
      WHEN 'quiz-champion' THEN LEAST(quiz_correct, 100)
      WHEN 'artist' THEN LEAST(drawings_count, 5)
      WHEN 'explorer' THEN LEAST(games_played, 15)
      WHEN 'early-bird' THEN early_bird
      ELSE progress
    END,
    unlocked = CASE achievement_key
      WHEN 'first-steps' THEN games_played >= 1
      WHEN 'streak-7' THEN current_streak >= 7
      WHEN 'star-collector' THEN total_stars >= 50
      WHEN 'memory-master' THEN memory_plays >= 10
      WHEN 'quiz-champion' THEN quiz_correct >= 100
      WHEN 'artist' THEN drawings_count >= 5
      WHEN 'explorer' THEN games_played >= 15
      WHEN 'early-bird' THEN early_bird = 1
      ELSE unlocked
    END,
    unlocked_at = CASE
      WHEN NOT unlocked AND (
        CASE achievement_key
          WHEN 'first-steps' THEN games_played >= 1
          WHEN 'streak-7' THEN current_streak >= 7
          WHEN 'star-collector' THEN total_stars >= 50
          WHEN 'memory-master' THEN memory_plays >= 10
          WHEN 'quiz-champion' THEN quiz_correct >= 100
          WHEN 'artist' THEN drawings_count >= 5
          WHEN 'explorer' THEN games_played >= 15
          WHEN 'early-bird' THEN early_bird = 1
          ELSE false
        END
      ) THEN now()
      ELSE unlocked_at
    END,
    updated_at = now()
  WHERE user_id = target_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.refresh_user_awards(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.refresh_user_awards(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.refresh_user_awards(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.trigger_refresh_user_awards()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.refresh_user_awards(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_refresh_awards_game_progress ON public.game_progress;
CREATE TRIGGER trigger_refresh_awards_game_progress
AFTER INSERT OR UPDATE ON public.game_progress
FOR EACH ROW EXECUTE FUNCTION public.trigger_refresh_user_awards();

DROP TRIGGER IF EXISTS trigger_refresh_awards_activity_log ON public.activity_log;
CREATE TRIGGER trigger_refresh_awards_activity_log
AFTER INSERT ON public.activity_log
FOR EACH ROW EXECUTE FUNCTION public.trigger_refresh_user_awards();

DROP TRIGGER IF EXISTS trigger_refresh_awards_saved_drawings ON public.saved_drawings;
CREATE TRIGGER trigger_refresh_awards_saved_drawings
AFTER INSERT ON public.saved_drawings
FOR EACH ROW EXECUTE FUNCTION public.trigger_refresh_user_awards();

DROP TRIGGER IF EXISTS trigger_refresh_awards_profiles ON public.profiles;
CREATE TRIGGER trigger_refresh_awards_profiles
AFTER UPDATE OF stars, day_streak ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.trigger_refresh_user_awards();

REVOKE EXECUTE ON FUNCTION public.trigger_refresh_user_awards() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trigger_refresh_user_awards() FROM anon;
GRANT EXECUTE ON FUNCTION public.trigger_refresh_user_awards() TO authenticated;
