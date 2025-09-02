# Database Setup Guide

## 🗄️ **New Candidates Table**

We've added a comprehensive candidates table to support the new hiring flow functionality.

### **Table Structure**

```sql
candidates (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    team_code VARCHAR(50) NOT NULL REFERENCES teams(code),
    status VARCHAR(20) DEFAULT 'invited',
    assessment_id UUID REFERENCES assessments(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    ocean_scores JSONB,
    culture_scores JSONB,
    values_scores JSONB,
    overall_fit_score INTEGER,
    invited_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### **Status Values**
- `invited` - Candidate has been invited but hasn't started
- `in_progress` - Candidate has started the assessment
- `completed` - Candidate has completed the assessment
- `withdrawn` - Candidate has withdrawn from the process

### **Setup Instructions**

1. **Run the SQL script:**
   ```bash
   psql -d your_database -f scripts/setup-candidates-table.sql
   ```

2. **Or execute manually in your database client:**
   - Copy the contents of `scripts/setup-candidates-table.sql`
   - Execute in your Supabase SQL editor or preferred database client

3. **Verify the setup:**
   ```sql
   SELECT * FROM candidates LIMIT 5;
   SELECT * FROM candidate_analysis LIMIT 5;
   ```

## 🚀 **New API Endpoints**

### **GET /api/candidates**
- **Query Parameters:**
  - `teamCode` - Filter candidates by team
  - `status` - Filter by status (invited, in_progress, completed, withdrawn)
  - `limit` - Number of results (default: 50)
  - `offset` - Pagination offset (default: 0)

- **Response:**
  ```json
  {
    "success": true,
    "candidates": [...],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 25
    }
  }
  ```

### **POST /api/candidates**
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "position": "Senior Developer",
    "teamCode": "TEAM001",
    "invitedBy": "user-uuid"
  }
  ```

### **GET /api/candidates/[candidateId]**
- Returns detailed candidate information including assessment scores
- Used by the candidate results page

## 🎯 **Enhanced Team Dashboard**

The team dashboard now includes:
- **Real candidate data** from the database
- **Status tracking** for each candidate
- **Direct links** to candidate results
- **Overall fit scores** for completed assessments

### **Features Added:**
1. **Candidate List** - Shows all candidates for the team
2. **Status Indicators** - Visual status for each candidate
3. **Progress Tracking** - Shows assessment completion status
4. **Results Access** - Direct links to view candidate results

## 🔧 **Database Migrations**

### **If you need to add the table manually:**

```sql
-- Create the candidates table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_candidates_team_code ON candidates(team_code);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_assessment_id ON candidates(assessment_id);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at);
```

## 📊 **Sample Data**

The setup script includes sample candidates for testing:

- **Sarah Johnson** - Senior Developer (completed, 87% fit)
- **Michael Chen** - Product Manager (in progress)
- **Emma Rodriguez** - UX Designer (invited)

## 🔐 **Permissions**

Make sure your Supabase Row Level Security (RLS) policies allow:
- Team members to view candidates for their team
- Team admins to create/edit candidates
- Candidates to view their own data

### **Example RLS Policy:**
```sql
-- Allow team members to view candidates for their team
CREATE POLICY "Team members can view team candidates" ON candidates
    FOR SELECT USING (
        team_code IN (
            SELECT team_code FROM team_members 
            WHERE user_id = auth.uid()
        )
    );
```

## 🧪 **Testing**

1. **Test the API endpoints:**
   ```bash
   # List candidates for a team
   curl "http://localhost:3000/api/candidates?teamCode=TEAM001"
   
   # Create a new candidate
   curl -X POST "http://localhost:3000/api/candidates" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","position":"Developer","teamCode":"TEAM001"}'
   ```

2. **Test the dashboard:**
   - Navigate to `/team/TEAM001/dashboard`
   - Verify candidates are displayed
   - Test the "View Results" links

3. **Test candidate results:**
   - Navigate to `/team/TEAM001/candidate/[candidateId]/results`
   - Verify all visualizations are working
   - Check that data is properly displayed

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Table not found:**
   - Ensure the SQL script ran successfully
   - Check database connection and permissions

2. **API errors:**
   - Verify Supabase connection in `lib/supabase/server.ts`
   - Check browser console for detailed error messages

3. **No candidates showing:**
   - Verify the team code exists in the teams table
   - Check that candidates have the correct team_code

4. **Build errors:**
   - Run `npm run build` to check for TypeScript errors
   - Ensure all imports are correct

### **Debug Commands:**
```bash
# Check database connection
npm run db-diag

# Check environment variables
npm run env-check

# Rebuild the application
rm -rf .next && npm run build
```

## 📈 **Next Steps**

After setting up the database:

1. **Test the complete flow:**
   - Create a team
   - Add candidates
   - Complete assessments
   - View results

2. **Customize the visualizations:**
   - Adjust color schemes
   - Modify risk thresholds
   - Add new chart types

3. **Enhance the recommendations:**
   - Add more AI-generated insights
   - Include role-specific advice
   - Add historical comparison data

4. **Add real-time features:**
   - WebSocket updates for assessment progress
   - Email notifications for completion
   - Dashboard refresh on data changes
