"use client"

import { useMemo } from 'react'

type CategorySalesData = {
  category: string
  sales: number
  color: string
}

type CategorySalesChartProps = {
  data?: CategorySalesData[]
}

// Simple bar chart using CSS
export function CategorySalesChart({ data }: CategorySalesChartProps) {
  // Fallback demo data if none provided
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;
    
    return [
      { category: 'Food', sales: 45000, color: 'hsl(var(--chart-1))' },
      { category: 'Drinks', sales: 32000, color: 'hsl(var(--chart-2))' },
      { category: 'Desserts', sales: 18000, color: 'hsl(var(--chart-3))' },
      { category: 'Extras', sales: 12000, color: 'hsl(var(--chart-4))' }
    ];
  }, [data]);

  const maxSales = Math.max(...chartData.map(d => d.sales));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {chartData.map((item, index) => {
          const percentage = (item.sales / maxSales) * 100;
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.category}</span>
                <span className="text-muted-foreground">{formatCurrency(item.sales)}</span>
              </div>
              <div className="h-8 bg-muted rounded-md overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: item.color || 'hsl(var(--primary))'
                  }}
                >
                  {percentage > 15 && (
                    <span className="text-xs text-primary-foreground font-medium">
                      {percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold">
            {formatCurrency(chartData.reduce((sum, item) => sum + item.sales, 0))}
          </div>
          <div className="text-xs text-muted-foreground">Total Sales</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{chartData.length}</div>
          <div className="text-xs text-muted-foreground">Categories</div>
        </div>
      </div>
    </div>
  );
}
