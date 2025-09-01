'use client';

import React from 'react';

interface ComparisonRadarChartProps {
  candidateData: Record<string, number>;
  teamData: Record<string, number>;
  title?: string;
  size?: number;
  candidateColor?: string;
  teamColor?: string;
}

export default function ComparisonRadarChart({ 
  candidateData, 
  teamData, 
  title, 
  size = 360, 
  candidateColor = '#3B82F6',
  teamColor = '#10B981'
}: ComparisonRadarChartProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  // Fill space more effectively while leaving room for labels
  const radius = Math.max(80, size / 2 - 60);
  
  const labels = Object.keys(candidateData);
  const candidateValues = Object.values(candidateData);
  const teamValues = Object.values(teamData);
  
  // Calculate points for both datasets
  const candidatePoints = labels.map((label, index) => {
    const angle = (index * 2 * Math.PI) / labels.length - Math.PI / 2;
    const value = candidateValues[index] / 100;
    const x = centerX + Math.cos(angle) * radius * value;
    const y = centerY + Math.sin(angle) * radius * value;
    return { x, y, label, value: candidateValues[index] };
  });

  const teamPoints = labels.map((label, index) => {
    const angle = (index * 2 * Math.PI) / labels.length - Math.PI / 2;
    const value = teamValues[index] / 100;
    const x = centerX + Math.cos(angle) * radius * value;
    const y = centerY + Math.sin(angle) * radius * value;
    return { x, y, label, value: teamValues[index] };
  });

  // Create polygon paths
  const candidatePolygonPoints = candidatePoints.map(point => `${point.x},${point.y}`).join(' ');
  const teamPolygonPoints = teamPoints.map(point => `${point.x},${point.y}`).join(' ');

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

  // Create labels
  const labelElements = candidatePoints.map((point, index) => {
    const angle = (index * 2 * Math.PI) / labels.length - Math.PI / 2;
    const labelRadius = radius + 30;
    const x = centerX + Math.cos(angle) * labelRadius;
    const y = centerY + Math.sin(angle) * labelRadius;
    
    let textAnchor: 'start' | 'middle' | 'end' | 'inherit' | undefined = 'middle';
    let dominantBaseline:
      | 'alphabetic'
      | 'hanging'
      | 'ideographic'
      | 'mathematical'
      | 'middle'
      | 'auto'
      | 'inherit'
      | 'use-script'
      | 'no-change'
      | 'reset-size'
      | 'central'
      | 'text-after-edge'
      | 'text-before-edge'
      | undefined = 'middle';
    
    if (Math.abs(Math.cos(angle)) > 0.7) {
      textAnchor = Math.cos(angle) > 0 ? 'start' : 'end';
      dominantBaseline = 'middle';
    } else if (Math.abs(Math.sin(angle)) > 0.7) {
      textAnchor = 'middle';
      dominantBaseline = Math.sin(angle) > 0 ? 'hanging' : 'auto';
    }

    // Format label text
    const formatted = point.label.replace(/([A-Z])/g, ' $1').trim();
    const words = formatted.split(' ');
    const maxLength = 8;
    
    if (words.length > 1 && formatted.length > maxLength) {
      return (
        <g key={index}>
          <text
            x={x}
            y={y - 8}
            textAnchor={textAnchor}
            dominantBaseline={dominantBaseline}
            fontSize="12px"
            fill="#374151"
            fontWeight="500"
          >
            {words[0]}
          </text>
          <text
            x={x}
            y={y + 8}
            textAnchor={textAnchor}
            dominantBaseline={dominantBaseline}
            fontSize="12px"
            fill="#374151"
            fontWeight="500"
          >
            {words.slice(1).join(' ')}
          </text>
        </g>
      );
    }

    return (
      <text
        key={index}
        x={x}
        y={y}
        textAnchor={textAnchor}
        dominantBaseline={dominantBaseline}
        fontSize="12px"
        fill="#374151"
        fontWeight="500"
      >
        {formatted}
      </text>
    );
  });

  // Create value labels for both datasets
  const valueLabels = candidatePoints.map((point, index) => {
    const angle = (index * 2 * Math.PI) / labels.length - Math.PI / 2;
    const valueRadius = radius + 18;
    const x = centerX + Math.cos(angle) * valueRadius;
    const y = centerY + Math.sin(angle) * valueRadius;
    
    return (
      <g key={index}>
        {/* Candidate value */}
        <text
          x={x - 15}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11px"
          fill={candidateColor}
          fontWeight="600"
        >
          {point.value}
        </text>
        {/* Team value */}
        <text
          x={x + 15}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11px"
          fill={teamColor}
          fontWeight="600"
        >
          {teamPoints[index].value}
        </text>
      </g>
    );
  });

  return (
    <div className="flex flex-col items-center">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      )}
      <div className="relative" style={{ marginTop: '-20px' }}>
        <svg width={size} height={size} className="overflow-visible">
          {/* Grid circles */}
          {gridCircles}
          
          {/* Axis lines */}
          {axisLines}
          
          {/* Team polygon (behind) */}
          <polygon
            points={teamPolygonPoints}
            fill={teamColor}
            fillOpacity="0.2"
            stroke={teamColor}
            strokeWidth="2"
          />
          
          {/* Candidate polygon (front) */}
          <polygon
            points={candidatePolygonPoints}
            fill={candidateColor}
            fillOpacity="0.2"
            stroke={candidateColor}
            strokeWidth="2"
          />
          
          {/* Data points */}
          {candidatePoints.map((point, index) => (
            <g key={index}>
              {/* Team point */}
              <circle
                cx={teamPoints[index].x}
                cy={teamPoints[index].y}
                r="4"
                fill={teamColor}
                stroke="white"
                strokeWidth="2"
              />
              {/* Candidate point */}
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill={candidateColor}
                stroke="white"
                strokeWidth="2"
              />
            </g>
          ))}
          
          {/* Labels */}
          {labelElements}
          
          {/* Value labels */}
          {valueLabels}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: candidateColor }}></div>
          <span className="text-sm font-medium text-gray-700">Candidate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: teamColor }}></div>
          <span className="text-sm font-medium text-gray-700">Team Average</span>
        </div>
      </div>
    </div>
  );
}
