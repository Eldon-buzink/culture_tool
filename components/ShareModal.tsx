'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Share2, Copy, Mail, Link, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamCode: string;
  teamName: string;
}

export default function ShareModal({ isOpen, onClose, teamCode, teamName }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

      const shareUrl = `${window.location.origin}/assessment/start-assessment?team=${teamCode}`;
  const shareText = `Join my team "${teamName}" for a comprehensive assessment! Use code: ${teamCode}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareViaEmail = async () => {
    if (!email.trim()) return;
    
    setIsSending(true);
    try {
      const response = await fetch('/api/email/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientName: email.split('@')[0],
          recipientEmail: email.trim(),
          teamName: teamName,
          teamCode: teamCode,
          inviterName: 'Team Leader',
          assessmentUrl: shareUrl
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Invitation sent successfully!');
        setEmail('');
      } else {
        alert('Failed to send invitation. Please try again.');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const shareViaNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${teamName}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copying link
      copyToClipboard(shareUrl);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Team Assessment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Team Code Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Team Code</label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-lg px-3 py-2">
                {teamCode}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(teamCode)}
                className="flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Share Link Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Share Link</label>
            <div className="flex items-center gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(shareUrl)}
                className="flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Email Invitation Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Send Email Invitation</label>
            <div className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={shareViaEmail}
                disabled={!email.trim() || isSending}
                className="flex items-center gap-2"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Share Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Quick Share</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={shareViaNative}
                className="flex items-center gap-2 flex-1"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(shareText)}
                className="flex items-center gap-2 flex-1"
              >
                <Link className="h-4 w-4" />
                Copy Text
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              Share the team code or link with your team members. They can use either to join your assessment.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
