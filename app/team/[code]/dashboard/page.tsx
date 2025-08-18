'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
  BookOpen,
  MessageSquare,
  Zap,
  Award,
  ChevronDown,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { TermGlossary } from '@/components/TermExplanation';

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

interface PersonalityConflict {
  type: string;
  description: string;
  members: TeamMember[];
  explanation: string;
  implications: string[];
  recommendations: string[];
}

// Function to detect personality-based conflicts
function detectPersonalityConflicts(members: TeamMember[]): PersonalityConflict[] {
  const conflicts: PersonalityConflict[] = [];
  
  if (members.length < 2) return conflicts;
  
  // Check for communication style conflicts (Extraversion)
  const extraversionScores = members.map(m => m.oceanScores?.extraversion || 0);
  const extraversionRange = Math.max(...extraversionScores) - Math.min(...extraversionScores);
  
  if (extraversionRange > 40) {
    const highExtraverts = members.filter(m => (m.oceanScores?.extraversion || 0) > 70);
    const lowExtraverts = members.filter(m => (m.oceanScores?.extraversion || 0) < 30);
    
    if (highExtraverts.length > 0 && lowExtraverts.length > 0) {
      conflicts.push({
        type: "Communication Style Conflict",
        description: "Team has mixed communication preferences - some prefer immediate discussion while others need processing time",
        members: [...highExtraverts, ...lowExtraverts],
        explanation: "High extraverts prefer spontaneous, interactive communication while low extraverts prefer structured, thoughtful discussions. This can lead to meetings where some members dominate while others feel unheard.",
        implications: [
          "High extraverts may dominate discussions and make quick decisions",
          "Low extraverts may feel overwhelmed and need time to process information",
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
      });
    }
  }
  
  // Check for work style conflicts (Conscientiousness vs Openness)
  const conscientiousnessScores = members.map(m => m.oceanScores?.conscientiousness || 0);
  const opennessScores = members.map(m => m.oceanScores?.openness || 0);
  
  const highConscientious = members.filter(m => (m.oceanScores?.conscientiousness || 0) > 70);
  const highOpenness = members.filter(m => (m.oceanScores?.openness || 0) > 70);
  
  if (highConscientious.length > 0 && highOpenness.length > 0) {
    conflicts.push({
      type: "Work Style Conflict",
      description: "Team has conflicting preferences for structure vs flexibility in work processes",
      members: [...highConscientious, ...highOpenness],
      explanation: "High conscientiousness members prefer structured, planned approaches while high openness members prefer flexible, innovative methods. This can create tension around processes and decision-making.",
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
      });
    }
  
  // Check for stress management conflicts (Neuroticism)
  const neuroticismScores = members.map(m => m.oceanScores?.neuroticism || 0);
  const neuroticismRange = Math.max(...neuroticismScores) - Math.min(...neuroticismScores);
  
  if (neuroticismRange > 35) {
    const highNeuroticism = members.filter(m => (m.oceanScores?.neuroticism || 0) > 65);
    const lowNeuroticism = members.filter(m => (m.oceanScores?.neuroticism || 0) < 35);
    
    if (highNeuroticism.length > 0 && lowNeuroticism.length > 0) {
      conflicts.push({
        type: "Stress Management Conflict",
        description: "Team members have different stress tolerance levels and coping mechanisms",
        members: [...highNeuroticism, ...lowNeuroticism],
        explanation: "High neuroticism members may experience more stress and anxiety, while low neuroticism members may be more relaxed. This can affect how the team handles pressure and deadlines.",
        implications: [
          "High stress members may need more support and reassurance",
          "Low stress members may not understand others' concerns",
          "Deadline pressure may affect team members differently",
          "Conflict resolution may be more challenging under stress"
        ],
        recommendations: [
          "Establish clear stress management protocols and support systems",
          "Regular check-ins to monitor team stress levels",
          "Flexible deadlines and workload distribution",
          "Stress management training and resources",
          "Create a supportive environment for open communication about stress"
        ]
      });
    }
  }
  
  return conflicts;
}

export default function TeamDashboardPage() {
  const params = useParams();
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedRecommendations, setExpandedRecommendations] = useState({
    communication: false,
    innovation: false,
    quality: false,
  });
  const [expandedConflicts, setExpandedConflicts] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    // Simulate fetching team data
    setTimeout(() => {
      setTeamData({
        code: params.code as string,
        name: "Product Development Team",
        description: "Cross-functional team responsible for product development and innovation",
        createdAt: "2024-01-15",
        members: [
          {
            id: "1",
            name: "Sarah Johnson",
            email: "sarah.johnson@company.com",
            status: "completed",
            completedAt: "2024-01-16",
            oceanScores: { openness: 85, conscientiousness: 92, extraversion: 78, agreeableness: 88, neuroticism: 45 },
            cultureScores: { power_distance: 35, individualism: 72, masculinity: 45, uncertainty_avoidance: 28, long_term_orientation: 68, indulgence: 55 },
            valuesScores: { innovation: 78, collaboration: 85, autonomy: 65, quality: 88, customer_focus: 82 }
          },
          {
            id: "2",
            name: "Mike Chen",
            email: "mike.chen@company.com",
            status: "completed",
            completedAt: "2024-01-17",
            oceanScores: { openness: 72, conscientiousness: 88, extraversion: 65, agreeableness: 75, neuroticism: 52 },
            cultureScores: { power_distance: 42, individualism: 68, masculinity: 38, uncertainty_avoidance: 35, long_term_orientation: 75, indulgence: 48 },
            valuesScores: { innovation: 72, collaboration: 78, autonomy: 58, quality: 85, customer_focus: 75 }
          },
          {
            id: "3",
            name: "Emma Rodriguez",
            email: "emma.rodriguez@company.com",
            status: "in_progress",
            completedAt: undefined,
            oceanScores: undefined,
            cultureScores: undefined,
            valuesScores: undefined
          },
          {
            id: "4",
            name: "David Kim",
            email: "david.kim@company.com",
            status: "invited",
            completedAt: undefined,
            oceanScores: undefined,
            cultureScores: undefined,
            valuesScores: undefined
          }
        ],
        aggregateScores: {
          ocean: { openness: 78, conscientiousness: 90, extraversion: 71, agreeableness: 81, neuroticism: 48 },
          culture: { power_distance: 38, individualism: 70, masculinity: 41, uncertainty_avoidance: 31, long_term_orientation: 71, indulgence: 51 },
          values: { innovation: 75, collaboration: 81, autonomy: 61, quality: 86, customer_focus: 78 }
        },
        insights: {
          strengths: [
            "High conscientiousness indicates strong organization and reliability across the team",
            "Strong collaboration values suggest excellent teamwork potential",
            "Low uncertainty avoidance shows comfort with change and innovation"
          ],
          challenges: [
            "Moderate extraversion may require structured communication channels",
            "Varied autonomy preferences need balanced management approaches"
          ],
          opportunities: [
            "High innovation values can be leveraged for creative problem-solving",
            "Strong quality focus suggests excellence in deliverables"
          ]
        }
      });
      setLoading(false);
    }, 1500);
  }, [params.code]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team dashboard...</p>
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Team Not Found</h2>
            <p className="text-gray-500 mb-4">We couldn't find the team you're looking for.</p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedMembers = teamData.members.filter(m => m.status === 'completed');
  const completionRate = (completedMembers.length / teamData.members.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{teamData.name}</h1>
            <p className="text-gray-600">{teamData.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline" className="font-mono">{teamData.code}</Badge>
              <span className="text-sm text-gray-500">
                Created {new Date(teamData.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button>
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
                    <div className="text-3xl font-bold text-blue-600 mb-2">{teamData.members.length}</div>
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
                    <span className="text-sm text-gray-500">{completedMembers.length}/{teamData.members.length} completed</span>
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
                <div className="space-y-6">
                  {/* OCEAN Aggregate */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Team Personality Profile
                    </h4>
                    <RadarChart 
                      data={teamData.aggregateScores.ocean} 
                      title="Team OCEAN Profile"
                      color="#3B82F6"
                    />
                  </div>

                  {/* Culture Aggregate */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Team Cultural Preferences
                    </h4>
                    <RadarChart 
                      data={teamData.aggregateScores.culture} 
                      title="Team Cultural Profile"
                      color="#10B981"
                    />
                  </div>

                  {/* Values Aggregate */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Team Values Profile
                    </h4>
                    <RadarChart 
                      data={teamData.aggregateScores.values} 
                      title="Team Values Profile"
                      color="#F59E0B"
                    />
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
                      {teamData.insights.strengths.map((strength, index) => (
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
                      {teamData.insights.challenges.map((challenge, index) => (
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
                      {teamData.insights.opportunities.map((opportunity, index) => (
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
                <div className="space-y-3">
                  {teamData.members.map((member) => (
                    <div 
                      key={member.id} 
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm"
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
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 text-base truncate">{member.name}</div>
                              <div className="text-sm text-gray-500 truncate">{member.email}</div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                              <Badge className={`${getStatusColor(member.status)} px-2 py-1 text-xs`}>
                                {getStatusIcon(member.status)}
                                <span className="ml-1 font-medium">{getStatusText(member.status)}</span>
                              </Badge>
                              {member.status === 'completed' && (
                                <div className="flex items-center gap-1 text-blue-600 text-sm">
                                  <span className="font-medium">View</span>
                                  <ArrowRight className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {member.status === 'completed' && member.completedAt && (
                            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                              <span>✓</span>
                              <span>Completed {new Date(member.completedAt).toLocaleDateString()}</span>
                            </div>
                          )}
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

            {/* Term Glossary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Understanding Your Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <TermGlossary category="ocean" />
                  <TermGlossary category="culture" />
                  <TermGlossary category="values" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reminders
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Invite Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Team Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Communication Strategy */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => setExpandedRecommendations(prev => ({ ...prev, communication: !prev.communication }))}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-900">Communication Strategy</h4>
                            <p className="text-sm text-blue-700">Optimize team communication based on personality preferences</p>
                          </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-blue-600 transition-transform ${expandedRecommendations.communication ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    
                    {expandedRecommendations.communication && (
                      <div className="p-4 bg-white border-t border-gray-200">
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-gray-900">What This Means</span>
                            </div>
                            <p className="text-gray-700 text-sm mb-3">
                              Your team shows moderate extraversion levels, which means some members prefer structured communication while others are comfortable with spontaneous discussions.
                            </p>
                            <ul className="text-sm text-gray-600 space-y-1 ml-6">
                              <li>• Mixed communication preferences across the team</li>
                              <li>• Some members may need time to process before responding</li>
                              <li>• Others prefer immediate, interactive discussions</li>
                            </ul>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-gray-900">How to Use This Information</span>
                            </div>
                            <ul className="text-sm text-gray-600 space-y-1 ml-6">
                              <li>• Send meeting agendas 24 hours in advance</li>
                              <li>• Use both synchronous and asynchronous communication channels</li>
                              <li>• Allow quiet time during brainstorming sessions</li>
                              <li>• Follow up written decisions with quick video calls</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Innovation & Problem-Solving */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="p-4 bg-green-50 cursor-pointer hover:bg-green-100 transition-colors"
                      onClick={() => setExpandedRecommendations(prev => ({ ...prev, innovation: !prev.innovation }))}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Zap className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-green-900">Innovation & Problem-Solving</h4>
                            <p className="text-sm text-green-700">Leverage creative thinking and adaptability</p>
                          </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-green-600 transition-transform ${expandedRecommendations.innovation ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    
                    {expandedRecommendations.innovation && (
                      <div className="p-4 bg-white border-t border-gray-200">
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-gray-900">What This Means</span>
                            </div>
                            <p className="text-gray-700 text-sm mb-3">
                              Your team has high innovation values and low uncertainty avoidance, making you excellent at creative problem-solving and adapting to change.
                            </p>
                            <ul className="text-sm text-gray-600 space-y-1 ml-6">
                              <li>• Team naturally embraces new ideas and approaches</li>
                              <li>• Comfortable with ambiguity and changing requirements</li>
                              <li>• Strong creative thinking and experimentation mindset</li>
                            </ul>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-gray-900">How to Use This Information</span>
                            </div>
                            <ul className="text-sm text-gray-600 space-y-1 ml-6">
                              <li>• Schedule regular innovation workshops and hackathons</li>
                              <li>• Encourage experimentation with new tools and processes</li>
                              <li>• Use design thinking methodologies for complex problems</li>
                              <li>• Create "innovation time" for exploring new ideas</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quality & Process Balance */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="p-4 bg-yellow-50 cursor-pointer hover:bg-yellow-100 transition-colors"
                      onClick={() => setExpandedRecommendations(prev => ({ ...prev, quality: !prev.quality }))}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Award className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-yellow-900">Quality & Process Balance</h4>
                            <p className="text-sm text-yellow-700">Optimize workflows for excellence and efficiency</p>
                          </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-yellow-600 transition-transform ${expandedRecommendations.quality ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    
                    {expandedRecommendations.quality && (
                      <div className="p-4 bg-white border-t border-gray-200">
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-yellow-600" />
                              <span className="font-medium text-gray-900">What This Means</span>
                            </div>
                            <p className="text-gray-700 text-sm mb-3">
                              Your team shows high conscientiousness and quality focus, but varied autonomy preferences suggest different approaches to achieving excellence.
                            </p>
                            <ul className="text-sm text-gray-600 space-y-1 ml-6">
                              <li>• Strong attention to detail and reliability</li>
                              <li>• Some prefer structured processes, others want flexibility</li>
                              <li>• High standards for deliverables and outcomes</li>
                            </ul>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="h-4 w-4 text-yellow-600" />
                              <span className="font-medium text-gray-900">How to Use This Information</span>
                            </div>
                            <ul className="text-sm text-gray-600 space-y-1 ml-6">
                              <li>• Establish clear quality standards and review processes</li>
                              <li>• Provide both structured templates and creative freedom</li>
                              <li>• Create peer review systems that leverage attention to detail</li>
                              <li>• Balance deadlines with quality expectations</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button variant="outline" className="w-full">
                    View Detailed Team Analysis
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Personality-Based Conflict Prediction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Potential Team Conflicts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const completedMembers = teamData.members.filter(m => m.status === 'completed');
                    const conflicts = detectPersonalityConflicts(completedMembers);
                    
                    if (conflicts.length === 0) {
                      return (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-green-900">Great Team Dynamics!</h4>
                              <p className="text-sm text-green-700">
                                No significant personality conflicts detected. Your team shows good compatibility across personality dimensions.
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    return conflicts.map((conflict, index) => (
                      <div key={index} className="border border-orange-200 rounded-lg overflow-hidden">
                        <div 
                          className="p-4 bg-orange-50 cursor-pointer hover:bg-orange-100 transition-colors"
                          onClick={() => setExpandedConflicts(prev => ({ ...prev, [index]: !prev[index] }))}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-orange-900">{conflict.type}</h4>
                                <p className="text-sm text-orange-700">{conflict.description}</p>
                              </div>
                            </div>
                            <ChevronDown className={`h-5 w-5 text-orange-600 transition-transform ${expandedConflicts[index] ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                        
                        {expandedConflicts[index] && (
                          <div className="p-4 bg-white border-t border-orange-200">
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Users className="h-4 w-4 text-orange-600" />
                                  <span className="font-medium text-gray-900">Team Members Involved</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {conflict.members.map(member => (
                                    <Badge key={member.id} className="bg-orange-100 text-orange-700">
                                      {member.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Target className="h-4 w-4 text-orange-600" />
                                  <span className="font-medium text-gray-900">What This Means</span>
                                </div>
                                <p className="text-sm text-gray-700 mb-3">{conflict.explanation}</p>
                                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                                  {conflict.implications.map((implication, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="text-gray-400 mt-1">•</span>
                                      <span>{implication}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Lightbulb className="h-4 w-4 text-green-600" />
                                  <span className="font-medium text-gray-900">Management Strategies</span>
                                </div>
                                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                                  {conflict.recommendations.map((rec, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="text-gray-400 mt-1">•</span>
                                      <span>{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
