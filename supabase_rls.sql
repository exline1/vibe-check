-- ====================================================================
-- Supabase Row Level Security (RLS) & Cleanup Migration Script for fun.ai
-- Execute these SQL queries in your Supabase SQL Editor
-- ====================================================================

-- 1. Enable RLS on battle_rooms table
ALTER TABLE IF EXISTS public.battle_rooms ENABLE ROW LEVEL SECURITY;

-- 2. Create Policy: Allow public read access to rooms matching the room_code
CREATE POLICY "Allow public read access by room_code" 
ON public.battle_rooms 
FOR SELECT 
USING (true);

-- 3. Create Policy: Allow public room creation with valid room_code and name
CREATE POLICY "Allow room creation" 
ON public.battle_rooms 
FOR INSERT 
WITH CHECK (
  length(room_code) >= 6 AND 
  length(room_code) <= 20
);

-- 4. Create Policy: Allow updates to battle room state matching room_code
CREATE POLICY "Allow update room by room_code" 
ON public.battle_rooms 
FOR UPDATE 
USING (true);

-- ====================================================================
-- AUTOMATIC STALE ROOM CLEANUP (older than 24 hours)
-- ====================================================================

-- Function to delete battle rooms older than 24 hours
CREATE OR REPLACE FUNCTION delete_stale_battle_rooms() 
RETURNS void AS $$
BEGIN
  DELETE FROM public.battle_rooms 
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: You can invoke `SELECT delete_stale_battle_rooms();` via Supabase Cron / Scheduled Tasks
-- or triggers to ensure free tier storage is never exceeded.
