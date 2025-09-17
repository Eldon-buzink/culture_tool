'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Brain, Users, Target, TrendingUp, TrendingDown, Minus, HelpCircle, Lightbulb, Award, AlertTriangle, Eye, ArrowRight, MessageCircle, Globe, Download } from 'lucide-react';
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // New state variables for hybrid sections
  const [expandedInsights, setExpandedInsights] = useState<Record<string, boolean>>({});
  const [expandedConversationStarters, setExpandedConversationStarters] = useState<Record<string, boolean>>({});
  
  const toggleRecommendation = (section: string, index: number) => {
    const key = `${section}-${index}`;
    setExpandedRecommendations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Toggle functions for hybrid sections
  const toggleInsight = (section: string, index: number) => {
    const key = `${section}-${index}`;
    setExpandedInsights(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleConversationStarter = (index: number) => {
    setExpandedConversationStarters(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Get the uuid string (handle array case)
  const uuidString = Array.isArray(uuid) ? uuid[0] : uuid;

  // Real assessment results - will be loaded from API
  const [results, setResults] = useState({
    oceanScores: {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0
    },
    cultureScores: {
      powerDistance: 0,
      individualism: 0,
      masculinity: 0,
      uncertaintyAvoidance: 0,
      longTermOrientation: 0,
      indulgence: 0
    },
    valuesScores: {
      innovation: 0,
      collaboration: 0,
      autonomy: 0,
      quality: 0,
      customerFocus: 0
    },
    insights: {
      ocean: [] as string[],
      culture: [] as string[],
      values: [] as string[]
    },
    recommendations: [] as any[]
  });

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Dynamically import the libraries
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;
      
      // Hide tooltips and interactive elements for PDF
      setActiveTooltip(null);
      
      // Create a clean version for PDF by temporarily hiding certain elements
      const elementsToHide = document.querySelectorAll('[data-html2canvas-ignore]');
      const originalDisplays: string[] = [];
      
      elementsToHide.forEach((el, index) => {
        originalDisplays[index] = (el as HTMLElement).style.display;
        (el as HTMLElement).style.display = 'none';
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pdfWidth - (margin * 2);
      const contentHeight = pdfHeight - (margin * 2) - 10; // Extra space for header/footer
      
      let currentY = margin + 5; // Start position accounting for header
      let isFirstPage = true;

      // Function to add header and footer
      const addHeaderFooter = (pageNum: number, totalPages: number) => {
        // Header
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text('Assessment Results', margin, 7);
        pdf.text(new Date().toLocaleDateString(), pdfWidth - 40, 7);
        
        // Footer
        pdf.text(`Page ${pageNum} of ${totalPages}`, pdfWidth / 2 - 15, pdfHeight - 3);
      };

      // Function to check if we need a new page and add one
      const checkNewPage = (elementHeight: number) => {
        if (currentY + elementHeight > pdfHeight - 15) { // 15mm from bottom for footer
          pdf.addPage();
          currentY = margin + 5;
          return true;
        }
        return false;
      };

      // Get sections to capture separately by ID
      const sectionIds = [
        'pdf-header-section',
        'pdf-ocean-section', 
        'pdf-cultural-section',
        'pdf-values-section',
        'pdf-summary-section'
      ];

      // Capture each section separately
      for (let i = 0; i < sectionIds.length; i++) {
        const sectionId = sectionIds[i];
        const element = document.getElementById(sectionId);
        
        if (!element) {
          console.log(`Section ${sectionId} not found, skipping`);
          continue;
        }

        // Capture this section
        const canvas = await html2canvas(element, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: element.scrollWidth,
          height: element.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if this section fits on current page
        const needsNewPage = checkNewPage(imgHeight);
        
        // For the first section or if we just added a new page, don't add extra space
        if (!isFirstPage && !needsNewPage) {
          currentY += 5; // Small gap between sections
        }

        // Add the section image
        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight;
        isFirstPage = false;
      }
      
      // Restore hidden elements
      elementsToHide.forEach((el, index) => {
        (el as HTMLElement).style.display = originalDisplays[index];
      });

      // Add headers and footers to all pages
      const pageCount = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        addHeaderFooter(i, pageCount);
      }
      
      // Save the PDF
      const fileName = `assessment-results-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

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
              console.error('No results found in database, trying localStorage fallback');
              // Try to generate results from localStorage as fallback
              const storageKey = `assessment-responses-${uuidString}`;
              const allResponses = localStorage.getItem(storageKey);
              
              if (allResponses) {
                const responses = JSON.parse(allResponses);
                console.log('Found responses in localStorage, generating results:', responses);
                
                // Calculate scores from actual responses
                const oceanScores = calculateOceanScores(responses.ocean || {});
                const cultureScores = calculateCultureScores(responses.ocean || {});
                const valuesScores = calculateValuesScores(responses.ocean || {});
                
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
          } else {
            console.error('Failed to fetch results from database, trying localStorage fallback');
            // Try to generate results from localStorage as fallback
            const storageKey = `assessment-responses-${uuidString}`;
            const allResponses = localStorage.getItem(storageKey);
            
            if (allResponses) {
              const responses = JSON.parse(allResponses);
              console.log('Found responses in localStorage, generating results:', responses);
              
              const oceanScores = calculateOceanScores(responses.ocean || {});
              const cultureScores = calculateCultureScores(responses.ocean || {});
              const valuesScores = calculateValuesScores(responses.ocean || {});
              
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
    const recommendations = [];
    
    // Generate recommendations based on scores

    if (ocean.openness > 70) {
      recommendations.push({
        text: "Seek roles that allow you to explore new ideas and work with diverse teams",
        trait: "Openness",
        score: ocean.openness
      });
    }
    
    if (ocean.conscientiousness > 70) {
      recommendations.push({
        text: "Look for opportunities to create structured processes and mentor others in organization",
        trait: "Conscientiousness",
        score: ocean.conscientiousness
      });
    }
    
    if (ocean.extraversion > 70) {
      recommendations.push({
        text: "Consider leadership roles or positions that involve client interaction and team collaboration",
        trait: "Extraversion",
        score: ocean.extraversion
      });
    }
    
    if (values.collaboration > 70) {
      recommendations.push({
        text: "Look for team-based projects and roles that emphasize collective success",
        trait: "Collaboration",
        score: values.collaboration
      });
    }
    
    if (culture.uncertaintyAvoidance < 30) {
      recommendations.push({
        text: "Consider roles in startups or dynamic environments where you can embrace change",
        trait: "Uncertainty Avoidance",
        score: culture.uncertaintyAvoidance
      });
    }
    
    // Default recommendations if no specific conditions are met
    if (recommendations.length === 0) {
      recommendations.push(
        {
          text: "Reflect on your strengths and seek opportunities that align with your values",
          trait: "Self-Development",
          score: 50
        },
        {
          text: "Consider how your unique combination of traits can benefit different types of teams",
          trait: "Team Dynamics",
          score: 50
        }
      );
    }
    
    return recommendations.slice(0, 4);
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 text-green-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreLabel = (trait: string, score: number) => {
    const descriptiveLabels: Record<string, Record<string, string>> = {
      // OCEAN traits
      openness: {
        high: 'Creative Explorer',
        moderate: 'Balanced Innovator', 
        low: 'Practical Realist'
      },
      conscientiousness: {
        high: 'Structured Achiever',
        moderate: 'Flexible Planner',
        low: 'Adaptive Performer'
      },
      extraversion: {
        high: 'People Energizer',
        moderate: 'Situational Connector',
        low: 'Thoughtful Observer'
      },
      agreeableness: {
        high: 'Team Harmonizer',
        moderate: 'Balanced Collaborator',
        low: 'Direct Challenger'
      },
      neuroticism: {
        high: 'Emotionally Aware',
        moderate: 'Resilient Realist',
        low: 'Steady Anchor'
      },
      // Cultural dimensions
      powerDistance: {
        high: 'Hierarchy Appreciator',
        moderate: 'Structure Balancer',
        low: 'Equality Advocate'
      },
      individualism: {
        high: 'Independent Achiever',
        moderate: 'Balanced Contributor',
        low: 'Team Collective'
      },
      masculinity: {
        high: 'Achievement Focused',
        moderate: 'Balanced Competitor',
        low: 'Relationship Focused'
      },
      uncertaintyAvoidance: {
        high: 'Structure Seeker',
        moderate: 'Adaptive Planner',
        low: 'Change Embracer'
      },
      longTermOrientation: {
        high: 'Future Strategist',
        moderate: 'Balanced Planner',
        low: 'Present Focused'
      },
      indulgence: {
        high: 'Life Enjoyer',
        moderate: 'Balanced Liver',
        low: 'Disciplined Restrainer'
      },
      // Work values
      innovation: {
        high: 'Creative Problem Solver',
        moderate: 'Practical Innovator',
        low: 'Proven Method Follower'
      },
      collaboration: {
        high: 'Team Player',
        moderate: 'Flexible Collaborator',
        low: 'Independent Worker'
      },
      autonomy: {
        high: 'Freedom Seeker',
        moderate: 'Guided Independent',
        low: 'Structure Preferrer'
      },
      quality: {
        high: 'Excellence Pursuer',
        moderate: 'Quality Balancer',
        low: 'Efficiency Focused'
      },
      customerFocus: {
        high: 'Customer Champion',
        moderate: 'Balanced Advocate',
        low: 'Process Focused'
      }
    };
    
    const level = score >= 70 ? 'high' : score >= 40 ? 'moderate' : 'low';
    return descriptiveLabels[trait]?.[level] || `${level.charAt(0).toUpperCase() + level.slice(1)} (${score})`;
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

  // Get explanation for style preferences (OCEAN traits)
  const getStyleExplanation = (trait: string, score: number) => {
    const traitKey = trait as keyof typeof meta;
    const band = score <= 35 ? 'lower' : score >= 65 ? 'higher' : 'balanced';
    const meta = {
      openness: {
        bands: {
          lower: { tagline: 'You prefer proven approaches over constant novelty.' },
          balanced: { tagline: 'You mix new ideas with practical guardrails.' },
          higher: { tagline: 'You are energized by new ideas and experiments.' }
        }
      },
      conscientiousness: {
        bands: {
          lower: { tagline: 'You thrive in flexible, dynamic environments.' },
          balanced: { tagline: 'You mix structure with flexibility as needed.' },
          higher: { tagline: 'You excel with clear structure and detailed planning.' }
        }
      },
      extraversion: {
        bands: {
          lower: { tagline: 'You thrive in focused, thoughtful environments.' },
          balanced: { tagline: 'You adapt your energy to the situation and people.' },
          higher: { tagline: 'You bring energy and enthusiasm to group dynamics.' }
        }
      },
      agreeableness: {
        bands: {
          lower: { tagline: 'You are comfortable with healthy conflict and direct feedback.' },
          balanced: { tagline: 'You mix cooperation with healthy assertiveness.' },
          higher: { tagline: 'You are naturally supportive and team-oriented.' }
        }
      },
      neuroticism: {
        bands: {
          lower: { tagline: 'You maintain calm and focus in challenging situations.' },
          balanced: { tagline: 'You balance optimism with realistic assessment of challenges.' },
          higher: { tagline: 'You are highly attuned to emotions and potential challenges.' }
        }
      }
    };
    
    if (!meta[traitKey]) return "No explanation available.";
    
    const bandInfo = meta[traitKey].bands[band as keyof typeof meta[typeof traitKey]['bands']];
    if (!bandInfo) return "No explanation available.";
    
    return bandInfo.tagline || "No explanation available.";
  };

  // Get explanation for work values and cultural dimensions
  const getValueExplanation = (value: string, score: number) => {
    const valueExplanations: Record<string, Record<string, string>> = {
      innovation: {
        lower: "You prefer proven methods and established processes over experimental approaches.",
        balanced: "You balance innovative thinking with practical implementation considerations.",
        higher: "You naturally seek creative solutions and embrace new approaches to challenges."
      },
      collaboration: {
        lower: "You work effectively independently and prefer clear individual responsibilities.",
        balanced: "You collaborate when needed while maintaining personal accountability.",
        higher: "You thrive in team environments and value collective decision-making."
      },
      autonomy: {
        lower: "You prefer clear guidance and structured work environments.",
        balanced: "You value both independence and team support as appropriate.",
        higher: "You excel when given freedom to determine your own approach and priorities."
      },
      quality: {
        lower: "You focus on efficiency and meeting core requirements effectively.",
        balanced: "You balance quality standards with practical delivery timelines.",
        higher: "You prioritize excellence and attention to detail in all work outputs."
      },
      customerFocus: {
        lower: "You focus on internal processes and technical excellence.",
        balanced: "You consider both customer needs and internal capabilities.",
        higher: "You strongly prioritize customer satisfaction and user experience."
      },
      powerDistance: {
        lower: "You prefer flat, egalitarian structures where all voices are valued equally.",
        balanced: "You adapt to different leadership styles while maintaining personal agency.",
        higher: "You are comfortable with hierarchical structures and clear authority lines."
      },
      individualism: {
        lower: "You value collective goals and team success over individual recognition.",
        balanced: "You balance personal achievement with team collaboration.",
        higher: "You strongly value personal achievement and individual recognition."
      },
      masculinity: {
        lower: "You value collaboration, support, and quality of life over competition.",
        balanced: "You balance competitive drive with collaborative approaches.",
        higher: "You value competition, achievement, and assertive approaches to work."
      },
      uncertaintyAvoidance: {
        lower: "You are comfortable with ambiguity and enjoy exploring new possibilities.",
        balanced: "You manage uncertainty by gathering information and planning adaptively.",
        higher: "You prefer clear rules, structured environments, and predictable outcomes."
      },
      longTermOrientation: {
        lower: "You focus on immediate results and short-term practical outcomes.",
        balanced: "You balance immediate needs with long-term strategic considerations.",
        higher: "You value long-term planning, sustainable growth, and future-oriented thinking."
      },
      indulgence: {
        lower: "You value self-restraint, discipline, and delayed gratification.",
        balanced: "You balance enjoyment of life with professional discipline and restraint.",
        higher: "You value enjoyment, leisure, and immediate gratification in work-life balance."
      }
    };

    const band = score <= 35 ? 'lower' : score >= 65 ? 'higher' : 'balanced';
    return valueExplanations[value]?.[band] || "No explanation available.";
  };

  // Dynamic content generation functions for Overall Summary
  const generateProfileSummary = () => {
    const oceanScores = results.oceanScores || {};
    const valuesScores = results.valuesScores || {};
    const cultureScores = results.cultureScores || {};
    
    // Find highest scoring traits across all categories
    const allScores = [
      ...Object.entries(oceanScores).map(([trait, score]) => ({ trait, score, category: 'personality' })),
      ...Object.entries(valuesScores).map(([trait, score]) => ({ trait, score, category: 'values' })),
      ...Object.entries(cultureScores).map(([trait, score]) => ({ trait, score, category: 'culture' }))
    ];
    
    const highScores = allScores.filter(item => item.score >= 70).sort((a, b) => b.score - a.score);
    const topTraits = highScores.slice(0, 3);
    
    // Generate profile summaries based on top traits
    const profiles = [];
    
    // Check for specific combinations and patterns
    if ((oceanScores.openness || 0) >= 70 && (oceanScores.extraversion || 0) >= 70) {
      profiles.push({
        title: "Creative & Social",
        description: "High openness and extraversion make you a natural innovator and team energizer",
        icon: "Brain"
      });
    } else if ((oceanScores.openness || 0) >= 70) {
      profiles.push({
        title: "Creative Innovator", 
        description: "Your high openness drives creative problem-solving and innovative thinking",
        icon: "Brain"
      });
    } else if ((oceanScores.extraversion || 0) >= 70) {
      profiles.push({
        title: "People Energizer",
        description: "Your extraversion brings energy and enthusiasm to group dynamics",
        icon: "Brain"
      });
    }
    
    if ((valuesScores.collaboration || 0) >= 70 || (cultureScores.powerDistance || 0) <= 30) {
      profiles.push({
        title: "Collaborative",
        description: "You thrive in team environments and value flat organizational structures",
        icon: "Users"
      });
    } else if ((valuesScores.autonomy || 0) >= 70 || (cultureScores.individualism || 0) >= 70) {
      profiles.push({
        title: "Independent",
        description: "You excel when given freedom and value personal achievement",
        icon: "Users"
      });
    }
    
    if ((valuesScores.quality || 0) >= 70 || (valuesScores.innovation || 0) >= 70) {
      profiles.push({
        title: "Quality-Focused",
        description: "You prioritize excellence and innovation in everything you do",
        icon: "Award"
      });
    } else if ((oceanScores.conscientiousness || 0) >= 70) {
      profiles.push({
        title: "Structured & Organized",
        description: "Your conscientiousness drives systematic approaches and attention to detail",
        icon: "Award"
      });
    }
    
    // Fill with default profiles if we don't have enough
    if (profiles.length < 3) {
      const defaults = [
        {
          title: "Adaptable",
          description: "You show balanced preferences across multiple dimensions",
          icon: "Target"
        },
        {
          title: "Thoughtful",
          description: "You take a measured approach to challenges and decisions",
          icon: "Brain"
        },
        {
          title: "Balanced",
          description: "You demonstrate flexibility across different work situations",
          icon: "Users"
        }
      ];
      
      for (const defaultProfile of defaults) {
        if (profiles.length < 3) {
          profiles.push(defaultProfile);
        }
      }
    }
    
    return profiles.slice(0, 3);
  };

  const generateKeyStrengths = () => {
    const oceanScores = results.oceanScores || {};
    const valuesScores = results.valuesScores || {};
    const cultureScores = results.cultureScores || {};
    
    const strengths = [];
    
    // OCEAN-based strengths
    if ((oceanScores.openness || 0) >= 70) {
      strengths.push("Creative problem-solving and innovation");
    }
    if ((oceanScores.extraversion || 0) >= 70) {
      strengths.push("Strong team collaboration and communication");
    }
    if ((oceanScores.conscientiousness || 0) >= 70) {
      strengths.push("Exceptional organization and attention to detail");
    }
    if ((oceanScores.agreeableness || 0) >= 70) {
      strengths.push("Natural empathy and relationship building");
    }
    if ((oceanScores.neuroticism || 0) <= 30) {
      strengths.push("Emotional stability and calm under pressure");
    }
    
    // Values-based strengths
    if ((valuesScores.innovation || 0) >= 70) {
      strengths.push("Driving creative solutions and new approaches");
    }
    if ((valuesScores.collaboration || 0) >= 70) {
      strengths.push("Building strong team partnerships");
    }
    if ((valuesScores.autonomy || 0) >= 70) {
      strengths.push("Self-direction and independent thinking");
    }
    if ((valuesScores.quality || 0) >= 70) {
      strengths.push("Commitment to excellence and high standards");
    }
    if ((valuesScores.customerFocus || 0) >= 70) {
      strengths.push("User-centered thinking and customer advocacy");
    }
    
    // Culture-based strengths
    if ((cultureScores.powerDistance || 0) <= 30) {
      strengths.push("Egalitarian leadership and inclusive collaboration");
    }
    if ((cultureScores.individualism || 0) >= 70) {
      strengths.push("Personal accountability and achievement drive");
    }
    if ((cultureScores.uncertaintyAvoidance || 0) <= 30) {
      strengths.push("Adaptability and comfort with ambiguity");
    }
    
    // Default strengths if none identified
    if (strengths.length === 0) {
      strengths.push(
        "Balanced approach to different work situations",
        "Adaptability across various team dynamics", 
        "Thoughtful decision-making process"
      );
    }
    
    return strengths.slice(0, 5);
  };

  const generateGrowthAreas = () => {
    const oceanScores = results.oceanScores || {};
    const valuesScores = results.valuesScores || {};
    const cultureScores = results.cultureScores || {};
    
    const growthAreas = [];
    
    // OCEAN-based growth areas (lower scores)
    if ((oceanScores.conscientiousness || 0) <= 30) {
      growthAreas.push("Time management and organizational systems");
    }
    if ((oceanScores.extraversion || 0) <= 30) {
      growthAreas.push("Networking and group presentation skills");
    }
    if ((oceanScores.openness || 0) <= 30) {
      growthAreas.push("Embracing change and new approaches");
    }
    if ((oceanScores.agreeableness || 0) <= 30) {
      growthAreas.push("Conflict resolution and diplomacy");
    }
    if ((oceanScores.neuroticism || 0) >= 70) {
      growthAreas.push("Stress management and emotional regulation");
    }
    
    // Values-based growth areas
    if ((valuesScores.collaboration || 0) <= 30) {
      growthAreas.push("Team collaboration and shared decision-making");
    }
    if ((valuesScores.innovation || 0) <= 30) {
      growthAreas.push("Creative thinking and exploring new solutions");
    }
    if ((valuesScores.customerFocus || 0) <= 30) {
      growthAreas.push("User perspective and customer empathy");
    }
    
    // Culture-based growth areas
    if ((cultureScores.uncertaintyAvoidance || 0) >= 70) {
      growthAreas.push("Flexibility and comfort with ambiguity");
    }
    
    // Default growth areas if none identified
    if (growthAreas.length === 0) {
      growthAreas.push(
        "Expanding comfort zone with new experiences",
        "Building diverse professional networks",
        "Developing cross-functional collaboration skills"
      );
    }
    
    return growthAreas.slice(0, 4);
  };

  const generatePersonalizedNextSteps = () => {
    const oceanScores = results.oceanScores || {};
    const valuesScores = results.valuesScores || {};
    const cultureScores = results.cultureScores || {};
    
    const thisWeekSteps = [];
    const thisMonthSteps = [];
    
    // Generate this week steps based on strengths
    if ((oceanScores.openness || 0) >= 70 && (oceanScores.extraversion || 0) >= 70) {
      thisWeekSteps.push("Research 3 companies with creative, collaborative cultures that match your high openness and extraversion");
    } else if ((oceanScores.openness || 0) >= 70) {
      thisWeekSteps.push("Research 3 companies known for innovation and creative problem-solving");
    } else if ((oceanScores.extraversion || 0) >= 70) {
      thisWeekSteps.push("Research 3 companies with strong team collaboration and social environments");
    }
    
    if ((valuesScores.innovation || 0) >= 70 && (valuesScores.collaboration || 0) >= 70) {
      thisWeekSteps.push("Identify 2 roles that combine innovation with team collaboration based on your work values");
    } else if ((valuesScores.innovation || 0) >= 70) {
      thisWeekSteps.push("Identify 2 roles in R&D, design, or innovation-focused positions");
    } else if ((valuesScores.collaboration || 0) >= 70) {
      thisWeekSteps.push("Identify 2 roles emphasizing team leadership and collaborative projects");
    }
    
    if ((cultureScores.powerDistance || 0) <= 30) {
      thisWeekSteps.push("Connect with 2 professionals in flat, merit-based organizations that align with your cultural preferences");
    } else if ((cultureScores.individualism || 0) >= 70) {
      thisWeekSteps.push("Connect with 2 professionals in performance-driven, merit-based environments");
    }
    
    // Generate this month steps
    if ((oceanScores.openness || 0) >= 70 || (valuesScores.innovation || 0) >= 70) {
      thisMonthSteps.push("Apply to 5 positions at companies that value both innovation and collaborative leadership");
    } else {
      thisMonthSteps.push("Apply to 5 positions that align with your top personality strengths");
    }
    
    if ((oceanScores.extraversion || 0) >= 70 || (valuesScores.collaboration || 0) >= 70) {
      thisMonthSteps.push("Join 2 professional groups focused on creative leadership and team dynamics");
    } else {
      thisMonthSteps.push("Join 2 professional groups related to your field and interests");
    }
    
    thisMonthSteps.push("Practice explaining how your personality strengths align with your target roles");
    
    // Fill with defaults if needed
    if (thisWeekSteps.length < 3) {
      const defaultWeekly = [
        "Update your resume to highlight personality strengths identified in this assessment",
        "Research companies that match your cultural and work value preferences",
        "Network with 2 professionals in your target industry"
      ];
      for (const step of defaultWeekly) {
        if (thisWeekSteps.length < 3 && !thisWeekSteps.includes(step)) {
          thisWeekSteps.push(step);
        }
      }
    }
    
    return {
      thisWeek: thisWeekSteps.slice(0, 3),
      thisMonth: thisMonthSteps.slice(0, 3)
    };
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
      <div id="assessment-results-content" className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div id="pdf-header-section" className="text-center mb-8 px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Your Personality Compass</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover your unique strengths, growth opportunities, and how you can thrive in teams
          </p>
        </div>

        {/* OCEAN Section */}
        <Card id="pdf-ocean-section" className="mb-8">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-8 gap-x-8 lg:gap-x-16 min-h-0">
              {/* Left Column: Radar Chart */}
              <div className="min-h-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Personality Dimensions</h3>
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

              {/* Right Column: Style Preferences */}
              <div className="min-w-0 lg:pl-4 xl:pl-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Style Preferences</h3>
                <div className="space-y-4">
                  {Object.entries(results.oceanScores || {}).map(([trait, score]) => (
                    <div key={trait} className="space-y-2">
                      <div className="space-y-2">
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
                                <div className="absolute z-50 mt-2 p-4 bg-white border border-gray-200 text-gray-800 text-sm rounded-lg shadow-xl max-w-sm" data-html2canvas-ignore="true">
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
                            {getScoreLabel(trait, score)} ({score})
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{getStyleExplanation(trait, score)}</p>
                        <Progress value={score} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* What This Means for You - Full Width Below */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-semibold mb-6 text-gray-900">What This Means for You</h3>
              
              {/* High Openness Card */}
              {(results.oceanScores?.openness || 0) >= 70 && (
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
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-xs">✓</span>
                              </div>
                              What to look for:
                            </h5>
                            <ul className="text-sm text-gray-700 space-y-2">
                              <li>• <strong>Creative fields</strong> like teaching, design, writing, or the arts</li>
                              <li>• <strong>Varied responsibilities</strong> where every day brings something different</li>
                              <li>• <strong>Problem-solving roles</strong> that challenge you to find new solutions</li>
                              <li>• <strong>Learning opportunities</strong> where you can continuously grow and explore</li>
                            </ul>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-xs">💡</span>
                              </div>
                              How to leverage this:
                            </h5>
                            <ul className="text-sm text-gray-700 space-y-2">
                              <li>• <strong>Volunteer for new projects</strong> that require creative thinking</li>
                              <li>• <strong>Share innovative ideas</strong> in team meetings and brainstorming sessions</li>
                              <li>• <strong>Seek out learning opportunities</strong> like workshops, courses, or conferences</li>
                              <li>• <strong>Connect with other creative professionals</strong> to expand your network</li>
                            </ul>
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>Remember:</strong> Your high openness is a valuable asset in today's rapidly changing world. 
                            Companies need people who can adapt, innovate, and think outside the box. Don't be afraid to 
                            showcase this strength in interviews and on your resume.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* High Extraversion Card */}
              {(results.oceanScores?.extraversion || 0) >= 70 && (
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
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-xs">✓</span>
                              </div>
                              What to look for:
                            </h5>
                            <ul className="text-sm text-gray-700 space-y-2">
                              <li>• <strong>Team-based roles</strong> where collaboration is essential</li>
                              <li>• <strong>Client-facing positions</strong> that involve regular interaction</li>
                              <li>• <strong>Leadership opportunities</strong> where you can motivate others</li>
                              <li>• <strong>Social work environments</strong> with open communication</li>
                            </ul>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-xs">💡</span>
                              </div>
                              How to leverage this:
                            </h5>
                            <ul className="text-sm text-gray-700 space-y-2">
                              <li>• <strong>Volunteer for presentations</strong> and public speaking opportunities</li>
                              <li>• <strong>Take on mentoring roles</strong> to help develop others</li>
                              <li>• <strong>Organize team events</strong> and social activities</li>
                              <li>• <strong>Build strong professional networks</strong> through networking events</li>
                            </ul>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <p className="text-sm text-green-800">
                            <strong>Remember:</strong> Your extraversion makes you a natural leader and team player. 
                            Companies value people who can energize teams and build relationships. Use this strength 
                            to stand out in group settings and take on roles that require strong interpersonal skills.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Low Neuroticism Card */}
              {(results.oceanScores?.neuroticism || 0) < 40 && (
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
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-xs">✓</span>
                              </div>
                              What to look for:
                            </h5>
                            <ul className="text-sm text-gray-700 space-y-2">
                              <li>• <strong>High-pressure roles</strong> where stability is crucial</li>
                              <li>• <strong>Crisis management positions</strong> that require level-headedness</li>
                              <li>• <strong>Leadership roles</strong> where you can provide calm guidance</li>
                              <li>• <strong>Project management</strong> where you can keep teams focused</li>
                            </ul>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-xs">💡</span>
                              </div>
                              How to leverage this:
                            </h5>
                            <ul className="text-sm text-gray-700 space-y-2">
                              <li>• <strong>Volunteer for challenging projects</strong> that others might avoid</li>
                              <li>• <strong>Take on crisis situations</strong> where your calmness is an asset</li>
                              <li>• <strong>Mentor stressed colleagues</strong> and help them stay focused</li>
                              <li>• <strong>Lead by example</strong> in maintaining work-life balance</li>
                            </ul>
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <p className="text-sm text-purple-800">
                            <strong>Remember:</strong> Your emotional stability is a rare and valuable trait in today's 
                            fast-paced work environment. Companies need people who can remain calm under pressure and 
                            help others stay focused. This makes you an ideal candidate for leadership and crisis management roles.
                          </p>
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
        <Card id="pdf-cultural-section" className="bg-white shadow-sm border border-gray-200 mb-8">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
                  Cultural Work Preferences
                </CardTitle>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {getSectionContext('culture')}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-8 gap-x-8 lg:gap-x-16 min-h-0">
              {/* Left Column: Radar Chart */}
              <div className="min-h-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Cultural Dimensions</h3>
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

              {/* Right Column: Style Preferences */}
              <div className="min-w-0 lg:pl-4 xl:pl-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Style Preferences</h3>
                <div className="space-y-4">
                  {Object.entries(results.cultureScores || {}).map(([dimension, score]) => (
                    <div key={dimension} className="space-y-2">
                      <div className="space-y-2">
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
                                <div className="absolute z-50 mt-2 p-4 bg-white border border-gray-200 text-gray-800 text-sm rounded-lg shadow-xl max-w-sm" data-html2canvas-ignore="true">
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
                            {getScoreLabel(dimension, score)} ({score})
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{getValueExplanation(dimension, score)}</p>
                        <Progress value={score} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* What This Means for You - Full Width Below */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-semibold mb-6 text-gray-900">What This Means for You</h3>
              
              {/* Low Power Distance Card */}
              {(results.cultureScores?.powerDistance || 0) < 40 && (
                <div className="border border-gray-200 rounded-lg mb-4">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                    onClick={() => toggleRecommendation("powerDistance", 0)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Low Power Distance - The Egalitarian Leader</h4>
                          <p className="text-sm text-gray-600">You prefer flat, egalitarian structures where all voices are valued equally</p>
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
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-xs">✓</span>
                              </div>
                              What to look for:
                            </h5>
                            <ul className="text-sm text-gray-700 space-y-2">
                              <li>• <strong>Startup environments</strong> with flat organizational structures</li>
                              <li>• <strong>Democratic leadership roles</strong> where input is valued from all levels</li>
                              <li>• <strong>Collaborative teams</strong> that emphasize shared decision-making</li>
                              <li>• <strong>Merit-based organizations</strong> where performance matters more than hierarchy</li>
                            </ul>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-xs">💡</span>
                              </div>
                              How to leverage this:
                            </h5>
                            <ul className="text-sm text-gray-700 space-y-2">
                              <li>• <strong>Encourage open communication</strong> and feedback from all team members</li>
                              <li>• <strong>Create inclusive meeting environments</strong> where everyone feels heard</li>
                              <li>• <strong>Mentor junior colleagues</strong> and help them develop their voices</li>
                              <li>• <strong>Advocate for transparent decision-making</strong> processes in your organization</li>
                            </ul>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <p className="text-sm text-green-800">
                            <strong>Remember:</strong> Your egalitarian approach is highly valued in modern, progressive organizations. 
                            Companies are increasingly moving toward flatter structures and collaborative leadership. 
                            This trait makes you an ideal candidate for roles that require inclusive leadership and team empowerment.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* High Individualism Card */}
              {(results.cultureScores?.individualism || 0) >= 70 && (
                <div className="border border-gray-200 rounded-lg mb-4">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                    onClick={() => toggleRecommendation("individualism", 0)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Award className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">High Individualism - The Independent Achiever</h4>
                          <p className="text-sm text-gray-600">You strongly value personal achievement and individual recognition</p>
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
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-xs">✓</span>
                              </div>
                              What to look for:
                            </h5>
                            <ul className="text-sm text-gray-700 space-y-2">
                              <li>• <strong>Performance-based roles</strong> where individual contributions are recognized</li>
                              <li>• <strong>Competitive environments</strong> that reward personal excellence</li>
                              <li>• <strong>Entrepreneurial opportunities</strong> where you can build something of your own</li>
                              <li>• <strong>Consulting positions</strong> where your expertise is the primary value</li>
                            </ul>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-xs">💡</span>
                              </div>
                              How to leverage this:
                            </h5>
                            <ul className="text-sm text-gray-700 space-y-2">
                              <li>• <strong>Track and document your achievements</strong> to build a strong personal brand</li>
                              <li>• <strong>Seek out challenging projects</strong> that showcase your individual skills</li>
                              <li>• <strong>Build a professional portfolio</strong> that highlights your unique contributions</li>
                              <li>• <strong>Network with other high achievers</strong> who share your drive for excellence</li>
                            </ul>
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>Remember:</strong> Your individualistic drive is a powerful asset in competitive markets. 
                            Companies value people who can take initiative and deliver exceptional results. 
                            This trait makes you an ideal candidate for roles that require self-motivation and personal excellence.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State Message when no cards are shown */}
              {!((results.cultureScores?.powerDistance || 0) < 40) && 
               !((results.cultureScores?.individualism || 0) >= 70) && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="h-6 w-6 text-gray-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Building Your Cultural Profile</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Your cultural preferences show a balanced approach across different dimensions. 
                      With just a few questions answered, we need more data points to provide specific insights.
                    </p>
                    <p className="text-xs text-gray-500">
                      As you complete more assessments or provide additional responses, we'll be able to offer more personalized cultural work recommendations.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Values Section */}
        <Card id="pdf-values-section" className="bg-white shadow-sm border border-gray-200 mb-8">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
                  Work Values Assessment
                </CardTitle>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {getSectionContext('values')}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-8 gap-x-8 lg:gap-x-16 min-h-0">
              {/* Left Column: Radar Chart */}
              <div className="min-h-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Work Values</h3>
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

              {/* Right Column: Style Preferences */}
              <div className="min-w-0 lg:pl-4 xl:pl-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Style Preferences</h3>
                <div className="space-y-4">
                  {Object.entries(results.valuesScores || {}).map(([value, score]) => (
                    <div key={value} className="space-y-2">
                      <div className="space-y-2">
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
                                <div className="absolute z-50 mt-2 p-4 bg-white border border-gray-200 text-gray-800 text-sm rounded-lg shadow-xl max-w-sm" data-html2canvas-ignore="true">
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
                            {getScoreLabel(value, score)} ({score})
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{getValueExplanation(value, score)}</p>
                        <Progress value={score} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* What This Means for You - Full Width Below */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-semibold mb-6 text-gray-900">What This Means for You</h3>
              
              {/* High Innovation Card */}
              {(results.valuesScores?.innovation || 0) >= 70 && (
                <div className="border border-gray-200 rounded-lg mb-4">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                    onClick={() => toggleRecommendation("innovation", 0)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <Lightbulb className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">High Innovation - The Creative Problem Solver</h4>
                          <p className="text-sm text-gray-600">You naturally seek creative solutions and embrace new approaches</p>
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
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-xs">✓</span>
                              </div>
                              What to look for:
                            </h5>
                            <ul className="text-sm text-gray-700 space-y-2">
                              <li>• <strong>R&D roles</strong> where you can develop new products or processes</li>
                              <li>• <strong>Startup environments</strong> that value creative problem-solving</li>
                              <li>• <strong>Design thinking positions</strong> that require innovative approaches</li>
                              <li>• <strong>Consulting roles</strong> where you can solve complex client challenges</li>
                            </ul>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-xs">💡</span>
                              </div>
                              How to leverage this:
                            </h5>
                            <ul className="text-sm text-gray-700 space-y-2">
                              <li>• <strong>Propose innovative solutions</strong> to existing problems in your current role</li>
                              <li>• <strong>Lead brainstorming sessions</strong> and creative workshops</li>
                              <li>• <strong>Stay updated on industry trends</strong> and emerging technologies</li>
                              <li>• <strong>Build a portfolio</strong> showcasing your creative problem-solving abilities</li>
                            </ul>
                          </div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                          <p className="text-sm text-orange-800">
                            <strong>Remember:</strong> Your innovation drive is highly valued in today's competitive market. 
                            Companies are constantly looking for people who can think differently and create breakthrough solutions. 
                            This trait makes you an ideal candidate for roles that require creative thinking and adaptability.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* High Collaboration Card */}
              {(results.valuesScores?.collaboration || 0) >= 70 && (
                <div className="border border-gray-200 rounded-lg mb-4">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                    onClick={() => toggleRecommendation("collaboration", 0)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">High Collaboration - The Team Player</h4>
                          <p className="text-sm text-gray-600">You thrive in team environments and value collective decision-making</p>
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
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-xs">✓</span>
                              </div>
                              What to look for:
                            </h5>
                            <ul className="text-sm text-gray-700 space-y-2">
                              <li>• <strong>Cross-functional teams</strong> where collaboration is essential</li>
                              <li>• <strong>Project management roles</strong> that require coordinating multiple stakeholders</li>
                              <li>• <strong>Community-focused organizations</strong> that value collective impact</li>
                              <li>• <strong>Partnership development</strong> roles that build external relationships</li>
                            </ul>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-xs">💡</span>
                              </div>
                              How to leverage this:
                            </h5>
                            <ul className="text-sm text-gray-700 space-y-2">
                              <li>• <strong>Volunteer for team projects</strong> and cross-departmental initiatives</li>
                              <li>• <strong>Facilitate team meetings</strong> and collaborative workshops</li>
                              <li>• <strong>Build strong relationships</strong> across different departments</li>
                              <li>• <strong>Mentor junior colleagues</strong> and help them integrate into teams</li>
                            </ul>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <p className="text-sm text-green-800">
                            <strong>Remember:</strong> Your collaborative nature is a key asset in today's interconnected workplace. 
                            Companies value team players who can build relationships and work effectively with others. 
                            This trait makes you an ideal candidate for leadership roles and team-based projects.
                          </p>
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
          <Card id="pdf-summary-section" className="mb-8">
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
                    {generateProfileSummary().map((profile, index) => (
                      <div key={index} className="text-center">
                        <div className={`w-16 h-16 ${
                          profile.icon === 'Brain' ? 'bg-blue-100' :
                          profile.icon === 'Users' ? 'bg-green-100' :
                          profile.icon === 'Award' ? 'bg-purple-100' :
                          'bg-indigo-100'
                        } rounded-full flex items-center justify-center mx-auto mb-3`}>
                          {profile.icon === 'Brain' && <Brain className="h-8 w-8 text-blue-600" />}
                          {profile.icon === 'Users' && <Users className="h-8 w-8 text-green-600" />}
                          {profile.icon === 'Award' && <Award className="h-8 w-8 text-purple-600" />}
                          {profile.icon === 'Target' && <Target className="h-8 w-8 text-indigo-600" />}
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {profile.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {profile.description}
                        </p>
                      </div>
                    ))}
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
                      {generateKeyStrengths().map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      Areas for Growth
                    </h4>
                    <ul className="space-y-2">
                      {generateGrowthAreas().map((area, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Reflection Questions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Reflection Questions</h4>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => toggleConversationStarter(0)}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-gray-700 font-medium">
                            How can you leverage your creative and social strengths in your current role?
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
                            This question helps you think about how your personality traits can be applied in your current work. Consider how your high openness and extraversion can be used to drive innovation, lead creative projects, or energize your team.
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
                            What type of work environment would best support your values and working style?
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
                            This question helps you think about the organizational culture, team dynamics, and physical environment that would allow you to thrive. Consider factors like autonomy, collaboration opportunities, and opportunities for individual contribution within team contexts.
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
                    {(() => {
                      const nextSteps = generatePersonalizedNextSteps();
                      return (
                        <>
                          {/* This Week */}
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">1</span>
                              </div>
                              <h5 className="font-semibold text-gray-900">This Week</h5>
                            </div>
                            <div className="space-y-3">
                              {nextSteps.thisWeek.map((step, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <div className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-indigo-600 text-xs">•</span>
                                  </div>
                                  <p className="text-sm text-gray-700">{step}</p>
                                </div>
                              ))}
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
                              {nextSteps.thisMonth.map((step, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-purple-600 text-xs">•</span>
                                  </div>
                                  <p className="text-sm text-gray-700">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    })()}
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
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="px-8 py-3 border-2"
                      onClick={generatePDF}
                      disabled={isGeneratingPDF}
                    >
                      {isGeneratingPDF ? (
                        <>
                          <LoadingSpinner className="w-4 h-4 mr-2" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </>
                      )}
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
                      variant="outline"
                      className="px-8 py-3 border-2"
                      onClick={generatePDF}
                      disabled={isGeneratingPDF}
                    >
                      {isGeneratingPDF ? (
                        <>
                          <LoadingSpinner className="w-4 h-4 mr-2" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </>
                      )}
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
