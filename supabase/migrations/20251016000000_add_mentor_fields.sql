-- Add mentor fields to profiles table
-- Users can mark themselves as mentors and add mentor-specific information

-- Add is_mentor boolean field (default false - users start as regular users)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_mentor boolean DEFAULT false;

-- Add mentor_expertise array field for mentor expertise areas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS mentor_expertise text[] DEFAULT '{}';

-- Add mentor_bio text field for mentor-specific bio
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS mentor_bio text;

-- Add mentor_linkedin text field for mentor LinkedIn URL
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS mentor_linkedin text;

-- Add years_experience integer field for years of experience
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS years_experience integer;

-- Create index on is_mentor for faster queries when filtering mentors
CREATE INDEX IF NOT EXISTS idx_profiles_is_mentor ON public.profiles(is_mentor) WHERE is_mentor = true;

