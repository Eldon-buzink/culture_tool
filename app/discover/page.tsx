'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Q1_OPTIONS,
  Q2_CONFIG,
  getQ2ForQ1,
  getModelFromFlow,
  type Q1OptionId,
} from '@/lib/discovery/guided-flow';
import { Brain, ArrowRight, Grid3X3 } from 'lucide-react';
import Link from 'next/link';

type Step = 'welcome' | 'q1' | 'q2';

export default function DiscoverPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const [q1Answer, setQ1Answer] = useState<Q1OptionId | null>(null);
  const [q2Answer, setQ2Answer] = useState<string | null>(null);

  const handleQ1Select = (id: Q1OptionId) => {
    setQ1Answer(id);
    const q2 = getQ2ForQ1(id);
    if (q2) {
      setStep('q2');
      setQ2Answer(null);
    } else {
      // No Q2 – route directly (currently all Q1 options have Q2)
      const model = getModelFromFlow(id);
      router.push(`/discover/${model}`);
    }
  };

  const handleQ2Select = (optionId: string) => {
    setQ2Answer(optionId);
    if (!q1Answer) return;
    const model = getModelFromFlow(q1Answer, optionId);
    router.push(`/discover/${model}`);
  };

  const handleStart = () => {
    setStep('q1');
    setQ1Answer(null);
    setQ2Answer(null);
  };

  const handleBackFromQ2 = () => {
    setStep('q1');
    setQ2Answer(null);
  };

  // Welcome step
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-8">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Let's find what's right for you
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto">
            Answer two quick questions and we'll suggest the best place to start your discovery.
          </p>
          <Button
            size="lg"
            onClick={handleStart}
            className="bg-indigo-600 hover:bg-indigo-700 px-8 text-lg h-12"
          >
            Get started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <div className="mt-8">
            <Link
              href="/discover/explore"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Grid3X3 className="h-4 w-4" />
              Skip and explore all topics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Question 1 step
  if (step === 'q1') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <p className="text-sm text-indigo-600 font-medium mb-2">Question 1 of 2</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            What's on your mind today?
          </h2>
          <p className="text-gray-600 mb-8">
            Choose the one that feels most relevant right now.
          </p>
          <div className="space-y-3">
            {Q1_OPTIONS.map((option) => (
              <Card
                key={option.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-indigo-300"
                onClick={() => handleQ1Select(option.id)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{option.label}</p>
                    {option.sublabel && (
                      <p className="text-sm text-gray-500 mt-0.5">{option.sublabel}</p>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/discover/explore"
              className="text-sm text-gray-500 hover:text-indigo-600"
            >
              Or browse all topics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Question 2 step (contextual follow-up)
  if (step === 'q2' && q1Answer) {
    const q2 = Q2_CONFIG[q1Answer];
    if (!q2) {
      setStep('q1');
      return null;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Button
            variant="ghost"
            onClick={handleBackFromQ2}
            className="mb-6 -ml-2 text-gray-600"
          >
            ← Back
          </Button>
          <p className="text-sm text-indigo-600 font-medium mb-2">Question 2 of 2</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {q2.question}
          </h2>
          <p className="text-gray-600 mb-8">
            We'll start you with a short assessment that fits.
          </p>
          <div className="space-y-3">
            {q2.options.map((option) => (
              <Card
                key={option.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-indigo-300"
                onClick={() => handleQ2Select(option.id)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <p className="font-medium text-gray-900">{option.label}</p>
                  <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
