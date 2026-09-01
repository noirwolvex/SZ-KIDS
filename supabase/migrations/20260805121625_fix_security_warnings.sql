/*
# Fix security advisor warnings

1. Set fixed search_path on update_updated_at() to prevent search path injection
2. Revoke EXECUTE on handle_new_user() from anon and authenticated — it's only called by the auth trigger, never via RPC
*/

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM authenticated;
