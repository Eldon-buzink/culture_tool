'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateTeam() {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/createTeam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: teamName,
          description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to team dashboard or show success message
        console.log('Team created:', data);
      }
    } catch (error) {
      console.error('Error creating team:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create New Team</CardTitle>
          <CardDescription>
            Set up a new team to start your culture assessment journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your team"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Team'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
