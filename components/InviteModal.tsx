'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, UserPlus, X, Check } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamCode: string;
  teamName: string;
}

interface Invitee {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'sending' | 'sent' | 'error';
}

export default function InviteModal({ isOpen, onClose, teamCode, teamName }: InviteModalProps) {
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const addInvitee = () => {
    if (!name.trim() || !email.trim()) return;
    
    const newInvitee: Invitee = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      status: 'pending'
    };
    
    setInvitees([...invitees, newInvitee]);
    setName('');
    setEmail('');
  };

  const removeInvitee = (id: string) => {
    setInvitees(invitees.filter(invitee => invitee.id !== id));
  };

  const sendInvitations = async () => {
    if (invitees.length === 0) return;
    
    setIsSending(true);
    const shareUrl = `${window.location.origin}/assessment/start-assessment?team=${teamCode}`;
    
    for (const invitee of invitees) {
      // Update status to sending
      setInvitees(prev => prev.map(inv => 
        inv.id === invitee.id ? { ...inv, status: 'sending' } : inv
      ));
      
      try {
        const response = await fetch('/api/email/send-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientName: invitee.name,
            recipientEmail: invitee.email,
            teamName: teamName,
            teamCode: teamCode,
            inviterName: 'Team Leader',
            assessmentUrl: shareUrl,
            customMessage: customMessage.trim() || undefined
          }),
        });

        const data = await response.json();
        
        // Update status based on response
        setInvitees(prev => prev.map(inv => 
          inv.id === invitee.id ? { 
            ...inv, 
            status: data.success ? 'sent' : 'error' 
          } : inv
        ));
        
        // Small delay between sends
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error('Error sending invitation:', error);
        setInvitees(prev => prev.map(inv => 
          inv.id === invitee.id ? { ...inv, status: 'error' } : inv
        ));
      }
    }
    
    setIsSending(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>;
      case 'sent':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sending':
        return 'Sending...';
      case 'sent':
        return 'Sent';
      case 'error':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Members
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Add Invitee Form */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </div>
            </div>
            <Button
              onClick={addInvitee}
              disabled={!name.trim() || !email.trim()}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add to Invite List
            </Button>
          </div>

          {/* Invite List */}
          {invitees.length > 0 && (
            <div className="space-y-2">
              <Label>Invite List ({invitees.length})</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {invitees.map((invitee) => (
                  <div
                    key={invitee.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{invitee.name}</div>
                      <div className="text-sm text-gray-500">{invitee.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invitee.status)}
                      <span className="text-xs text-gray-500">
                        {getStatusText(invitee.status)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInvitee(invitee.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a personal message to your invitation..."
              rows={3}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={sendInvitations}
            disabled={invitees.length === 0 || isSending}
            className="w-full"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending Invitations...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Invitations ({invitees.length})
              </>
            )}
          </Button>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              Invite team members to join your assessment. They'll receive an email with the team code and instructions.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
