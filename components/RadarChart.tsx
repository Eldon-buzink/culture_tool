'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";

interface RadarChartProps {
  data: Record<string, number>;
  title?: string;
  size?: number;
  color?: string;
}

// Break long labels nicely on small widths (split on spaces)
const PolarTick: React.FC<any> = ({ x, y, payload }) => {
  const words = String(payload.value).split(" ");
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

export default function RadarChart({ data, title, size = 500, color = '#3B82F6' }: RadarChartProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Convert data to Recharts format
  const chartData = Object.entries(data).map(([trait, score]) => ({
    trait: trait.charAt(0).toUpperCase() + trait.slice(1).replace(/([A-Z])/g, ' $1').trim(),
    score: score
  }));


  // Fallback if no data
  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-gray-500">
        <p>No data available for radar chart</p>
      </div>
    );
  }

  // Show a simple chart representation during SSR
  if (!isClient) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-64 h-64 mx-auto mb-4 relative">
            <svg width="256" height="256" viewBox="0 0 256 256" className="w-full h-full">
              {/* Grid circles */}
              <circle cx="128" cy="128" r="20" fill="none" stroke="#E5E7EB" strokeWidth="1" opacity="0.5" />
              <circle cx="128" cy="128" r="40" fill="none" stroke="#E5E7EB" strokeWidth="1" opacity="0.5" />
              <circle cx="128" cy="128" r="60" fill="none" stroke="#E5E7EB" strokeWidth="1" opacity="0.5" />
              <circle cx="128" cy="128" r="80" fill="none" stroke="#E5E7EB" strokeWidth="1" opacity="0.5" />
              <circle cx="128" cy="128" r="100" fill="none" stroke="#E5E7EB" strokeWidth="1" opacity="0.5" />
              
              {/* Axis lines */}
              {chartData.map((_, index) => {
                const angle = (index * 2 * Math.PI) / chartData.length - Math.PI / 2;
                const x = 128 + Math.cos(angle) * 100;
                const y = 128 + Math.sin(angle) * 100;
                return (
                  <line
                    key={index}
                    x1="128"
                    y1="128"
                    x2={x}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                );
              })}
              
              {/* Data polygon */}
              <polygon
                points={chartData.map((item, index) => {
                  const angle = (index * 2 * Math.PI) / chartData.length - Math.PI / 2;
                  const value = item.score / 100;
                  const x = 128 + Math.cos(angle) * 100 * value;
                  const y = 128 + Math.sin(angle) * 100 * value;
                  return `${x},${y}`;
                }).join(' ')}
                fill={color}
                fillOpacity="0.2"
                stroke={color}
                strokeWidth="2"
              />
              
              {/* Data points */}
              {chartData.map((item, index) => {
                const angle = (index * 2 * Math.PI) / chartData.length - Math.PI / 2;
                const value = item.score / 100;
                const x = 128 + Math.cos(angle) * 100 * value;
                const y = 128 + Math.sin(angle) * 100 * value;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                  />
                );
              })}
              
              {/* Labels */}
              {chartData.map((item, index) => {
                const angle = (index * 2 * Math.PI) / chartData.length - Math.PI / 2;
                const x = 128 + Math.cos(angle) * 120;
                const y = 128 + Math.sin(angle) * 120;
                return (
                  <text
                    key={index}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-xs font-medium fill-gray-700"
                    style={{ fontSize: '10px' }}
                  >
                    {item.trait}
                  </text>
                );
              })}
            </svg>
          </div>
          <p className="text-sm text-gray-500">Interactive chart loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ minHeight: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart
          data={chartData}
          margin={{ top: 24, right: 32, bottom: 32, left: 32 }}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey="trait" tick={<PolarTick />} />
          <PolarRadiusAxis domain={[0, 100]} />
          <Radar
            name="Score"
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
  );
}
