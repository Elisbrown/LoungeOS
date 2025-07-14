
"use client"

import { useRouter } from 'next/navigation'
import { Users, MoreVertical, Layers, CalendarClock } from "lucide-react"
import { useTables } from "@/context/table-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AddTableForm } from "./add-table-form"
import { ManageFloorsDialog } from "./manage-floors-dialog"
import { useAuth } from "@/context/auth-context"
import type { Table } from "@/context/table-context"
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/hooks/use-translation'


export function TablesView() {
  const { tables, addTable, updateTable, updateTableStatus } = useTables()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  const canManage = user?.role === "Manager" || user?.role === "Super Admin"

  const getStatusVariant = (status: Table['status']) => {
    switch (status) {
      case "Available":
        return "success"
      case "Occupied":
        return "destructive"
      case "Reserved":
        return "secondary"
    }
  }
  
  const getStatusBorder = (status: Table['status']) => {
    switch (status) {
      case "Available":
        return "border-green-500"
      case "Occupied":
        return "border-red-500"
      case "Reserved":
        return "border-yellow-500"
    }
  }
  
  const handleTableClick = (table: Table) => {
    router.push(`/dashboard/pos?table=${encodeURIComponent(table.name)}`);
  }

  const handleReserveClick = (e: React.MouseEvent, table: Table) => {
    e.stopPropagation(); // Prevent card click event
    updateTableStatus(table.name, "Reserved");
    toast({ title: t('toasts.tableReserved'), description: t('toasts.tableReservedDesc', { name: table.name }) });
  }

  const handleMakeAvailableClick = (e: React.MouseEvent, table: Table) => {
     e.stopPropagation();
     updateTableStatus(table.name, "Available");
     toast({ title: t('toasts.tableAvailable'), description: t('toasts.tableAvailableDesc', { name: table.name })});
  }

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline">{t('tables.layoutTitle')}</h2>
                <p className="text-muted-foreground">
                    {t('tables.layoutDescription')}
                </p>
            </div>
            <div className="flex items-center gap-2">
              {canManage && <ManageFloorsDialog />}
              {canManage && <AddTableForm onAddTable={addTable} />}
            </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tables.map((table) => (
            <Card 
              key={table.id} 
              className={`flex flex-col border-l-4 ${getStatusBorder(table.status)} hover:shadow-lg transition-shadow duration-200 cursor-pointer`}
              onClick={() => handleTableClick(table)}
            >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{table.name}</CardTitle>
                <Badge variant={getStatusVariant(table.status)} className="w-fit">{t(`tables.statuses.${table.status.toLowerCase()}`)}</Badge>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-2">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Layers className="mr-1 h-4 w-4" />
                    <span>{table.floor}</span>
                </div>
                 <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-1 h-4 w-4" />
                    <span>{t('tables.guestCount', { count: table.capacity })}</span>
                </div>
            </CardContent>
            <CardFooter className="pt-4">
                {table.status === 'Available' && (
                    <Button variant="outline" size="sm" className="w-full" onClick={(e) => handleReserveClick(e, table)}>
                        <CalendarClock className="mr-2 h-4 w-4" />
                        {t('tables.reserve')}
                    </Button>
                )}
                 {table.status === 'Reserved' && (
                    <Button variant="secondary" size="sm" className="w-full" onClick={(e) => handleMakeAvailableClick(e, table)}>
                        {t('tables.makeAvailable')}
                    </Button>
                )}
            </CardFooter>
            </Card>
        ))}
        </div>
    </div>
  )
}
