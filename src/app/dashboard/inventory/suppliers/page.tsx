"use client"

import { useState, useMemo } from 'react'
import { Header } from '@/components/dashboard/header'
import { useAuth } from '@/context/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock, Truck, Plus, Search, Phone, Mail, MapPin, Edit, Trash2, MoreHorizontal, ArrowUpDown } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { useInventory } from '@/context/inventory-context'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { AddSupplierForm } from '@/components/dashboard/suppliers/add-supplier-form'
import { EditSupplierForm } from '@/components/dashboard/suppliers/edit-supplier-form'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type SortField = 'name' | 'contact_person' | 'phone' | 'email'
type SortDirection = 'asc' | 'desc'

export default function InventorySuppliersPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { suppliers, loading, addSupplier, updateSupplier, deleteSupplier } = useInventory()
  const { toast } = useToast()
  
  // State management
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [editingSupplier, setEditingSupplier] = useState<any>(null)
  const [deletingSupplier, setDeletingSupplier] = useState<any>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const canViewPage = () => {
    if (!user) return false
    const allowedRoles = ["Manager", "Admin", "Super Admin", "Stock Manager"];
    return allowedRoles.includes(user.role)
  }

  const canManage = () => {
    if (!user) return false
    const allowedRoles = ["Manager", "Admin", "Super Admin", "Stock Manager"];
    return allowedRoles.includes(user.role)
  }

  // Filtered and sorted suppliers
  const filteredSuppliers = useMemo(() => {
    let filtered = suppliers.filter(supplier => 
      searchTerm === "" || 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Sort suppliers
    filtered.sort((a, b) => {
      let aValue = a[sortField] || ''
      let bValue = b[sortField] || ''
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase()
      if (typeof bValue === 'string') bValue = bValue.toLowerCase()
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [suppliers, searchTerm, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage)
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // CRUD operations
  const handleAddSupplier = async (supplierData: any) => {
    try {
      await addSupplier(supplierData)
      toast({
        title: t('toasts.supplierAdded'),
        description: t('toasts.supplierAddedDesc', { name: supplierData.name }),
      })
      setShowAddForm(false)
    } catch (error) {
      toast({
        title: t('toasts.error'),
        description: t('toasts.supplierAddError'),
        variant: 'destructive',
      })
    }
  }

  const handleUpdateSupplier = async (updatedSupplier: any) => {
    try {
      await updateSupplier(updatedSupplier)
      toast({
        title: t('toasts.supplierUpdated'),
        description: t('toasts.supplierUpdatedDesc', { name: updatedSupplier.name }),
      })
      setEditingSupplier(null)
    } catch (error) {
      toast({
        title: t('toasts.error'),
        description: t('toasts.supplierUpdateError'),
        variant: 'destructive',
      })
    }
  }

  const handleDeleteSupplier = async (supplierId: string) => {
    try {
      await deleteSupplier(supplierId)
      toast({
        title: t('toasts.supplierDeleted'),
        description: t('toasts.supplierDeletedDesc'),
      })
      setDeletingSupplier(null)
    } catch (error) {
      toast({
        title: t('toasts.error'),
        description: t('toasts.supplierDeleteError'),
        variant: 'destructive',
      })
    }
  }

  if (!canViewPage()) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title={t('inventory.suppliers.title')} />
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
      <Header title={t('inventory.suppliers.title')} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className='font-headline flex items-center gap-2'>
                  <Truck className="h-5 w-5" />
                  {t('inventory.suppliers.manageSuppliers')}
                </CardTitle>
                <CardDescription>{t('inventory.suppliers.description')}</CardDescription>
              </div>
              {canManage() && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('inventory.suppliers.addSupplier')}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={t('inventory.suppliers.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('common.itemsPerPage')}:</span>
                <Select value={itemsPerPage.toString()} disabled>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Suppliers Table */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 hover:bg-transparent p-0 h-auto font-semibold"
                      >
                        {t('inventory.suppliers.name')}
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('contact_person')}
                        className="flex items-center gap-1 hover:bg-transparent p-0 h-auto font-semibold"
                      >
                        {t('inventory.suppliers.contactPerson')}
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('phone')}
                        className="flex items-center gap-1 hover:bg-transparent p-0 h-auto font-semibold"
                      >
                        {t('inventory.suppliers.phone')}
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('email')}
                        className="flex items-center gap-1 hover:bg-transparent p-0 h-auto font-semibold"
                      >
                        {t('inventory.suppliers.email')}
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>{t('inventory.suppliers.address')}</TableHead>
                    {canManage() && (
                      <TableHead className="text-right">{t('inventory.actions')}</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading.suppliers ? (
                    <TableRow>
                      <TableCell colSpan={canManage() ? 6 : 5} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span className="ml-2">{t('common.loading')}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginatedSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canManage() ? 6 : 5} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Truck className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">{t('inventory.suppliers.noSuppliers')}</p>
                          {searchTerm && (
                            <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                              {t('common.clearSearch')}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSuppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">
                          {supplier.name}
                        </TableCell>
                        <TableCell>
                          {supplier.contact_person || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {supplier.phone || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {supplier.email || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {supplier.address || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        {canManage() && (
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">{t('inventory.actions')}</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t('inventory.actions')}</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setEditingSupplier(supplier)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  {t('dialogs.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setDeletingSupplier(supplier)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t('dialogs.delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  {t('common.showingResults', {
                    start: (currentPage - 1) * itemsPerPage + 1,
                    end: Math.min(currentPage * itemsPerPage, filteredSuppliers.length),
                    total: filteredSuppliers.length
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    {t('common.previous')}
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Supplier Form */}
        {showAddForm && (
          <AddSupplierForm
            onAddSupplier={handleAddSupplier}
            open={showAddForm}
            onOpenChange={setShowAddForm}
          />
        )}

        {/* Edit Supplier Form */}
        {editingSupplier && (
          <EditSupplierForm
            supplier={editingSupplier}
            onUpdateSupplier={handleUpdateSupplier}
            open={!!editingSupplier}
            onOpenChange={(isOpen) => !isOpen && setEditingSupplier(null)}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {deletingSupplier && (
          <DeleteConfirmationDialog
            open={!!deletingSupplier}
            onOpenChange={(isOpen) => !isOpen && setDeletingSupplier(null)}
            onConfirm={() => handleDeleteSupplier(deletingSupplier.id)}
            title={t('dialogs.deleteSupplierTitle')}
            description={t('dialogs.deleteSupplierDesc', { name: deletingSupplier.name })}
          />
        )}
      </main>
    </div>
  )
} 