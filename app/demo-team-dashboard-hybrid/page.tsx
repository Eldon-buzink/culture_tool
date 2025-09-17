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
  X,
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

  // Get explanation for work values and cultural dimensions
  const getValueExplanation = (value: string, score: number) => {
    const valueExplanations: Record<string, Record<string, string>> = {
      innovation: {
        lower: "Prefers proven methods and established processes over experimental approaches.",
        balanced: "Balances innovative thinking with practical implementation considerations.",
        higher: "Naturally seeks creative solutions and embraces new approaches to challenges."
      },
      collaboration: {
        lower: "Works effectively independently and prefers clear individual responsibilities.",
        balanced: "Collaborates when needed while maintaining personal accountability.",
        higher: "Thrives in team environments and values collective decision-making."
      },
      autonomy: {
        lower: "Prefers clear guidance and structured work environments.",
        balanced: "Values both independence and team support as appropriate.",
        higher: "Excels when given freedom to determine their own approach and priorities."
      },
      quality: {
        lower: "Focuses on efficiency and meeting core requirements effectively.",
        balanced: "Balances quality standards with practical delivery timelines.",
        higher: "Prioritizes excellence and attention to detail in all work outputs."
      },
      customerFocus: {
        lower: "Focuses on internal processes and technical excellence.",
        balanced: "Considers both customer needs and internal capabilities.",
        higher: "Strongly prioritizes customer satisfaction and user experience."
      },
      powerDistance: {
        lower: "Prefers flat, egalitarian structures where all voices are valued equally.",
        balanced: "Adapts to different leadership styles while maintaining personal agency.",
        higher: "Comfortable with hierarchical structures and clear authority lines."
      },
      individualism: {
        lower: "Values collective goals and team success over individual recognition.",
        balanced: "Balances personal achievement with team collaboration.",
        higher: "Strongly values personal achievement and individual recognition."
      },
      masculinity: {
        lower: "Values collaboration, support, and quality of life over competition.",
        balanced: "Balances competitive drive with collaborative approaches.",
        higher: "Values competition, achievement, and assertive approaches to work."
      },
      uncertaintyAvoidance: {
        lower: "Comfortable with ambiguity and enjoys exploring new possibilities.",
        balanced: "Manages uncertainty by gathering information and planning adaptively.",
        higher: "Prefers clear rules, structured environments, and predictable outcomes."
      },
      longTermOrientation: {
        lower: "Focuses on immediate results and short-term practical outcomes.",
        balanced: "Balances immediate needs with long-term strategic considerations.",
        higher: "Values long-term planning, sustainable growth, and future-oriented thinking."
      },
      indulgence: {
        lower: "Values self-restraint, discipline, and delayed gratification.",
        balanced: "Balances enjoyment of life with professional discipline and restraint.",
        higher: "Values enjoyment, leisure, and immediate gratification in work-life balance."
      }
    };

    const band = score <= 35 ? 'lower' : score >= 65 ? 'higher' : 'balanced';
    return valueExplanations[value]?.[band] || "No explanation available.";
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 md:px-6">
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


        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - 8/12 */}
          <div className="lg:col-span-8 space-y-8">
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
              <Card>
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
                <CardContent>
                  <div className="space-y-6">
                    {/* Two-column layout for radar chart and style preferences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      {/* Left: Radar Chart */}
                      <div className="overflow-visible">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Team Personality Dimensions</h3>
                        <div className="w-full h-[400px] overflow-visible">
                          <RadarChart
                            data={demoTeamData.aggregateScores.ocean}
                            color="#3B82F6"
                            title=""
                            size={350}
                          />
                        </div>
                      </div>

                      {/* Right: Style Preferences */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Team Style Preferences</h3>
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
                      </div>
                    </div>

                    {/* What This Means for Your Team - OCEAN */}
                    <div className="mt-8">
                      <h3 className="text-2xl font-semibold mb-6 text-gray-900">What This Means for Your Team</h3>
                      
                      {/* High Openness Card */}
                      <div className="border border-gray-200 rounded-lg mb-4">
                        <div 
                          className="p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                          onClick={() => toggleRecommendation("ocean-strengths", 0)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Brain className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">High Openness - The Creative Team</h4>
                                <p className="text-sm text-gray-600">Your team naturally embraces new ideas and creative solutions</p>
                              </div>
                            </div>
                            {expandedRecommendations["ocean-strengths-0"] ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                        
                        {expandedRecommendations["ocean-strengths-0"] && (
                          <div className="px-4 pb-4 border-t border-gray-100">
                            <div className="pt-4 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                      <span className="text-green-600 text-xs">✓</span>
                                    </div>
                                    What to look for:
                                  </h5>
                                  <ul className="text-sm text-gray-700 space-y-2">
                                    <li>• <strong>Innovative projects</strong> that challenge your team to think creatively</li>
                                    <li>• <strong>Flexible work environments</strong> that allow for experimentation and new approaches</li>
                                    <li>• <strong>Cross-functional collaboration</strong> where diverse perspectives can flourish</li>
                                    <li>• <strong>Learning opportunities</strong> that keep your team engaged and growing</li>
                                  </ul>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                    <X className="w-5 h-5 text-gray-600" />
                                    What to avoid:
                                  </h5>
                                  <ul className="text-sm text-gray-700 space-y-2">
                                    <li>• <strong>Rigid processes</strong> that stifle creativity and innovation</li>
                                    <li>• <strong>Highly structured environments</strong> with little room for new ideas</li>
                                    <li>• <strong>Repetitive tasks</strong> that don't challenge your team's creative potential</li>
                                    <li>• <strong>Conservative leadership</strong> that resists change or new approaches</li>
                                  </ul>
                                </div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                  <Zap className="w-5 h-5 text-blue-600" />
                                  Your team superpower:
                                </h5>
                                <p className="text-sm text-gray-700">Your team naturally sees possibilities others miss and can connect ideas in creative ways. You're the team that brings fresh perspectives to any situation and thrives on innovation.</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Work Values Section */}
            <section aria-label="Work Values Profile">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">
                        Team Work Values
                      </CardTitle>
                      <p className="text-gray-600">
                        What drives your team's motivation and work style
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Two-column layout for radar chart and style preferences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      {/* Left: Radar Chart */}
                      <div className="overflow-visible">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Team Work Values</h3>
                        <div className="w-full h-[400px] overflow-visible">
                          <RadarChart 
                            data={demoTeamData.aggregateScores.values} 
                            color="#10B981"
                            title=""
                            size={350}
                          />
                        </div>
                      </div>

                      {/* Right: Work Values Breakdown */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Team Work Style</h3>
                        <div className="space-y-4">
                          {Object.entries(demoTeamData.aggregateScores.values).map(
                            ([value, score]) => (
                              <div key={value} className="space-y-2">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium capitalize">
                                        {value}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-900">
                                        {getStyleLabel(value, score)}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        ({score})
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {getValueExplanation(value, score)}
                                  </p>
                                  <Progress value={score} className="h-2" />
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    {/* What This Means for Your Team - Work Values */}
                    <div className="mt-8">
                      <h3 className="text-2xl font-semibold mb-6 text-gray-900">What This Means for Your Team</h3>
                      
                      {/* High Innovation Card */}
                      <div className="border border-gray-200 rounded-lg mb-4">
                        <div 
                          className="p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                          onClick={() => toggleRecommendation("work-strengths", 0)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Target className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">High Innovation - The Creative Problem Solvers</h4>
                                <p className="text-sm text-gray-600">Your team thrives on creative problem-solving and new approaches</p>
                              </div>
                            </div>
                            {expandedRecommendations["work-strengths-0"] ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                        
                        {expandedRecommendations["work-strengths-0"] && (
                          <div className="px-4 pb-4 border-t border-gray-100">
                            <div className="pt-4 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                      <span className="text-green-600 text-xs">✓</span>
                                    </div>
                                    What to look for:
                                  </h5>
                                  <ul className="text-sm text-gray-700 space-y-2">
                                    <li>• <strong>Innovation-focused projects</strong> that challenge your team to find creative solutions</li>
                                    <li>• <strong>Collaborative environments</strong> where ideas can be shared and developed together</li>
                                    <li>• <strong>Quality-driven work</strong> that allows your team to take pride in their output</li>
                                    <li>• <strong>Growth opportunities</strong> that keep your team learning and adapting</li>
                                  </ul>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                    <X className="w-5 h-5 text-gray-600" />
                                    What to avoid:
                                  </h5>
                                  <ul className="text-sm text-gray-700 space-y-2">
                                    <li>• <strong>Routine-heavy work</strong> that doesn't challenge your team's creative potential</li>
                                    <li>• <strong>Isolated work environments</strong> that prevent collaboration and idea sharing</li>
                                    <li>• <strong>Quality-compromising deadlines</strong> that force rushed, subpar work</li>
                                    <li>• <strong>Stagnant roles</strong> that don't offer learning or growth opportunities</li>
                                  </ul>
                                </div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                  <Zap className="w-5 h-5 text-green-600" />
                                  Your team superpower:
                                </h5>
                                <p className="text-sm text-gray-700">Your team excels at combining innovative thinking with collaborative execution. You naturally create an environment where creative ideas flourish and get implemented effectively.</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Cultural Dimensions Section */}
            <section aria-label="Cultural Dimensions Profile">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Globe className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">
                        Team Cultural Profile
                      </CardTitle>
                      <p className="text-gray-600">
                        How your team approaches collaboration and decision-making
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Two-column layout for radar chart and style preferences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      {/* Left: Radar Chart */}
                      <div className="overflow-visible">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Team Cultural Dimensions</h3>
                        <div className="w-full h-[400px] overflow-visible">
                          <RadarChart
                            data={demoTeamData.aggregateScores.culture}
                            color="#8B5CF6"
                            title=""
                            size={350}
                          />
                        </div>
                      </div>

                      {/* Right: Cultural Dimensions Breakdown */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Team Cultural Style</h3>
                        <div className="space-y-4">
                          {Object.entries(demoTeamData.aggregateScores.culture).map(
                            ([dimension, score]) => (
                              <div key={dimension} className="space-y-2">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium capitalize">
                                        {dimension}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-900">
                                        {getStyleLabel(dimension, score)}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        ({score})
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {getValueExplanation(dimension, score)}
                                  </p>
                                  <Progress value={score} className="h-2" />
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    {/* What This Means for Your Team - Cultural Dimensions */}
                    <div className="mt-8">
                      <h3 className="text-2xl font-semibold mb-6 text-gray-900">What This Means for Your Team</h3>
                      
                      {/* Low Power Distance Card */}
                      <div className="border border-gray-200 rounded-lg mb-4">
                        <div 
                          className="p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                          onClick={() => toggleRecommendation("culture-strengths", 0)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <Globe className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">Low Power Distance - The Collaborative Team</h4>
                                <p className="text-sm text-gray-600">Your team creates flat, collaborative decision-making structures</p>
                              </div>
                            </div>
                            {expandedRecommendations["culture-strengths-0"] ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                        
                        {expandedRecommendations["culture-strengths-0"] && (
                          <div className="px-4 pb-4 border-t border-gray-100">
                            <div className="pt-4 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                      <span className="text-green-600 text-xs">✓</span>
                                    </div>
                                    What to look for:
                                  </h5>
                                  <ul className="text-sm text-gray-700 space-y-2">
                                    <li>• <strong>Flat organizational structures</strong> where everyone's input is valued equally</li>
                                    <li>• <strong>Collaborative decision-making</strong> processes that include all team members</li>
                                    <li>• <strong>Open communication channels</strong> that encourage direct feedback and discussion</li>
                                    <li>• <strong>Merit-based recognition</strong> that rewards individual contributions and achievements</li>
                                  </ul>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                    <X className="w-5 h-5 text-gray-600" />
                                    What to avoid:
                                  </h5>
                                  <ul className="text-sm text-gray-700 space-y-2">
                                    <li>• <strong>Hierarchical structures</strong> that create barriers between team members</li>
                                    <li>• <strong>Top-down decision making</strong> that excludes team input and collaboration</li>
                                    <li>• <strong>Formal communication channels</strong> that discourage open dialogue</li>
                                    <li>• <strong>Seniority-based systems</strong> that don't recognize individual merit and contributions</li>
                                  </ul>
                                </div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                  <Zap className="w-5 h-5 text-purple-600" />
                                  Your team superpower:
                                </h5>
                                <p className="text-sm text-gray-700">Your team creates an environment where everyone's voice matters while maintaining high individual standards. You naturally balance autonomy with collaboration and create inclusive decision-making processes.</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Overall Team Summary */}
            <section aria-label="Overall team summary">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-semibold text-gray-900">Overall Team Summary</CardTitle>
                      <p className="text-sm text-gray-600">Your complete team personality and work style profile</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Team Profile Summary */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-900">Your Team Profile</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                          <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                              <Brain className="h-6 w-6 text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Creative & Collaborative</h4>
                            <p className="text-sm text-gray-600">
                              High openness and collaboration skills make you natural innovators who work well together.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                          <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                              <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Collaborative</h4>
                            <p className="text-sm text-gray-600">
                              You thrive in team environments and value flat organizational structures.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                          <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                              <Award className="h-6 w-6 text-purple-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Quality-Focused</h4>
                            <p className="text-sm text-gray-600">
                              You prioritize excellence and innovation in everything you do.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Key Strengths and Areas for Growth */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          Key Strengths
                        </h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700">Creative problem-solving and innovation</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700">Strong team collaboration and communication</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700">Emotional stability and stress resilience</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700">Quality focus and attention to detail</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          Areas for Growth
                        </h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700">Balancing structure with flexibility</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700">Managing time and priorities effectively</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700">Delegating tasks and trusting others</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700">Setting boundaries and saying no</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Reflection Questions */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Team Reflection Questions</h3>
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleRecommendation("reflection", 0)}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                How can you leverage your creative and social strengths in your current role?
                              </p>
                              {expandedRecommendations["reflection-0"] ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </div>
                          {expandedRecommendations["reflection-0"] && (
                            <div className="px-4 pb-4 border-t border-gray-100">
                              <div className="pt-4">
                                <p className="text-sm text-gray-700">
                                  Consider how your team's high openness and collaboration skills can be applied to current projects. 
                                  Look for opportunities to lead brainstorming sessions, mentor colleagues, or take on cross-functional initiatives 
                                  that showcase your team's natural strengths.
                                </p>
                                <div className="mt-2">
                                  <span className="text-xs text-gray-500">Because:</span>
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 ml-1">
                                    Openness (85) + Collaboration (82)
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleRecommendation("reflection", 1)}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                What type of work environment would best support your team's values and working style?
                              </p>
                              {expandedRecommendations["reflection-1"] ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </div>
                          {expandedRecommendations["reflection-1"] && (
                            <div className="px-4 pb-4 border-t border-gray-100">
                              <div className="pt-4">
                                <p className="text-sm text-gray-700">
                                  Your team thrives in environments that offer flexibility, collaborative spaces, and opportunities for innovation. 
                                  Look for organizations with flat structures, open communication channels, and cultures that value both 
                                  individual achievement and team success.
                                </p>
                                <div className="mt-2">
                                  <span className="text-xs text-gray-500">Because:</span>
                                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 ml-1">
                                    Power Distance (35) + Individualism (78)
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleRecommendation("reflection", 2)}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                How does your team prefer to process and share ideas during meetings?
                              </p>
                              {expandedRecommendations["reflection-2"] ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </div>
                          {expandedRecommendations["reflection-2"] && (
                            <div className="px-4 pb-4 border-t border-gray-100">
                              <div className="pt-4">
                                <p className="text-sm text-gray-700">
                                  This question helps surface different communication preferences in your team. Some members may prefer to think through ideas before sharing, 
                                  while others thrive on spontaneous discussion. Consider establishing both real-time and asynchronous ways to contribute ideas.
                                </p>
                                <div className="mt-2">
                                  <span className="text-xs text-gray-500">Because:</span>
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 ml-1">
                                    Extraversion (66) - Mixed preferences
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleRecommendation("reflection", 3)}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                What balance of structure and flexibility helps each team member do their best work?
                              </p>
                              {expandedRecommendations["reflection-3"] ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </div>
                          {expandedRecommendations["reflection-3"] && (
                            <div className="px-4 pb-4 border-t border-gray-100">
                              <div className="pt-4">
                                <p className="text-sm text-gray-700">
                                  This discussion helps identify individual work style preferences without singling anyone out. Some team members may prefer more 
                                  structured approaches while others thrive with flexibility. Find ways to accommodate both preferences in your team processes.
                                </p>
                                <div className="mt-2">
                                  <span className="text-xs text-gray-500">Because:</span>
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 ml-1">
                                    Openness (85) + Conscientiousness (75)
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleRecommendation("reflection", 4)}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                How comfortable is your team with uncertainty and how do you prefer to handle unexpected changes?
                              </p>
                              {expandedRecommendations["reflection-4"] ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </div>
                          {expandedRecommendations["reflection-4"] && (
                            <div className="px-4 pb-4 border-t border-gray-100">
                              <div className="pt-4">
                                <p className="text-sm text-gray-700">
                                  This question helps the team discuss how to support different comfort levels with ambiguity. Some members may need more information 
                                  and planning when things change, while others adapt quickly. Establish communication protocols that work for everyone.
                                </p>
                                <div className="mt-2">
                                  <span className="text-xs text-gray-500">Because:</span>
                                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 ml-1">
                                    Uncertainty Avoidance (45) - Low preference
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleRecommendation("reflection", 5)}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                How does your team balance individual recognition with collective achievement?
                              </p>
                              {expandedRecommendations["reflection-5"] ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </div>
                          {expandedRecommendations["reflection-5"] && (
                            <div className="px-4 pb-4 border-t border-gray-100">
                              <div className="pt-4">
                                <p className="text-sm text-gray-700">
                                  This question helps surface different motivations and recognition preferences. Some team members may value individual achievement 
                                  while others prioritize team success. Find ways to acknowledge both individual contributions and collaborative efforts.
                                </p>
                                <div className="mt-2">
                                  <span className="text-xs text-gray-500">Because:</span>
                                  <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200 ml-1">
                                    Individualism (78) + Agreeableness (76)
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Your Next Steps */}
                    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold mb-2 text-gray-900">Your Next Steps</h3>
                      <p className="text-sm text-gray-600 mb-6">You can start doing today</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                            <h4 className="font-semibold text-gray-900">This Week</h4>
                          </div>
                          <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <span className="text-sm text-gray-700">Create a dedicated "Innovation Hour" during the week for creative & experimental projects</span>
                                <div className="mt-1">
                                  <span className="text-xs text-gray-500">Because:</span>
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 ml-1">
                                    Openness (85)
                                  </Badge>
                                </div>
                              </div>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <span className="text-sm text-gray-700">Establish rotating meeting facilitation to leverage your collaborative strengths</span>
                                <div className="mt-1">
                                  <span className="text-xs text-gray-500">Because:</span>
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 ml-1">
                                    Collaboration (82)
                                  </Badge>
                                </div>
                              </div>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <span className="text-sm text-gray-700">Implement flat decision-making processes that match your low Power Distance preference</span>
                                <div className="mt-1">
                                  <span className="text-xs text-gray-500">Because:</span>
                                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 ml-1">
                                    Power Distance (35)
                                  </Badge>
                                </div>
                              </div>
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                            <h4 className="font-semibold text-gray-900">This Month</h4>
                          </div>
                          <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <span className="text-sm text-gray-700">Set up quality review processes that leverage your high Quality focus</span>
                                <div className="mt-1">
                                  <span className="text-xs text-gray-500">Because:</span>
                                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 ml-1">
                                    Quality (85)
                                  </Badge>
                                </div>
                              </div>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <span className="text-sm text-gray-700">Create innovation time within structured processes to balance creativity with delivery</span>
                                <div className="mt-1">
                                  <span className="text-xs text-gray-500">Because:</span>
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 ml-1">
                                    Openness (85) + Conscientiousness (75)
                                  </Badge>
                                </div>
                              </div>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <span className="text-sm text-gray-700">Establish regular team reflection sessions to leverage your team dynamics</span>
                                <div className="mt-1">
                                  <span className="text-xs text-gray-500">Because:</span>
                                  <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200 ml-1">
                                    Individualism (78) + Agreeableness (76)
                                  </Badge>
                                </div>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Right Column - 4/12 */}
          <div className="lg:col-span-4 space-y-6">
            {/* Team Members */}
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
                      className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-blue-600">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {member.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {member.completedAt ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-green-600 whitespace-nowrap">
                              Completed
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 whitespace-nowrap"
                              onClick={() =>
                                (window.location.href = `/team/${demoTeamData.code}/candidate/${member.id}/results`)
                              }
                            >
                              View Results →
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            <span className="text-sm text-yellow-600 whitespace-nowrap">
                              Pending
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Quick Tip */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-700">
                        Click on completed members to view their individual assessment results and compare with team averages.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share Results Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Share Team Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Share your team results or export them for future reference. You can also invite new members to join the assessment.
                  </p>
                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={() => setShowShareModal(true)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Team Results
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite New Members
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Potential New Hires */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Potential New Hires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <UserPlus className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">No Candidates Yet</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Invite potential new hires to assess their fit with your team culture.
                    </p>
                    <Button size="sm" className="w-full" onClick={() => setShowInviteModal(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Candidate
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-purple-600 text-xs">🎯</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-900 mb-1">Candidate Assessment</p>
                        <p className="text-sm text-purple-700">
                          Evaluate potential new hires against your team's culture and personality profile to ensure the best fit.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>


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
    </div>
  );
}
