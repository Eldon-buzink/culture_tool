'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Brain, Users, Target, ArrowRight, ArrowLeft } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  section: 'ocean' | 'culture' | 'values';
  subsection: string;
}

interface SectionExplanation {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const sectionExplanations: Record<string, SectionExplanation> = {
  ocean: {
    title: 'OCEAN Personality Assessment',
    description: 'This section measures your personality traits across five dimensions: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism. Understanding these traits helps identify your work style, communication preferences, and how you interact with others.',
    icon: <Brain className="w-6 h-6" />,
    color: 'bg-blue-500'
  },
  culture: {
    title: 'Cultural Dimensions',
    description: 'This section explores your cultural preferences and work environment expectations. We assess dimensions like power distance, individualism, and uncertainty avoidance to understand how you prefer to work within organizational structures.',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-green-500'
  },
  values: {
    title: 'Work Values Assessment',
    description: 'This section identifies your core work values and what motivates you professionally. Understanding your values helps align your career choices with what truly matters to you.',
    icon: <Target className="w-6 h-6" />,
    color: 'bg-purple-500'
  }
};

const sections = ['ocean', 'culture', 'values'];

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    initializeAssessment();
  }, []);

  const initializeAssessment = async () => {
    try {
      // Create or get user
      const userResponse = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Anonymous User',
          email: `user-${Date.now()}@example.com`
        })
      });
      
      if (!userResponse.ok) throw new Error('Failed to create user');
      const userData = await userResponse.json();
      setUser(userData.user);

      // Create assessment
      const assessmentResponse = await fetch('/api/assessments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.user.id,
          teamId: params.uuid !== 'individual' ? params.uuid : null
        })
      });

      if (!assessmentResponse.ok) throw new Error('Failed to create assessment');
      const assessmentData = await assessmentResponse.json();
      setAssessmentId(assessmentData.assessmentId);

      // Fetch questions
      const questionsResponse = await fetch('/api/get-ocean-questions');
      if (!questionsResponse.ok) throw new Error('Failed to fetch questions');
      const questionsData = await questionsResponse.json();
      setQuestions(questionsData.questions);
    } catch (error) {
      console.error('Error initializing assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (questionId: string, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const getCurrentSectionQuestions = () => {
    const section = sections[currentSection];
    return questions.filter(q => q.section === section);
  };

  const getProgress = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(responses).length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  const getSectionProgress = () => {
    const sectionQuestions = getCurrentSectionQuestions();
    const answeredInSection = sectionQuestions.filter(q => responses[q.id] !== undefined).length;
    return (answeredInSection / sectionQuestions.length) * 100;
  };

  const canProceed = () => {
    const sectionQuestions = getCurrentSectionQuestions();
    return sectionQuestions.every(q => responses[q.id] !== undefined);
  };

  const canGoBack = () => {
    return currentSection > 0 || currentQuestion > 0;
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
      setCurrentQuestion(0);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      setCurrentQuestion(0);
    }
  };

  const submitAssessment = async () => {
    if (!assessmentId) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/submit-ocean-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          responses
        })
      });

      if (!response.ok) throw new Error('Failed to submit assessment');
      
      const result = await response.json();
      
      // Redirect to results page
      router.push(`/assessment/${assessmentId}/results`);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  const currentSectionKey = sections[currentSection];
  const sectionExplanation = sectionExplanations[currentSectionKey];
  const sectionQuestions = getCurrentSectionQuestions();
  const currentQuestionData = sectionQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Personality Assessment</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Section {currentSection + 1} of {sections.length}</span>
            <span>•</span>
            <span>Question {currentQuestion + 1} of {sectionQuestions.length}</span>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(getProgress())}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {/* Section Introduction */}
        {currentQuestion === 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${sectionExplanation.color} text-white`}>
                  {sectionExplanation.icon}
                </div>
                <div>
                  <CardTitle className="text-xl">{sectionExplanation.title}</CardTitle>
                  <p className="text-gray-600 mt-2">{sectionExplanation.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {sectionQuestions.length} questions in this section
                </div>
                                 <Button onClick={() => setCurrentQuestion(1)} disabled={!canProceed()}>
                   Start Section
                   <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question */}
        {currentQuestion > 0 && currentQuestion <= sectionQuestions.length && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg mb-2">
                    Question {currentQuestion} of {sectionQuestions.length}
                  </CardTitle>
                  <p className="text-gray-700 text-lg">{currentQuestionData.text}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {Math.round(getSectionProgress())}% complete
                </div>
              </div>
            </CardHeader>
            <CardContent>
                               <RadioGroup
                   value={responses[currentQuestionData.id]?.toString() || ''}
                   onValueChange={(value: string) => handleResponse(currentQuestionData.id, parseInt(value))}
                   className="space-y-4"
                 >
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <div key={value} className="flex items-center space-x-3">
                    <RadioGroupItem value={value.toString()} id={`q${currentQuestionData.id}-${value}`} />
                    <label htmlFor={`q${currentQuestionData.id}-${value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {value} - {value === 1 ? 'Strongly Disagree' : value === 4 ? 'Neutral' : value === 7 ? 'Strongly Agree' : ''}
                    </label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 1}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {currentQuestion < sectionQuestions.length ? (
                  <Button
                    onClick={() => setCurrentQuestion(prev => prev + 1)}
                    disabled={!responses[currentQuestionData.id]}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={nextSection}
                    disabled={!canProceed()}
                  >
                    Next Section
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section Navigation */}
        {currentQuestion === 0 && (
          <div className="flex justify-between">
                         <Button
               onClick={prevSection}
               disabled={!canGoBack()}
               className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
             >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Section
            </Button>

            {currentSection === sections.length - 1 ? (
              <Button
                onClick={submitAssessment}
                disabled={!canProceed() || submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? 'Submitting...' : 'Submit Assessment'}
              </Button>
            ) : (
              <Button
                onClick={nextSection}
                disabled={!canProceed()}
              >
                Next Section
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Section Progress */}
        <div className="mt-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Section Progress</span>
            <span>{Math.round(getSectionProgress())}%</span>
          </div>
          <Progress value={getSectionProgress()} className="h-2" />
        </div>
      </div>
    </div>
  );
}
