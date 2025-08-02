"use client"

import { Header } from '@/components/dashboard/header'
import { useAuth } from '@/context/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock, ClipboardList, Plus, Search, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { useInventory } from '@/context/inventory-context'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState, useMemo } from 'react'

export default function InventoryStocktakePage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { items, loading } = useInventory()
  const [searchTerm, setSearchTerm] = useState("")
  const [stocktakeMode, setStocktakeMode] = useState(false)

  const canViewPage = () => {
    if (!user) return false
    const allowedRoles = ["Manager", "Admin", "Super Admin", "Stock Manager"];
    return allowedRoles.includes(user.role)
  }

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [items, searchTerm])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In Stock':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Low Stock':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      case 'Out of Stock':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'default'
      case 'Low Stock':
        return 'secondary'
      case 'Out of Stock':
        return 'destructive'
      default:
        return 'default'
    }
  }

  if (!canViewPage()) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title={t('inventory.stocktake.title')} />
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
      <Header title={t('inventory.stocktake.title')} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className='font-headline flex items-center gap-2'>
                  <ClipboardList className="h-5 w-5" />
                  {t('inventory.stocktake.physicalCount')}
                </CardTitle>
                <CardDescription>{t('inventory.stocktake.description')}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant={stocktakeMode ? "default" : "outline"}
                  onClick={() => setStocktakeMode(!stocktakeMode)}
                >
                  {stocktakeMode ? t('inventory.stocktake.exitMode') : t('inventory.stocktake.startCount')}
                </Button>
                {stocktakeMode && (
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('inventory.stocktake.newCount')}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={t('inventory.stocktake.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Stocktake Table */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('inventory.stocktake.item')}</TableHead>
                    <TableHead>{t('inventory.stocktake.category')}</TableHead>
                    <TableHead>{t('inventory.stocktake.systemQuantity')}</TableHead>
                    <TableHead>{t('inventory.stocktake.actualQuantity')}</TableHead>
                    <TableHead>{t('inventory.stocktake.variance')}</TableHead>
                    <TableHead>{t('inventory.stocktake.status')}</TableHead>
                    <TableHead>{t('inventory.stocktake.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading.items ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {t('common.loading')}
                      </TableCell>
                    </TableRow>
                  ) : filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {t('inventory.stocktake.noItems')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => {
                      const variance = 0 // This would be calculated from actual count
                      const varianceColor = variance === 0 ? 'text-green-600' : variance > 0 ? 'text-red-600' : 'text-orange-600'
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">{item.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.current_stock} {item.unit}
                          </TableCell>
                          <TableCell>
                            {stocktakeMode ? (
                              <Input 
                                type="number" 
                                className="w-20"
                                placeholder="0"
                              />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className={`font-medium ${varianceColor}`}>
                            {stocktakeMode ? (
                              <span>{variance > 0 ? '+' : ''}{variance}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(item.status)}
                              <Badge variant={getStatusVariant(item.status)}>
                                {item.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {stocktakeMode && (
                              <Button variant="outline" size="sm">
                                {t('inventory.stocktake.verify')}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary Stats */}
            {stocktakeMode && (
              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{t('inventory.stocktake.totalItems')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{filteredItems.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{t('inventory.stocktake.countedItems')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">0</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{t('inventory.stocktake.pendingItems')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{filteredItems.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{t('inventory.stocktake.variances')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">0</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 