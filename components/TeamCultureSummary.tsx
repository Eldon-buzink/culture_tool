'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface TeamCultureSummaryProps {
  insights: string[];
}

export default function TeamCultureSummary({ insights }: TeamCultureSummaryProps) {
  const getInsightType = (insight: string): 'positive' | 'warning' | 'info' => {
    const positiveKeywords = ['high', 'strong', 'good', 'excellent', 'great'];
    const warningKeywords = ['low', 'lower', 'consider', 'improve', 'stress'];
    
    const lowerInsight = insight.toLowerCase();
    
    if (positiveKeywords.some(keyword => lowerInsight.includes(keyword))) {
      return 'positive';
    } else if (warningKeywords.some(keyword => lowerInsight.includes(keyword))) {
      return 'warning';
    }
    
    return 'info';
  };

  const getIcon = (type: 'positive' | 'warning' | 'info') => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBadgeVariant = (type: 'positive' | 'warning' | 'info') => {
    switch (type) {
      case 'positive':
        return 'default' as const;
      case 'warning':
        return 'secondary' as const;
      case 'info':
        return 'outline' as const;
    }
  };

  return (
    <div className="space-y-4">
      {insights.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              No insights available yet. Complete the assessment to see your culture insights.
            </p>
          </CardContent>
        </Card>
      ) : (
        insights.map((insight, index) => {
          const type = getInsightType(insight);
          
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  {getIcon(type)}
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{insight}</p>
                    <Badge variant={getBadgeVariant(type)} className="mt-2">
                      {type.charAt(0).toUpperCase() + type.slice(1)} Insight
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
      
      {/* Summary Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {insights.filter(i => getInsightType(i) === 'positive').length}
              </p>
              <p className="text-xs text-muted-foreground">Strengths</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {insights.filter(i => getInsightType(i) === 'warning').length}
              </p>
              <p className="text-xs text-muted-foreground">Areas to Improve</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {insights.filter(i => getInsightType(i) === 'info').length}
              </p>
              <p className="text-xs text-muted-foreground">Observations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
