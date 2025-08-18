# 🚀 Quick Start Guide - Team Testing Phase

## 🎯 **Your Current Goals**
1. **Test with your team** using UUIDs (no authentication needed)
2. **Use Supabase** as your backend
3. **AI-powered recommendations** using OpenAI API

## 📋 **Step-by-Step Implementation**

### **Step 1: Set up Supabase (30 minutes)**

1. **Create Supabase Project**
   ```bash
   # Go to https://supabase.com
   # Create new project
   # Note down your project URL and anon key
   ```

2. **Get Database Connection String**
   ```bash
   # In Supabase Dashboard > Settings > Database
   # Copy the connection string (starts with postgresql://)
   ```

3. **Set Environment Variables**
   ```bash
   # Create .env.local file
   DATABASE_URL="your_supabase_connection_string"
   OPENAI_API_KEY="your_openai_api_key"
   ```

### **Step 2: Install Dependencies (5 minutes)**

```bash
npm install @prisma/client prisma openai
npm install -D prisma
```

### **Step 3: Set up Database (10 minutes)**

```bash
# Generate Prisma client
npm run db:generate

# Push schema to Supabase
npm run db:push

# Verify connection
npm run db:studio
```

### **Step 4: Create API Routes (30 minutes)**

#### **4.1 User Creation API**
```typescript
// app/api/users/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();
    
    const user = await prisma.user.create({
      data: {
        name: name || 'Anonymous User',
        email: email || `user-${Date.now()}@example.com`,
      },
    });

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, name: user.name } 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
```

#### **4.2 Assessment Creation API**
```typescript
// app/api/assessments/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AssessmentService } from '@/lib/services/assessmentService';

export async function POST(request: NextRequest) {
  try {
    const { userId, teamId } = await request.json();
    
    const assessment = await AssessmentService.createAssessment({
      userId,
      teamId,
    });

    return NextResponse.json({ 
      success: true, 
      assessmentId: assessment.id 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
  }
}
```

#### **4.3 AI Recommendations API**
```typescript
// app/api/recommendations/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const scores = await request.json();
    
    const recommendations = await AIService.generateRecommendations(scores);

    return NextResponse.json({ 
      success: true, 
      recommendations 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}
```

### **Step 5: Update Frontend (45 minutes)**

#### **5.1 Update Assessment Page**
```typescript
// In app/assessment/[uuid]/page.tsx
// Replace mock data with real API calls

const createUser = async () => {
  const response = await fetch('/api/users/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User' }),
  });
  const data = await response.json();
  return data.user.id;
};

const createAssessment = async (userId: string) => {
  const response = await fetch('/api/assessments/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const data = await response.json();
  return data.assessmentId;
};
```

#### **5.2 Update Results Page**
```typescript
// In app/assessment/[uuid]/results/page.tsx
// Add AI recommendations

const getAIRecommendations = async (scores: any) => {
  const response = await fetch('/api/recommendations/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scores),
  });
  const data = await response.json();
  return data.recommendations;
};
```

### **Step 6: Test with Your Team (15 minutes)**

1. **Deploy to Vercel**
   ```bash
   git add .
   git commit -m "Add Supabase and OpenAI integration"
   git push origin main
   # Vercel will auto-deploy
   ```

2. **Share with Team**
   - Share the Vercel URL with your team
   - Each person gets a unique UUID automatically
   - No login required - just start the assessment

3. **Monitor Results**
   - Check Supabase dashboard for data
   - Monitor OpenAI API usage
   - Collect feedback from team

## 🔧 **Environment Variables Needed**

```bash
# .env.local
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
OPENAI_API_KEY="sk-..."
```

## 📊 **Expected Costs**

### **Monthly (Testing Phase)**
- **Supabase**: $0 (free tier)
- **OpenAI**: $5-20 (depending on usage)
- **Vercel**: $0 (free tier)
- **Total**: ~$5-20/month

### **Scaling Up**
- **Supabase Pro**: $25/month (when you need more)
- **OpenAI**: $10-50/month (more users)
- **Vercel Pro**: $20/month (when you need more)
- **Total**: ~$55-95/month

## 🎯 **Success Metrics for Testing**

### **Technical**
- [ ] All team members can complete assessments
- [ ] AI recommendations are generated successfully
- [ ] Data is stored in Supabase
- [ ] No errors in console

### **User Experience**
- [ ] Assessment flow is smooth
- [ ] Results are meaningful and actionable
- [ ] Team can share and discuss results
- [ ] Recommendations are personalized

### **Business**
- [ ] Team finds value in the insights
- [ ] Recommendations are actionable
- [ ] Process takes reasonable time
- [ ] Team wants to use it again

## 🚀 **Next Steps After Testing**

1. **Collect Feedback**: What worked? What didn't?
2. **Refine AI Prompts**: Improve recommendation quality
3. **Add Features**: Team comparisons, conflict detection
4. **Scale Up**: Add authentication, more users
5. **Monetize**: Consider pricing model

## 🆘 **Troubleshooting**

### **Database Issues**
```bash
# Reset database
npm run db:push --force-reset

# Check connection
npm run db:studio
```

### **OpenAI Issues**
```bash
# Check API key
echo $OPENAI_API_KEY

# Test API call
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

### **Deployment Issues**
```bash
# Check Vercel logs
vercel logs

# Redeploy
vercel --prod
```

This quick start guide gets you from mock data to a fully functional application that your team can test immediately. The UUID-based system means no authentication complexity, and Supabase provides a robust backend without the overhead of managing your own database.
