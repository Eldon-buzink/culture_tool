'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export default function InviteMembers() {
  const [emails, setEmails] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);

  const addEmail = () => {
    setEmails([...emails, '']);
  };

  const removeEmail = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const validEmails = emails.filter(email => email.trim() !== '');
    
    try {
      const response = await fetch('/api/inviteMember', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: validEmails,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Invitations sent:', data);
        setEmails(['']);
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Invite Team Members</CardTitle>
          <CardDescription>
            Invite your team members to participate in the culture assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email Addresses</Label>
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder="team.member@company.com"
                    required
                  />
                  {emails.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeEmail(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addEmail}
                className="w-full"
              >
                Add Another Email
              </Button>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending Invitations...' : 'Send Invitations'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
