'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ENERGY_QUESTIONS } from '@/lib/discovery/energy/questions';
import { ENERGY_PROGRESSIVE_INSIGHTS } from '@/lib/discovery/energy/insights';
import { calculateEnergyResults } from '@/lib/discovery/energy/calculator';
import { AssessmentAnswer, ProgressiveInsight } from '@/types/discovery';
import { ArrowRight, Lightbulb, Sparkles } from 'lucide-react';

export default function ModelAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const modelSlug = params.modelSlug as string;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [insightsShown, setInsightsShown] = useState<string[]>([]);
  const [currentInsight, setCurrentInsight] = useState<ProgressiveInsight | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // For now, only Energy model is implemented
  const questions = modelSlug === 'energy' ? ENERGY_QUESTIONS : [];
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    // Check for progressive insights after each answer
    if (answers.length > 0 && answers.length >= 3) {
      checkProgressiveInsights();
    }
  }, [answers]);

  const checkProgressiveInsights = () => {
    // Find insights that should be shown but haven't been shown yet
    const insightToShow = ENERGY_PROGRESSIVE_INSIGHTS.find(insight => {
      if (insightsShown.includes(insight.id)) return false;
      if (answers.length < insight.triggerAfterQuestion) return false;
      if (insight.condition && !insight.condition(answers)) return false;
      return true;
    });

    if (insightToShow) {
      setCurrentInsight(insightToShow);
      setInsightsShown(prev => [...prev, insightToShow.id]);
    }
  };

  const handleAnswerSelect = (optionId: string) => {
    setCurrentAnswer(optionId);
  };

  const handleNext = () => {
    if (!currentAnswer || !currentQuestion) return;

    // Save answer
    const option = currentQuestion.options.find(opt => opt.id === currentAnswer);
    if (option) {
      const newAnswer: AssessmentAnswer = {
        questionId: currentQuestion.id,
        optionId: currentAnswer,
        value: option.value,
      };
      
      const newAnswers = [...answers, newAnswer];
      setAnswers(newAnswers);
      setCurrentAnswer('');

      // Check if we're done
      if (currentQuestionIndex === questions.length - 1) {
        // Calculate results and navigate to results page
        const results = calculateEnergyResults(newAnswers);
        // Store results in sessionStorage temporarily
        sessionStorage.setItem(`discovery-results-${modelSlug}`, JSON.stringify(results));
        sessionStorage.setItem(`discovery-answers-${modelSlug}`, JSON.stringify(newAnswers));
        router.push(`/discover/${modelSlug}/results`);
      } else {
        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }
  };

  const handleInsightDismiss = () => {
    setCurrentInsight(null);
  };

  const handleInsightContinue = () => {
    setCurrentInsight(null);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Model not yet implemented. Coming soon!</p>
            <Button onClick={() => router.push('/discover')} className="mt-4">
              Back to Explore
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Progressive Insight Modal */}
        {currentInsight && (
          <Card className="mb-6 border-indigo-200 bg-indigo-50/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 leading-relaxed mb-4">
                    {currentInsight.text}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleInsightContinue}
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Keep going
                    </Button>
                    <Button
                      onClick={handleInsightDismiss}
                      size="sm"
                      variant="outline"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Card */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 leading-relaxed">
              {currentQuestion.text}
            </h2>

            <RadioGroup
              value={currentAnswer}
              onValueChange={handleAnswerSelect}
              className="space-y-4"
            >
              {currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer"
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label
                    htmlFor={option.id}
                    className="flex-1 cursor-pointer text-gray-700 leading-relaxed"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Next Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!currentAnswer}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
          >
            {currentQuestionIndex === questions.length - 1 ? 'See Results' : 'Next'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
