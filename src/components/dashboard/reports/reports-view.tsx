
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/dashboard/reports/date-range-picker"
import { Download } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const salesOverTimeData = [
  { date: "2023-01-01", sales: 200000 },
  { date: "2023-01-02", sales: 250000 },
  { date: "2023-01-03", sales: 180000 },
  { date: "2023-01-04", sales: 320000 },
  { date: "2023-01-05", sales: 280000 },
  { date: "2023-01-06", sales: 450000 },
  { date: "2023-01-07", sales: 400000 },
]

const salesByCategoryData = [
  { name: "Cocktails", value: 400, color: "hsl(var(--chart-1))" },
  { name: "Snacks", value: 300, color: "hsl(var(--chart-2))" },
  { name: "Beer", value: 200, color: "hsl(var(--chart-3))" },
  { name: "Wine", value: 278, color: "hsl(var(--chart-4))" },
  { name: "Soft Drinks", value: 189, color: "hsl(var(--chart-5))" },
]

const recentTransactionsData = [
  { id: "TRX001", date: "2023-10-26", amount: 15000, table: "VIP 1", cashier: "Cashier User" },
  { id: "TRX002", date: "2023-10-26", amount: 8500, table: "Lounge 2", cashier: "Cashier User" },
  { id: "TRX003", date: "2023-10-26", amount: 22000, table: "Patio 1", cashier: "Manager User" },
  { id: "TRX004", date: "2023-10-25", amount: 5000, table: "Bar 2", cashier: "Cashier User" },
  { id: "TRX005", date: "2023-10-25", amount: 12500, table: "Lounge 1", cashier: "Cashier User" },
]

const salesChartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ReportsView() {
  const { t } = useTranslation()
  const [staffPerformance, setStaffPerformance] = React.useState<any[]>([])

  React.useEffect(() => {
    async function fetchData() {
        // This should be fetched from an API route in a real app
        // const perfData = await getStaffPerformance() 
        // setStaffPerformance(perfData)
    }
    fetchData()
  }, [])


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">{t('reports.salesReports')}</h2>
          <p className="text-muted-foreground">
            {t('reports.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
            <DateRangePicker />
            <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                {t('reports.export')}
            </Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">{t('reports.salesOverTime')}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={salesChartConfig} className="min-h-[300px] w-full">
              <AreaChart
                accessibilityLayer
                data={salesOverTimeData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Area
                  dataKey="sales"
                  type="natural"
                  fill="var(--color-sales)"
                  fillOpacity={0.4}
                  stroke="var(--color-sales)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t('reports.salesByCategory')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="mx-auto aspect-square max-h-[300px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={salesByCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                     {salesByCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
       <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{t('reports.staffPerformance')}</CardTitle>
                    <CardDescription>{t('reports.staffPerformanceDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('staff.name')}</TableHead>
                                <TableHead>{t('staff.role')}</TableHead>
                                <TableHead className="text-right">{t('reports.totalSalesValue')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staffPerformance.map((staff) => (
                                <TableRow key={staff.email}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={staff.avatar} alt={staff.name} />
                                                <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="font-medium">{staff.name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{staff.role}</TableCell>
                                    <TableCell className="text-right">XAF {staff.totalSales.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{t('reports.recentTransactions')}</CardTitle>
                    <CardDescription>{t('reports.recentTransactionsDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>{t('orders.orderId')}</TableHead>
                        <TableHead>{t('orders.table')}</TableHead>
                        <TableHead>{t('reports.cashier')}</TableHead>
                        <TableHead className="text-right">{t('reports.amount')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentTransactionsData.map((trx) => (
                        <TableRow key={trx.id}>
                            <TableCell className="font-medium">{trx.id}</TableCell>
                            <TableCell>{trx.table}</TableCell>
                            <TableCell>{trx.cashier}</TableCell>
                            <TableCell className="text-right">XAF {trx.amount.toLocaleString()}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
       </div>
    </div>
  )
}
