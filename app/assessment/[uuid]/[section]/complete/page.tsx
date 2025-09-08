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
    console.log('Calculating OCEAN scores from responses:', responses);
    
    // Map question IDs to OCEAN dimensions
    const oceanMapping: Record<string, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'> = {
      // Extraversion questions
      'ocean_1': 'extraversion',      // 'I am the life of the party'
      'ocean_6': 'extraversion',      // 'I don\'t talk a lot' (reverse scored)
      'ocean_11': 'extraversion',     // 'I talk to a lot of different people at parties'
      'ocean_16': 'extraversion',     // 'I keep in the background' (reverse scored)
      'ocean_21': 'extraversion',     // 'I start conversations'
      'ocean_26': 'extraversion',     // 'I have little to say' (reverse scored)
      'ocean_31': 'extraversion',     // 'I am quiet around strangers' (reverse scored)
      'ocean_36': 'extraversion',     // 'I get energized by social interactions'
      
      // Agreeableness questions
      'ocean_2': 'agreeableness',     // 'I sympathize with others\' feelings'
      'ocean_7': 'agreeableness',     // 'I am not interested in other people\'s problems' (reverse scored)
      'ocean_12': 'agreeableness',    // 'I feel others\' emotions'
      'ocean_17': 'agreeableness',    // 'I am not really interested in others' (reverse scored)
      'ocean_22': 'agreeableness',    // 'I insult people' (reverse scored)
      'ocean_27': 'agreeableness',    // 'I am concerned about others'
      'ocean_32': 'agreeableness',    // 'I am helpful and unselfish with others'
      'ocean_37': 'agreeableness',    // 'I am sometimes rude to others' (reverse scored)
      
      // Conscientiousness questions
      'ocean_3': 'conscientiousness', // 'I get chores done right away'
      'ocean_8': 'conscientiousness', // 'I often forget to put things back in their proper place' (reverse scored)
      'ocean_13': 'conscientiousness',// 'I like order'
      'ocean_18': 'conscientiousness',// 'I make a mess of things' (reverse scored)
      'ocean_23': 'conscientiousness',// 'I get chores done right away'
      'ocean_28': 'conscientiousness',// 'I often forget to put things back in their proper place' (reverse scored)
      'ocean_33': 'conscientiousness',// 'I like order'
      'ocean_38': 'conscientiousness',// 'I make a mess of things' (reverse scored)
      
      // Neuroticism questions
      'ocean_4': 'neuroticism',       // 'I have frequent mood swings'
      'ocean_9': 'neuroticism',       // 'I am relaxed most of the time' (reverse scored)
      'ocean_14': 'neuroticism',      // 'I get upset easily'
      'ocean_19': 'neuroticism',      // 'I am not easily bothered by things' (reverse scored)
      'ocean_24': 'neuroticism',      // 'I worry about things'
      'ocean_29': 'neuroticism',      // 'I am easily disturbed'
      'ocean_34': 'neuroticism',      // 'I get stressed out easily'
      'ocean_39': 'neuroticism',      // 'I am not easily frustrated' (reverse scored)
      
      // Openness questions
      'ocean_5': 'openness',          // 'I have a vivid imagination'
      'ocean_10': 'openness',         // 'I am not interested in abstract ideas' (reverse scored)
      'ocean_15': 'openness',         // 'I have excellent ideas'
      'ocean_20': 'openness',         // 'I have a rich vocabulary'
      'ocean_25': 'openness',         // 'I have difficulty understanding abstract ideas' (reverse scored)
      'ocean_30': 'openness',         // 'I have a vivid imagination'
      'ocean_35': 'openness',         // 'I am not interested in abstract ideas' (reverse scored)
      'ocean_40': 'openness'          // 'I have excellent ideas'
    };
    
    const scores = { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 };
    const counts = { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 };
    
    Object.entries(responses).forEach(([questionId, response]) => {
      const dimension = oceanMapping[questionId];
      if (dimension) {
        // Handle reverse-scored questions (1-5 scale becomes 5-1)
        let adjustedResponse = response;
        const reverseScoredQuestions = ['ocean_6', 'ocean_7', 'ocean_8', 'ocean_9', 'ocean_10', 'ocean_16', 'ocean_17', 'ocean_18', 'ocean_19', 'ocean_22', 'ocean_25', 'ocean_26', 'ocean_27', 'ocean_28', 'ocean_31', 'ocean_32', 'ocean_33', 'ocean_34', 'ocean_35', 'ocean_36', 'ocean_37', 'ocean_38', 'ocean_39'];
        if (reverseScoredQuestions.includes(questionId)) {
          adjustedResponse = 6 - response; // Convert 1->5, 2->4, 3->3, 4->2, 5->1
        }
        
        scores[dimension] += adjustedResponse;
        counts[dimension]++;
      }
    });
    
    // Calculate averages and convert to percentage (0-100)
    Object.keys(scores).forEach(dimension => {
      const key = dimension as keyof typeof scores;
      if (counts[key] > 0) {
        scores[key] = Math.round((scores[key] / counts[key]) * 20); // Convert 1-5 scale to 0-100
      }
    });
    
    console.log('Final OCEAN scores:', scores);
    return scores;
  };

  const calculateCultureScores = (responses: Record<string, number>) => {
    // For now, generate culture scores based on OCEAN scores
    const oceanScores = calculateOceanScores(responses);
    
    const scores = { 
      powerDistance: Math.round(50 + (oceanScores.conscientiousness - 50) * 0.3 + (oceanScores.neuroticism - 50) * 0.2), 
      individualism: Math.round(50 + (oceanScores.extraversion - 50) * 0.4 + (oceanScores.openness - 50) * 0.3), 
      masculinity: Math.round(50 + (oceanScores.extraversion - 50) * 0.3 + (oceanScores.agreeableness - 50) * -0.2), 
      uncertaintyAvoidance: Math.round(50 + (oceanScores.conscientiousness - 50) * 0.4 + (oceanScores.neuroticism - 50) * 0.3), 
      longTermOrientation: Math.round(50 + (oceanScores.conscientiousness - 50) * 0.5 + (oceanScores.openness - 50) * 0.2), 
      indulgence: Math.round(50 + (oceanScores.extraversion - 50) * 0.3 + (oceanScores.neuroticism - 50) * -0.4) 
    };
    
    // Ensure scores are within 0-100 range
    Object.keys(scores).forEach(key => {
      scores[key as keyof typeof scores] = Math.max(0, Math.min(100, scores[key as keyof typeof scores]));
    });
    
    return scores;
  };

  const calculateValuesScores = (responses: Record<string, number>) => {
    // For now, generate values scores based on OCEAN scores
    const oceanScores = calculateOceanScores(responses);
    
    const scores = { 
      innovation: Math.round(50 + (oceanScores.openness - 50) * 0.6 + (oceanScores.extraversion - 50) * 0.2), 
      collaboration: Math.round(50 + (oceanScores.agreeableness - 50) * 0.5 + (oceanScores.extraversion - 50) * 0.3), 
      autonomy: Math.round(50 + (oceanScores.extraversion - 50) * -0.2 + (oceanScores.conscientiousness - 50) * 0.4), 
      quality: Math.round(50 + (oceanScores.conscientiousness - 50) * 0.6 + (oceanScores.neuroticism - 50) * 0.2), 
      customerFocus: Math.round(50 + (oceanScores.agreeableness - 50) * 0.4 + (oceanScores.extraversion - 50) * 0.3) 
    };
    
    // Ensure scores are within 0-100 range
    Object.keys(scores).forEach(key => {
      scores[key as keyof typeof scores] = Math.max(0, Math.min(100, scores[key as keyof typeof scores]));
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
