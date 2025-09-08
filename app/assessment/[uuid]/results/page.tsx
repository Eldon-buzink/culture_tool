'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Brain, Users, Target, TrendingUp, TrendingDown, Minus, HelpCircle, Lightbulb, Award, AlertTriangle } from 'lucide-react';
import RadarChart from '@/components/RadarChart';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmailResultsModal from '@/components/EmailResultsModal';
import ActionableRecommendations from '@/components/ActionableRecommendations';

export default function ResultsPage() {
  const { uuid } = useParams();
  const [loading, setLoading] = useState(true);
  const [isCandidateAssessment, setIsCandidateAssessment] = useState(false);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [expandedRecommendations, setExpandedRecommendations] = useState<Record<string, boolean>>({});
  
  const toggleRecommendation = (section: string, index: number) => {
    const key = `${section}-${index}`;
    setExpandedRecommendations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Get the uuid string (handle array case)
  const uuidString = Array.isArray(uuid) ? uuid[0] : uuid;

  // Demo results for now - we'll replace this with real data
  const [results, setResults] = useState({
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
  });

  useEffect(() => {
    // Load actual assessment data
    const loadAssessmentData = async () => {
      try {
        console.log('Loading assessment data for:', uuidString);
        
        // Check if this is a session-based assessment (legacy support)
        const isSessionBased = uuidString.startsWith('temp-');
        
        if (isSessionBased) {
          // Legacy session-based assessment - get from localStorage
          const storageKey = `assessment-responses-${uuidString}`;
          const allResponses = localStorage.getItem(storageKey);
          
          if (allResponses) {
            const responses = JSON.parse(allResponses);
            console.log('Found legacy session responses:', responses);
            
            // Calculate scores from actual responses
            const oceanScores = calculateOceanScores(responses.ocean || {});
            const cultureScores = calculateCultureScores(responses.ocean || {}); // Use OCEAN for now
            const valuesScores = calculateValuesScores(responses.ocean || {}); // Use OCEAN for now
            
            // Generate insights and recommendations based on actual scores
            const insights = generateInsights(oceanScores, cultureScores, valuesScores);
            const recommendations = generateRecommendations(oceanScores, cultureScores, valuesScores);
            
            setResults({
              oceanScores,
              cultureScores,
              valuesScores,
              insights,
              recommendations
            });
          } else {
            console.error('No legacy session responses found');
          }
        } else {
          // For database-based assessments, fetch from API
          const response = await fetch(`/api/assessments/${uuidString}/results`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.results) {
              setResults(data.results);
              
              // Check if this is a candidate assessment by looking at the user email
              // Candidate users have emails like "candidate-...@temp.local"
              if (data.results.userEmail && data.results.userEmail.includes('candidate-')) {
                setIsCandidateAssessment(true);
              }
            } else {
              console.error('No results found in database');
              // Show appropriate message based on assessment type
              const processingMessage = isCandidateAssessment 
                ? "Your assessment results are being sent to the hiring manager. You'll be notified about next steps soon."
                : "Your assessment results are being processed. Please check back in a few minutes.";
              
              setResults({
                ...results,
                insights: {
                  ocean: [processingMessage],
                  culture: [processingMessage],
                  values: [processingMessage]
                }
              });
            }
          } else {
            console.error('Failed to fetch results from database');
            // Show appropriate message based on assessment type
            const processingMessage = isCandidateAssessment 
              ? "Your assessment results are being sent to the hiring manager. You'll be notified about next steps soon."
              : "Your assessment results are being processed. Please check back in a few minutes.";
            
            setResults({
              ...results,
              insights: {
                ocean: [processingMessage],
                culture: [processingMessage],
                values: [processingMessage]
              }
            });
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading assessment data:', error);
        setLoading(false);
      }
    };
    
    if (uuidString) {
      loadAssessmentData();
    }
  }, [uuidString]);

  // Score calculation functions
  const calculateOceanScores = (responses: Record<string, number>) => {
    console.log('Calculating OCEAN scores from responses:', responses);
    
    // Map question IDs to OCEAN dimensions
    const oceanMapping: Record<string, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'> = {
      // Extraversion questions
      'ocean_1': 'extraversion',      // 'I am the life of the party'
      'ocean_6': 'extraversion',      // 'I don\'t talk a lot' (reverse scored)
      'ocean_11': 'extraversion',     // 'I talk to a lot of different people at parties'
      'ocean_16': 'extraversion',     // 'I keep in the background' (reverse scored)
      'ocean_21': 'extraversion',     // 'I start conversations'
      'ocean_26': 'extraversion',     // 'I have little to say' (reverse scored)
      'ocean_31': 'extraversion',     // 'I am quiet around strangers' (reverse scored)
      'ocean_36': 'extraversion',     // 'I get energized by social interactions'
      
      // Agreeableness questions
      'ocean_2': 'agreeableness',     // 'I sympathize with others\' feelings'
      'ocean_7': 'agreeableness',     // 'I am not interested in other people\'s problems' (reverse scored)
      'ocean_12': 'agreeableness',    // 'I feel others\' emotions'
      'ocean_17': 'agreeableness',    // 'I am not really interested in others' (reverse scored)
      'ocean_22': 'agreeableness',    // 'I insult people' (reverse scored)
      'ocean_27': 'agreeableness',    // 'I am concerned about others'
      'ocean_32': 'agreeableness',    // 'I am helpful and unselfish with others'
      'ocean_37': 'agreeableness',    // 'I am sometimes rude to others' (reverse scored)
      
      // Conscientiousness questions
      'ocean_3': 'conscientiousness', // 'I get chores done right away'
      'ocean_8': 'conscientiousness', // 'I often forget to put things back in their proper place' (reverse scored)
      'ocean_13': 'conscientiousness',// 'I like order'
      'ocean_18': 'conscientiousness',// 'I make a mess of things' (reverse scored)
      'ocean_23': 'conscientiousness',// 'I get chores done right away'
      'ocean_28': 'conscientiousness',// 'I often forget to put things back in their proper place' (reverse scored)
      'ocean_33': 'conscientiousness',// 'I like order'
      'ocean_38': 'conscientiousness',// 'I make a mess of things' (reverse scored)
      
      // Neuroticism questions
      'ocean_4': 'neuroticism',       // 'I have frequent mood swings'
      'ocean_9': 'neuroticism',       // 'I am relaxed most of the time' (reverse scored)
      'ocean_14': 'neuroticism',      // 'I get upset easily'
      'ocean_19': 'neuroticism',      // 'I am not easily bothered by things' (reverse scored)
      'ocean_24': 'neuroticism',      // 'I worry about things'
      'ocean_29': 'neuroticism',      // 'I am easily disturbed'
      'ocean_34': 'neuroticism',      // 'I get stressed out easily'
      'ocean_39': 'neuroticism',      // 'I am not easily frustrated' (reverse scored)
      
      // Openness questions
      'ocean_5': 'openness',          // 'I have a vivid imagination'
      'ocean_10': 'openness',         // 'I am not interested in abstract ideas' (reverse scored)
      'ocean_15': 'openness',         // 'I have excellent ideas'
      'ocean_20': 'openness',         // 'I have a rich vocabulary'
      'ocean_25': 'openness',         // 'I have difficulty understanding abstract ideas' (reverse scored)
      'ocean_30': 'openness',         // 'I have a vivid imagination'
      'ocean_35': 'openness',         // 'I am not interested in abstract ideas' (reverse scored)
      'ocean_40': 'openness'          // 'I have excellent ideas'
    };
    
    const scores = { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 };
    const counts = { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 };
    
    Object.entries(responses).forEach(([questionId, response]) => {
      const dimension = oceanMapping[questionId];
      if (dimension) {
        // Handle reverse-scored questions (1-5 scale becomes 5-1)
        let adjustedResponse = response;
        const reverseScoredQuestions = ['ocean_6', 'ocean_7', 'ocean_8', 'ocean_9', 'ocean_10', 'ocean_16', 'ocean_17', 'ocean_18', 'ocean_19', 'ocean_22', 'ocean_25', 'ocean_26', 'ocean_27', 'ocean_28', 'ocean_31', 'ocean_32', 'ocean_33', 'ocean_34', 'ocean_35', 'ocean_36', 'ocean_37', 'ocean_38', 'ocean_39'];
        if (reverseScoredQuestions.includes(questionId)) {
          adjustedResponse = 6 - response; // Convert 1->5, 2->4, 3->3, 4->2, 5->1
        }
        
        scores[dimension] += adjustedResponse;
        counts[dimension]++;
      }
    });
    
    // Calculate averages and convert to percentage (0-100)
    Object.keys(scores).forEach(dimension => {
      const key = dimension as keyof typeof scores;
      if (counts[key] > 0) {
        scores[key] = Math.round((scores[key] / counts[key]) * 20); // Convert 1-5 scale to 0-100
      }
    });
    
    console.log('Final OCEAN scores:', scores);
    return scores;
  };

  const calculateCultureScores = (responses: Record<string, number>) => {
    // For now, generate culture scores based on OCEAN scores
    const oceanScores = calculateOceanScores(responses);
    
    const scores = { 
      powerDistance: Math.round(50 + (oceanScores.conscientiousness - 50) * 0.3 + (oceanScores.neuroticism - 50) * 0.2), 
      individualism: Math.round(50 + (oceanScores.extraversion - 50) * 0.4 + (oceanScores.openness - 50) * 0.3), 
      masculinity: Math.round(50 + (oceanScores.extraversion - 50) * 0.3 + (oceanScores.agreeableness - 50) * -0.2), 
      uncertaintyAvoidance: Math.round(50 + (oceanScores.conscientiousness - 50) * 0.4 + (oceanScores.neuroticism - 50) * 0.3), 
      longTermOrientation: Math.round(50 + (oceanScores.conscientiousness - 50) * 0.5 + (oceanScores.openness - 50) * 0.2), 
      indulgence: Math.round(50 + (oceanScores.extraversion - 50) * 0.3 + (oceanScores.neuroticism - 50) * -0.4) 
    };
    
    // Ensure scores are within 0-100 range
    Object.keys(scores).forEach(key => {
      scores[key as keyof typeof scores] = Math.max(0, Math.min(100, scores[key as keyof typeof scores]));
    });
    
    return scores;
  };

  const calculateValuesScores = (responses: Record<string, number>) => {
    // For now, generate values scores based on OCEAN scores
    const oceanScores = calculateOceanScores(responses);
    
    const scores = { 
      innovation: Math.round(50 + (oceanScores.openness - 50) * 0.6 + (oceanScores.extraversion - 50) * 0.2), 
      collaboration: Math.round(50 + (oceanScores.agreeableness - 50) * 0.5 + (oceanScores.extraversion - 50) * 0.3), 
      autonomy: Math.round(50 + (oceanScores.extraversion - 50) * -0.2 + (oceanScores.conscientiousness - 50) * 0.4), 
      quality: Math.round(50 + (oceanScores.conscientiousness - 50) * 0.6 + (oceanScores.neuroticism - 50) * 0.2), 
      customerFocus: Math.round(50 + (oceanScores.agreeableness - 50) * 0.4 + (oceanScores.extraversion - 50) * 0.3) 
    };
    
    // Ensure scores are within 0-100 range
    Object.keys(scores).forEach(key => {
      scores[key as keyof typeof scores] = Math.max(0, Math.min(100, scores[key as keyof typeof scores]));
    });
    
    return scores;
  };

  const generateInsights = (ocean: any, culture: any, values: any) => {
    const getLevel = (score: number) => {
      if (score >= 80) return 'very high';
      if (score >= 70) return 'high';
      if (score >= 50) return 'moderate';
      if (score >= 30) return 'low';
      return 'very low';
    };

    const getPersonalityInsight = (trait: string, score: number) => {
      const level = getLevel(score);
      switch (trait) {
        case 'openness':
          if (score >= 70) return `Your high openness (${score}) shows you're naturally curious and creative, thriving in dynamic environments that encourage innovation.`;
          if (score >= 50) return `Your moderate openness (${score}) indicates you balance creativity with practicality, preferring stable yet flexible work environments.`;
          return `Your lower openness (${score}) suggests you prefer established methods and structured environments where you can rely on proven approaches.`;
        case 'conscientiousness':
          if (score >= 70) return `Your high conscientiousness (${score}) makes you highly organized and reliable, excelling in roles requiring attention to detail and planning.`;
          if (score >= 50) return `Your moderate conscientiousness (${score}) shows you can be organized when needed while maintaining flexibility for changing circumstances.`;
          return `Your lower conscientiousness (${score}) indicates you prefer spontaneous, flexible work environments over highly structured ones.`;
        case 'extraversion':
          if (score >= 70) return `Your high extraversion (${score}) means you thrive in social, collaborative environments and energize others through your enthusiasm.`;
          if (score >= 50) return `Your moderate extraversion (${score}) shows you can work well both independently and in teams, adapting to different social contexts.`;
          return `Your lower extraversion (${score}) suggests you prefer focused, independent work and may need time to recharge after social interactions.`;
        case 'agreeableness':
          if (score >= 70) return `Your high agreeableness (${score}) makes you a natural team player who builds strong relationships and fosters collaboration.`;
          if (score >= 50) return `Your moderate agreeableness (${score}) shows you can balance cooperation with assertiveness when needed.`;
          return `Your lower agreeableness (${score}) indicates you prefer direct communication and may excel in competitive or challenging environments.`;
        case 'neuroticism':
          if (score >= 70) return `Your higher neuroticism (${score}) means you may be more sensitive to stress and benefit from supportive, low-pressure work environments.`;
          if (score >= 50) return `Your moderate neuroticism (${score}) shows you handle stress reasonably well while being aware of potential challenges.`;
          return `Your lower neuroticism (${score}) indicates you're generally calm under pressure and can handle high-stress situations effectively.`;
        default:
          return `Your ${trait} score of ${score} indicates ${level} levels in this area.`;
      }
    };

    return {
      ocean: [
        getPersonalityInsight('openness', ocean.openness),
        getPersonalityInsight('conscientiousness', ocean.conscientiousness),
        getPersonalityInsight('extraversion', ocean.extraversion),
        getPersonalityInsight('agreeableness', ocean.agreeableness),
        getPersonalityInsight('neuroticism', ocean.neuroticism)
      ],
      culture: [
        `Your power distance preference of ${culture.powerDistance} indicates you ${culture.powerDistance >= 70 ? 'prefer clear hierarchies and respect for authority' : culture.powerDistance >= 50 ? 'value balanced leadership with some structure' : 'prefer flat, egalitarian work environments'}.`,
        `With individualism at ${culture.individualism}, you ${culture.individualism >= 70 ? 'thrive when working independently and taking personal responsibility' : culture.individualism >= 50 ? 'can work both independently and as part of a team' : 'prefer collaborative, team-oriented work environments'}.`,
        `Your uncertainty avoidance of ${culture.uncertaintyAvoidance} shows you ${culture.uncertaintyAvoidance >= 70 ? 'prefer structured, predictable work environments with clear rules' : culture.uncertaintyAvoidance >= 50 ? 'can handle both structured and flexible environments' : 'thrive in dynamic, changing environments with minimal structure'}.`
      ],
      values: [
        `Your innovation score of ${values.innovation} indicates you ${values.innovation >= 70 ? 'naturally seek creative solutions and enjoy experimenting with new approaches' : values.innovation >= 50 ? 'balance innovation with proven methods' : 'prefer established, reliable processes over experimental approaches'}.`,
        `With collaboration at ${values.collaboration}, you ${values.collaboration >= 70 ? 'excel in team environments and believe success comes from working together' : values.collaboration >= 50 ? 'can work effectively both independently and in teams' : 'prefer to work independently and take personal responsibility for outcomes'}.`,
        `Your quality focus of ${values.quality} shows you ${values.quality >= 70 ? 'prioritize excellence and attention to detail in everything you do' : values.quality >= 50 ? 'balance quality with efficiency and practical considerations' : 'focus on getting things done efficiently, sometimes prioritizing speed over perfection'}.`
      ]
    };
  };

  const generateRecommendations = (ocean: any, culture: any, values: any) => {
    const getHighestTrait = (scores: any) => {
      return Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
    };

    const getLowestTrait = (scores: any) => {
      return Object.entries(scores).reduce((a, b) => scores[a[0]] < scores[b[0]] ? a : b)[0];
    };

    const highestOcean = getHighestTrait(ocean);
    const lowestOcean = getLowestTrait(ocean);
    const highestCulture = getHighestTrait(culture);
    const highestValues = getHighestTrait(values);

    const getOceanRecommendation = (trait: string, score: number) => {
      const traitNames = {
        openness: 'Openness to Experience',
        conscientiousness: 'Conscientiousness',
        extraversion: 'Extraversion',
        agreeableness: 'Agreeableness',
        neuroticism: 'Neuroticism'
      };
      
      if (score >= 70) {
        return {
          title: `Leverage Your High ${traitNames[trait as keyof typeof traitNames]}`,
          description: `Your high ${traitNames[trait as keyof typeof traitNames]} (${score}) is a significant strength. Focus on roles and situations where this trait can shine.`,
          nextSteps: [
            `Seek opportunities that specifically value high ${traitNames[trait as keyof typeof traitNames]}`,
            `Practice using your ${traitNames[trait as keyof typeof traitNames]} in team settings`,
            `Mentor others who may be developing this trait`
          ]
        };
      } else if (score <= 30) {
        return {
          title: `Develop Your ${traitNames[trait as keyof typeof traitNames]}`,
          description: `Your lower ${traitNames[trait as keyof typeof traitNames]} (${score}) presents an opportunity for growth. Consider how developing this area could benefit your career.`,
          nextSteps: [
            `Practice skills that build ${traitNames[trait as keyof typeof traitNames]}`,
            `Seek feedback on how to improve in this area`,
            `Find role models who excel in this trait`
          ]
        };
      } else {
        return {
          title: `Balance Your ${traitNames[trait as keyof typeof traitNames]}`,
          description: `Your moderate ${traitNames[trait as keyof typeof traitNames]} (${score}) gives you flexibility. You can adapt to different situations effectively.`,
          nextSteps: [
            `Recognize when to lean into your ${traitNames[trait as keyof typeof traitNames]}`,
            `Practice switching between different approaches as needed`,
            `Use your balanced nature to bridge different work styles`
          ]
        };
      }
    };

    return {
      ocean: {
        context: `Your OCEAN profile shows ${highestOcean} as your strongest trait (${ocean[highestOcean]}) and ${lowestOcean} as an area for potential growth (${ocean[lowestOcean]}).`,
        recommendations: [
          getOceanRecommendation(highestOcean, ocean[highestOcean]),
          getOceanRecommendation(lowestOcean, ocean[lowestOcean])
        ]
      },
      culture: {
        context: `Your cultural preferences show you ${culture[highestCulture] >= 70 ? 'strongly prefer' : culture[highestCulture] >= 50 ? 'moderately prefer' : 'have mixed feelings about'} ${highestCulture.replace(/([A-Z])/g, ' $1').toLowerCase()} in work environments.`,
        recommendations: [
          {
            title: `Find Your ${highestCulture.replace(/([A-Z])/g, ' $1').toLowerCase()} Fit`,
            description: `Look for organizations that align with your ${highestCulture.replace(/([A-Z])/g, ' $1').toLowerCase()} preferences (${culture[highestCulture]}).`,
            nextSteps: [
              `Research companies known for their ${highestCulture.replace(/([A-Z])/g, ' $1').toLowerCase()} approach`,
              `Ask specific questions about this aspect during interviews`,
              `Seek out teams that match your preferences`
            ]
          },
          {
            title: "Adapt to Different Cultures",
            description: "Learn to work effectively in diverse cultural environments while staying true to your core preferences.",
            nextSteps: [
              "Practice flexibility when working with different cultural approaches",
              "Learn about various organizational cultures and their benefits",
              "Develop communication skills that bridge cultural differences"
            ]
          }
        ]
      },
      values: {
        context: `Your work values show ${highestValues} as your top priority (${values[highestValues]}), indicating what truly motivates you professionally.`,
        recommendations: [
          {
            title: `Align Your Career with ${highestValues.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
            description: `Focus on roles and organizations that prioritize ${highestValues.replace(/([A-Z])/g, ' $1').toLowerCase()} as much as you do (${values[highestValues]}).`,
            nextSteps: [
              `Identify companies known for their ${highestValues.replace(/([A-Z])/g, ' $1').toLowerCase()} focus`,
              `Look for job descriptions that emphasize ${highestValues.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
              `Communicate your ${highestValues.replace(/([A-Z])/g, ' $1').toLowerCase()} values in interviews`
            ]
          },
          {
            title: "Balance Multiple Values",
            description: "While you have a clear top value, learn to balance it with other important aspects of work.",
            nextSteps: [
              "Prioritize your values for different career stages and situations",
              "Look for roles that can satisfy multiple values simultaneously",
              "Be willing to compromise on lower-priority values when necessary"
            ]
          }
        ]
      }
    };
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

  const getSectionSummary = (section: string) => {
    switch (section) {
      case 'ocean':
        const oceanScores = results.oceanScores || {};
        const oceanAvg = Object.keys(oceanScores).length > 0 ? Object.values(oceanScores).reduce((a, b) => a + b, 0) / Object.keys(oceanScores).length : 0;
        return `Your average OCEAN score is ${Math.round(oceanAvg)}, indicating a ${oceanAvg >= 60 ? 'positive' : oceanAvg >= 40 ? 'balanced' : 'cautious'} overall personality profile.`;
      case 'culture':
        const cultureScores = results.cultureScores || {};
        const cultureAvg = Object.keys(cultureScores).length > 0 ? Object.values(cultureScores).reduce((a, b) => a + b, 0) / Object.keys(cultureScores).length : 0;
        return `Your cultural preferences average ${Math.round(cultureAvg)}, suggesting you prefer ${cultureAvg >= 60 ? 'structured' : cultureAvg >= 40 ? 'balanced' : 'flexible'} work environments.`;
      case 'values':
        const valuesScores = results.valuesScores || {};
        const valuesAvg = Object.keys(valuesScores).length > 0 ? Object.values(valuesScores).reduce((a, b) => a + b, 0) / Object.keys(valuesScores).length : 0;
        return `Your work values average ${Math.round(valuesAvg)}, indicating you are ${valuesAvg >= 70 ? 'highly' : valuesAvg >= 50 ? 'moderately' : 'less'} motivated by these factors.`;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="xl" text="Loading your results..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Your Personality Compass</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover your unique strengths, growth opportunities, and how you can thrive in teams
          </p>
        </div>

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
                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Personality Dimensions</h3>
                  <div className="w-full h-96 mb-12">
                    <RadarChart
                      data={{
                        'Openness': results.oceanScores?.openness || 0,
                        'Conscientiousness': results.oceanScores?.conscientiousness || 0,
                        'Extraversion': results.oceanScores?.extraversion || 0,
                        'Agreeableness': results.oceanScores?.agreeableness || 0,
                        'Neuroticism': results.oceanScores?.neuroticism || 0
                      }}
                      size={500}
                    />
                  </div>
                </div>

                {/* Detailed Scores */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Detailed Scores</h3>
                  <div className="space-y-4">
                  {Object.entries(results.oceanScores || {}).map(([trait, score]) => (
                    <div key={trait} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{trait}</span>
                          <div className="relative">
                            <button
                              onClick={() => setActiveTooltip(activeTooltip === trait ? null : trait)}
                              className="text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                              <HelpCircle className="h-4 w-4" />
                            </button>
                            {activeTooltip === trait && (
                              <div className="absolute z-50 mt-2 p-4 bg-white border border-gray-200 text-gray-800 text-sm rounded-lg shadow-xl max-w-xs">
                                <div className="flex justify-between items-start mb-3">
                                  <span className="font-semibold capitalize text-gray-900">{trait}</span>
                                  <button
                                    onClick={() => setActiveTooltip(null)}
                                    className="text-gray-400 hover:text-gray-600 ml-2 text-lg font-bold"
                                  >
                                    ×
                                  </button>
                                </div>
                                <p className="leading-relaxed">{getTermTooltip(trait)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className={getScoreBadgeColor(score)}>
                          {getScoreLabel(score)} ({score})
                        </Badge>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

              {/* Right Column: Key Insights + AI Recommendations + Section Summary */}
              <div className="space-y-6">
                {/* Key Insights */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                  <ul className="space-y-2">
                    {(results.insights?.ocean || []).map((insight, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">AI-Powered Recommendations</h3>
                  <div className="space-y-4">
                    {(results.recommendations?.ocean?.recommendations || []).map((rec, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div 
                          className="p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => toggleRecommendation('ocean', index)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-blue-900">{rec.title}</h4>
                              <p className="text-sm text-blue-700 mt-1">{rec.description}</p>
                            </div>
                            {expandedRecommendations[`ocean-${index}`] ? (
                              <ChevronUp className="h-5 w-5 text-blue-600" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                        </div>
                        
                        {expandedRecommendations[`ocean-${index}`] && (
                          <div className="p-4 bg-white border-t border-gray-200">
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Next Steps:</h5>
                              <ul className="space-y-1">
                                {rec.nextSteps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="text-sm text-gray-600 flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    {step}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Section Summary</h3>
                  <p className="text-sm text-gray-600">{getSectionSummary('ocean')}</p>
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
                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Cultural Dimensions</h3>
                  <div className="w-full h-96 mb-12">
                    <RadarChart
                      data={{
                        'Power Distance': results.cultureScores?.powerDistance || 0,
                        'Individualism': results.cultureScores?.individualism || 0,
                        'Masculinity': results.cultureScores?.masculinity || 0,
                        'Uncertainty Avoidance': results.cultureScores?.uncertaintyAvoidance || 0,
                        'Long-term Orientation': results.cultureScores?.longTermOrientation || 0,
                        'Indulgence': results.cultureScores?.indulgence || 0
                      }}
                      size={500}
                    />
                  </div>
                </div>

                {/* Detailed Scores */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Detailed Scores</h3>
                  <div className="space-y-4">
                    {Object.entries(results.cultureScores || {}).map(([dimension, score]) => (
                      <div key={dimension} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{dimension.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <div className="relative">
                              <button
                                onClick={() => setActiveTooltip(activeTooltip === dimension ? null : dimension)}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                              >
                                <HelpCircle className="h-4 w-4" />
                              </button>
                              {activeTooltip === dimension && (
                                <div className="absolute z-50 mt-2 p-4 bg-white border border-gray-200 text-gray-800 text-sm rounded-lg shadow-xl max-w-xs">
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="font-semibold capitalize text-gray-900">{dimension.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <button
                                      onClick={() => setActiveTooltip(null)}
                                      className="text-gray-400 hover:text-gray-600 ml-2 text-lg font-bold"
                                    >
                                      ×
                                    </button>
                                  </div>
                                  <p className="leading-relaxed">{getTermTooltip(dimension)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge className={getScoreBadgeColor(score)}>
                            {getScoreLabel(score)} ({score})
                          </Badge>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Key Insights + AI Recommendations + Section Summary */}
              <div className="space-y-6">
                {/* Key Insights */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                  <ul className="space-y-2">
                    {(results.insights?.culture || []).map((insight, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">AI-Powered Recommendations</h3>
                  <div className="space-y-4">
                    {(results.recommendations?.culture?.recommendations || []).map((rec, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div 
                          className="p-4 bg-green-50 cursor-pointer hover:bg-green-100 transition-colors"
                          onClick={() => toggleRecommendation('culture', index)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-green-900">{rec.title}</h4>
                              <p className="text-sm text-green-700 mt-1">{rec.description}</p>
                            </div>
                            {expandedRecommendations[`culture-${index}`] ? (
                              <ChevronUp className="h-5 w-5 text-green-600" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                        </div>
                        
                        {expandedRecommendations[`culture-${index}`] && (
                          <div className="p-4 bg-white border-t border-gray-200">
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Next Steps:</h5>
                              <ul className="space-y-1">
                                {rec.nextSteps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="text-sm text-gray-600 flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    {step}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Section Summary</h3>
                  <p className="text-sm text-gray-600">{getSectionSummary('culture')}</p>
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
                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Work Values</h3>
                  <div className="w-full h-96 mb-12">
                    <RadarChart
                      data={{
                        'Innovation': results.valuesScores?.innovation || 0,
                        'Collaboration': results.valuesScores?.collaboration || 0,
                        'Autonomy': results.valuesScores?.autonomy || 0,
                        'Quality': results.valuesScores?.quality || 0,
                        'Customer Focus': results.valuesScores?.customerFocus || 0
                      }}
                      size={500}
                    />
                  </div>
                </div>

                {/* Detailed Scores */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Detailed Scores</h3>
                  <div className="space-y-4">
                    {Object.entries(results.valuesScores || {}).map(([value, score]) => (
                      <div key={value} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{value.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <div className="relative">
                              <button
                                onClick={() => setActiveTooltip(activeTooltip === value ? null : value)}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                              >
                                <HelpCircle className="h-4 w-4" />
                              </button>
                              {activeTooltip === value && (
                                <div className="absolute z-50 mt-2 p-4 bg-white border border-gray-200 text-gray-800 text-sm rounded-lg shadow-xl max-w-xs">
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="font-semibold capitalize text-gray-900">{value.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <button
                                      onClick={() => setActiveTooltip(null)}
                                      className="text-gray-400 hover:text-gray-600 ml-2 text-lg font-bold"
                                    >
                                      ×
                                    </button>
                                  </div>
                                  <p className="leading-relaxed">{getTermTooltip(value)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge className={getScoreBadgeColor(score)}>
                            {getScoreLabel(score)} ({score})
                          </Badge>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Key Insights + AI Recommendations + Section Summary */}
              <div className="space-y-6">
                {/* Key Insights */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                  <ul className="space-y-2">
                    {(results.insights?.values || []).map((insight, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">AI-Powered Recommendations</h3>
                  <div className="space-y-4">
                    {(results.recommendations?.values?.recommendations || []).map((rec, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div 
                          className="p-4 bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors"
                          onClick={() => toggleRecommendation('values', index)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-purple-900">{rec.title}</h4>
                              <p className="text-sm text-purple-700 mt-1">{rec.description}</p>
                            </div>
                            {expandedRecommendations[`values-${index}`] ? (
                              <ChevronUp className="h-5 w-5 text-purple-600" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-purple-600" />
                            )}
                          </div>
                        </div>
                        
                        {expandedRecommendations[`values-${index}`] && (
                          <div className="p-4 bg-white border-t border-gray-200">
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Next Steps:</h5>
                              <ul className="space-y-1">
                                {rec.nextSteps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="text-sm text-gray-600 flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                    {step}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Section Summary</h3>
                  <p className="text-sm text-gray-600">{getSectionSummary('values')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Call to Action */}
        <Card className="text-center">
          <CardContent className="pt-8">
            <div className="max-w-2xl mx-auto">
              {isCandidateAssessment ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Complete!</h2>
                  <p className="text-gray-600 mb-6">
                    Thank you for completing your cultural assessment! Your results have been sent to the hiring manager. 
                    They will review your profile and team compatibility, then contact you about next steps in the hiring process.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                      onClick={() => window.location.href = '/'}
                    >
                      Back to Home
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Share Your Results?</h2>
                  <p className="text-gray-600 mb-6">
                    Share your results with your team or save them for future reference. You can also take the assessment again to track your growth over time.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      className="bg-green-600 hover:bg-green-700 px-8 py-3"
                      onClick={() => setShowEmailModal(true)}
                    >
                      Email My Results
                    </Button>
                    <Button 
                      size="lg" 
                      className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                      onClick={() => window.location.href = '/'}
                    >
                      Back to Home
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="px-8 py-3"
                      onClick={() => window.location.href = '/assessment/start-assessment'}
                    >
                      Take Assessment Again
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Email Results Modal */}
      <EmailResultsModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        assessmentId={uuidString}
        resultsUrl={`${window.location.origin}/assessment/${uuidString}/results`}
        oceanScores={results.oceanScores || {}}
        cultureScores={results.cultureScores || {}}
        valuesScores={results.valuesScores || {}}
        insights={results.insights || { ocean: [], culture: [], values: [] }}
      />
    </div>
  );
}
