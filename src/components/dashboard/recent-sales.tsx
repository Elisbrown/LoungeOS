
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { useSettings } from "@/context/settings-context"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function RecentSales({ data }: { data: any[] }) {
  const { settings } = useSettings();
  
  // Transform the data to match the chart format
  const chartData = data.map(sale => ({
    month: new Date(sale.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sales: sale.amount,
    table: sale.table,
    itemCount: sale.itemCount
  }));

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value}
        />
        <YAxis 
          tickFormatter={(value) => formatCurrency(value, settings.defaultCurrency)}
          tickLine={false}
          axisLine={false}
          tickMargin={10}
        />
        <ChartTooltip 
          cursor={false}
          content={<ChartTooltipContent 
            indicator="line"
            labelClassName="text-sm"
            className="bg-card border-border"
            formatter={(value: any) => [formatCurrency(value, settings.defaultCurrency), "Amount"]}
            labelFormatter={(label: any, payload: any) => {
              if (payload && payload[0]) {
                const data = payload[0].payload;
                return `${data.table} - ${data.itemCount} items`;
              }
              return label;
            }}
          />} 
        />
        <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
