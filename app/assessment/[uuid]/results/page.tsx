'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import RadarChart from '@/components/RadarChart';
import { TermGlossary } from '@/components/TermExplanation';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Lightbulb, 
  Target, 
  Share2,
  Download,
  ArrowLeft,
  CheckCircle,
  Globe,
  Zap,
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface OCEANScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  [key: string]: number;
}

interface CultureScores {
  power_distance: number;
  individualism: number;
  masculinity: number;
  uncertainty_avoidance: number;
  long_term_orientation: number;
  indulgence: number;
  [key: string]: number;
}

interface ValuesScores {
  innovation: number;
  collaboration: number;
  autonomy: number;
  quality: number;
  customer_focus: number;
  [key: string]: number;
}

interface AssessmentResults {
  oceanScores: OCEANScores;
  cultureScores: CultureScores;
  valuesScores: ValuesScores;
  insights: {
    ocean: string[];
    culture: string[];
    values: string[];
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    category: string;
    section: string;
    context?: string;
    nextSteps?: string[];
  }>;
  completedAt: string;
}

export default function AssessmentResultsPage() {
  const params = useParams();
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGlossary, setShowGlossary] = useState(false);
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch(`/api/get-assessment-results?uuid=${params.uuid}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.results);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [params.uuid]);

  const toggleRecommendation = (index: number) => {
    const newExpanded = new Set(expandedRecommendations);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRecommendations(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Moderate';
    if (score >= 40) return 'Low';
    return 'Very Low';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'ocean': return Brain;
      case 'culture': return Globe;
      case 'values': return Target;
      default: return Zap;
    }
  };

  const getSectionContext = (section: string) => {
    switch (section) {
      case 'ocean':
        return "Based on your personality profile, we can see your natural strengths and work preferences. This helps identify roles and environments where you'll thrive.";
      case 'culture':
        return "Your cultural work preferences show how you prefer to interact with authority, work with others, and approach change. This is crucial for team dynamics.";
      case 'values':
        return "Your work values reveal what drives you and how you prefer to achieve goals. This helps align your work with what matters most to you.";
      default:
        return "";
    }
  };

  const getSectionSummary = (section: string) => {
    if (!results) return "";
    
    switch (section) {
      case 'ocean':
        const oceanScores = results.oceanScores;
        const highTraits = Object.entries(oceanScores).filter(([_, score]) => score >= 70).map(([trait, _]) => trait);
        const lowTraits = Object.entries(oceanScores).filter(([_, score]) => score <= 40).map(([trait, _]) => trait);
        
        if (highTraits.length > 0 && lowTraits.length > 0) {
          return `Your personality shows strong ${highTraits.join(', ')} traits, while ${lowTraits.join(', ')} are areas for potential growth. This combination suggests you're well-suited for roles that leverage your natural strengths while providing opportunities to develop in areas of lower preference.`;
        } else if (highTraits.length > 0) {
          return `Your personality profile shows strong ${highTraits.join(', ')} traits, indicating natural strengths in these areas. Focus on roles and environments that allow you to leverage these qualities effectively.`;
        } else {
          return "Your personality profile shows a balanced mix of traits, suggesting adaptability across different work environments and roles.";
        }
        
      case 'culture':
        const cultureScores = results.cultureScores;
        const highCulture = Object.entries(cultureScores).filter(([_, score]) => score >= 70).map(([trait, _]) => trait);
        const lowCulture = Object.entries(cultureScores).filter(([_, score]) => score <= 40).map(([trait, _]) => trait);
        
        if (highCulture.length > 0) {
          return `Your cultural preferences show strong ${highCulture.join(', ')} tendencies, indicating how you prefer to work and interact. Understanding these preferences helps you choose environments where you'll thrive and communicate effectively with diverse teams.`;
        } else {
          return "Your cultural preferences show a balanced approach, suggesting flexibility in different work environments and team dynamics.";
        }
        
      case 'values':
        const valuesScores = results.valuesScores;
        const highValues = Object.entries(valuesScores).filter(([_, score]) => score >= 70).map(([trait, _]) => trait);
        const lowValues = Object.entries(valuesScores).filter(([_, score]) => score <= 40).map(([trait, _]) => trait);
        
        if (highValues.length > 0) {
          return `Your work values prioritize ${highValues.join(', ')}, showing what drives you and how you prefer to achieve goals. Align your work choices with these values to maintain motivation and satisfaction.`;
        } else {
          return "Your work values show a balanced approach across different priorities, suggesting adaptability in various work contexts.";
        }
        
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Analyzing Your Results</h2>
            <p className="text-gray-500">We're processing your comprehensive assessment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Results Not Found</h2>
            <p className="text-gray-500 mb-4">We couldn't find your assessment results.</p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Comprehensive Assessment Results</h1>
          <p className="text-gray-600">Discover your complete work profile across personality, culture, and values</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Completed
            </Badge>
            <span className="text-sm text-gray-500">
              {new Date(results.completedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* OCEAN Personality Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Personality Profile (OCEAN)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(results.oceanScores).map(([trait, score]) => (
                  <div key={trait} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize text-gray-700">
                          {trait}
                        </span>
                        <Badge className={getScoreBadgeColor(score)}>
                          {getScoreLabel(score)}
                        </Badge>
                      </div>
                      <span className={`font-bold text-lg ${getScoreColor(score)}`}>
                        {score}%
                      </span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* OCEAN Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Personality Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.insights.ocean.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700 text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
                
                {/* Section Summary */}
                <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Key Takeaway:</h4>
                  <p className="text-blue-800 text-sm">{getSectionSummary('ocean')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Culture Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Cultural Work Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadarChart 
                  data={results.cultureScores} 
                  title="Hofstede Cultural Dimensions"
                  color="#10B981"
                />
              </CardContent>
            </Card>

            {/* Culture Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Cultural Work Style Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.insights.culture.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700 text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
                
                {/* Section Summary */}
                <div className="mt-6 p-4 bg-green-100 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Key Takeaway:</h4>
                  <p className="text-green-800 text-sm">{getSectionSummary('culture')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Team Values */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Team Values & Priorities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadarChart 
                  data={results.valuesScores} 
                  title="Work Values Profile"
                  color="#F59E0B"
                />
              </CardContent>
            </Card>

            {/* Values Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Work Values Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.insights.values.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700 text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
                
                {/* Section Summary */}
                <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Key Takeaway:</h4>
                  <p className="text-yellow-800 text-sm">{getSectionSummary('values')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Term Glossary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Understanding Your Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <button
                      onClick={() => setShowGlossary(!showGlossary)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {showGlossary ? 'Hide' : 'Show'} Term Definitions
                      {showGlossary ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {showGlossary && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          Personality Terms
                        </h4>
                        <TermGlossary category="ocean" />
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Cultural Terms
                        </h4>
                        <TermGlossary category="culture" />
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Values Terms
                        </h4>
                        <TermGlossary category="values" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {results.recommendations.map((rec, index) => {
                    const IconComponent = getSectionIcon(rec.section);
                    const isExpanded = expandedRecommendations.has(index);
                    return (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority.toUpperCase()}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <IconComponent className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{rec.category}</span>
                          </div>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-2">{rec.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                        
                        {/* Expandable Details */}
                        <button
                          onClick={() => toggleRecommendation(index)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mb-3"
                        >
                          {isExpanded ? 'Hide' : 'Show'} details
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                        
                        {isExpanded && (
                          <div className="space-y-3">
                            {/* Section Context */}
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-600 italic">
                                {getSectionContext(rec.section)}
                              </p>
                            </div>
                            
                            {/* Next Steps */}
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-gray-700">Next Steps:</p>
                              <ul className="space-y-1">
                                {rec.nextSteps ? rec.nextSteps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="flex items-start gap-2 text-xs text-gray-600">
                                    <ArrowRight className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span>{step}</span>
                                  </li>
                                )) : (
                                  <li className="flex items-start gap-2 text-xs text-gray-600">
                                    <ArrowRight className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span>Review this recommendation and consider how it applies to your current work situation</span>
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Results
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Join Team Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assessment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Personality Traits</span>
                    <span className="font-medium">5 dimensions</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cultural Dimensions</span>
                    <span className="font-medium">6 aspects</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Work Values</span>
                    <span className="font-medium">5 priorities</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Questions</span>
                    <span className="font-medium">42 questions</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
