import Link from 'next/link';
import { Brain, Users, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
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
            Unlock your team's potential with science-backed personality insights. 
            Understand how your brain works and build stronger, more effective teams.
          </p>
          <div className="flex items-center justify-center gap-4 mb-8">
            <Badge variant="secondary" className="text-sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              OCEAN Personality Framework
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Users className="h-3 w-3 mr-1" />
              Team Dynamics
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
                Create a team and invite members to take the OCEAN personality assessment. 
                Get insights into team dynamics, communication styles, and collaboration patterns.
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
                Discover your personality profile with our comprehensive OCEAN assessment. 
                Get personalized insights and recommendations for personal growth.
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

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Science-Based</h3>
            <p className="text-sm text-gray-600">
              Built on the proven OCEAN personality framework
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Team Focused</h3>
            <p className="text-sm text-gray-600">
              Understand team dynamics and collaboration patterns
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Actionable Insights</h3>
            <p className="text-sm text-gray-600">
              Get personalized recommendations for growth
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
