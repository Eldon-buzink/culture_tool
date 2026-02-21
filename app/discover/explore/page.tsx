'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MODEL_OPTIONS } from '@/lib/discovery/models';
import {
  Zap,
  Heart,
  Target,
  Brain,
  Compass,
  ArrowRight,
  Clock,
} from 'lucide-react';

const categoryIcons: Record<string, typeof Brain> = {
  personal: Brain,
  relationship: Heart,
  work: Target,
  growth: Zap,
};

const categoryColors: Record<string, string> = {
  personal: 'from-blue-500 to-blue-600',
  relationship: 'from-pink-500 to-rose-600',
  work: 'from-purple-500 to-purple-600',
  growth: 'from-green-500 to-green-600',
};

// Dedupe by slug so we show one card per model
const UNIQUE_BY_SLUG = Array.from(
  new Map(MODEL_OPTIONS.map((opt) => [opt.slug, opt])).values()
);

export default function DiscoverExplorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link
          href="/discover"
          className="inline-flex items-center text-gray-600 hover:text-indigo-600 mb-8"
        >
          ← Back to guided flow
        </Link>
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Explore all topics
          </h1>
          <p className="text-lg text-gray-600">
            Choose any topic to start. Each takes just a few minutes.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {UNIQUE_BY_SLUG.map((option) => {
            const Icon = categoryIcons[option.category] ?? Compass;
            const gradient = categoryColors[option.category] ?? 'from-indigo-500 to-purple-600';
            return (
              <Link
                key={option.slug}
                href={`/discover/${option.slug}`}
                className="group"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg cursor-pointer group-hover:scale-[1.02]">
                  <CardHeader className="pb-4">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
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
                      {option.description ?? option.outcome}
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
      </div>
    </div>
  );
}
