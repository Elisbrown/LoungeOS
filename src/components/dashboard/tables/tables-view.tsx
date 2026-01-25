
"use client"

import { useRouter } from 'next/navigation'
import { Users, MoreVertical, Layers, CalendarClock, Trash2, Edit } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddTableForm } from "./add-table-form"
import { ManageFloorsDialog } from "./manage-floors-dialog"
import { ManageTablesDialog } from "./manage-tables-dialog"
import { EditTableDialog } from "./edit-table-dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useAuth } from "@/context/auth-context"
import type { Table } from "@/context/table-context"
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/hooks/use-translation'
import { useState, useMemo } from 'react'


export function TablesView() {
  const { tables, addTable, updateTable, updateTableStatus, deleteTable } = useTables()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [deletingTable, setDeletingTable] = useState<Table | null>(null)
  const [editingTable, setEditingTable] = useState<Table | null>(null)

  const canManage = user?.role === "Manager" || user?.role === "Super Admin"

  // Filter tables based on user's assigned floor
  // Managers, Super Admins, and users with no floor assignment can see all floors
  const filteredTables = useMemo(() => {
    if (!user) return [];

    // Managers and Super Admins can see all floors
    if (user.role === "Manager" || user.role === "Super Admin") {
      return tables;
    }

    // If user has no floor assignment (or "All"), they can see all floors
    if (!user.floor || user.floor === "All" || user.floor === "") {
      return tables;
    }

    // Filter to only show tables from user's assigned floor
    return tables.filter(table => table.floor === user.floor);
  }, [tables, user]);

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
    toast({ title: t('toasts.tableAvailable'), description: t('toasts.tableAvailableDesc', { name: table.name }) });
  }

  const handleDeleteTable = (table: Table) => {
    deleteTable(table.id);
    toast({
      title: t('toasts.tableDeleted'),
      description: t('toasts.tableDeletedDesc', { name: table.name }),
      variant: "destructive"
    });
    setDeletingTable(null);
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
          {canManage && <ManageTablesDialog />}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredTables.map((table) => (
          <Card
            key={table.id}
            className={`flex flex-col border-l-4 ${getStatusBorder(table.status)} hover:shadow-lg transition-shadow duration-200 cursor-pointer`}
            onClick={() => handleTableClick(table)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">{table.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusVariant(table.status)} className="w-fit">{t(`tables.statuses.${table.status.toLowerCase()}`)}</Badge>
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t('tables.tableActions')}</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={(e) => e.stopPropagation()}
                        onSelect={() => setEditingTable(table)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        {t('dialogs.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => e.stopPropagation()}
                        className="text-destructive"
                        onSelect={() => setDeletingTable(table)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('dialogs.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
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

      <EditTableDialog
        table={editingTable}
        open={!!editingTable}
        onOpenChange={(isOpen) => !isOpen && setEditingTable(null)}
      />

      <DeleteConfirmationDialog
        open={!!deletingTable}
        onOpenChange={(isOpen) => !isOpen && setDeletingTable(null)}
        onConfirm={() => deletingTable && handleDeleteTable(deletingTable)}
        title={t('dialogs.deleteTableTitle')}
        description={t('dialogs.deleteTableDesc', { name: deletingTable?.name || '' })}
      />
    </div>
  )
}
