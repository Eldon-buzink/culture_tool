"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadarInnerProps {
  data: Record<string, number>;
}

export default function RadarInner({ data }: RadarInnerProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    trait: key,
    value: value,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%" debounce={100}>
      <RadarChart 
        data={chartData}
        outerRadius="75%"
        margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
        cx="50%"
        cy="50%"
      >
        <PolarGrid 
          stroke="#e5e7eb" 
          strokeWidth={1}
          strokeDasharray="2 2"
        />
        <PolarAngleAxis 
          dataKey="trait" 
          tick={{ 
            fontSize: 12, 
            fill: '#6b7280',
            fontWeight: 500
          }}
          tickLine={false}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]} 
          tick={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            fontSize: '14px',
            fontWeight: '500'
          }}
          formatter={(value: number) => [`${value}%`, 'Score']}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#3B82F6"
          fill="#3B82F6"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ 
            fill: '#3B82F6', 
            strokeWidth: 2, 
            r: 4 
          }}
          activeDot={{ 
            r: 6, 
            fill: '#1d4ed8',
            stroke: '#ffffff',
            strokeWidth: 2
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
