'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Users, Target, ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function StartAssessmentPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Automatically start creating an assessment when the page loads
    startNewAssessment();
  }, []);

  const startNewAssessment = async () => {
    setIsCreating(true);
    setError(null);

    try {
      // First, create a user for this assessment
      const userResponse = await fetch('/api/create-test-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `User ${Date.now()}`,
          email: `user-${Date.now()}@temp.com`
        }),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to create user');
      }

      const userData = await userResponse.json();
      if (!userData.success) {
        throw new Error('Failed to create user: ' + userData.error);
      }

      // Now create the assessment with the valid user ID
      const assessmentResponse = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Individual Personality Assessment',
          description: 'Personal assessment to discover your OCEAN personality traits, cultural preferences, and work values.',
          type: 'individual',
          createdBy: userData.user.id
        }),
      });

      if (assessmentResponse.ok) {
        const data = await assessmentResponse.json();
        if (data.success) {
          // Redirect to the assessment overview page
          router.push(`/assessment/${data.assessment.id}`);
        } else {
          setError('Failed to create assessment: ' + data.error);
        }
      } else {
        setError('Failed to create assessment');
      }
    } catch (error) {
      console.error('Error creating assessment:', error);
      setError('Failed to create assessment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsCreating(false);
    }
  };

  const retry = () => {
    startNewAssessment();
  };

  if (isCreating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-2">Starting Your Assessment</h2>
          <p className="text-gray-600">Setting up your personalized personality assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Error Starting Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={retry} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="text-gray-600 mt-4">Redirecting to your assessment...</p>
      </div>
    </div>
  );
}
