"use client"

import { useMemo } from 'react'

type RevenueDistributionData = {
  label: string
  value: number
  color: string
}

type RevenueDistributionChartProps = {
  data?: RevenueDistributionData[]
}

// Simple donut chart using CSS
export function RevenueDistributionChart({ data }: RevenueDistributionChartProps) {
  // Fallback demo data if none provided
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;
    
    return [
      { label: 'Dine-in', value: 52000, color: 'hsl(var(--chart-1))' },
      { label: 'Takeout', value: 28000, color: 'hsl(var(--chart-2))' },
      { label: 'Delivery', value: 15000, color: 'hsl(var(--chart-3))' },
      { label: 'Events', value: 12000, color: 'hsl(var(--chart-4))' }
    ];
  }, [data]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Simple ring visualization */}
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          {/* Create concentric rings */}
          {chartData.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const radius = 70 - (index * 15);
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (percentage / 100) * circumference;

            return (
              <svg
                key={index}
                className="absolute inset-0 -rotate-90"
                viewBox="0 0 200 200"
              >
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="14"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-all duration-500"
                />
              </svg>
            );
          })}
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold">{formatCurrency(total)}</div>
            <div className="text-xs text-muted-foreground">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3">
        {chartData.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          
          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{item.label}</div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(item.value)} ({percentage}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
