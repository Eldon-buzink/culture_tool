-- Create candidates table for storing candidate information and assessment results
CREATE TABLE IF NOT EXISTS candidates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    team_code VARCHAR(50) NOT NULL REFERENCES teams(code) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'invited' CHECK (status IN ('invited', 'in_progress', 'completed', 'withdrawn')),
    
    -- Assessment tracking
    assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Assessment results
    ocean_scores JSONB,
    culture_scores JSONB,
    values_scores JSONB,
    overall_fit_score INTEGER CHECK (overall_fit_score >= 0 AND overall_fit_score <= 100),
    
    -- Metadata
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidates_team_code ON candidates(team_code);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_assessment_id ON candidates(assessment_id);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_candidates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_candidates_updated_at
    BEFORE UPDATE ON candidates
    FOR EACH ROW
    EXECUTE FUNCTION update_candidates_updated_at();

-- Add some sample data for testing (optional)
INSERT INTO candidates (name, email, position, team_code, status, invited_at, overall_fit_score, ocean_scores, culture_scores, values_scores) VALUES
    ('Sarah Johnson', 'sarah.johnson@example.com', 'Senior Developer', 'TEAM001', 'completed', '2024-01-10 10:00:00+00', 87, 
     '{"openness": 75, "conscientiousness": 82, "extraversion": 68, "agreeableness": 71, "neuroticism": 45}',
     '{"hierarchy": 35, "egalitarian": 78, "individualistic": 65, "collectivistic": 42}',
     '{"innovation": 80, "quality": 85, "efficiency": 72, "collaboration": 68}'),
    
    ('Michael Chen', 'michael.chen@example.com', 'Product Manager', 'TEAM001', 'in_progress', '2024-01-12 14:30:00+00', NULL, NULL, NULL, NULL),
    
    ('Emma Rodriguez', 'emma.rodriguez@example.com', 'UX Designer', 'TEAM001', 'invited', '2024-01-15 09:15:00+00', NULL, NULL, NULL, NULL)
ON CONFLICT (email, team_code) DO NOTHING;

-- Create a view for easy candidate analysis
CREATE OR REPLACE VIEW candidate_analysis AS
SELECT 
    c.id,
    c.name,
    c.email,
    c.position,
    c.team_code,
    c.status,
    c.overall_fit_score,
    c.ocean_scores,
    c.culture_scores,
    c.values_scores,
    c.invited_at,
    c.started_at,
    c.completed_at,
    t.name as team_name,
    t.description as team_description,
    CASE 
        WHEN c.overall_fit_score >= 80 THEN 'Excellent Fit'
        WHEN c.overall_fit_score >= 60 THEN 'Good Fit'
        WHEN c.overall_fit_score >= 40 THEN 'Moderate Fit'
        ELSE 'Poor Fit'
    END as fit_category
FROM candidates c
JOIN teams t ON c.team_code = t.code;

-- Grant appropriate permissions (adjust based on your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON candidates TO authenticated;
-- GRANT SELECT ON candidate_analysis TO authenticated;
