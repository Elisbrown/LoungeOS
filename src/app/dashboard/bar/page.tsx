"use client"

// This file is updated to wrap the bar view in a DndProvider
import { Header } from '@/components/dashboard/header'
import { BarView } from '@/components/dashboard/bar/bar-view'
import { DndProvider } from '@/components/dnd/dnd-provider'
import { useTranslation } from '@/hooks/use-translation'
import { useDnd } from '@/hooks/use-dnd'
import { useOrders, type OrderStatus } from '@/context/order-context'
import { useCategories } from '@/context/category-context'
import { useToast } from '@/hooks/use-toast'
import { useNotifications } from '@/context/notification-context'
import { useState } from 'react'
import type { Order } from '@/context/order-context'

function BarPageContent() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t('bar.title')} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <BarView />
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

  const { handleDragStart, handleDragEnd } = useDnd(
    allDrinkOrders, 
    handleUpdateStatus,
    setOrderToCancel
  );

  return (
    <DndProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <BarPageContent />
    </DndProvider>
  )
}
