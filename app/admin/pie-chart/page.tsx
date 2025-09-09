'use client';

import React from 'react';
import Highcharts3DPie from '@/components/highcharts-3d-pie';
import AdminProtectedRoute from '@/components/admin-protected-route';

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

export default function PieChartPage() {
  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Campaign Performance Chart</h1>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Highcharts3DPie />
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
