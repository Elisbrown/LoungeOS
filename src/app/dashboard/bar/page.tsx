"use client"

import { useState } from 'react'
import { useOrders } from '@/context/order-context'
import { useCategories } from '@/context/category-context'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/hooks/use-translation'
import { useNotifications } from '@/context/notification-context'
import { Header } from '@/components/dashboard/header'
import { BarView } from '@/components/dashboard/bar/bar-view'
import { DndProvider } from '@/components/dnd/dnd-provider'
import { useDnd } from '@/hooks/use-dnd'
import { DragOverlay } from '@dnd-kit/core'
import { OrderCard } from '@/components/dnd/dnd-components'
import type { Order, OrderStatus } from '@/context/order-context'

function BarPageContent({ orderToCancel, setOrderToCancel }: { 
  orderToCancel: Order | null; 
  setOrderToCancel: (order: Order | null) => void 
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Bar" />
      <main className="flex flex-1 flex-col p-4 md:p-8">
        <BarView orderToCancel={orderToCancel} setOrderToCancel={setOrderToCancel} />
      </main>
    </div>
  )
}

export default function BarPage() {
  const { orders, updateOrderStatus } = useOrders()
  const { categories } = useCategories()
  const { toast } = useToast()
  const { addNotification } = useNotifications()
  const { t } = useTranslation()
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)

  const getDrinkOrders = (status: OrderStatus) => {
    return orders
      .filter(order => order.status === status && order.items.some(item => {
        // First check if item category string contains drink keywords
        const categoryStr = item.category.toLowerCase();
        const isDrinkByKeyword = categoryStr.includes('drink') || categoryStr.includes('beverage') || 
            categoryStr.includes('beer') || categoryStr.includes('wine') || 
            categoryStr.includes('cocktail') || categoryStr.includes('juice') ||
            categoryStr.includes('soda') || categoryStr.includes('coffee') || 
            categoryStr.includes('tea') || categoryStr.includes('water') || 
            categoryStr.includes('spirit') || categoryStr.includes('liquor') ||
            categoryStr.includes('whiskey') || categoryStr.includes('vodka') || 
            categoryStr.includes('rum') || categoryStr.includes('gin') || 
            categoryStr.includes('brandy') || categoryStr.includes('champagne');
        
        if (isDrinkByKeyword) return true;
        
        // Fallback to category lookup
        const category = categories.find(c => c.name === item.category);
        return category && !category.isFood;
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };
  
  const allDrinkOrders = [
    ...getDrinkOrders('Pending'), 
    ...getDrinkOrders('In Progress'), 
    ...getDrinkOrders('Ready')
  ];

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus)
    const order = orders.find(o => o.id === orderId)
    if (newStatus === 'Ready' && order) {
      toast({
        title: t('toasts.orderReady'),
        description: t('toasts.drinksReadyDesc', { table: order.table }),
      })
      addNotification({
        title: t('toasts.orderReady'),
        description: t('toasts.drinksReadyDesc', { table: order.table }),
        type: 'info'
      });
    }
  }

  const { activeId, activeOrder, handleDragStart, handleDragEnd } = useDnd(
    allDrinkOrders, 
    handleUpdateStatus,
    setOrderToCancel
  );

  return (
    <DndProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <BarPageContent orderToCancel={orderToCancel} setOrderToCancel={setOrderToCancel} />
      <DragOverlay>
        {activeOrder ? <OrderCard order={activeOrder} isDragging /> : null}
      </DragOverlay>
    </DndProvider>
  )
}
