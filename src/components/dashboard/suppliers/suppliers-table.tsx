
"use client"

import { useState, useMemo } from "react"
import { MoreHorizontal, Edit, Trash2, Search } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddSupplierForm } from "./add-supplier-form"
import { useSuppliers, type Supplier } from "@/context/supplier-context"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { EditSupplierForm } from "./edit-supplier-form"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useTranslation } from "@/hooks/use-translation"
import { Pagination } from "@/components/ui/pagination"

export function SuppliersTable() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSuppliers()
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
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

  // Filter suppliers based on search term
  const filteredSuppliers = useMemo(() => {
    if (!searchTerm) return suppliers;
    
    const search = searchTerm.toLowerCase();
    return suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(search) ||
      supplier.contactPerson?.toLowerCase().includes(search) ||
      supplier.email?.toLowerCase().includes(search) ||
      supplier.phone?.toLowerCase().includes(search)
    );
  }, [suppliers, searchTerm]);

  // Paginate filtered suppliers
  const paginatedSuppliers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSuppliers.slice(startIndex, endIndex);
  }, [filteredSuppliers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

  // Reset to page 1 when search term changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

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
        <CardContent className="space-y-4">
          {/* Search and Items Per Page */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => {
              setItemsPerPage(parseInt(value));
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              {paginatedSuppliers.length > 0 ? (
                paginatedSuppliers.map((supplier) => (
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={canManage ? 5 : 4} className="h-24 text-center">
                    {searchTerm ? 'No suppliers match your search' : 'No suppliers yet'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredSuppliers.length}
            />
          )}
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
