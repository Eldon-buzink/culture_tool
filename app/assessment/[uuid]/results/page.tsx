'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Brain, Users, Target, TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';
import RadarChart from '@/components/RadarChart';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import EmailResultsModal from '@/components/EmailResultsModal';
import LoadingSpinner from '@/components/LoadingSpinner';

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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  // Check if user has completed all sections before allowing access
  useEffect(() => {
    const checkCompletion = async () => {
      if (!uuid) return;
      
      const sessionUserId = localStorage.getItem(`assessment-user-${uuid}`);
      if (!sessionUserId) {
        console.log('No session user ID found, redirecting to overview');
        window.location.href = `/assessment/${uuid}`;
        return;
      }
      
      try {
        const progressResponse = await fetch(`/api/assessments/${uuid}/responses?userId=${sessionUserId}`);
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          if (progressData.success) {
            const sectionCounts = { ocean: 0, culture: 0, values: 0 };
            progressData.responses.forEach((resp: any) => {
              if (sectionCounts[resp.section as keyof typeof sectionCounts] !== undefined) {
                sectionCounts[resp.section as keyof typeof sectionCounts]++;
              }
            });
            
            const allSectionsComplete = Object.values(sectionCounts).every(count => count >= 5);
            
            if (allSectionsComplete) {
              setIsAuthorized(true);
            } else {
              console.log('Not all sections complete, redirecting to overview');
              window.location.href = `/assessment/${uuid}`;
            }
          } else {
            console.log('Failed to get progress data, redirecting to overview');
            window.location.href = `/assessment/${uuid}`;
          }
        } else {
          console.log('Failed to get progress data, redirecting to overview');
          window.location.href = `/assessment/${uuid}`;
        }
      } catch (error) {
        console.error('Error checking completion:', error);
        window.location.href = `/assessment/${uuid}`;
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkCompletion();
  }, [uuid]);
  
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
        "Customer focus indicates your commitment to delivering value to others."
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

  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedRecommendations, setExpandedRecommendations] = useState<Record<string, boolean>>({});
  const [showTeamComparison, setShowTeamComparison] = useState(false);

  useEffect(() => {
    if (uuid) {
      // Try to fetch results, but fallback quickly if it fails
      const fetchWithFallback = async () => {
        try {
          await fetchResults();
        } catch (error) {
          console.log('Fetch failed, using mock data immediately');
          setResults(getMockResults());
          setLoading(false);
        }
      };
      
      // Start fetch immediately
      fetchWithFallback();
      
      // Fallback timeout - show error after 5 seconds if still loading
      const fallbackTimer = setTimeout(() => {
        if (loading) {
          console.log('Fallback: Loading took too long, showing error');
          setLoading(false);
        }
      }, 5000); // 5 second fallback
      
      return () => {
        clearTimeout(fallbackTimer);
      };
    }
  }, [uuid]);

  const generateResultsFromSession = async () => {
    // Get all responses from localStorage
    const allResponses = localStorage.getItem(`assessment-responses-${uuid}`) || '{}';
    const responses = JSON.parse(allResponses);
    
    // Calculate scores from responses
    const oceanScores = calculateOceanScores(responses.ocean || {});
    const cultureScores = calculateCultureScores(responses.culture || {});
    const valuesScores = calculateValuesScores(responses.values || {});
    
    // Generate insights based on scores
    const insights = generateInsights(oceanScores, cultureScores, valuesScores);
    
    // Generate AI recommendations
    let recommendations;
    try {
      const aiResponse = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ocean: oceanScores,
          culture: cultureScores,
          values: valuesScores
        })
      });
      
      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        recommendations = aiData.recommendations;
      } else {
        // Fallback to basic recommendations if AI fails
        recommendations = generateFallbackRecommendations(oceanScores, cultureScores, valuesScores);
      }
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
      recommendations = generateFallbackRecommendations(oceanScores, cultureScores, valuesScores);
    }
    
    return {
      oceanScores,
      cultureScores,
      valuesScores,
      insights,
      recommendations
    };
  };

  const calculateOceanScores = (responses: Record<string, number>) => {
    // Map question IDs to OCEAN dimensions
    const oceanMapping: Record<string, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'> = {
      'openness': 'openness',
      'conscientiousness': 'conscientiousness', 
      'extraversion': 'extraversion',
      'agreeableness': 'agreeableness',
      'neuroticism': 'neuroticism'
    };
    
    const scores = { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 };
    
    Object.entries(responses).forEach(([questionId, response]) => {
      const dimension = oceanMapping[questionId];
      if (dimension) {
        scores[dimension] = response;
      }
    });
    
    return scores;
  };

  const calculateCultureScores = (responses: Record<string, number>) => {
    const scores = { 
      powerDistance: 0, 
      individualism: 0, 
      masculinity: 0, 
      uncertaintyAvoidance: 0, 
      longTermOrientation: 0, 
      indulgence: 0 
    };
    
    Object.entries(responses).forEach(([questionId, response]) => {
      if (questionId in scores) {
        (scores as any)[questionId] = response;
      }
    });
    
    return scores;
  };

  const calculateValuesScores = (responses: Record<string, number>) => {
    const scores = { innovation: 0, collaboration: 0, autonomy: 0, quality: 0, customerFocus: 0 };
    
    Object.entries(responses).forEach(([questionId, response]) => {
      if (questionId in scores) {
        scores[questionId as keyof typeof scores] = response;
      }
    });
    
    return scores;
  };

  const generateInsights = (ocean: any, culture: any, values: any) => {
    return {
      ocean: [
        `Your openness score of ${ocean.openness} indicates ${ocean.openness >= 70 ? 'high' : ocean.openness >= 40 ? 'moderate' : 'low'} creativity and adaptability.`,
        `With conscientiousness at ${ocean.conscientiousness}, you show ${ocean.conscientiousness >= 70 ? 'strong' : ocean.conscientiousness >= 40 ? 'moderate' : 'flexible'} organization skills.`,
        `Your extraversion level of ${ocean.extraversion} suggests you prefer ${ocean.extraversion >= 70 ? 'high' : ocean.extraversion >= 40 ? 'moderate' : 'low'} social interaction.`
      ],
      culture: [
        `Your power distance preference of ${culture.powerDistance} indicates how you prefer ${culture.powerDistance >= 70 ? 'hierarchical' : culture.powerDistance >= 40 ? 'balanced' : 'flat'} work structures.`,
        `With individualism at ${culture.individualism}, you prefer ${culture.individualism >= 70 ? 'independent' : culture.individualism >= 40 ? 'balanced' : 'collaborative'} work styles.`,
        `Your uncertainty avoidance of ${culture.uncertaintyAvoidance} shows you prefer ${culture.uncertaintyAvoidance >= 70 ? 'structured' : culture.uncertaintyAvoidance >= 40 ? 'balanced' : 'flexible'} environments.`
      ],
      values: [
        `Your innovation score of ${values.innovation} indicates ${values.innovation >= 70 ? 'high' : values.innovation >= 40 ? 'moderate' : 'low'} preference for creative solutions.`,
        `With collaboration at ${values.collaboration}, you prefer ${values.collaboration >= 70 ? 'strong' : values.collaboration >= 40 ? 'moderate' : 'independent'} teamwork.`,
        `Your quality focus of ${values.quality} shows you prioritize ${values.quality >= 70 ? 'excellence' : values.quality >= 40 ? 'balance' : 'efficiency'} in your work.`
      ]
    };
  };

  const generateFallbackRecommendations = (ocean: any, culture: any, values: any) => {
    return {
      ocean: {
        insights: [`Your OCEAN profile shows a unique combination of traits that can guide your career choices.`],
        recommendations: [`Consider how your personality influences your work preferences and communication style.`],
        nextSteps: [`Reflect on how these traits show up in your daily work and relationships.`]
      },
      culture: {
        insights: [`Your cultural preferences suggest specific work environments where you'll thrive.`],
        recommendations: [`Seek out organizations that match your cultural preferences and work style.`],
        nextSteps: [`Research companies and teams that align with your cultural values.`]
      },
      values: {
        insights: [`Your work values indicate what truly motivates you professionally.`],
        recommendations: [`Look for roles that align with your highest-value areas.`],
        nextSteps: [`Identify specific job opportunities that match your values.`]
      },
      overall: {
        summary: 'Your assessment results reveal a unique combination of personality traits, work preferences, and values that can guide your career decisions.',
        keyStrengths: ['Self-awareness and willingness to understand your preferences'],
        developmentAreas: ['Understanding how to leverage your strengths effectively'],
        careerSuggestions: ['Consider roles that align with your highest scores']
      }
    };
  };

  const fetchResults = async () => {
    try {
      // Check if this is a session-based assessment
      const sessionData = localStorage.getItem(`assessment-session-${uuid}`);
      
      if (sessionData) {
        // This is a session-based assessment - generate results from localStorage
        const results = await generateResultsFromSession();
        setResults(results);
        setLoading(false);
        return;
      }
      
      // Try to fetch from database for existing assessments
      const response = await fetch(`/api/assessments/${uuid}/results`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (!data.success || !data.result) {
        console.log('No results found, using mock data');
        throw new Error('No results found');
      }
      
      setResults(data.result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching results:', error);
      throw error; // Re-throw to trigger the fallback in useEffect
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

  const getTermTooltip = (term: string) => {
    const tooltips: Record<string, string> = {
      'openness': 'Openness reflects your curiosity, imagination, and willingness to try new experiences. High scores indicate creativity and adaptability, while low scores suggest practicality and routine preference.',
      'conscientiousness': 'Conscientiousness measures your organization, responsibility, and self-discipline. High scores indicate reliability and attention to detail, while low scores suggest flexibility and spontaneity.',
      'extraversion': 'Extraversion reflects your social energy and assertiveness. High scores indicate outgoing, energetic behavior, while low scores suggest reserved, thoughtful tendencies.',
      'agreeableness': 'Agreeableness measures your cooperation, trust, and compassion. High scores indicate helpfulness and empathy, while low scores suggest directness and competitiveness.',
      'neuroticism': 'Neuroticism reflects emotional stability and stress response. High scores indicate sensitivity to stress, while low scores suggest emotional resilience and calmness.',
      'powerDistance': 'Power Distance reflects your comfort with hierarchical structures and authority. High scores indicate preference for clear leadership, while low scores suggest egalitarian work environments.',
      'individualism': 'Individualism measures your preference for working independently vs. in teams. High scores indicate self-reliance, while low scores suggest collaborative work styles.',
      'masculinity': 'Masculinity reflects competitive vs. cooperative work preferences. High scores indicate achievement focus, while low scores suggest relationship and quality of life focus.',
      'uncertaintyAvoidance': 'Uncertainty Avoidance measures your comfort with ambiguity and change. High scores indicate preference for structure and rules, while low scores suggest adaptability to change.',
      'longTermOrientation': 'Long-term Orientation reflects your focus on future planning vs. immediate results. High scores indicate strategic thinking, while low scores suggest short-term focus.',
      'indulgence': 'Indulgence measures your preference for enjoying life vs. restraint. High scores indicate work-life balance focus, while low scores suggest discipline and restraint.',
      'innovation': 'Innovation reflects your preference for new approaches and creative solutions. High scores indicate adaptability to change, while low scores suggest preference for proven methods.',
      'collaboration': 'Collaboration measures your preference for teamwork and shared success. High scores indicate cooperative work style, while low scores suggest independent achievement focus.',
      'autonomy': 'Autonomy reflects your need for independence and self-direction. High scores indicate preference for freedom, while low scores suggest appreciation for guidance and structure.',
      'quality': 'Quality reflects your focus on excellence and attention to detail. High scores indicate perfectionist tendencies, while low scores suggest efficiency and speed focus.',
      'customerFocus': 'Customer Focus measures your orientation toward serving others and meeting needs. High scores indicate service orientation, while low scores suggest task or product focus.'
    };
    
    return tooltips[term.toLowerCase()] || 'No explanation available for this term.';
  };

  // Show loading while checking authorization
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Verifying assessment completion...</p>
        </div>
      </div>
    );
  }
  
  // Show unauthorized message if not all sections complete
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please complete all assessment sections before viewing results.</p>
          <Button onClick={() => window.location.href = `/assessment/${uuid}`}>
            Return to Assessment
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <LoadingSpinner size="xl" text="Analyzing your responses..." />
          <div className="mt-8 max-w-md mx-auto">
            <p className="text-gray-600 mb-4">We're processing your assessment data to generate personalized insights.</p>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Processing personality traits...</span>
                <span>✓</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Analyzing cultural preferences...</span>
                <span>✓</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Generating recommendations...</span>
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
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
        <div className="text-center mb-8 px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Your Assessment Results</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
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
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{trait}</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
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
                    <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" onClick={() => toggleRecommendation('ocean', index)}>
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {expandedRecommendations[`ocean-${index}`] ? 'Click to collapse' : 'Click to expand'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-gray-200"
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
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{dimension.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{getTermTooltip(dimension)}</p>
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
                    <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" onClick={() => toggleRecommendation('culture', index)}>
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {expandedRecommendations[`culture-${index}`] ? 'Click to collapse' : 'Click to expand'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-gray-200"
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
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{value.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{getTermTooltip(value)}</p>
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
                    <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" onClick={() => toggleRecommendation('values', index)}>
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {expandedRecommendations[`values-${index}`] ? 'Click to collapse' : 'Click to expand'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-gray-200"
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



        {/* Action Buttons */}
        <div className="mt-8">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Your Results</h3>
            <p className="text-gray-600">Keep your results for future reference</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Button 
              onClick={() => window.print()} 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print Results</span>
            </Button>
            

            
            <Button 
              onClick={() => setShowEmailModal(true)}
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Email Results</span>
            </Button>
            
            <Button 
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                alert('Results link copied to clipboard! You can share this link to access your results later.');
              }} 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span>Copy Link</span>
            </Button>
          </div>
          
          <div className="text-center">
            <Button onClick={() => window.location.href = '/'} className="bg-blue-600 hover:bg-blue-700">
              Take Another Assessment
            </Button>
          </div>
        </div>
      </div>
      
      {/* Email Results Modal */}
      {results && (
        <EmailResultsModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          assessmentId={uuid as string}
          resultsUrl={window.location.href}
          oceanScores={results.oceanScores}
          cultureScores={results.cultureScores}
          valuesScores={results.valuesScores}
          topInsights={[
            results.insights.ocean[0],
            results.insights.culture[0],
            results.insights.values[0]
          ]}
        />
      )}
    </div>
  );
}
