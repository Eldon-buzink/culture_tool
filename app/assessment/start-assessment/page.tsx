'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Users, Target, ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function StartAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Prevent double execution
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    
    // Automatically start creating an assessment when the page loads
    startNewAssessment();
  }, []);

  const startNewAssessment = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const teamCode = searchParams.get('team');
      
      if (teamCode) {
        // This is a team invitation - create a team-linked assessment
        console.log('Creating team-linked assessment for team:', teamCode);
        
        // Create assessment in database with team link
        const response = await fetch('/api/assessments/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Team Assessment',
            description: 'Assessment for team collaboration and culture fit',
            type: 'team',
            createdBy: `team-invite-${Date.now()}`, // Will be updated when user provides info
            teamId: teamCode
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Team assessment creation failed:', response.status, errorText);
          throw new Error(`Failed to create team assessment: ${response.status}`);
        }

        const data = await response.json();
        console.log('Team assessment created:', data);

        if (data.success && data.assessment) {
          // Store team info in localStorage
          localStorage.setItem(`team-assessment-${data.assessment.id}`, JSON.stringify({
            teamCode,
            assessmentId: data.assessment.id,
            type: 'team',
            status: 'in_progress'
          }));

          // Redirect to the team assessment
          router.push(`/assessment/${data.assessment.id}`);
          return;
        } else {
          throw new Error('Failed to create team assessment: Invalid response');
        }
      }

      // Create individual assessment in database
      console.log('Creating individual assessment in database');
      
      // Create assessment in database
      const response = await fetch('/api/assessments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Individual Assessment',
          description: 'Personal assessment for individual insights',
          type: 'individual',
          createdBy: `individual-${Date.now()}`,
          teamId: null
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Individual assessment creation failed:', response.status, errorText);
        throw new Error(`Failed to create individual assessment: ${response.status}`);
      }

      const data = await response.json();
      console.log('Individual assessment created:', data);

      if (data.success && data.assessment) {
        // Store assessment info in localStorage for tracking progress
        localStorage.setItem(`assessment-session-${data.assessment.id}`, JSON.stringify({
          assessmentId: data.assessment.id,
          createdAt: new Date().toISOString(),
          type: 'individual',
          status: 'in_progress'
        }));

        // Redirect to the assessment overview page
        router.push(`/assessment/${data.assessment.id}`);
        return;
      } else {
        throw new Error('Failed to create individual assessment: Invalid response');
      }
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
          <p className="text-gray-600">
            {searchParams.get('team') 
              ? 'Setting up your team assessment...' 
              : 'Setting up your personalized personality assessment...'
            }
          </p>
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
        <p className="text-gray-600 mt-4">
          {searchParams.get('team') 
            ? 'Redirecting to your team assessment...' 
            : 'Redirecting to your assessment...'
          }
        </p>
      </div>
    </div>
  );
}
