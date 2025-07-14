
"use client"

import { useEffect, useState } from 'react'
import { CreditCard, DollarSign, Users, Activity, History, XCircle, CheckCircle2, PackageSearch } from 'lucide-react'
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

type DashboardData = {
  totalRevenue: number;
  totalSpending: number;
  totalOrders: number;
  completedOrders: number;
  canceledOrders: number;
  activeTables: string;
  topSellingProducts: any[];
  recentSales: any[];
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
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true);
  const { logs } = useActivityLog();

  const recentLogs = logs.slice(0, 5); // Get the 5 most recent logs

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch('/api/dashboard-stats');
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [])

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageOnboarding page="dashboard" />
      <Header title={t('dashboard.title')} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            <>
              {[...Array(6)].map((_, i) => <KpiSkeleton key={i} />)}
            </>
          ) : data && (
            <>
              <KpiCard 
                title={t('dashboard.totalRevenue')}
                value={`XAF ${data.totalRevenue.toLocaleString()}`}
                change={t('dashboard.fromLastMonth', { change: '+20.1%' })}
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              />
               <KpiCard 
                title={t('dashboard.totalSpending')}
                value={`XAF ${data.totalSpending.toLocaleString()}`}
                change={t('dashboard.fromLastMonth', { change: '+15.2%' })}
                icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
              />
              <KpiCard 
                title={t('dashboard.totalOrders')}
                value={data.totalOrders.toLocaleString()}
                change={t('dashboard.fromLastMonth', { change: '+180' })}
                icon={<PackageSearch className="h-4 w-4 text-muted-foreground" />}
              />
               <KpiCard 
                title={t('dashboard.completedOrders')}
                value={data.completedOrders.toLocaleString()}
                change={`${(data.completedOrders / data.totalOrders * 100).toFixed(1)}%`}
                icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
              />
               <KpiCard 
                title={t('dashboard.canceledOrders')}
                value={data.canceledOrders.toLocaleString()}
                 change={`${(data.canceledOrders / data.totalOrders * 100).toFixed(1)}%`}
                icon={<XCircle className="h-4 w-4 text-muted-foreground" />}
              />
              <KpiCard 
                title={t('dashboard.activeTables')}
                value={data.activeTables}
                change={t('dashboard.sinceLastHour', { change: '+2' })}
                icon={<Activity className="h-4 w-4 text-muted-foreground" />}
              />
            </>
          )}
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline">{t('dashboard.recentSales')}</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {loading || !data ? <Skeleton className="h-[250px] w-full" /> : <RecentSales data={data.recentSales} />}
            </CardContent>
          </Card>
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
             ) : <TopProducts products={data.topSellingProducts} />}
            </CardContent>
          </Card>
           <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle className="font-headline">{t('dashboard.recentActivity')}</CardTitle>
              <CardDescription>{t('dashboard.recentActivityDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length > 0 ? <ActivityLogTable logs={recentLogs} /> : <p className="text-center text-muted-foreground p-8">{t('activity.noLogs')}</p>}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
