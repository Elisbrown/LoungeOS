
"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AddSupplierForm } from "./add-supplier-form"
import { useSuppliers, type Supplier } from "@/context/supplier-context"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { EditSupplierForm } from "./edit-supplier-form"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useTranslation } from "@/hooks/use-translation"

export function SuppliersTable() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSuppliers()
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const { t } = useTranslation()
  
  const canManage = user?.role === "Stock Manager" || user?.role === "Manager" || user?.role === "Super Admin"

  const handleUpdate = (updated: Supplier) => {
    updateSupplier(updated)
    toast({
      title: t('toasts.supplierUpdated'),
      description: t('toasts.supplierUpdatedDesc', { name: updated.name }),
    })
    setEditingSupplier(null)
  }

  const handleDelete = (id: string) => {
    deleteSupplier(id)
    toast({
      title: t('toasts.supplierDeleted'),
      description: t('toasts.supplierDeletedDesc'),
    })
    setDeletingSupplier(null)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">{t('suppliers.title')}</CardTitle>
              <CardDescription>
                {t('suppliers.description')}
              </CardDescription>
            </div>
            {canManage && <AddSupplierForm onAddSupplier={addSupplier} />}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('suppliers.supplierName')}</TableHead>
                <TableHead>{t('suppliers.contactPerson')}</TableHead>
                <TableHead>{t('suppliers.phone')}</TableHead>
                <TableHead>{t('suppliers.email')}</TableHead>
                {canManage && (
                  <TableHead>
                    <span className="sr-only">{t('inventory.actions')}</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contactPerson || "N/A"}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell>{supplier.email || "N/A"}</TableCell>
                  {canManage && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('inventory.actions')}</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => setEditingSupplier(supplier)}>
                            <Edit className="mr-2 h-4 w-4"/>
                            {t('dialogs.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setDeletingSupplier(supplier)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4"/>
                            {t('dialogs.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {editingSupplier && (
        <EditSupplierForm
          supplier={editingSupplier}
          onUpdateSupplier={handleUpdate}
          open={!!editingSupplier}
          onOpenChange={(isOpen) => !isOpen && setEditingSupplier(null)}
        />
      )}

      {deletingSupplier && (
        <DeleteConfirmationDialog
            open={!!deletingSupplier}
            onOpenChange={(isOpen) => !isOpen && setDeletingSupplier(null)}
            onConfirm={() => handleDelete(deletingSupplier.id)}
            title={t('dialogs.deleteSupplierTitle')}
            description={t('dialogs.deleteSupplierDesc', { name: deletingSupplier.name })}
        />
      )}
    </>
  )
}
