'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Copy, 
  Mail, 
  Globe, 
  Target, 
  Brain,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export default function CreateTeamPage() {
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [emails, setEmails] = useState<string[]>(['']);
  const [isCreating, setIsCreating] = useState(false);
  const [teamCreated, setTeamCreated] = useState(false);
  const [teamCode, setTeamCode] = useState('');
  const [createdByName, setCreatedByName] = useState('');

  const handleAddEmail = () => {
    setEmails([...emails, '']);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleRemoveEmail = (index: number) => {
    if (emails.length > 1) {
      const newEmails = emails.filter((_, i) => i !== index);
      setEmails(newEmails);
    }
  };

  const handleCreateTeam = async () => {
    setIsCreating(true);
    
    try {
      // Create the team directly - the API will handle user creation
      const res = await fetch('/api/teams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teamName,
          description: teamDescription,
          memberEmails: emails.filter(email => email.trim() && email.includes('@'))
        }),
      });
      
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // 👇 show actual server error
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      
      console.log('Team created successfully:', data.team);
      setTeamCode(data.team.code);
      setTeamCreated(true);

      // Automatically send email invitations
      await sendEmailInvitations(data.team.code, data.team.name);

    } catch (e: any) {
      const errorMessage = e?.message || 'Failed to create team';
      console.error('Error creating team:', e);
      alert('Failed to create team: ' + errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const sendEmailInvitations = async (code: string, name: string) => {
    const validEmails = emails.filter(email => email.trim() && email.includes('@'));
    
    if (validEmails.length === 0) {
      console.log('No valid emails to send invitations to');
      return; // No emails to send
    }

    console.log('Sending email invitations to:', validEmails);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const email of validEmails) {
        try {
          console.log(`Sending invitation to: ${email}`);
          
          const invitationData = {
            recipientName: email.split('@')[0], // Use email prefix as name
            recipientEmail: email.trim(),
            teamName: name,
            teamCode: code,
            inviterName: createdByName || 'Team Leader',
            assessmentUrl: `${window.location.origin}/assessment/start-assessment?team=${code}`
          };
          
          console.log('Invitation data:', invitationData);

          const response = await fetch('/api/email/send-invitation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(invitationData),
          });

          console.log(`Response status for ${email}:`, response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP error for ${email}:`, response.status, errorText);
            errorCount++;
            continue;
          }

          const data = await response.json();
          console.log(`Response data for ${email}:`, data);
          
          if (data.success) {
            successCount++;
            console.log(`✅ Successfully sent invitation to ${email}`);
          } else {
            errorCount++;
            console.error(`Failed to send to ${email}:`, data.error);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error sending to ${email}:`, error);
        }
      }

      if (successCount > 0) {
        console.log(`✅ Successfully sent ${successCount} invitation${successCount > 1 ? 's' : ''}!`);
        if (errorCount > 0) {
          console.log(`❌ Failed to send ${errorCount} invitation${errorCount > 1 ? 's' : ''}.`);
        }
      } else {
        console.error(`❌ Failed to send any invitations. ${errorCount} errors occurred.`);
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/team/join/${teamCode}`;
    navigator.clipboard.writeText(inviteLink);
  };

  if (teamCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Created Successfully! 🎉</h1>
              <p className="text-gray-600 mb-6">
                Your team "{teamName}" is ready for the comprehensive assessment.
                {emails.filter(email => email.trim() && email.includes('@')).length > 0 && (
                  <span className="block mt-2 text-green-600">
                    ✅ Email invitations have been sent automatically to your team members!
                  </span>
                )}
              </p>
              
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Team Code</h3>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge variant="outline" className="text-lg font-mono px-4 py-2">
                    {teamCode}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={copyInviteLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
                <p className="text-sm text-blue-700">
                  Share this code or link with your team members to invite them to join the assessment.
                </p>
              </div>

              <div className="space-y-3">
                <Button className="w-full" onClick={() => window.location.href = `/team/${teamCode}/dashboard`}>
                  <Users className="h-4 w-4 mr-2" />
                  Go to Team Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={async () => {
                    const validEmails = emails.filter(email => email.trim() && email.includes('@'));
                    
                    if (validEmails.length === 0) {
                      alert('No valid email addresses to send invitations to.');
                      return;
                    }

                    const inviterName = prompt('Enter your name for the invitation:') || 'Team Leader';
                    
                    try {
                      let successCount = 0;
                      let errorCount = 0;

                      for (const email of validEmails) {
                        try {
                          const response = await fetch('/api/email/send-invitation', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              recipientName: email.split('@')[0], // Use email prefix as name
                              recipientEmail: email.trim(),
                              teamName: teamName,
                              teamCode: teamCode,
                              inviterName: inviterName,
                              assessmentUrl: `${window.location.origin}/assessment/start-assessment?team=${teamCode}`
                            }),
                          });

                          const data = await response.json();
                          
                          if (data.success) {
                            successCount++;
                          } else {
                            errorCount++;
                            console.error(`Failed to send to ${email}:`, data.error);
                          }
                        } catch (error) {
                          errorCount++;
                          console.error(`Error sending to ${email}:`, error);
                        }
                      }

                      if (successCount > 0) {
                        alert(`✅ Successfully resent ${successCount} invitation${successCount > 1 ? 's' : ''}!${errorCount > 0 ? `\n❌ Failed to send ${errorCount} invitation${errorCount > 1 ? 's' : ''}.` : ''}`);
                      } else {
                        alert(`❌ Failed to send any invitations. Please check your email configuration.`);
                      }
                    } catch (error) {
                      console.error('Error sending invitations:', error);
                      alert('❌ Failed to send invitations. Please try again.');
                    }
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Resend Email Invitations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Team Assessment</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Set up a comprehensive team assessment to understand your team's personality, culture, and values dynamics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Team Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Description
                  </label>
                  <textarea
                    placeholder="Describe your team's purpose or context (optional)"
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Created By *
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={createdByName}
                    onChange={(e) => setCreatedByName(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invite Team Members
                  </label>
                  <div className="space-y-3">
                    {emails.map((email, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="team.member@company.com"
                          value={email}
                          onChange={(e) => handleEmailChange(index, e.target.value)}
                          className="flex-1"
                        />
                        {emails.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveEmail(index)}
                            className="px-3"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={handleAddEmail}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Member
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleCreateTeam}
                  disabled={!teamName || !createdByName || isCreating}
                  className="w-full"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Team...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Create Team & Send Invitations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assessment Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Brain className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Personality Assessment</h4>
                      <p className="text-sm text-gray-600">OCEAN model for individual traits</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Globe className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Cultural Mapping</h4>
                      <p className="text-sm text-gray-600">Hofstede dimensions for work preferences</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Target className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Team Values</h4>
                      <p className="text-sm text-gray-600">Work values and priorities analysis</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Understand team dynamics and communication styles</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Identify potential conflicts and collaboration opportunities</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Optimize team processes and role assignments</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Improve team performance and satisfaction</span>
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
