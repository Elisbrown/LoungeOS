"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type ChartData = {
  revenue: Array<{ date: string; value: number }>;
  orders: Array<{ date: string; value: number }>;
  cashFlow: Array<{ date: string; value: number }>;
}

type DashboardChartsProps = {
  data: ChartData;
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'orders' | 'cashFlow'>('revenue');

  // Aggregate data by hour (0-23)
  const getHourlyData = () => {
    if (!data || !data[selectedMetric]) {
      return Array(24).fill(0).map((_, i) => ({ hour: i, value: 0 }));
    }

    const chartData = data[selectedMetric] || [];
    const hourlyTotals = Array(24).fill(0);
    const hourlyCounts = Array(24).fill(0);

    // Aggregate values by hour
    chartData.forEach(item => {
      try {
        const date = new Date(item.date);
        const hour = date.getHours();
        if (hour >= 0 && hour < 24) {
          hourlyTotals[hour] += item.value;
          hourlyCounts[hour] += 1;
        }
      } catch (e) {
        // Skip invalid dates
      }
    });

    // If no data, return zeros
    if (hourlyCounts.every(count => count === 0)) {
      return Array(24).fill(0).map((_, i) => ({ hour: i, value: 0 }));
    }

    // Return hourly totals
    return hourlyTotals.map((total, hour) => ({
      hour,
      value: total
    }));
  };

  const hourlyData = getHourlyData();
  const hasData = hourlyData.some(d => d.value > 0);
  const maxValue = hasData ? Math.max(...hourlyData.map(d => d.value)) : 100;

  const formatValue = (value: number) => {
    if (selectedMetric === 'revenue' || selectedMetric === 'cashFlow') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return Math.round(value).toString();
  };

  const formatShortValue = (value: number) => {
    if (selectedMetric === 'revenue' || selectedMetric === 'cashFlow') {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
      return value.toFixed(0);
    }
    return Math.round(value).toString();
  };

  // Create smooth curved path
  const createSmoothPath = () => {
    if (hourlyData.length === 0) return '';

    const points = hourlyData.map((d, i) => {
      const x = (i / 23) * 100;
      const y = maxValue > 0 ? ((maxValue - d.value) / maxValue) * 100 : 50;
      return { x, y };
    });

    // Create smooth curve using quadratic bezier curves
    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      const controlY = (current.y + next.y) / 2;
      path += ` Q ${current.x},${current.y} ${controlX},${controlY}`;
    }
    
    const last = points[points.length - 1];
    path += ` L ${last.x},${last.y}`;
    
    return path;
  };

  // Generate Y-axis labels intelligently to avoid duplicates
  const generateYAxisLabels = () => {
    // For orders with small max values, use integer steps only
    if (selectedMetric === 'orders' && maxValue <= 10) {
      const uniqueValues: number[] = [];
      const step = Math.max(1, Math.ceil(maxValue / 4));
      
      for (let i = 0; i <= 4; i++) {
        const value = maxValue - (i * step);
        if (value >= 0 && !uniqueValues.includes(value)) {
          uniqueValues.push(value);
        }
      }
      
      // Fill remaining slots with zero if needed
      while (uniqueValues.length < 5 && !uniqueValues.includes(0)) {
        uniqueValues.push(0);
      }
      
      return uniqueValues.slice(0, 5).map((value, i) => ({
        value,
        label: value.toString(),
        y: (uniqueValues.indexOf(value) / 4) * 100
      }));
    }
    
    // For other metrics, use standard spacing
    return Array(5).fill(0).map((_, i) => {
      const value = maxValue - (i * maxValue / 4);
      return {
        value,
        label: formatShortValue(value),
        y: (i / 4) * 100
      };
    });
  };

  const yAxisLabels = generateYAxisLabels();

  // Get axis label based on selected metric
  const getYAxisLabel = () => {
    if (selectedMetric === 'revenue') return 'Revenue (FCFA)';
    if (selectedMetric === 'orders') return 'Number of Orders';
    return 'Cash Flow (FCFA)';
  };

  return (
    <div className="space-y-4">
      {/* Metric selector buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={selectedMetric === 'revenue' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('revenue')}
          >
            Revenue
          </Button>
          <Button
            variant={selectedMetric === 'orders' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('orders')}
          >
            Orders
          </Button>
          <Button
            variant={selectedMetric === 'cashFlow' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('cashFlow')}
          >
            Cash Flow
          </Button>
        </div>
      </div>

      {/* Line Chart Container */}
      <div className="relative bg-muted/20 rounded-lg p-4">
        {/* Y-axis label (rotated) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
          <div className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            {getYAxisLabel()}
          </div>
        </div>

        {/* Chart with axes */}
        <div className="ml-12 mr-4">
          <div className="flex gap-4">
            {/* Y-axis with labels */}
            <div className="flex flex-col justify-between py-4" style={{ height: '250px' }}>
              {yAxisLabels.map((label, i) => (
                <div key={i} className="text-xs text-muted-foreground text-right" style={{ lineHeight: '1' }}>
                  {label.label}
                </div>
              ))}
            </div>

            {/* Chart area */}
            <div className="flex-1 relative" style={{ height: '250px' }}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="overflow-visible"
              >
                {/* Horizontal grid lines */}
                {yAxisLabels.map((label, i) => (
                  <line
                    key={`h-${i}`}
                    x1="0"
                    y1={label.y}
                    x2="100"
                    y2={label.y}
                    stroke="currentColor"
                    strokeWidth="0.2"
                    className="text-border"
                  />
                ))}

                {/* Vertical grid lines (every 4 hours) */}
                {[0, 4, 8, 12, 16, 20].map((hour) => {
                  const x = (hour / 23) * 100;
                  return (
                    <line
                      key={`v-${hour}`}
                      x1={x}
                      y1="0"
                      x2={x}
                      y2="100"
                      stroke="currentColor"
                      strokeWidth="0.2"
                      className="text-border"
                    />
                  );
                })}

                {/* Chart line and area */}
                {hasData && (
                  <>
                    <defs>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    
                    {/* Filled area under curve */}
                    <path
                      d={`${createSmoothPath()} L 100,100 L 0,100 Z`}
                      fill="url(#areaGradient)"
                    />
                    
                    {/* Smooth line */}
                    <path
                      d={createSmoothPath()}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="0.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </>
                )}

                {!hasData && (
                  <text
                    x="50"
                    y="50"
                    textAnchor="middle"
                    className="text-xs fill-muted-foreground"
                  >
                    No data available
                  </text>
                )}
              </svg>

              {/* X-axis labels below chart */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-1">
                {[0, 4, 8, 12, 16, 20, 23].map((hour) => (
                  <div key={hour} className="text-[10px] text-muted-foreground">
                    {hour}:00
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* X-axis label */}
          <div className="text-center mt-8">
            <div className="text-xs font-medium text-muted-foreground">
              Time of Day (Hours)
            </div>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      {hasData && (
        <div className="grid grid-cols-3 gap-4 text-center pt-2">
          <div>
            <div className="text-xl sm:text-2xl font-bold">
              {formatValue(hourlyData.reduce((sum, d) => sum + d.value, 0))}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold">
              {formatValue(maxValue)}
            </div>
            <div className="text-xs text-muted-foreground">Peak</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold">
              {formatValue(hourlyData.reduce((sum, d) => sum + d.value, 0) / 24)}
            </div>
            <div className="text-xs text-muted-foreground">Hourly Average</div>
          </div>
        </div>
      )}
    </div>
  );
}