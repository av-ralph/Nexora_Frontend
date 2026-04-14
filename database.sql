-- SQL for setting up the Nexora Database tables in Supabase

-- 1. Create the watch_history table
CREATE TABLE IF NOT EXISTS public.watch_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL, -- references auth.users(id)
    movie_id bigint NOT NULL,
    movie_title text,
    movie_poster text,
    media_type text DEFAULT 'movie',
    watched_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE (user_id, movie_id)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Allow users to see only their own watch history
CREATE POLICY "Users can view their own watch history"
ON public.watch_history
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own watch history
CREATE POLICY "Users can insert their own watch history"
ON public.watch_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own watch history
CREATE POLICY "Users can delete their own watch history"
ON public.watch_history
FOR DELETE
USING (auth.uid() = user_id);

-- 4. Create index for performance
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON public.watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_watched_at ON public.watch_history(watched_at DESC);

-- 5. Create the favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL DEFAULT auth.uid(),
    movie_id bigint NOT NULL,
    movie_title text,
    movie_poster text,
    media_type text DEFAULT 'movie',
    created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE (user_id, movie_id)
);

-- 6. Enable RLS for favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies for favorites
CREATE POLICY "Users can view their own favorites"
ON public.favorites
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
ON public.favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
ON public.favorites
FOR DELETE
USING (auth.uid() = user_id);

-- 8. Create index for performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);

-- 9. Grant Permissions
-- Ensure the public schema is accessible
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant full access to authenticated users for their own data (RLS will still restrict to user_id)
GRANT ALL ON TABLE public.watch_history TO authenticated;
GRANT ALL ON TABLE public.favorites TO authenticated;

-- Grant read-only access to anon users if needed
GRANT SELECT ON TABLE public.watch_history TO anon;
GRANT SELECT ON TABLE public.favorites TO anon;


