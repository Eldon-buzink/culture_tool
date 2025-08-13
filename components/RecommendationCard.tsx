'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, Clock } from 'lucide-react';

interface RecommendationCardProps {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export default function RecommendationCard({
  title,
  description,
  priority,
}: RecommendationCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <TrendingUp className="h-4 w-4" />;
      case 'medium':
        return <Clock className="h-4 w-4" />;
      case 'low':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className={`border-2 ${getPriorityColor(priority)} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getPriorityIcon(priority)}
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          {getPriorityBadge(priority)}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          {description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Estimated impact: {priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Low'}
          </div>
          <Button variant="outline" size="sm">
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
