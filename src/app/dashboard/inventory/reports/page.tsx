"use client"

import { Header } from '@/components/dashboard/header'
import { useAuth } from '@/context/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock, BarChart3, TrendingUp, TrendingDown, Package, DollarSign, AlertTriangle, Calendar } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { useInventory } from '@/context/inventory-context'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangePicker } from '@/components/dashboard/reports/date-range-picker'
import { useState } from 'react'

export default function InventoryReportsPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { stats, loading } = useInventory()
  const [reportType, setReportType] = useState("overview")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()

  const canViewPage = () => {
    if (!user) return false
    const allowedRoles = ["Manager", "Admin", "Super Admin", "Stock Manager"];
    return allowedRoles.includes(user.role)
  }

  const reportTypes = [
    { value: "overview", label: t('inventory.reports.overview'), icon: BarChart3 },
    { value: "valuation", label: t('inventory.reports.valuation'), icon: DollarSign },
    { value: "movements", label: t('inventory.reports.movements'), icon: TrendingUp },
    { value: "slowMoving", label: t('inventory.reports.slowMoving'), icon: TrendingDown },
    { value: "expiry", label: t('inventory.reports.expiry'), icon: Calendar },
    { value: "variances", label: t('inventory.reports.variances'), icon: AlertTriangle },
  ]

  if (!canViewPage()) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title={t('inventory.reports.title')} />
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

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t('inventory.reports.title')} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Report Controls */}
        <Card>
          <CardHeader>
            <CardTitle className='font-headline flex items-center gap-2'>
              <BarChart3 className="h-5 w-5" />
              {t('inventory.reports.analytics')}
            </CardTitle>
            <CardDescription>{t('inventory.reports.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <DateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
              />
              
              <Button>
                {t('inventory.reports.generateReport')}
              </Button>
              
              <Button variant="outline">
                {t('inventory.reports.export')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Content */}
        {reportType === "overview" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('inventory.reports.totalItems')}</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading.stats ? '...' : stats?.totalItems || 0}</div>
                <p className="text-xs text-muted-foreground">{t('inventory.reports.itemsInStock')}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('inventory.reports.totalValue')}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${loading.stats ? '...' : (stats?.totalValue || 0).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{t('inventory.reports.inventoryValue')}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('inventory.reports.lowStock')}</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{loading.stats ? '...' : stats?.lowStockItems || 0}</div>
                <p className="text-xs text-muted-foreground">{t('inventory.reports.needsRestocking')}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('inventory.reports.recentMovements')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading.stats ? '...' : stats?.recentMovements || 0}</div>
                <p className="text-xs text-muted-foreground">{t('inventory.reports.last7Days')}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {reportType === "valuation" && (
          <Card>
            <CardHeader>
              <CardTitle>{t('inventory.reports.inventoryValuation')}</CardTitle>
              <CardDescription>{t('inventory.reports.valuationDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {t('inventory.reports.valuationChart')}
              </div>
            </CardContent>
          </Card>
        )}

        {reportType === "movements" && (
          <Card>
            <CardHeader>
              <CardTitle>{t('inventory.reports.stockMovements')}</CardTitle>
              <CardDescription>{t('inventory.reports.movementsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {t('inventory.reports.movementsChart')}
              </div>
            </CardContent>
          </Card>
        )}

        {reportType === "slowMoving" && (
          <Card>
            <CardHeader>
              <CardTitle>{t('inventory.reports.slowMovingItems')}</CardTitle>
              <CardDescription>{t('inventory.reports.slowMovingDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {t('inventory.reports.slowMovingTable')}
              </div>
            </CardContent>
          </Card>
        )}

        {reportType === "expiry" && (
          <Card>
            <CardHeader>
              <CardTitle>{t('inventory.reports.expiryTracking')}</CardTitle>
              <CardDescription>{t('inventory.reports.expiryDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {t('inventory.reports.expiryTable')}
              </div>
            </CardContent>
          </Card>
        )}

        {reportType === "variances" && (
          <Card>
            <CardHeader>
              <CardTitle>{t('inventory.reports.varianceReport')}</CardTitle>
              <CardDescription>{t('inventory.reports.varianceDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {t('inventory.reports.varianceTable')}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('inventory.reports.quickActions')}</CardTitle>
            <CardDescription>{t('inventory.reports.actionsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-20 flex-col">
                <Package className="h-6 w-6 mb-2" />
                {t('inventory.reports.exportItems')}
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                {t('inventory.reports.exportMovements')}
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <DollarSign className="h-6 w-6 mb-2" />
                {t('inventory.reports.exportValuation')}
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <AlertTriangle className="h-6 w-6 mb-2" />
                {t('inventory.reports.exportAlerts')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 