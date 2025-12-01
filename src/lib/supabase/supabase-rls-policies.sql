-- ============================================================
-- SUPABASE ROW-LEVEL SECURITY (RLS) POLICIES
-- Single Source of Truth for all RLS policies
-- Run this script in Supabase SQL Editor
-- ============================================================
-- WARNING: This will restrict ALL data access to authenticated users only
-- Backup your data before running in production
-- ============================================================
-- SECURITY FIXES APPLIED (2025-12-01):
-- VULN-001: material_shares - removed anonymous access (HIGH)
-- VULN-002: unlimited_users - removed public access (HIGH)
-- Added secure RPC functions for share access
-- Added check_user_is_unlimited() helper function
-- ============================================================
-- PERFORMANCE FIXES APPLIED (2025-12-01):
-- PERF-001: Wrapped auth.uid() with (select auth.uid()) to cache per-statement
-- PERF-002: Added TO authenticated to all policies to skip anon RLS checks
-- PERF-003: Removed duplicate permissive policies
-- PERF-004: Added SET search_path = '' to all SECURITY DEFINER functions
-- ============================================================

-- ============================================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewer_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewer_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlimited_users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: DROP EXISTING POLICIES (if any) TO AVOID CONFLICTS
-- Includes duplicate policies that were causing performance issues
-- ============================================================

-- flashcards
DROP POLICY IF EXISTS "Users can view own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can insert own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can update own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can delete own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Anyone can view flashcards of shared sets" ON flashcards;

-- flashcard_sets (drop duplicates with spaces)
DROP POLICY IF EXISTS "Users can view own flashcard_sets" ON flashcard_sets;
DROP POLICY IF EXISTS "Users can insert own flashcard_sets" ON flashcard_sets;
DROP POLICY IF EXISTS "Users can update own flashcard_sets" ON flashcard_sets;
DROP POLICY IF EXISTS "Users can delete own flashcard_sets" ON flashcard_sets;
DROP POLICY IF EXISTS "Users can view own flashcard sets" ON flashcard_sets;
DROP POLICY IF EXISTS "Users can insert own flashcard sets" ON flashcard_sets;
DROP POLICY IF EXISTS "Users can update own flashcard sets" ON flashcard_sets;
DROP POLICY IF EXISTS "Users can delete own flashcard sets" ON flashcard_sets;
DROP POLICY IF EXISTS "Anyone can view shared flashcard sets" ON flashcard_sets;

-- reviewers
DROP POLICY IF EXISTS "Users can view own reviewers" ON reviewers;
DROP POLICY IF EXISTS "Users can insert own reviewers" ON reviewers;
DROP POLICY IF EXISTS "Users can update own reviewers" ON reviewers;
DROP POLICY IF EXISTS "Users can delete own reviewers" ON reviewers;
DROP POLICY IF EXISTS "Anyone can view shared reviewers" ON reviewers;

-- reviewer_terms (drop duplicates with spaces)
DROP POLICY IF EXISTS "Users can view own reviewer_terms" ON reviewer_terms;
DROP POLICY IF EXISTS "Users can insert own reviewer_terms" ON reviewer_terms;
DROP POLICY IF EXISTS "Users can update own reviewer_terms" ON reviewer_terms;
DROP POLICY IF EXISTS "Users can delete own reviewer_terms" ON reviewer_terms;
DROP POLICY IF EXISTS "Users can view own reviewer terms" ON reviewer_terms;
DROP POLICY IF EXISTS "Users can insert own reviewer terms" ON reviewer_terms;
DROP POLICY IF EXISTS "Users can update own reviewer terms" ON reviewer_terms;
DROP POLICY IF EXISTS "Users can delete own reviewer terms" ON reviewer_terms;
DROP POLICY IF EXISTS "Anyone can view terms of shared reviewers" ON reviewer_terms;

-- reviewer_categories (drop duplicates with spaces)
DROP POLICY IF EXISTS "Users can view own reviewer_categories" ON reviewer_categories;
DROP POLICY IF EXISTS "Users can insert own reviewer_categories" ON reviewer_categories;
DROP POLICY IF EXISTS "Users can update own reviewer_categories" ON reviewer_categories;
DROP POLICY IF EXISTS "Users can delete own reviewer_categories" ON reviewer_categories;
DROP POLICY IF EXISTS "Users can view own reviewer categories" ON reviewer_categories;
DROP POLICY IF EXISTS "Users can insert own reviewer categories" ON reviewer_categories;
DROP POLICY IF EXISTS "Users can update own reviewer categories" ON reviewer_categories;
DROP POLICY IF EXISTS "Users can delete own reviewer categories" ON reviewer_categories;
DROP POLICY IF EXISTS "Anyone can view categories of shared reviewers" ON reviewer_categories;

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- pomodoro_sessions (drop duplicates with spaces)
DROP POLICY IF EXISTS "Users can view own pomodoro_sessions" ON pomodoro_sessions;
DROP POLICY IF EXISTS "Users can insert own pomodoro_sessions" ON pomodoro_sessions;
DROP POLICY IF EXISTS "Users can update own pomodoro_sessions" ON pomodoro_sessions;
DROP POLICY IF EXISTS "Users can delete own pomodoro_sessions" ON pomodoro_sessions;
DROP POLICY IF EXISTS "Users can view own pomodoro sessions" ON pomodoro_sessions;
DROP POLICY IF EXISTS "Users can insert own pomodoro sessions" ON pomodoro_sessions;

-- user_stats (drop duplicates with spaces)
DROP POLICY IF EXISTS "Users can view own user_stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own user_stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own user_stats" ON user_stats;
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;

-- user_achievements (drop duplicates with spaces)
DROP POLICY IF EXISTS "Users can view own user_achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can insert own user_achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can update own user_achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can update own achievements" ON user_achievements;

-- study_activity (drop duplicates with spaces)
DROP POLICY IF EXISTS "Users can view own study_activity" ON study_activity;
DROP POLICY IF EXISTS "Users can insert own study_activity" ON study_activity;
DROP POLICY IF EXISTS "Users can update own study_activity" ON study_activity;
DROP POLICY IF EXISTS "Users can delete own study_activity" ON study_activity;
DROP POLICY IF EXISTS "Users can view own study activity" ON study_activity;
DROP POLICY IF EXISTS "Users can insert own study activity" ON study_activity;
DROP POLICY IF EXISTS "Users can update own study activity" ON study_activity;

-- materials
DROP POLICY IF EXISTS "Users can view own materials" ON materials;
DROP POLICY IF EXISTS "Users can insert own materials" ON materials;
DROP POLICY IF EXISTS "Users can update own materials" ON materials;
DROP POLICY IF EXISTS "Users can delete own materials" ON materials;

-- quizzes
DROP POLICY IF EXISTS "Users can view own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can insert own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can update own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can delete own quizzes" ON quizzes;

-- quiz_questions (drop duplicates with spaces)
DROP POLICY IF EXISTS "Users can view own quiz_questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can insert own quiz_questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can update own quiz_questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can delete own quiz_questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can view own quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can insert own quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can update own quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can delete own quiz questions" ON quiz_questions;

-- quiz_attempts (drop duplicates with spaces)
DROP POLICY IF EXISTS "Users can view own quiz_attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can insert own quiz_attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can update own quiz_attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can view own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON quiz_attempts;

-- material_shares (drop duplicates with spaces)
DROP POLICY IF EXISTS "material_shares_anon_select" ON material_shares;
DROP POLICY IF EXISTS "material_shares_public_select" ON material_shares;
DROP POLICY IF EXISTS "Users can view own material_shares" ON material_shares;
DROP POLICY IF EXISTS "Users can insert own material_shares" ON material_shares;
DROP POLICY IF EXISTS "Users can update own material_shares" ON material_shares;
DROP POLICY IF EXISTS "Users can delete own material_shares" ON material_shares;
DROP POLICY IF EXISTS "Users can view own shares" ON material_shares;
DROP POLICY IF EXISTS "Users can insert own shares" ON material_shares;
DROP POLICY IF EXISTS "Users can update own shares" ON material_shares;
DROP POLICY IF EXISTS "Users can delete own shares" ON material_shares;

-- unlimited_users
DROP POLICY IF EXISTS "unlimited_users_public_select" ON unlimited_users;
DROP POLICY IF EXISTS "unlimited_users_anon_select" ON unlimited_users;
DROP POLICY IF EXISTS "Users can view own unlimited_users" ON unlimited_users;
DROP POLICY IF EXISTS "Allow read access for rate limit check" ON unlimited_users;
DROP POLICY IF EXISTS "Users can check own unlimited status" ON unlimited_users;

-- Drop existing RPC functions to recreate with search_path fix
DROP FUNCTION IF EXISTS get_shared_flashcards(text);
DROP FUNCTION IF EXISTS get_shared_flashcard_set(text);
DROP FUNCTION IF EXISTS validate_share_code(text);
DROP FUNCTION IF EXISTS check_user_is_unlimited(uuid);
DROP FUNCTION IF EXISTS calculate_level(integer);
DROP FUNCTION IF EXISTS get_xp_for_level(integer);
DROP FUNCTION IF EXISTS get_xp_in_current_level(integer, integer);

-- ============================================================
-- STEP 3: CREATE RLS POLICIES FOR EACH TABLE
-- All policies use (select auth.uid()) for performance optimization
-- All policies use TO authenticated to skip anon RLS checks
-- ============================================================

-- ------------------------------------------------------------
-- FLASHCARDS
-- ------------------------------------------------------------
CREATE POLICY "Users can view own flashcards" ON flashcards
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own flashcards" ON flashcards
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own flashcards" ON flashcards
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own flashcards" ON flashcards
    FOR DELETE TO authenticated
    USING ((select auth.uid()) = user_id);

-- ------------------------------------------------------------
-- FLASHCARD_SETS
-- ------------------------------------------------------------
CREATE POLICY "Users can view own flashcard_sets" ON flashcard_sets
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own flashcard_sets" ON flashcard_sets
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own flashcard_sets" ON flashcard_sets
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own flashcard_sets" ON flashcard_sets
    FOR DELETE TO authenticated
    USING ((select auth.uid()) = user_id);

-- ------------------------------------------------------------
-- REVIEWERS
-- ------------------------------------------------------------
CREATE POLICY "Users can view own reviewers" ON reviewers
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own reviewers" ON reviewers
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own reviewers" ON reviewers
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own reviewers" ON reviewers
    FOR DELETE TO authenticated
    USING ((select auth.uid()) = user_id);

-- ------------------------------------------------------------
-- REVIEWER_TERMS
-- ------------------------------------------------------------
CREATE POLICY "Users can view own reviewer_terms" ON reviewer_terms
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own reviewer_terms" ON reviewer_terms
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own reviewer_terms" ON reviewer_terms
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own reviewer_terms" ON reviewer_terms
    FOR DELETE TO authenticated
    USING ((select auth.uid()) = user_id);

-- ------------------------------------------------------------
-- REVIEWER_CATEGORIES
-- ------------------------------------------------------------
CREATE POLICY "Users can view own reviewer_categories" ON reviewer_categories
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own reviewer_categories" ON reviewer_categories
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own reviewer_categories" ON reviewer_categories
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own reviewer_categories" ON reviewer_categories
    FOR DELETE TO authenticated
    USING ((select auth.uid()) = user_id);

-- ------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = id)
    WITH CHECK ((select auth.uid()) = id);

-- ------------------------------------------------------------
-- POMODORO_SESSIONS
-- ------------------------------------------------------------
CREATE POLICY "Users can view own pomodoro_sessions" ON pomodoro_sessions
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own pomodoro_sessions" ON pomodoro_sessions
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own pomodoro_sessions" ON pomodoro_sessions
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own pomodoro_sessions" ON pomodoro_sessions
    FOR DELETE TO authenticated
    USING ((select auth.uid()) = user_id);

-- ------------------------------------------------------------
-- USER_STATS
-- ------------------------------------------------------------
CREATE POLICY "Users can view own user_stats" ON user_stats
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own user_stats" ON user_stats
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own user_stats" ON user_stats
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ------------------------------------------------------------
-- USER_ACHIEVEMENTS
-- ------------------------------------------------------------
CREATE POLICY "Users can view own user_achievements" ON user_achievements
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own user_achievements" ON user_achievements
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own user_achievements" ON user_achievements
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ------------------------------------------------------------
-- STUDY_ACTIVITY
-- ------------------------------------------------------------
CREATE POLICY "Users can view own study_activity" ON study_activity
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own study_activity" ON study_activity
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own study_activity" ON study_activity
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own study_activity" ON study_activity
    FOR DELETE TO authenticated
    USING ((select auth.uid()) = user_id);

-- ------------------------------------------------------------
-- MATERIALS
-- ------------------------------------------------------------
CREATE POLICY "Users can view own materials" ON materials
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own materials" ON materials
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own materials" ON materials
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own materials" ON materials
    FOR DELETE TO authenticated
    USING ((select auth.uid()) = user_id);

-- ------------------------------------------------------------
-- QUIZZES
-- ------------------------------------------------------------
CREATE POLICY "Users can view own quizzes" ON quizzes
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own quizzes" ON quizzes
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own quizzes" ON quizzes
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own quizzes" ON quizzes
    FOR DELETE TO authenticated
    USING ((select auth.uid()) = user_id);

-- ------------------------------------------------------------
-- QUIZ_QUESTIONS
-- ------------------------------------------------------------
CREATE POLICY "Users can view own quiz_questions" ON quiz_questions
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own quiz_questions" ON quiz_questions
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own quiz_questions" ON quiz_questions
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own quiz_questions" ON quiz_questions
    FOR DELETE TO authenticated
    USING ((select auth.uid()) = user_id);

-- ------------------------------------------------------------
-- QUIZ_ATTEMPTS
-- ------------------------------------------------------------
CREATE POLICY "Users can view own quiz_attempts" ON quiz_attempts
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own quiz_attempts" ON quiz_attempts
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own quiz_attempts" ON quiz_attempts
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ------------------------------------------------------------
-- MATERIAL_SHARES (SECURITY FIX - CRITICAL)
-- Only owners can manage their shares. No anonymous access.
-- Share code validation happens via secure RPC function.
-- ------------------------------------------------------------
CREATE POLICY "Users can view own material_shares" ON material_shares
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own material_shares" ON material_shares
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own material_shares" ON material_shares
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own material_shares" ON material_shares
    FOR DELETE TO authenticated
    USING ((select auth.uid()) = user_id);

-- ------------------------------------------------------------
-- UNLIMITED_USERS (SECURITY FIX - HIGH)
-- Only users can check their own premium status.
-- ------------------------------------------------------------
CREATE POLICY "Users can check own unlimited status" ON unlimited_users
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);

-- ============================================================
-- STEP 4: SECURE RPC FUNCTIONS FOR SHARE ACCESS
-- All functions use SECURITY DEFINER with SET search_path = ''
-- ============================================================

-- Validate a share code and return share metadata (no sensitive data)
CREATE OR REPLACE FUNCTION public.validate_share_code(p_share_code text)
RETURNS TABLE (
    material_type text,
    material_id uuid,
    is_valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ms.material_type::text,
        ms.material_id,
        true as is_valid
    FROM public.material_shares ms
    WHERE ms.share_code = p_share_code 
    AND ms.is_active = true;
END;
$$;

-- Get shared flashcard set by share code (secure access)
CREATE OR REPLACE FUNCTION public.get_shared_flashcard_set(p_share_code text)
RETURNS TABLE (
    id uuid,
    title text,
    description text,
    created_at timestamptz,
    card_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fs.id,
        fs.title,
        fs.description,
        fs.created_at,
        (SELECT COUNT(*) FROM public.flashcards f WHERE f.set_id = fs.id) as card_count
    FROM public.flashcard_sets fs
    JOIN public.material_shares ms ON ms.material_id = fs.id
    WHERE ms.share_code = p_share_code 
    AND ms.is_active = true
    AND ms.material_type = 'flashcard_set';
END;
$$;

-- Get shared flashcards by share code (secure access)
-- Note: Does NOT expose user study progress (status, last_reviewed)
CREATE OR REPLACE FUNCTION public.get_shared_flashcards(p_share_code text)
RETURNS TABLE (
    id uuid,
    term text,
    definition text,
    set_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.term,
        f.definition,
        f.set_id
    FROM public.flashcards f
    JOIN public.flashcard_sets fs ON f.set_id = fs.id
    JOIN public.material_shares ms ON ms.material_id = fs.id
    WHERE ms.share_code = p_share_code 
    AND ms.is_active = true
    AND ms.material_type = 'flashcard_set';
END;
$$;

-- Grant execute permissions to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.validate_share_code(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_shared_flashcard_set(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_shared_flashcards(text) TO anon, authenticated;

-- ============================================================
-- STEP 5: HELPER FUNCTIONS
-- All functions use SET search_path = '' for security
-- ============================================================

-- Check if user has unlimited access (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.check_user_is_unlimited(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.unlimited_users WHERE user_id = p_user_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_user_is_unlimited(uuid) TO authenticated;

-- Calculate level from XP
CREATE OR REPLACE FUNCTION public.calculate_level(p_total_xp integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
DECLARE
    v_level integer := 1;
    v_xp_required integer := 100;
BEGIN
    WHILE p_total_xp >= v_xp_required LOOP
        v_level := v_level + 1;
        v_xp_required := v_xp_required + (v_level * 50);
    END LOOP;
    RETURN v_level;
END;
$$;

GRANT EXECUTE ON FUNCTION public.calculate_level(integer) TO authenticated;

-- Get XP required for a specific level
CREATE OR REPLACE FUNCTION public.get_xp_for_level(p_level integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
DECLARE
    v_xp integer := 0;
    v_i integer;
BEGIN
    FOR v_i IN 1..p_level-1 LOOP
        v_xp := v_xp + 100 + ((v_i - 1) * 50);
    END LOOP;
    RETURN v_xp;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_xp_for_level(integer) TO authenticated;

-- Get XP progress within current level
CREATE OR REPLACE FUNCTION public.get_xp_in_current_level(p_total_xp integer, p_level integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
BEGIN
    RETURN p_total_xp - public.get_xp_for_level(p_level);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_xp_in_current_level(integer, integer) TO authenticated;

-- ============================================================
-- VERIFICATION QUERIES
-- Run these after applying policies to verify RLS is enabled
-- ============================================================

-- Check RLS status on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'flashcards', 'flashcard_sets', 'reviewers', 'reviewer_terms',
    'reviewer_categories', 'profiles', 'pomodoro_sessions', 'user_stats',
    'user_achievements', 'study_activity', 'materials', 'quizzes',
    'quiz_questions', 'quiz_attempts', 'material_shares', 'unlimited_users'
);

-- List all policies (should show no duplicates)
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Verify functions have search_path set
SELECT 
    p.proname as function_name,
    p.prosecdef as security_definer,
    p.proconfig as config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'validate_share_code', 
    'get_shared_flashcard_set', 
    'get_shared_flashcards',
    'check_user_is_unlimited',
    'calculate_level',
    'get_xp_for_level',
    'get_xp_in_current_level'
);
