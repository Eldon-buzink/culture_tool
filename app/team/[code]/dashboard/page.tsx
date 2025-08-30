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
  AlertTriangle,
  Plus
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [expandedRecommendations, setExpandedRecommendations] = useState({
    communication: false,
    innovation: false,
    quality: false,
  });
  const [expandedConflicts, setExpandedConflicts] = useState<{ [key: number]: boolean }>({});
  const [teamRecommendations, setTeamRecommendations] = useState<any>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        console.log('Fetching team data for code:', params.code);
        const response = await fetch(`/api/teams/${params.code}`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch team data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Team data response:', data);
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load team data');
        }
        
        // Transform the API data to match our expected format
        const transformedData: TeamData = {
          code: data.team.code,
          name: data.team.name,
          description: data.team.description || 'Team description not available',
          createdAt: data.team.createdAt,
          members: data.team.members.map((member: any) => ({
            id: member.id,
            name: member.name,
            email: member.email,
            status: member.status,
            completedAt: member.completedAt,
            oceanScores: undefined, // Will be populated when we have assessment results
            cultureScores: undefined,
            valuesScores: undefined
          })),
          aggregateScores: {
            ocean: { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 },
            culture: { power_distance: 0, individualism: 0, masculinity: 0, uncertainty_avoidance: 0, long_term_orientation: 0, indulgence: 0 },
            values: { innovation: 0, collaboration: 0, autonomy: 0, quality: 0, customer_focus: 0 }
          },
          insights: {
            strengths: [],
            challenges: [],
            opportunities: []
          }
        };
        
        console.log('Transformed team data:', transformedData);
        console.log('Member statuses:', transformedData.members.map(m => ({ email: m.email, status: m.status })));
        setTeamData(transformedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team data:', error);
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [params.code]);

  // Generate team recommendations when team data is available
  useEffect(() => {
    const generateTeamRecommendations = async () => {
      if (!teamData || teamData.members.filter(m => m.status === 'completed').length < 2) {
        return; // Need at least 2 completed assessments
      }

      try {
        // Check if we already have recommendations
        const recommendationsResponse = await fetch(`/api/teams/${params.code}/recommendations`);
        if (recommendationsResponse.ok) {
          const recommendationsData = await recommendationsResponse.json();
          if (recommendationsData.recommendations) {
            console.log('Using existing team recommendations');
            setTeamRecommendations(recommendationsData.recommendations);
            return; // Already have recommendations
          }
        }

        // Generate new recommendations
        console.log('Generating new team recommendations...');
        setRecommendationsLoading(true);
        
        // Calculate aggregate scores from completed members
        const completedMembers = teamData.members.filter(m => m.status === 'completed');
        const aggregateScores = {
          ocean: { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 },
          culture: { powerDistance: 0, individualism: 0, masculinity: 0, uncertaintyAvoidance: 0, longTermOrientation: 0, indulgence: 0 },
          values: { innovation: 0, collaboration: 0, autonomy: 0, quality: 0, customerFocus: 0 }
        };

        // For now, use placeholder scores - in a real implementation, you'd fetch actual assessment results
        // and calculate the averages
        const memberCount = completedMembers.length;

        const response = await fetch(`/api/teams/${params.code}/recommendations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamScores: aggregateScores,
            memberCount
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.recommendations) {
            console.log('Team recommendations generated successfully');
            setTeamRecommendations(result.recommendations);
          } else {
            console.error('Failed to generate team recommendations');
          }
        } else {
          console.error('Failed to generate team recommendations');
        }
        setRecommendationsLoading(false);
      } catch (error) {
        console.error('Error generating team recommendations:', error);
        setRecommendationsLoading(false);
      }
    };

    generateTeamRecommendations();
  }, [teamData, params.code]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ModernSpinner text="Loading team dashboard..." />
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
  
  console.log('Completion calculation:', {
    totalMembers: teamData.members.length,
    completedMembers: completedMembers.length,
    completionRate: completionRate,
    memberStatuses: teamData.members.map(m => ({ email: m.email, status: m.status }))
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
                <div className="space-y-8">
                  {/* OCEAN Aggregate */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Team Personality Profile
                    </h4>
                    <RadarChart 
                      data={teamData.aggregateScores.ocean} 
                      title="Team Personality Profile"
                      color="#3B82F6"
                    />
                    {completedMembers.length > 0 ? (
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
                    ) : (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Clock className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">No Data Yet</p>
                            <p className="text-sm text-gray-700">
                              Team insights will be generated once members complete their assessments. 
                              Invite your team members to get started!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Culture Aggregate */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Team Cultural Preferences
                    </h4>
                    <RadarChart 
                      data={teamData.aggregateScores.culture} 
                      title="Team Cultural Profile"
                      color="#10B981"
                    />
                    {completedMembers.length > 0 ? (
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
                    ) : (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Clock className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">No Data Yet</p>
                            <p className="text-sm text-gray-700">
                              Cultural insights will be generated once members complete their assessments. 
                              Invite your team members to get started!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Values Aggregate */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Team Values Profile
                    </h4>
                    <RadarChart 
                      data={teamData.aggregateScores.values} 
                      title="Team Values Profile"
                      color="#F59E0B"
                    />
                    {completedMembers.length > 0 ? (
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
                    ) : (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Clock className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">No Data Yet</p>
                            <p className="text-sm text-gray-700">
                              Values insights will be generated once members complete their assessments. 
                              Invite your team members to get started!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Combined Team Insights & Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Team Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recommendationsLoading ? (
                  <div className="text-center py-8">
                    <ModernSpinner />
                    <p className="text-gray-600 mt-2">Generating AI-powered team insights...</p>
                  </div>
                ) : teamRecommendations ? (
                  <div className="space-y-6">
                    {/* AI Summary */}
                    {teamRecommendations.summary && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Lightbulb className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-900 mb-1">AI Team Analysis</p>
                            <p className="text-sm text-blue-700">{teamRecommendations.summary}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Team Strengths */}
                    {teamRecommendations.strengths && teamRecommendations.strengths.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-900 mb-3">Team Strengths</h4>
                        <div className="space-y-2">
                          {teamRecommendations.strengths.map((strength: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-gray-700 text-sm">{strength}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Development Areas (Combined from Areas for Attention and Development Areas) */}
                    {((teamRecommendations.challenges && teamRecommendations.challenges.length > 0) || 
                      (teamData.insights.challenges && teamData.insights.challenges.length > 0)) && (
                      <div>
                        <h4 className="font-semibold text-yellow-900 mb-3">Areas for Development</h4>
                        <div className="space-y-2">
                          {teamRecommendations.challenges?.map((challenge: string, index: number) => (
                            <div key={`rec-${index}`} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-gray-700 text-sm">{challenge}</p>
                            </div>
                          ))}
                          {teamData.insights.challenges?.map((challenge: string, index: number) => (
                            <div key={`insight-${index}`} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-gray-700 text-sm">{challenge}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Opportunities */}
                    {((teamRecommendations.opportunities && teamRecommendations.opportunities.length > 0) || 
                      (teamData.insights.opportunities && teamData.insights.opportunities.length > 0)) && (
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-3">Opportunities</h4>
                        <div className="space-y-2">
                          {teamRecommendations.opportunities?.map((opportunity: string, index: number) => (
                            <div key={`rec-${index}`} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-gray-700 text-sm">{opportunity}</p>
                            </div>
                          ))}
                          {teamData.insights.opportunities?.map((opportunity: string, index: number) => (
                            <div key={`insight-${index}`} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-gray-700 text-sm">{opportunity}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Recommendations */}
                    {teamRecommendations.recommendations && teamRecommendations.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Top Recommendations</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {teamRecommendations.recommendations.slice(0, 4).map((rec: any, index: number) => (
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
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Yet</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Team insights and recommendations will be generated once at least 2 team members complete their assessments.
                    </p>
                    <div className="text-xs text-gray-500">
                      <p>• AI-powered insights based on team personality dynamics</p>
                      <p>• Personalized recommendations for team collaboration</p>
                      <p>• Conflict prevention and communication optimization</p>
                    </div>
                  </div>
                )}
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
                  {teamData.members.map((member) => (
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

            {/* Individual vs Team Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Individual vs Team Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedMembers.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Compare individual scores with team averages to understand how each member contributes to the team dynamic.
                      </p>
                      {completedMembers.slice(0, 3).map((member) => (
                        <div key={member.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{member.name}</span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(`/assessment/${member.id}/results`, '_blank')}
                            >
                              View Comparison
                            </Button>
                          </div>
                          <div className="text-xs text-gray-500">
                            Click to see detailed comparison with team averages
                          </div>
                        </div>
                      ))}
                      {completedMembers.length > 3 && (
                        <div className="text-center">
                          <Button variant="outline" size="sm">
                            View All Comparisons ({completedMembers.length - 3} more)
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">
                        Individual vs team comparisons will be available once members complete their assessments.
                      </p>
                    </div>
                  )}
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
                      Invite potential new hires to take the assessment and see how they match with your team.
                    </p>
                    <Button size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Invite Candidate
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-xs">🎯</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-900 mb-1">Candidate Matching</p>
                        <p className="text-sm text-green-700">
                          Compare candidate profiles with your team to make informed hiring decisions and ensure cultural fit.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        teamCode={teamData.code}
        teamName={teamData.name}
      />
      
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        teamCode={teamData.code}
        teamName={teamData.name}
      />
    </div>
  );
}
