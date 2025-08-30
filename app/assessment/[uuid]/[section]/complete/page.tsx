'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Users, Target, CheckCircle, ArrowRight, Home } from 'lucide-react';

interface SectionConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const sectionConfigs: Record<string, SectionConfig> = {
  ocean: {
    title: 'OCEAN Personality Assessment',
    description: 'Personality traits assessment completed successfully!',
    icon: <Brain className="w-8 h-8" />,
    color: 'bg-blue-500'
  },
  culture: {
    title: 'Cultural Dimensions',
    description: 'Cultural preferences assessment completed successfully!',
    icon: <Users className="w-8 h-8" />,
    color: 'bg-green-500'
  },
  values: {
    title: 'Work Values Assessment',
    description: 'Work values assessment completed successfully!',
    icon: <Target className="w-8 h-8" />,
    color: 'bg-purple-500'
  }
};

export default function SectionCompletePage() {
  const params = useParams();
  const router = useRouter();
  const sectionId = params.section as string;
  const uuid = params.uuid as string;
  
  const [allSectionsCompleted, setAllSectionsCompleted] = useState(false);
  const [completedSections, setCompletedSections] = useState(0);
  const [totalSections, setTotalSections] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sectionConfig = sectionConfigs[sectionId];

  useEffect(() => {
    // Check if all sections are completed
    const progress = localStorage.getItem(`assessment-progress-${uuid}`);
    if (progress) {
      const progressData = JSON.parse(progress);
      const completed = Object.values(progressData).filter((section: any) => section.completed).length;
      setCompletedSections(completed);
      setAllSectionsCompleted(completed === totalSections);
    }
  }, [uuid, totalSections]);

  const handleBackToOverview = () => {
    router.push(`/assessment/${uuid}`);
  };

  const handleSubmitAssessment = async () => {
    if (allSectionsCompleted) {
      setIsSubmitting(true);
      try {
        // Get all responses from localStorage
        const oceanResponses = JSON.parse(localStorage.getItem(`assessment-responses-${uuid}-ocean`) || '{}');
        const cultureResponses = JSON.parse(localStorage.getItem(`assessment-responses-${uuid}-culture`) || '{}');
        const valuesResponses = JSON.parse(localStorage.getItem(`assessment-responses-${uuid}-values`) || '{}');
        
        // Calculate scores
        const oceanScores = calculateOceanScores(oceanResponses);
        const cultureScores = calculateCultureScores(cultureResponses);
        const valuesScores = calculateValuesScores(valuesResponses);
        
        // Store results in database
        const response = await fetch(`/api/assessments/${uuid}/store-results`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            responses: {
              ocean: oceanResponses,
              culture: cultureResponses,
              values: valuesResponses
            },
            results: {
              oceanScores,
              cultureScores,
              valuesScores
            }
          }),
        });

        if (response.ok) {
          console.log('Assessment results stored successfully');
          // Redirect to results page
          router.push(`/assessment/${uuid}/results`);
        } else {
          console.error('Failed to store assessment results');
          // Still redirect to results page (it will show demo data)
          router.push(`/assessment/${uuid}/results`);
        }
      } catch (error) {
        console.error('Error storing assessment results:', error);
        // Still redirect to results page (it will show demo data)
        router.push(`/assessment/${uuid}/results`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Helper functions to calculate scores
  const calculateOceanScores = (responses: Record<string, number>) => {
    // Simple scoring logic - you can enhance this
    const scores = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0
    };
    
    // Map responses to scores (this is a simplified version)
    Object.values(responses).forEach((response, index) => {
      const keys = Object.keys(scores);
      if (keys[index]) {
        scores[keys[index] as keyof typeof scores] = Math.round((response / 5) * 100);
      }
    });
    
    return scores;
  };

  const calculateCultureScores = (responses: Record<string, number>) => {
    const scores = {
      powerDistance: 0,
      individualism: 0,
      masculinity: 0,
      uncertaintyAvoidance: 0,
      longTermOrientation: 0,
      indulgence: 0
    };
    
    Object.values(responses).forEach((response, index) => {
      const keys = Object.keys(scores);
      if (keys[index]) {
        scores[keys[index] as keyof typeof scores] = Math.round((response / 5) * 100);
      }
    });
    
    return scores;
  };

  const calculateValuesScores = (responses: Record<string, number>) => {
    const scores = {
      innovation: 0,
      collaboration: 0,
      autonomy: 0,
      quality: 0,
      customerFocus: 0
    };
    
    Object.values(responses).forEach((response, index) => {
      const keys = Object.keys(scores);
      if (keys[index]) {
        scores[keys[index] as keyof typeof scores] = Math.round((response / 5) * 100);
      }
    });
    
    return scores;
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (!sectionConfig) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Section Not Found</h1>
            <Button onClick={handleBackToOverview}>Back to Overview</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          {/* Section Icon and Title */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${sectionConfig.color} text-white`}>
              {sectionConfig.icon}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{sectionConfig.title}</h1>
          </div>

          {/* Success Message */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Section Completed Successfully!
              </h2>
              <p className="text-gray-600 mb-4">
                {sectionConfig.description}
              </p>
              
              {/* Progress Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Assessment Progress
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    {completedSections} of {totalSections} sections completed
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round((completedSections / totalSections) * 100)}%
                  </span>
                </div>
              </div>

              {allSectionsCompleted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">All sections completed!</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    You can now submit your assessment to view your comprehensive results.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700 text-sm">
                    Great job! You still have {totalSections - completedSections} section{totalSections - completedSections !== 1 ? 's' : ''} remaining.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            {allSectionsCompleted ? (
              <div className="space-y-3">
                <Button
                  onClick={handleSubmitAssessment}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 px-8 py-3 w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Submit Assessment & View Results
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleBackToOverview}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Review All Sections
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={handleBackToOverview}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3 w-full sm:w-auto"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue to Next Section
                </Button>
                <Button
                  onClick={handleGoHome}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Return to Home
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
