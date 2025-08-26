'use client';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Users, 
  Target, 
  Zap, 
  Shield, 
  Heart, 
  Star, 
  TrendingUp,
  Lightbulb,
  Users2,
  Target as TargetIcon,
  Sparkles
} from 'lucide-react';

interface PersonalityCompassProps {
  oceanScores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  cultureScores: {
    powerDistance: number;
    individualism: number;
    masculinity: number;
    uncertaintyAvoidance: number;
    longTermOrientation: number;
    indulgence: number;
  };
  valuesScores: {
    innovation: number;
    collaboration: number;
    autonomy: number;
    quality: number;
    customerFocus: number;
  };
}

const PersonalityCompass: React.FC<PersonalityCompassProps> = ({
  oceanScores,
  cultureScores,
  valuesScores
}) => {
  // Calculate personality type based on scores
  const getPersonalityType = () => {
    const { openness, extraversion, conscientiousness, agreeableness, neuroticism } = oceanScores;
    
    if (openness > 70 && extraversion > 70) return "Innovator";
    if (conscientiousness > 70 && agreeableness > 70) return "Stabilizer";
    if (extraversion > 70 && agreeableness > 70) return "Connector";
    if (openness > 70 && conscientiousness > 70) return "Analyst";
    if (extraversion > 70 && conscientiousness > 70) return "Leader";
    if (openness > 70 && agreeableness > 70) return "Creative";
    
    return "Balanced";
  };

  const personalityType = getPersonalityType();

  // Get personality insights
  const getPersonalityInsights = () => {
    const insights = [];
    
    if (oceanScores.openness > 70) {
      insights.push({ icon: Lightbulb, text: "Natural problem solver", color: "text-blue-600" });
    }
    if (oceanScores.extraversion > 70) {
      insights.push({ icon: Users2, text: "Team energizer", color: "text-green-600" });
    }
    if (oceanScores.conscientiousness > 70) {
      insights.push({ icon: Shield, text: "Reliable anchor", color: "text-purple-600" });
    }
    if (oceanScores.agreeableness > 70) {
      insights.push({ icon: Heart, text: "Culture builder", color: "text-pink-600" });
    }
    if (oceanScores.neuroticism < 30) {
      insights.push({ icon: Zap, text: "Stress resilient", color: "text-orange-600" });
    }
    
    return insights;
  };

  // Get growth opportunities
  const getGrowthOpportunities = () => {
    const opportunities = [];
    
    if (oceanScores.openness < 40) {
      opportunities.push({ icon: Sparkles, text: "Try new approaches", color: "text-blue-600" });
    }
    if (oceanScores.extraversion < 40) {
      opportunities.push({ icon: Users, text: "Build connections", color: "text-green-600" });
    }
    if (oceanScores.conscientiousness < 40) {
      opportunities.push({ icon: TargetIcon, text: "Develop structure", color: "text-purple-600" });
    }
    if (oceanScores.agreeableness < 40) {
      opportunities.push({ icon: Heart, text: "Practice empathy", color: "text-pink-600" });
    }
    if (oceanScores.neuroticism > 70) {
      opportunities.push({ icon: Shield, text: "Build resilience", color: "text-orange-600" });
    }
    
    return opportunities;
  };

  const insights = getPersonalityInsights();
  const opportunities = getGrowthOpportunities();

  // Get top strengths
  const getTopStrengths = () => {
    const scores = [
      { name: 'Openness', score: oceanScores.openness, icon: Lightbulb },
      { name: 'Extraversion', score: oceanScores.extraversion, icon: Users2 },
      { name: 'Conscientiousness', score: oceanScores.conscientiousness, icon: Shield },
      { name: 'Agreeableness', score: oceanScores.agreeableness, icon: Heart },
      { name: 'Innovation', score: valuesScores.innovation, icon: Sparkles },
      { name: 'Collaboration', score: valuesScores.collaboration, icon: Users },
      { name: 'Quality', score: valuesScores.quality, icon: TargetIcon }
    ];
    
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const topStrengths = getTopStrengths();

  return (
    <div className="space-y-6">
      {/* Hero Section - Personality Type */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              You're a <span className="text-blue-600">{personalityType}</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your unique combination of traits makes you naturally suited for creative problem-solving and team collaboration. 
              You thrive in environments that value innovation and human connection.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Growth Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Strengths */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Your Superpowers</h3>
            </div>
            
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <insight.icon className={`h-5 w-5 ${insight.color}`} />
                  <span className="font-medium text-gray-800">{insight.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Top Strengths</h4>
              <div className="space-y-3">
                {topStrengths.map((strength, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <strength.icon className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">{strength.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={strength.score} className="w-20 h-2" />
                      <span className="text-sm font-semibold text-green-600">{strength.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Growth Opportunities */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Growth Journey</h3>
            </div>
            
            <div className="space-y-4">
              {opportunities.map((opportunity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <opportunity.icon className={`h-5 w-5 ${opportunity.color}`} />
                  <span className="font-medium text-gray-800">{opportunity.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">💡 Pro Tip</h4>
              <p className="text-sm text-gray-600">
                Focus on one growth area at a time. Small, consistent improvements compound into significant personal development.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Role Insights */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Your Team Role</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Innovation Driver</h4>
              <p className="text-sm text-gray-600">You bring fresh ideas and creative solutions to challenges</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users2 className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Team Energizer</h4>
              <p className="text-sm text-gray-600">You motivate and connect people to achieve shared goals</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Quality Guardian</h4>
              <p className="text-sm text-gray-600">You ensure excellence and attention to detail in deliverables</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalityCompass;
