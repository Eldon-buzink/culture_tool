'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Brain, Globe, ArrowRight } from 'lucide-react';

interface TeamInfo {
  name: string;
  code: string;
  description?: string;
}

export default function CandidateAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const teamCode = params.teamCode as string;
  
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    // For now, we'll use mock data since we haven't built the team API yet
    // In production, this would fetch from the database
    setTeamInfo({
      name: 'Your Team',
      code: teamCode,
      description: 'Join our team and discover your cultural fit!'
    });
    setIsLoading(false);
  }, [teamCode]);

  const handleStartAssessment = async () => {
    setIsStarting(true);
    
    // Create a new candidate assessment session and start immediately
    try {
      const response = await fetch('/api/assessments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'candidate',
          teamCode: teamCode,
          createdBy: `candidate-${Date.now()}`, // Temporary ID for candidates
          metadata: {
            isCandidate: true,
            teamCode: teamCode,
            assessmentType: 'candidate'
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Candidate assessment created successfully:', data);
        
        if (data.id) {
          // Redirect directly to the first section of the assessment
          router.push(`/assessment/${data.id}/ocean`);
        } else {
          console.error('No assessment ID returned:', data);
          // Fallback: redirect to regular assessment with candidate flag
          router.push(`/assessment/new?team=${teamCode}&candidate=true`);
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to create candidate assessment:', response.status, errorText);
        // Fallback: redirect to regular assessment with candidate flag
        router.push(`/assessment/new?team=${teamCode}&candidate=true`);
      }
    } catch (error) {
      console.error('Error creating candidate assessment:', error);
      // Fallback: redirect to redirect to regular assessment with candidate flag
      router.push(`/assessment/new?team=${teamCode}&candidate=true`);
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidate assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Your Team Assessment
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're excited to learn more about you and see how you might fit with our team culture.
          </p>
        </div>

        {/* Team Info Card */}
        <Card className="mb-8">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              {teamInfo?.name}
            </CardTitle>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-sm text-gray-500">Team Code:</span>
              <Badge variant="outline" className="font-mono">{teamInfo?.code}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-center text-gray-600">
              {teamInfo?.description}
            </p>
          </CardContent>
        </Card>

        {/* What You'll Discover */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              What You'll Discover
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Your Cultural Profile</h3>
                <p className="text-sm text-gray-600">
                  Understand your work style, communication preferences, and decision-making approach
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Team Compatibility</h3>
                <p className="text-sm text-gray-600">
                  See how your profile aligns with the existing team dynamics and culture
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Growth Opportunities</h3>
                <p className="text-sm text-gray-600">
                  Identify areas where you can contribute and grow within the team
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Assessment Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Complete the Assessment</h4>
                  <p className="text-sm text-gray-600">
                    Answer questions about your work preferences, communication style, and values
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Get Your Results</h4>
                  <p className="text-sm text-gray-600">
                    Receive a detailed analysis of your cultural profile and team fit
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Team Review</h4>
                  <p className="text-sm text-gray-600">
                    The team will review your results and provide feedback on cultural fit
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button 
            onClick={handleStartAssessment}
            disabled={isStarting}
            size="lg"
            className="px-8 py-3 text-lg"
          >
            {isStarting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Starting Assessment...
              </>
            ) : (
              <>
                Start Your Assessment
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
          <p className="text-sm text-gray-500 mt-3">
            This assessment takes approximately 15-20 minutes to complete
          </p>
        </div>

        {/* Important Message */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-2xl mx-auto mt-6">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-600 text-sm font-bold">!</span>
            </div>
            <div className="text-center">
              <p className="font-medium text-amber-900 mb-1">Important: Be Honest & Authentic</p>
              <p className="text-sm text-amber-800">
                There are <strong>no right or wrong answers</strong>. Please answer based on your true preferences and values, 
                not what you think we want to hear. Authentic responses help us understand the real you and ensure 
                the best cultural fit for both you and our team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
