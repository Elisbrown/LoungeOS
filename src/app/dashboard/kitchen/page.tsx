"use client"

import { useState } from 'react'
import { useOrders } from '@/context/order-context'
import { useCategories } from '@/context/category-context'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/hooks/use-translation'
import { useNotifications } from '@/context/notification-context'
import { Header } from '@/components/dashboard/header'
import { KitchenView } from '@/components/dashboard/kitchen/kitchen-view'
import { DndProvider } from '@/components/dnd/dnd-provider'
import { useDnd } from '@/hooks/use-dnd'
import { DragOverlay } from '@dnd-kit/core'
import { OrderCard } from '@/components/dnd/dnd-components'
import type { Order, OrderStatus } from '@/context/order-context'

function KitchenPageContent({ orderToCancel, setOrderToCancel }: { 
  orderToCancel: Order | null; 
  setOrderToCancel: (order: Order | null) => void 
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Kitchen" />
      <main className="flex flex-1 flex-col p-4 md:p-8">
        <KitchenView orderToCancel={orderToCancel} setOrderToCancel={setOrderToCancel} />
      </main>
    </div>
  )
}

export default function KitchenPage() {
  const { orders, updateOrderStatus } = useOrders()
  const { categories } = useCategories()
  const { toast } = useToast()
  const { addNotification } = useNotifications()
  const { t } = useTranslation()
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)

  const getFoodOrders = (status: OrderStatus) => {
    return orders
      .filter(order => order.status === status && order.items.some(item => {
        // Check item name for food keywords
        const itemName = item.name.toLowerCase();
        const isFoodByName = itemName.includes('chaff') || itemName.includes('corn') ||
            itemName.includes('burger') || itemName.includes('pizza') ||
            itemName.includes('pasta') || itemName.includes('salad') || 
            itemName.includes('soup') || itemName.includes('chicken') || 
            itemName.includes('beef') || itemName.includes('fish') ||
            itemName.includes('rice') || itemName.includes('bread') || itemName.includes('cake') ||
            itemName.includes('ndomba') || itemName.includes('ndole') ||
            itemName.includes('koki') || itemName.includes('puff');
        
        if (isFoodByName) return true;
        
        // Check category string for food keywords
        const categoryStr = item.category.toLowerCase();
        const isFoodByKeyword = categoryStr.includes('food') || categoryStr.includes('meal') || 
            categoryStr.includes('dish') || categoryStr.includes('main') || 
            categoryStr.includes('appetizer') || categoryStr.includes('dessert') ||
            categoryStr.includes('snack') || categoryStr.includes('breakfast') || 
            categoryStr.includes('lunch') || categoryStr.includes('dinner');
        
        if (isFoodByKeyword) return true;
        
        // Fallback to category lookup
        const category = categories.find(c => c.name === item.category);
        return category?.isFood || false;
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
    <DndProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <KitchenPageContent orderToCancel={orderToCancel} setOrderToCancel={setOrderToCancel} />
      <DragOverlay>
        {activeOrder ? <OrderCard order={activeOrder} isDragging /> : null}
      </DragOverlay>
    </DndProvider>
  )
}
