"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import dynamic from "next/dynamic";
const RadarChart = dynamic(() => import("@/components/RadarChart"), {
  ssr: false,
});
import ContextBanner from "@/components/ContextBanner";
import { RecList } from "@/components/RecList";
import { scoreToBand, traitMeta, Trait } from "@/lib/interpretation";
import { buildTeamAgreements } from "@/lib/recommendations";
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
  MessageSquare,
  Zap,
  Award,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertTriangle,
  HelpCircle,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ModernSpinner } from "@/components/LoadingSpinner";
import ShareModal from "@/components/ShareModal";
import InviteModal from "@/components/InviteModal";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  status: "invited" | "completed" | "in_progress";
  completedAt?: string;
  oceanScores?: Record<string, number>;
  cultureScores?: Record<string, number>;
  valuesScores?: Record<string, number>;
}

interface DemoTeamData {
  id: string;
  name: string;
  description: string;
  code: string;
  createdAt: string;
  members: TeamMember[];
  aggregateScores: {
    ocean: Record<string, number>;
    culture: Record<string, number>;
    values: Record<string, number>;
  };
  insights: {
    ocean: string[];
    culture: string[];
    values: string[];
  };
  recommendations: {
    ocean: any;
    culture: any;
    values: any;
  };
}

export default function DemoTeamDashboardHybridPage() {
  const [isClient, setIsClient] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [expandedRecommendations, setExpandedRecommendations] = useState<
    Record<string, boolean>
  >({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [expandedConversationStarters, setExpandedConversationStarters] =
    useState<Record<string, boolean>>({});

  // Demo team data
  const demoTeamData: DemoTeamData = {
    id: "demo-team-1",
    name: "Innovation Squad",
    description:
      "A cross-functional team focused on product innovation and user experience",
    code: "INNOV8",
    createdAt: "2024-01-15T10:00:00Z",
    members: [
      {
        id: "1",
        name: "Sarah Chen",
        email: "sarah.chen@company.com",
        status: "completed",
        completedAt: "2024-01-20T14:30:00Z",
        oceanScores: {
          openness: 85,
          conscientiousness: 72,
          extraversion: 68,
          agreeableness: 75,
          neuroticism: 30,
        },
      },
      {
        id: "2",
        name: "Marcus Johnson",
        email: "marcus.johnson@company.com",
        status: "completed",
        completedAt: "2024-01-22T09:15:00Z",
        oceanScores: {
          openness: 78,
          conscientiousness: 88,
          extraversion: 45,
          agreeableness: 82,
          neuroticism: 25,
        },
      },
      {
        id: "3",
        name: "Elena Rodriguez",
        email: "elena.rodriguez@company.com",
        status: "in_progress",
        oceanScores: {
          openness: 92,
          conscientiousness: 65,
          extraversion: 85,
          agreeableness: 70,
          neuroticism: 40,
        },
      },
      {
        id: "4",
        name: "David Kim",
        email: "david.kim@company.com",
        status: "invited",
      },
    ],
    aggregateScores: {
      ocean: {
        openness: 85,
        conscientiousness: 75,
        extraversion: 66,
        agreeableness: 76,
        neuroticism: 32,
      },
      culture: {
        powerDistance: 35,
        individualism: 78,
        masculinity: 52,
        uncertaintyAvoidance: 45,
        longTermOrientation: 68,
        indulgence: 72,
      },
      values: {
        innovation: 88,
        collaboration: 82,
        autonomy: 75,
        quality: 85,
        customerFocus: 79,
      },
    },
    insights: {
      ocean: [
        "Your team shows high openness to new experiences, indicating strong creativity and adaptability.",
        "Moderate extraversion suggests a balanced mix of collaborative and independent work styles.",
        "High agreeableness indicates strong teamwork and cooperation skills across the team.",
        "Low neuroticism shows the team maintains emotional stability and stress resilience.",
        "Balanced conscientiousness suggests the team works well with both structured and flexible approaches.",
      ],
      culture: [
        "Low power distance preference indicates the team works best in flat, egalitarian structures.",
        "High individualism suggests team members value personal achievement and autonomy.",
        "Moderate masculinity indicates a balanced approach to competition and collaboration.",
        "Low uncertainty avoidance shows comfort with ambiguity and change.",
        "Long-term orientation indicates focus on sustainable growth and future planning.",
      ],
      values: [
        "High innovation score shows the team thrives in creative, forward-thinking environments.",
        "Strong collaboration preference indicates excellent team-oriented work capabilities.",
        "Moderate autonomy suggests team members value both independence and team support.",
        "High quality focus shows the team prioritizes excellence and attention to detail.",
        "Customer focus indicates strong understanding and prioritization of user needs.",
      ],
    },
    recommendations: {
      ocean: {
        context:
          "Based on your team's OCEAN personality profile, here are recommendations to help your team thrive together.",
        recommendations: [
          {
            title: "Leverage Creative Strengths",
            description:
              "Your team's high openness makes you natural innovators and problem-solvers.",
            nextSteps: [
              "Schedule regular brainstorming sessions to harness creative energy",
              "Encourage experimentation and pilot projects",
              "Create safe spaces for sharing new ideas",
            ],
          },
        ],
      },
      culture: {
        context:
          "Your team's cultural preferences suggest you work best in collaborative, flat organizational structures.",
        recommendations: [
          {
            title: "Maintain Collaborative Environment",
            description:
              "Your team's low power distance and high individualism work best in egalitarian settings.",
            nextSteps: [
              "Encourage open communication and feedback",
              "Rotate leadership roles in meetings",
              "Avoid hierarchical decision-making processes",
            ],
          },
        ],
      },
      values: {
        context:
          "Your team's work values align with innovation-focused, quality-driven organizations.",
        recommendations: [
          {
            title: "Focus on Innovation and Quality",
            description:
              "Your team's high innovation and quality scores suggest excellence in creative problem-solving.",
            nextSteps: [
              "Set up innovation time for personal projects",
              "Implement quality review processes",
              "Celebrate both successes and learning from failures",
            ],
          },
        ],
      },
    },
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get style preferences using interpretation system
  const getStyleLabel = (trait: string, score: number) => {
    const traitKey = trait as Trait;
    const band = scoreToBand(score);
    return traitMeta[traitKey]?.bands[band]?.styleLabel || "Balanced";
  };

  // Get explanation for style preferences
  const getStyleExplanation = (trait: string, score: number) => {
    const traitKey = trait as Trait;
    const band = scoreToBand(score);
    const meta = traitMeta[traitKey];
    if (!meta) return "No explanation available.";

    const bandInfo = meta.bands[band];
    if (!bandInfo) return "No explanation available.";

    return bandInfo.tagline || "No explanation available.";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return isClient ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : null;
      case "in_progress":
        return isClient ? <Clock className="h-4 w-4 text-yellow-600" /> : null;
      case "invited":
        return isClient ? <Mail className="h-4 w-4 text-gray-400" /> : null;
      default:
        return isClient ? (
          <AlertCircle className="h-4 w-4 text-red-600" />
        ) : null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "invited":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "invited":
        return "Invited";
      default:
        return "Error";
    }
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

  const completedMembers = demoTeamData.members.filter(
    (member) => member.status === "completed",
  );
  const completionRate =
    (completedMembers.length / demoTeamData.members.length) * 100;

  const getSectionContext = (section: string): string => {
    const contexts = {
      ocean:
        "Your team's OCEAN personality traits reveal how you naturally think, feel, and behave in work environments. These traits influence your work style, communication preferences, and how you interact with others.",
      culture:
        "Cultural dimensions show your team's preferences for how organizations should be structured and how work should be conducted. These preferences influence your comfort level with different management styles and workplace cultures.",
      values:
        "Work values represent what your team finds most important and motivating in your professional life. These values guide your career decisions and help you identify organizations and roles where you'll be most satisfied and successful.",
    };
    return contexts[section as keyof typeof contexts] || "";
  };

  const getTermTooltip = (term: string): string => {
    const tooltips: Record<string, string> = {
      Openness:
        "Openness to Experience reflects curiosity, creativity, and willingness to try new things. High scorers are imaginative, curious, and open to new ideas. Low scorers prefer routine, practical approaches, and familiar experiences.",
      Conscientiousness:
        "Conscientiousness measures self-discipline, organization, and goal-directed behavior. High scorers are organized, reliable, and detail-oriented. Low scorers are more flexible, spontaneous, and adaptable.",
      Extraversion:
        "Extraversion indicates energy source and social preferences. High scorers are outgoing, energetic, and gain energy from social interaction. Low scorers are more reserved, quiet, and prefer smaller groups or solitude.",
      Agreeableness:
        "Agreeableness reflects concern for others and cooperation. High scorers are trusting, helpful, and value harmony. Low scorers are more competitive, skeptical, and direct in their communication.",
      Neuroticism:
        "Neuroticism measures emotional stability and stress response. High scorers experience more negative emotions and stress. Low scorers are calm, emotionally stable, and resilient under pressure.",
    };
    return tooltips[term] || "";
  };

  if (!isClient) {
    return <ModernSpinner />;
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {demoTeamData.name}
            </h1>
            <p className="text-gray-600">{demoTeamData.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline" className="font-mono">
                {demoTeamData.code}
              </Badge>
              <span className="text-sm text-gray-500">
                Created{" "}
                {new Date(demoTeamData.createdAt).toLocaleDateString("en-US")}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowShareModal(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={() => setShowInviteModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Members
            </Button>
          </div>
        </div>

        {/* Context Banner */}
        <ContextBanner />

        {/* Team Overview */}
        <section aria-label="Team overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {demoTeamData.members.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {completedMembers.length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {Math.round(completionRate)}%
                  </div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Assessment Progress
                  </span>
                  <span className="text-sm text-gray-500">
                    {completedMembers.length}/{demoTeamData.members.length}{" "}
                    completed
                  </span>
                </div>
                <Progress value={completionRate} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* OCEAN Section */}
        <section aria-label="OCEAN Personality Profile">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left card: Radar Chart */}
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Brain className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      Team Personality Profile
                    </CardTitle>
                    <p className="text-gray-600">
                      {getSectionContext("ocean")}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-visible">
                <div className="w-full h-[340px] overflow-visible">
                  <RadarChart
                    data={demoTeamData.aggregateScores.ocean}
                    color="#3B82F6"
                    title="Team Personality Dimensions"
                    size={350}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Right card: Style Preferences */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Team Style Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(demoTeamData.aggregateScores.ocean).map(
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
                                {getStyleLabel(trait, score)}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({score})
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {getStyleExplanation(trait, score)}
                          </p>
                          <Progress value={score} className="h-2" />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Key Insights and AI Recommendations */}
        <section aria-label="Key insights and recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Team Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <ul className="space-y-2">
                  {demoTeamData.insights.ocean.map((insight, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-700 flex items-start gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      {insight}
                    </li>
                  ))}
                </ul>

                {/* AI Recommendations */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div
                    className="p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => toggleRecommendation("ocean", 0)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Brain className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900">
                            Team Recommendations
                          </h4>
                          <p className="text-sm text-blue-700">
                            Personalized recommendations based on your team's
                            personality profile
                          </p>
                        </div>
                      </div>
                      {expandedRecommendations["ocean-0"] ? (
                        <ChevronUp className="h-5 w-5 text-blue-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </div>

                  {expandedRecommendations["ocean-0"] && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="space-y-4">
                        <div className="mb-8 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-200">
                          <h5 className="font-medium text-gray-900 mb-2">
                            Context
                          </h5>
                          <p className="text-gray-700 text-sm">
                            {demoTeamData.recommendations.ocean.context}
                          </p>
                        </div>

                        {demoTeamData.recommendations.ocean.recommendations.map(
                          (rec: any, index: number) => (
                            <div
                              key={index}
                              className="border-l-4 border-blue-200 pl-4"
                            >
                              <h6 className="font-medium text-gray-900 mb-2">
                                {rec.title}
                              </h6>
                              <p className="text-gray-700 text-sm mb-3">
                                {rec.description}
                              </p>
                              <div>
                                <h6 className="font-medium text-gray-900 text-sm mb-2">
                                  Next Steps:
                                </h6>
                                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                                  {rec.nextSteps.map(
                                    (step: string, stepIndex: number) => (
                                      <li
                                        key={stepIndex}
                                        className="flex items-start gap-2"
                                      >
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                        {step}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Team Members */}
        <section aria-label="Team members">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoTeamData.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(member.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(member.status)}
                          {getStatusText(member.status)}
                        </div>
                      </Badge>
                      {member.completedAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(member.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <Card className="text-center">
          <CardContent className="pt-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Build Your Team?
              </h2>
              <p className="text-gray-600 mb-6">
                Create your own team assessment to understand your team's
                dynamics and improve collaboration.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                  onClick={() => (window.location.href = "/team/create")}
                >
                  Create New Team
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

      {/* Modals */}
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          teamCode={demoTeamData.code}
          teamName={demoTeamData.name}
        />
      )}

      {showInviteModal && (
        <InviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          teamCode={demoTeamData.code}
          teamName={demoTeamData.name}
        />
      )}
    </div>
  );
}
