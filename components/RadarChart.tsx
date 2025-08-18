'use client';

import React, { useState } from 'react';

interface RadarChartProps {
  data: Record<string, number>;
  title: string;
  size?: number;
  color?: string;
}

const termDefinitions = {
  // Culture terms
  power_distance: "Your comfort with hierarchy and authority in the workplace",
  individualism: "Preference for individual achievement vs. group success",
  masculinity: "Competitive vs. collaborative work preferences",
  uncertainty_avoidance: "Comfort with ambiguity and change",
  long_term_orientation: "Focus on future planning vs. immediate results",
  indulgence: "Work-life balance and gratification approach",
  
  // Values terms
  innovation: "Preference for new approaches vs. proven methods",
  collaboration: "Teamwork vs. individual achievement preference",
  autonomy: "Independence vs. structured guidance preference",
  quality: "Excellence vs. speed priority",
  customer_focus: "External vs. internal priorities orientation"
};

export default function RadarChart({ data, title, size = 400, color = '#3B82F6' }: RadarChartProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size * 0.22); // Further reduced radius to make more room for labels
  
  const labels = Object.keys(data);
  const values = Object.values(data);
  
  // Calculate points for the radar chart
  const points = labels.map((label, index) => {
    const angle = (index * 2 * Math.PI) / labels.length - Math.PI / 2;
    const value = values[index] / 100; // Normalize to 0-1
    const x = centerX + Math.cos(angle) * radius * value;
    const y = centerY + Math.sin(angle) * radius * value;
    return { x, y, label, value: values[index] };
  });

  // Create the polygon path
  const polygonPoints = points.map(point => `${point.x},${point.y}`).join(' ');

  // Create grid circles
  const gridCircles = [0.2, 0.4, 0.6, 0.8, 1.0].map((scale, index) => (
    <circle
      key={index}
      cx={centerX}
      cy={centerY}
      r={radius * scale}
      fill="none"
      stroke="#E5E7EB"
      strokeWidth="1"
      opacity="0.5"
    />
  ));

  // Create axis lines
  const axisLines = labels.map((label, index) => {
    const angle = (index * 2 * Math.PI) / labels.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    return (
      <line
        key={index}
        x1={centerX}
        y1={centerY}
        x2={x}
        y2={y}
        stroke="#E5E7EB"
        strokeWidth="1"
        opacity="0.5"
      />
    );
  });

  // Create labels with better positioning and text wrapping
  const labelElements = points.map((point, index) => {
    const angle = (index * 2 * Math.PI) / labels.length - Math.PI / 2;
    const labelRadius = radius + 60; // Increased radius for labels
    const x = centerX + Math.cos(angle) * labelRadius;
    const y = centerY + Math.sin(angle) * labelRadius;
    
    // Determine text anchor and alignment based on position
    let textAnchor = 'middle';
    let dominantBaseline = 'middle';
    
    if (Math.abs(Math.cos(angle)) > 0.7) {
      // Left or right side
      textAnchor = Math.cos(angle) > 0 ? 'start' : 'end';
      dominantBaseline = 'middle';
    } else if (Math.abs(Math.sin(angle)) > 0.7) {
      // Top or bottom
      textAnchor = 'middle';
      dominantBaseline = Math.sin(angle) > 0 ? 'hanging' : 'auto';
    }
    
    // Format label text with better spacing and handle long words
    const formatLabel = (label: string) => {
      const formatted = label.replace('_', ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      // For very long words, add line breaks
      if (formatted.length > 12) {
        const words = formatted.split(' ');
        if (words.length > 1) {
          const mid = Math.ceil(words.length / 2);
          return words.slice(0, mid).join(' ') + '\n' + words.slice(mid).join(' ');
        }
      }
      return formatted;
    };
    
    const labelText = formatLabel(point.label);
    const lines = labelText.split('\n');
    
    return (
      <g key={index}>
        {lines.map((line, lineIndex) => (
          <text
            key={lineIndex}
            x={x}
            y={y + (lineIndex - (lines.length - 1) / 2) * 16}
            textAnchor={textAnchor}
            dominantBaseline={dominantBaseline}
            className="text-xs font-medium fill-gray-600 cursor-help"
            style={{ fontSize: '13px' }}
            data-tooltip={termDefinitions[point.label as keyof typeof termDefinitions] || formatLabel(point.label)}
          >
            {line}
          </text>
        ))}
      </g>
    );
  });

  // Create value labels
  const valueLabels = points.map((point, index) => (
    <text
      key={`value-${index}`}
      x={point.x}
      y={point.y - 8}
      textAnchor="middle"
      dominantBaseline="middle"
      className="text-xs font-bold fill-gray-800"
      style={{ fontSize: '11px' }}
    >
      {point.value}%
    </text>
  ));

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{title}</h3>
      <div className="flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Grid circles */}
          {gridCircles}
          
          {/* Axis lines */}
          {axisLines}
          
          {/* Radar polygon */}
          <polygon
            points={polygonPoints}
            fill={color}
            fillOpacity="0.2"
            stroke={color}
            strokeWidth="2"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={color}
              stroke="white"
              strokeWidth="2"
            />
          ))}
          
          {/* Labels */}
          {labelElements}
          
          {/* Value labels */}
          {valueLabels}
        </svg>
      </div>
    </div>
  );
}
