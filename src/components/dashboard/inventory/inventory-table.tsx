
"use client"

import React, { useMemo } from "react"
import { MoreHorizontal, Upload, Download, File, ChevronLeft, ChevronRight } from "lucide-react"
import { useProducts, type Ingredient } from "@/context/product-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AddProductForm } from "./add-product-form"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/use-translation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const getStatusForStock = (stock: number): Ingredient['status'] => {
    if (stock <= 0) return "Out of Stock"
    if (stock < 10) return "Low Stock"
    return "In Stock"
}

const statusOptions = ["All", "In Stock", "Low Stock", "Out of Stock"];

export function InventoryTable() {
  const { ingredients, setIngredients, addIngredient } = useProducts()
  const { toast } = useToast()
  const { t } = useTranslation()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("All")
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  const getStatusVariant = (status: Ingredient['status']) => {
    switch (status) {
      case "In Stock":
        return "success"
      case "Low Stock":
        return "secondary"
      case "Out of Stock":
        return "destructive"
    }
  }
  
  const filteredIngredients = useMemo(() => {
    return ingredients.filter(ing => {
        const matchesSearch = searchTerm === "" || 
                              ing.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              ing.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || ing.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
  }, [ingredients, searchTerm, statusFilter])

  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);
  const paginatedIngredients = filteredIngredients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,sku,category,stock\n"
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "ingredient_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      try {
        const lines = text.split('\n').filter(line => line.trim() !== '')
        if (lines.length <= 1) {
            toast({ variant: "destructive", title: t('toasts.csvError'), description: t('toasts.csvEmpty') })
            return
        }
        const headers = lines[0].split(',').map(h => h.trim())
        const requiredHeaders = ['name', 'sku', 'category', 'stock']
        if (!requiredHeaders.every(h => headers.includes(h))) {
            toast({ variant: "destructive", title: t('toasts.csvError'), description: t('toasts.csvHeaders') })
            return
        }

        const newIngredients = lines.slice(1).map(line => {
            const values = line.split(',')
            const productData: any = {}
            headers.forEach((header, index) => {
                productData[header] = values[index].trim()
            })
            
            const stock = parseInt(productData.stock, 10)
            if (isNaN(stock)) {
                throw new Error(`Invalid stock value for SKU ${productData.sku}`)
            }

            return {
                name: productData.name,
                sku: productData.sku,
                category: productData.category,
                stock: stock,
                status: getStatusForStock(stock),
                image: "https://placehold.co/100x100.png",
            }
        });
        
        setIngredients(prev => [...prev, ...newIngredients]);
        toast({ title: t('toasts.importSuccess'), description: t('toasts.importSuccessDesc', { count: newIngredients.length }) })
      } catch (error) {
        toast({ variant: "destructive", title: t('toasts.importFailed'), description: t('toasts.importFailedDesc') })
        console.error("CSV Parsing Error:", error)
      } finally {
        // Reset file input
        if(event.target) {
          event.target.value = ''
        }
      }
    }
    reader.readAsText(file)
  }
  
  const handleExportCSV = () => {
    const headers = ["Name", "SKU", "Category", "Stock", "Status"];
    const rows = paginatedIngredients.map(item => [
      item.name,
      item.sku,
      item.category,
      item.stock,
      item.status
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ingredients_export_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div>
        <div className="flex items-center justify-between gap-2 mb-4">
             <div className="flex items-center gap-2">
                <Input 
                    placeholder={t('inventory.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map(status => (
                            <SelectItem key={status} value={status}>{status === 'All' ? t('inventory.allStatuses') : t(`inventory.${status.toLowerCase().replace(' ', '')}`)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                <AddProductForm onAddIngredient={addIngredient} />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                        <File className="h-4 w-4" />
                        {t('inventory.fileActions')}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('inventory.csvActions')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={handleImportClick}>
                            <Upload className="mr-2 h-4 w-4" />
                            {t('inventory.importCSV')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={handleDownloadTemplate}>
                            <Download className="mr-2 h-4 w-4" />
                            {t('inventory.downloadTemplate')}
                        </DropdownMenuItem>
                         <DropdownMenuItem onSelect={handleExportCSV}>
                            <Download className="mr-2 h-4 w-4" />
                            {t('inventory.exportCSV')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={handleFileImport}
                />
            </div>
        </div>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>{t('inventory.product')}</TableHead>
                <TableHead>{t('inventory.sku')}</TableHead>
                <TableHead>{t('inventory.category')}</TableHead>
                <TableHead>{t('inventory.stock')}</TableHead>
                <TableHead>{t('inventory.status')}</TableHead>
                <TableHead>
                    <span className="sr-only">{t('inventory.actions')}</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedIngredients.map((product) => (
                <TableRow key={product.sku}>
                    <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                        <AvatarImage src={product.image} alt={product.name} data-ai-hint="ingredient" />
                        <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {product.name}
                    </div>
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                    <Badge variant={getStatusVariant(product.status)}>
                        {t(`inventory.${product.status.toLowerCase().replace(' ', '')}`)}
                    </Badge>
                    </TableCell>
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
                        <DropdownMenuItem>{t('dialogs.edit')}</DropdownMenuItem>
                        <DropdownMenuItem>{t('dialogs.delete')}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
         <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('pagination.rowsPerPage')}</span>
                <Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
                    <SelectTrigger className="w-20">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    {t('pagination.previous')}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                >
                    {t('pagination.next')}
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    </div>
  )
}
