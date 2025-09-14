'use client';

import React from "react";
import {
  ResponsiveContainer,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";

type Item = {
  trait?: string;
  name?: string;
  score?: number;
  value?: number;
};

const getTrait = (d: Item) => (d.trait ?? d.name ?? "");
const getScore = (d: Item) => (typeof d.score === "number" ? d.score : (d.value ?? 0));

// Multi-line tick for long labels with more human styling
const PolarTick: React.FC<any> = ({ x, y, payload }) => {
  const text = String(payload.value);
  const words = text.split(" ");
  return (
    <text 
      x={x} 
      y={y} 
      textAnchor="middle" 
      dominantBaseline="central" 
      style={{ 
        fontSize: 13,
        fontWeight: 500,
        fill: '#374151',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {words.map((w: string, i: number) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 16}>
          {w}
        </tspan>
      ))}
    </text>
  );
};

interface RadarChartProps {
  data: Record<string, number>;
  title?: string;
  size?: number;
  color?: string;
}

export default function RadarChart({ data, title, size = 500, color = '#3B82F6' }: RadarChartProps) {
  // Convert data to Recharts format
  const chartData = Object.entries(data).map(([trait, score]) => ({
    trait: trait.charAt(0).toUpperCase() + trait.slice(1).replace(/([A-Z])/g, ' $1').trim(),
    score: score
  }));

  const safe = Array.isArray(chartData) && chartData.length > 0 ? chartData : [
    { trait: "Openness", score: 70 },
    { trait: "Conscientiousness", score: 55 },
    { trait: "Extraversion", score: 48 },
    { trait: "Agreeableness", score: 60 },
    { trait: "Neuroticism", score: 40 },
  ];

  // Recharts expects data keys; map to a uniform shape without mutating caller
  const mapped = safe.map(d => ({ trait: getTrait(d), score: getScore(d) }));

  return (
    <div className="rounded-2xl border bg-card text-card-foreground shadow-sm">
      <div className="p-6 overflow-visible">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="w-full h-[340px] overflow-visible">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsRadarChart data={mapped} margin={{ top: 24, right: 32, bottom: 36, left: 32 }}>
              <PolarGrid 
                stroke="#E5E7EB" 
                strokeWidth={1}
                opacity={0.3}
              />
              <PolarAngleAxis 
                dataKey="trait" 
                tick={<PolarTick />}
                axisLine={false}
                tickLine={false}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]}
                axisLine={false}
                tick={false}
                tickLine={false}
              />
              <Radar 
                name="You" 
                dataKey="score" 
                stroke={color}
                fill={color}
                fillOpacity={0.15}
                strokeWidth={3}
                dot={{ fill: color, strokeWidth: 0, r: 6 }}
                activeDot={{ r: 8, stroke: color, strokeWidth: 2, fill: '#fff' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '14px'
                }}
                formatter={(value, name) => [`${value}%`, 'Score']}
              />
            </RechartsRadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
