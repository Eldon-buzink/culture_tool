'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TestPage() {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({ name: 'Test User', email: 'test@example.com' });
  const [teamData, setTeamData] = useState({ name: 'Test Team', description: 'A test team' });

  const testUserCreation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const result = await response.json();
      setTestResults((prev: any) => ({ ...prev, userCreation: result }));
    } catch (error) {
      setTestResults((prev: any) => ({ ...prev, userCreation: { error: (error as Error).message } }));
    } finally {
      setLoading(false);
    }
  };

  const testAssessmentCreation = async () => {
    setLoading(true);
    try {
      const userId = testResults.userCreation?.user?.id;
      if (!userId) {
        setTestResults((prev: any) => ({ ...prev, assessmentCreation: { error: 'Create a user first' } }));
        return;
      }

      const response = await fetch('/api/assessments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const result = await response.json();
      setTestResults((prev: any) => ({ ...prev, assessmentCreation: result }));
    } catch (error) {
      setTestResults((prev: any) => ({ ...prev, assessmentCreation: { error: (error as Error).message } }));
    } finally {
      setLoading(false);
    }
  };

  const testTeamCreation = async () => {
    setLoading(true);
    try {
      const userId = testResults.userCreation?.user?.id;
      if (!userId) {
        setTestResults((prev: any) => ({ ...prev, teamCreation: { error: 'Create a user first' } }));
        return;
      }

      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...teamData, 
          creatorId: userId,
          memberEmails: ['member1@example.com', 'member2@example.com']
        })
      });
      const result = await response.json();
      setTestResults((prev: any) => ({ ...prev, teamCreation: result }));
    } catch (error) {
      setTestResults((prev: any) => ({ ...prev, teamCreation: { error: (error as Error).message } }));
    } finally {
      setLoading(false);
    }
  };

  const testAIRecommendations = async () => {
    setLoading(true);
    try {
      const mockScores = {
        oceanScores: {
          openness: 75,
          conscientiousness: 60,
          extraversion: 80,
          agreeableness: 70,
          neuroticism: 30
        },
        cultureScores: {
          powerDistance: 40,
          individualism: 70,
          masculinity: 50,
          uncertaintyAvoidance: 60,
          longTermOrientation: 65,
          indulgence: 55
        },
        valuesScores: {
          innovation: 80,
          collaboration: 75,
          autonomy: 70,
          quality: 85,
          customerFocus: 65
        }
      };

      const response = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockScores)
      });
      const result = await response.json();
      setTestResults((prev: any) => ({ ...prev, aiRecommendations: result }));
    } catch (error) {
      setTestResults((prev: any) => ({ ...prev, aiRecommendations: { error: (error as Error).message } }));
    } finally {
      setLoading(false);
    }
  };

  const testAssessmentResponses = async () => {
    setLoading(true);
    try {
      const assessmentId = testResults.assessmentCreation?.assessmentId;
      if (!assessmentId) {
        setTestResults((prev: any) => ({ ...prev, assessmentResponses: { error: 'Create an assessment first' } }));
        return;
      }

      const mockResponses = {
        'ocean_1': 5,
        'ocean_2': 6,
        'culture_1': 4,
        'culture_2': 7,
        'values_1': 6,
        'values_2': 5
      };

      const response = await fetch(`/api/assessments/${assessmentId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: mockResponses })
      });
      const result = await response.json();
      setTestResults((prev: any) => ({ ...prev, assessmentResponses: result }));
    } catch (error) {
      setTestResults((prev: any) => ({ ...prev, assessmentResponses: { error: (error as Error).message } }));
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults({});
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Database API Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>User Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userName">Name</Label>
              <Input
                id="userName"
                value={userData.name}
                onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                value={userData.email}
                onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                value={teamData.name}
                onChange={(e) => setTeamData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="teamDescription">Description</Label>
              <Input
                id="teamDescription"
                value={teamData.description}
                onChange={(e) => setTeamData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex flex-wrap gap-4">
          <Button onClick={testUserCreation} disabled={loading}>
            Test User Creation
          </Button>
          <Button onClick={testAssessmentCreation} disabled={loading}>
            Test Assessment Creation
          </Button>
          <Button onClick={testTeamCreation} disabled={loading}>
            Test Team Creation
          </Button>
          <Button onClick={testAssessmentResponses} disabled={loading}>
            Test Assessment Responses
          </Button>
          <Button onClick={testAIRecommendations} disabled={loading}>
            Test AI Recommendations
          </Button>
          <Button onClick={clearResults} variant="outline">
            Clear Results
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(testResults).map(([key, result]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
