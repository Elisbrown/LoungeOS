"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, BarChart3 } from 'lucide-react'

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

  const getChartData = () => {
    const chartData = data[selectedMetric] || [];
    
    // If no data, provide fallback data for demonstration
    if (chartData.length === 0) {
      const today = new Date();
      const fallbackData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        fallbackData.push({
          date: date.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 1000) + 100 // Random values between 100-1100
        });
      }
      return fallbackData;
    }
    
    return chartData;
  };

  const getMaxValue = () => {
    const values = getChartData().map(item => item.value);
    return Math.max(...values, 1);
  };

  const formatValue = (value: number) => {
    if (selectedMetric === 'revenue' || selectedMetric === 'cashFlow') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return value.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
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

      <div className="h-[250px] relative">
        {getChartData().length > 0 ? (
          <div className="flex items-end justify-between h-full gap-2">
            {getChartData().map((item, index) => {
              const height = (item.value / getMaxValue()) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="text-xs text-muted-foreground mb-2">
                    {formatValue(item.value)}
                  </div>
                  <div
                    className="w-full bg-primary rounded-t-sm transition-all duration-300 hover:bg-primary/80"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  <div className="text-xs text-muted-foreground mt-2 text-center">
                    {formatDate(item.date)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">
            {formatValue(getChartData().reduce((sum, item) => sum + item.value, 0))}
          </div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div>
          <div className="text-2xl font-bold">
            {formatValue(Math.max(...getChartData().map(item => item.value), 0))}
          </div>
          <div className="text-xs text-muted-foreground">Peak</div>
        </div>
        <div>
          <div className="text-2xl font-bold">
            {getChartData().length > 0 ? formatValue(getChartData().reduce((sum, item) => sum + item.value, 0) / getChartData().length) : '0'}
          </div>
          <div className="text-xs text-muted-foreground">Average</div>
        </div>
      </div>
    </div>
  );
} 