// New page for the accounting dashboard
"use client"

import { Header } from '@/components/dashboard/header'
import { useAuth } from '@/context/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock, BarChart2, DollarSign, ArrowUp, ArrowDown, BookOpen } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import Link from 'next/link'
import { Button } from '@/components/ui/button'


const chartData = [
  { month: "January", revenue: 186000, expenses: 80000 },
  { month: "February", revenue: 305000, expenses: 200000 },
  { month: "March", revenue: 237000, expenses: 120000 },
  { month: "April", revenue: 73000, expenses: 190000 },
  { month: "May", revenue: 209000, expenses: 130000 },
  { month: "June", revenue: 214000, expenses: 140000 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

function AccountingDashboardContent() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t('accounting.dashboard.title')} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('accounting.dashboard.netProfit')}</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">XAF 452,310.89</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('accounting.dashboard.totalRevenue')}</CardTitle>
                    <ArrowUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">XAF 1,234,567.00</div>
                    <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('accounting.dashboard.totalExpenses')}</CardTitle>
                    <ArrowDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">XAF 782,256.11</div>
                    <p className="text-xs text-muted-foreground">+10% from last month</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('accounting.dashboard.profitMargin')}</CardTitle>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">36.6%</div>
                    <p className="text-xs text-muted-foreground">+2% from last month</p>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>{t('accounting.dashboard.revenueVsExpenses')}</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <AreaChart
                            accessibilityLayer
                            data={chartData}
                            margin={{
                            left: 12,
                            right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => `XAF ${Number(value) / 1000}k`}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Area
                                dataKey="expenses"
                                type="natural"
                                fill="var(--color-expenses)"
                                fillOpacity={0.4}
                                stroke="var(--color-expenses)"
                                stackId="a"
                            />
                            <Area
                                dataKey="revenue"
                                type="natural"
                                fill="var(--color-revenue)"
                                fillOpacity={0.4}
                                stroke="var(--color-revenue)"
                                stackId="a"
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card className="col-span-4 lg:col-span-3">
                <CardHeader>
                    <CardTitle>{t('accounting.dashboard.quickActions')}</CardTitle>
                    <CardDescription>{t('accounting.dashboard.quickActionsDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <Link href="/dashboard/accounting/journals" passHref>
                        <Button className="w-full justify-start" variant="outline">
                            <BookOpen className="mr-2 h-4 w-4" />
                            {t('accounting.journals.title')}
                        </Button>
                    </Link>
                     <Link href="/dashboard/accounting/reports" passHref>
                        <Button className="w-full justify-start" variant="outline">
                            <BarChart2 className="mr-2 h-4 w-4" />
                            {t('accounting.reports.title')}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  )
}

export default function AccountingPage() {
  const { user } = useAuth()
  const { t } = useTranslation()

  const canViewPage = () => {
    if (!user) return false
    const allowedRoles = ["Manager", "Super Admin", "Accountant"]
    return allowedRoles.includes(user.role)
  }

  if (!canViewPage()) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title={t('accounting.dashboard.title')} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
           <Card className="flex flex-col items-center justify-center p-10 text-center">
            <CardHeader>
                <div className="mx-auto bg-muted rounded-full p-4">
                    <Lock className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">{t('dialogs.accessDenied')}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{t('dialogs.permissionDenied')}</p>
                <p className="text-sm text-muted-foreground mt-2">{t('dialogs.contactAdmin')}</p>
            </CardContent>
           </Card>
        </main>
      </div>
    )
  }

  return <AccountingDashboardContent />
}
