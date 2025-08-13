'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  category: string;
  options: Array<{
    value: number;
    label: string;
  }>;
}

interface AssessmentFormProps {
  questions: Question[];
  answers: Record<string, number>;
  onAnswer: (questionId: string, value: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function AssessmentForm({
  questions,
  answers,
  onAnswer,
  onSubmit,
  isSubmitting,
}: AssessmentFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = questions[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerChange = (value: string) => {
    onAnswer(currentQuestion.id, parseInt(value));
  };

  const progress = (Object.keys(answers).length / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canSubmit = Object.keys(answers).length === questions.length;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Question Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">{currentQuestion.text}</h3>
              <p className="text-sm text-muted-foreground">
                Category: {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)}
              </p>
            </div>

            <RadioGroup
              value={answers[currentQuestion.id]?.toString() || ''}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {currentQuestion.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value.toString()} id={`q${currentQuestion.id}-${option.value}`} />
                  <Label htmlFor={`q${currentQuestion.id}-${option.value}`} className="text-sm cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {isLastQuestion ? (
          <Button
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Question Navigation Dots */}
      <div className="flex justify-center space-x-2">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestionIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentQuestionIndex
                ? 'bg-primary'
                : answers[questions[index].id]
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
            aria-label={`Go to question ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
