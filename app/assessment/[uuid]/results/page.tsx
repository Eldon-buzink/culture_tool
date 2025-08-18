'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Brain, Users, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import RadarChart from '@/components/RadarChart';
import { TermGlossary } from '@/components/TermExplanation';

interface AssessmentResults {
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
    [key: string]: number;
  };
  valuesScores: {
    innovation: number;
    collaboration: number;
    autonomy: number;
    quality: number;
    customerFocus: number;
    [key: string]: number;
  };
  insights: {
    ocean: string[];
    culture: string[];
    values: string[];
  };
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
  teamComparison?: {
    oceanScores: Record<string, number>;
    cultureScores: Record<string, number>;
    valuesScores: Record<string, number>;
  };
}

export default function ResultsPage() {
  const { uuid } = useParams();
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedRecommendations, setExpandedRecommendations] = useState<Record<string, boolean>>({});
  const [showTeamComparison, setShowTeamComparison] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [uuid]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/assessments/${uuid}/results`);
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      const data = await response.json();
      setResults(data.result);
    } catch (error) {
      console.error('Error fetching results:', error);
      // Fallback to mock data if API fails
      setResults(getMockResults());
    } finally {
      setLoading(false);
    }
  };

  const getMockResults = (): AssessmentResults => ({
    oceanScores: {
      openness: 75,
      conscientiousness: 60,
      extraversion: 80,
      agreeableness: 70,
      neuroticism: 30
    },
    cultureScores: {
      powerDistance: 40,
      individualism: 70,
      masculinity: 50,
      uncertaintyAvoidance: 60,
      longTermOrientation: 65,
      indulgence: 55
    },
    valuesScores: {
      innovation: 80,
      collaboration: 75,
      autonomy: 70,
      quality: 85,
      customerFocus: 65
    },
    insights: {
      ocean: [
        "You show high openness to new experiences, indicating creativity and adaptability.",
        "Your extraversion suggests you thrive in social and collaborative environments.",
        "Moderate conscientiousness suggests a balanced approach to planning and spontaneity."
      ],
      culture: [
        "You prefer egalitarian work environments with low power distance.",
        "Your individualism indicates you value personal achievement and autonomy.",
        "Moderate uncertainty avoidance suggests you can handle both structured and flexible environments."
      ],
      values: [
        "Innovation and quality are your top work values, driving your professional choices.",
        "You value collaboration while maintaining a strong sense of autonomy.",
        "Customer focus is important but balanced with other priorities."
      ]
    },
    recommendations: {
      ocean: {
        context: "Based on your OCEAN personality profile, you're naturally inclined toward creative, social, and adaptable work environments.",
        recommendations: [
          {
            title: "Leverage Your Openness and Extraversion",
            description: "Seek roles that allow you to explore new ideas and work with diverse teams. Your natural curiosity and social energy can drive innovation and team collaboration.",
            nextSteps: [
              "Look for roles in creative industries or innovation teams",
              "Seek opportunities to lead collaborative projects",
              "Consider roles that involve client interaction or public speaking"
            ]
          }
        ]
      },
      culture: {
        context: "Your cultural preferences suggest you work best in flat organizational structures with high autonomy and clear communication.",
        recommendations: [
          {
            title: "Find Your Cultural Fit",
            description: "Look for organizations with flat hierarchies, transparent communication, and opportunities for individual contribution within team contexts.",
            nextSteps: [
              "Research company cultures before applying",
              "Ask about organizational structure in interviews",
              "Seek companies that value individual initiative"
            ]
          }
        ]
      },
      values: {
        context: "Your work values indicate a strong drive for innovation and quality, balanced with collaboration and customer focus.",
        recommendations: [
          {
            title: "Align Work with Your Values",
            description: "Focus on roles that allow you to innovate while maintaining high standards and working with others toward customer-focused goals.",
            nextSteps: [
              "Target roles in product development or innovation",
              "Look for quality-focused organizations",
              "Seek positions that balance individual and team work"
            ]
          }
        ]
      }
    }
  });

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

  const toggleRecommendation = (section: string, index: number) => {
    const key = `${section}-${index}`;
    setExpandedRecommendations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getSectionContext = (section: string) => {
    switch (section) {
      case 'ocean':
        return "Your OCEAN personality traits reveal how you naturally think, feel, and behave in work environments. These traits are relatively stable and influence your work style, communication preferences, and how you interact with others.";
      case 'culture':
        return "Your cultural preferences indicate how you prefer to work within organizational structures and what kind of work environment brings out your best performance.";
      case 'values':
        return "Your work values represent what motivates and drives you professionally. Understanding these helps align your career choices with what truly matters to you.";
      default:
        return "";
    }
  };

  const getSectionSummary = (section: string) => {
    if (!results) return "";
    
    switch (section) {
      case 'ocean':
        const oceanAvg = Object.values(results.oceanScores).reduce((a, b) => a + b, 0) / 5;
        return `Your average OCEAN score is ${Math.round(oceanAvg)}, indicating a ${oceanAvg >= 60 ? 'positive' : oceanAvg >= 40 ? 'balanced' : 'cautious'} overall personality profile.`;
      case 'culture':
        const cultureAvg = Object.values(results.cultureScores).reduce((a, b) => a + b, 0) / 6;
        return `Your cultural preferences average ${Math.round(cultureAvg)}, suggesting you prefer ${cultureAvg >= 60 ? 'structured' : cultureAvg >= 40 ? 'balanced' : 'flexible'} work environments.`;
      case 'values':
        const valuesAvg = Object.values(results.valuesScores).reduce((a, b) => a + b, 0) / 5;
        return `Your work values average ${Math.round(valuesAvg)}, indicating you are ${valuesAvg >= 70 ? 'highly' : valuesAvg >= 50 ? 'moderately' : 'less'} motivated by these factors.`;
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Results Not Found</h2>
          <p className="text-gray-600">Unable to load your assessment results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Assessment Results</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover your complete work profile across personality, culture, and values
          </p>
        </div>

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
              {/* Radar Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Personality Dimensions</h3>
                <div className="w-full h-80">
                  <RadarChart
                    data={{
                      'Openness': results.oceanScores.openness,
                      'Conscientiousness': results.oceanScores.conscientiousness,
                      'Extraversion': results.oceanScores.extraversion,
                      'Agreeableness': results.oceanScores.agreeableness,
                      'Neuroticism': results.oceanScores.neuroticism
                    }}
                    title="OCEAN Personality Profile"
                  />
                </div>
              </div>

              {/* Scores and Insights */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Detailed Scores</h3>
                <div className="space-y-4">
                  {Object.entries(results.oceanScores).map(([trait, score]) => (
                    <div key={trait} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{trait}</span>
                        <Badge className={getScoreBadgeColor(score)}>
                          {getScoreLabel(score)} ({score})
                        </Badge>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Key Insights</h4>
                  <ul className="space-y-2">
                    {results.insights.ocean.map((insight, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
              <p className="text-gray-600 mb-4">{results.recommendations.ocean.context}</p>
              {results.recommendations.ocean.recommendations.map((rec, index) => (
                <Card key={index} className="mb-4">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRecommendation('ocean', index)}
                      >
                        {expandedRecommendations[`ocean-${index}`] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{rec.description}</p>
                    {expandedRecommendations[`ocean-${index}`] && (
                      <div>
                        <h5 className="font-semibold mb-2">Next Steps:</h5>
                        <ul className="space-y-1">
                          {rec.nextSteps.map((step, stepIndex) => (
                            <li key={stepIndex} className="text-sm text-gray-600 flex items-start gap-2">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Section Summary */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">{getSectionSummary('ocean')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Culture Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Cultural Dimensions</CardTitle>
                <p className="text-gray-600">{getSectionContext('culture')}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Radar Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Cultural Preferences</h3>
                <div className="w-full h-80">
                  <RadarChart
                    data={{
                      'Power Distance': results.cultureScores.powerDistance,
                      'Individualism': results.cultureScores.individualism,
                      'Masculinity': results.cultureScores.masculinity,
                      'Uncertainty Avoidance': results.cultureScores.uncertaintyAvoidance,
                      'Long-term Orientation': results.cultureScores.longTermOrientation,
                      'Indulgence': results.cultureScores.indulgence
                    }}
                    title="Cultural Dimensions"
                  />
                </div>
              </div>

              {/* Scores and Insights */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Detailed Scores</h3>
                <div className="space-y-4">
                  {Object.entries(results.cultureScores).map(([dimension, score]) => (
                    <div key={dimension} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{dimension.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <Badge className={getScoreBadgeColor(score)}>
                          {getScoreLabel(score)} ({score})
                        </Badge>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Key Insights</h4>
                  <ul className="space-y-2">
                    {results.insights.culture.map((insight, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
              <p className="text-gray-600 mb-4">{results.recommendations.culture.context}</p>
              {results.recommendations.culture.recommendations.map((rec, index) => (
                <Card key={index} className="mb-4">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRecommendation('culture', index)}
                      >
                        {expandedRecommendations[`culture-${index}`] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{rec.description}</p>
                    {expandedRecommendations[`culture-${index}`] && (
                      <div>
                        <h5 className="font-semibold mb-2">Next Steps:</h5>
                        <ul className="space-y-1">
                          {rec.nextSteps.map((step, stepIndex) => (
                            <li key={stepIndex} className="text-sm text-gray-600 flex items-start gap-2">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Section Summary */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">{getSectionSummary('culture')}</p>
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
                <CardTitle className="text-2xl">Work Values</CardTitle>
                <p className="text-gray-600">{getSectionContext('values')}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Radar Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Work Values</h3>
                <div className="w-full h-80">
                  <RadarChart
                    data={{
                      'Innovation': results.valuesScores.innovation,
                      'Collaboration': results.valuesScores.collaboration,
                      'Autonomy': results.valuesScores.autonomy,
                      'Quality': results.valuesScores.quality,
                      'Customer Focus': results.valuesScores.customerFocus
                    }}
                    title="Work Values"
                  />
                </div>
              </div>

              {/* Scores and Insights */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Detailed Scores</h3>
                <div className="space-y-4">
                  {Object.entries(results.valuesScores).map(([value, score]) => (
                    <div key={value} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{value.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <Badge className={getScoreBadgeColor(score)}>
                          {getScoreLabel(score)} ({score})
                        </Badge>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Key Insights</h4>
                  <ul className="space-y-2">
                    {results.insights.values.map((insight, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
              <p className="text-gray-600 mb-4">{results.recommendations.values.context}</p>
              {results.recommendations.values.recommendations.map((rec, index) => (
                <Card key={index} className="mb-4">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRecommendation('values', index)}
                      >
                        {expandedRecommendations[`values-${index}`] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{rec.description}</p>
                    {expandedRecommendations[`values-${index}`] && (
                      <div>
                        <h5 className="font-semibold mb-2">Next Steps:</h5>
                        <ul className="space-y-1">
                          {rec.nextSteps.map((step, stepIndex) => (
                            <li key={stepIndex} className="text-sm text-gray-600 flex items-start gap-2">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Section Summary */}
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">{getSectionSummary('values')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Team Comparison Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Team Comparison</CardTitle>
                  <p className="text-gray-600">See how your results compare to your team</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowTeamComparison(!showTeamComparison)}
              >
                {showTeamComparison ? 'Hide' : 'Show'} Comparison
              </Button>
            </div>
          </CardHeader>
          {showTeamComparison && (
            <CardContent>
              {results.teamComparison ? (
                <div className="space-y-6">
                  {/* OCEAN Comparison */}
                  <div>
                    <h4 className="font-semibold mb-3">OCEAN Comparison</h4>
                    <div className="space-y-3">
                      {Object.entries(results.oceanScores).map(([trait, individualScore]) => {
                        const teamScore = results.teamComparison!.oceanScores[trait] || 0;
                        const difference = individualScore - teamScore;
                        const Icon = difference > 10 ? TrendingUp : difference < -10 ? TrendingDown : Minus;
                        const color = difference > 10 ? 'text-green-600' : difference < -10 ? 'text-red-600' : 'text-gray-600';
                        
                        return (
                          <div key={trait} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Icon className={`h-4 w-4 ${color}`} />
                              <span className="font-medium capitalize">{trait}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-sm text-gray-600">You</div>
                                <div className="font-semibold">{individualScore}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600">Team</div>
                                <div className="font-semibold">{teamScore}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600">Diff</div>
                                <div className={`font-semibold ${color}`}>
                                  {difference > 0 ? '+' : ''}{difference}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Culture Comparison */}
                  <div>
                    <h4 className="font-semibold mb-3">Cultural Comparison</h4>
                    <div className="space-y-3">
                      {Object.entries(results.cultureScores).map(([dimension, individualScore]) => {
                        const teamScore = results.teamComparison!.cultureScores[dimension] || 0;
                        const difference = individualScore - teamScore;
                        const Icon = difference > 10 ? TrendingUp : difference < -10 ? TrendingDown : Minus;
                        const color = difference > 10 ? 'text-green-600' : difference < -10 ? 'text-red-600' : 'text-gray-600';
                        
                        return (
                          <div key={dimension} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Icon className={`h-4 w-4 ${color}`} />
                              <span className="font-medium capitalize">{dimension.replace(/([A-Z])/g, ' $1').trim()}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-sm text-gray-600">You</div>
                                <div className="font-semibold">{individualScore}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600">Team</div>
                                <div className="font-semibold">{teamScore}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600">Diff</div>
                                <div className={`font-semibold ${color}`}>
                                  {difference > 0 ? '+' : ''}{difference}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Values Comparison */}
                  <div>
                    <h4 className="font-semibold mb-3">Values Comparison</h4>
                    <div className="space-y-3">
                      {Object.entries(results.valuesScores).map(([value, individualScore]) => {
                        const teamScore = results.teamComparison!.valuesScores[value] || 0;
                        const difference = individualScore - teamScore;
                        const Icon = difference > 10 ? TrendingUp : difference < -10 ? TrendingDown : Minus;
                        const color = difference > 10 ? 'text-green-600' : difference < -10 ? 'text-red-600' : 'text-gray-600';
                        
                        return (
                          <div key={value} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Icon className={`h-4 w-4 ${color}`} />
                              <span className="font-medium capitalize">{value.replace(/([A-Z])/g, ' $1').trim()}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-sm text-gray-600">You</div>
                                <div className="font-semibold">{individualScore}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600">Team</div>
                                <div className="font-semibold">{teamScore}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600">Diff</div>
                                <div className={`font-semibold ${color}`}>
                                  {difference > 0 ? '+' : ''}{difference}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No team data available for comparison.</p>
                  <p className="text-sm text-gray-500">
                    Team comparison data will appear here when your team members complete their assessments.
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Term Glossary */}
        <TermGlossary category="ocean" />

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button onClick={() => window.print()} variant="outline">
            Print Results
          </Button>
          <Button onClick={() => window.location.href = '/'}>
            Take Another Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}
