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
      // Generate a unique session ID for this assessment
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create a temporary assessment ID
      const assessmentId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Store session data in localStorage for this assessment
      localStorage.setItem(`assessment-session-${assessmentId}`, JSON.stringify({
        sessionId,
        assessmentId,
        createdAt: new Date().toISOString(),
        type: 'individual',
        status: 'in_progress'
      }));

      // Redirect to the assessment overview page
      router.push(`/assessment/${assessmentId}`);
    } catch (error) {
      console.error('Error starting assessment:', error);
      setError('Failed to start assessment: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
