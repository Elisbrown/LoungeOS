"use client"

// This file is updated to wrap the kitchen view in a DndProvider
import { Header } from '@/components/dashboard/header'
import { KitchenView } from '@/components/dashboard/kitchen/kitchen-view'
import { DndProvider } from '@/components/dnd/dnd-provider'
import { useTranslation } from '@/hooks/use-translation'
import { DndContext, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core'
import { useDnd } from '@/hooks/use-dnd'
import { useOrders, type OrderStatus } from '@/context/order-context'
import { useCategories } from '@/context/category-context'
import { useToast } from '@/hooks/use-toast'
import { useNotifications } from '@/context/notification-context'
import { useState } from 'react'
import type { Order } from '@/context/order-context'

function KitchenPageContent() {
  const { t } = useTranslation()
  const { orders, updateOrderStatus } = useOrders()
  const { categories } = useCategories()
  const { toast } = useToast()
  const { addNotification } = useNotifications()
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)

  const getFoodOrders = (status: OrderStatus) => {
    return orders
      .filter(order => order.status === status && order.items.some(item => {
        const category = categories.find(c => c.name === item.category);
        return category?.isFood;
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };
  
  const allFoodOrders = [
    ...getFoodOrders('Pending'), 
    ...getFoodOrders('In Progress'), 
    ...getFoodOrders('Ready')
  ];

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus)
    const order = orders.find(o => o.id === orderId)
    if (newStatus === 'Ready' && order) {
      toast({
        title: t('toasts.orderReady'),
        description: t('toasts.foodReadyDesc', { table: order.table }),
      })
      addNotification({
        title: t('toasts.orderReady'),
        description: t('toasts.foodReadyDesc', { table: order.table }),
        type: 'info'
      });
    }
  }

  const { activeId, activeOrder, handleDragStart, handleDragEnd } = useDnd(
    allFoodOrders, 
    handleUpdateStatus,
    setOrderToCancel
  );

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex min-h-screen w-full flex-col">
        <Header title={t('kitchen.title')} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <KitchenView />
        </main>
      </div>
    </DndContext>
  )
}

export default function KitchenPage() {
  return (
    <DndProvider>
      <KitchenPageContent />
    </DndProvider>
  )
}
