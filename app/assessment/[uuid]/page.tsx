'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Users, Target, CheckCircle, PlayCircle } from 'lucide-react';

interface SectionData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  progress: number;
  completed: boolean;
  questionCount: number;
  answered?: number;
}

export default function AssessmentOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const [sections, setSections] = useState<SectionData[]>([
    {
      id: 'ocean',
      title: 'OCEAN Personality Assessment',
      description: 'This section measures your personality traits across five dimensions: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism. Understanding these traits helps identify your work style, communication preferences, and how you interact with others.',
      icon: <Brain className="w-6 h-6" />,
      color: 'bg-blue-500',
      progress: 0,
      completed: false,
      questionCount: 5
    },
    {
      id: 'culture',
      title: 'Cultural Dimensions',
      description: 'This section explores your cultural preferences and work environment expectations. We assess dimensions like power distance, individualism, and uncertainty avoidance to understand how you prefer to work within organizational structures.',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500',
      progress: 0,
      completed: false,
      questionCount: 5
    },
    {
      id: 'values',
      title: 'Work Values Assessment',
      description: 'This section identifies your core work values and what motivates you professionally. Understanding your values helps align your career choices with what truly matters to you.',
      icon: <Target className="w-6 h-6" />,
      color: 'bg-purple-500',
      progress: 0,
      completed: false,
      questionCount: 5
    }
  ]);

  useEffect(() => {
    const loadAssessmentData = async () => {
      try {
        // Check if this is a session-based assessment
        const sessionData = localStorage.getItem(`assessment-session-${params.uuid}`);
        let userId;
        
        if (sessionData) {
          // This is a session-based assessment
          const session = JSON.parse(sessionData);
          userId = session.sessionId;
          localStorage.setItem(`assessment-user-${params.uuid}`, userId);
        } else {
          // Try to get the user ID from the assessment data (for database-based assessments)
          try {
            const assessmentResponse = await fetch(`/api/assessments/${params.uuid}`);
            if (assessmentResponse.ok) {
              const assessmentData = await assessmentResponse.json();
              if (assessmentData.success && assessmentData.assessment.createdBy) {
                userId = assessmentData.assessment.createdBy;
                localStorage.setItem(`assessment-user-${params.uuid}`, userId);
              }
            }
          } catch (error) {
            console.error('Error fetching assessment for userId:', error);
          }
        }

        // For session-based assessments, skip API call and use localStorage only
        if (sessionData) {
          // Calculate progress from localStorage (primary source)
          const allResponses = localStorage.getItem(`assessment-responses-${params.uuid}`) || '{}';
          const existingResponses = JSON.parse(allResponses);
          
          const sectionProgress = {
            ocean: { progress: 0, completed: false, answered: 0 },
            culture: { progress: 0, completed: false, answered: 0 },
            values: { progress: 0, completed: false, answered: 0 }
          };
          
          // Calculate progress from localStorage responses
          Object.keys(existingResponses).forEach(sectionId => {
            const sectionResponses = existingResponses[sectionId] || {};
            const answeredCount = Object.keys(sectionResponses).length;
            
            if (sectionProgress[sectionId as keyof typeof sectionProgress]) {
              sectionProgress[sectionId as keyof typeof sectionProgress].answered = answeredCount;
              sectionProgress[sectionId as keyof typeof sectionProgress].progress = (answeredCount / 5) * 100;
              sectionProgress[sectionId as keyof typeof sectionProgress].completed = answeredCount >= 5;
            }
          });
          
          setSections(prev => {
            const updatedSections = prev.map(section => {
              const sectionData = sectionProgress[section.id as keyof typeof sectionProgress];
              return {
                ...section,
                progress: sectionData?.progress || 0,
                completed: sectionData?.completed || false,
                answered: sectionData?.answered || 0
              };
            });
            
            return updatedSections;
          });
          
          return; // Exit early for session-based assessments
        }
        
        // For database-based assessments, fetch from API
        try {
          const response = await fetch(`/api/assessments?id=${params.uuid}`);
          if (response.ok) {
            const data = await response.json();
            console.log('Assessment data fetched successfully');
          }
        } catch (error) {
          console.error('Error fetching assessment data from API:', error);
        }
      } catch (error) {
        console.error('Error loading assessment data:', error);
        // Fallback to localStorage
        const savedProgress = localStorage.getItem(`assessment-progress-${params.uuid}`);
        if (savedProgress) {
          const progress = JSON.parse(savedProgress);
          setSections(prev => prev.map(section => ({
            ...section,
            progress: progress[section.id]?.progress || 0,
            completed: progress[section.id]?.completed || false
          })));
        }
      }
    };

    loadAssessmentData();
    
    // Listen for storage events to refresh progress when responses are saved
    const handleStorageChange = () => {
      loadAssessmentData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [params.uuid]);

  const getOverallProgress = () => {
    const totalSections = sections.length;
    const completedSections = sections.filter(s => s.completed).length;
    return totalSections > 0 ? (completedSections / totalSections) * 100 : 0;
  };

  const canSubmit = () => {
    return sections.every(section => section.completed);
  };

  const handleSectionClick = (sectionId: string) => {
    router.push(`/assessment/${params.uuid}/${sectionId}`);
  };

  const handleSubmitAssessment = () => {
    if (canSubmit()) {
      router.push(`/assessment/${params.uuid}/results`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Personality Assessment</h1>
              <p className="text-gray-600">Complete all sections to get your comprehensive results</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const event = new Event('storage');
                window.dispatchEvent(event);
              }}
              className="ml-4"
            >
              Refresh Progress
            </Button>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(getOverallProgress())}%</span>
          </div>
          <Progress value={getOverallProgress()} className="h-3" />
          <p className="text-sm text-gray-500 mt-2">
            {sections.filter(s => s.completed).length} of {sections.length} sections completed
          </p>
          

        </div>

        {/* Assessment Sections */}
        <div className="space-y-6 mb-8">
          {sections.map((section) => (
            <Card key={section.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${section.color} text-white`}>
                    {section.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                      {section.completed && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{section.description}</p>
                    
                    {/* Section Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{section.questionCount} questions</span>
                        <span className="font-medium">{section.answered || 0}/{section.questionCount} answered</span>
                      </div>
                      <Progress value={section.progress} className="h-2" />
                      <div className="text-xs text-gray-500 mt-1">
                        {section.completed ? (
                          <span className="text-green-600 font-medium">✓ Section Complete!</span>
                        ) : section.progress > 0 ? (
                          <span className="text-blue-600">In Progress - {Math.round(section.progress)}% complete</span>
                        ) : (
                          <span className="text-gray-500">Not started</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleSectionClick(section.id)}
                      variant={section.completed ? "outline" : "default"}
                      className={`min-w-[140px] ${
                        section.completed 
                          ? 'border-green-500 text-green-600 hover:bg-green-50' 
                          : ''
                      }`}
                    >
                      {section.completed ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Review
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4 mr-2" />
                          {section.progress > 0 ? 'Continue' : 'Start'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Submit Button or Progress Message */}
        {canSubmit() ? (
          <div className="text-center">
            <Button
              onClick={handleSubmitAssessment}
              size="lg"
              className="bg-green-600 hover:bg-green-700 px-8 py-3"
            >
              Submit Assessment & View Results
            </Button>
            <p className="text-sm text-green-600 mt-2 font-medium">
              🎉 All sections completed! You can now submit your assessment and view your results.
            </p>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm">
              💡 The "Submit Assessment & View Results" button above will become clickable once you complete all sections.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
