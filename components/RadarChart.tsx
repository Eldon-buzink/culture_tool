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

// Multi-line tick for long labels
const PolarTick: React.FC<any> = ({ x, y, payload }) => {
  const text = String(payload.value);
  const words = text.split(" ");
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 12 }}>
      {words.map((w: string, i: number) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 14}>
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
              <PolarGrid />
              <PolarAngleAxis dataKey="trait" tick={<PolarTick />} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar 
                name="You" 
                dataKey="score" 
                stroke={color}
                fill={color}
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip />
            </RechartsRadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
