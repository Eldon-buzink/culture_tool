'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TeamRadarChart from '@/components/TeamRadarChart';
import TeamCultureSummary from '@/components/TeamCultureSummary';
import RecommendationCard from '@/components/RecommendationCard';
import Link from 'next/link';

interface AssessmentResult {
  id: string;
  participantName: string;
  completedAt: string;
  scores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  insights: string[];
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export default function AssessmentResults() {
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('assessmentId');
  
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (assessmentId) {
      fetchResults();
    }
  }, [assessmentId]);

  const fetchResults = async () => {
    try {
      // Mock results data - replace with actual API call
      const mockResults: AssessmentResult = {
        id: assessmentId || 'mock-id',
        participantName: 'John Doe',
        completedAt: '2024-01-15T10:30:00Z',
        scores: {
          openness: 75,
          conscientiousness: 82,
          extraversion: 68,
          agreeableness: 90,
          neuroticism: 45,
        },
        insights: [
          'Your team shows high levels of agreeableness, indicating strong collaboration potential',
          'Moderate extraversion suggests balanced team dynamics',
          'Low neuroticism indicates good stress management',
        ],
        recommendations: [
          {
            id: '1',
            title: 'Enhance Team Collaboration',
            description: 'Leverage your high agreeableness scores to strengthen team bonds',
            priority: 'high',
          },
          {
            id: '2',
            title: 'Improve Communication',
            description: 'Consider more structured communication channels',
            priority: 'medium',
          },
          {
            id: '3',
            title: 'Stress Management Training',
            description: 'Implement stress management workshops',
            priority: 'low',
          },
        ],
      };

      setResults(mockResults);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading results...</div>;
  }

  if (!results) {
    return <div className="container mx-auto py-8">Results not found</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Assessment Results</h1>
          <p className="text-muted-foreground">
            Completed by {results.participantName} on {new Date(results.completedAt).toLocaleDateString()}
          </p>
        </div>
        <Button asChild>
          <Link href="/team/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Personality Profile</CardTitle>
            <CardDescription>
              Your OCEAN personality traits visualization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TeamRadarChart data={results.scores} />
          </CardContent>
        </Card>

        {/* Culture Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Culture Insights</CardTitle>
            <CardDescription>
              Key findings about your team culture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TeamCultureSummary insights={results.insights} />
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Actionable insights to improve your team culture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                title={recommendation.title}
                description={recommendation.description}
                priority={recommendation.priority}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" asChild>
          <Link href="/api/generateReport">Download Report</Link>
        </Button>
        <Button asChild>
          <Link href="/team/dashboard">Share with Team</Link>
        </Button>
      </div>
    </div>
  );
}
