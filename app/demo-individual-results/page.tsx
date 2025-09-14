'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ContextBanner from "@/components/ContextBanner";
import { TraitCard } from "@/components/TraitCard";
import { RecList } from "@/components/RecList";
import { scoreToBand, traitMeta, Trait } from "@/lib/interpretation";
import { buildIndividualRecs } from "@/lib/recommendations";
import RadarChart from "@/components/RadarChart";

// Demo data - simulating a "Structure-first" profile (lower openness, higher conscientiousness)
const demoProfile = {
  openness: 25,      // Lower - Structure-first
  conscientiousness: 85, // Higher - Reliable planner
  extraversion: 45,  // Balanced - Situational connector
  agreeableness: 70, // Higher - Support-first collaborator
  neuroticism: 30    // Lower - Steady under pressure
};

const oceanData = {
  'Openness': demoProfile.openness,
  'Conscientiousness': demoProfile.conscientiousness,
  'Extraversion': demoProfile.extraversion,
  'Agreeableness': demoProfile.agreeableness,
  'Neuroticism': demoProfile.neuroticism
};

export default function DemoIndividualResultsPage() {
  const recommendations = buildIndividualRecs(demoProfile);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Assessment Results</h1>
          <p className="text-gray-600">Understanding your personality preferences and how to leverage them</p>
        </div>

        {/* Context Banner */}
        <ContextBanner />

        {/* OCEAN Scores Section */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Your Personality Profile</CardTitle>
            <p className="text-gray-600">Based on your responses, here's how you prefer to work and interact</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Radar Chart */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">OCEAN Scores</h3>
                <div className="h-80">
                  <RadarChart data={oceanData} />
                </div>
              </div>
              
              {/* Score Pills with Style Labels */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Your Style Preferences</h3>
                <div className="space-y-3">
                  {Object.entries(demoProfile).map(([trait, score]) => {
                    const traitKey = trait as Trait;
                    const band = scoreToBand(score);
                    const meta = traitMeta[traitKey].bands[band];
                    const bandColor = band === 'lower' ? 'bg-blue-100 text-blue-800' : 
                                    band === 'higher' ? 'bg-purple-100 text-purple-800' : 
                                    'bg-gray-100 text-gray-800';
                    
                    return (
                      <div key={trait} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{traitMeta[traitKey].label}</div>
                          <div className="text-sm text-gray-600">{meta.styleLabel}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={bandColor}>
                            {band === 'lower' ? 'Lower' : band === 'higher' ? 'Higher' : 'Balanced'}
                          </Badge>
                          <div className="text-2xl font-bold text-gray-900">{score}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trait Cards Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Understanding Your Traits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(demoProfile).map(([trait, score]) => {
              const traitKey = trait as Trait;
              const band = scoreToBand(score);
              const meta = traitMeta[traitKey].bands[band];
              
              return (
                <TraitCard 
                  key={trait} 
                  trait={traitMeta[traitKey].label} 
                  bandMeta={meta} 
                />
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Personalized Recommendations</h2>
          <RecList recs={recommendations} title="Actions to leverage your strengths" />
        </div>

        {/* Conversation Starters */}
        <Card className="rounded-2xl shadow-sm bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Conversation Starters</CardTitle>
            <p className="text-gray-600">Use these questions to discuss your results with your team or manager</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-700">
                  <strong>Where has your "Structure-first" approach been an advantage lately?</strong>
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-700">
                  <strong>What small agreement could the team make to better leverage your planning strengths?</strong>
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-700">
                  <strong>How can we create an environment where your reliability and attention to detail shine?</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
