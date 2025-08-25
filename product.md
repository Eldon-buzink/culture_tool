# Product: Culture Alignment Tool

## Problem
Companies struggle to predict if a new hire will thrive in a team's culture. Culture fit is often guessed. This tool provides science-based insights to make better decisions.

## Audience
- HR teams
- Team leads in scale-ups or corporates
- Hiring managers
- Startup founders growing teams

## Core Workflow
1. **Individual Assessment**: Users can take individual assessments that are stored with unique UUIDs for 30+ day access
2. **Team Creation**: Team leads create teams and invite members via email
3. **Team Assessment**: All team members complete their individual assessments
4. **Individual Results**: Each team member can view their personal results (accessible via UUID)
5. **Team Dashboard**: Only team leads can access the team dashboard with aggregated insights and recommendations
6. **Results Sharing**: Individual results can be shared via email using the UUID system

## Features (MVP)
1. **Individual Assessment System**
   - OCEAN personality assessment (5 questions)
   - Cultural dimensions assessment (5 questions) 
   - Work values assessment (5 questions)
   - Unique UUID for each assessment (30+ day persistence)
   - Email results functionality for later access

2. **Team Management**
   - Team lead creates team account
   - Email invitations to team members
   - Team member onboarding and assessment completion
   - Team member status tracking

3. **Results & Insights**
   - Individual results with AI-powered recommendations
   - Team dashboard with aggregated culture insights
   - Team recommendations based on member assessments
   - Conflict detection and team dynamics analysis

4. **Data Persistence**
   - All assessment results stored in database
   - UUID-based access system for individual results
   - Team linking for aggregated analysis
   - 30+ day data retention

## Tech Stack
- Next.js + Tailwind CSS
- shadcn/ui components
- Supabase (database, authentication, email)
- Chart.js or Recharts (visualization)
- Resend (for email results and invites)

## Styleguide
- Playful, human, but grounded
- Use humor but always constructive
- Visual clarity first (charts > tables)
- Mobile-friendly, scroll-based interactions

## Database Schema Requirements
- **Users**: Team members and leads
- **Teams**: Team information and settings
- **Team Members**: User-team relationships
- **Assessments**: Individual assessment records with UUIDs
- **Assessment Responses**: Individual question responses
- **Assessment Results**: Calculated scores and AI recommendations
- **Team Recommendations**: AI-generated team insights

## Next Steps
1. ✅ Setup Cursor project with clean folder and debug structure
2. ✅ Build team creation flow
3. ✅ Build individual assessment system
4. ✅ Build results storage and retrieval
5. ✅ Build team dashboard with member insights
6. ✅ Generate AI-powered team recommendations