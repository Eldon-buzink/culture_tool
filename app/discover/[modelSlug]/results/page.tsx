'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnergyResults } from '@/types/discovery';
import { getRelatedModels } from '@/lib/discovery/models';
import { ModelOption } from '@/types/discovery';
import { 
  Sparkles, 
  Lightbulb, 
  ArrowRight, 
  Zap, 
  TrendingUp,
  Target,
  Heart,
  Brain,
  Compass
} from 'lucide-react';
import Link from 'next/link';

export default function ModelResultsPage() {
  const params = useParams();
  const router = useRouter();
  const modelSlug = params.modelSlug as string;

  const [results, setResults] = useState<EnergyResults | null>(null);
  const [revealedInsights, setRevealedInsights] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load results from sessionStorage
    const storedResults = sessionStorage.getItem(`discovery-results-${modelSlug}`);
    if (storedResults) {
      try {
        const parsed = JSON.parse(storedResults);
        setResults(parsed);
        setIsLoading(false);
        
        // Progressive reveal: show insights one at a time
        setTimeout(() => setRevealedInsights(1), 500);
        setTimeout(() => setRevealedInsights(2), 1500);
        setTimeout(() => setRevealedInsights(3), 2500);
      } catch (error) {
        console.error('Error loading results:', error);
        setIsLoading(false);
      }
    } else {
      // No results found, redirect back
      router.push(`/discover/${modelSlug}`);
    }
  }, [modelSlug, router]);

  const relatedModels = getRelatedModels(modelSlug as any);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing your insights...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">No results found.</p>
            <Button onClick={() => router.push('/discover')}>
              Back to Explore
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Here's what we discovered
          </h1>
        </div>

        {/* Headline Insight */}
        <Card className="mb-8 shadow-lg border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 leading-relaxed">
                  {results.insights.headline}
                </h2>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What We Noticed - Progressive Reveal */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              What we noticed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.insights.noticed.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg bg-gray-50 border-l-4 border-indigo-500 transition-all duration-500 ${
                  revealedInsights > index
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                }`}
              >
                <p className="text-gray-700 leading-relaxed">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* What This Means for You */}
        {revealedInsights >= 2 && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                What this means for you
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.insights.meaning.map((meaning, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-blue-50 border border-blue-200"
                >
                  <p className="text-gray-700 leading-relaxed">{meaning}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* One Thing to Try */}
        {revealedInsights >= 3 && (
          <Card className="mb-8 shadow-lg border-green-200 bg-gradient-to-br from-white to-green-50/30">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                One thing to try
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-lg">
                {results.insights.action}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Explore More */}
        {revealedInsights >= 3 && (
          <div className="space-y-6">
            {/* Dive Deeper */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Dive deeper
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Explore more about your energy patterns
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Explore your full energy profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Learn about energy patterns
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Other Models */}
            {relatedModels.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Explore other areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    You might also like:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {relatedModels.slice(0, 4).map((option) => {
                      const icons: Record<string, any> = {
                        personal: Brain,
                        relationship: Heart,
                        work: Target,
                        growth: Zap,
                      };
                      const Icon = icons[option.category] || Compass;
                      
                      return (
                        <Link
                          key={option.slug}
                          href={`/discover/${option.slug}`}
                        >
                          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Icon className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm mb-1">
                                    {option.curiosity}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {option.outcome}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Back to Explore */}
            <div className="text-center">
              <Button
                onClick={() => router.push('/discover')}
                variant="outline"
                size="lg"
              >
                Explore more topics
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
