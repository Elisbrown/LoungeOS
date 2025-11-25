"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useTables } from "@/context/table-context"
import { useFloors } from "@/context/floor-context"
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/hooks/use-translation'
import { Layers, Trash2, MoveHorizontal } from 'lucide-react'
import type { Table } from '@/context/table-context'

export function ManageTablesDialog() {
  const { tables, updateTable, deleteTable, updateTableStatus } = useTables()
  const { floors } = useFloors()
  const { toast } = useToast()
  const { t } = useTranslation()
  
  const [open, setOpen] = useState(false)
  const [selectedTables, setSelectedTables] = useState<number[]>([])
  const [bulkAction, setBulkAction] = useState<string>('')
  const [targetFloor, setTargetFloor] = useState<string>('')
  const [targetStatus, setTargetStatus] = useState<string>('')

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTables(tables.map(t => t.id))
    } else {
      setSelectedTables([])
    }
  }

  const handleSelectTable = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedTables([...selectedTables, id])
    } else {
      setSelectedTables(selectedTables.filter(tid => tid !== id))
    }
  }

  const handleBulkAction = async () => {
    if (selectedTables.length === 0) {
      toast({
        variant: 'destructive',
        title: t('toasts.error'),
        description: 'Please select at least one table'
      })
      return
    }

    try {
      switch (bulkAction) {
        case 'move':
          if (!targetFloor) {
            toast({
              variant: 'destructive',
              title: t('toasts.error'),
              description: 'Please select a target floor'
            })
            return
          }
          for (const tableId of selectedTables) {
            const table = tables.find(t => t.id === tableId)
            if (table) {
              await updateTable({ ...table, floor: targetFloor })
            }
          }
          toast({
            title: t('toasts.success'),
            description: `${selectedTables.length} tables moved to ${targetFloor}`
          })
          break

        case 'status':
          if (!targetStatus) {
            toast({
              variant: 'destructive',
              title: t('toasts.error'),
              description: 'Please select a status'
            })
            return
          }
          for (const tableId of selectedTables) {
            const table = tables.find(t => t.id === tableId)
            if (table) {
              await updateTableStatus(table.name, targetStatus as any)
            }
          }
          toast({
            title: t('toasts.success'),
            description: `${selectedTables.length} tables updated to ${targetStatus}`
          })
          break

        case 'delete':
          for (const tableId of selectedTables) {
            await deleteTable(tableId)
          }
          toast({
            title: t('toasts.success'),
            description: `${selectedTables.length} tables deleted`,
            variant: 'destructive'
          })
          break
      }

      // Reset selections
      setSelectedTables([])
      setBulkAction('')
      setTargetFloor('')
      setTargetStatus('')
      setOpen(false)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('toasts.error'),
        description: 'Failed to perform bulk action'
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Layers className="h-4 w-4" />
          {t('tables.manageTables')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('tables.manageTables')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selection List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Select Tables</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedTables.length === tables.length && tables.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm cursor-pointer">
                  Select All ({selectedTables.length}/{tables.length})
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border rounded-md p-4">
              {tables.map((table) => (
                <div key={table.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`table-${table.id}`}
                    checked={selectedTables.includes(table.id)}
                    onCheckedChange={(checked) => handleSelectTable(table.id, checked as boolean)}
                  />
                  <label 
                    htmlFor={`table-${table.id}`} 
                    className="text-sm cursor-pointer flex-1"
                  >
                    {table.name} ({table.floor})
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Bulk Action Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Bulk Action</Label>
            
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="move">
                  <div className="flex items-center gap-2">
                    <MoveHorizontal className="h-4 w-4" />
                    Move to Floor
                  </div>
                </SelectItem>
                <SelectItem value="status">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Change Status
                  </div>
                </SelectItem>
                <SelectItem value="delete">
                  <div className="flex items-center gap-2 text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete Tables
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Conditional Inputs */}
            {bulkAction === 'move' && (
              <div>
                <Label>Target Floor</Label>
                <Select value={targetFloor} onValueChange={setTargetFloor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map((floor) => (
                      <SelectItem key={floor.id} value={floor.name}>
                        {floor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {bulkAction === 'status' && (
              <div>
                <Label>Target Status</Label>
                <Select value={targetStatus} onValueChange={setTargetStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Occupied">Occupied</SelectItem>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {bulkAction === 'delete' && (
              <div className="bg-destructive/10 border border-destructive p-4 rounded-md">
                <p className="text-sm text-destructive">
                  <strong>Warning:</strong> This action cannot be undone. {selectedTables.length} table(s) will be permanently deleted.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkAction}
            disabled={!bulkAction || selectedTables.length === 0}
            variant={bulkAction === 'delete' ? 'destructive' : 'default'}
          >
            Apply Action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
