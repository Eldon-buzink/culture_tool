'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Brain, Users, Target, ArrowLeft, CheckCircle, ArrowRight, ArrowLeft as ArrowLeftIcon } from 'lucide-react';

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sectionConfig = sectionConfigs[sectionId];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredQuestions = Object.keys(responses).length;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  useEffect(() => {
    // Ensure session user ID exists
    let sessionUserId = localStorage.getItem(`assessment-user-${uuid}`);
    if (!sessionUserId) {
      sessionUserId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(`assessment-user-${uuid}`, sessionUserId);
      console.log('Created new session userId:', sessionUserId);
    }
    
    // Load existing responses from localStorage
    const savedResponses = localStorage.getItem(`section-responses-${uuid}-${sectionId}`);
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
    }
  }, [uuid, sectionId]);

  const handleResponse = async (questionId: string, value: number) => {
    const newResponses = {
      ...responses,
      [questionId]: value
    };
    setResponses(newResponses);
    
    // Save to localStorage for immediate UI update
    localStorage.setItem(`section-responses-${uuid}-${sectionId}`, JSON.stringify(newResponses));
    
    // Save to database
    try {
      const userId = localStorage.getItem(`assessment-user-${uuid}`) || `session-${Date.now()}`;
      console.log('Saving response with userId:', userId);
      
      const response = await fetch(`/api/assessments/${uuid}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          section: sectionId,
          questionId,
          response: value
        }),
      });
      
      if (response.ok) {
        // Trigger storage event to update progress on overview page
        const event = new Event('storage');
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const [showCompletionChoice, setShowCompletionChoice] = useState(false);

  const handleSubmit = async () => {
    if (answeredQuestions < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save all responses
      const allResponses = localStorage.getItem(`assessment-responses-${uuid}`) || '{}';
      const existingResponses = JSON.parse(allResponses);
      const updatedResponses = {
        ...existingResponses,
        [sectionId]: responses
      };
      
      localStorage.setItem(`assessment-responses-${uuid}`, JSON.stringify(updatedResponses));
      
      // Trigger storage event to update overview page
      window.dispatchEvent(new Event('storage'));
      
      // Check what sections are complete
      const allSections = ['ocean', 'culture', 'values'];
      const completedSections = [];
      
      for (const section of allSections) {
        const sectionResponses = updatedResponses[section] || {};
        if (Object.keys(sectionResponses).length >= 5) {
          completedSections.push(section);
        }
      }
      
      // If all sections are complete, go to results
      if (completedSections.length === 3) {
        router.push(`/assessment/${uuid}/results`);
        return;
      }
      
      // Show completion choice instead of auto-navigating
      setShowCompletionChoice(true);
      
    } catch (error) {
      console.error('Error submitting responses:', error);
      alert('Error submitting responses. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToOverview = () => {
    router.push(`/assessment/${uuid}`);
  };

  const handleGoToNextSection = () => {
    const allSections = ['ocean', 'culture', 'values'];
    const allResponses = localStorage.getItem(`assessment-responses-${uuid}`) || '{}';
    const existingResponses = JSON.parse(allResponses);
    
    // Find next incomplete section
    const nextIncompleteSection = allSections.find(section => {
      const sectionResponses = existingResponses[section] || {};
      return Object.keys(sectionResponses).length < 5;
    });
    
    if (nextIncompleteSection) {
      router.push(`/assessment/${uuid}/${nextIncompleteSection}`);
    } else {
      // Fallback to overview page
      router.push(`/assessment/${uuid}`);
    }
  };

  if (!sectionConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Section Not Found</h2>
          <p className="text-gray-600">The requested assessment section does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push(`/assessment/${uuid}`)}
            className="mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${sectionConfig.color}`}>
              {sectionConfig.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{sectionConfig.title}</h1>
              <p className="text-gray-600">{sectionConfig.description}</p>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Section Progress</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-gray-500">
              {answeredQuestions} of {questions.length} questions answered
            </p>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium">
                  {currentQuestionIndex + 1}
                </span>
                <span className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</span>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {currentQuestion.text}
              </h2>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Strongly Disagree</span>
                  <span>Strongly Agree</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <RadioGroup
                value={responses[currentQuestion.id]?.toString() || ''}
                onValueChange={(value) => handleResponse(currentQuestion.id, parseInt(value))}
                className="grid grid-cols-7 gap-2"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <div key={value} className="flex flex-col items-center space-y-2">
                    <RadioGroupItem value={value.toString()} id={`${currentQuestion.id}-${value}`} />
                    <label 
                      htmlFor={`${currentQuestion.id}-${value}`} 
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-center"
                    >
                      {value}
                    </label>
                    <div className="text-xs text-gray-500 text-center">
                      {value === 1 ? 'Strongly Disagree' : 
                       value === 2 ? 'Disagree' :
                       value === 3 ? 'Somewhat Disagree' :
                       value === 4 ? 'Neutral' :
                       value === 5 ? 'Somewhat Agree' :
                       value === 6 ? 'Agree' :
                       'Strongly Agree'}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

                 {/* Navigation Buttons */}
         <div className="flex justify-between items-center mb-8">
           <Button
             variant="outline"
             onClick={goToPreviousQuestion}
             disabled={isFirstQuestion}
             className="flex items-center gap-2 px-6 py-3"
           >
             <ArrowLeft className="h-4 w-4" />
             Previous
           </Button>

           <div className="flex gap-4">
             {!isLastQuestion ? (
               <Button
                 onClick={goToNextQuestion}
                 disabled={!responses[currentQuestion.id]}
                 className="flex items-center gap-2 px-6 py-3"
               >
                 Next
                 <ArrowRight className="h-4 w-4" />
               </Button>
             ) : (
               <Button
                 onClick={handleSubmit}
                 disabled={answeredQuestions < questions.length || isSubmitting}
                 className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700"
               >
                 {isSubmitting ? (
                   <>
                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     Submitting...
                   </>
                 ) : (
                   <>
                     Complete Section
                     <ArrowRight className="h-4 w-4" />
                   </>
                 )}
               </Button>
             )}
           </div>
         </div>

         {/* Completion Choice Modal */}
         {showCompletionChoice && (
           <Card className="mb-8 border-green-200 bg-green-50">
             <CardContent className="pt-6">
               <div className="text-center">
                 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                   </svg>
                 </div>
                 <h3 className="text-xl font-semibold text-green-900 mb-2">Section Complete! 🎉</h3>
                 <p className="text-green-700 mb-6">You've successfully completed the {sectionConfig.title} section. What would you like to do next?</p>
                 
                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <Button
                     onClick={handleGoToOverview}
                     variant="outline"
                     className="border-green-300 text-green-700 hover:bg-green-100 px-6 py-3"
                   >
                     <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                     </svg>
                     Go to Overview
                   </Button>
                   
                   <Button
                     onClick={handleGoToNextSection}
                     className="bg-green-600 hover:bg-green-700 px-6 py-3"
                   >
                     <ArrowRight className="h-4 w-4 mr-2" />
                     Continue to Next Section
                   </Button>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}

        {/* Progress Info */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            You've answered {answeredQuestions} out of {questions.length} questions in this section.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Complete all questions to finish this section and return to the overview.
          </p>
        </div>
      </div>
    </div>
  );
}
