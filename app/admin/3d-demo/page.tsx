'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import ThreeDPieChart from '@/components/3d-pie-chart';

// Bright vibrant sample data - Reference style colors
const sampleData = [
  { name: 'Ghana Music Awards', value: 300, color: '#3b82f6', percentage: 35.2 },
  { name: 'Kumerica', value: 202.7, color: '#f43f5e', percentage: 23.8 },
  { name: 'Miss Ghana Junior', value: 17, color: '#f97316', percentage: 2.0 },
  { name: 'Americ Got Talent', value: 1.5, color: '#22c55e', percentage: 0.2 },
  { name: 'OseiKrom Beauty Pageants', value: 0.1, color: '#eab308', percentage: 0.01 }
];

export default function ThreeDDemoPage() {
  const [chartSettings, setChartSettings] = useState({
    width: 500,
    height: 500,
    depth: 80,
    tilt: -15,
    rotation: 0
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-pink-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎨 True 3D Pie Chart Demo
          </h1>
          <p className="text-xl text-gray-300">
            Inspired by the <a href="https://3dpie.peterbeshai.com/?tmw=-10&met=0.65&blm=false&bg=%23375c8f&n=6&v0=1.5&l0=&c0=%233b82f6&x0=true&h0=0.5&o0=0&v1=0.78&l1=maths&c1=%23f43f5e&x1=false&h1=0.5&o1=0&v2=0.62&l2=&c2=%23f97316&x2=false&h2=0.5&o2=0&v3=0.48&l3=&c3=%2322c55e&x3=false&h3=0.5&o3=0&v4=0.38&l4=&c4=%23eab308&x4=false&h4=0.5&o4=0&v5=0.3&l5=&c5=%2306b6d4&x5=false&h5=0.5&o5=0" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">3D Pie Chart reference</a>
          </p>
        </div>

        {/* Controls */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">3D Chart Controls</CardTitle>
            <CardDescription className="text-gray-300">
              Adjust the 3D perspective and depth settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Width</label>
                <input
                  type="range"
                  min="300"
                  max="800"
                  value={chartSettings.width}
                  onChange={(e) => setChartSettings(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{chartSettings.width}px</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Height</label>
                <input
                  type="range"
                  min="300"
                  max="800"
                  value={chartSettings.height}
                  onChange={(e) => setChartSettings(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{chartSettings.height}px</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Depth</label>
                <input
                  type="range"
                  min="20"
                  max="150"
                  value={chartSettings.depth}
                  onChange={(e) => setChartSettings(prev => ({ ...prev, depth: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{chartSettings.depth}px</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Tilt</label>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={chartSettings.tilt}
                  onChange={(e) => setChartSettings(prev => ({ ...prev, tilt: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{chartSettings.tilt}°</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Rotation</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={chartSettings.rotation}
                  onChange={(e) => setChartSettings(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{chartSettings.rotation}°</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3D Pie Chart */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <BarChart3 className="h-5 w-5 mr-2" />
              Campaign Performance - True 3D Visualization
            </CardTitle>
            <CardDescription className="text-gray-300">
              Interactive 3D pie chart with realistic depth, lighting, and perspective effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <ThreeDPieChart
                data={sampleData}
                width={chartSettings.width}
                height={chartSettings.height}
                depth={chartSettings.depth}
                tilt={chartSettings.tilt}
                rotation={chartSettings.rotation}
              />
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">🎨 Bright 3D Perspective</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-200 space-y-2">
                <li>• Vibrant colors with realistic depth</li>
                <li>• Bright lighting and highlights</li>
                <li>• Dynamic perspective transforms</li>
                <li>• Interactive bright hover effects</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">⚡ Dynamic Animations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-200 space-y-2">
                <li>• Smooth bright rotation animation</li>
                <li>• Vibrant hover scaling effects</li>
                <li>• Bright 3D perspective changes</li>
                <li>• Real-time bright parameter updates</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">🎯 Professional Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-200 space-y-2">
                <li>• Bright SVG-based rendering</li>
                <li>• Vibrant gradients and filters</li>
                <li>• Responsive bright design</li>
                <li>• High performance bright effects</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Back to Admin */}
        <div className="text-center">
          <a 
            href="/admin" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            ← Back to Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
