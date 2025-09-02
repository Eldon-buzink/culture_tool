'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ComparisonRadarChart from '@/components/ComparisonRadarChart';
import { 
  Users, 
  Mail, 
  Copy, 
  Share2,
  Download,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Brain,
  Globe,
  Target,
  ArrowRight,
  UserPlus,
  BookOpen,
  MessageSquare,
  Zap,
  Award,
  ChevronDown,
  Lightbulb,
  AlertTriangle,
  Plus,
  User,
  Building
} from 'lucide-react';
import { ModernSpinner } from '@/components/LoadingSpinner';

interface CandidateData {
  id: string;
  name: string;
  email: string;
  position: string;
  teamCode: string;
  status: 'invited' | 'in_progress' | 'completed' | 'withdrawn';
  assessmentId: string;
  invitedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  overallFit: number | null;
  scores: {
    ocean: Record<string, number>;
    culture: Record<string, number>;
    values: Record<string, number>;
  };
}

interface TeamData {
  code: string;
  name: string;
  aggregateScores: {
    ocean: Record<string, number>;
    culture: Record<string, number>;
    values: Record<string, number>;
  };
}

interface CandidateResultsProps {
  params: {
    code: string;
    candidateId: string;
  };
}

export default function CandidateResults({ params }: CandidateResultsProps) {
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRecommendations, setExpandedRecommendations] = useState<Record<string, boolean>>({});

  const { code: teamCode, candidateId } = params;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch candidate data
        const candidateResponse = await fetch(`/api/candidates/${candidateId}`);
        if (!candidateResponse.ok) {
          throw new Error('Failed to fetch candidate data');
        }
        const candidate = await candidateResponse.json();
        
        // Fetch team data
        const teamResponse = await fetch(`/api/teams/${teamCode}`);
        if (!teamResponse.ok) {
          throw new Error('Failed to fetch team data');
        }
        const team = await teamResponse.json();
        
        setCandidateData(candidate);
        setTeamData(team);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (teamCode && candidateId) {
      fetchData();
    }
  }, [teamCode, candidateId]);

  const toggleRecommendations = (key: string) => {
    setExpandedRecommendations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getSectionSummary = (section: string) => {
    if (!candidateData || !teamData) return "";
    
    switch (section) {
      case 'ocean':
        const oceanDifferences = Object.entries(candidateData.scores.ocean).map(([trait, score]) => ({
          trait,
          difference: Math.abs(score - teamData.aggregateScores.ocean[trait])
        })).sort((a, b) => b.difference - a.difference);
        
        const topTrait = oceanDifferences[0];
        const avgDifference = oceanDifferences.reduce((acc, item) => acc + item.difference, 0) / oceanDifferences.length;
        
        if (avgDifference < 15) {
          return `Excellent personality alignment with your team. The candidate's ${topTrait.trait} trait shows the strongest match, indicating natural compatibility in communication and work styles.`;
        } else if (avgDifference < 25) {
          return `Good personality alignment with some areas for growth. The ${topTrait.trait} trait shows the most difference, but this can be managed through structured onboarding and clear expectations.`;
        } else {
          return `Moderate personality alignment with several areas requiring attention. The ${topTrait.trait} trait shows significant differences that will need focused integration strategies.`;
        }
        
      case 'culture':
        const cultureDifferences = Object.entries(candidateData.scores.culture).map(([pref, score]) => ({
          pref,
          difference: Math.abs(score - teamData.aggregateScores.culture[pref])
        })).sort((a, b) => b.difference - a.difference);
        
        const topPref = cultureDifferences[0];
        const avgCultureDiff = cultureDifferences.reduce((acc, item) => acc + item.difference, 0) / cultureDifferences.length;
        
        if (avgCultureDiff < 20) {
          return `Strong cultural fit with your team's working style. The candidate's ${topPref.pref} preferences align well with your organizational approach.`;
        } else if (avgCultureDiff < 35) {
          return `Good cultural alignment with some adaptation needed. The ${topPref.pref} preference shows the most difference, requiring clear communication about team norms.`;
        } else {
          return `Cultural integration will require focused effort. The ${topPref.pref} preference shows significant differences that need careful management during onboarding.`;
        }
        
      case 'values':
        const valuesDifferences = Object.entries(candidateData.scores.values).map(([value, score]) => ({
          value,
          difference: Math.abs(score - teamData.aggregateScores.values[value])
        })).sort((a, b) => b.difference - a.difference);
        
        const topValue = valuesDifferences[0];
        const avgValuesDiff = valuesDifferences.reduce((acc, item) => acc + item.difference, 0) / valuesDifferences.length;
        
        if (avgValuesDiff < 15) {
          return `Excellent values alignment with your team's priorities. The candidate's ${topValue.value} focus matches your team's approach perfectly.`;
        } else if (avgValuesDiff < 25) {
          return `Good values alignment with some areas for alignment. The ${topValue.value} value shows the most difference, but overall priorities are well-matched.`;
        } else {
          return `Values integration will need attention. The ${topValue.value} value shows significant differences that require clear communication about team priorities.`;
        }
        
      default:
        return "";
    }
  };

  const calculateOverallFit = () => {
    if (!candidateData || !teamData) return 0;
    
    // Calculate average fit across all dimensions
    const oceanFit = Object.keys(candidateData.scores.ocean).reduce((acc, key) => {
      const candidateScore = candidateData.scores.ocean[key];
      const teamScore = teamData.aggregateScores.ocean[key];
      return acc + (100 - Math.abs(candidateScore - teamScore)) / 100;
    }, 0) / Object.keys(candidateData.scores.ocean).length;
    
    const cultureFit = Object.keys(candidateData.scores.culture).reduce((acc, key) => {
      const candidateScore = candidateData.scores.culture[key];
      const teamScore = teamData.aggregateScores.culture[key];
      return acc + (100 - Math.abs(candidateScore - teamScore)) / 100;
    }, 0) / Object.keys(candidateData.scores.culture).length;
    
    const valuesFit = Object.keys(candidateData.scores.values).reduce((acc, key) => {
      const candidateScore = candidateData.scores.values[key];
      const teamScore = teamData.aggregateScores.values[key];
      return acc + (100 - Math.abs(candidateScore - teamScore)) / 100;
    }, 0) / Object.keys(candidateData.scores.values).length;
    
    return Math.round((oceanFit + cultureFit + valuesFit) / 3 * 100);
  };

  const getDynamicRecommendations = (section: string, type: 'candidate' | 'manager') => {
    if (!candidateData || !teamData) return [];
    
    const recommendations = {
      ocean: {
        candidate: [
          'Focus on building relationships with team members who have different communication styles',
          'Leverage your conscientiousness to help establish structured processes',
          'Use your openness to bring fresh perspectives to team discussions'
        ],
        manager: [
          'Provide clear expectations and structured onboarding',
          'Encourage participation in team discussions while respecting processing time',
          'Assign a mentor with complementary personality traits'
        ]
      },
      culture: {
        candidate: [
          'Observe and adapt to the team\'s communication patterns',
          'Balance independent work with collaborative opportunities',
          'Contribute to team culture while maintaining your authentic self'
        ],
        manager: [
          'Facilitate introductions to key team members',
          'Create opportunities for both independent and collaborative work',
          'Establish clear cultural norms and expectations'
        ]
      },
      values: {
        candidate: [
          'Align your work priorities with team values',
          'Contribute to quality standards while maintaining efficiency',
          'Balance innovation with proven approaches'
        ],
        manager: [
          'Set clear expectations around quality and efficiency',
          'Encourage innovative thinking within established frameworks',
          'Recognize and reward value-aligned contributions'
        ]
      }
    };

    // Get base recommendations
    let baseRecs = recommendations[section as keyof typeof recommendations]?.[type] || [];
    
    // Add dynamic recommendations based on score differences
    const scores = candidateData.scores[section as keyof typeof candidateData.scores];
    const teamScores = teamData.aggregateScores[section as keyof typeof teamData.aggregateScores];
    
    if (scores && teamScores) {
      const differences = Object.entries(scores).map(([key, score]) => ({
        key,
        difference: Math.abs(score - teamScores[key])
      })).sort((a, b) => b.difference - a.difference);
      
      const largestDiff = differences[0];
      if (largestDiff && largestDiff.difference > 30) {
        if (type === 'candidate') {
          baseRecs.push(`Pay special attention to ${largestDiff.key} alignment - this area shows the most difference from team norms`);
        } else {
          baseRecs.push(`Focus integration efforts on ${largestDiff.key} - provide clear guidance and examples`);
        }
      }
    }
    
    return baseRecs;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ModernSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Results</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!candidateData || !teamData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Found</h2>
          <p className="text-gray-600">Candidate or team data not found.</p>
        </div>
      </div>
    );
  }

  // Use overall fit score from database if available, otherwise calculate it
  const overallFit = candidateData?.overallFit ?? calculateOverallFit();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {candidateData.name} - Candidate Results
                </h1>
                <p className="text-gray-600">
                  {candidateData.position} • {teamData.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Radar Chart + Detailed Scores */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overall Fit Score & Success Probability */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl font-bold">{overallFit}%</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Overall Team Fit</h2>
                    <p className="text-gray-600">
                      {overallFit >= 80 ? 'Excellent fit' : overallFit >= 60 ? 'Good fit' : 'Moderate fit'} with your team
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl font-bold">
                        {overallFit >= 80 ? '95%' : overallFit >= 60 ? '75%' : '50%'}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Hiring Success Probability</h2>
                    <p className="text-gray-600">
                      {overallFit >= 80 ? 'Very high chance of successful integration' : 
                       overallFit >= 60 ? 'Good chance with proper onboarding' : 
                       'Moderate chance, requires focused integration strategy'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Multi-Section Radar Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* OCEAN Chart */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-center">OCEAN Personality</h3>
                  <div className="flex justify-center">
                    <ComparisonRadarChart
                      candidateData={candidateData.scores.ocean}
                      teamData={teamData.aggregateScores.ocean}
                      size={280}
                      candidateColor="#3B82F6"
                      teamColor="#10B981"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Culture Chart */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-center">Cultural Preferences</h3>
                  <div className="flex justify-center">
                    <ComparisonRadarChart
                      candidateData={candidateData.scores.culture}
                      teamData={teamData.aggregateScores.culture}
                      size={280}
                      candidateColor="#10B981"
                      teamColor="#F59E0B"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Values Chart */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-center">Work Values</h3>
                  <div className="flex justify-center">
                    <ComparisonRadarChart
                      candidateData={candidateData.scores.values}
                      teamData={teamData.aggregateScores.values}
                      size={280}
                      candidateColor="#8B5CF6"
                      teamColor="#EF4444"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Comparison Sections */}
            {/* OCEAN Section */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  OCEAN Personality Traits
                </h3>
                
                <div className="space-y-4">
                                      {Object.entries(candidateData.scores.ocean).map(([trait, candidateScore]) => {
                      const teamScore = teamData.aggregateScores.ocean[trait];
                      const difference = Math.abs(candidateScore - teamScore);
                      
                      return (
                        <div key={trait} className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                            {trait}
                          </div>
                          <div className="flex-1 flex items-center gap-4">
                            <Badge variant="outline" className="w-16 text-center">
                              {candidateScore}
                            </Badge>
                            <div className="flex-1 relative">
                              {/* Background bar showing the range */}
                              <div className="h-2 bg-gray-200 rounded-full relative">
                                {/* Candidate score indicator */}
                                <div 
                                  className="absolute h-2 bg-blue-500 rounded-full transition-all duration-300"
                                  style={{ 
                                    left: `${Math.min(candidateScore, teamScore)}%`,
                                    width: `${Math.abs(candidateScore - teamScore)}%`,
                                    backgroundColor: candidateScore > teamScore ? '#3B82F6' : '#EF4444'
                                  }}
                                />
                                {/* Team score indicator */}
                                <div 
                                  className="absolute h-2 bg-green-500 rounded-full transition-all duration-300"
                                  style={{ 
                                    left: `${Math.min(candidateScore, teamScore)}%`,
                                    width: `${Math.abs(candidateScore - teamScore)}%`,
                                    backgroundColor: teamScore > candidateScore ? '#10B981' : '#EF4444'
                                  }}
                                />
                              </div>
                              {/* Score difference indicator */}
                              <div className="text-xs text-gray-500 mt-1 text-center">
                                {difference} point difference
                              </div>
                            </div>
                            <Badge variant="outline" className="w-16 text-center">
                              {teamScore}
                            </Badge>
                          </div>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs text-gray-600">?</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-lg">
                              <p className="text-sm">
                                {trait === 'openness' && 'Openness to experience reflects curiosity, creativity, and willingness to try new things.'}
                                {trait === 'conscientiousness' && 'Conscientiousness indicates organization, responsibility, and goal-directed behavior.'}
                                {trait === 'extraversion' && 'Extraversion relates to social energy, assertiveness, and positive emotions.'}
                                {trait === 'agreeableness' && 'Agreeableness reflects cooperation, trust, and concern for others.'}
                                {trait === 'neuroticism' && 'Neuroticism indicates emotional stability and stress management.'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Culture Section */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-600" />
                  Cultural Preferences
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(candidateData.scores.culture).map(([preference, candidateScore]) => {
                    const teamScore = teamData.aggregateScores.culture[preference];
                    const difference = Math.abs(candidateScore - teamScore);
                    
                    return (
                      <div key={preference} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                          {preference}
                        </div>
                        <div className="flex-1 flex items-center gap-4">
                          <Badge variant="outline" className="w-16 text-center">
                            {candidateScore}
                          </Badge>
                          <div className="flex-1 relative">
                            {/* Background bar showing the range */}
                            <div className="h-2 bg-gray-200 rounded-full relative">
                              {/* Candidate score indicator */}
                              <div 
                                className="absolute h-2 bg-green-500 rounded-full transition-all duration-300"
                                style={{ 
                                  left: `${Math.min(candidateScore, teamScore)}%`,
                                  width: `${Math.abs(candidateScore - teamScore)}%`,
                                  backgroundColor: candidateScore > teamScore ? '#10B981' : '#EF4444'
                                }}
                              />
                              {/* Team score indicator */}
                              <div 
                                className="absolute h-2 bg-amber-500 rounded-full transition-all duration-300"
                                style={{ 
                                  left: `${Math.min(candidateScore, teamScore)}%`,
                                  width: `${Math.abs(candidateScore - teamScore)}%`,
                                  backgroundColor: teamScore > candidateScore ? '#F59E0B' : '#EF4444'
                                }}
                              />
                            </div>
                            {/* Score difference indicator */}
                            <div className="text-xs text-gray-500 mt-1 text-center">
                              {difference} point difference
                            </div>
                          </div>
                          <Badge variant="outline" className="w-16 text-center">
                            {teamScore}
                          </Badge>
                        </div>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-600">?</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-lg">
                            <p className="text-sm">
                              {preference === 'hierarchy' && 'Hierarchy preference indicates comfort with structured authority and clear reporting lines.'}
                              {preference === 'egalitarian' && 'Egalitarian preference reflects comfort with flat structures and collaborative decision-making.'}
                              {preference === 'individualistic' && 'Individualistic preference indicates comfort with independent work and personal achievement.'}
                              {preference === 'collectivistic' && 'Collectivistic preference reflects comfort with group work and shared goals.'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Values Section */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Work Values
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(candidateData.scores.values).map(([value, candidateScore]) => {
                    const teamScore = teamData.aggregateScores.values[value];
                    const difference = Math.abs(candidateScore - teamScore);
                    
                    return (
                      <div key={value} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                          {value}
                        </div>
                        <div className="flex-1 flex items-center gap-4">
                          <Badge variant="outline" className="w-16 text-center">
                            {candidateScore}
                          </Badge>
                          <div className="flex-1 relative">
                            {/* Background bar showing the range */}
                            <div className="h-2 bg-gray-200 rounded-full relative">
                              {/* Candidate score indicator */}
                              <div 
                                className="absolute h-2 bg-purple-500 rounded-full transition-all duration-300"
                                style={{ 
                                  left: `${Math.min(candidateScore, teamScore)}%`,
                                  width: `${Math.abs(candidateScore - teamScore)}%`,
                                  backgroundColor: candidateScore > teamScore ? '#8B5CF6' : '#EF4444'
                                }}
                              />
                              {/* Team score indicator */}
                              <div 
                                className="absolute h-2 bg-red-500 rounded-full transition-all duration-300"
                                style={{ 
                                  left: `${Math.min(candidateScore, teamScore)}%`,
                                  width: `${Math.abs(candidateScore - teamScore)}%`,
                                  backgroundColor: teamScore > candidateScore ? '#EF4444' : '#EF4444'
                                }}
                              />
                            </div>
                            {/* Score difference indicator */}
                            <div className="text-xs text-gray-500 mt-1 text-center">
                              {difference} point difference
                            </div>
                          </div>
                          <Badge variant="outline" className="w-16 text-center">
                            {teamScore}
                          </Badge>
                        </div>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-600">?</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-lg">
                            <p className="text-sm">
                              {value === 'innovation' && 'Innovation value reflects preference for creative problem-solving and new approaches.'}
                              {value === 'quality' && 'Quality value indicates focus on excellence and attention to detail.'}
                              {value === 'efficiency' && 'Efficiency value reflects preference for streamlined processes and productivity.'}
                              {value === 'collaboration' && 'Collaboration value indicates preference for teamwork and shared success.'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Key Insights + Recommendations + Section Summary */}
          <div className="space-y-6">
            {/* Key Insights */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">
                      Strong alignment in {Object.entries(candidateData.scores.ocean)
                        .sort(([,a], [,b]) => Math.abs(a - teamData.aggregateScores.ocean[Object.keys(candidateData.scores.ocean)[0]]) - Math.abs(b - teamData.aggregateScores.ocean[Object.keys(candidateData.scores.ocean)[1]]))
                        .slice(0, 2)
                        .map(([trait]) => trait)
                        .join(' and ')} traits
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">
                      Cultural fit score of {Math.round(100 - Object.entries(candidateData.scores.culture)
                        .reduce((acc, [, score]) => acc + Math.abs(score - teamData.aggregateScores.culture[Object.keys(candidateData.scores.culture)[0]]), 0) / Object.keys(candidateData.scores.culture).length)}%
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">
                      Values alignment in {Object.entries(candidateData.scores.values)
                        .sort(([,a], [,b]) => Math.abs(a - teamData.aggregateScores.values[Object.keys(candidateData.scores.values)[0]]) - Math.abs(b - teamData.aggregateScores.values[Object.keys(candidateData.scores.values)[1]]))
                        .slice(0, 2)
                        .map(([value]) => value)
                        .join(' and ')} focus areas
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                
                {/* OCEAN Recommendations */}
                <div className="mb-6">
                  <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">For the Candidate</div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleRecommendations('ocean-candidate')}
                    >
                      <span className="text-sm font-medium text-blue-900">OCEAN Integration</span>
                      <ChevronDown className={`h-4 w-4 text-blue-600 transition-transform ${expandedRecommendations['ocean-candidate'] ? 'rotate-180' : ''}`} />
                    </div>
                                         {expandedRecommendations['ocean-candidate'] && (
                       <div className="mt-3 text-sm text-blue-800">
                         <ul className="space-y-1">
                           {getDynamicRecommendations('ocean', 'candidate').map((rec, index) => (
                             <li key={index}>• {rec}</li>
                           ))}
                         </ul>
                       </div>
                     )}
                  </div>
                  
                  <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-2">For the Hiring Manager</div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleRecommendations('ocean-manager')}
                    >
                      <span className="text-sm font-medium text-green-900">OCEAN Management</span>
                      <ChevronDown className={`h-4 w-4 text-green-600 transition-transform ${expandedRecommendations['ocean-manager'] ? 'rotate-180' : ''}`} />
                    </div>
                                         {expandedRecommendations['ocean-manager'] && (
                       <div className="mt-3 text-sm text-green-800">
                         <ul className="space-y-1">
                           {getDynamicRecommendations('ocean', 'manager').map((rec, index) => (
                             <li key={index}>• {rec}</li>
                           ))}
                         </ul>
                       </div>
                     )}
                  </div>
                </div>

                {/* Culture Recommendations */}
                <div className="mb-6">
                  <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">For the Candidate</div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleRecommendations('culture-candidate')}
                    >
                      <span className="text-sm font-medium text-blue-900">Cultural Adaptation</span>
                      <ChevronDown className={`h-4 w-4 text-blue-600 transition-transform ${expandedRecommendations['culture-candidate'] ? 'rotate-180' : ''}`} />
                    </div>
                                         {expandedRecommendations['culture-candidate'] && (
                       <div className="mt-3 text-sm text-blue-800">
                         <ul className="space-y-1">
                           {getDynamicRecommendations('culture', 'candidate').map((rec, index) => (
                             <li key={index}>• {rec}</li>
                           ))}
                         </ul>
                       </div>
                     )}
                  </div>
                  
                  <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-2">For the Hiring Manager</div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleRecommendations('culture-manager')}
                    >
                      <span className="text-sm font-medium text-green-900">Cultural Integration</span>
                      <ChevronDown className={`h-4 w-4 text-green-600 transition-transform ${expandedRecommendations['culture-manager'] ? 'rotate-180' : ''}`} />
                    </div>
                                         {expandedRecommendations['culture-manager'] && (
                       <div className="mt-3 text-sm text-green-800">
                         <ul className="space-y-1">
                           {getDynamicRecommendations('culture', 'manager').map((rec, index) => (
                             <li key={index}>• {rec}</li>
                           ))}
                         </ul>
                       </div>
                     )}
                  </div>
                </div>

                {/* Values Recommendations */}
                <div>
                  <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">For the Candidate</div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleRecommendations('values-candidate')}
                    >
                      <span className="text-sm font-medium text-blue-900">Values Alignment</span>
                      <ChevronDown className={`h-4 w-4 text-blue-600 transition-transform ${expandedRecommendations['values-candidate'] ? 'rotate-180' : ''}`} />
                    </div>
                                         {expandedRecommendations['values-candidate'] && (
                       <div className="mt-3 text-sm text-blue-800">
                         <ul className="space-y-1">
                           {getDynamicRecommendations('values', 'candidate').map((rec, index) => (
                             <li key={index}>• {rec}</li>
                           ))}
                         </ul>
                       </div>
                     )}
                  </div>
                  
                  <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-2">For the Hiring Manager</div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleRecommendations('values-manager')}
                    >
                      <span className="text-sm font-medium text-green-900">Values Management</span>
                      <ChevronDown className={`h-4 w-4 text-green-600 transition-transform ${expandedRecommendations['values-manager'] ? 'rotate-180' : ''}`} />
                    </div>
                                         {expandedRecommendations['values-manager'] && (
                       <div className="mt-3 text-sm text-green-800">
                         <ul className="space-y-1">
                           {getDynamicRecommendations('values', 'manager').map((rec, index) => (
                             <li key={index}>• {rec}</li>
                           ))}
                         </ul>
                       </div>
                     )}
                  </div>
                </div>

                                 {/* Section Summary */}
                 <div className="mt-6">
                   <h3 className="text-lg font-semibold mb-4">Section Summary</h3>
                   <p className="text-sm text-gray-600">{getSectionSummary('ocean')}</p>
                 </div>
                 
                 {/* Additional Section Summaries */}
                 <div className="mt-4">
                   <h4 className="text-md font-medium mb-2">Cultural Summary</h4>
                   <p className="text-sm text-gray-600">{getSectionSummary('culture')}</p>
                 </div>
                 
                 <div className="mt-4">
                   <h4 className="text-md font-medium mb-2">Values Summary</h4>
                   <p className="text-sm text-gray-600">{getSectionSummary('values')}</p>
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Team Integration Summary */}
        <Card className="mb-8 mt-8">
          <CardContent className="pt-6">
            <div className="max-w-6xl mx-auto">
              {/* Header - Consistent with page design */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Integration Summary</h2>
                <p className="text-gray-600">
                  Based on the comprehensive assessment results, here's how this candidate aligns with your team
                </p>
              </div>

              {/* Risk Assessment & Compatibility Matrix */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Risk Assessment */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      Integration Risk Assessment
                    </h3>
                    <div className="space-y-4">
                      {(() => {
                        const risks = [];
                        const oceanRisks = Object.entries(candidateData.scores.ocean)
                          .filter(([, score]) => Math.abs(score - teamData.aggregateScores.ocean[Object.keys(candidateData.scores.ocean)[0]]) > 30)
                          .map(([trait]) => ({ type: 'OCEAN', trait, severity: 'High' }));
                        
                        const cultureRisks = Object.entries(candidateData.scores.culture)
                          .filter(([, score]) => Math.abs(score - teamData.aggregateScores.culture[Object.keys(candidateData.scores.culture)[0]]) > 35)
                          .map(([pref]) => ({ type: 'Culture', trait: pref, severity: 'Medium' }));
                        
                        const valuesRisks = Object.entries(candidateData.scores.values)
                          .filter(([, score]) => Math.abs(score - teamData.aggregateScores.values[Object.keys(candidateData.scores.values)[0]]) > 25)
                          .map(([value]) => ({ type: 'Values', trait: value, severity: 'Low' }));
                        
                        return [...oceanRisks, ...cultureRisks, ...valuesRisks].length > 0 ? (
                          <div className="space-y-3">
                            {[...oceanRisks, ...cultureRisks, ...valuesRisks].map((risk, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className={`w-3 h-3 rounded-full ${
                                  risk.severity === 'High' ? 'bg-red-500' : 
                                  risk.severity === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}></div>
                                <div>
                                  <div className="font-medium text-red-900">{risk.type}: {risk.trait}</div>
                                  <div className="text-sm text-red-700">{risk.severity} risk - requires focused integration strategy</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                            <p className="text-green-700 font-medium">Low integration risk</p>
                            <p className="text-sm text-green-600">Candidate shows strong alignment across all dimensions</p>
                          </div>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Compatibility Matrix */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Compatibility Matrix
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(candidateData.scores.ocean).map(([trait, score]) => {
                        const teamScore = teamData.aggregateScores.ocean[trait];
                        const difference = Math.abs(score - teamScore);
                        const compatibility = difference < 15 ? 'Excellent' : difference < 25 ? 'Good' : difference < 35 ? 'Moderate' : 'Poor';
                        const color = difference < 15 ? 'text-green-600' : difference < 25 ? 'text-blue-600' : difference < 35 ? 'text-yellow-600' : 'text-red-600';
                        
                        return (
                          <div key={trait} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium capitalize">{trait}</span>
                            <span className={`text-sm font-semibold ${color}`}>{compatibility}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
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
                      <span className="text-green-700">{overallFit}% overall team fit score</span>
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
                      This summary is based on {candidateData.name}'s responses across OCEAN personality traits, 
                      cultural preferences, and value alignment. The {overallFit}% fit score indicates strong overall 
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
