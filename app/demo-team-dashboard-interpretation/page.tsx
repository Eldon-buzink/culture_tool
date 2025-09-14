'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ContextBanner from "@/components/ContextBanner";
import { RecList } from "@/components/RecList";
import { getTeamLens, getTeamStrengthsAndWatchouts, buildTeamAgreements } from "@/lib/recommendations";
import TeamRadarChart from "@/components/TeamRadarChart";
import LoadingSpinner from "@/components/LoadingSpinner";

// Demo team data - showing a mixed team profile
const demoTeamProfiles = [
  { openness: 25, conscientiousness: 85, extraversion: 45, agreeableness: 70, neuroticism: 30 }, // Structure-first planner
  { openness: 80, conscientiousness: 40, extraversion: 75, agreeableness: 60, neuroticism: 45 }, // Frontier-seeker connector
  { openness: 50, conscientiousness: 70, extraversion: 35, agreeableness: 85, neuroticism: 55 }, // Balanced organizer supporter
  { openness: 60, conscientiousness: 60, extraversion: 65, agreeableness: 45, neuroticism: 40 }, // Pragmatic explorer challenger
];

const demoTeamData = {
  teamName: "Product Innovation Team",
  teamCode: "INNOV8",
  createdAt: "2024-01-15T10:30:00Z",
  memberCount: 4,
  completedAssessments: 4
};

// Calculate team averages for the radar chart
const teamAverages = {
  openness: Math.round(demoTeamProfiles.reduce((sum, profile) => sum + profile.openness, 0) / demoTeamProfiles.length),
  conscientiousness: Math.round(demoTeamProfiles.reduce((sum, profile) => sum + profile.conscientiousness, 0) / demoTeamProfiles.length),
  extraversion: Math.round(demoTeamProfiles.reduce((sum, profile) => sum + profile.extraversion, 0) / demoTeamProfiles.length),
  agreeableness: Math.round(demoTeamProfiles.reduce((sum, profile) => sum + profile.agreeableness, 0) / demoTeamProfiles.length),
  neuroticism: Math.round(demoTeamProfiles.reduce((sum, profile) => sum + profile.neuroticism, 0) / demoTeamProfiles.length)
};

export default function DemoTeamDashboardInterpretationPage() {
  const teamLens = getTeamLens(demoTeamProfiles);
  const { strengths, watchouts } = getTeamStrengthsAndWatchouts(demoTeamProfiles);
  const teamAgreements = buildTeamAgreements(demoTeamProfiles);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">{demoTeamData.teamName}</h1>
          <p className="text-gray-600">Team Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{demoTeamData.teamCode}</span></p>
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span>{demoTeamData.memberCount} members</span>
            <span>•</span>
            <span>{demoTeamData.completedAssessments} completed assessments</span>
            <span>•</span>
            <span>Created {new Date(demoTeamData.createdAt).toLocaleDateString('en-US')}</span>
          </div>
        </div>

        {/* Context Banner */}
        <ContextBanner />

        {/* Team Overview */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Team Lens */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Team Lens</CardTitle>
              <p className="text-gray-600">How your team tends to approach work</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {teamLens.map(({ trait, label, band }) => {
                const bandColor = band === 'lower' ? 'bg-blue-100 text-blue-800' : 
                                band === 'higher' ? 'bg-purple-100 text-purple-800' : 
                                'bg-gray-100 text-gray-800';
                
                return (
                  <div key={trait} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{trait}</div>
                    <Badge className={bandColor}>{label}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Where This Shines */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                🌟 Where This Shines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Friction Risks */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                ⚠️ Friction Risks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {watchouts.map((watchout, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-600 mt-1">⚠</span>
                    <span className="text-gray-700">{watchout}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Team Radar Chart */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Team Personality Profile</CardTitle>
            <p className="text-gray-600">Distribution of personality traits across your team</p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <TeamRadarChart data={teamAverages} />
            </div>
          </CardContent>
        </Card>

        {/* Working Agreements */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Team Working Agreements</CardTitle>
            <p className="text-gray-600">Suggested agreements to help your team work better together</p>
          </CardHeader>
          <CardContent>
            <RecList recs={teamAgreements} title="Recommended team practices" />
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Team Members</CardTitle>
            <p className="text-gray-600">Individual styles and how they contribute to the team</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {demoTeamProfiles.map((profile, index) => {
                const memberName = ['Sarah Chen', 'Alex Rodriguez', 'Jordan Kim', 'Taylor Smith'][index];
                const memberRole = ['Product Manager', 'UX Designer', 'Customer Success', 'Engineering Lead'][index];
                
                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-900">{memberName}</div>
                        <div className="text-sm text-gray-600">{memberRole}</div>
                      </div>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Openness:</span>
                        <span className="font-medium">{profile.openness}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Conscientiousness:</span>
                        <span className="font-medium">{profile.conscientiousness}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Extraversion:</span>
                        <span className="font-medium">{profile.extraversion}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Conversation Starters */}
        <Card className="rounded-2xl shadow-sm bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Team Conversation Starters</CardTitle>
            <p className="text-gray-600">Use these questions to discuss your team dynamics and working styles</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-700">
                    <strong>How can we leverage our "Structure-first" and "Frontier-seeker" mix for better innovation?</strong>
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-700">
                    <strong>What working agreements would help us avoid the friction risks we identified?</strong>
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-700">
                    <strong>Where has our team's diversity of styles been an advantage recently?</strong>
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-700">
                    <strong>How can we create space for both structured planning and creative exploration?</strong>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
