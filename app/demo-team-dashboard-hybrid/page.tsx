'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import RadarChart from '@/components/RadarChart';
import ContextBanner from '@/components/ContextBanner';
import { RecList } from '@/components/RecList';
import { scoreToBand, traitMeta, Trait } from '@/lib/interpretation';
import { buildTeamAgreements } from '@/lib/recommendations';
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
  Info
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ModernSpinner } from '@/components/LoadingSpinner';
import ShareModal from '@/components/ShareModal';
import InviteModal from '@/components/InviteModal';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  status: 'invited' | 'completed' | 'in_progress';
  completedAt?: string;
  oceanScores?: Record<string, number>;
  cultureScores?: Record<string, number>;
  valuesScores?: Record<string, number>;
}

interface TeamData {
  code: string;
  name: string;
  description: string;
  createdAt: string;
  members: TeamMember[];
  aggregateScores: {
    ocean: Record<string, number>;
    culture: Record<string, number>;
    values: Record<string, number>;
  };
  insights: {
    strengths: string[];
    challenges: string[];
    opportunities: string[];
  };
}

// Demo data for a fully populated team
const demoTeamData: TeamData = {
  code: 'DEMO123',
  name: 'Innovation Squad',
  description: 'Cross-functional team focused on product development and user experience',
  createdAt: '2024-01-15',
  members: [
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      status: 'completed',
      completedAt: '2024-01-16T10:30:00Z',
      oceanScores: { openness: 85, conscientiousness: 72, extraversion: 78, agreeableness: 65, neuroticism: 35 },
      cultureScores: { powerDistance: 25, individualism: 70, masculinity: 45, uncertaintyAvoidance: 30, longTermOrientation: 80, indulgence: 60 },
      valuesScores: { innovation: 90, collaboration: 75, autonomy: 65, quality: 85, customerFocus: 80 }
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      email: 'marcus.rodriguez@company.com',
      status: 'completed',
      completedAt: '2024-01-16T14:15:00Z',
      oceanScores: { openness: 70, conscientiousness: 88, extraversion: 45, agreeableness: 75, neuroticism: 40 },
      cultureScores: { powerDistance: 35, individualism: 80, masculinity: 55, uncertaintyAvoidance: 60, longTermOrientation: 70, indulgence: 45 },
      valuesScores: { innovation: 75, collaboration: 60, autonomy: 85, quality: 90, customerFocus: 70 }
    },
    {
      id: '3',
      name: 'Aisha Patel',
      email: 'aisha.patel@company.com',
      status: 'completed',
      completedAt: '2024-01-17T11:45:00Z',
      oceanScores: { openness: 90, conscientiousness: 65, extraversion: 60, agreeableness: 85, neuroticism: 50 },
      cultureScores: { powerDistance: 20, individualism: 60, masculinity: 35, uncertaintyAvoidance: 25, longTermOrientation: 75, indulgence: 70 },
      valuesScores: { innovation: 85, collaboration: 80, autonomy: 70, quality: 75, customerFocus: 90 }
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david.kim@company.com',
      status: 'completed',
      completedAt: '2024-01-17T16:20:00Z',
      oceanScores: { openness: 65, conscientiousness: 95, extraversion: 35, agreeableness: 70, neuroticism: 45 },
      cultureScores: { powerDistance: 40, individualism: 75, masculinity: 60, uncertaintyAvoidance: 70, longTermOrientation: 85, indulgence: 40 },
      valuesScores: { innovation: 70, collaboration: 65, autonomy: 80, quality: 95, customerFocus: 75 }
    },
    {
      id: '5',
      name: 'Emma Thompson',
      email: 'emma.thompson@company.com',
      status: 'completed',
      completedAt: '2024-01-18T13:30:00Z',
      oceanScores: { openness: 75, conscientiousness: 70, extraversion: 85, agreeableness: 80, neuroticism: 30 },
      cultureScores: { powerDistance: 30, individualism: 65, masculinity: 40, uncertaintyAvoidance: 35, longTermOrientation: 70, indulgence: 75 },
      valuesScores: { innovation: 80, collaboration: 85, autonomy: 60, quality: 70, customerFocus: 85 }
    }
  ],
  aggregateScores: {
    ocean: { openness: 77, conscientiousness: 78, extraversion: 60, agreeableness: 75, neuroticism: 40 },
    culture: { powerDistance: 30, individualism: 70, masculinity: 47, uncertaintyAvoidance: 44, longTermOrientation: 76, indulgence: 58 },
    values: { innovation: 80, collaboration: 73, autonomy: 72, quality: 83, customerFocus: 80 }
  },
  insights: {
    strengths: [
      'High innovation and creativity across the team',
      'Strong focus on quality and customer experience',
      'Balanced mix of introverts and extroverts',
      'Low power distance preference enables flat collaboration'
    ],
    challenges: [
      'Potential communication style conflicts between high and low extraverts',
      'Mixed preferences for structure vs flexibility',
      'Varying stress tolerance levels under pressure'
    ],
    opportunities: [
      'Leverage diverse perspectives for comprehensive problem-solving',
      'Use structured processes with flexibility for innovation',
      'Implement stress management protocols for team harmony'
    ]
  }
};

// Demo team recommendations
const demoRecommendations = {
  summary: "Your team shows excellent potential for innovation and quality-focused work, with a healthy balance of personality types that can drive comprehensive solutions.",
  keyStrengths: [
    "High innovation scores across all team members",
    "Strong quality focus and attention to detail",
    "Diverse communication styles for different situations"
  ],
  developmentAreas: [
    "Communication protocols for mixed extraversion levels",
    "Process flexibility to accommodate different work styles",
    "Stress management strategies for varying tolerance levels"
  ],
  recommendations: [
    {
      title: "Implement Structured Communication Protocols",
      description: "Create meeting formats that balance participation between high and low extraverts.",
      impact: "High",
      effort: "Medium"
    },
    {
      title: "Establish Innovation Time",
      description: "Allocate dedicated time for creative exploration and experimentation.",
      impact: "High",
      effort: "Low"
    },
    {
      title: "Quality Review Processes",
      description: "Implement structured review processes that maintain quality without slowing innovation.",
      impact: "High",
      effort: "Medium"
    }
  ]
};

export default function DemoTeamDashboardHybridPage() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [expandedConversationStarters, setExpandedConversationStarters] = useState<Record<string, boolean>>({});
  const [expandedRecommendations, setExpandedRecommendations] = useState<Record<string, boolean>>({});
  const [expandedTeamInsights, setExpandedTeamInsights] = useState<Record<string, boolean>>({});
  const [expandedKeyInsights, setExpandedKeyInsights] = useState<Record<string, boolean>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return isClient ? <CheckCircle className="h-4 w-4 text-green-600" /> : null;
      case 'in_progress': return isClient ? <Clock className="h-4 w-4 text-yellow-600" /> : null;
      case 'invited': return isClient ? <Mail className="h-4 w-4 text-gray-400" /> : null;
      default: return isClient ? <AlertCircle className="h-4 w-4 text-red-600" /> : null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'invited': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'invited': return 'Invited';
      default: return 'Error';
    }
  };

  const getTermExplanation = (term: string) => {
    const explanations: Record<string, string> = {
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
    
    return explanations[term.toLowerCase()] || 'No explanation available for this term.';
  };

  const toggleConversationStarter = (index: number) => {
    setExpandedConversationStarters(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleRecommendation = (index: number) => {
    setExpandedRecommendations(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleTeamInsight = (section: string, index: number) => {
    const key = `${section}-${index}`;
    setExpandedTeamInsights(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleKeyInsight = (section: string) => {
    setExpandedKeyInsights(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };


  // Generate conversation starters with context
  const conversationStarters = [
    {
      question: "How can we leverage our 'Structure-first' and 'Frontier-seeker' mix for better innovation?",
      context: "This explores how the team's different working styles (some prefer structure, others prefer exploration) can complement each other to drive innovation while maintaining quality."
    },
    {
      question: "Where has our team's diversity of styles been an advantage recently?",
      context: "This helps the team reflect on specific examples where their different personality types and working styles have led to better outcomes or problem-solving."
    },
    {
      question: "What working agreements would help us avoid the friction risks we identified?",
      context: "This focuses on creating team agreements or ground rules that address potential conflicts between different working styles and communication preferences."
    },
    {
      question: "How can we create space for both structured planning and creative exploration?",
      context: "This addresses how to balance the needs of team members who prefer clear processes with those who thrive in more flexible, experimental environments."
    }
  ];

  // Generate team agreements using interpretation system
  const teamProfiles = demoTeamData.members
    .filter(m => m.status === 'completed' && m.oceanScores)
    .map(m => ({
      openness: m.oceanScores!.openness,
      conscientiousness: m.oceanScores!.conscientiousness,
      extraversion: m.oceanScores!.extraversion,
      agreeableness: m.oceanScores!.agreeableness,
      neuroticism: m.oceanScores!.neuroticism,
      severity: 0
    }));
  
  const teamAgreements = buildTeamAgreements(teamProfiles);

  const completedMembers = demoTeamData.members.filter(m => m.status === 'completed');
  const completionRate = (completedMembers.length / demoTeamData.members.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{demoTeamData.name}</h1>
            <p className="text-gray-600">{demoTeamData.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline" className="font-mono">{demoTeamData.code}</Badge>
              <span className="text-sm text-gray-500">
                Created {new Date(demoTeamData.createdAt).toLocaleDateString('en-US')}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            {isClient && (
              <Button variant="outline" onClick={() => setShowShareModal(true)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
            {isClient && (
              <Button onClick={() => setShowInviteModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Members
              </Button>
            )}
          </div>
        </div>

        {/* Context Banner */}
        <ContextBanner />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Team Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isClient && <Users className="h-5 w-5" />}
                  Team Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{demoTeamData.members.length}</div>
                    <div className="text-sm text-gray-600">Total Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{completedMembers.length}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">{Math.round(completionRate)}%</div>
                    <div className="text-sm text-gray-600">Completion Rate</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Assessment Progress</span>
                    <span className="text-sm text-gray-500">{completedMembers.length}/{demoTeamData.members.length} completed</span>
                  </div>
                  <Progress value={completionRate} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* OCEAN Personality Profile */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Team Personality Profile</CardTitle>
                    <p className="text-gray-600">Your team's OCEAN personality traits reveal how you naturally think, feel, and behave in work environments. These traits influence your work style, communication preferences, and how you interact with others.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Radar Chart + Detailed Scores */}
                  <div className="space-y-8">
                    {/* Radar Chart */}
                    <div className="mb-12">
                      <h3 className="text-lg font-semibold mb-4">Team Personality Dimensions</h3>
                      <div className="w-full h-72 p-4">
                        <RadarChart 
                          data={demoTeamData.aggregateScores.ocean} 
                          color="#3B82F6"
                          size={350}
                        />
                      </div>
                    </div>

                    {/* Team Style Preferences */}
                    <div className="mt-12">
                      <h3 className="text-lg font-semibold mb-4">Team Style Preferences</h3>
                      <div className="space-y-4">
                        {Object.entries(demoTeamData.aggregateScores.ocean).map(([trait, score]) => (
                          <div key={trait} className="space-y-2">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium capitalize">{trait}</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                        <HelpCircle className="h-4 w-4" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p>{getTermExplanation(trait)}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Badge className="bg-blue-100 text-blue-800">
                                  {getStyleLabel(trait, score)} ({score})
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 italic">
                                {getStyleExplanation(trait, score)}
                              </div>
                            </div>
                            <Progress value={score} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Key Insights */}
                  <div className="space-y-6">
                    {/* Key Insights */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                      <ul className="space-y-2">
                        {demoTeamData.insights.strengths.map((insight, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Key Insights - Personality */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => toggleKeyInsight('personality')}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              {isClient && <Info className="h-4 w-4 text-blue-600" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Team Personality Analysis</p>
                              <p className="text-sm text-gray-600">
                                Based on your team's aggregate OCEAN personality profile, you have a balanced mix of personality types 
                                that creates opportunities for diverse perspectives and comprehensive problem-solving.
                              </p>
                            </div>
                          </div>
                          {isClient && (expandedKeyInsights['personality'] ? (
                            <ChevronUp className="h-4 w-4 text-gray-500 ml-2" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
                          ))}
                        </div>
                      </button>
                      {expandedKeyInsights['personality'] && (
                        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                          <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-200">
                              <h6 className="font-medium text-gray-900 text-sm mb-2">What This Means</h6>
                              <p className="text-sm text-gray-600">
                                Your team's OCEAN scores show a healthy balance across all five personality dimensions. 
                                This means you have team members who complement each other's strengths and working styles, 
                                creating a well-rounded team that can handle diverse challenges effectively.
                              </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h6 className="font-medium text-gray-900 text-sm mb-2">High Scores</h6>
                                <p className="text-sm text-gray-600">Areas where your team shows strong collective tendencies</p>
                              </div>
                              <div>
                                <h6 className="font-medium text-gray-900 text-sm mb-2">Low Scores</h6>
                                <p className="text-sm text-gray-600">Areas where your team tends to be more cautious or structured</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cultural Work Preferences */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Globe className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Team Cultural Preferences</CardTitle>
                    <p className="text-gray-600">Your team's cultural preferences indicate how you prefer to work within organizational structures and what kind of work environment brings out your best performance.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Radar Chart + Detailed Scores */}
                  <div className="space-y-8">
                    {/* Radar Chart */}
                    <div className="mb-12">
                      <h3 className="text-lg font-semibold mb-4">Team Cultural Dimensions</h3>
                      <div className="w-full h-72 p-4">
                        <RadarChart 
                          data={demoTeamData.aggregateScores.culture} 
                          color="#10B981"
                          size={350}
                        />
                      </div>
                    </div>

                    {/* Team Style Preferences */}
                    <div className="mt-12">
                      <h3 className="text-lg font-semibold mb-4">Team Style Preferences</h3>
                      <div className="space-y-4">
                        {Object.entries(demoTeamData.aggregateScores.culture).map(([dimension, score]) => (
                          <div key={dimension} className="space-y-2">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium capitalize">{dimension.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                        <HelpCircle className="h-4 w-4" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p>{getTermExplanation(dimension)}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Badge className="bg-green-100 text-green-800">
                                  {getStyleLabel(dimension, score)} ({score})
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 italic">
                                {getStyleExplanation(dimension, score)}
                              </div>
                            </div>
                            <Progress value={score} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Key Insights */}
                  <div className="space-y-6">
                    {/* Key Insights */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                      <ul className="space-y-2">
                        {demoTeamData.insights.challenges.map((insight, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Key Insights - Cultural */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => toggleKeyInsight('cultural')}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              {isClient && <Info className="h-4 w-4 text-green-600" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Team Cultural Analysis</p>
                              <p className="text-sm text-gray-600">
                                Your team demonstrates a preference for collaborative work environments with balanced power dynamics. 
                                This creates a foundation for inclusive decision-making and shared responsibility.
                              </p>
                            </div>
                          </div>
                          {isClient && (expandedKeyInsights['cultural'] ? (
                            <ChevronUp className="h-4 w-4 text-gray-500 ml-2" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
                          ))}
                        </div>
                      </button>
                      {expandedKeyInsights['cultural'] && (
                        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                          <div className="space-y-4">
                            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-200">
                              <h6 className="font-medium text-gray-900 text-sm mb-2">What This Means</h6>
                              <p className="text-sm text-gray-600">
                                Your team's cultural preferences show a collaborative approach to work with relatively flat hierarchies. 
                                This means team members feel comfortable sharing ideas, questioning decisions, and working together 
                                as equals rather than following strict top-down structures.
                              </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h6 className="font-medium text-gray-900 text-sm mb-2">Power Distance</h6>
                                <p className="text-sm text-gray-600">How comfortable your team is with hierarchy and authority</p>
                              </div>
                              <div>
                                <h6 className="font-medium text-gray-900 text-sm mb-2">Individualism</h6>
                                <p className="text-sm text-gray-600">Whether your team prefers group work or individual contributions</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Work Values Assessment */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Target className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Team Values Profile</CardTitle>
                    <p className="text-gray-600">Your team's work values represent what motivates and drives you professionally. Understanding these helps align your career choices with what truly matters to you.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Radar Chart + Detailed Scores */}
                  <div className="space-y-8">
                    {/* Radar Chart */}
                    <div className="mb-12">
                      <h3 className="text-lg font-semibold mb-4">Team Work Values</h3>
                      <div className="w-full h-72 p-4">
                        <RadarChart 
                          data={demoTeamData.aggregateScores.values} 
                          color="#F59E0B"
                          size={350}
                        />
                      </div>
                    </div>

                    {/* Team Style Preferences */}
                    <div className="mt-12">
                      <h3 className="text-lg font-semibold mb-4">Team Style Preferences</h3>
                      <div className="space-y-4">
                        {Object.entries(demoTeamData.aggregateScores.values).map(([value, score]) => (
                          <div key={value} className="space-y-2">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium capitalize">{value.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                        <HelpCircle className="h-4 w-4" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p>{getTermExplanation(value)}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Badge className="bg-orange-100 text-orange-800">
                                  {getStyleLabel(value, score)} ({score})
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 italic">
                                {getStyleExplanation(value, score)}
                              </div>
                            </div>
                            <Progress value={score} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Key Insights */}
                  <div className="space-y-6">
                    {/* Key Insights */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                      <ul className="space-y-2">
                        {demoTeamData.insights.opportunities.map((insight, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Key Insights - Values */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => toggleKeyInsight('values')}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              {isClient && <Info className="h-4 w-4 text-orange-600" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Team Values Analysis</p>
                              <p className="text-sm text-gray-600">
                                Your team prioritizes quality and customer focus while maintaining a strong drive for innovation. 
                                This combination supports sustainable growth and customer satisfaction.
                              </p>
                            </div>
                          </div>
                          {isClient && (expandedKeyInsights['values'] ? (
                            <ChevronUp className="h-4 w-4 text-gray-500 ml-2" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
                          ))}
                        </div>
                      </button>
                      {expandedKeyInsights['values'] && (
                        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                          <div className="space-y-4">
                            <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-200">
                              <h6 className="font-medium text-gray-900 text-sm mb-2">What This Means</h6>
                              <p className="text-sm text-gray-600">
                                Your team's work values show a strong commitment to delivering excellent results while staying 
                                adaptable and innovative. This means you have a team that cares about doing things right 
                                while also being open to new approaches and continuous improvement.
                              </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h6 className="font-medium text-gray-900 text-sm mb-2">Quality Focus</h6>
                                <p className="text-sm text-gray-600">How much your team values doing things well and thoroughly</p>
                              </div>
                              <div>
                                <h6 className="font-medium text-gray-900 text-sm mb-2">Innovation Drive</h6>
                                <p className="text-sm text-gray-600">How open your team is to new ideas and approaches</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Recommendations - Moved to main content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isClient && <Lightbulb className="h-5 w-5" />}
                  Team Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Team Summary */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        {isClient && <Lightbulb className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">AI Summary</p>
                        <p className="text-sm text-blue-700">{demoRecommendations.summary}</p>
                      </div>
                    </div>
                  </div>

                  {/* Key Strengths */}
                  <div>
                    <h4 className="font-semibold text-green-900 mb-3">Key Strengths</h4>
                    <div className="space-y-2">
                      {demoRecommendations.keyStrengths.map((strength, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">{strength}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Development Areas */}
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-3">Development Areas</h4>
                    <div className="space-y-2">
                      {demoRecommendations.developmentAreas.map((area, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">{area}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Opportunities Section */}
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-3">Opportunities</h4>
                    <div className="space-y-2">
                      {demoTeamData.insights.opportunities.map((opportunity, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700 text-sm">{opportunity}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Top Recommendations</h4>
                    </div>
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">
                        <strong>How we generated these recommendations:</strong> Based on your team's personality profiles, 
                        cultural preferences, and work values, we identified areas where your team can work more effectively 
                        together. Each recommendation addresses specific patterns we found in your team's data.
                      </p>
                    </div>
                    <div className="space-y-4">
                      {demoRecommendations.recommendations.map((rec, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleRecommendation(index)}
                            className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-gray-900">{rec.title}</h5>
                                  <div className="flex gap-2">
                                    <Badge className="bg-green-100 text-green-700 text-xs">High Impact</Badge>
                                    <Badge className="bg-blue-100 text-blue-700 text-xs">Medium Effort</Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">{rec.description}</p>
                              </div>
                              {isClient && (expandedRecommendations[index] ? (
                                <ChevronUp className="h-5 w-5 text-gray-500 ml-4" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500 ml-4" />
                              ))}
                            </div>
                          </button>
                          {expandedRecommendations[index] && (
                            <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                              <div className="space-y-4">
                                <div>
                                  <h6 className="font-medium text-gray-900 text-sm mb-2">Why This Matters</h6>
                                  <p className="text-sm text-gray-600">
                                    This recommendation addresses specific patterns we identified in your team's assessment data. 
                                    It's designed to help your team work more effectively together based on your unique combination 
                                    of personality types, cultural preferences, and work values.
                                  </p>
                                </div>
                                <div>
                                  <h6 className="font-medium text-gray-900 text-sm mb-2">Next Steps</h6>
                                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                                    <li className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                      Start with a team discussion about this recommendation
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                      Assign someone to lead the implementation
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                      Set a timeline for trying this approach
                                    </li>
                                  </ul>
                                </div>
                                <div>
                                  <h6 className="font-medium text-gray-900 text-sm mb-2">Try This</h6>
                                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                                    <li className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                      Schedule a 30-minute team session to discuss this recommendation
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                      Create a simple action plan with clear next steps
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conversation Starters Section */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Team Conversation Starters</h4>
                    <div className="space-y-4">
                      {conversationStarters.map((starter, index) => (
                        <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <button
                            onClick={() => toggleConversationStarter(index)}
                            className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-gray-700 font-medium text-sm">
                                {starter.question}
                              </p>
                              {isClient && (expandedConversationStarters[index] ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              ))}
                            </div>
                          </button>
                          {expandedConversationStarters[index] && (
                            <div className="px-4 pb-4 border-t border-gray-100">
                              <p className="text-sm text-gray-600 mt-2 italic">
                                {starter.context}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Members with Style Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isClient && <Users className="h-5 w-5" />}
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoTeamData.members.map((member) => (
                    <div 
                      key={member.id} 
                      className="p-5 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                      onClick={() => {
                        if (member.status === 'completed') {
                          // Navigate to individual results
                          window.open(`/assessment/${member.id}/results`, '_blank');
                        } else {
                          // Show status message
                          alert(`${member.name} hasn't completed the assessment yet.`);
                        }
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                          <span className="text-sm font-bold text-blue-700">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="mb-3">
                            <div className="font-semibold text-gray-900 text-base truncate">{member.name}</div>
                            <div className="text-sm text-gray-500 truncate">{member.email}</div>
                          </div>
                          
                          {/* Style Preferences instead of numbers */}
                          {member.status === 'completed' && member.oceanScores && (
                            <div className="mb-3 space-y-2">
                              <div className="text-xs font-medium text-gray-600">Style Preferences:</div>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(member.oceanScores).slice(0, 3).map(([trait, score]) => (
                                  <Badge key={trait} variant="outline" className="text-xs px-2 py-1">
                                    {getStyleLabel(trait, score)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <Badge className={`${getStatusColor(member.status)} px-2 py-1 text-xs`}>
                              {getStatusIcon(member.status)}
                              <span className="ml-1 font-medium">{getStatusText(member.status)}</span>
                            </Badge>
                            
                            {member.status === 'completed' && (
                              <div className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                                <span>View Results</span>
                                {isClient && <ArrowRight className="h-3 w-3" />}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-xs">💡</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Quick Tip</p>
                      <p className="text-sm text-blue-700">
                        Click on completed members to view their individual assessment results and compare with team averages.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New Hires Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isClient && <UserPlus className="h-5 w-5" />}
                  New Hires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {isClient && <UserPlus className="h-8 w-8 text-gray-400" />}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No New Hires Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Invite new team members to complete their assessments and join your team culture insights.
                    </p>
                    <Button onClick={() => setShowInviteModal(true)}>
                      {isClient && <UserPlus className="h-4 w-4 mr-2" />}
                      Invite New Members
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ready to Share Results */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {isClient && <Share2 className="h-8 w-8 text-blue-600" />}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Share Your Results?</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Your team culture insights are ready! Share these results with your team to start meaningful conversations about collaboration and growth.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => setShowShareModal(true)} variant="outline">
                      {isClient && <Share2 className="h-4 w-4 mr-2" />}
                      Share Results
                    </Button>
                    <Button onClick={() => setShowInviteModal(true)}>
                      {isClient && <UserPlus className="h-4 w-4 mr-2" />}
                      Invite Team
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
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
