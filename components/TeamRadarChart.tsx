'use client';

import { useEffect, useRef } from 'react';

interface RadarChartProps {
  data: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
}

export default function TeamRadarChart({ data }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Draw background circles
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      const r = (radius * i) / 5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw axis lines
    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const angles = [0, 72, 144, 216, 288]; // 360/5 = 72 degrees each

    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    angles.forEach(angle => {
      const radians = (angle * Math.PI) / 180;
      const x = centerX + radius * Math.cos(radians);
      const y = centerY + radius * Math.sin(radians);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    // Draw data polygon
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    traits.forEach((trait, index) => {
      const angle = angles[index];
      const radians = (angle * Math.PI) / 180;
      const value = data[trait as keyof typeof data] / 100; // Normalize to 0-1
      const r = radius * value;
      const x = centerX + r * Math.cos(radians);
      const y = centerY + r * Math.sin(radians);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    traits.forEach((trait, index) => {
      const angle = angles[index];
      const radians = (angle * Math.PI) / 180;
      const labelRadius = radius + 20;
      const x = centerX + labelRadius * Math.cos(radians);
      const y = centerY + labelRadius * Math.sin(radians);

      // Capitalize first letter
      const label = trait.charAt(0).toUpperCase() + trait.slice(1);
      ctx.fillText(label, x, y);
    });

    // Draw data points
    ctx.fillStyle = '#3b82f6';
    traits.forEach((trait, index) => {
      const angle = angles[index];
      const radians = (angle * Math.PI) / 180;
      const value = data[trait as keyof typeof data] / 100;
      const r = radius * value;
      const x = centerX + r * Math.cos(radians);
      const y = centerY + r * Math.sin(radians);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

  }, [data]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="max-w-full h-auto"
      />
    </div>
  );
}
