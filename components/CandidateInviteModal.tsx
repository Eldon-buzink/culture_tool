'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Mail, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Users,
  Target,
  Brain,
  Globe
} from 'lucide-react';

interface CandidateInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamCode: string;
  teamName: string;
}

interface Candidate {
  name: string;
  email: string;
  position: string;
  status: 'pending' | 'invited' | 'completed' | 'error';
  message?: string;
}

export default function CandidateInviteModal({ isOpen, onClose, teamCode, teamName }: CandidateInviteModalProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<Candidate>({
    name: '',
    email: '',
    position: '',
    status: 'pending'
  });
  const [emailError, setEmailError] = useState<string>('');

  const handleAddCandidate = () => {
    // Clear previous email error
    setEmailError('');
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentCandidate.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    if (currentCandidate.name && currentCandidate.email && currentCandidate.position) {
      setCandidates([...candidates, { ...currentCandidate, status: 'pending' }]);
      setCurrentCandidate({ name: '', email: '', position: '', status: 'pending' });
    }
  };

  const handleRemoveCandidate = (index: number) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const handleSendInvitations = async () => {
    if (candidates.length === 0) return;

    setIsSending(true);
    const updatedCandidates = [...candidates];

    try {
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        
        try {
          const invitationData = {
            candidateName: candidate.name,
            candidateEmail: candidate.email,
            candidatePosition: candidate.position,
            teamName: teamName,
            teamCode: teamCode,
            assessmentUrl: `${window.location.origin}/assessment/candidate/${teamCode}`
          };
          
          console.log('Sending candidate invitation data:', invitationData);
          
          const response = await fetch('/api/email/send-candidate-invitation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invitationData),
          });

          console.log(`Response status for ${candidate.email}:`, response.status);
          
          if (response.ok) {
            updatedCandidates[i].status = 'invited';
          } else {
            const errorText = await response.text();
            console.error(`HTTP error for ${candidate.email}:`, response.status, errorText);
            updatedCandidates[i].status = 'error';
            updatedCandidates[i].message = `HTTP ${response.status}: ${errorText}`;
          }
        } catch (error) {
          console.error(`Network error for ${candidate.email}:`, error);
          updatedCandidates[i].status = 'error';
          updatedCandidates[i].message = 'Network error';
        }
      }

      setCandidates(updatedCandidates);
      setInviteSent(true);
    } catch (error) {
      console.error('Error sending invitations:', error);
    } finally {
      setIsSending(false);
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/assessment/candidate/${teamCode}`;
    navigator.clipboard.writeText(inviteLink);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'invited': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Mail className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'invited': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'invited': return 'Invitation Sent';
      case 'error': return 'Failed';
      default: return 'Pending';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Potential New Hires
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Team Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">{teamName}</h3>
                <div className="text-sm text-blue-700">Team Code: <Badge variant="outline" className="font-mono">{teamCode}</Badge></div>
              </div>
            </div>
          </div>

          {/* Add Candidate Form */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Add Candidates</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add multiple candidates below. You can review and edit the list before sending invitations to all of them at once.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="candidate-name">Full Name *</Label>
                <Input
                  id="candidate-name"
                  placeholder="John Doe"
                  value={currentCandidate.name}
                  onChange={(e) => setCurrentCandidate({ ...currentCandidate, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="candidate-email">Email *</Label>
                <Input
                  id="candidate-email"
                  type="email"
                  placeholder="john.doe@company.com"
                  value={currentCandidate.email}
                  onChange={(e) => {
                    setCurrentCandidate({ ...currentCandidate, email: e.target.value });
                    // Clear error when user starts typing
                    if (emailError) setEmailError('');
                  }}
                  className={emailError ? 'border-red-500' : ''}
                />
                {emailError && (
                  <p className="text-sm text-red-600 mt-1">{emailError}</p>
                )}
              </div>
              <div>
                <Label htmlFor="candidate-position">Position *</Label>
                <Input
                  id="candidate-position"
                  placeholder="Software Engineer"
                  value={currentCandidate.position}
                  onChange={(e) => setCurrentCandidate({ ...currentCandidate, position: e.target.value })}
                />
              </div>
            </div>
            <Button 
              onClick={handleAddCandidate}
              disabled={!currentCandidate.name || !currentCandidate.email || !currentCandidate.position}
              className="w-full md:w-auto"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add to List
            </Button>
          </div>

          {/* Candidates List */}
          {candidates.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Candidates ({candidates.length})</h3>
              <div className="space-y-3">
                {candidates.map((candidate, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{candidate.name}</div>
                        <div className="text-sm text-gray-600">{candidate.email}</div>
                        <div className="text-sm text-gray-500">{candidate.position}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(candidate.status)} px-3 py-1`}>
                          {getStatusIcon(candidate.status)}
                          <span className="ml-1">{getStatusText(candidate.status)}</span>
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveCandidate(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    {candidate.message && (
                      <div className="text-sm text-red-600">{candidate.message}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assessment Benefits */}
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Target className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-900 mb-2">What Candidates Will Discover</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-indigo-700">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span>Personality Profile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Cultural Preferences</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>Work Values</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {candidates.length > 0 && (
              <Button 
                onClick={handleSendInvitations}
                disabled={isSending}
                className="flex-1"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Invitations...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitations ({candidates.length})
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" onClick={copyInviteLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Direct Link
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          {/* Success Message */}
          {inviteSent && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Invitations Sent Successfully!</p>
                  <p className="text-sm text-green-700">
                    Candidates will receive emails with assessment links. You can track their progress in the team dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
