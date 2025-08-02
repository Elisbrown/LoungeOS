"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useInventory } from "@/context/inventory-context"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/use-translation"
import { Plus } from "lucide-react"

export function AddInventoryItemDialog() {
  const { addItem, categories, suppliers, fetchCategories, fetchSuppliers } = useInventory()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    description: '',
    unit: '',
    min_stock_level: 0,
    max_stock_level: 0,
    current_stock: 0,
    cost_per_unit: 0,
    supplier_id: undefined as number | undefined,
    image: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await addItem(formData)
      toast({
        title: t('toasts.success'),
        description: t('inventory.itemAdded'),
      })
      setOpen(false)
      setFormData({
        sku: '',
        name: '',
        category: '',
        description: '',
        unit: '',
        min_stock_level: 0,
        max_stock_level: 0,
        current_stock: 0,
        cost_per_unit: 0,
        supplier_id: undefined,
        image: ''
      })
    } catch (error) {
      toast({
        title: t('toasts.error'),
        description: t('inventory.addItemError'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => {
          fetchCategories()
          fetchSuppliers()
        }}>
          <Plus className="h-4 w-4 mr-2" />
          {t('inventory.addItem')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('inventory.addNewItem')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">{t('inventory.sku')} *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">{t('inventory.name')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">{t('inventory.category')} *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('inventory.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">{t('inventory.unit')} *</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                placeholder="e.g., pieces, kg, liters"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('inventory.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_stock_level">{t('inventory.minStockLevel')} *</Label>
              <Input
                id="min_stock_level"
                type="number"
                min="0"
                value={formData.min_stock_level}
                onChange={(e) => handleInputChange('min_stock_level', parseInt(e.target.value) || 0)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_stock_level">{t('inventory.maxStockLevel')}</Label>
              <Input
                id="max_stock_level"
                type="number"
                min="0"
                value={formData.max_stock_level}
                onChange={(e) => handleInputChange('max_stock_level', parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="current_stock">{t('inventory.currentStock')} *</Label>
              <Input
                id="current_stock"
                type="number"
                min="0"
                value={formData.current_stock}
                onChange={(e) => handleInputChange('current_stock', parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_per_unit">{t('inventory.costPerUnit')}</Label>
              <Input
                id="cost_per_unit"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost_per_unit}
                onChange={(e) => handleInputChange('cost_per_unit', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplier">{t('inventory.supplier')}</Label>
              <Select 
                value={formData.supplier_id?.toString() || ''} 
                onValueChange={(value) => handleInputChange('supplier_id', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('inventory.selectSupplier')} />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">{t('inventory.imageUrl')}</Label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 