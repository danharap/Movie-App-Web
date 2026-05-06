-- Tracks Letterboxd import sessions for resumability and audit purposes.
-- The actual movie data is stored in the existing watched_movies / watchlist tables.

CREATE TABLE IF NOT EXISTS letterboxd_imports (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  status      text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'matching', 'saving', 'complete', 'failed')),
  stats       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE letterboxd_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_imports"
  ON letterboxd_imports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_imports"
  ON letterboxd_imports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_imports"
  ON letterboxd_imports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_imports"
  ON letterboxd_imports FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_letterboxd_imports_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_letterboxd_imports_updated_at
  BEFORE UPDATE ON letterboxd_imports
  FOR EACH ROW EXECUTE FUNCTION update_letterboxd_imports_updated_at();
