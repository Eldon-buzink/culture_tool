'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Mail, 
  Copy, 
  Share2,
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
  Heart,
  Star,
  Target as TargetIcon,
  Users as UsersIcon,
  BarChart3,
  PieChart
} from 'lucide-react';
import { TermGlossary } from '@/components/TermExplanation';
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
  role?: string;
  joinedAt?: string;
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

interface PersonalityConflict {
  type: string;
  description: string;
  members: TeamMember[];
  explanation: string;
  implications: string[];
  recommendations: string[];
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
      role: 'Product Manager',
      joinedAt: '2024-01-15T09:00:00Z',
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
      role: 'Senior Developer',
      joinedAt: '2024-01-15T09:00:00Z',
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
      role: 'UX Designer',
      joinedAt: '2024-01-15T09:00:00Z',
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
      role: 'Data Analyst',
      joinedAt: '2024-01-15T09:00:00Z',
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
      role: 'Marketing Specialist',
      joinedAt: '2024-01-15T09:00:00Z',
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

// Demo personality conflicts
const demoConflicts: PersonalityConflict[] = [
  {
    type: "Communication Style Conflict",
    description: "Team has mixed communication preferences - some prefer immediate discussion while others need processing time",
    members: [demoTeamData.members[0], demoTeamData.members[1]], // Sarah (high extravert) vs Marcus (low extravert)
    explanation: "Sarah's high extraversion (78) means she prefers spontaneous, interactive communication while Marcus's lower extraversion (45) means he prefers structured, thoughtful discussions. This can lead to meetings where Sarah dominates while Marcus feels unheard.",
    implications: [
      "Sarah may dominate discussions and make quick decisions",
      "Marcus may feel overwhelmed and need time to process information",
      "Team meetings may not be equally productive for all members",
      "Important perspectives from quieter members may be missed"
    ],
    recommendations: [
      "Send meeting agendas 24 hours in advance",
      "Use both synchronous and asynchronous communication channels",
      "Allow quiet time during brainstorming sessions",
      "Follow up written decisions with quick video calls",
      "Assign meeting roles (facilitator, note-taker, time-keeper)"
    ]
  },
  {
    type: "Work Style Conflict",
    description: "Team has conflicting preferences for structure vs flexibility in work processes",
    members: [demoTeamData.members[1], demoTeamData.members[2]], // Marcus (high conscientiousness) vs Aisha (high openness)
    explanation: "Marcus's high conscientiousness (88) means he prefers structured, planned approaches while Aisha's high openness (90) means she prefers flexible, innovative methods. This can create tension around processes and decision-making.",
    implications: [
      "Process-oriented members may resist changes and new approaches",
      "Innovation-focused members may find structured processes limiting",
      "Project planning may be contentious between planners and adapters",
      "Quality standards may conflict with speed and experimentation"
    ],
    recommendations: [
      "Establish clear project phases with flexibility within each phase",
      "Create innovation time within structured processes",
      "Use design thinking methodologies that balance structure and creativity",
      "Assign roles based on strengths (planner vs innovator)",
      "Regularly review and adapt processes based on team feedback"
    ]
  }
];

// Demo team recommendations
const demoRecommendations = {
  communication: {
    title: "Optimize Communication for Diverse Styles",
    description: "Your team has a healthy mix of communication preferences, but needs structured approaches to ensure everyone's voice is heard.",
    recommendations: [
      {
        title: "Implement Structured Meeting Formats",
        description: "Use meeting agendas, time limits, and role assignments to balance participation.",
        impact: "High",
        effort: "Medium"
      },
      {
        title: "Create Multiple Communication Channels",
        description: "Offer both real-time and asynchronous communication options for different preferences.",
        impact: "High",
        effort: "Low"
      },
      {
        title: "Regular One-on-One Check-ins",
        description: "Provide individual attention to team members who prefer quieter communication styles.",
        impact: "Medium",
        effort: "Medium"
      }
    ]
  },
  innovation: {
    title: "Leverage High Innovation Potential",
    description: "Your team has exceptional innovation scores. Create processes that channel this creativity effectively.",
    recommendations: [
      {
        title: "Dedicated Innovation Time",
        description: "Allocate 20% of work time for creative exploration and experimentation.",
        impact: "High",
        effort: "Medium"
      },
      {
        title: "Cross-functional Brainstorming Sessions",
        description: "Regular sessions where different perspectives can spark new ideas.",
        impact: "High",
        effort: "Low"
      },
      {
        title: "Innovation Metrics and Recognition",
        description: "Track and celebrate innovative contributions and successful experiments.",
        impact: "Medium",
        effort: "Low"
      }
    ]
  },
  quality: {
    title: "Maintain High Quality Standards",
    description: "Your team values quality highly. Ensure processes support this while maintaining efficiency.",
    recommendations: [
      {
        title: "Quality Gates and Reviews",
        description: "Implement structured review processes that don't slow down innovation.",
        impact: "High",
        effort: "Medium"
      },
      {
        title: "Automated Quality Checks",
        description: "Use tools and processes that maintain quality without manual overhead.",
        impact: "High",
        effort: "High"
      },
      {
        title: "Quality vs Speed Trade-off Discussions",
        description: "Regular team discussions about when to prioritize quality vs delivery speed.",
        impact: "Medium",
        effort: "Low"
      }
    ]
  }
};

export default function DemoTeamDashboardPage() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [expandedRecommendations, setExpandedRecommendations] = useState({
    communication: false,
    innovation: false,
    quality: false,
  });
  const [expandedConflicts, setExpandedConflicts] = useState<{ [key: number]: boolean }>({});

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/team/join/${demoTeamData.code}`;
    navigator.clipboard.writeText(inviteLink);
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

  const toggleRecommendation = (section: string) => {
    setExpandedRecommendations(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const toggleConflict = (index: number) => {
    setExpandedConflicts(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const completedMembers = demoTeamData.members.filter(m => m.status === 'completed');
  const completionRate = (completedMembers.length / demoTeamData.members.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {demoTeamData.name} Dashboard
              </h1>
              <p className="text-gray-600">{demoTeamData.description}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowInviteModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Members
              </Button>
              <Button variant="outline" onClick={() => setShowShareModal(true)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Results
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{demoTeamData.members.length}</div>
                <div className="text-sm text-gray-600">Team Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{completedMembers.length}</div>
                <div className="text-sm text-gray-600">Completed Assessments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">{Math.round(completionRate)}%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">{demoConflicts.length}</div>
                <div className="text-sm text-gray-600">Potential Conflicts</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Members */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Quick Tip</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Click on completed members to view their individual assessment results and compare with team averages.
                  </p>
                </div>
                
                <div className="space-y-3">
                  {demoTeamData.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.status === 'completed' ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        ) : member.status === 'in_progress' ? (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />
                            In Progress
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            <Mail className="h-3 w-3 mr-1" />
                            Invited
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Culture Radar Chart */}
            <Card>
              <CardHeader>
                                 <CardTitle className="flex items-center gap-2">
                   <BarChart3 className="h-5 w-5" />
                   Team Culture Profile
                 </CardTitle>
              </CardHeader>
                             <CardContent>
                 <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                   <div className="text-center">
                     <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                     <h3 className="text-lg font-medium text-gray-900 mb-2">Team Culture Profile</h3>
                     <p className="text-gray-600 mb-4">Interactive radar chart showing team personality distribution</p>
                     <div className="grid grid-cols-5 gap-4 text-sm">
                       <div className="text-center">
                         <div className="font-medium text-blue-600">{demoTeamData.aggregateScores.ocean.openness}</div>
                         <div className="text-gray-500">Openness</div>
                       </div>
                       <div className="text-center">
                         <div className="font-medium text-blue-600">{demoTeamData.aggregateScores.ocean.conscientiousness}</div>
                         <div className="text-gray-500">Conscientiousness</div>
                       </div>
                       <div className="text-center">
                         <div className="font-medium text-blue-600">{demoTeamData.aggregateScores.ocean.extraversion}</div>
                         <div className="text-gray-500">Extraversion</div>
                       </div>
                       <div className="text-center">
                         <div className="font-medium text-blue-600">{demoTeamData.aggregateScores.ocean.agreeableness}</div>
                         <div className="text-gray-500">Agreeableness</div>
                       </div>
                       <div className="text-center">
                         <div className="font-medium text-blue-600">{demoTeamData.aggregateScores.ocean.neuroticism}</div>
                         <div className="text-gray-500">Neuroticism</div>
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
                  <Brain className="h-5 w-5" />
                  Team Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {demoTeamData.insights.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Challenges
                    </h4>
                    <ul className="space-y-2">
                      {demoTeamData.insights.challenges.map((challenge, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Opportunities
                    </h4>
                    <ul className="space-y-2">
                      {demoTeamData.insights.opportunities.map((opportunity, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  AI-Powered Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(demoRecommendations).map(([key, section]) => (
                    <div key={key} className="border rounded-lg p-4">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleRecommendation(key)}
                      >
                        <div>
                          <h4 className="font-semibold text-gray-900">{section.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                        </div>
                        <ChevronDown 
                          className={`h-5 w-5 text-gray-500 transition-transform ${
                            expandedRecommendations[key as keyof typeof expandedRecommendations] ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                      
                      {expandedRecommendations[key as keyof typeof expandedRecommendations] && (
                        <div className="mt-4 space-y-3">
                          {section.recommendations.map((rec, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-medium text-gray-900">{rec.title}</h5>
                                <div className="flex gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    Impact: {rec.impact}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Effort: {rec.effort}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">{rec.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Personality Conflicts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Potential Team Conflicts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoConflicts.map((conflict, index) => (
                    <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleConflict(index)}
                      >
                        <div>
                          <h4 className="font-semibold text-orange-900">{conflict.type}</h4>
                          <p className="text-sm text-orange-700 mt-1">{conflict.description}</p>
                        </div>
                        <ChevronDown 
                          className={`h-5 w-5 text-orange-500 transition-transform ${
                            expandedConflicts[index] ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                      
                      {expandedConflicts[index] && (
                        <div className="mt-4 space-y-4">
                          <div>
                            <h5 className="font-medium text-orange-900 mb-2">Explanation</h5>
                            <p className="text-sm text-orange-800">{conflict.explanation}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-orange-900 mb-2">Implications</h5>
                            <ul className="space-y-1">
                              {conflict.implications.map((implication, impIndex) => (
                                <li key={impIndex} className="text-sm text-orange-800 flex items-start gap-2">
                                  <div className="w-1 h-1 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                  {implication}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-orange-900 mb-2">Recommendations</h5>
                            <ul className="space-y-1">
                              {conflict.recommendations.map((recommendation, recIndex) => (
                                <li key={recIndex} className="text-sm text-orange-800 flex items-start gap-2">
                                  <div className="w-1 h-1 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                  {recommendation}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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
