'use client';

import React, { useState, useEffect } from 'react';

interface PieData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface ThreeDPieChartProps {
  data: PieData[];
  width?: number;
  height?: number;
  depth?: number;
  tilt?: number;
  rotation?: number;
}

const ThreeDPieChart: React.FC<ThreeDPieChartProps> = ({
  data,
  width = 400,
  height = 400,
  depth = 60,
  tilt = -10,
  rotation = 0
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [animationRotation, setAnimationRotation] = useState(0);

  // Animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationRotation(prev => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Calculate total value
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Generate pie slices with 3D perspective
  const generatePieSlices = () => {
    let currentAngle = 0;
    const radius = Math.min(width, height) / 2 - 60;
    const centerX = width / 2;
    const centerY = height / 2;

    return data.map((item, index) => {
      const sliceAngle = (item.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle += sliceAngle;

      // Convert angles to radians
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;

      // Calculate 3D coordinates with more dramatic perspective
      const tiltRad = (tilt * Math.PI) / 180;
      const rotationRad = ((rotation + animationRotation) * Math.PI) / 180;

      // Top face coordinates
      const x1 = centerX + radius * Math.cos(startAngleRad + rotationRad);
      const y1 = centerY + radius * Math.sin(startAngleRad + rotationRad) * Math.cos(tiltRad);
      const x2 = centerX + radius * Math.cos(endAngleRad + rotationRad);
      const y2 = centerY + radius * Math.sin(endAngleRad + rotationRad) * Math.cos(tiltRad);

      // Bottom face coordinates (shifted by depth)
      const depthOffset = depth * Math.sin(tiltRad);
      const x3 = centerX + radius * Math.cos(endAngleRad + rotationRad);
      const y3 = centerY + radius * Math.sin(endAngleRad + rotationRad) * Math.cos(tiltRad) + depthOffset;
      const x4 = centerX + radius * Math.cos(startAngleRad + rotationRad);
      const y4 = centerY + radius * Math.sin(startAngleRad + rotationRad) * Math.cos(tiltRad) + depthOffset;

      // Inner radius for donut effect
      const innerRadius = radius * 0.3;
      const innerX1 = centerX + innerRadius * Math.cos(startAngleRad + rotationRad);
      const innerY1 = centerY + innerRadius * Math.sin(startAngleRad + rotationRad) * Math.cos(tiltRad);
      const innerX2 = centerX + innerRadius * Math.cos(endAngleRad + rotationRad);
      const innerY2 = centerY + innerRadius * Math.sin(endAngleRad + rotationRad) * Math.cos(tiltRad);
      const innerX3 = centerX + innerRadius * Math.cos(endAngleRad + rotationRad);
      const innerY3 = centerY + innerRadius * Math.sin(endAngleRad + rotationRad) * Math.cos(tiltRad) + depthOffset;
      const innerX4 = centerX + innerRadius * Math.cos(startAngleRad + rotationRad);
      const innerY4 = centerY + innerRadius * Math.sin(startAngleRad + rotationRad) * Math.cos(tiltRad) + depthOffset;

      // Calculate label position
      const midAngle = (startAngle + endAngle) / 2;
      const midAngleRad = (midAngle * Math.PI) / 180;
      const labelRadius = radius + 60;
      const labelX = centerX + labelRadius * Math.cos(midAngleRad + rotationRad);
      const labelY = centerY + labelRadius * Math.sin(midAngleRad + rotationRad) * Math.cos(tiltRad);

      const isHovered = hoveredSlice === index;
      const scale = isHovered ? 1.15 : 1;
      const zOffset = isHovered ? depth * 0.4 : 0;

      return {
        ...item,
        index,
        startAngle,
        endAngle,
        sliceAngle,
        // Top face path
        topPath: `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius * Math.cos(tiltRad)} 0 ${sliceAngle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`,
        // Bottom face path
        bottomPath: `M ${centerX} ${centerY + depthOffset} L ${x4} ${y4} A ${radius} ${radius * Math.cos(tiltRad)} 0 ${sliceAngle > 180 ? 1 : 0} 1 ${x3} ${y3} Z`,
        // Inner top face path
        innerTopPath: `M ${centerX} ${centerY} L ${innerX1} ${innerY1} A ${innerRadius} ${innerRadius * Math.cos(tiltRad)} 0 ${sliceAngle > 180 ? 1 : 0} 1 ${innerX2} ${innerY2} Z`,
        // Inner bottom face path
        innerBottomPath: `M ${centerX} ${centerY + depthOffset} L ${innerX4} ${innerY4} A ${innerRadius} ${innerRadius * Math.cos(tiltRad)} 0 ${sliceAngle > 180 ? 1 : 0} 1 ${innerX3} ${innerY3} Z`,
        // Side faces
        sideFaces: [
          // Outer side face
          `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`,
          // Inner side face
          `M ${innerX1} ${innerY1} L ${innerX2} ${innerY2} L ${innerX3} ${innerY3} L ${innerX4} ${innerY4} Z`,
          // Left side face
          `M ${x1} ${y1} L ${innerX1} ${innerY1} L ${innerX4} ${innerY4} L ${x4} ${y4} Z`,
          // Right side face
          `M ${x2} ${y2} L ${innerX2} ${innerY2} L ${innerX3} ${innerY3} L ${x3} ${y3} Z`
        ],
        labelX,
        labelY,
        scale,
        zOffset
      };
    });
  };

  const slices = generatePieSlices();

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="drop-shadow-2xl"
        style={{
          filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
          transform: `perspective(1000px) rotateX(${tilt}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        <defs>
          {/* Bright Vibrant Gradients - Reference Style */}
          {data.map((item, index) => (
            <radialGradient key={`gradient-${index}`} id={`gradient-${index}`} cx="20%" cy="20%" r="80%">
              <stop offset="0%" stopColor={item.color} stopOpacity="1" />
              <stop offset="40%" stopColor={item.color} stopOpacity="0.95" />
              <stop offset="70%" stopColor={item.color} stopOpacity="0.85" />
              <stop offset="100%" stopColor={item.color} stopOpacity="0.7" />
            </radialGradient>
          ))}
          
          {/* Bright Side Gradients for 3D depth */}
          {data.map((item, index) => (
            <linearGradient key={`shadow-${index}`} id={`shadow-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={item.color} stopOpacity="0.9" />
              <stop offset="50%" stopColor={item.color} stopOpacity="0.7" />
              <stop offset="100%" stopColor={item.color} stopOpacity="0.5" />
            </linearGradient>
          ))}

          {/* Bright 3D Lighting Filter */}
          <filter id="lighting3D" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
            <feSpecularLighting in="blur" specularConstant="3" specularExponent="30" lightingColor="#ffffff" result="specOut">
              <fePointLight x="-120" y="-120" z="400"/>
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut2"/>
            <feComposite in="SourceGraphic" in2="specOut2" operator="arithmetic" k1="0" k2="1" k3="1.5" k4="0"/>
          </filter>

          {/* Bright Glow Filter */}
          <filter id="glow3D" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Bright Highlight Filter */}
          <filter id="highlight3D" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
            <feSpecularLighting in="blur" specularConstant="2" specularExponent="20" lightingColor="#ffffff" result="specOut">
              <fePointLight x="50" y="50" z="200"/>
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut2"/>
            <feComposite in="SourceGraphic" in2="specOut2" operator="arithmetic" k1="0" k2="1" k3="1.3" k4="0"/>
          </filter>
        </defs>

        {/* Render slices with bright 3D depth */}
        {slices.map((slice) => (
          <g key={slice.index}>
            {/* Bottom face (bright shadow) */}
            <path
              d={slice.bottomPath}
              fill={`url(#shadow-${slice.index})`}
              opacity="0.8"
              filter="url(#lighting3D)"
            />
            
            {/* Inner bottom face */}
            <path
              d={slice.innerBottomPath}
              fill={`url(#shadow-${slice.index})`}
              opacity="0.6"
            />

            {/* Side faces for bright 3D depth */}
            {slice.sideFaces.map((sideFace, sideIndex) => (
              <path
                key={sideIndex}
                d={sideFace}
                fill={`url(#shadow-${slice.index})`}
                opacity={sideIndex < 2 ? 0.9 : 0.7}
                filter="url(#lighting3D)"
              />
            ))}

            {/* Top face (main bright surface) */}
            <path
              d={slice.topPath}
              fill={`url(#gradient-${slice.index})`}
              filter="url(#lighting3D) url(#glow3D) url(#highlight3D)"
              style={{
                transform: `scale(${slice.scale}) translateZ(${slice.zOffset}px)`,
                transformOrigin: 'center',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
              onMouseEnter={() => setHoveredSlice(slice.index)}
              onMouseLeave={() => setHoveredSlice(null)}
            />

            {/* Inner top face (bright donut hole) */}
            <path
              d={slice.innerTopPath}
              fill="transparent"
              stroke="#ffffff"
              strokeWidth="3"
              opacity="1"
              filter="url(#highlight3D)"
            />

            {/* Bright Label */}
            <text
              x={slice.labelX}
              y={slice.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-bold fill-white"
              style={{
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.7)) drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                transform: `scale(${slice.scale})`,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              <tspan x={slice.labelX} dy="-5">{slice.name}</tspan>
              <tspan x={slice.labelX} dy="15" className="text-xs opacity-90">
                {slice.percentage.toFixed(1)}%
              </tspan>
            </text>
          </g>
        ))}

        {/* Bright center circle for donut effect */}
        <circle
          cx={width / 2}
          cy={height / 2 + depth * Math.sin((tilt * Math.PI) / 180) / 2}
          r={Math.min(width, height) / 2 * 0.3}
          fill="rgba(255,255,255,0.2)"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="3"
          filter="url(#lighting3D) url(#highlight3D)"
        />
      </svg>

      {/* Bright Legend */}
      <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-xl p-4 space-y-2 border border-white/20">
        <h3 className="text-white font-bold mb-2 text-lg">Campaign Performance</h3>
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full shadow-lg" 
              style={{ 
                backgroundColor: item.color,
                boxShadow: `0 0 10px ${item.color}50`
              }}
            />
            <span className="text-white text-sm font-semibold">{item.name}</span>
            <span className="text-white/80 text-xs font-medium">({item.percentage.toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreeDPieChart;
