'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  status: 'invited' | 'completed' | 'pending';
  completedAt?: string;
}

interface TeamStats {
  totalMembers: number;
  completedAssessments: number;
  averageScore: number;
  lastAssessment: string;
}

export default function TeamDashboard() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats>({
    totalMembers: 0,
    completedAssessments: 0,
    averageScore: 0,
    lastAssessment: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch team data
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockMembers: TeamMember[] = [
        { id: '1', name: 'John Doe', email: 'john@company.com', status: 'completed', completedAt: '2024-01-15' },
        { id: '2', name: 'Jane Smith', email: 'jane@company.com', status: 'completed', completedAt: '2024-01-14' },
        { id: '3', name: 'Bob Johnson', email: 'bob@company.com', status: 'pending' },
        { id: '4', name: 'Alice Brown', email: 'alice@company.com', status: 'invited' },
      ];

      const mockStats: TeamStats = {
        totalMembers: 4,
        completedAssessments: 2,
        averageScore: 75,
        lastAssessment: '2024-01-15',
      };

      setTeamMembers(mockMembers);
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'invited':
        return <Badge variant="outline">Invited</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Team Dashboard</h1>
        <div className="space-x-2">
          <Button asChild>
            <Link href="/team/invite">Invite Members</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/assessment/results">View Results</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAssessments}</div>
            <Progress value={(stats.completedAssessments / stats.totalMembers) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Assessment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lastAssessment}</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Track the progress of your team's culture assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(member.status)}
                  {member.completedAt && (
                    <span className="text-sm text-muted-foreground">
                      Completed {member.completedAt}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
