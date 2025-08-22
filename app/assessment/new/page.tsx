'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Brain, Users, Target, ArrowRight } from 'lucide-react';

export default function NewAssessmentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: 'Personal Assessment',
    description: 'Individual personality and work style assessment',
    type: 'individual' as 'individual' | 'team'
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdBy: 'test-user' // TODO: Get from auth context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          router.push(`/assessment/${data.assessment.id}`);
        } else {
          alert('Failed to create assessment: ' + data.error);
        }
      } else {
        alert('Failed to create assessment');
      }
    } catch (error) {
      console.error('Error creating assessment:', error);
      alert('Failed to create assessment');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Assessment</h1>
          <p className="text-gray-600">Set up a new assessment to evaluate personality, culture, and work values.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Assessment Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Q1 Team Assessment"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the assessment purpose..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Assessment Type</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual" className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Individual
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="team" id="team" />
                    <Label htmlFor="team" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Team
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">What's Included</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    <span>OCEAN Personality Assessment (5 questions)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Cultural Dimensions (5 questions)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>Work Values Assessment (5 questions)</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isCreating || !formData.title}
                className="w-full"
              >
                {isCreating ? (
                  'Creating Assessment...'
                ) : (
                  <>
                    Create Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
