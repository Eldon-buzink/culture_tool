'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, ChevronRight, Clock, Brain, Globe, Target, CheckCircle } from 'lucide-react';

type Question = {
  id: string;
  text: string;
  section: string;
  subsection: string;
  reverse_scored: boolean;
  trait_axis: string;
};

type SectionExplanation = {
  title: string;
  description: string;
  outcome: string;
};

type SectionExplanations = {
  ocean: SectionExplanation;
  culture: SectionExplanation;
  values: SectionExplanation;
};

export default function AssessmentPage() {
  const { uuid } = useParams();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sectionExplanations, setSectionExplanations] = useState<SectionExplanations | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentSection, setCurrentSection] = useState<'ocean' | 'culture' | 'values'>('ocean');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSectionIntro, setShowSectionIntro] = useState(true);

  const sections = ['ocean', 'culture', 'values'] as const;
  const sectionIcons = {
    ocean: Brain,
    culture: Globe,
    values: Target,
  };

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      const res = await fetch(`/api/get-ocean-questions`);
      const data = await res.json();
      setQuestions(data.questions);
      setSectionExplanations(data.sectionExplanations);
      setLoading(false);
    }

    fetchQuestions();
  }, []);

  // Handle redirect after submission
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        window.location.href = `/assessment/${uuid}/results`;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [submitted, uuid]);

  const handleChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const getCurrentSectionQuestions = () => {
    return questions.filter(q => q.section === currentSection);
  };

  const getCurrentQuestion = () => {
    const sectionQuestions = getCurrentSectionQuestions();
    return sectionQuestions[currentQuestionIndex];
  };

  const getSectionProgress = (section: string) => {
    const sectionQuestions = questions.filter(q => q.section === section);
    const answeredQuestions = sectionQuestions.filter(q => answers[q.id] !== undefined);
    return (answeredQuestions.length / sectionQuestions.length) * 100;
  };

  const getOverallProgress = () => {
    const answeredQuestions = questions.filter(q => answers[q.id] !== undefined);
    return (answeredQuestions.length / questions.length) * 100;
  };

  const handleNext = () => {
    const sectionQuestions = getCurrentSectionQuestions();
    if (currentQuestionIndex < sectionQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Move to next section
      const currentSectionIndex = sections.indexOf(currentSection);
      if (currentSectionIndex < sections.length - 1) {
        const nextSection = sections[currentSectionIndex + 1];
        setCurrentSection(nextSection);
        setCurrentQuestionIndex(0);
        setShowSectionIntro(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      // Move to previous section
      const currentSectionIndex = sections.indexOf(currentSection);
      if (currentSectionIndex > 0) {
        const prevSection = sections[currentSectionIndex - 1];
        const prevSectionQuestions = questions.filter(q => q.section === prevSection);
        setCurrentSection(prevSection);
        setCurrentQuestionIndex(prevSectionQuestions.length - 1);
        setShowSectionIntro(false);
      }
    }
  };

  const handleStartSection = () => {
    setShowSectionIntro(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await fetch('/api/submit-ocean-responses', {
      method: 'POST',
      body: JSON.stringify({
        uuid,
        responses: answers,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  const currentQuestion = getCurrentQuestion();
  const sectionQuestions = getCurrentSectionQuestions();
  const isLastQuestion = currentQuestionIndex === sectionQuestions.length - 1;
  const isLastSection = currentSection === 'values';
  const canProceed = currentQuestion ? answers[currentQuestion.id] !== undefined : false;
  const overallProgress = getOverallProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your comprehensive assessment...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Complete! 🎉</h2>
            <p className="text-gray-600 mb-6">
              Thanks for completing the comprehensive assessment. You're one step closer to understanding your complete work profile! 🧠
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Next:</strong> Redirecting you to your personalized results...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show section introduction
  if (showSectionIntro && sectionExplanations) {
    const IconComponent = sectionIcons[currentSection];
    const explanation = sectionExplanations[currentSection];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <IconComponent className="h-6 w-6 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Comprehensive Assessment</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Let's explore your complete work profile through three key dimensions
            </p>
          </div>

          {/* Section Progress */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-900">Overall Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {Math.round(overallProgress)}% Complete
              </span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            
            {/* Section indicators */}
            <div className="flex justify-center mt-4 gap-4">
              {sections.map((section, index) => {
                const Icon = sectionIcons[section];
                const progress = getSectionProgress(section);
                const isActive = section === currentSection;
                const isCompleted = progress === 100;
                
                return (
                  <div key={section} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      isCompleted ? 'bg-green-100 text-green-600' :
                      isActive ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs text-gray-600 capitalize">{section}</span>
                    <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
                      <div 
                        className={`h-1 rounded-full ${
                          isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section Introduction */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <IconComponent className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{explanation.title}</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">{explanation.description}</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">What you'll discover:</h3>
                <p className="text-blue-800">{explanation.outcome}</p>
              </div>

              <div className="text-center">
                <Button 
                  onClick={handleStartSection}
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                >
                  Start {explanation.title}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Comprehensive Assessment</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Answer honestly — there are no wrong answers here. Just strong opinions and quiet overthinkers 😅
          </p>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~15 min
              </Badge>
              <span className="text-sm text-gray-600">
                {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}: Question {currentQuestionIndex + 1} of {sectionQuestions.length}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {Math.round(overallProgress)}% Complete
            </span>
          </div>
          <Progress value={overallProgress} className="h-3" />
          
          {/* Section indicators */}
          <div className="flex justify-center mt-4 gap-4">
            {sections.map((section, index) => {
              const Icon = sectionIcons[section];
              const progress = getSectionProgress(section);
              const isActive = section === currentSection;
              const isCompleted = progress === 100;
              
              return (
                <div key={section} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                    isCompleted ? 'bg-green-100 text-green-600' :
                    isActive ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-gray-600 capitalize">{section}</span>
                  <div className="w-12 h-1 bg-gray-200 rounded-full mt-1">
                    <div 
                      className={`h-1 rounded-full ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            {currentQuestion && (
              <div className="space-y-6">
                {/* Question Header */}
                <div className="text-center">
                  <Badge variant="outline" className="mb-3">
                    {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
                  </Badge>
                  <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                    {currentQuestion.text}
                  </h2>
                </div>

                {/* Scale Labels */}
                <div className="flex justify-between text-xs text-gray-500 mb-4">
                  <span>Strongly Disagree</span>
                  <span>Strongly Agree</span>
                </div>

                {/* Radio Buttons */}
                <RadioGroup
                  value={answers[currentQuestion.id]?.toString() || ''}
                  onValueChange={(val) => handleChange(currentQuestion.id, parseInt(val))}
                  className="flex justify-between gap-2"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((val) => (
                    <div key={val} className="flex flex-col items-center">
                      <RadioGroupItem 
                        value={val.toString()} 
                        className="h-6 w-6 border-2 border-gray-300 hover:border-blue-500 transition-colors"
                      />
                      <span className="mt-2 text-sm font-medium text-gray-700">{val}</span>
                    </div>
                  ))}
                </RadioGroup>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0 && currentSection === 'ocean'}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {isLastQuestion && isLastSection ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={!canProceed || submitting}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Complete Assessment
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Question Navigation Dots */}
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            {sectionQuestions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600'
                    : answers[sectionQuestions[index]?.id]
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
                aria-label={`Go to question ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
