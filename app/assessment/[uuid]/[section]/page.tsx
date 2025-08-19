'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Brain, Users, Target, ArrowLeft, CheckCircle } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  section: 'ocean' | 'culture' | 'values';
  subsection: string;
}

interface SectionConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const sectionConfigs: Record<string, SectionConfig> = {
  ocean: {
    title: 'OCEAN Personality Assessment',
    description: 'This section measures your personality traits across five dimensions: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.',
    icon: <Brain className="w-6 h-6" />,
    color: 'bg-blue-500'
  },
  culture: {
    title: 'Cultural Dimensions',
    description: 'This section explores your cultural preferences and work environment expectations.',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-green-500'
  },
  values: {
    title: 'Work Values Assessment',
    description: 'This section identifies your core work values and what motivates you professionally.',
    icon: <Target className="w-6 h-6" />,
    color: 'bg-purple-500'
  }
};

// Mock questions for each section
const mockQuestions: Record<string, Question[]> = {
  ocean: [
    { id: 'ocean_1', text: 'I am the life of the party', section: 'ocean', subsection: 'extraversion' },
    { id: 'ocean_2', text: 'I sympathize with others\' feelings', section: 'ocean', subsection: 'agreeableness' },
    { id: 'ocean_3', text: 'I get chores done right away', section: 'ocean', subsection: 'conscientiousness' },
    { id: 'ocean_4', text: 'I have frequent mood swings', section: 'ocean', subsection: 'neuroticism' },
    { id: 'ocean_5', text: 'I have a vivid imagination', section: 'ocean', subsection: 'openness' },
  ],
  culture: [
    { id: 'culture_1', text: 'I prefer clear hierarchies and respect for authority in the workplace', section: 'culture', subsection: 'power_distance' },
    { id: 'culture_2', text: 'I believe everyone should have equal say in decisions, regardless of position', section: 'culture', subsection: 'power_distance' },
    { id: 'culture_3', text: 'I work best when I can focus on my individual tasks and achievements', section: 'culture', subsection: 'individualism' },
    { id: 'culture_4', text: 'I prefer working as part of a team and sharing collective success', section: 'culture', subsection: 'individualism' },
    { id: 'culture_5', text: 'I enjoy competitive environments where I can prove my abilities', section: 'culture', subsection: 'masculinity' },
  ],
  values: [
    { id: 'values_1', text: 'I prefer trying new approaches and innovative solutions', section: 'values', subsection: 'innovation' },
    { id: 'values_2', text: 'I prefer proven methods and stable, reliable processes', section: 'values', subsection: 'innovation' },
    { id: 'values_3', text: 'I believe success comes from working together as a team', section: 'values', subsection: 'collaboration' },
    { id: 'values_4', text: 'I believe success comes from individual excellence and competition', section: 'values', subsection: 'collaboration' },
    { id: 'values_5', text: 'I prefer having freedom to work in my own way', section: 'values', subsection: 'autonomy' },
  ]
};

export default function SectionPage() {
  const params = useParams();
  const router = useRouter();
  const sectionId = params.section as string;
  const uuid = params.uuid as string;
  
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [questions] = useState<Question[]>(mockQuestions[sectionId] || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sectionConfig = sectionConfigs[sectionId];

  useEffect(() => {
    // Load existing responses from localStorage
    const savedResponses = localStorage.getItem(`section-responses-${uuid}-${sectionId}`);
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
    }
  }, [uuid, sectionId]);

  const handleResponse = (questionId: string, value: number) => {
    const newResponses = {
      ...responses,
      [questionId]: value
    };
    setResponses(newResponses);
    
    // Save to localStorage
    localStorage.setItem(`section-responses-${uuid}-${sectionId}`, JSON.stringify(newResponses));
  };

  const getProgress = () => {
    const answeredQuestions = Object.keys(responses).length;
    return questions.length > 0 ? (answeredQuestions / questions.length) * 100 : 0;
  };

  const canComplete = () => {
    return questions.every(q => responses[q.id] !== undefined);
  };

  const handleCompleteSection = async () => {
    if (!canComplete()) return;

    setIsSubmitting(true);
    
    try {
      // Save progress to localStorage
      const progress = {
        [sectionId]: {
          progress: 100,
          completed: true,
          responses: responses
        }
      };
      
      const existingProgress = localStorage.getItem(`assessment-progress-${uuid}`);
      const allProgress = existingProgress ? JSON.parse(existingProgress) : {};
      const updatedProgress = { ...allProgress, ...progress };
      
      localStorage.setItem(`assessment-progress-${uuid}`, JSON.stringify(updatedProgress));
      
      // Navigate to thank you page
      router.push(`/assessment/${uuid}/${sectionId}/complete`);
    } catch (error) {
      console.error('Error completing section:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToOverview = () => {
    router.push(`/assessment/${uuid}`);
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
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={handleBackToOverview}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-lg ${sectionConfig.color} text-white`}>
              {sectionConfig.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{sectionConfig.title}</h1>
              <p className="text-gray-600">{sectionConfig.description}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Section Progress</span>
              <span>{Math.round(getProgress())}%</span>
            </div>
            <Progress value={getProgress()} className="h-3" />
            <p className="text-sm text-gray-500 mt-2">
              {Object.keys(responses).length} of {questions.length} questions answered
            </p>
          </div>
        </div>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {questions.length > 0 ? (
              <div className="space-y-8">
                {questions.map((question, questionIndex) => (
                  <div key={question.id} className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                        {questionIndex + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">
                          {question.text}
                        </h3>
                        
                        <RadioGroup
                          value={responses[question.id]?.toString() || ''}
                          onValueChange={(value: string) => handleResponse(question.id, parseInt(value))}
                          className="space-y-3"
                        >
                          {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                            <div key={value} className="flex items-center space-x-3">
                              <RadioGroupItem value={value.toString()} id={`q${question.id}-${value}`} />
                              <label htmlFor={`q${question.id}-${value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {value} - {value === 1 ? 'Strongly Disagree' : value === 4 ? 'Neutral' : value === 7 ? 'Strongly Agree' : ''}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                    
                    {questionIndex < questions.length - 1 && (
                      <Separator className="my-6" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No questions available for this section.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complete Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleCompleteSection}
            disabled={!canComplete() || isSubmitting}
            size="lg"
            className="bg-green-600 hover:bg-green-700 px-8 py-3"
          >
            {isSubmitting ? (
              'Completing...'
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Section
              </>
            )}
          </Button>
          
          {!canComplete() && (
            <p className="text-sm text-gray-500 mt-2">
              Please answer all questions before completing this section
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
