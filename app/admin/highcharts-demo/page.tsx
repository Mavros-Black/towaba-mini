'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, RefreshCw } from 'lucide-react';
import Highcharts3DPie from '@/components/highcharts-3d-pie';

// Sample data in the exact format you provided
const sampleData = [
  ['Samsung', 23],
  ['Apple', 18],
  {
    name: 'Xiaomi',
    y: 12,
    sliced: true,
    selected: true
  },
  ['Oppo*', 9],
  ['Vivo', 8],
  ['Others', 30]
];

export default function HighchartsDemoPage() {
  const [chartSettings, setChartSettings] = useState({
    height: 500,
    width: 600,
    alpha: 45,
    beta: 0,
    depth: 35
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-pink-800 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
              <p className="text-white text-lg">Loading Highcharts 3D Pie Chart...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-pink-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            📊 Highcharts 3D Pie Chart
          </h1>
          <p className="text-xl text-gray-300">
            Professional 3D pie chart with campaign performance data
          </p>
        </div>

        {/* Controls */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>3D Chart Controls</span>
              <button
                onClick={handleRefresh}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4 text-white" />
              </button>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Adjust the 3D perspective and depth settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                <label className="block text-sm font-medium text-white mb-2">Width</label>
                <input
                  type="range"
                  min="400"
                  max="1000"
                  value={chartSettings.width}
                  onChange={(e) => setChartSettings(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{chartSettings.width}px</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Alpha (Tilt)</label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={chartSettings.alpha}
                  onChange={(e) => setChartSettings(prev => ({ ...prev, alpha: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{chartSettings.alpha}°</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Beta (Rotation)</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={chartSettings.beta}
                  onChange={(e) => setChartSettings(prev => ({ ...prev, beta: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{chartSettings.beta}°</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Depth</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={chartSettings.depth}
                  onChange={(e) => setChartSettings(prev => ({ ...prev, depth: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{chartSettings.depth}px</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Highcharts 3D Pie Chart */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <BarChart3 className="h-5 w-5 mr-2" />
              Campaign Performance - Highcharts 3D Visualization
            </CardTitle>
            <CardDescription className="text-gray-300">
              Interactive 3D pie chart with professional Highcharts rendering
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Highcharts3DPie
                data={sampleData}
              />
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">🎯 Professional 3D</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-200 space-y-2">
                <li>• True 3D perspective with alpha/beta</li>
                <li>• Professional Highcharts rendering</li>
                <li>• Interactive hover and selection</li>
                <li>• Smooth animations and transitions</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">📊 Rich Data Display</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-200 space-y-2">
                <li>• Detailed tooltips with revenue</li>
                <li>• Percentage and value display</li>
                <li>• Legend with color indicators</li>
                <li>• Data labels on slices</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">⚡ Interactive Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-200 space-y-2">
                <li>• Real-time 3D parameter adjustment</li>
                <li>• Click to select slices</li>
                <li>• Hover effects with highlights</li>
                <li>• Responsive design</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Campaign Data</CardTitle>
            <CardDescription className="text-gray-300">
              Raw data used in the 3D pie chart
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4">Brand</th>
                    <th className="text-right py-3 px-4">Market Share (%)</th>
                    <th className="text-right py-3 px-4">Percentage</th>
                    <th className="text-center py-3 px-4">Color</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleData.map((item, index) => {
                    const name = Array.isArray(item) ? item[0] : item.name;
                    const value = Array.isArray(item) ? item[1] : item.y;
                    return (
                      <tr key={index} className="border-b border-white/10">
                        <td className="py-3 px-4 font-medium">{name}</td>
                        <td className="py-3 px-4 text-right">{value}%</td>
                        <td className="py-3 px-4 text-right">{value}%</td>
                        <td className="py-3 px-4 text-center">
                          <div className="w-4 h-4 rounded-full mx-auto bg-blue-500" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

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
