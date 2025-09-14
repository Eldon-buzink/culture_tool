'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Brain, Users, Target, TrendingUp, TrendingDown, Minus, HelpCircle, Lightbulb, Award, AlertTriangle } from 'lucide-react';
import dynamic from "next/dynamic";
const RadarChart = dynamic(() => import("@/components/RadarChart"), { ssr: false });
import ContextBanner from '@/components/ContextBanner';
import { RecList } from '@/components/RecList';
import { scoreToBand, traitMeta, Trait } from '@/lib/interpretation';
import { buildIndividualRecs } from '@/lib/recommendations';

export default function DemoIndividualResultsHybridPage() {
  const [expandedRecommendations, setExpandedRecommendations] = useState<Record<string, boolean>>({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [expandedConversationStarters, setExpandedConversationStarters] = useState<Record<string, boolean>>({});

  // Demo data showing what users will get
  const demoResults = {
    oceanScores: {
      openness: 78,
      conscientiousness: 65,
      extraversion: 72,
      agreeableness: 68,
      neuroticism: 35
    },
    cultureScores: {
      powerDistance: 42,
      individualism: 71,
      masculinity: 58,
      uncertaintyAvoidance: 55,
      longTermOrientation: 63,
      indulgence: 67
    },
    valuesScores: {
      innovation: 82,
      collaboration: 75,
      autonomy: 69,
      quality: 78,
      customerFocus: 71
    },
    insights: {
      ocean: [
        "You show high openness to new experiences, indicating creativity and adaptability.",
        "Your extraversion suggests you thrive in social and collaborative environments.",
        "Moderate conscientiousness suggests a balanced approach to planning and spontaneity.",
        "Your agreeableness indicates strong teamwork and cooperation skills.",
        "Low neuroticism shows emotional stability and stress resilience."
      ],
      culture: [
        "You prefer egalitarian work environments with low power distance.",
        "Your individualism indicates you value personal achievement and autonomy.",
        "Moderate masculinity suggests balanced competitive and cooperative preferences.",
        "Your uncertainty avoidance shows comfort with both structure and flexibility.",
        "Long-term orientation indicates strategic thinking and future planning."
      ],
      values: [
        "Innovation and quality are your top work values, driving your professional choices.",
        "You value collaboration while maintaining a strong sense of autonomy.",
        "Customer focus indicates your commitment to delivering value to others.",
        "Quality focus shows your attention to excellence and detail.",
        "Autonomy preference suggests you work best with independence and trust."
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
          },
          {
            title: "Balance Conscientiousness with Flexibility",
            description: "Your moderate conscientiousness allows you to be both organized and adaptable. Use this to create structured processes that can evolve with changing needs.",
            nextSteps: [
              "Develop flexible project management approaches",
              "Create systems that balance planning with spontaneity",
              "Help teams maintain quality while staying agile"
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
  };

  // Get style preferences using interpretation system
  const getStyleLabel = (trait: string, score: number) => {
    const traitKey = trait as Trait;
    const band = scoreToBand(score);
    return traitMeta[traitKey]?.bands[band]?.styleLabel || 'Balanced';
  };

  // Get explanation for style preferences
  const getStyleExplanation = (trait: string, score: number) => {
    const traitKey = trait as Trait;
    const band = scoreToBand(score);
    const meta = traitMeta[traitKey];
    if (!meta) return 'No explanation available.';
    
    const bandInfo = meta.bands[band];
    if (!bandInfo) return 'No explanation available.';
    
    return bandInfo.tagline || 'No explanation available.';
  };

  // Get detailed explanation for style preferences
  const getDetailedStyleExplanation = (trait: string, score: number) => {
    const traitKey = trait as Trait;
    const band = scoreToBand(score);
    const meta = traitMeta[traitKey];
    if (!meta) return 'No detailed explanation available.';
    
    const bandInfo = meta.bands[band];
    if (!bandInfo) return 'No detailed explanation available.';
    
    // Use tagline as the detailed explanation since description doesn't exist
    return bandInfo.tagline || 'No detailed explanation available.';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 text-green-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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

  const toggleTooltip = (term: string) => {
    setActiveTooltip(activeTooltip === term ? null : term);
  };

  const toggleConversationStarter = (index: number) => {
    setExpandedConversationStarters(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Generate conversation starters with context
  const conversationStarters = [
    {
      question: "Where has your 'Frontier-seeker' approach been an advantage lately?",
      context: "This explores how your high openness to new experiences has helped you or your team recently. Think about times when your curiosity and willingness to try new things led to positive outcomes."
    },
    {
      question: "What small agreement could the team make to better leverage your planning strengths?",
      context: "This focuses on your conscientiousness and how the team can create structures that allow your organizational skills to benefit everyone while respecting different working styles."
    },
    {
      question: "How can we create an environment where your reliability and attention to detail shine?",
      context: "This addresses how to set up work processes that play to your strengths in being dependable and thorough, while ensuring others can contribute their unique skills too."
    },
    {
      question: "What working style preferences would help you be most effective in your role?",
      context: "This is about understanding your specific needs and preferences so the team can create an environment where you can do your best work and feel most engaged."
    }
  ];

  // Generate recommendations using interpretation system - filter out quick wins
  const allRecommendations = buildIndividualRecs(demoResults.oceanScores);
  const oceanRecommendations = allRecommendations
    .filter(rec => rec.startsWith('Try this •'))
    .map(rec => rec.replace('Try this • ', ''));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center mb-8 px-4">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Lightbulb className="h-4 w-4" />
              Demo Results
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">See What You'll Get</h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              This is an example of the comprehensive results you'll receive after completing your personality assessment
            </p>
            <div className="mt-6">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 px-8 py-3"
                onClick={() => window.location.href = '/assessment/start-assessment'}
              >
                Start Your Assessment Now
              </Button>
            </div>
          </div>

          {/* Context Banner */}
          <ContextBanner />

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
                <div className="mb-8 min-w-0">
                  <RadarChart
                    data={{
                      'Openness': demoResults.oceanScores.openness,
                      'Conscientiousness': demoResults.oceanScores.conscientiousness,
                      'Extraversion': demoResults.oceanScores.extraversion,
                      'Agreeableness': demoResults.oceanScores.agreeableness,
                      'Neuroticism': demoResults.oceanScores.neuroticism
                    }}
                    title="Your Personality Dimensions"
                    size={350}
                  />
                </div>

                {/* Your Style Preferences */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Your Style Preferences</h3>
                  <div className="space-y-4">
                    {Object.entries(demoResults.oceanScores).map(([trait, score]) => (
                      <div key={trait} className="space-y-2">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">{trait}</span>
                              <div className="relative">
                                <button
                                  onClick={() => toggleTooltip(trait)}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <HelpCircle className="h-4 w-4" />
                                </button>
                                {activeTooltip === trait && (
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-80">
                                    <div className="text-sm text-gray-700 leading-relaxed">
                                      {getTermTooltip(trait)}
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveTooltip(null);
                                      }}
                                      className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge className={getScoreBadgeColor(score)}>
                              {getStyleLabel(trait, score)} ({score})
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 italic">
                            {getDetailedStyleExplanation(trait, score)}
                          </div>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Key Insights + AI Recommendations + Conversation Starters */}
              <div className="space-y-6">
                {/* Key Insights */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                  <ul className="space-y-2">
                    {demoResults.insights.ocean.map((insight, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Recommendations with Try This content */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => toggleRecommendation('ocean', 0)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Brain className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900">AI Recommendations</h4>
                          <p className="text-sm text-blue-700">Personalized recommendations based on your personality profile</p>
                        </div>
                      </div>
                      {expandedRecommendations['ocean-0'] ? (
                        <ChevronUp className="h-5 w-5 text-blue-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                  
                  {expandedRecommendations['ocean-0'] && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="space-y-4">
                        <div className="mb-8 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-200">
                          <h5 className="font-medium text-gray-900 mb-2">Context</h5>
                          <p className="text-gray-700 text-sm">{demoResults.recommendations.ocean.context}</p>
                        </div>
                        
                        {demoResults.recommendations.ocean.recommendations.map((rec, index) => (
                          <div key={index} className="border-l-4 border-blue-200 pl-4">
                            <h6 className="font-medium text-gray-900 mb-2">{rec.title}</h6>
                            <p className="text-gray-700 text-sm mb-3">{rec.description}</p>
                            <div>
                              <h6 className="font-medium text-gray-900 text-sm mb-2">Next Steps:</h6>
                              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                                {rec.nextSteps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    {step}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="mt-4">
                              <h6 className="font-medium text-gray-900 text-sm mb-2">Try this:</h6>
                              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                                {oceanRecommendations.map((rec, recIndex) => (
                                  <li key={recIndex} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                <Users className="h-6 w-6 text-green-600" />
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
                <div className="mb-8 min-w-0">
                  <RadarChart
                    data={{
                      'Power Distance': demoResults.cultureScores.powerDistance,
                      'Individualism': demoResults.cultureScores.individualism,
                      'Masculinity': demoResults.cultureScores.masculinity,
                      'Uncertainty Avoidance': demoResults.cultureScores.uncertaintyAvoidance,
                      'Long-term Orientation': demoResults.cultureScores.longTermOrientation,
                      'Indulgence': demoResults.cultureScores.indulgence
                    }}
                    title="Your Cultural Dimensions"
                    size={350}
                  />
                </div>

                {/* Your Style Preferences */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Your Style Preferences</h3>
                  <div className="space-y-4">
                    {Object.entries(demoResults.cultureScores).map(([dimension, score]) => (
                      <div key={dimension} className="space-y-2">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">{dimension.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <div className="relative">
                                <button
                                  onClick={() => toggleTooltip(dimension)}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <HelpCircle className="h-4 w-4" />
                                </button>
                                {activeTooltip === dimension && (
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-80">
                                    <div className="text-sm text-gray-700 leading-relaxed">
                                      {getTermTooltip(dimension)}
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveTooltip(null);
                                      }}
                                      className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge className={getScoreBadgeColor(score)}>
                              {getStyleLabel(dimension, score)} ({score})
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 italic">
                            {getDetailedStyleExplanation(dimension, score)}
                          </div>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Key Insights + AI Recommendations + Conversation Starters */}
              <div className="space-y-6">
                {/* Key Insights */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                  <ul className="space-y-2">
                    {demoResults.insights.culture.map((insight, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Recommendations */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="p-4 bg-green-50 cursor-pointer hover:bg-green-100 transition-colors"
                    onClick={() => toggleRecommendation('culture', 0)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-900">AI Recommendations</h4>
                          <p className="text-sm text-green-700">Find your ideal work environment and organizational culture</p>
                        </div>
                      </div>
                      {expandedRecommendations['culture-0'] ? (
                        <ChevronUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                  
                  {expandedRecommendations['culture-0'] && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Context</h5>
                          <p className="text-gray-700 text-sm">{demoResults.recommendations.culture.context}</p>
                        </div>
                        
                        {demoResults.recommendations.culture.recommendations.map((rec, index) => (
                          <div key={index} className="border-l-4 border-green-200 pl-4">
                            <h6 className="font-medium text-gray-900 mb-2">{rec.title}</h6>
                            <p className="text-gray-700 text-sm mb-3">{rec.description}</p>
                            <div>
                              <h6 className="font-medium text-gray-900 text-sm mb-2">Next Steps:</h6>
                              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                                {rec.nextSteps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    {step}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                <CardTitle className="text-2xl">Work Values Assessment</CardTitle>
                <p className="text-gray-600">{getSectionContext('values')}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Radar Chart + Detailed Scores */}
              <div className="space-y-8">
                {/* Radar Chart */}
                <div className="mb-8 min-w-0">
                  <RadarChart
                    data={{
                      'Innovation': demoResults.valuesScores.innovation,
                      'Collaboration': demoResults.valuesScores.collaboration,
                      'Autonomy': demoResults.valuesScores.autonomy,
                      'Quality': demoResults.valuesScores.quality,
                      'Customer Focus': demoResults.valuesScores.customerFocus
                    }}
                    title="Your Work Values"
                    size={350}
                  />
                </div>

                {/* Your Style Preferences */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Your Style Preferences</h3>
                  <div className="space-y-4">
                    {Object.entries(demoResults.valuesScores).map(([value, score]) => (
                      <div key={value} className="space-y-2">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">{value.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <div className="relative">
                                <button
                                  onClick={() => toggleTooltip(value)}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <HelpCircle className="h-4 w-4" />
                                </button>
                                {activeTooltip === value && (
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-80">
                                    <div className="text-sm text-gray-700 leading-relaxed">
                                      {getTermTooltip(value)}
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveTooltip(null);
                                      }}
                                      className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge className={getScoreBadgeColor(score)}>
                              {getStyleLabel(value, score)} ({score})
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 italic">
                            {getDetailedStyleExplanation(value, score)}
                          </div>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Key Insights + AI Recommendations + Conversation Starters */}
              <div className="space-y-6">
                {/* Key Insights */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                  <ul className="space-y-2">
                    {demoResults.insights.values.map((insight, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Recommendations */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="p-4 bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={() => toggleRecommendation('values', 0)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Target className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-purple-900">AI Recommendations</h4>
                          <p className="text-sm text-purple-700">Align your career choices with what truly matters to you</p>
                        </div>
                      </div>
                      {expandedRecommendations['values-0'] ? (
                        <ChevronUp className="h-5 w-5 text-purple-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                  </div>
                  
                  {expandedRecommendations['values-0'] && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Context</h5>
                          <p className="text-gray-700 text-sm">{demoResults.recommendations.values.context}</p>
                        </div>
                        
                        {demoResults.recommendations.values.recommendations.map((rec, index) => (
                          <div key={index} className="border-l-4 border-purple-200 pl-4">
                            <h6 className="font-medium text-gray-900 mb-2">{rec.title}</h6>
                            <p className="text-gray-700 text-sm mb-3">{rec.description}</p>
                            <div>
                              <h6 className="font-medium text-gray-900 text-sm mb-2">Next Steps:</h6>
                              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                                {rec.nextSteps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                    {step}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Summary Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Award className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Your Complete Profile Summary</CardTitle>
                <p className="text-gray-600">A comprehensive overview of your personality, cultural preferences, and work values</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Overall Summary */}
              <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Lightbulb className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-900 mb-3">Your Unique Profile</h3>
                    <p className="text-indigo-800 leading-relaxed">
                      You're a <strong>Frontier-seeker</strong> with high openness to new experiences and strong extraversion, 
                      making you naturally drawn to creative, social environments. Your moderate conscientiousness allows you 
                      to balance planning with flexibility, while your high agreeableness makes you an excellent team player. 
                      Your low neuroticism indicates emotional stability and stress resilience.
                    </p>
                    <p className="text-indigo-800 leading-relaxed mt-3">
                      Culturally, you prefer <strong>egalitarian work environments</strong> with low power distance and high 
                      individualism, indicating you value autonomy within collaborative settings. Your work values center around 
                      <strong>innovation and quality</strong>, with a strong customer focus and appreciation for both collaboration 
                      and independence.
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Strengths */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Strengths</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h5 className="font-medium text-green-900">Creative Problem Solver</h5>
                        <p className="text-sm text-green-700">Your high openness and innovation focus make you excellent at finding creative solutions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h5 className="font-medium text-green-900">Natural Collaborator</h5>
                        <p className="text-sm text-green-700">Your extraversion and agreeableness make you a great team player and communicator</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h5 className="font-medium text-green-900">Quality Focused</h5>
                        <p className="text-sm text-green-700">Your work values emphasize excellence and attention to detail</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h5 className="font-medium text-green-900">Adaptable Leader</h5>
                        <p className="text-sm text-green-700">Your balanced conscientiousness allows you to lead with both structure and flexibility</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h5 className="font-medium text-green-900">Customer-Centric</h5>
                        <p className="text-sm text-green-700">Your strong customer focus drives you to deliver value to others</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h5 className="font-medium text-green-900">Emotionally Stable</h5>
                        <p className="text-sm text-green-700">Your low neuroticism helps you stay calm and focused under pressure</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Development Areas */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Areas for Growth</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-medium text-yellow-900">Structured Planning</h5>
                      <p className="text-sm text-yellow-700">Consider developing more detailed planning approaches to complement your flexible nature</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-medium text-yellow-900">Risk Management</h5>
                      <p className="text-sm text-yellow-700">Your openness to new experiences is great, but consider balancing it with risk assessment</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Recommendations */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Top Recommendations</h4>
                </div>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>How we generated these recommendations:</strong> Based on your personality profile, 
                    cultural preferences, and work values, we identified areas where you can maximize your potential 
                    and career satisfaction. Each recommendation addresses specific patterns we found in your assessment data.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleRecommendation('summary', 0)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">Leverage Your Creative and Social Strengths</h5>
                            <div className="flex gap-2">
                              <Badge className="bg-green-100 text-green-700 text-xs">High Impact</Badge>
                              <Badge className="bg-blue-100 text-blue-700 text-xs">Low Effort</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">Focus on roles that combine your high openness, extraversion, and innovation values to maximize your natural talents and job satisfaction.</p>
                        </div>
                        {expandedRecommendations['summary-0'] ? (
                          <ChevronUp className="h-5 w-5 text-gray-500 ml-4" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500 ml-4" />
                        )}
                      </div>
                    </button>
                    {expandedRecommendations['summary-0'] && (
                      <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                        <div className="space-y-4">
                          <div>
                            <h6 className="font-medium text-gray-900 text-sm mb-2">Why This Matters</h6>
                            <p className="text-sm text-gray-600">
                              This recommendation addresses your unique combination of high openness (78), extraversion (72), 
                              and innovation values (82). These traits work together to make you naturally effective in creative, 
                              social, and forward-thinking roles.
                            </p>
                          </div>
                          <div>
                            <h6 className="font-medium text-gray-900 text-sm mb-2">Next Steps</h6>
                            <ul className="text-sm text-gray-600 space-y-1 ml-4">
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                Identify current projects where you can apply creative problem-solving
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                Seek opportunities to lead brainstorming sessions or innovation initiatives
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                Look for roles that involve client interaction or team collaboration
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-medium text-gray-900 text-sm mb-2">Try This</h6>
                            <ul className="text-sm text-gray-600 space-y-1 ml-4">
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                Volunteer for cross-functional projects that require creative solutions
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                Start a monthly "innovation hour" where you explore new ideas or approaches
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleRecommendation('summary', 1)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">Find Your Ideal Work Environment</h5>
                            <div className="flex gap-2">
                              <Badge className="bg-green-100 text-green-700 text-xs">High Impact</Badge>
                              <Badge className="bg-yellow-100 text-yellow-700 text-xs">Medium Effort</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">Seek organizations with flat hierarchies, clear communication, and opportunities for both autonomy and collaboration.</p>
                        </div>
                        {expandedRecommendations['summary-1'] ? (
                          <ChevronUp className="h-5 w-5 text-gray-500 ml-4" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500 ml-4" />
                        )}
                      </div>
                    </button>
                    {expandedRecommendations['summary-1'] && (
                      <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                        <div className="space-y-4">
                          <div>
                            <h6 className="font-medium text-gray-900 text-sm mb-2">Why This Matters</h6>
                            <p className="text-sm text-gray-600">
                              Your cultural preferences show low power distance (42) and high individualism (71), meaning you 
                              work best in egalitarian environments where you can contribute independently while collaborating 
                              with others. This environment will maximize your productivity and job satisfaction.
                            </p>
                          </div>
                          <div>
                            <h6 className="font-medium text-gray-900 text-sm mb-2">Next Steps</h6>
                            <ul className="text-sm text-gray-600 space-y-1 ml-4">
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                Research company cultures before applying to new positions
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                Ask about organizational structure and communication styles in interviews
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                Look for companies that value individual initiative and transparent communication
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-medium text-gray-900 text-sm mb-2">Try This</h6>
                            <ul className="text-sm text-gray-600 space-y-1 ml-4">
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                Network with current employees to understand company culture
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                Look for companies with open-door policies and flat organizational structures
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleRecommendation('summary', 2)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">Develop Structured Planning Skills</h5>
                            <div className="flex gap-2">
                              <Badge className="bg-yellow-100 text-yellow-700 text-xs">Medium Impact</Badge>
                              <Badge className="bg-blue-100 text-blue-700 text-xs">Medium Effort</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">Balance your natural flexibility with more structured planning approaches to complement your creative strengths.</p>
                        </div>
                        {expandedRecommendations['summary-2'] ? (
                          <ChevronUp className="h-5 w-5 text-gray-500 ml-4" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500 ml-4" />
                        )}
                      </div>
                    </button>
                    {expandedRecommendations['summary-2'] && (
                      <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                        <div className="space-y-4">
                          <div>
                            <h6 className="font-medium text-gray-900 text-sm mb-2">Why This Matters</h6>
                            <p className="text-sm text-gray-600">
                              Your moderate conscientiousness (65) gives you flexibility but could benefit from more structured 
                              approaches. This will help you balance your creative openness with the discipline needed to bring 
                              ideas to completion.
                            </p>
                          </div>
                          <div>
                            <h6 className="font-medium text-gray-900 text-sm mb-2">Next Steps</h6>
                            <ul className="text-sm text-gray-600 space-y-1 ml-4">
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                Learn project management methodologies like Agile or Scrum
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                Create flexible frameworks that allow creativity within structure
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                Set up regular check-ins to track progress on creative projects
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-medium text-gray-900 text-sm mb-2">Try This</h6>
                            <ul className="text-sm text-gray-600 space-y-1 ml-4">
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                Use time-blocking to dedicate specific hours to creative work
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                Create milestone-based goals for long-term projects
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Conversation Starters */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Reflection Questions</h4>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleConversationStarter(0)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-gray-700 font-medium">
                          How can you leverage your creative and social strengths in your current role?
                        </p>
                        {expandedConversationStarters[0] ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </button>
                    {expandedConversationStarters[0] && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mt-2 italic">
                          This question helps you identify specific ways to apply your high openness and extraversion in your work. 
                          Consider roles that involve brainstorming, client interaction, or leading creative projects.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleConversationStarter(1)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-gray-700 font-medium">
                          What type of work environment would best support your need for autonomy and collaboration?
                        </p>
                        {expandedConversationStarters[1] ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </button>
                    {expandedConversationStarters[1] && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mt-2 italic">
                          Your cultural preferences suggest you work best in flat organizational structures with clear communication 
                          and opportunities for individual contribution within team contexts.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleConversationStarter(2)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-gray-700 font-medium">
                          How can you align your career goals with your values of innovation, quality, and customer focus?
                        </p>
                        {expandedConversationStarters[2] ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </button>
                    {expandedConversationStarters[2] && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mt-2 italic">
                          Look for roles in product development, innovation teams, or customer-facing positions where you can 
                          combine your creative problem-solving skills with your commitment to quality and service.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleConversationStarter(3)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-gray-700 font-medium">
                          What strategies can help you balance your openness to new ideas with structured planning?
                        </p>
                        {expandedConversationStarters[3] ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </button>
                    {expandedConversationStarters[3] && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mt-2 italic">
                          Consider creating flexible frameworks that allow for creativity while maintaining some structure. 
                          This could involve setting broad goals with room for experimentation or using agile methodologies.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="text-center">
          <CardContent className="pt-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Discover Your Results?</h2>
              <p className="text-gray-600 mb-6">
                Take the assessment now and get your personalized insights, AI-powered recommendations, and actionable next steps for your career.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 px-8 py-3"
                  onClick={() => window.location.href = '/assessment/start-assessment'}
                >
                  Start Assessment Now
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-3"
                  onClick={() => window.location.href = '/'}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
