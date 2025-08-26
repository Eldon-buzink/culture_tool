'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, Brain, Users, Target, BarChart3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface RawScoresSectionProps {
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

const RawScoresSection: React.FC<RawScoresSectionProps> = ({
  oceanScores,
  cultureScores,
  valuesScores
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 text-green-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Moderate';
    return 'Low';
  };

  const getTermTooltip = (term: string) => {
    const tooltips: Record<string, string> = {
      'openness': 'Openness reflects your curiosity, imagination, and willingness to try new experiences.',
      'conscientiousness': 'Conscientiousness measures your organization, responsibility, and self-discipline.',
      'extraversion': 'Extraversion reflects your social energy and assertiveness.',
      'agreeableness': 'Agreeableness measures your cooperation, trust, and compassion.',
      'neuroticism': 'Neuroticism reflects emotional stability and stress response.',
      'powerDistance': 'Power Distance reflects your comfort with hierarchical structures and authority.',
      'individualism': 'Individualism measures your preference for working independently vs. in teams.',
      'masculinity': 'Masculinity reflects competitive vs. cooperative work preferences.',
      'uncertaintyAvoidance': 'Uncertainty Avoidance measures your comfort with ambiguity and change.',
      'longTermOrientation': 'Long-term Orientation reflects your focus on future planning vs. immediate results.',
      'indulgence': 'Indulgence measures your preference for enjoying life vs. restraint.',
      'innovation': 'Innovation reflects your preference for new approaches and creative solutions.',
      'collaboration': 'Collaboration measures your preference for teamwork and shared success.',
      'autonomy': 'Autonomy reflects your need for independence and self-direction.',
      'quality': 'Quality reflects your focus on excellence and attention to detail.',
      'customerFocus': 'Customer Focus measures your orientation toward serving others and meeting needs.'
    };
    
    return tooltips[term.toLowerCase()] || 'No explanation available for this term.';
  };

  const renderScoreSection = (
    title: string,
    icon: React.ComponentType<any>,
    scores: Record<string, number>,
    sectionKey: string
  ) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <icon className="h-5 w-5 text-gray-600" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {expandedSections[sectionKey] ? 'Click to collapse' : 'Click to expand'}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="hover:bg-gray-200">
            {expandedSections[sectionKey] ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {expandedSections[sectionKey] && (
        <CardContent>
          <div className="space-y-4">
            {Object.entries(scores).map(([trait, score]) => (
              <div key={trait} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">
                      {trait.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <BarChart3 className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{getTermTooltip(trait)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Badge className={getScoreBadgeColor(score)}>
                    {getScoreLabel(score)} ({score})
                  </Badge>
                </div>
                <Progress value={score} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <Card className="border-gray-200 bg-gray-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 rounded-lg">
            <BarChart3 className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Detailed Scores</h3>
            <p className="text-sm text-gray-600">
              Click to expand each section and see your raw assessment scores
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {renderScoreSection('OCEAN Personality', Brain, oceanScores, 'ocean')}
          {renderScoreSection('Cultural Dimensions', Users, cultureScores, 'culture')}
          {renderScoreSection('Work Values', Target, valuesScores, 'values')}
        </div>
      </CardContent>
    </Card>
  );
};

export default RawScoresSection;
