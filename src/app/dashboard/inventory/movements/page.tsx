"use client"

import { Header } from '@/components/dashboard/header'
import { useAuth } from '@/context/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock, TrendingUp, TrendingDown, ArrowLeftRight, Settings } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { useInventory } from '@/context/inventory-context'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useMemo } from 'react'

export default function InventoryMovementsPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { movements, loading } = useInventory()
  const [searchTerm, setSearchTerm] = useState("")
  const [movementTypeFilter, setMovementTypeFilter] = useState("All")
  const [dateFilter, setDateFilter] = useState("All")

  const canViewPage = () => {
    if (!user) return false
    const allowedRoles = ["Manager", "Admin", "Super Admin", "Stock Manager"];
    return allowedRoles.includes(user.role)
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'OUT':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'TRANSFER':
        return <ArrowLeftRight className="h-4 w-4 text-blue-600" />
      case 'ADJUSTMENT':
        return <Settings className="h-4 w-4 text-orange-600" />
      default:
        return null
    }
  }

  const getMovementVariant = (type: string) => {
    switch (type) {
      case 'IN':
        return 'default'
      case 'OUT':
        return 'secondary'
      case 'TRANSFER':
        return 'outline'
      case 'ADJUSTMENT':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredMovements = useMemo(() => {
    return movements.filter(movement => {
      const matchesSearch = searchTerm === "" || 
        movement.item?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = movementTypeFilter === "All" || movement.movement_type === movementTypeFilter
      
      // Date filtering logic can be added here
      const matchesDate = dateFilter === "All" // For now, show all dates
      
      return matchesSearch && matchesType && matchesDate
    })
  }, [movements, searchTerm, movementTypeFilter, dateFilter])

  if (!canViewPage()) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title={t('inventory.movements.title')} />
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
      <Header title={t('inventory.movements.title')} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className='font-headline flex items-center gap-2'>
              <TrendingUp className="h-5 w-5" />
              {t('inventory.movements.stockMovements')}
            </CardTitle>
            <CardDescription>{t('inventory.movements.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <Input 
                placeholder={t('inventory.movements.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={movementTypeFilter} onValueChange={setMovementTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">{t('inventory.movements.allTypes')}</SelectItem>
                  <SelectItem value="IN">{t('inventory.movements.stockIn')}</SelectItem>
                  <SelectItem value="OUT">{t('inventory.movements.stockOut')}</SelectItem>
                  <SelectItem value="TRANSFER">{t('inventory.movements.transfer')}</SelectItem>
                  <SelectItem value="ADJUSTMENT">{t('inventory.movements.adjustment')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">{t('inventory.movements.allDates')}</SelectItem>
                  <SelectItem value="Today">{t('inventory.movements.today')}</SelectItem>
                  <SelectItem value="Week">{t('inventory.movements.thisWeek')}</SelectItem>
                  <SelectItem value="Month">{t('inventory.movements.thisMonth')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Movements Table */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('inventory.movements.date')}</TableHead>
                    <TableHead>{t('inventory.movements.item')}</TableHead>
                    <TableHead>{t('inventory.movements.type')}</TableHead>
                    <TableHead>{t('inventory.movements.quantity')}</TableHead>
                    <TableHead>{t('inventory.movements.reference')}</TableHead>
                    <TableHead>{t('inventory.movements.notes')}</TableHead>
                    <TableHead>{t('inventory.movements.user')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading.movements ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {t('common.loading')}
                      </TableCell>
                    </TableRow>
                  ) : filteredMovements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {t('inventory.movements.noMovements')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="font-medium">
                          {formatDate(movement.movement_date)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{movement.item?.name || 'Unknown Item'}</div>
                            <div className="text-sm text-muted-foreground">{movement.item?.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getMovementIcon(movement.movement_type)}
                            <Badge variant={getMovementVariant(movement.movement_type)}>
                              {movement.movement_type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <span className={movement.movement_type === 'IN' ? 'text-green-600' : 'text-red-600'}>
                            {movement.movement_type === 'IN' ? '+' : '-'}{movement.quantity}
                          </span>
                        </TableCell>
                        <TableCell>
                          {movement.reference_number || '-'}
                        </TableCell>
                        <TableCell>
                          {movement.notes || '-'}
                        </TableCell>
                        <TableCell>
                          {movement.user?.name || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 