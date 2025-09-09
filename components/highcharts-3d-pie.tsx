'use client';

import React, { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import { supabase } from '@/lib/supabase-auth';
import { useTheme } from 'next-themes';

// Note: 3D module temporarily disabled to fix NaN errors
// Will re-enable once dimension issues are resolved

interface CampaignData {
  name: string;
  revenue: number;
  votes: number;
  status: string;
}

interface Highcharts3DPieProps {
  data?: any[];
}

const Highcharts3DPie: React.FC<Highcharts3DPieProps> = ({ data: propData }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<Highcharts.Chart | null>(null);
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, resolvedTheme } = useTheme();

  // Get theme-aware colors and styling
  const getThemeConfig = () => {
    const isDark = resolvedTheme === 'dark';
    return {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      textColor: isDark ? '#e5e5e5' : '#374151',
      gridColor: isDark ? '#374151' : '#e5e7eb',
      colors: isDark ? [
        '#3b82f6', // Blue
        '#f43f5e', // Pink/Red
        '#f97316', // Orange
        '#22c55e', // Green
        '#eab308', // Yellow
        '#8b5cf6', // Purple
        '#06b6d4', // Cyan
        '#ef4444'  // Red
      ] : [
        '#3b82f6', // Blue
        '#f43f5e', // Pink/Red
        '#f97316', // Orange
        '#22c55e', // Green
        '#eab308'  // Yellow
      ]
    };
  };

  // Fetch campaign data from API
  const fetchCampaignData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const stats = await response.json();
        if (stats.campaignPerformance && stats.campaignPerformance.length > 0) {
          setCampaignData(stats.campaignPerformance);
        }
      } else {
        console.error('Failed to fetch campaign data:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching campaign data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (!propData) {
      fetchCampaignData();
    } else {
      setLoading(false);
    }
  }, [propData]);

  useEffect(() => {
    const createChart = async () => {
      if (!chartRef.current || loading) return;

      // 3D module temporarily disabled

      // Ensure container has dimensions
      const container = chartRef.current;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      
      if (containerWidth === 0 || containerHeight === 0) {
        // Wait for container to have dimensions
        setTimeout(createChart, 100);
        return;
      }

      // Use prop data if provided, otherwise use fetched campaign data
      const dataToUse = propData || campaignData;
      
      if (!dataToUse || dataToUse.length === 0) return;

      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Get theme configuration
      const themeConfig = getThemeConfig();

      // Prepare data for Highcharts
      const chartData = dataToUse.map((item: any, index: number) => {
        if (propData) {
          // Use prop data as-is but apply theme colors
          return {
            ...item,
            color: themeConfig.colors[index % themeConfig.colors.length]
          };
        } else {
          // Convert campaign data to Highcharts format
          return {
            name: item.name,
            y: item.revenue,
            color: themeConfig.colors[index % themeConfig.colors.length]
          };
        }
      });

      // Create the chart
      chartInstance.current = Highcharts.chart(chartRef.current, {
         chart: {
           type: 'pie',
           height: containerHeight,
           width: containerWidth,
           spacing: [5, 5, 5, 5],
           backgroundColor: themeConfig.backgroundColor,
           style: {
             fontFamily: 'Inter, system-ui, sans-serif'
           }
         },
        title: {
          text: '',
          style: {
            color: themeConfig.textColor
          }
        },
        subtitle: {
          text: '',
          style: {
            color: themeConfig.textColor
          }
        },
        accessibility: {
          point: {
            valueSuffix: '%'
          }
        },
        tooltip: {
          backgroundColor: themeConfig.backgroundColor,
          borderColor: themeConfig.gridColor,
          style: {
            color: themeConfig.textColor
          },
          pointFormat: propData ? 
            '{series.name}: <b>{point.percentage:.1f}%</b>' :
            '<b>{point.name}</b><br/>Revenue: <b>₵{point.y:.2f}</b><br/>Share: <b>{point.percentage:.1f}%</b>'
        },
         plotOptions: {
           pie: {
             allowPointSelect: true,
             cursor: 'pointer',
             dataLabels: {
               enabled: true,
               format: '{point.name}',
               style: {
                 fontSize: '9px',
                 fontWeight: '500',
                 color: themeConfig.textColor,
                 textOutline: 'none'
               },
               distance: 8,
               connectorWidth: 1,
               connectorColor: themeConfig.gridColor
             },
             size: '60%',
             center: ['50%', '50%'],
             borderWidth: 0,
             states: {
               hover: {
                 halo: {
                   size: 5,
                   opacity: 0.25
                 }
               }
             }
           }
         },
        series: [{
          type: 'pie',
          name: propData ? 'Share' : 'Revenue',
          data: chartData
        }]
      });
    };

    createChart();

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [propData, campaignData, loading, resolvedTheme]);

  if (loading) {
    const themeConfig = getThemeConfig();
    return (
      <div 
        style={{ 
          width: '100%', 
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: themeConfig.backgroundColor,
          borderRadius: '8px',
          border: `1px solid ${themeConfig.gridColor}`
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: `4px solid ${themeConfig.gridColor}`,
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: themeConfig.textColor, margin: 0 }}>Loading campaign data...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div 
      ref={chartRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        overflow: 'hidden'
      }} 
    />
  );
};

export default Highcharts3DPie;