'use client';

import React, { useState } from 'react';

interface TrajectoryChartProps {
  data: number[];
  repoName: string;
}

export function TrajectoryChart({ data, repoName }: TrajectoryChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Fallback if data is empty or malformed
  const points = data && data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0];
  const maxVal = Math.max(...points, 1);
  const minVal = Math.min(...points, 0);
  const range = maxVal - minVal || 1;

  // SVG dimensions
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Compute point coordinates
  const coords = points.map((val, idx) => {
    const x = paddingX + (idx / (points.length - 1)) * chartW;
    const y = paddingY + chartH - ((val - minVal) / range) * chartH;
    return { x, y, val };
  });

  // Build SVG path
  const linePath = coords.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  // Build Area path for gradient fill
  const areaPath = `${linePath} L ${coords[coords.length - 1].x},${height - paddingY} L ${coords[0].x},${height - paddingY} Z`;

  // Generate day labels (Day -6 to Today)
  const dayLabels = ['7d ago', '6d ago', '5d ago', '4d ago', '3d ago', 'Yesterday', 'Today'];

  return (
    <div className="bg-white border-2 border-black rounded-lg p-5 shadow-[3px_3px_0_0_#000]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-mono font-bold text-base text-black flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-[#FF7905] rounded-full" />
            7-Day Star Velocity Trajectory
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Daily momentum distribution across trailing observation windows
          </p>
        </div>
        <div className="font-mono text-xs bg-slate-100 border border-slate-300 px-2.5 py-1 rounded font-semibold text-slate-800">
          Max: <span className="text-[#FF7905]">+{maxVal}</span> / day
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`grad-${repoName.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF7905" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FF7905" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#f1f5f9"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingY + chartH / 2}
            x2={width - paddingX}
            y2={paddingY + chartH / 2}
            stroke="#f1f5f9"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />

          {/* Area Fill */}
          <path
            d={areaPath}
            fill={`url(#grad-${repoName.replace(/[^a-zA-Z0-9]/g, '')})`}
          />

          {/* Main Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#FF7905"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points */}
          {coords.map((pt, idx) => {
            const isHovered = hoverIndex === idx;
            return (
              <g key={idx}>
                {/* Hit area for easy hovering */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={16}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
                {/* Outer Ring on Hover */}
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={7}
                    fill="#FF7905"
                    fillOpacity="0.2"
                  />
                )}
                {/* Point dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 4.5 : 3}
                  fill={isHovered ? '#FF7905' : '#000000'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all duration-150 pointer-events-none"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoverIndex !== null && (
          <div
            className="absolute z-10 pointer-events-none bg-black text-white font-mono text-xs px-2.5 py-1.5 rounded shadow-lg -translate-x-1/2 -translate-y-full mb-2"
            style={{
              left: `${(coords[hoverIndex].x / width) * 100}%`,
              top: `${(coords[hoverIndex].y / height) * 100}%`,
            }}
          >
            <div className="text-[10px] text-slate-400 font-sans">{dayLabels[hoverIndex]}</div>
            <div className="font-bold text-[#FF7905]">+{points[hoverIndex]} stars</div>
          </div>
        )}
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-2 px-1 border-t border-slate-100 pt-2">
        {dayLabels.map((lbl, idx) => (
          <span
            key={idx}
            className={`transition-colors ${
              hoverIndex === idx ? 'text-[#FF7905] font-bold' : ''
            }`}
          >
            {lbl}
          </span>
        ))}
      </div>
    </div>
  );
}
