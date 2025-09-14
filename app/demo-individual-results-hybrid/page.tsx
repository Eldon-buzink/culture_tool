"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronUp,
  Brain,
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  Lightbulb,
  Award,
  AlertTriangle,
  Globe,
} from "lucide-react";
import RadarBlock from "@/components/Charts/RadarBlock";
import ContextBanner from "@/components/ContextBanner";
import { RecList } from "@/components/RecList";
import { scoreToBand, traitMeta, Trait } from "@/lib/interpretation";
import { buildIndividualRecs } from "@/lib/recommendations";

export default function DemoIndividualResultsHybridPage() {
  const [expandedRecommendations, setExpandedRecommendations] = useState<
    Record<string, boolean>
  >({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [expandedConversationStarters, setExpandedConversationStarters] =
    useState<Record<string, boolean>>({});

  // Demo data showing what users will get
  const demoResults = {
    oceanScores: {
      openness: 78,
      conscientiousness: 65,
      extraversion: 72,
      agreeableness: 68,
      neuroticism: 35,
    },
    cultureScores: {
      powerDistance: 42,
      individualism: 71,
      masculinity: 58,
      uncertaintyAvoidance: 55,
      longTermOrientation: 63,
      indulgence: 67,
    },
    valuesScores: {
      innovation: 82,
      collaboration: 75,
      autonomy: 69,
      quality: 78,
      customerFocus: 71,
    },
    insights: {
      ocean: [
        "You show high openness to new experiences, indicating creativity and adaptability.",
        "Your extraversion suggests you thrive in social and collaborative environments.",
        "Moderate conscientiousness suggests a balanced approach to planning and spontaneity.",
        "Your agreeableness indicates strong teamwork and cooperation skills.",
        "Low neuroticism shows emotional stability and stress resilience.",
      ],
      culture: [
        "Your low power distance preference suggests you work best in flat organizational structures.",
        "High individualism indicates you value personal achievement and autonomy.",
        "Moderate masculinity suggests you balance competitiveness with collaboration.",
        "Your uncertainty avoidance shows comfort with ambiguity and change.",
        "Long-term orientation indicates you focus on future planning and sustainable growth.",
      ],
      values: [
        "High innovation score shows you thrive in creative, forward-thinking environments.",
        "Strong collaboration preference indicates you work best in team-oriented settings.",
        "Moderate autonomy suggests you value both independence and team support.",
        "High quality focus shows you prioritize excellence and attention to detail.",
        "Customer focus indicates you understand and prioritize user needs.",
      ],
    },
    recommendations: {
      ocean: {
        context:
          "Based on your OCEAN personality profile, here are personalized recommendations to help you thrive in your work environment.",
        recommendations: [
          {
            title: "Leverage Your Creative Strengths",
            description:
              "Your high openness and extraversion make you a natural innovator and team energizer.",
            nextSteps: [
              "Seek roles that involve brainstorming and creative problem-solving",
              "Volunteer to lead innovation initiatives in your current role",
              "Connect with other creative professionals in your network",
            ],
          },
          {
            title: "Balance Structure with Flexibility",
            description:
              "Your moderate conscientiousness suggests you work well with both planned and spontaneous approaches.",
            nextSteps: [
              "Create flexible work schedules that allow for both planning and creativity",
              "Use project management tools that support both structure and adaptability",
              "Communicate your working style preferences to your team",
            ],
          },
        ],
      },
      culture: {
        context:
          "Your cultural preferences suggest you work best in collaborative, flat organizational structures.",
        recommendations: [
          {
            title: "Seek Collaborative Environments",
            description:
              "Your low power distance and high individualism work best in team-oriented, egalitarian settings.",
            nextSteps: [
              "Look for companies with flat organizational structures",
              "Seek roles that emphasize cross-functional collaboration",
              "Avoid highly hierarchical or bureaucratic environments",
            ],
          },
        ],
      },
      values: {
        context:
          "Your work values align with innovation-focused, quality-driven organizations.",
        recommendations: [
          {
            title: "Pursue Innovation-Driven Roles",
            description:
              "Your high innovation and quality scores suggest you'd excel in forward-thinking, excellence-focused environments.",
            nextSteps: [
              "Target companies known for innovation and quality",
              "Seek roles in R&D, product development, or creative departments",
              "Look for organizations that invest in continuous improvement",
            ],
          },
        ],
      },
    },
  };

  // Helper functions
  const getTraitLabel = (trait: string, score: number): string => {
    const band = scoreToBand(score);
    const meta = traitMeta[trait as Trait];
    if (!meta) return "";

    return meta.bands[band].styleLabel;
  };

  const getTraitDescription = (trait: string, score: number): string => {
    const band = scoreToBand(score);
    const meta = traitMeta[trait as Trait];
    if (!meta) return "";

    return meta.bands[band].tagline;
  };

  const getSectionContext = (section: string): string => {
    const contexts = {
      ocean:
        "Your OCEAN personality traits reveal how you naturally think, feel, and behave in work environments. These traits are relatively stable and influence your work style, communication preferences, and how you interact with others.",
      culture:
        "Cultural dimensions show your preferences for how organizations should be structured and how work should be conducted. These preferences influence your comfort level with different management styles and workplace cultures.",
      values:
        "Work values represent what you find most important and motivating in your professional life. These values guide your career decisions and help you identify organizations and roles where you'll be most satisfied and successful.",
    };
    return contexts[section as keyof typeof contexts] || "";
  };

  const getTermTooltip = (term: string): string => {
    const tooltips: Record<string, string> = {
      Openness:
        "Openness to Experience reflects your curiosity, creativity, and willingness to try new things. High scorers are imaginative, curious, and open to new ideas. Low scorers prefer routine, practical approaches, and familiar experiences.",
      Conscientiousness:
        "Conscientiousness measures your self-discipline, organization, and goal-directed behavior. High scorers are organized, reliable, and detail-oriented. Low scorers are more flexible, spontaneous, and adaptable.",
      Extraversion:
        "Extraversion indicates your energy source and social preferences. High scorers are outgoing, energetic, and gain energy from social interaction. Low scorers are more reserved, quiet, and prefer smaller groups or solitude.",
      Agreeableness:
        "Agreeableness reflects your concern for others and cooperation. High scorers are trusting, helpful, and value harmony. Low scorers are more competitive, skeptical, and direct in their communication.",
      Neuroticism:
        "Neuroticism measures emotional stability and stress response. High scorers experience more negative emotions and stress. Low scorers are calm, emotionally stable, and resilient under pressure.",
    };
    return tooltips[term] || "";
  };

  const toggleRecommendation = (section: string, index: number) => {
    const key = `${section}-${index}`;
    setExpandedRecommendations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleTooltip = (trait: string) => {
    setActiveTooltip(activeTooltip === trait ? null : trait);
  };

  const toggleConversationStarter = (index: number) => {
    setExpandedConversationStarters((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Get all recommendations for the "Try this" section
  const allRecommendations = buildIndividualRecs(demoResults.oceanScores);
  const oceanRecommendations = allRecommendations
    .filter((rec) => rec.startsWith("Try this •"))
    .map((rec) => rec.replace("Try this • ", ""));

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center mb-12 px-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200">
            <Lightbulb className="h-4 w-4" />
            Demo Results
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            See What You'll Get
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            This is an example of the comprehensive results you'll receive after
            completing your personality assessment
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              onClick={() =>
                (window.location.href = "/assessment/start-assessment")
              }
            >
              Start Your Assessment Now
            </Button>
          </div>
        </div>

        {/* Context Banner */}
        <ContextBanner />


        {/* OCEAN Section */}
        <Card className="bg-white shadow-sm border border-gray-200 mb-8">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
                  OCEAN Personality Profile
                </CardTitle>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {getSectionContext("ocean")}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-8 gap-x-8 lg:gap-x-16 min-h-0">
              {/* Left Column: Radar Chart */}
              <div className="min-h-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Personality Dimensions</h3>
                <RadarBlock
                  data={{
                    Openness: demoResults.oceanScores.openness,
                    Conscientiousness: demoResults.oceanScores.conscientiousness,
                    Extraversion: demoResults.oceanScores.extraversion,
                    Agreeableness: demoResults.oceanScores.agreeableness,
                    Neuroticism: demoResults.oceanScores.neuroticism,
                  }}
                />
              </div>

              {/* Right Column: Style Preferences */}
              <div className="min-w-0 lg:pl-4 xl:pl-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Style Preferences</h3>
                <div className="space-y-4">
                  {Object.entries(demoResults.oceanScores).map(
                    ([trait, score]) => (
                      <div key={trait} className="space-y-2">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">
                                {trait}
                              </span>
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
                                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {getTraitLabel(trait, score)}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({score})
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {getTraitDescription(trait, score)}
                          </p>
                          <Progress value={score} className="h-3 bg-gray-100 rounded-full" />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* What This Means for You - Full Width Below */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-semibold mb-6 text-gray-900">What This Means for You</h3>
              
              {/* High Openness Card */}
              {demoResults.oceanScores.openness >= 70 && (
                <div className="border border-gray-200 rounded-lg mb-4">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                    onClick={() => toggleRecommendation("openness", 0)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Lightbulb className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">High Openness - The Creative Explorer</h4>
                          <p className="text-sm text-gray-600">You thrive when you can explore new ideas and approaches</p>
                        </div>
                      </div>
                      {expandedRecommendations["openness-0"] ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {expandedRecommendations["openness-0"] && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-green-50 rounded-lg p-4">
                            <h5 className="font-medium text-green-800 mb-3">✅ What to look for:</h5>
                            <ul className="text-sm text-green-700 space-y-2">
                              <li>• <strong>Creative fields</strong> like teaching, design, writing, or the arts</li>
                              <li>• <strong>Varied responsibilities</strong> where every day brings something different</li>
                              <li>• <strong>Problem-solving roles</strong> that challenge you to find new solutions</li>
                              <li>• <strong>Learning opportunities</strong> where you can continuously grow and explore</li>
                            </ul>
                          </div>
                          <div className="bg-red-50 rounded-lg p-4">
                            <h5 className="font-medium text-red-800 mb-3">⚠️ What to avoid:</h5>
                            <ul className="text-sm text-red-700 space-y-2">
                              <li>• <strong>Routine-heavy jobs</strong> with the same tasks every day</li>
                              <li>• <strong>Rigid environments</strong> that don't allow for new approaches</li>
                              <li>• <strong>Highly structured roles</strong> with little room for creativity</li>
                              <li>• <strong>Traditional settings</strong> that resist change or new ideas</li>
                            </ul>
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h5 className="font-medium text-blue-800 mb-2">💡 Your superpower:</h5>
                          <p className="text-sm text-blue-700">You naturally see possibilities others miss and can connect ideas in creative ways. You're the person who brings fresh perspectives to any situation.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* High Extraversion Card */}
              {demoResults.oceanScores.extraversion >= 70 && (
                <div className="border border-gray-200 rounded-lg mb-4">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                    onClick={() => toggleRecommendation("extraversion", 0)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">High Extraversion - The People Energizer</h4>
                          <p className="text-sm text-gray-600">You bring energy and enthusiasm to group interactions</p>
                        </div>
                      </div>
                      {expandedRecommendations["extraversion-0"] ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {expandedRecommendations["extraversion-0"] && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-green-50 rounded-lg p-4">
                            <h5 className="font-medium text-green-800 mb-3">✅ What to look for:</h5>
                            <ul className="text-sm text-green-700 space-y-2">
                              <li>• <strong>People-focused roles</strong> like teaching, healthcare, or customer service</li>
                              <li>• <strong>Team leadership positions</strong> where you can motivate and inspire others</li>
                              <li>• <strong>Public-facing jobs</strong> like sales, hospitality, or event planning</li>
                              <li>• <strong>Community building</strong> opportunities in any field you're passionate about</li>
                            </ul>
                          </div>
                          <div className="bg-red-50 rounded-lg p-4">
                            <h5 className="font-medium text-red-800 mb-3">⚠️ What to avoid:</h5>
                            <ul className="text-sm text-red-700 space-y-2">
                              <li>• <strong>Isolated work</strong> with minimal human interaction</li>
                              <li>• <strong>Behind-the-scenes roles</strong> that keep you away from people</li>
                              <li>• <strong>Solo projects</strong> that don't involve collaboration</li>
                              <li>• <strong>Quiet environments</strong> that don't match your energy level</li>
                            </ul>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <h5 className="font-medium text-green-800 mb-2">💡 Your superpower:</h5>
                          <p className="text-sm text-green-700">You naturally energize others and build connections. You're the person who makes teams work better together and brings out the best in people.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Low Neuroticism Card */}
              {demoResults.oceanScores.neuroticism <= 40 && (
                <div className="border border-gray-200 rounded-lg mb-4">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                    onClick={() => toggleRecommendation("neuroticism", 0)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Target className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Low Neuroticism - The Steady Anchor</h4>
                          <p className="text-sm text-gray-600">You stay calm and focused even in challenging situations</p>
                        </div>
                      </div>
                      {expandedRecommendations["neuroticism-0"] ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {expandedRecommendations["neuroticism-0"] && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-green-50 rounded-lg p-4">
                            <h5 className="font-medium text-green-800 mb-3">✅ What to look for:</h5>
                            <ul className="text-sm text-green-700 space-y-2">
                              <li>• <strong>High-pressure roles</strong> like emergency services, healthcare, or teaching</li>
                              <li>• <strong>Leadership positions</strong> where calm decision-making is crucial</li>
                              <li>• <strong>Problem-solving jobs</strong> that require steady focus under stress</li>
                              <li>• <strong>Support roles</strong> where others rely on your stability</li>
                            </ul>
                          </div>
                          <div className="bg-red-50 rounded-lg p-4">
                            <h5 className="font-medium text-red-800 mb-3">⚠️ What to avoid:</h5>
                            <ul className="text-sm text-red-700 space-y-2">
                              <li>• <strong>Drama-heavy environments</strong> with constant emotional ups and downs</li>
                              <li>• <strong>High-conflict situations</strong> that drain your energy</li>
                              <li>• <strong>Unstable workplaces</strong> with frequent changes and uncertainty</li>
                              <li>• <strong>Criticism-heavy roles</strong> that focus on what's wrong rather than solutions</li>
                            </ul>
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h5 className="font-medium text-purple-800 mb-2">💡 Your superpower:</h5>
                          <p className="text-sm text-purple-700">You're a natural stabilizer who keeps everyone calm and focused. You're the person others turn to when things get chaotic or stressful.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </CardContent>
        </Card>

        {/* Culture Section */}
        <Card className="bg-white shadow-sm border border-gray-200 mb-8">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
                  Cultural Dimensions
                </CardTitle>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {getSectionContext("culture")}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-8 gap-x-8 lg:gap-x-16 min-h-0">
              {/* Left Column: Radar Chart */}
              <div className="min-h-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Cultural Dimensions</h3>
                <RadarBlock
                  data={{
                    "Power Distance": demoResults.cultureScores.powerDistance,
                    Individualism: demoResults.cultureScores.individualism,
                    Masculinity: demoResults.cultureScores.masculinity,
                    "Uncertainty Avoidance": demoResults.cultureScores.uncertaintyAvoidance,
                    "Long-term Orientation": demoResults.cultureScores.longTermOrientation,
                    Indulgence: demoResults.cultureScores.indulgence,
                  }}
                />
              </div>

              {/* Right Column: Style Preferences */}
              <div className="min-w-0 lg:pl-4 xl:pl-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Cultural Preferences</h3>
                <div className="space-y-4">
                  {Object.entries(demoResults.cultureScores).map(
                    ([dimension, score]) => (
                      <div key={dimension} className="space-y-2">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">
                                {dimension}
                              </span>
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
                                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {score >= 70
                                  ? "High"
                                  : score >= 40
                                    ? "Medium"
                                    : "Low"}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({score})
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {score >= 70
                              ? "Strong preference for this cultural dimension"
                              : score >= 40
                                ? "Moderate preference for this cultural dimension"
                                : "Low preference for this cultural dimension"}
                          </p>
                          <Progress value={score} className="h-3 bg-gray-100 rounded-full" />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>


            {/* What This Means for You - Full Width Below */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-semibold mb-6 text-gray-900">What This Means for You</h3>
              
              {/* High Individualism Card */}
              {demoResults.cultureScores.individualism >= 70 && (
                <div className="border border-gray-200 rounded-lg mb-4">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                    onClick={() => toggleRecommendation("individualism", 0)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">High Individualism - The Independent Achiever</h4>
                          <p className="text-sm text-gray-600">You thrive when you can work independently and be recognized for your personal contributions</p>
                        </div>
                      </div>
                      {expandedRecommendations["individualism-0"] ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {expandedRecommendations["individualism-0"] && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-green-50 rounded-lg p-4">
                            <h5 className="font-medium text-green-800 mb-3">✅ What to look for:</h5>
                            <ul className="text-sm text-green-700 space-y-2">
                              <li>• <strong>Individual contributor roles</strong> where you can own projects and outcomes</li>
                              <li>• <strong>Performance-based recognition</strong> systems that reward personal achievements</li>
                              <li>• <strong>Flexible work arrangements</strong> that allow you to work at your own pace</li>
                              <li>• <strong>Clear career progression paths</strong> based on individual merit and skills</li>
                            </ul>
                          </div>
                          <div className="bg-red-50 rounded-lg p-4">
                            <h5 className="font-medium text-red-800 mb-3">⚠️ What to avoid:</h5>
                            <ul className="text-sm text-red-700 space-y-2">
                              <li>• <strong>Highly collectivist environments</strong> that prioritize group harmony over individual achievement</li>
                              <li>• <strong>Roles with heavy group decision-making</strong> where individual input gets lost</li>
                              <li>• <strong>Seniority-based promotion systems</strong> that don't recognize individual performance</li>
                              <li>• <strong>Team-dependent projects</strong> where you can't showcase your personal contributions</li>
                            </ul>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <h5 className="font-medium text-green-800 mb-2">💡 Your superpower:</h5>
                          <p className="text-sm text-green-700">You're a natural self-starter who excels when given autonomy and clear goals. You're the person who can take ownership and deliver results independently.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Low Power Distance Card */}
              {demoResults.cultureScores.powerDistance <= 40 && (
                <div className="border border-gray-200 rounded-lg mb-4">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                    onClick={() => toggleRecommendation("powerDistance", 0)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Low Power Distance - The Collaborative Leader</h4>
                          <p className="text-sm text-gray-600">You work best in flat, collaborative environments where everyone's voice matters</p>
                        </div>
                      </div>
                      {expandedRecommendations["powerDistance-0"] ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {expandedRecommendations["powerDistance-0"] && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-green-50 rounded-lg p-4">
                            <h5 className="font-medium text-green-800 mb-3">✅ What to look for:</h5>
                            <ul className="text-sm text-green-700 space-y-2">
                              <li>• <strong>Flat organizational structures</strong> with minimal hierarchy and open communication</li>
                              <li>• <strong>Startup or tech company cultures</strong> that value merit over seniority</li>
                              <li>• <strong>Collaborative leadership roles</strong> where you can influence without authority</li>
                              <li>• <strong>Cross-functional teams</strong> where everyone contributes equally</li>
                            </ul>
                          </div>
                          <div className="bg-red-50 rounded-lg p-4">
                            <h5 className="font-medium text-red-800 mb-3">⚠️ What to avoid:</h5>
                            <ul className="text-sm text-red-700 space-y-2">
                              <li>• <strong>Highly hierarchical organizations</strong> with strict reporting structures</li>
                              <li>• <strong>Traditional corporate environments</strong> with formal protocols and deference</li>
                              <li>• <strong>Roles requiring strict chain of command</strong> and top-down decision making</li>
                              <li>• <strong>Organizations that discourage questioning</strong> or challenging authority</li>
                            </ul>
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h5 className="font-medium text-blue-800 mb-2">💡 Your superpower:</h5>
                          <p className="text-sm text-blue-700">You're a natural bridge-builder who can work effectively with people at all levels. You're the person who makes everyone feel heard and valued.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </CardContent>
        </Card>

        {/* Values Section */}
        <Card className="bg-white shadow-sm border border-gray-200 mb-8">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Work Values</CardTitle>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {getSectionContext("values")}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-8 gap-x-8 lg:gap-x-16 min-h-0">
              {/* Left Column: Radar Chart */}
              <div className="min-h-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Work Values</h3>
                <RadarBlock
                  data={{
                    Innovation: demoResults.valuesScores.innovation,
                    Collaboration: demoResults.valuesScores.collaboration,
                    Autonomy: demoResults.valuesScores.autonomy,
                    Quality: demoResults.valuesScores.quality,
                    "Customer Focus": demoResults.valuesScores.customerFocus,
                  }}
                />
              </div>

              {/* Right Column: Style Preferences */}
              <div className="min-w-0 lg:pl-4 xl:pl-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Value Priorities</h3>
                <div className="space-y-4">
                  {Object.entries(demoResults.valuesScores).map(
                    ([value, score]) => (
                      <div key={value} className="space-y-2">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">
                                {value}
                              </span>
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
                                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {score >= 80
                                  ? "Very High"
                                  : score >= 60
                                    ? "High"
                                    : score >= 40
                                      ? "Medium"
                                      : "Low"}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({score})
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {score >= 80
                              ? "Extremely important to you"
                              : score >= 60
                                ? "Very important to you"
                                : score >= 40
                                  ? "Moderately important to you"
                                  : "Less important to you"}
                          </p>
                          <Progress value={score} className="h-3 bg-gray-100 rounded-full" />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>


            {/* What This Means for You - Full Width Below */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-semibold mb-6 text-gray-900">What This Means for You</h3>
              
              {/* High Innovation Card */}
              {demoResults.valuesScores.innovation >= 70 && (
                <div className="border border-gray-200 rounded-lg mb-4">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                    onClick={() => toggleRecommendation("innovation", 0)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Lightbulb className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">High Innovation - The Creative Problem Solver</h4>
                          <p className="text-sm text-gray-600">You thrive in environments that encourage experimentation and creative thinking</p>
                        </div>
                      </div>
                      {expandedRecommendations["innovation-0"] ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {expandedRecommendations["innovation-0"] && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-green-50 rounded-lg p-4">
                            <h5 className="font-medium text-green-800 mb-3">✅ What to look for:</h5>
                            <ul className="text-sm text-green-700 space-y-2">
                              <li>• <strong>Innovation-focused roles</strong> like product development, R&D, or creative positions</li>
                              <li>• <strong>Companies that invest in R&D</strong> and encourage experimentation and new ideas</li>
                              <li>• <strong>Cross-functional teams</strong> where you can collaborate on creative solutions</li>
                              <li>• <strong>Roles with creative freedom</strong> and minimal bureaucratic constraints</li>
                            </ul>
                          </div>
                          <div className="bg-red-50 rounded-lg p-4">
                            <h5 className="font-medium text-red-800 mb-3">⚠️ What to avoid:</h5>
                            <ul className="text-sm text-red-700 space-y-2">
                              <li>• <strong>Highly regulated industries</strong> with strict compliance requirements and limited creativity</li>
                              <li>• <strong>Roles focused on maintaining status quo</strong> rather than driving change</li>
                              <li>• <strong>Organizations resistant to change</strong> or new approaches</li>
                              <li>• <strong>Heavily process-driven environments</strong> that stifle creative thinking</li>
                            </ul>
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h5 className="font-medium text-purple-800 mb-2">💡 Your superpower:</h5>
                          <p className="text-sm text-purple-700">You're a natural innovator who can see opportunities others miss and turn ideas into reality. You're the person who brings fresh perspectives and creative solutions to any challenge.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* High Collaboration Card */}
              {demoResults.valuesScores.collaboration >= 70 && (
                <div className="border border-gray-200 rounded-lg mb-4">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                    onClick={() => toggleRecommendation("collaboration", 0)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">High Collaboration - The Team Catalyst</h4>
                          <p className="text-sm text-gray-600">You excel when working with others and building strong team dynamics</p>
                        </div>
                      </div>
                      {expandedRecommendations["collaboration-0"] ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {expandedRecommendations["collaboration-0"] && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-green-50 rounded-lg p-4">
                            <h5 className="font-medium text-green-800 mb-3">✅ What to look for:</h5>
                            <ul className="text-sm text-green-700 space-y-2">
                              <li>• <strong>Team-based roles</strong> like project management, team leadership, or coordination positions</li>
                              <li>• <strong>Cross-functional projects</strong> that require working with diverse groups</li>
                              <li>• <strong>Organizations that value teamwork</strong> and collaborative culture</li>
                              <li>• <strong>Roles involving relationship building</strong> with clients, partners, or stakeholders</li>
                            </ul>
                          </div>
                          <div className="bg-red-50 rounded-lg p-4">
                            <h5 className="font-medium text-red-800 mb-3">⚠️ What to avoid:</h5>
                            <ul className="text-sm text-red-700 space-y-2">
                              <li>• <strong>Solo contributor roles</strong> with minimal team interaction</li>
                              <li>• <strong>Highly competitive environments</strong> that pit individuals against each other</li>
                              <li>• <strong>Roles with limited collaboration</strong> or isolated work arrangements</li>
                              <li>• <strong>Organizations with siloed departments</strong> that discourage cross-team work</li>
                            </ul>
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h5 className="font-medium text-blue-800 mb-2">💡 Your superpower:</h5>
                          <p className="text-sm text-blue-700">You're a natural team builder who can bring people together and create synergy. You're the person who makes teams work better and achieve more than the sum of their parts.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </CardContent>
        </Card>

        {/* Overall Summary Section */}
        <section aria-label="Overall summary">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Overall Summary</CardTitle>
                  <p className="text-gray-600">
                    Your complete personality and work style profile
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Overall Summary */}
                <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-4">
                    Your Profile Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Brain className="h-8 w-8 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Creative & Social
                      </h4>
                      <p className="text-sm text-gray-600">
                        High openness and extraversion make you a natural
                        innovator and team energizer
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="h-8 w-8 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Collaborative
                      </h4>
                      <p className="text-sm text-gray-600">
                        You thrive in team environments and value flat
                        organizational structures
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Award className="h-8 w-8 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Quality-Focused
                      </h4>
                      <p className="text-sm text-gray-600">
                        You prioritize excellence and innovation in everything
                        you do
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Strengths */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Key Strengths
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        Creative problem-solving and innovation
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        Strong team collaboration and communication
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        Emotional stability and stress resilience
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        Quality focus and attention to detail
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      Areas for Growth
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        Balancing structure with flexibility
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        Managing time and priorities effectively
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        Delegating tasks and trusting others
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        Setting boundaries and saying no
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Conversation Starters */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Reflection Questions
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => toggleConversationStarter(0)}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-gray-700 font-medium">
                            How can you leverage your creative and social
                            strengths in your current role?
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
                            This question helps you identify specific ways to
                            apply your high openness and extraversion in your
                            work. Consider roles that involve brainstorming,
                            client interaction, or leading creative projects.
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
                            What type of work environment would best support
                            your values and working style?
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
                            This question helps you think about the
                            organizational culture, team dynamics, and physical
                            environment that would allow you to thrive. Consider
                            factors like autonomy, collaboration opportunities,
                            and opportunities for individual contribution within
                            team contexts.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Your Next Steps */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
                  <div className="text-left mb-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Your Next Steps</h4>
                    <p className="text-sm text-gray-600">You can start doing today</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* This Week */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <h5 className="font-semibold text-gray-900">This Week</h5>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-indigo-600 text-xs">•</span>
                          </div>
                          <p className="text-sm text-gray-700">Research 3 companies with creative, collaborative cultures that match your high openness and extraversion</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-indigo-600 text-xs">•</span>
                          </div>
                          <p className="text-sm text-gray-700">Identify 2 roles that combine innovation with team collaboration based on your work values</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-indigo-600 text-xs">•</span>
                          </div>
                          <p className="text-sm text-gray-700">Connect with 2 professionals in flat, merit-based organizations that align with your cultural preferences</p>
                        </div>
                      </div>
                    </div>

                    {/* This Month */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <h5 className="font-semibold text-gray-900">This Month</h5>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-purple-600 text-xs">•</span>
                          </div>
                          <p className="text-sm text-gray-700">Apply to 5 positions at companies that value both innovation and collaborative leadership</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-purple-600 text-xs">•</span>
                          </div>
                          <p className="text-sm text-gray-700">Join 2 professional groups focused on creative leadership and team dynamics</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-purple-600 text-xs">•</span>
                          </div>
                          <p className="text-sm text-gray-700">Practice explaining how your personality strengths align with your target roles</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <Card className="text-center">
          <CardContent className="pt-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Discover Your Results?
              </h2>
              <p className="text-gray-600 mb-6">
                Take our comprehensive personality assessment to get your
                personalized results and insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                  onClick={() =>
                    (window.location.href = "/assessment/start-assessment")
                  }
                >
                  Start Your Assessment
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-3"
                  onClick={() => (window.location.href = "/about")}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
