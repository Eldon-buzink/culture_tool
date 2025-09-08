'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import RadarChart from '@/components/RadarChart';
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
  Lightbulb,
  AlertTriangle
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

export default function DemoTeamDashboardPage() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'invited': return <Mail className="h-4 w-4 text-gray-400" />;
      default: return <AlertCircle className="h-4 w-4 text-red-600" />;
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Team Overview */}
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

            {/* Team Aggregate Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Team Aggregate Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* OCEAN Aggregate */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Team Personality Profile
                    </h4>
                    <div className="relative">
                      <RadarChart 
                        data={demoTeamData.aggregateScores.ocean} 
                        color="#3B82F6"
                      />
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 text-center mb-3">Trait Scores</h5>
                        <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                          {Object.entries(demoTeamData.aggregateScores.ocean).map(([trait, score]) => (
                            <Tooltip key={trait}>
                              <TooltipTrigger asChild>
                                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap shadow-sm">
                                  <span className="mr-1 text-gray-500">?</span>
                                  {trait.charAt(0).toUpperCase() + trait.slice(1)}: {score}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{getTermExplanation(trait)}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Lightbulb className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">Key Insights</p>
                          <p className="text-sm text-blue-700">
                            Your team shows a balanced personality profile with strengths in collaboration and innovation. 
                            The mix of personality types creates opportunities for diverse perspectives and comprehensive problem-solving.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Culture Aggregate */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Team Cultural Preferences
                    </h4>
                    <div className="relative">
                      <RadarChart 
                        data={demoTeamData.aggregateScores.culture} 
                        color="#10B981"
                      />
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 text-center mb-3">Cultural Dimensions</h5>
                        <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                          {Object.entries(demoTeamData.aggregateScores.culture).map(([trait, score]) => (
                            <Tooltip key={trait}>
                              <TooltipTrigger asChild>
                                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap shadow-sm">
                                  <span className="mr-1 text-gray-500">?</span>
                                  {trait.replace(/_/g, ' ').charAt(0).toUpperCase() + trait.replace(/_/g, ' ').slice(1)}: {score}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{getTermExplanation(trait)}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Globe className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900 mb-1">Cultural Insights</p>
                          <p className="text-sm text-green-700">
                            Your team demonstrates a preference for collaborative work environments with balanced power dynamics. 
                            This creates a foundation for inclusive decision-making and shared responsibility.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Values Aggregate */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Team Values Profile
                    </h4>
                    <div className="relative">
                      <RadarChart 
                        data={demoTeamData.aggregateScores.values} 
                        color="#F59E0B"
                      />
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 text-center mb-3">Work Values</h5>
                        <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                          {Object.entries(demoTeamData.aggregateScores.values).map(([trait, score]) => (
                            <Tooltip key={trait}>
                              <TooltipTrigger asChild>
                                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap shadow-sm">
                                  <span className="mr-1 text-gray-500">?</span>
                                  {trait.charAt(0).toUpperCase() + trait.slice(1)}: {score}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{getTermExplanation(trait)}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Target className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-orange-900 mb-1">Values Insights</p>
                          <p className="text-sm text-orange-700">
                            Your team prioritizes quality and customer focus while maintaining a strong drive for innovation. 
                            This combination supports sustainable growth and customer satisfaction.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Team Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-green-900 mb-3">Team Strengths</h4>
                    <div className="space-y-2">
                      {demoTeamData.insights.strengths.map((strength, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700 text-sm">{strength}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-3">Areas for Attention</h4>
                    <div className="space-y-2">
                      {demoTeamData.insights.challenges.map((challenge, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700 text-sm">{challenge}</p>
                        </div>
                      ))}
                    </div>
                  </div>

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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                          
                          <div className="flex items-center justify-between">
                            <Badge className={`${getStatusColor(member.status)} px-2 py-1 text-xs`}>
                              {getStatusIcon(member.status)}
                              <span className="ml-1 font-medium">{getStatusText(member.status)}</span>
                            </Badge>
                            
                            {member.status === 'completed' && (
                              <div className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                                <span>View Results</span>
                                <ArrowRight className="h-3 w-3" />
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


            {/* Quick Actions - Matching Individual Assessment Design */}
            <Card>
              <CardContent className="pt-8">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Share Your Results?</h2>
                  <p className="text-gray-600 mb-6">
                    Share your team results or export them for future reference. You can also invite new members to join the assessment.
                  </p>
                  <div className="flex flex-col gap-4">
                    <Button 
                      size="lg" 
                      className="bg-green-600 hover:bg-green-700 px-8 py-3"
                      onClick={() => setShowShareModal(true)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Share Team Results
                    </Button>
                    <Button 
                      size="lg" 
                      className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite New Members
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="px-8 py-3"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Team Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Team Summary */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
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

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Top Recommendations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {demoRecommendations.recommendations.map((rec, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="p-4 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{rec.title}</h5>
                              <div className="flex gap-2">
                                <Badge className="bg-green-100 text-green-700 text-xs">High Impact</Badge>
                                <Badge className="bg-blue-100 text-blue-700 text-xs">Medium Effort</Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
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
