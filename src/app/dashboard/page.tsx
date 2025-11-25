
"use client"

import { useEffect, useState, useCallback } from 'react'
import { CreditCard, DollarSign, Users, Activity, History, XCircle, CheckCircle2, PackageSearch, TrendingUp, TrendingDown, Clock, Calendar, FileText, BarChart3, LineChart, PieChart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Header } from '@/components/dashboard/header'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { RecentSales } from '@/components/dashboard/recent-sales'
import { TopProducts } from '@/components/dashboard/top-products'
import { useTranslation } from '@/hooks/use-translation'
import { Skeleton } from '@/components/ui/skeleton'
import { PageOnboarding } from '@/components/dashboard/onboarding/page-onboarding'
import { ActivityLogTable } from '@/components/dashboard/activity/activity-log-table'
import { useActivityLog } from '@/hooks/use-activity-log'
import { useSettings } from '@/context/settings-context'
import { formatCurrency } from '@/lib/utils'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'
import { DashboardCalendar } from '@/components/dashboard/dashboard-calendar'
import { DashboardNotes } from '@/components/dashboard/dashboard-notes'
import { PendingOrdersTable } from '@/components/dashboard/pending-orders-table'
import { StaffPerformanceTable } from '@/components/dashboard/staff-performance-table'
import { DateRangePicker } from '@/components/dashboard/reports/date-range-picker'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { DateRange } from 'react-day-picker'
import { CategorySalesChart } from '@/components/dashboard/charts/category-sales-chart'
import { RevenueDistributionChart } from '@/components/dashboard/charts/revenue-distribution-chart'

type DashboardData = {
  totalRevenue: number;
  totalSpending: number;
  totalOrders: number;
  completedOrders: number;
  canceledOrders: number;
  pendingOrders: number;
  activeTables: string;
  topSellingProducts: any[];
  recentSales: any[];
  dailySales: number;
  yesterdaySales: number;
  salesChange: number;
  ordersChange: number;
  revenueChange: number;
  cashFlow: number;
  cashFlowChange: number;
  staffPerformance: any[];
  chartData: {
    revenue: Array<{ date: string; value: number }>;
    orders: Array<{ date: string; value: number }>;
    cashFlow: Array<{ date: string; value: number }>;
  };
}

function KpiSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-3/5 mb-2" />
                <Skeleton className="h-3 w-4/5" />
            </CardContent>
        </Card>
    )
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const { logs } = useActivityLog();

  const recentLogs = logs.slice(0, 5);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange?.from) params.append('from', dateRange.from.toISOString());
      if (dateRange?.to) params.append('to', dateRange.to.toISOString());
      
      const response = await fetch(`/api/dashboard-stats?${params.toString()}`);
      if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
      }
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      setData({
          totalRevenue: 0,
          totalSpending: 0,
          totalOrders: 0,
          completedOrders: 0,
          canceledOrders: 0,
          pendingOrders: 0,
          activeTables: "0 / 0",
          topSellingProducts: [],
          recentSales: [],
          dailySales: 0,
          yesterdaySales: 0,
          salesChange: 0,
          ordersChange: 0,
          revenueChange: 0,
          cashFlow: 0,
          cashFlowChange: 0,
          staffPerformance: [],
          chartData: {
            revenue: [],
            orders: [],
            cashFlow: []
          }
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageOnboarding page="dashboard" />
      <Header title={t('dashboard.title')} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Dashboard Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <DateRangePicker onDateRangeChange={setDateRange} />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live Data
            </Badge>
            <Button variant="outline" size="sm" onClick={fetchData}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Enhanced KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
          {loading || !data ? (
            <>
              {[...Array(8)].map((_, i) => <KpiSkeleton key={i} />)}
            </>
          ) : (
            <>
              <KpiCard 
                title={t('dashboard.totalRevenue')}
                value={formatCurrency(data.totalRevenue, settings.defaultCurrency)}
                change={formatChange(data.revenueChange)}
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                trend={getChangeIcon(data.revenueChange)}
                trendColor={getChangeColor(data.revenueChange)}
              />
              <KpiCard 
                title={t('dashboard.dailySales')}
                value={formatCurrency(data.dailySales, settings.defaultCurrency)}
                change={formatChange(data.salesChange)}
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                trend={getChangeIcon(data.salesChange)}
                trendColor={getChangeColor(data.salesChange)}
              />
              <KpiCard 
                title={t('dashboard.cashFlow')}
                value={formatCurrency(data.cashFlow, settings.defaultCurrency)}
                change={formatChange(data.cashFlowChange)}
                icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
                trend={getChangeIcon(data.cashFlowChange)}
                trendColor={getChangeColor(data.cashFlowChange)}
              />
              <KpiCard 
                title={t('dashboard.totalOrders')}
                value={data.totalOrders.toLocaleString()}
                change={formatChange(data.ordersChange)}
                icon={<PackageSearch className="h-4 w-4 text-muted-foreground" />}
                trend={getChangeIcon(data.ordersChange)}
                trendColor={getChangeColor(data.ordersChange)}
              />
              <KpiCard 
                title={t('dashboard.completedOrders')}
                value={data.completedOrders.toLocaleString()}
                change={`${((data.completedOrders / data.totalOrders) * 100).toFixed(1)}%`}
                icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
              />
              <KpiCard 
                title={t('dashboard.pendingOrders')}
                value={data.pendingOrders.toLocaleString()}
                change="Active"
                icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                variant="warning"
              />
              <KpiCard 
                title={t('dashboard.canceledOrders')}
                value={data.canceledOrders.toLocaleString()}
                change={`${((data.canceledOrders / data.totalOrders) * 100).toFixed(1)}%`}
                icon={<XCircle className="h-4 w-4 text-muted-foreground" />}
                variant="destructive"
              />
              <KpiCard 
                title={t('dashboard.activeTables')}
                value={data.activeTables}
                change="Current"
                icon={<Activity className="h-4 w-4 text-muted-foreground" />}
              />
            </>
          )}
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
              {/* Charts Section - Now using visual charts from Analytics */}
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Revenue & Orders Trend
                  </CardTitle>
                  <CardDescription>
                    Daily performance metrics over the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading || !data ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <DashboardCharts data={data.chartData} />
                  )}
                </CardContent>
              </Card>

              {/* Recent Sales */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">{t('dashboard.recentSales')}</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  {loading || !data ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <RecentSales data={data.recentSales} />
                  )}
                </CardContent>
              </Card>

              {/* Pending Orders */}
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pending Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading || !data ? (
                    <Skeleton className="h-[250px] w-full" />
                  ) : (
                    <PendingOrdersTable />
                  )}
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">{t('dashboard.topSellingProducts')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading || !data ? (
                    <div className="space-y-8">
                      {[...Array(5)].map((_, i) => (
                        <div className="flex items-center" key={i}>
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <div className="ml-4 space-y-2">
                            <Skeleton className="h-4 w-[150px]" />
                          </div>
                          <Skeleton className="ml-auto h-5 w-[80px]" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <TopProducts products={data.topSellingProducts} />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
              {/* Advanced Charts */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Sales by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading || !data ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <CategorySalesChart />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Revenue Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading || !data ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <RevenueDistributionChart />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:gap-8">
              {/* Staff Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Staff Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading || !data ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <StaffPerformanceTable data={data.staffPerformance} />
                  )}
                </CardContent>
              </Card>

              {/* Activity Logs */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">{t('dashboard.recentActivity')}</CardTitle>
                  <CardDescription>{t('dashboard.recentActivityDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {logs.length > 0 ? (
                    <ActivityLogTable logs={recentLogs} />
                  ) : (
                    <p className="text-center text-muted-foreground p-8">{t('activity.noLogs')}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DashboardCalendar />
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Quick Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DashboardNotes />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
