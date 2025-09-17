'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import jsPDF from 'jspdf';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
  ChevronUp,
  Lightbulb,
  AlertTriangle,
  Plus,
  User,
  Eye,
  HelpCircle,
  X
} from 'lucide-react';


import LoadingSpinner from '@/components/LoadingSpinner';
import ShareModal from '@/components/ShareModal';
import InviteModal from '@/components/InviteModal';
import CandidateInviteModal from '@/components/CandidateInviteModal';

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

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  status: 'invited' | 'in_progress' | 'completed' | 'withdrawn';
  invitedAt: string;
  startedAt?: string;
  completedAt?: string;
  overallFit?: number;
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

// Calculate team fit score for individual member
function calculateTeamFitScore(member: TeamMember, teamAverages: any): number {
  let totalDifference = 0;
  let totalMetrics = 0;

  // Compare OCEAN scores
  if (member.oceanScores && teamAverages.ocean) {
    Object.keys(teamAverages.ocean).forEach(metric => {
      const memberScore = member.oceanScores![metric] || 0;
      const teamScore = teamAverages.ocean[metric] || 0;
      const difference = Math.abs(memberScore - teamScore);
      totalDifference += difference;
      totalMetrics++;
    });
  }

  // Compare Culture scores
  if (member.cultureScores && teamAverages.culture) {
    Object.keys(teamAverages.culture).forEach(metric => {
      const memberScore = member.cultureScores![metric] || 0;
      const teamScore = teamAverages.culture[metric] || 0;
      const difference = Math.abs(memberScore - teamScore);
      totalDifference += difference;
      totalMetrics++;
    });
  }

  // Compare Values scores
  if (member.valuesScores && teamAverages.values) {
    Object.keys(teamAverages.values).forEach(metric => {
      const memberScore = member.valuesScores![metric] || 0;
      const teamScore = teamAverages.values[metric] || 0;
      const difference = Math.abs(memberScore - teamScore);
      totalDifference += difference;
      totalMetrics++;
    });
  }

  if (totalMetrics === 0) return 50; // Default if no data
  const averageDifference = totalDifference / totalMetrics;
  const fitScore = Math.max(0, Math.min(100, 100 - (averageDifference * 1.5)));
  return Math.round(fitScore);
}

// Generate role suggestions based on personality profile
function generateRoleSuggestions(member: TeamMember): { primary: string; secondary: string; uniqueContribution: string } {
  const ocean = member.oceanScores || {};
  const culture = member.cultureScores || {};
  const values = member.valuesScores || {};

  // Primary role based on strongest traits
  let primary = "Team Contributor";
  let secondary = "Support Role";
  let uniqueContribution = "Brings balanced perspective";

  if (ocean.openness > 70 && values.innovation > 70) {
    primary = "Innovation Leader";
    secondary = "Creative Problem Solver";
    uniqueContribution = "Drives creative thinking and new approaches";
  } else if (ocean.conscientiousness > 70 && values.quality > 70) {
    primary = "Quality Assurance Lead";
    secondary = "Process Optimizer";
    uniqueContribution = "Ensures excellence and attention to detail";
  } else if (ocean.extraversion > 70 && values.collaboration > 70) {
    primary = "Team Facilitator";
    secondary = "Communication Bridge";
    uniqueContribution = "Energizes team and facilitates collaboration";
  } else if (ocean.agreeableness > 70 && culture.individualism < 40) {
    primary = "Team Harmonizer";
    secondary = "Conflict Mediator";
    uniqueContribution = "Maintains team cohesion and resolves conflicts";
  } else if (ocean.neuroticism < 30 && culture.uncertaintyAvoidance < 40) {
    primary = "Change Champion";
    secondary = "Risk Navigator";
    uniqueContribution = "Stays calm under pressure and embraces uncertainty";
  } else if (ocean.conscientiousness > 60 && culture.longTermOrientation > 60) {
    primary = "Strategic Planner";
    secondary = "Goal Tracker";
    uniqueContribution = "Provides long-term vision and systematic planning";
  }

  return { primary, secondary, uniqueContribution };
}


export default function TeamDashboardPage() {
  const params = useParams();
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [expandedRecommendations, setExpandedRecommendations] = useState<Record<string, boolean>>({});
  const [expandedConflicts, setExpandedConflicts] = useState<{ [key: number]: boolean }>({});
  const [teamRecommendations, setTeamRecommendations] = useState<any>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<{[key: string]: string[]}>({});
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [comparisonView, setComparisonView] = useState<'fit' | 'roles'>('fit');

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
            oceanScores: member.oceanScores || undefined,
            cultureScores: member.cultureScores || undefined,
            valuesScores: member.valuesScores || undefined
          })),
          aggregateScores: data.team.aggregateScores || {
            ocean: { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 },
            culture: { powerDistance: 0, individualism: 0, masculinity: 0, uncertaintyAvoidance: 0, longTermOrientation: 0, indulgence: 0 },
            values: { innovation: 0, collaboration: 0, autonomy: 0, quality: 0, customerFocus: 0 }
          },
          insights: data.team.insights || {
            strengths: [],
            challenges: [],
            opportunities: []
          }
        };
        
        console.log('Transformed team data:', transformedData);
        console.log('Member statuses:', transformedData.members.map(m => ({ email: m.email, status: m.status })));
        setTeamData(transformedData);
        
        // Note: Candidates functionality will be added later when the candidates table is set up
        // For now, we focus on team members only
        setCandidates([]);
        
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

  // Generate AI insights when team data is available
  useEffect(() => {
    const generateAIInsights = async () => {
      if (!teamData || teamData.members.filter(m => m.status === 'completed').length < 1) {
        return;
      }

      try {
        setInsightsLoading(true);
        const completedMembers = teamData.members.filter(m => m.status === 'completed');
        
        // Generate insights for each section
        const sections = ['ocean', 'culture', 'values'];
        const newInsights: {[key: string]: string[]} = {};
        
        for (const section of sections) {
          const insights = await generateAIKeyInsights(teamData.aggregateScores, completedMembers.length, section);
          newInsights[section] = insights;
        }
        
        setAiInsights(newInsights);
      } catch (error) {
        console.error('Error generating AI insights:', error);
      } finally {
        setInsightsLoading(false);
      }
    };

    generateAIInsights();
  }, [teamData]);

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

  const toggleRecommendation = (section: string, index: number) => {
    const key = `${section}-${index}`;
    setExpandedRecommendations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getScoreLabel = (trait: string, score: number) => {
    const descriptiveLabels: Record<string, Record<string, string>> = {
      // OCEAN traits
      openness: { high: 'Creative Explorer', moderate: 'Balanced Innovator', low: 'Practical Realist' },
      conscientiousness: { high: 'Structured Achiever', moderate: 'Flexible Planner', low: 'Adaptive Performer' },
      extraversion: { high: 'People Energizer', moderate: 'Situational Connector', low: 'Thoughtful Observer' },
      agreeableness: { high: 'Team Harmonizer', moderate: 'Balanced Collaborator', low: 'Direct Challenger' },
      neuroticism: { high: 'Emotionally Aware', moderate: 'Resilient Realist', low: 'Steady Anchor' },
      // Cultural dimensions
      powerDistance: { high: 'Hierarchy Appreciator', moderate: 'Structure Balancer', low: 'Equality Advocate' },
      individualism: { high: 'Independent Achiever', moderate: 'Balanced Contributor', low: 'Team Collective' },
      masculinity: { high: 'Achievement Focused', moderate: 'Balanced Competitor', low: 'Relationship Focused' },
      uncertaintyAvoidance: { high: 'Structure Seeker', moderate: 'Adaptive Planner', low: 'Change Embracer' },
      longTermOrientation: { high: 'Future Strategist', moderate: 'Balanced Planner', low: 'Present Focused' },
      indulgence: { high: 'Life Enjoyer', moderate: 'Balanced Liver', low: 'Disciplined Restrainer' },
      // Work values
      innovation: { high: 'Creative Problem Solver', moderate: 'Practical Innovator', low: 'Proven Method Follower' },
      collaboration: { high: 'Team Player', moderate: 'Flexible Collaborator', low: 'Independent Worker' },
      autonomy: { high: 'Freedom Seeker', moderate: 'Guided Independent', low: 'Structure Preferrer' },
      quality: { high: 'Excellence Pursuer', moderate: 'Quality Balancer', low: 'Efficiency Focused' },
      customerFocus: { high: 'Customer Champion', moderate: 'Balanced Advocate', low: 'Process Focused' }
    };
    
    const level = score >= 70 ? 'high' : score >= 40 ? 'moderate' : 'low';
    return descriptiveLabels[trait]?.[level] || `${level.charAt(0).toUpperCase() + level.slice(1)}`;
  };

  const getStyleExplanation = (trait: string, score: number) => {
    const band = score <= 35 ? 'lower' : score >= 65 ? 'higher' : 'balanced';
    const explanations: Record<string, Record<string, string>> = {
      openness: {
        lower: 'Your team prefers proven approaches over constant novelty.',
        balanced: 'Your team mixes new ideas with practical guardrails.',
        higher: 'Your team is energized by new ideas and experiments.'
      },
      conscientiousness: {
        lower: 'Your team thrives in flexible, dynamic environments.',
        balanced: 'Your team mixes structure with flexibility as needed.',
        higher: 'Your team excels with clear structure and detailed planning.'
      },
      extraversion: {
        lower: 'Your team thrives in focused, thoughtful environments.',
        balanced: 'Your team adapts energy to the situation and people.',
        higher: 'Your team brings energy and enthusiasm to group dynamics.'
      },
      agreeableness: {
        lower: 'Your team is comfortable with healthy conflict and direct feedback.',
        balanced: 'Your team mixes cooperation with healthy assertiveness.',
        higher: 'Your team is naturally supportive and collaborative.'
      },
      neuroticism: {
        lower: 'Your team maintains calm and focus in challenging situations.',
        balanced: 'Your team balances optimism with realistic assessment of challenges.',
        higher: 'Your team is highly attuned to emotions and potential challenges.'
      }
    };
    
    return explanations[trait]?.[band] || "No explanation available.";
  };

  const getValueExplanation = (value: string, score: number) => {
    const valueExplanations: Record<string, Record<string, string>> = {
      innovation: {
        lower: "Your team prefers proven methods and established processes over experimental approaches.",
        balanced: "Your team balances innovative thinking with practical implementation considerations.",
        higher: "Your team naturally seeks creative solutions and embraces new approaches to challenges."
      },
      collaboration: {
        lower: "Your team works effectively independently and prefers clear individual responsibilities.",
        balanced: "Your team collaborates when needed while maintaining personal accountability.",
        higher: "Your team thrives in collaborative environments and values collective decision-making."
      },
      autonomy: {
        lower: "Your team prefers clear guidance and structured work environments.",
        balanced: "Your team values both independence and support as appropriate.",
        higher: "Your team excels when given freedom to determine approach and priorities."
      },
      quality: {
        lower: "Your team focuses on efficiency and meeting core requirements effectively.",
        balanced: "Your team balances quality standards with practical delivery timelines.",
        higher: "Your team prioritizes excellence and attention to detail in all work outputs."
      },
      customerFocus: {
        lower: "Your team focuses on internal processes and technical excellence.",
        balanced: "Your team considers both customer needs and internal capabilities.",
        higher: "Your team strongly prioritizes customer satisfaction and user experience."
      },
      powerDistance: {
        lower: "Your team prefers flat, egalitarian structures where all voices are valued equally.",
        balanced: "Your team adapts to different leadership styles while maintaining agency.",
        higher: "Your team is comfortable with hierarchical structures and clear authority lines."
      },
      individualism: {
        lower: "Your team values collective goals and team success over individual recognition.",
        balanced: "Your team balances personal achievement with team collaboration.",
        higher: "Your team strongly values personal achievement and individual recognition."
      },
      masculinity: {
        lower: "Your team values collaboration, support, and quality of life over competition.",
        balanced: "Your team balances competitive drive with collaborative approaches.",
        higher: "Your team values competition, achievement, and assertive approaches to work."
      },
      uncertaintyAvoidance: {
        lower: "Your team is comfortable with ambiguity and enjoys exploring new possibilities.",
        balanced: "Your team manages uncertainty by gathering information and planning adaptively.",
        higher: "Your team prefers clear rules, structured environments, and predictable outcomes."
      },
      longTermOrientation: {
        lower: "Your team focuses on immediate results and short-term practical outcomes.",
        balanced: "Your team balances immediate needs with long-term strategic considerations.",
        higher: "Your team prioritizes long-term planning and sustainable growth strategies."
      },
      indulgence: {
        lower: "Your team values discipline, restraint, and professional focus.",
        balanced: "Your team balances work dedication with quality of life considerations.",
        higher: "Your team values work-life balance and enjoying professional achievements."
      }
    };

    const band = score <= 35 ? 'lower' : score >= 65 ? 'higher' : 'balanced';
    return valueExplanations[value]?.[band] || "No explanation available.";
  };

  const generateDynamicKeyInsights = (scores: any, memberCount: number) => {
    const insights = [];
    
    // Analyze OCEAN scores
    const oceanScores = scores.ocean || {};
    const avgOpenness = oceanScores.openness || 0;
    const avgConscientiousness = oceanScores.conscientiousness || 0;
    const avgExtraversion = oceanScores.extraversion || 0;
    const avgAgreeableness = oceanScores.agreeableness || 0;
    const avgNeuroticism = oceanScores.neuroticism || 0;
    
    // Analyze Culture scores
    const cultureScores = scores.culture || {};
    const avgPowerDistance = cultureScores.powerDistance || 0;
    const avgIndividualism = cultureScores.individualism || 0;
    
    // Analyze Values scores
    const valuesScores = scores.values || {};
    const avgInnovation = valuesScores.innovation || 0;
    const avgCollaboration = valuesScores.collaboration || 0;
    const avgQuality = valuesScores.quality || 0;
    
    // Generate insights based on actual scores
    if (avgOpenness > 70) {
      insights.push("Your team shows high creativity and openness to new ideas, making them well-suited for innovative projects and problem-solving.");
    }
    
    if (avgConscientiousness > 70) {
      insights.push("Strong organizational skills and attention to detail across the team support reliable project delivery and quality outcomes.");
    }
    
    if (avgExtraversion > 60 && avgExtraversion < 80) {
      insights.push("Balanced communication styles allow for both collaborative discussions and focused individual work.");
    } else if (avgExtraversion > 80) {
      insights.push("High energy and social engagement create a dynamic, interactive team environment.");
    } else if (avgExtraversion < 40) {
      insights.push("Team members prefer thoughtful, structured communication and may benefit from advance planning for meetings.");
    }
    
    if (avgAgreeableness > 70) {
      insights.push("High cooperation and empathy create a supportive team culture with strong collaboration potential.");
    }
    
    if (avgNeuroticism < 40) {
      insights.push("Low stress sensitivity indicates the team can handle pressure and uncertainty effectively.");
    }
    
    if (avgPowerDistance < 40) {
      insights.push("Low power distance preference suggests the team thrives in flat, collaborative decision-making structures.");
    }
    
    if (avgInnovation > 70) {
      insights.push("Strong innovation focus positions the team well for creative challenges and continuous improvement.");
    }
    
    if (avgCollaboration > 70) {
      insights.push("High collaboration scores indicate excellent potential for teamwork and shared success.");
    }
    
    if (avgQuality > 70) {
      insights.push("Quality-focused approach ensures attention to detail and excellence in deliverables.");
    }
    
    // Add member count specific insights
    if (memberCount === 1) {
      insights.push("As a solo contributor, focus on leveraging your individual strengths and seeking external collaboration opportunities.");
    } else if (memberCount >= 2 && memberCount <= 5) {
      insights.push("Small team size enables close collaboration and rapid decision-making with clear communication channels.");
    } else if (memberCount > 5) {
      insights.push("Larger team size provides diverse perspectives but may benefit from structured communication protocols.");
    }
    
    // Return insights or fallback
    return insights.length > 0 ? insights : [
      "Your team's assessment results show a unique combination of strengths that can be leveraged for team success.",
      "Consider how individual strengths complement each other to create a well-rounded team dynamic.",
      "Regular team check-ins can help optimize collaboration based on these personality insights."
    ];
  };

  const generateAIKeyInsights = async (scores: any, memberCount: number, section: string) => {
    try {
      const response = await fetch('/api/teams/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores,
          memberCount,
          section
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.insights || [];
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
    }
    
    // Fallback to rule-based insights
    return generateDynamicKeyInsights(scores, memberCount);
  };

  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      
      // Create a cleaner PDF report
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add header
      pdf.setFontSize(24);
      pdf.setTextColor(59, 130, 246); // Blue color
      pdf.text('Team Culture Report', 20, 30);
      
      // Add team info
      pdf.setFontSize(14);
      pdf.setTextColor(55, 65, 81); // Gray color
      pdf.text(`Team: ${teamData?.name || 'Unknown Team'}`, 20, 50);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 60);
      pdf.text(`Members: ${teamData?.members.length || 0}`, 20, 70);
      pdf.text(`Completion Rate: ${Math.round(completionRate)}%`, 20, 80);
      
      let yPosition = 100;
      
      // Add OCEAN scores
      if (teamData?.aggregateScores?.ocean) {
        pdf.setFontSize(16);
        pdf.setTextColor(59, 130, 246);
        pdf.text('Personality Profile (OCEAN)', 20, yPosition);
        yPosition += 15;
        
        pdf.setFontSize(12);
        pdf.setTextColor(55, 65, 81);
        Object.entries(teamData.aggregateScores.ocean).forEach(([trait, score]) => {
          pdf.text(`${trait.charAt(0).toUpperCase() + trait.slice(1)}: ${score}`, 25, yPosition);
          yPosition += 8;
        });
        yPosition += 10;
      }
      
      // Add Culture scores
      if (teamData?.aggregateScores?.culture) {
        pdf.setFontSize(16);
        pdf.setTextColor(16, 185, 129);
        pdf.text('Cultural Dimensions', 20, yPosition);
        yPosition += 15;
        
        pdf.setFontSize(12);
        pdf.setTextColor(55, 65, 81);
        Object.entries(teamData.aggregateScores.culture).forEach(([trait, score]) => {
          const traitName = trait.replace(/_/g, ' ').charAt(0).toUpperCase() + trait.replace(/_/g, ' ').slice(1);
          pdf.text(`${traitName}: ${score}`, 25, yPosition);
          yPosition += 8;
        });
        yPosition += 10;
      }
      
      // Add Values scores
      if (teamData?.aggregateScores?.values) {
        pdf.setFontSize(16);
        pdf.setTextColor(245, 158, 11);
        pdf.text('Work Values', 20, yPosition);
        yPosition += 15;
        
        pdf.setFontSize(12);
        pdf.setTextColor(55, 65, 81);
        Object.entries(teamData.aggregateScores.values).forEach(([trait, score]) => {
          pdf.text(`${trait.charAt(0).toUpperCase() + trait.slice(1)}: ${score}`, 25, yPosition);
          yPosition += 8;
        });
        yPosition += 10;
      }
      
      // Add insights
      if (completedMembers.length > 0) {
        pdf.setFontSize(16);
        pdf.setTextColor(59, 130, 246);
        pdf.text('Key Insights', 20, yPosition);
        yPosition += 15;
        
        pdf.setFontSize(12);
        pdf.setTextColor(55, 65, 81);
        const insights = [
          'Your team shows a balanced personality profile with strengths in collaboration and innovation.',
          'The mix of personality types creates opportunities for diverse perspectives and comprehensive problem-solving.',
          'Cultural preferences support inclusive decision-making and shared responsibility.',
          'Work values prioritize quality and customer focus while maintaining innovation drive.'
        ];
        
        insights.forEach(insight => {
          // Split long text to fit page width
          const words = insight.split(' ');
          let line = '';
          for (const word of words) {
            if (pdf.getTextWidth(line + ' ' + word) < 170) {
              line += (line ? ' ' : '') + word;
            } else {
              pdf.text(line, 25, yPosition);
              yPosition += 8;
              line = word;
            }
          }
          if (line) {
            pdf.text(line, 25, yPosition);
            yPosition += 8;
          }
          yPosition += 5;
        });
      }
      
      // Download the PDF
      const fileName = `team-culture-report-${teamData?.name?.replace(/\s+/g, '-') || 'report'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="xl" text="Loading team dashboard..." />
        </div>
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
      <div id="dashboard-content" className="max-w-7xl mx-auto px-4">
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

            {/* OCEAN Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Brain className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Team Personality Profile</CardTitle>
                    <p className="text-gray-600">Your team's OCEAN personality traits reveal how you naturally think, feel, and behave in work environments.</p>
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
                        data={teamData.aggregateScores.ocean} 
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
                            {Object.entries(teamData.aggregateScores.ocean).map(([trait, score]) => (
                          <div key={trait} className="space-y-2">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium capitalize">{trait}</span>
                                  <div className="relative">
                                    <button
                                      onClick={() => setActiveTooltip(activeTooltip === trait ? null : trait)}
                                      className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                      <HelpCircle className="h-4 w-4" />
                                    </button>
                                    {activeTooltip === trait && (
                                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-80">
                                        <div className="text-sm text-gray-700 leading-relaxed">
                                          {getTermExplanation(trait)}
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
                                    {getScoreLabel(trait, score)}
                                  </span>
                                  <span className="text-sm text-gray-500">({score})</span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">{getStyleExplanation(trait, score)}</p>
                              <Progress value={score} className="h-2" />
                            </div>
                          </div>
                            ))}
                          </div>
                        </div>
                    </div>

                  {/* What This Means for Your Team - OCEAN */}
                  {completedMembers.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-2xl font-semibold mb-6 text-gray-900">What This Means for Your Team</h3>
                      
                      {/* Generate team insights based on actual scores */}
                      {(() => {
                        const oceanScores = teamData.aggregateScores.ocean;
                        const insights = [];
                        
                        if (oceanScores.openness >= 70) {
                          insights.push({
                            title: "High Openness - The Creative Team",
                            description: "Your team naturally embraces new ideas and creative solutions",
                            key: "openness-high",
                            icon: Brain,
                            color: "blue",
                            content: {
                              strengths: [
                                "Innovative projects that challenge your team to think creatively",
                                "Flexible work environments that allow for experimentation and new approaches",
                                "Cross-functional collaboration where diverse perspectives can flourish",
                                "Learning opportunities that keep your team engaged and growing"
                              ],
                              avoid: [
                                "Rigid processes that stifle creativity and innovation",
                                "Highly structured environments with little room for new ideas",
                                "Repetitive tasks that don't challenge your team's creative potential",
                                "Conservative leadership that resists change or new approaches"
                              ],
                              superpower: "Your team naturally sees possibilities others miss and can connect ideas in creative ways. You're the team that brings fresh perspectives to any situation and thrives on innovation."
                            }
                          });
                        }

                        if (oceanScores.agreeableness >= 70) {
                          insights.push({
                            title: "High Agreeableness - The Harmonious Team", 
                            description: "Your team excels at collaboration and maintaining positive relationships",
                            key: "agreeableness-high",
                            icon: Users,
                            color: "green",
                            content: {
                              strengths: [
                                "Collaborative environments where everyone's voice is heard",
                                "Team-based projects that leverage collective strengths",
                                "Supportive work culture that values empathy and understanding",
                                "Conflict resolution through open dialogue and compromise"
                              ],
                              avoid: [
                                "Highly competitive environments that pit team members against each other",
                                "Aggressive leadership styles that create tension",
                                "Isolated work arrangements that limit team interaction",
                                "High-pressure situations that compromise team harmony"
                              ],
                              superpower: "Your team creates an environment where everyone feels valued and supported, leading to higher engagement and better collective outcomes."
                            }
                          });
                        }

                        // Add empty state if no insights
                        if (insights.length === 0) {
                          return (
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Brain className="h-6 w-6 text-gray-400" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Building Your Team Profile</h4>
                                <p className="text-sm text-gray-600">
                                  Your team shows balanced personality traits. As more members complete assessments, we'll provide more specific insights.
                                </p>
                              </div>
                            </div>
                          );
                        }

                        return insights.slice(0, 2).map((insight, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg mb-4">
                            <div 
                              className="p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                              onClick={() => toggleRecommendation(insight.key, 0)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 bg-${insight.color}-100 rounded-full flex items-center justify-center`}>
                                    <insight.icon className={`h-4 w-4 text-${insight.color}-600`} />
                          </div>
                          <div>
                                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                                    <p className="text-sm text-gray-600">{insight.description}</p>
                              </div>
                                </div>
                                {expandedRecommendations[`${insight.key}-0`] ? (
                                  <ChevronUp className="h-5 w-5 text-gray-500" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-500" />
                                )}
                              </div>
                            </div>
                            
                            {expandedRecommendations[`${insight.key}-0`] && (
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
                                        {insight.content.strengths.map((strength, i) => (
                                          <li key={i}>• <strong>{strength.split(' ')[0]} {strength.split(' ')[1]}</strong> {strength.split(' ').slice(2).join(' ')}</li>
                                        ))}
                                      </ul>
                              </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                      <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                        <X className="w-5 h-5 text-gray-600" />
                                        What to avoid:
                                      </h5>
                                      <ul className="text-sm text-gray-700 space-y-2">
                                        {insight.content.avoid.map((avoid, i) => (
                                          <li key={i}>• <strong>{avoid.split(' ')[0]} {avoid.split(' ')[1]}</strong> {avoid.split(' ').slice(2).join(' ')}</li>
                                        ))}
                                      </ul>
                          </div>
                        </div>
                                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                      <Zap className={`w-5 h-5 text-${insight.color}-600`} />
                                      Your team superpower:
                                    </h5>
                                    <p className="text-sm text-gray-700">{insight.content.superpower}</p>
                      </div>
                          </div>
                          </div>
                            )}
                        </div>
                        ));
                      })()}
                      </div>
                    )}
                  </div>
              </CardContent>
            </Card>

            {/* Culture Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Globe className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Team Cultural Preferences</CardTitle>
                    <p className="text-gray-600">Your team's cultural preferences indicate how you prefer to work within organizational structures.</p>
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
                        data={teamData.aggregateScores.culture} 
                        color="#10B981"
                          title=""
                          size={350}
                        />
                                  </div>
                          </div>

                    {/* Right: Style Preferences */}
                          <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Team Style Preferences</h3>
                      <div className="space-y-4">
                        {Object.entries(teamData.aggregateScores.culture).map(([trait, score]) => (
                          <div key={trait} className="space-y-2">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                  <span className="font-medium capitalize">{trait.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <div className="relative">
                                    <button
                                      onClick={() => setActiveTooltip(activeTooltip === trait ? null : trait)}
                                      className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                      <HelpCircle className="h-4 w-4" />
                                    </button>
                                    {activeTooltip === trait && (
                                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-80">
                                        <div className="text-sm text-gray-700 leading-relaxed">
                                          {getTermExplanation(trait)}
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
                                    {getScoreLabel(trait, score)}
                                  </span>
                                  <span className="text-sm text-gray-500">({score})</span>
                      </div>
                          </div>
                              <p className="text-sm text-gray-600">{getValueExplanation(trait, score)}</p>
                              <Progress value={score} className="h-2" />
                          </div>
                        </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* What This Means for Your Team - Culture */}
                  {completedMembers.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-2xl font-semibold mb-6 text-gray-900">What This Means for Your Team</h3>
                      
                      {/* Generate cultural insights based on actual scores */}
                      {(() => {
                        const cultureScores = teamData.aggregateScores.culture;
                        const insights = [];
                        
                        if (cultureScores.powerDistance <= 40) {
                          insights.push({
                            title: "Low Power Distance - The Collaborative Team",
                            description: "Your team creates flat, collaborative decision-making structures",
                            key: "powerDistance-low",
                            icon: Globe,
                            color: "green",
                            content: {
                              strengths: [
                                "Flat organizational structures where everyone's input is valued equally",
                                "Collaborative decision-making processes that include all team members",
                                "Open communication channels that encourage direct feedback and discussion",
                                "Merit-based recognition that rewards individual contributions and achievements"
                              ],
                              avoid: [
                                "Hierarchical structures that create barriers between team members",
                                "Top-down decision making that excludes team input and collaboration",
                                "Formal communication channels that discourage open dialogue",
                                "Seniority-based systems that don't recognize individual merit and contributions"
                              ],
                              superpower: "Your team creates an environment where everyone's voice matters while maintaining high individual standards. You naturally balance autonomy with collaboration and create inclusive decision-making processes."
                            }
                          });
                        }

                        // Add empty state if no insights
                        if (insights.length === 0) {
                          return (
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Globe className="h-6 w-6 text-gray-400" />
                                  </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Building Your Cultural Profile</h4>
                                <p className="text-sm text-gray-600">
                                  Your team shows balanced cultural preferences. As more members complete assessments, we'll provide more specific insights.
                                </p>
                          </div>
                        </div>
                          );
                        }

                        return insights.slice(0, 1).map((insight, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg mb-4">
                            <div 
                              className="p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                              onClick={() => toggleRecommendation(insight.key, 0)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 bg-${insight.color}-100 rounded-full flex items-center justify-center`}>
                                    <insight.icon className={`h-4 w-4 text-${insight.color}-600`} />
                          </div>
                          <div>
                                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                                    <p className="text-sm text-gray-600">{insight.description}</p>
                              </div>
                              </div>
                                {expandedRecommendations[`${insight.key}-0`] ? (
                                  <ChevronUp className="h-5 w-5 text-gray-500" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                            
                            {expandedRecommendations[`${insight.key}-0`] && (
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
                                        {insight.content.strengths.map((strength, i) => (
                                          <li key={i}>• <strong>{strength.split(' ')[0]} {strength.split(' ')[1]}</strong> {strength.split(' ').slice(2).join(' ')}</li>
                                        ))}
                                      </ul>
                          </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                      <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                        <X className="w-5 h-5 text-gray-600" />
                                        What to avoid:
                                      </h5>
                                      <ul className="text-sm text-gray-700 space-y-2">
                                        {insight.content.avoid.map((avoid, i) => (
                                          <li key={i}>• <strong>{avoid.split(' ')[0]} {avoid.split(' ')[1]}</strong> {avoid.split(' ').slice(2).join(' ')}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                      <Zap className={`w-5 h-5 text-${insight.color}-600`} />
                                      Your team superpower:
                                    </h5>
                                    <p className="text-sm text-gray-700">{insight.content.superpower}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Values Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Team Work Values</CardTitle>
                    <p className="text-gray-600">Your team's work values represent what motivates and drives you professionally.</p>
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
                          data={teamData.aggregateScores.values}
                          color="#A855F7"
                          title=""
                          size={350}
                        />
                      </div>
                    </div>

                    {/* Right: Style Preferences */}
                  <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Team Style Preferences</h3>
                      <div className="space-y-4">
                        {Object.entries(teamData.aggregateScores.values).map(([trait, score]) => (
                          <div key={trait} className="space-y-2">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium capitalize">{trait.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <div className="relative">
                                    <button
                                      onClick={() => setActiveTooltip(activeTooltip === trait ? null : trait)}
                                      className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                      <HelpCircle className="h-4 w-4" />
                                    </button>
                                    {activeTooltip === trait && (
                                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-80">
                                        <div className="text-sm text-gray-700 leading-relaxed">
                                          {getTermExplanation(trait)}
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
                                    {getScoreLabel(trait, score)}
                              </span>
                              <span className="text-sm text-gray-500">({score})</span>
                            </div>
                              </div>
                              <p className="text-sm text-gray-600">{getValueExplanation(trait, score)}</p>
                              <Progress value={score} className="h-2" />
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>
                  </div>

                  {/* What This Means for Your Team - Values */}
                  {completedMembers.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-2xl font-semibold mb-6 text-gray-900">What This Means for Your Team</h3>
                      
                      {/* Generate values insights based on actual scores */}
                      {(() => {
                        const valuesScores = teamData.aggregateScores.values;
                        const insights = [];
                        
                        if (valuesScores.innovation >= 70) {
                          insights.push({
                            title: "High Innovation - The Creative Problem Solvers",
                            description: "Your team naturally seeks creative solutions and embraces new approaches",
                            key: "innovation-high",
                            icon: Lightbulb,
                            color: "purple",
                            content: {
                              strengths: [
                                "Innovation-focused projects that challenge conventional thinking",
                                "Experimental environments that allow for creative exploration",
                                "Cross-industry collaboration that brings fresh perspectives",
                                "Continuous learning opportunities that fuel creative growth"
                              ],
                              avoid: [
                                "Rigid processes that limit creative exploration",
                                "Conservative environments that resist new ideas",
                                "Repetitive tasks that don't challenge innovation",
                                "Risk-averse leadership that stifles experimentation"
                              ],
                              superpower: "Your team transforms challenges into opportunities through creative thinking and innovative solutions."
                            }
                          });
                        }

                        if (valuesScores.collaboration >= 70) {
                          insights.push({
                            title: "High Collaboration - The Team Players",
                            description: "Your team thrives in collaborative environments and values collective success",
                            key: "collaboration-high",
                            icon: Users,
                            color: "green",
                            content: {
                              strengths: [
                                "Team-based projects that leverage collective strengths",
                                "Collaborative environments where everyone contributes",
                                "Shared decision-making processes that include all voices",
                                "Group problem-solving that combines diverse perspectives"
                              ],
                              avoid: [
                                "Highly competitive individual-focused environments",
                                "Isolated work arrangements that limit team interaction",
                                "Winner-takes-all systems that create internal competition",
                                "Hierarchical structures that limit collaborative input"
                              ],
                              superpower: "Your team achieves more together than the sum of individual contributions through effective collaboration."
                            }
                          });
                        }

                        // Add empty state if no insights
                        if (insights.length === 0) {
                          return (
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Target className="h-6 w-6 text-gray-400" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Building Your Values Profile</h4>
                                <p className="text-sm text-gray-600">
                                  Your team shows balanced work values. As more members complete assessments, we'll provide more specific insights.
                                </p>
                              </div>
                            </div>
                          );
                        }

                        return insights.slice(0, 2).map((insight, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg mb-4">
                            <div 
                              className="p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                              onClick={() => toggleRecommendation(insight.key, 0)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 bg-${insight.color}-100 rounded-full flex items-center justify-center`}>
                                    <insight.icon className={`h-4 w-4 text-${insight.color}-600`} />
                                  </div>
                  <div>
                                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                                    <p className="text-sm text-gray-600">{insight.description}</p>
                          </div>
                            </div>
                                {expandedRecommendations[`${insight.key}-0`] ? (
                                  <ChevronUp className="h-5 w-5 text-gray-500" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-500" />
                                )}
                          </div>
                        </div>
                            
                            {expandedRecommendations[`${insight.key}-0`] && (
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
                                        {insight.content.strengths.map((strength, i) => (
                                          <li key={i}>• <strong>{strength.split(' ')[0]} {strength.split(' ')[1]}</strong> {strength.split(' ').slice(2).join(' ')}</li>
                                        ))}
                                      </ul>
                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                      <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                        <X className="w-5 h-5 text-gray-600" />
                                        What to avoid:
                                      </h5>
                                      <ul className="text-sm text-gray-700 space-y-2">
                                        {insight.content.avoid.map((avoid, i) => (
                                          <li key={i}>• <strong>{avoid.split(' ')[0]} {avoid.split(' ')[1]}</strong> {avoid.split(' ').slice(2).join(' ')}</li>
                                        ))}
                                      </ul>
                  </div>
                          </div>
                                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                      <Zap className={`w-5 h-5 text-${insight.color}-600`} />
                                      Your team superpower:
                                    </h5>
                                    <p className="text-sm text-gray-700">{insight.content.superpower}</p>
                            </div>
                          </div>
                        </div>
                            )}
                    </div>
                        ));
                      })()}
                  </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Overall Team Summary */}
            {completedMembers.length > 0 && (
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
                    {(() => {
                          const profiles = [];
                      const oceanScores = teamData.aggregateScores.ocean;
                      const cultureScores = teamData.aggregateScores.culture;
                          const valuesScores = teamData.aggregateScores.values;

                          // Generate dynamic profiles based on actual scores
                          if (oceanScores.openness >= 70 && valuesScores.collaboration >= 60) {
                            profiles.push({
                              icon: Brain,
                              title: "Creative & Collaborative",
                              description: "High openness and collaboration skills make you natural innovators who work well together.",
                              color: "blue"
                            });
                          }

                          if (cultureScores.powerDistance <= 40 || valuesScores.collaboration >= 70) {
                            profiles.push({
                              icon: Users,
                              title: "Collaborative",
                              description: "You thrive in team environments and value flat organizational structures.",
                              color: "green"
                            });
                          }

                          if (valuesScores.quality >= 70 || valuesScores.innovation >= 70) {
                            profiles.push({
                              icon: Award,
                              title: "Quality-Focused",
                              description: "You prioritize excellence and innovation in everything you do.",
                              color: "purple"
                            });
                          }

                          // Fill with default profiles if needed
                          if (profiles.length < 3) {
                            const defaults = [
                              {
                                icon: Brain,
                                title: "Analytical",
                                description: "Your team approaches challenges with thoughtful analysis and strategic thinking.",
                                color: "blue"
                              },
                              {
                                icon: Users,
                                title: "Team-Oriented",
                                description: "You value collaboration and work well together toward common goals.",
                                color: "green"
                              },
                              {
                                icon: Award,
                                title: "Results-Driven",
                                description: "Your team is focused on achieving high-quality outcomes and continuous improvement.",
                                color: "purple"
                              }
                            ];
                            
                            for (const defaultProfile of defaults) {
                              if (profiles.length < 3) {
                                profiles.push(defaultProfile);
                              }
                            }
                          }

                          return profiles.slice(0, 3).map((profile, index) => (
                            <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                              <div className="flex flex-col items-center text-center">
                                <div className={`w-12 h-12 bg-${profile.color}-100 rounded-full flex items-center justify-center mb-4`}>
                                  <profile.icon className={`h-6 w-6 text-${profile.color}-600`} />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">{profile.title}</h4>
                                <p className="text-sm text-gray-600">{profile.description}</p>
                              </div>
                            </div>
                          ));
                        })()}
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
                          {(() => {
                            const strengths = [];
                            const oceanScores = teamData.aggregateScores.ocean;
                            const valuesScores = teamData.aggregateScores.values;

                            if (oceanScores.openness >= 70) strengths.push("Creative problem-solving and innovation");
                            if (oceanScores.agreeableness >= 70) strengths.push("Strong team collaboration and communication");
                            if (oceanScores.neuroticism <= 30) strengths.push("Emotional stability and stress resilience");
                            if (valuesScores.quality >= 70) strengths.push("Quality focus and attention to detail");
                            if (valuesScores.collaboration >= 70) strengths.push("Excellent teamwork and coordination");

                            // Default strengths if none identified
                            if (strengths.length === 0) {
                              strengths.push(
                                "Balanced approach to challenges and opportunities",
                                "Adaptable to different work situations and requirements",
                                "Collaborative mindset with individual accountability"
                              );
                            }

                            return strengths.slice(0, 4).map((strength, index) => (
                        <li key={index} className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-sm text-gray-700">{strength}</span>
                              </li>
                            ));
                          })()}
                        </ul>
                            </div>
                      
                      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          Areas for Growth
                        </h3>
                        <ul className="space-y-3">
                          {(() => {
                            const growthAreas = [];
                            const oceanScores = teamData.aggregateScores.ocean;
                            const cultureScores = teamData.aggregateScores.culture;

                            if (oceanScores.conscientiousness <= 50) growthAreas.push("Balancing structure with flexibility");
                            if (oceanScores.openness <= 40) growthAreas.push("Embracing new ideas and approaches");
                            if (cultureScores.uncertaintyAvoidance >= 70) growthAreas.push("Managing time and priorities effectively");
                            if (oceanScores.agreeableness >= 80) growthAreas.push("Setting boundaries and saying no");

                            // Default growth areas
                            if (growthAreas.length === 0) {
                              growthAreas.push(
                                "Balancing individual and team priorities",
                                "Managing competing demands effectively",
                                "Maintaining focus during busy periods",
                                "Communicating expectations clearly"
                              );
                            }

                            return growthAreas.slice(0, 4).map((area, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-sm text-gray-700">{area}</span>
                        </li>
                      ));
                    })()}
                  </ul>
                </div>
                    </div>

                    {/* Team Reflection Questions */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Team Reflection Questions</h3>
                <div className="space-y-4">
                    {(() => {
                          const oceanScores = teamData.aggregateScores.ocean;
                          const cultureScores = teamData.aggregateScores.culture;
                          const valuesScores = teamData.aggregateScores.values;
                          
                      const questions = [
                        {
                              question: "How can you leverage your creative and social strengths in your current role?",
                              explanation: `Consider how your team's ${oceanScores.openness >= 70 ? 'high openness' : 'balanced openness'} and ${valuesScores.collaboration >= 70 ? 'strong collaboration' : 'collaboration'} skills can be applied to current projects. Look for opportunities to lead brainstorming sessions, mentor colleagues, or take on cross-functional initiatives.`,
                              badges: [`Openness (${oceanScores.openness})`, `Collaboration (${valuesScores.collaboration})`]
                            },
                            {
                              question: "What type of work environment would best support your team's values and working style?",
                              explanation: `Your team thrives in environments that offer ${cultureScores.powerDistance <= 40 ? 'flat structures' : 'clear structure'}, collaborative spaces, and opportunities for ${valuesScores.innovation >= 70 ? 'innovation' : 'growth'}. Look for organizations with open communication channels and cultures that value both individual achievement and team success.`,
                              badges: [`Power Distance (${cultureScores.powerDistance})`, `Innovation (${valuesScores.innovation})`]
                            },
                            {
                              question: "How does your team prefer to process and share ideas during meetings?",
                              explanation: `This question helps surface different communication preferences in your team. ${oceanScores.extraversion >= 60 ? 'Your higher extraversion suggests you enjoy interactive discussions' : 'Your balanced extraversion means some prefer thinking time while others like spontaneous discussion'}. Consider establishing both real-time and asynchronous ways to contribute ideas.`,
                              badges: [`Extraversion (${oceanScores.extraversion})`]
                            },
                            {
                              question: "What balance of structure and flexibility helps each team member do their best work?",
                              explanation: `This discussion helps identify individual work style preferences. ${oceanScores.conscientiousness >= 70 ? 'Your higher conscientiousness suggests appreciation for structure' : 'Your balanced conscientiousness means flexibility is important'}, while ${oceanScores.openness >= 70 ? 'high openness values creative freedom' : 'openness suggests some structure is helpful'}. Find ways to accommodate both preferences.`,
                              badges: [`Openness (${oceanScores.openness})`, `Conscientiousness (${oceanScores.conscientiousness})`]
                            },
                            {
                              question: "How comfortable is your team with uncertainty and how do you prefer to handle unexpected changes?",
                              explanation: `Understanding your team's comfort with ambiguity helps in planning and crisis management. ${cultureScores.uncertaintyAvoidance >= 60 ? 'Your preference for structure suggests planning ahead for contingencies' : 'Your comfort with uncertainty means you can adapt quickly to changes'}.`,
                              badges: [`Uncertainty Avoidance (${cultureScores.uncertaintyAvoidance})`]
                            },
                            {
                              question: "How does your team balance individual recognition with collective achievement?",
                              explanation: `This helps establish recognition practices that motivate everyone. ${cultureScores.individualism >= 60 ? 'Your individualistic tendencies value personal recognition' : 'Your collective orientation values team achievements'}, while ${oceanScores.agreeableness >= 70 ? 'high agreeableness ensures team harmony' : 'balanced agreeableness maintains healthy individual focus'}.`,
                              badges: [`Individualism (${cultureScores.individualism})`, `Agreeableness (${oceanScores.agreeableness})`]
                        }
                      ];
                      
                      return questions.map((q, index) => (
                        <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleRecommendation("reflection", index)}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {q.question}
                              </p>
                                  {expandedRecommendations[`reflection-${index}`] ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </div>
                              {expandedRecommendations[`reflection-${index}`] && (
                            <div className="px-4 pb-4 border-t border-gray-100">
                              <div className="pt-4">
                                    <p className="text-sm text-gray-700">
                                  {q.explanation}
                                </p>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                  <span className="text-xs text-gray-500">Because:</span>
                                      {q.badges.map((badge, i) => (
                                        <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 ml-1">
                                          {badge}
                                  </Badge>
                                      ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ));
                    })()}
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
                            {(() => {
                              const oceanScores = teamData.aggregateScores.ocean;
                              const cultureScores = teamData.aggregateScores.culture;
                              const valuesScores = teamData.aggregateScores.values;
                              
                              const thisWeekSteps = [];
                              
                              if (oceanScores.openness >= 70) {
                                thisWeekSteps.push({
                                  text: 'Create a dedicated "Innovation Hour" during the week for creative & experimental projects',
                                  trait: 'Openness',
                                  score: oceanScores.openness
                                });
                              }
                              
                              if (valuesScores.collaboration >= 70) {
                                thisWeekSteps.push({
                                  text: 'Establish rotating meeting facilitation to leverage your collaborative strengths',
                                  trait: 'Collaboration', 
                                  score: valuesScores.collaboration
                                });
                              }
                              
                              if (cultureScores.powerDistance <= 40) {
                                thisWeekSteps.push({
                                  text: 'Implement flat decision-making processes that match your low Power Distance preference',
                                  trait: 'Power Distance',
                                  score: cultureScores.powerDistance
                                });
                              }
                              
                              // Default steps if none specific
                              if (thisWeekSteps.length === 0) {
                                thisWeekSteps.push(
                                  { text: 'Schedule team check-ins to discuss working style preferences', trait: 'Team', score: 0 },
                                  { text: 'Create shared team agreements about communication and collaboration', trait: 'Team', score: 0 },
                                  { text: 'Establish regular feedback cycles for continuous improvement', trait: 'Team', score: 0 }
                                );
                              }
                              
                              return thisWeekSteps.slice(0, 3).map((step, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                                    <span className="text-sm text-gray-700">{step.text}</span>
                                    {step.score > 0 && (
                                      <div className="mt-1">
                                        <span className="text-xs text-gray-500">Because:</span>
                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 ml-1">
                                          {step.trait} ({step.score})
                                        </Badge>
                      </div>
                    )}
                            </div>
                                </li>
                              ));
                            })()}
                          </ul>
                            </div>

                      <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                            <h4 className="font-semibold text-gray-900">This Month</h4>
                            </div>
                          <ul className="space-y-3">
                            {(() => {
                              const oceanScores = teamData.aggregateScores.ocean;
                              const cultureScores = teamData.aggregateScores.culture;
                              const valuesScores = teamData.aggregateScores.values;
                              
                              const thisMonthSteps = [];
                              
                              if (valuesScores.quality >= 70) {
                                thisMonthSteps.push({
                                  text: 'Set up quality review processes that leverage your high Quality focus',
                                  trait: 'Quality',
                                  score: valuesScores.quality
                                });
                              }
                              
                              if (oceanScores.openness >= 70 && oceanScores.conscientiousness >= 60) {
                                thisMonthSteps.push({
                                  text: 'Create innovation time within structured processes to balance creativity with delivery',
                                  trait: 'Openness + Conscientiousness',
                                  score: Math.round((oceanScores.openness + oceanScores.conscientiousness) / 2)
                                });
                              }
                              
                              if (cultureScores.individualism >= 60 && oceanScores.agreeableness >= 60) {
                                thisMonthSteps.push({
                                  text: 'Establish regular team reflection sessions to leverage your team dynamics',
                                  trait: 'Individualism + Agreeableness',
                                  score: Math.round((cultureScores.individualism + oceanScores.agreeableness) / 2)
                                });
                              }
                              
                              // Default steps if none specific
                              if (thisMonthSteps.length === 0) {
                                thisMonthSteps.push(
                                  { text: 'Implement team retrospectives to identify improvement opportunities', trait: 'Team', score: 0 },
                                  { text: 'Create cross-training opportunities to build team versatility', trait: 'Team', score: 0 },
                                  { text: 'Establish team goals that align with individual strengths', trait: 'Team', score: 0 }
                                );
                              }
                              
                              return thisMonthSteps.slice(0, 3).map((step, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                                    <span className="text-sm text-gray-700">{step.text}</span>
                                    {step.score > 0 && (
                                      <div className="mt-1">
                                        <span className="text-xs text-gray-500">Because:</span>
                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 ml-1">
                                          {step.trait} ({step.score})
                                        </Badge>
                      </div>
                    )}
                  </div>
                                </li>
                              ));
                            })()}
                          </ul>
                    </div>
                    </div>
                  </div>
                  </div>
              </CardContent>
            </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Members
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setShowInviteModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Invite
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
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




            {/* Team Synergy Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Synergy Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedMembers.length > 0 ? (
                    <>
                      {/* View Selector */}
                      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                        <Button
                          variant={comparisonView === 'fit' ? 'default' : 'ghost'}
                          size="sm"
                          className="flex-1"
                          onClick={() => setComparisonView('fit')}
                        >
                          <Target className="h-4 w-4 mr-1" />
                          Team Fit
                        </Button>
                        <Button
                          variant={comparisonView === 'roles' ? 'default' : 'ghost'}
                          size="sm"
                          className="flex-1"
                          onClick={() => setComparisonView('roles')}
                        >
                          <Award className="h-4 w-4 mr-1" />
                          Roles
                        </Button>
                      </div>

                      {/* Team Fit Analysis View */}
                      {comparisonView === 'fit' && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">
                            See how well each member aligns with your team's overall personality and culture profile.
                          </p>
                          {completedMembers.map((member) => {
                            const fitScore = calculateTeamFitScore(member, teamData?.aggregateScores);

                            return (
                              <div key={member.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <span className="font-medium text-gray-900">{member.name}</span>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                                  >
                                    {selectedMember === member.id ? 'Hide Details' : 'View Details'}
                                  </Button>
                                </div>
                                
                                {selectedMember === member.id && (
                                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium text-blue-900 mb-2">Alignment Strengths</h4>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                          {fitScore >= 85 ? (
                                            <>
                                              <li>• Excellent cultural alignment</li>
                                              <li>• Natural team chemistry</li>
                                              <li>• Reinforces team strengths</li>
                                            </>
                                          ) : fitScore >= 70 ? (
                                            <>
                                              <li>• Strong personality fit</li>
                                              <li>• Complements team dynamics</li>
                                              <li>• Shares core values</li>
                                            </>
                                          ) : (
                                            <>
                                              <li>• Brings different perspective</li>
                                              <li>• Challenges team thinking</li>
                                              <li>• Adds unique strengths</li>
                                            </>
                                          )}
                                        </ul>
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-blue-900 mb-2">Key Contributions</h4>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                          {(() => {
                                            const roles = generateRoleSuggestions(member);
                                            return (
                                              <>
                                                <li>• {roles.primary}</li>
                                                <li>• {roles.secondary}</li>
                                                <li>• {roles.uniqueContribution}</li>
                                              </>
                                            );
                                          })()}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Role Optimization View */}
                      {comparisonView === 'roles' && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">
                            Discover each member's optimal role and unique contributions to maximize team effectiveness.
                          </p>
                          {completedMembers.map((member) => {
                            const roles = generateRoleSuggestions(member);
                            return (
                              <div key={member.id} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="font-medium text-gray-900">{member.name}</span>
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                    {roles.primary}
                                  </Badge>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="font-medium text-gray-700 mb-1">Primary Role</h4>
                                    <p className="text-sm text-gray-600">{roles.primary}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-700 mb-1">Secondary Strength</h4>
                                    <p className="text-sm text-gray-600">{roles.secondary}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-700 mb-1">Unique Contribution</h4>
                                    <p className="text-sm text-gray-600">{roles.uniqueContribution}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">
                        Team synergy analysis will be available once members complete their assessments.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Team Dynamics & Collaboration Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Dynamics & Collaboration Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const completedMembers = teamData.members.filter(m => m.status === 'completed');
                    const teamDynamics = detectPersonalityConflicts(completedMembers);
                    
                    if (teamDynamics.length === 0) {
                      return (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-green-900">Excellent Team Harmony!</h4>
                              <p className="text-sm text-green-700">
                                Your team shows strong compatibility across personality dimensions. Different working styles complement each other well.
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    return teamDynamics.map((dynamic, index) => (
                      <div key={index} className="border border-blue-200 rounded-lg overflow-hidden">
                        <div 
                          className="p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => setExpandedConflicts(prev => ({ ...prev, [index]: !prev[index] }))}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-blue-900">{dynamic.type.replace('Conflict', 'Opportunity')}</h4>
                                <p className="text-sm text-blue-700">{dynamic.description.replace('conflicting', 'different').replace('conflict', 'opportunity')}</p>
                              </div>
                            </div>
                            <ChevronDown className={`h-5 w-5 text-blue-600 transition-transform ${expandedConflicts[index] ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                        
                        {expandedConflicts[index] && (
                          <div className="p-4 bg-white border-t border-blue-200">
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Users className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium text-gray-900">Team Members Involved</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {dynamic.members.map((member: any) => (
                                    <Badge key={member.id} className="bg-blue-100 text-blue-700">
                                      {member.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Target className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium text-gray-900">Understanding the Dynamic</span>
                                </div>
                                <p className="text-sm text-gray-700 mb-3">{dynamic.explanation.replace('conflict', 'dynamic').replace('Conflict', 'Dynamic')}</p>
                                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                                  {dynamic.implications.map((implication: any, idx: number) => (
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
                                  <span className="font-medium text-gray-900">Collaboration Strategies</span>
                                </div>
                                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                                  {dynamic.recommendations.map((rec: any, idx: number) => (
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
                  {candidates.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <UserPlus className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">No Candidates Yet</h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Invite potential new hires to assess their fit with your team culture.
                      </p>
                      <Button size="sm" className="w-full" onClick={() => setShowCandidateModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Invite Candidate
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {candidates.map((candidate) => (
                        <div key={candidate.id} className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                              <span className="text-sm font-bold text-purple-700">
                                {candidate.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="mb-3">
                                <div className="font-semibold text-gray-900 text-base truncate">{candidate.name}</div>
                                <div className="text-sm text-gray-500 truncate">{candidate.position}</div>
                                <div className="text-sm text-gray-500 truncate">{candidate.email}</div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Badge className={`${
                                  candidate.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                                  candidate.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                  candidate.status === 'invited' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  'bg-gray-100 text-gray-800 border-gray-200'
                                } px-2 py-1 text-xs`}>
                                  {candidate.status === 'completed' ? 'Assessment Complete' : 
                                   candidate.status === 'in_progress' ? 'In Progress' : 
                                   candidate.status === 'invited' ? 'Invited' : 'Withdrawn'}
                                </Badge>
                                
                                {candidate.status === 'completed' && (
                                  <div className="flex items-center gap-1 text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors">
                                    <span>View Results</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Button size="sm" className="w-full" onClick={() => setShowCandidateModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Invite Another Candidate
                      </Button>
                    </div>
                  )}
                  
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

            {/* Ready to Share Your Results - At Bottom of Sidebar */}
            <Card>
              <CardContent className="pt-8">
                <div className="text-center">
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
                      onClick={exportToPDF}
                      disabled={isExporting}
                    >
                      {isExporting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Export Report
                        </>
                      )}
                    </Button>
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
      
      <CandidateInviteModal
        isOpen={showCandidateModal}
        onClose={() => setShowCandidateModal(false)}
        teamCode={teamData.code}
        teamName={teamData.name}
      />
    </div>
  );
}
