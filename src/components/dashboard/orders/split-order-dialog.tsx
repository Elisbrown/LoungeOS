
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useOrders, type Order, type OrderItem } from "@/context/order-context"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/hooks/use-translation"

type SplitOrderDialogProps = {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SplitOrderDialog({ order, open, onOpenChange }: SplitOrderDialogProps) {
  const { splitOrder } = useOrders()
  const { t } = useTranslation()
  const [itemsToSplit, setItemsToSplit] = useState<string[]>([])

  const handleToggleItem = (itemId: string) => {
    setItemsToSplit(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    )
  }

  const handleSplit = () => {
    const selectedItems = order.items.filter(item => itemsToSplit.includes(item.id))
    if (selectedItems.length === 0 || selectedItems.length === order.items.length) {
      // Cannot split with 0 items or all items
      return
    }
    splitOrder(order.id, selectedItems)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('orders.splitOrderTitle')}</DialogTitle>
          <DialogDescription>
            {t('orders.splitOrderDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-60 overflow-y-auto">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
              <Checkbox
                id={`split-${item.id}`}
                checked={itemsToSplit.includes(item.id)}
                onCheckedChange={() => handleToggleItem(item.id)}
              />
              <Label htmlFor={`split-${item.id}`} className="flex-1 cursor-pointer">
                <div className="flex justify-between">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>XAF {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              </Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('dialogs.cancel')}</Button>
          <Button 
            onClick={handleSplit}
            disabled={itemsToSplit.length === 0 || itemsToSplit.length === order.items.length}
          >
            {t('orders.createNewOrder')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
