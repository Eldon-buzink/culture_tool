import Link from 'next/link';
import { Brain, Users, TrendingUp, ArrowRight, Sparkles, Target, Globe, Zap, Lightbulb, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Culture Mapping
            <Sparkles className="inline-block h-8 w-8 text-yellow-500 ml-2" />
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Unlock your team's potential with comprehensive personality insights, cultural preferences, and work values. 
            Get AI-powered recommendations to build stronger, more effective teams.
          </p>
          <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
            <Badge variant="secondary" className="text-sm">
              <Brain className="h-3 w-3 mr-1" />
              OCEAN Personality
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Globe className="h-3 w-3 mr-1" />
              Cultural Preferences
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Target className="h-3 w-3 mr-1" />
              Work Values
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Zap className="h-3 w-3 mr-1" />
              AI Insights
            </Badge>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Start Team Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6 leading-relaxed">
                Create a team and invite members to take comprehensive personality, cultural, and values assessments. 
                Get AI-powered insights into team dynamics, communication styles, collaboration patterns, and conflict prevention.
              </p>
              <Link href="/team/create">
                <Button size="lg" className="w-full group-hover:bg-blue-600 transition-colors">
                  Create Team
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Take Individual Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6 leading-relaxed">
                Discover your complete personality profile with our comprehensive OCEAN, cultural preferences, and work values assessments. 
                Get personalized AI insights and actionable recommendations for personal and professional growth.
              </p>
              <Link href="/assessment/start-assessment">
                <Button size="lg" variant="outline" className="w-full group-hover:bg-purple-50 transition-colors">
                  Start Assessment
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* See What You'll Get */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">See What You'll Get</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Get a preview of the comprehensive results, AI-powered insights, and personalized recommendations 
            you'll receive after completing your assessment.
          </p>
          <Link href="/demo-results">
            <Button size="lg" variant="outline" className="bg-white hover:bg-gray-50">
              <Brain className="h-5 w-5 mr-2" />
              View Sample Results
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Comprehensive Assessment Types */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Three Dimensions of Insight</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">OCEAN Personality</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Understand your core personality traits: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <p>• Communication preferences</p>
                  <p>• Work style insights</p>
                  <p>• Team collaboration patterns</p>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Cultural Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Discover your work environment preferences: power distance, individualism, uncertainty avoidance, and more.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <p>• Organizational structure fit</p>
                  <p>• Leadership style preferences</p>
                  <p>• Change management approach</p>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Work Values</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Identify what drives you professionally: innovation, collaboration, autonomy, quality, and customer focus.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <p>• Career motivation factors</p>
                  <p>• Job satisfaction drivers</p>
                  <p>• Professional growth areas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Science-Based</h3>
            <p className="text-sm text-gray-600">
              Built on proven psychological frameworks and research
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Team Insights</h3>
            <p className="text-sm text-gray-600">
              Understand team dynamics and collaboration patterns
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-600">
              Get personalized recommendations and insights
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Actionable</h3>
            <p className="text-sm text-gray-600">
              Practical steps for personal and team growth
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
