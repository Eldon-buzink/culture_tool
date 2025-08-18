'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, ArrowLeft, Save } from 'lucide-react';

interface AssessmentHeaderProps {
  currentSection: string;
  currentQuestion: number;
  totalQuestions: number;
  progress: number;
  onSave?: () => void;
  showBackButton?: boolean;
}

export default function AssessmentHeader({ 
  currentSection, 
  currentQuestion, 
  totalQuestions, 
  progress, 
  onSave,
  showBackButton = true 
}: AssessmentHeaderProps) {
  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'ocean': return 'Personality Assessment';
      case 'culture': return 'Cultural Work Style';
      case 'values': return 'Work Values';
      default: return 'Assessment';
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'ocean': return '🧠';
      case 'culture': return '🌍';
      case 'values': return '🎯';
      default: return '📝';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Back */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Culture Mapping</span>
            </Link>
            
            {showBackButton && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            )}
          </div>

          {/* Center - Progress */}
          <div className="flex-1 max-w-md mx-8">
            <div className="text-center mb-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-lg">{getSectionIcon(currentSection)}</span>
                <span className="font-medium text-gray-900">{getSectionTitle(currentSection)}</span>
              </div>
              <p className="text-sm text-gray-600">
                Question {currentQuestion} of {totalQuestions}
              </p>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500 text-center mt-1">
              {Math.round(progress)}% Complete
            </p>
          </div>

          {/* Right side - Save button */}
          <div className="flex items-center gap-2">
            {onSave && (
              <Button variant="outline" size="sm" onClick={onSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
