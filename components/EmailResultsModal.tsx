'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, X, CheckCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface EmailResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentId: string;
  resultsUrl: string;
  oceanScores?: any;
  cultureScores?: any;
  valuesScores?: any;
  insights?: any;
}

export default function EmailResultsModal({
  isOpen,
  onClose,
  assessmentId,
  resultsUrl,
  oceanScores,
  cultureScores,
  valuesScores,
  insights
}: EmailResultsModalProps) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch('/api/email/send-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientName: recipientName || 'Assessment User',
          recipientEmail,
          assessmentId,
          resultsUrl,
          oceanScores,
          cultureScores,
          valuesScores,
          topInsights: insights,
          personalMessage
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsSent(true);
        } else {
          setError(data.error || 'Failed to send email');
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send email');
      }
    } catch (error) {
      setError('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      setRecipientName('');
      setRecipientEmail('');
      setPersonalMessage('');
      setError(null);
      setIsSent(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  if (isSent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Results Ready!</h2>
              <p className="text-gray-600 mb-4">
                Your assessment results are available at the link below. You can share this link with others or bookmark it for future reference.
              </p>
              <div className="bg-gray-100 p-3 rounded-md mb-4">
                <p className="text-sm text-gray-700 break-all">
                  {resultsUrl}
                </p>
              </div>
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Your Results
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSending}
              className="p-0 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="recipientName">Recipient Name</Label>
              <Input
                id="recipientName"
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Enter recipient name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="recipientEmail">Email Address *</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="recipient@example.com"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="personalMessage">Personal Message (Optional)</Label>
              <Textarea
                id="personalMessage"
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                placeholder="Add a personal message to your results..."
                rows={3}
                className="mt-1"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleClose}
                disabled={isSending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isSending || !recipientEmail}
              >
                {isSending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Results
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
