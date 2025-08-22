'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, User, X, Check, AlertCircle } from 'lucide-react';

interface EmailResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentId: string;
  resultsUrl: string;
  oceanScores: any;
  cultureScores: any;
  valuesScores: any;
  topInsights: string[];
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'sending' | 'sent' | 'error';
}

export default function EmailResultsModal({ 
  isOpen, 
  onClose, 
  assessmentId, 
  resultsUrl, 
  oceanScores, 
  cultureScores, 
  valuesScores, 
  topInsights 
}: EmailResultsModalProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const addRecipient = () => {
    if (!name.trim() || !email.trim()) return;
    
    const newRecipient: Recipient = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      status: 'pending'
    };
    
    setRecipients([...recipients, newRecipient]);
    setName('');
    setEmail('');
  };

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(recipient => recipient.id !== id));
  };

  const sendResults = async () => {
    if (recipients.length === 0) return;
    
    setIsSending(true);
    
    for (const recipient of recipients) {
      // Update status to sending
      setRecipients(prev => prev.map(rec => 
        rec.id === recipient.id ? { ...rec, status: 'sending' } : rec
      ));
      
      try {
        const response = await fetch('/api/email/send-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientName: recipient.name,
            recipientEmail: recipient.email,
            assessmentId: assessmentId,
            resultsUrl: resultsUrl,
            oceanScores: oceanScores,
            cultureScores: cultureScores,
            valuesScores: valuesScores,
            topInsights: topInsights,
            customMessage: customMessage.trim() || undefined
          }),
        });

        const data = await response.json();
        
        // Update status based on response
        setRecipients(prev => prev.map(rec => 
          rec.id === recipient.id ? { 
            ...rec, 
            status: data.success ? 'sent' : 'error' 
          } : rec
        ));
        
        // Small delay between sends
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error('Error sending results:', error);
        setRecipients(prev => prev.map(rec => 
          rec.id === recipient.id ? { ...rec, status: 'error' } : rec
        ));
      }
    }
    
    setIsSending(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />;
      case 'sent':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Assessment Results
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Recipients */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Add Recipients</h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Recipient's name"
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={addRecipient}
                  disabled={!name.trim() || !email.trim()}
                  className="px-4"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Recipients List */}
          {recipients.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Recipients ({recipients.length})</h3>
              <div className="space-y-2">
                {recipients.map((recipient) => (
                  <div key={recipient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{recipient.name}</p>
                        <p className="text-sm text-gray-600">{recipient.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        {getStatusIcon(recipient.status)}
                        <span className={`
                          ${recipient.status === 'sent' ? 'text-green-600' : ''}
                          ${recipient.status === 'error' ? 'text-red-600' : ''}
                          ${recipient.status === 'sending' ? 'text-blue-600' : ''}
                          ${recipient.status === 'pending' ? 'text-gray-500' : ''}
                        `}>
                          {getStatusText(recipient.status)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRecipient(recipient.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Message */}
          <div className="space-y-3">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a personal message to include with your results..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={sendResults}
              disabled={recipients.length === 0 || isSending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSending ? 'Sending...' : `Send to ${recipients.length} Recipient${recipients.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
