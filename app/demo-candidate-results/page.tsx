'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Brain, Users, Target, TrendingUp, TrendingDown, Minus, HelpCircle, Lightbulb, Award, AlertTriangle, Globe, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import ComparisonRadarChart from '@/components/ComparisonRadarChart';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ActionableRecommendations from '@/components/ActionableRecommendations';

export default function DemoCandidateResultsPage() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [expandedRecommendations, setExpandedRecommendations] = useState<Record<string, boolean>>({});
  
  const toggleRecommendation = (section: string, index: number) => {
    const key = `${section}-${index}`;
    setExpandedRecommendations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Demo data showing candidate vs team comparison
  const candidateData = {
    name: "Sarah Johnson",
    position: "Senior Product Manager",
    teamName: "Innovation Team",
    candidateScores: {
      ocean: {
        openness: 82,
        conscientiousness: 71,
        extraversion: 68,
        agreeableness: 75,
        neuroticism: 32
      },
      culture: {
        powerDistance: 38,
        individualism: 76,
        masculinity: 52,
        uncertaintyAvoidance: 48,
        longTermOrientation: 69,
        indulgence: 73
      },
      values: {
        innovation: 85,
        collaboration: 78,
        autonomy: 72,
        quality: 81,
        customerFocus: 76
      }
    },
    teamAverageScores: {
      ocean: {
        openness: 75,
        conscientiousness: 78,
        extraversion: 72,
        agreeableness: 68,
        neuroticism: 35
      },
      culture: {
        powerDistance: 42,
        individualism: 68,
        masculinity: 58,
        uncertaintyAvoidance: 52,
        longTermOrientation: 65,
        indulgence: 70
      },
      values: {
        innovation: 78,
        collaboration: 82,
        autonomy: 68,
        quality: 85,
        customerFocus: 80
      }
    },
    teamFitAnalysis: {
      overall: 85, // Percentage fit score
      strengths: [
        "High innovation alignment - candidate's innovation score (85) exceeds team average (78)",
        "Strong conscientiousness - candidate's reliability (71) is close to team average (78)",
        "Excellent cultural fit - candidate's individualism (76) aligns well with team (68)",
        "Quality focus - candidate's quality score (81) is very close to team average (85)"
      ],
      challenges: [
        "Lower collaboration score (78) compared to team average (82) - may need support in team projects",
        "Higher uncertainty avoidance (48) than team average (52) - may prefer more structured environments",
        "Slightly lower extraversion (68) than team average (72) - may need encouragement in group settings"
      ],
      recommendations: [
        "Strong hire - excellent innovation and cultural alignment",
        "Provide structured onboarding to help with collaboration",
        "Assign mentor for team integration support",
        "Consider for innovation-focused projects"
      ]
    }
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

  const getFitIcon = (candidateScore: number, teamScore: number) => {
    const difference = Math.abs(candidateScore - teamScore);
    if (difference <= 5) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (difference <= 10) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getFitText = (candidateScore: number, teamScore: number) => {
    const difference = Math.abs(candidateScore - teamScore);
    if (difference <= 5) return "Excellent fit";
    if (difference <= 10) return "Good fit";
    if (difference <= 15) return "Moderate fit";
    return "Potential challenge";
  };

  const getTermTooltip = (term: string) => {
    const tooltips: Record<string, string> = {
      'openness': 'Openness reflects curiosity, imagination, and willingness to try new experiences. High scores indicate creativity and adaptability.',
      'conscientiousness': 'Conscientiousness measures organization, responsibility, and self-discipline. High scores indicate reliability and attention to detail.',
      'extraversion': 'Extraversion reflects social energy and assertiveness. High scores indicate outgoing, energetic behavior.',
      'agreeableness': 'Agreeableness measures cooperation, trust, and compassion. High scores indicate helpfulness and empathy.',
      'neuroticism': 'Neuroticism reflects emotional stability and stress response. High scores indicate sensitivity to stress.',
      'powerDistance': 'Power Distance reflects comfort with hierarchical structures and authority. High scores indicate preference for clear leadership.',
      'individualism': 'Individualism measures preference for working independently vs. in teams. High scores indicate self-reliance.',
      'masculinity': 'Masculinity reflects competitive vs. cooperative work preferences. High scores indicate achievement focus.',
      'uncertaintyAvoidance': 'Uncertainty Avoidance measures comfort with ambiguity and change. High scores indicate preference for structure and rules.',
      'longTermOrientation': 'Long-term Orientation reflects focus on future planning vs. immediate results. High scores indicate strategic thinking.',
      'indulgence': 'Indulgence measures preference for enjoying life vs. restraint. High scores indicate work-life balance focus.',
      'innovation': 'Innovation reflects preference for new approaches and creative solutions. High scores indicate adaptability to change.',
      'collaboration': 'Collaboration measures preference for teamwork and shared success. High scores indicate cooperative work style.',
      'autonomy': 'Autonomy reflects need for independence and self-direction. High scores indicate preference for freedom.',
      'quality': 'Quality reflects focus on excellence and attention to detail. High scores indicate perfectionist tendencies.',
      'customerFocus': 'Customer Focus measures orientation toward serving others and meeting needs. High scores indicate service orientation.'
    };
    
    return tooltips[term.toLowerCase()] || 'No explanation available for this term.';
  };

  const getSectionContext = (section: string) => {
    switch (section) {
      case 'ocean':
        return "Compare the candidate's OCEAN personality traits with the team's average scores to understand how they'll naturally think, feel, and behave in your work environment.";
      case 'culture':
        return "Compare cultural preferences to see how the candidate will fit within your organizational structure and work environment.";
      case 'values':
        return "Compare work values to understand what motivates the candidate professionally and how it aligns with your team's priorities.";
      default:
        return "";
    }
  };

  const getSectionSummary = (section: string) => {
    switch (section) {
      case 'ocean':
        return "The candidate shows strong alignment in openness and conscientiousness, with moderate differences in extraversion and agreeableness that can be managed through proper onboarding.";
      case 'culture':
        return "Excellent cultural fit with the team's egalitarian and individualistic approach. The candidate's preferences align well with your flat organizational structure.";
      case 'values':
        return "Strong alignment in innovation and quality focus, with the candidate potentially bringing fresh perspectives while maintaining the team's high standards.";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Candidate Team Fit Analysis</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Cultural fit analysis for <strong>{candidateData.name}</strong> joining the <strong>{candidateData.teamName}</strong>
          </p>
        </div>

        {/* Candidate Info Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{candidateData.name}</h2>
                  <p className="text-gray-600">{candidateData.position}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{candidateData.teamFitAnalysis.overall}%</div>
                <div className="text-sm text-gray-600">Team Fit Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OCEAN Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">OCEAN Personality Profile</CardTitle>
                <p className="text-gray-600">{getSectionContext('ocean')}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Radar Chart + Detailed Scores */}
              <div className="space-y-8">
                {/* Radar Chart */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personality Comparison</h3>
                  <div className="w-full h-[420px] md:h-[460px] lg:h-[500px] xl:h-[540px] mb-6">
                    <ComparisonRadarChart
                      candidateData={candidateData.candidateScores.ocean}
                      teamData={candidateData.teamAverageScores.ocean}
                      size={380}
                      candidateColor="#3B82F6"
                      teamColor="#10B981"
                    />
                  </div>
                </div>

                {/* Detailed Scores */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Detailed Comparison</h3>
                  <div className="space-y-4">
                    {Object.entries(candidateData.candidateScores.ocean).map(([trait, candidateScore]) => {
                      const teamScore = candidateData.teamAverageScores.ocean[trait as keyof typeof candidateData.teamAverageScores.ocean];
                      return (
                        <div key={trait} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">{trait}</span>
                              <div className="relative">
                                <button
                                  onClick={() => setActiveTooltip(activeTooltip === trait ? null : trait)}
                                  className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                  <HelpCircle className="h-4 w-4" />
                                </button>
                                {activeTooltip === trait && (
                                  <div className="absolute z-50 mt-2 p-4 bg-white border border-gray-200 text-gray-800 text-sm rounded-lg shadow-xl max-w-lg left-0">
                                    <div className="flex justify-between items-start mb-3">
                                      <span className="font-semibold capitalize text-gray-900">{trait}</span>
                                      <button
                                        onClick={() => setActiveTooltip(null)}
                                        className="text-gray-400 hover:text-gray-600 ml-2 text-lg font-bold hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center"
                                      >
                                        ×
                                      </button>
                                    </div>
                                    <p className="leading-relaxed">{getTermTooltip(trait)}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-100 text-blue-800">
                                {getScoreLabel(candidateScore)} ({candidateScore})
                              </Badge>
                              <span className="text-gray-400">vs</span>
                              <Badge className="bg-green-100 text-green-800">
                                {getScoreLabel(teamScore as number)} ({teamScore})
                              </Badge>
                              {getFitIcon(candidateScore as number, teamScore as number)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Progress value={Math.max(candidateScore, teamScore as number)} className="h-2 flex-1 bg-blue-100" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Key Insights + Recommendations + Section Summary */}
              <div className="space-y-6">
                {/* Key Insights */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Team Fit Insights</h3>
                  <ul className="space-y-2">
                    {candidateData.teamFitAnalysis.strengths.slice(0, 3).map((strength, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        {strength}
                      </li>
                    ))}
                    {candidateData.teamFitAnalysis.challenges.slice(0, 2).map((challenge, index) => (
                      <li key={`challenge-${index}`} className="text-sm text-gray-700 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                  <div className="space-y-4">
                    {/* For the Candidate */}
                    <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">For the Candidate</div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div 
                        className="p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => toggleRecommendation('ocean-candidate', 0)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-blue-900">Leverage your high openness (82) for creative problem-solving</h4>
                            <p className="text-sm text-blue-900/80 mt-1">Click to view details</p>
                          </div>
                          {expandedRecommendations[`ocean-candidate-0`] ? (
                            <ChevronUp className="h-5 w-5 text-blue-600" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                      {expandedRecommendations[`ocean-candidate-0`] && (
                        <div className="p-4 bg-white text-sm text-gray-700">
                          <ul className="list-disc ml-5 space-y-1">
                            <li>Take initiative in brainstorming sessions and creative problem-solving</li>
                            <li>Share innovative approaches and new perspectives with the team</li>
                            <li>Volunteer for experimental projects and new initiatives</li>
                            <li>Help the team think outside the box when facing challenges</li>
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* For the Hiring Manager */}
                    <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-2 mt-4">For the Hiring Manager</div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div 
                        className="p-4 bg-green-50 cursor-pointer hover:bg-green-100 transition-colors"
                        onClick={() => toggleRecommendation('ocean-manager', 0)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-green-900">Assign innovation-focused projects to maximize creativity</h4>
                            <p className="text-sm text-green-900/80 mt-1">Click to view details</p>
                          </div>
                          {expandedRecommendations[`ocean-manager-0`] ? (
                            <ChevronUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      </div>
                      {expandedRecommendations[`ocean-manager-0`] && (
                        <div className="p-4 bg-white text-sm text-gray-700">
                          <ul className="list-disc ml-5 space-y-1">
                            <li>Involve in innovation workshops and creative sessions</li>
                            <li>Assign to experimental projects and new initiatives</li>
                            <li>Encourage sharing of creative solutions and new approaches</li>
                            <li>Provide opportunities to lead brainstorming activities</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Section Summary</h3>
                  <p className="text-sm text-gray-600">{getSectionSummary('ocean')}</p>
                </div>

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Culture Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Cultural Work Preferences</CardTitle>
                <p className="text-gray-600">{getSectionContext('culture')}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Radar Chart + Detailed Scores */}
              <div className="space-y-8">
                {/* Radar Chart */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Cultural Comparison</h3>
                  <div className="w-full h-[420px] md:h-[460px] lg:h-[500px] xl:h-[540px] mb-6">
                    <ComparisonRadarChart
                      candidateData={candidateData.candidateScores.culture}
                      teamData={candidateData.teamAverageScores.culture}
                      size={380}
                      candidateColor="#10B981"
                      teamColor="#059669"
                    />
                  </div>
                </div>

                {/* Detailed Scores */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Detailed Comparison</h3>
                  <div className="space-y-4">
                    {Object.entries(candidateData.candidateScores.culture).map(([dimension, candidateScore]) => {
                      const teamScore = candidateData.teamAverageScores.culture[dimension as keyof typeof candidateData.teamAverageScores.culture];
                      const formattedDimension = dimension.replace(/([A-Z])/g, ' $1').trim();
                      return (
                        <div key={dimension} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formattedDimension}</span>
                              <div className="relative">
                                <button
                                  onClick={() => setActiveTooltip(activeTooltip === dimension ? null : dimension)}
                                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                  <HelpCircle className="h-4 w-4" />
                                </button>
                                {activeTooltip === dimension && (
                                  <div className="absolute z-50 mt-2 p-4 bg-white border border-gray-200 text-gray-800 text-sm rounded-lg shadow-xl max-w-lg left-0">
                                    <div className="flex justify-between items-start mb-3">
                                      <span className="font-semibold text-gray-900">{formattedDimension}</span>
                                      <button
                                        onClick={() => setActiveTooltip(null)}
                                        className="text-gray-400 hover:text-gray-600 ml-2 text-lg font-bold hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center"
                                      >
                                        ×
                                      </button>
                                    </div>
                                    <p className="leading-relaxed">{getTermTooltip(dimension)}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-800">
                                {getScoreLabel(candidateScore)} ({candidateScore})
                              </Badge>
                              <span className="text-gray-400">vs</span>
                              <Badge className="bg-emerald-100 text-emerald-800">
                                {getScoreLabel(teamScore as number)} ({teamScore})
                              </Badge>
                              {getFitIcon(candidateScore as number, teamScore as number)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Progress value={Math.max(candidateScore, teamScore as number)} className="h-2 flex-1 bg-green-100" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Key Insights + Recommendations + Section Summary */}
              <div className="space-y-6">
                {/* Key Insights */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Cultural Fit Insights</h3>
                  <ul className="space-y-2">
                    <li className="text-sm text-gray-700 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      Excellent alignment with team's individualistic and egalitarian approach
                    </li>
                    <li className="text-sm text-gray-700 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      Low power distance preference matches team's flat structure
                    </li>
                    <li className="text-sm text-gray-700 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      Slightly higher uncertainty avoidance may need more structure initially
                    </li>
                  </ul>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                  <div className="space-y-4">
                    {/* For the Candidate */}
                    <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">For the Candidate</div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div 
                        className="p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => toggleRecommendation('culture-candidate', 0)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-blue-900">Embrace the team's flat structure and collaborative approach</h4>
                            <p className="text-sm text-blue-900/80 mt-1">Click to view details</p>
                          </div>
                          {expandedRecommendations[`culture-candidate-0`] ? (
                            <ChevronUp className="h-5 w-5 text-blue-600" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                      {expandedRecommendations[`culture-candidate-0`] && (
                        <div className="p-4 bg-white text-sm text-gray-700">
                          <ul className="list-disc ml-5 space-y-1">
                            <li>Actively participate in team discussions and decision-making</li>
                            <li>Take initiative in collaborative projects and group activities</li>
                            <li>Share your ideas openly and encourage others to contribute</li>
                            <li>Build relationships with team members across different levels</li>
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* For the Hiring Manager */}
                    <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-2 mt-4">For the Hiring Manager</div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div 
                        className="p-4 bg-green-50 cursor-pointer hover:bg-green-100 transition-colors"
                        onClick={() => toggleRecommendation('culture-manager', 0)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-green-900">Create structured onboarding with clear processes</h4>
                            <p className="text-sm text-green-900/80 mt-1">Click to view details</p>
                          </div>
                          {expandedRecommendations[`culture-manager-0`] ? (
                            <ChevronUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      </div>
                      {expandedRecommendations[`culture-manager-0`] && (
                        <div className="p-4 bg-white text-sm text-gray-700">
                          <ul className="list-disc ml-5 space-y-1">
                            <li>Develop a comprehensive onboarding checklist with timelines</li>
                            <li>Assign a team mentor for the first 30 days</li>
                            <li>Schedule regular check-ins during initial weeks</li>
                            <li>Provide documentation on team processes and communication norms</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Section Summary</h3>
                  <p className="text-sm text-gray-600">{getSectionSummary('culture')}</p>
                </div>

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Work Values Alignment</CardTitle>
                <p className="text-gray-600">{getSectionContext('values')}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Radar Chart + Detailed Scores */}
              <div className="space-y-8">
                {/* Radar Chart */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Values Comparison</h3>
                  <div className="w-full h-[420px] md:h-[460px] lg:h-[500px] xl:h-[540px] mb-6">
                    <ComparisonRadarChart
                      candidateData={candidateData.candidateScores.values}
                      teamData={candidateData.teamAverageScores.values}
                      size={380}
                      candidateColor="#8B5CF6"
                      teamColor="#7C3AED"
                    />
                  </div>
                </div>

                {/* Detailed Scores */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Detailed Comparison</h3>
                  <div className="space-y-4">
                    {Object.entries(candidateData.candidateScores.values).map(([value, candidateScore]) => {
                      const teamScore = candidateData.teamAverageScores.values[value as keyof typeof candidateData.teamAverageScores.values];
                      const formattedValue = value.replace(/([A-Z])/g, ' $1').trim();
                      return (
                        <div key={value} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formattedValue}</span>
                              <div className="relative">
                                <button
                                  onClick={() => setActiveTooltip(activeTooltip === value ? null : value)}
                                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                  <HelpCircle className="h-4 w-4" />
                                </button>
                                {activeTooltip === value && (
                                  <div className="absolute z-50 mt-2 p-4 bg-white border border-gray-200 text-gray-800 text-sm rounded-lg shadow-xl max-w-lg left-0">
                                    <div className="flex justify-between items-start mb-3">
                                      <span className="font-semibold text-gray-900">{formattedValue}</span>
                                      <button
                                        onClick={() => setActiveTooltip(null)}
                                        className="text-gray-400 hover:text-gray-600 ml-2 text-lg font-bold hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center"
                                      >
                                        ×
                                      </button>
                                    </div>
                                    <p className="leading-relaxed">{getTermTooltip(value)}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-purple-100 text-purple-800">
                                {getScoreLabel(candidateScore)} ({candidateScore})
                              </Badge>
                              <span className="text-gray-400">vs</span>
                              <Badge className="bg-violet-100 text-violet-800">
                                {getScoreLabel(teamScore as number)} ({teamScore})
                              </Badge>
                              {getFitIcon(candidateScore as number, teamScore as number)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Progress value={Math.max(candidateScore, teamScore as number)} className="h-2 flex-1 bg-purple-100" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Key Insights + Recommendations + Section Summary */}
              <div className="space-y-4">
                {/* Key Insights */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Values Fit Insights</h3>
                  <ul className="space-y-2">
                    <li className="text-sm text-gray-700 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      Strong innovation focus exceeds team average - will drive creativity
                    </li>
                    <li className="text-sm text-gray-700 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      Quality focus aligns perfectly with team's high standards
                    </li>
                    <li className="text-sm text-gray-700 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      Slightly lower collaboration score may need team integration support
                    </li>
                  </ul>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                  <div className="space-y-4">
                    {/* For the Candidate */}
                    <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">For the Candidate</div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div 
                        className="p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => toggleRecommendation('values-candidate', 0)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-blue-900">Lead innovation initiatives and share creative solutions</h4>
                            <p className="text-sm text-blue-900/80 mt-1">Click to view details</p>
                          </div>
                          {expandedRecommendations[`values-candidate-0`] ? (
                            <ChevronUp className="h-5 w-5 text-blue-600" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                      {expandedRecommendations[`values-candidate-0`] && (
                        <div className="p-4 bg-white text-sm text-gray-700">
                          <ul className="list-disc ml-5 space-y-1">
                            <li>Take the lead in innovation workshops and creative sessions</li>
                            <li>Share your innovative approaches and creative solutions</li>
                            <li>Volunteer for experimental projects and new initiatives</li>
                            <li>Help the team think outside the box when facing challenges</li>
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* For the Hiring Manager */}
                    <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-2 mt-4">For the Hiring Manager</div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div 
                        className="p-4 bg-green-50 cursor-pointer hover:bg-green-100 transition-colors"
                        onClick={() => toggleRecommendation('values-manager', 0)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-green-900">Assign to innovation-focused projects and initiatives</h4>
                            <p className="text-sm text-green-900/80 mt-1">Click to view details</p>
                          </div>
                          {expandedRecommendations[`values-manager-0`] ? (
                            <ChevronUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      </div>
                      {expandedRecommendations[`values-manager-0`] && (
                        <div className="p-4 bg-white text-sm text-gray-700">
                          <ul className="list-disc ml-5 space-y-1">
                            <li>Involve in innovation workshops and creative sessions</li>
                            <li>Assign to experimental projects and new initiatives</li>
                            <li>Encourage sharing of creative solutions and new approaches</li>
                            <li>Provide opportunities to lead brainstorming activities</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Section Summary</h3>
                  <p className="text-sm text-gray-600">{getSectionSummary('values')}</p>
                </div>

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Integration Summary */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="max-w-4xl mx-auto">
              {/* Header - Consistent with page design */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Integration Summary</h2>
                <p className="text-gray-600">
                  Based on the comprehensive assessment results, here's how this candidate aligns with your team
                </p>
              </div>
              
              {/* Cards Grid - Consistent styling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Key Strengths */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800">Key Strengths</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-green-700">85% overall team fit score</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-green-700">Excellent innovation alignment</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-green-700">Strong cultural compatibility</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-green-700">Quality focus matches team standards</span>
                    </div>
                  </div>
                </div>

                {/* Integration Focus */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-amber-800">Integration Focus</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-amber-700">Team collaboration training</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-amber-700">Structured onboarding process</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-amber-700">Regular check-ins initially</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-amber-700">Assign team mentor</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Context Section */}
              <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Assessment Context</h4>
                    <p className="text-sm text-gray-600">
                      This summary is based on the candidate's responses across OCEAN personality traits, 
                      cultural preferences, and value alignment. The 85% fit score indicates strong overall 
                      compatibility, with specific focus areas identified to ensure successful team integration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
