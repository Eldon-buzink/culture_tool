'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

type Question = {
  id: string;
  text: string;
  section: string;
  reverse_scored: boolean;
  trait_axis: string;
};

export default function AssessmentPage() {
  const { uuid } = useParams();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      const res = await fetch(`/api/get-ocean-questions`);
      const data = await res.json();
      setQuestions(data.questions);
      setLoading(false);
    }

    fetchQuestions();
  }, []);

  const handleChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-semibold">Thanks for completing the first part 🎉</h2>
        <p className="mt-4">You're one step closer to understanding how your brain ticks 🧠</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Step 1 of 3: Personality (OCEAN)</CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Answer honestly — there are no wrong answers here. Just strong opinions and quiet overthinkers 😅
          </p>
        </CardHeader>
        <Separator />
        <CardContent>
          {questions.map((q) => (
            <div key={q.id} className="mb-6">
              <p className="font-medium mb-2">{q.text}</p>
              <RadioGroup
                value={answers[q.id]?.toString() || ''}
                onValueChange={(val) => handleChange(q.id, parseInt(val))}
                className="flex gap-4"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((val) => (
                  <div key={val} className="flex flex-col items-center text-xs">
                    <RadioGroupItem value={val.toString()} />
                    <span className="mt-1">{val}</span>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}

          <Button
            className="mt-6"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length || submitting}
          >
            {submitting ? 'Submitting...' : 'Next'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
