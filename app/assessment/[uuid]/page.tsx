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
    // Load progress from localStorage or API
    const loadProgress = () => {
      const savedProgress = localStorage.getItem(`assessment-progress-${params.uuid}`);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setSections(prev => prev.map(section => ({
          ...section,
          progress: progress[section.id]?.progress || 0,
          completed: progress[section.id]?.completed || false
        })));
      }
    };

    loadProgress();
    
    // Set up interval to check for progress updates
    const interval = setInterval(loadProgress, 1000);
    
    return () => clearInterval(interval);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Personality Assessment</h1>
          <p className="text-gray-600">Complete all sections to get your comprehensive results</p>
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
                        <span>{Math.round(section.progress)}% complete</span>
                      </div>
                      <Progress value={section.progress} className="h-2" />
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

        {/* Submit Button */}
        {canSubmit() && (
          <div className="text-center">
            <Button
              onClick={handleSubmitAssessment}
              size="lg"
              className="bg-green-600 hover:bg-green-700 px-8 py-3"
            >
              Submit Assessment
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              All sections completed! You can now submit your assessment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
