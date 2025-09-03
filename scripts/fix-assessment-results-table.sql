-- Fix assessment_results table by adding missing columns
-- Run this in your Supabase SQL editor

-- Add missing columns to assessment_results table
ALTER TABLE assessment_results 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS ocean_scores JSONB,
ADD COLUMN IF NOT EXISTS culture_scores JSONB,
ADD COLUMN IF NOT EXISTS values_scores JSONB;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_results_user_id ON assessment_results(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment_id ON assessment_results(assessment_id);

-- Update existing rows to link user_id from assessments table
UPDATE assessment_results 
SET user_id = assessments.user_id
FROM assessments 
WHERE assessment_results.assessment_id = assessments.id;

-- Make user_id NOT NULL after populating it
ALTER TABLE assessment_results ALTER COLUMN user_id SET NOT NULL;

-- Add constraint to ensure assessment_id is unique
ALTER TABLE assessment_results ADD CONSTRAINT assessment_results_assessment_id_unique UNIQUE (assessment_id);

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'assessment_results' 
ORDER BY ordinal_position;
