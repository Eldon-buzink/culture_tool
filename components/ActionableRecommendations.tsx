'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Target, 
  Users, 
  TrendingUp,
  CheckCircle,
  Clock,
  Star,
  Zap
} from 'lucide-react';

interface Recommendation {
  title: string;
  description: string;
  nextSteps: string[];
  priority: 'high' | 'medium' | 'low';
  category: 'career' | 'teamwork' | 'personal' | 'leadership';
}

interface ActionableRecommendationsProps {
  recommendations: {
    ocean: {
      context: string;
      recommendations: Array<{
        title: string;
        description: string;
        nextSteps: string[];
      }>;
    };
    culture: {
      context: string;
      recommendations: Array<{
        title: string;
        description: string;
        nextSteps: string[];
      }>;
    };
    values: {
      context: string;
      recommendations: Array<{
        title: string;
        description: string;
        nextSteps: string[];
      }>;
    };
  };
}

const ActionableRecommendations: React.FC<ActionableRecommendationsProps> = ({
  recommendations
}) => {
  const [expandedRecommendations, setExpandedRecommendations] = useState<Record<string, boolean>>({});

  const toggleRecommendation = (section: string, index: number) => {
    const key = `${section}-${index}`;
    setExpandedRecommendations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Zap className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Star className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'career':
        return <Target className="h-4 w-4" />;
      case 'teamwork':
        return <Users className="h-4 w-4" />;
      case 'personal':
        return <Lightbulb className="h-4 w-4" />;
      case 'leadership':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  // Transform recommendations into actionable format
  const transformRecommendations = (): Recommendation[] => {
    const allRecommendations: Recommendation[] = [];
    
    // Add OCEAN recommendations
    recommendations.ocean.recommendations.forEach((rec, index) => {
      allRecommendations.push({
        title: rec.title,
        description: rec.description,
        nextSteps: rec.nextSteps,
        priority: index === 0 ? 'high' : 'medium',
        category: 'personal'
      });
    });

    // Add culture recommendations
    recommendations.culture.recommendations.forEach((rec, index) => {
      allRecommendations.push({
        title: rec.title,
        description: rec.description,
        nextSteps: rec.nextSteps,
        priority: index === 0 ? 'high' : 'medium',
        category: 'teamwork'
      });
    });

    // Add values recommendations
    recommendations.values.recommendations.forEach((rec, index) => {
      allRecommendations.push({
        title: rec.title,
        description: rec.description,
        nextSteps: rec.nextSteps,
        priority: index === 0 ? 'high' : 'medium',
        category: 'career'
      });
    });

    return allRecommendations;
  };

  const actionableRecs = transformRecommendations();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-full mb-4">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Action Plan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Based on your assessment results, here are personalized recommendations to help you grow and thrive in your career and team environment.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {actionableRecs.map((rec, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => toggleRecommendation('rec', index)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(rec.priority)}
                    {getCategoryIcon(rec.category)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority} priority
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {expandedRecommendations[`rec-${index}`] ? 'Click to collapse' : 'Click to expand'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="hover:bg-gray-200">
                  {expandedRecommendations[`rec-${index}`] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-700 mb-4">{rec.description}</p>
              
              {expandedRecommendations[`rec-${index}`] && (
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Next Steps
                    </h5>
                    <ul className="space-y-2">
                      {rec.nextSteps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-sm text-gray-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h6 className="font-medium text-purple-900 mb-1">💡 Quick Win</h6>
                    <p className="text-sm text-purple-700">
                      Start with the first step this week. Small actions create big changes over time.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Challenge */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Zap className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">This Week's Challenge</h3>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-2">
              Practice Active Listening
            </h4>
            <p className="text-gray-600 mb-3">
              Based on your assessment, improving your listening skills will enhance your team collaboration and leadership potential.
            </p>
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <Clock className="h-4 w-4" />
              <span>5 minutes daily</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActionableRecommendations;
