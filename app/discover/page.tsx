'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MODEL_OPTIONS } from '@/lib/discovery/models';
import { ModelOption } from '@/types/discovery';
import { 
  Zap, 
  Heart, 
  Users, 
  Target, 
  Brain, 
  Compass,
  ArrowRight,
  Clock
} from 'lucide-react';

const categoryIcons = {
  personal: Brain,
  relationship: Heart,
  work: Target,
  growth: Zap,
};

const categoryColors = {
  personal: 'from-blue-500 to-blue-600',
  relationship: 'from-pink-500 to-rose-600',
  work: 'from-purple-500 to-purple-600',
  growth: 'from-green-500 to-green-600',
};

export default function DiscoverPage() {
  // Group options by model slug to avoid duplicates
  const uniqueModels = Array.from(
    new Map(MODEL_OPTIONS.map(opt => [opt.slug, opt])).values()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            What would you like to explore?
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover more about yourself through personalized insights. 
            Choose what resonates with you—each journey takes just a few minutes.
          </p>
        </div>

        {/* Model Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {uniqueModels.map((option) => {
            const Icon = categoryIcons[option.category];
            const gradient = categoryColors[option.category];
            
            return (
              <Link 
                key={option.slug}
                href={`/discover/${option.slug}`}
                className="group"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg cursor-pointer group-hover:scale-105">
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                      {option.curiosity}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{option.timeEstimate}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {option.description || `${option.outcome}`}
                    </p>
                    <div className="flex items-center gap-2 text-indigo-600 font-medium group-hover:gap-3 transition-all">
                      <span>{option.outcome}</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Compass className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                How it works
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Choose a topic that interests you, answer a few questions, and get personalized insights. 
                After you see your results, you can explore deeper into that topic or try another area. 
                There's no right place to start—follow what calls to you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
