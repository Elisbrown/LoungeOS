
"use client"

import React, { useState } from 'react';
import { useDnd } from '@/hooks/use-dnd';
import { DragOverlay } from '@dnd-kit/core';
import { useOrders, type Order, type OrderStatus } from "@/context/order-context"
import { useCategories } from "@/context/category-context"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/use-translation"
import { useNotifications } from "@/context/notification-context"
import { OrderCard, DroppableColumn } from '@/components/dnd/dnd-components';
import { CancelDropZone } from '@/components/dnd/cancel-drop-zone';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';

export function KitchenView() {
  const { orders, updateOrderStatus } = useOrders()
  const { categories } = useCategories();
  const { toast } = useToast()
  const { t } = useTranslation()
  const { addNotification } = useNotifications();
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const getFoodOrders = (status: OrderStatus) => {
    return orders
      .filter(order => order.status === status && order.items.some(item => {
        const category = categories.find(c => c.name === item.category);
        return category?.isFood; // Only include orders with at least one food item
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };
  
  const orderData = {
      'Pending': getFoodOrders('Pending'),
      'In Progress': getFoodOrders('In Progress'),
      'Ready': getFoodOrders('Ready'),
      'Canceled': getFoodOrders('Canceled'),
  };
  
  const allFoodOrders = [...orderData['Pending'], ...orderData['In Progress'], ...orderData['Ready']];

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

  const handleCancelConfirm = () => {
    if (orderToCancel) {
        updateOrderStatus(orderToCancel.id, 'Canceled');
        toast({
            title: t('toasts.orderCanceled'),
            description: t('toasts.orderCanceledDesc', { orderId: orderToCancel.id }),
            variant: "destructive"
        });
        setOrderToCancel(null);
    }
  };

  const { activeId, activeOrder, handleDragStart, handleDragEnd } = useDnd(
    allFoodOrders, 
    handleUpdateStatus,
    setOrderToCancel
  );

  return (
    <>
      <div className="flex-1 space-y-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <DroppableColumn id="Pending" title={t('kitchen.pending')} orders={orderData['Pending']} onUpdateStatus={handleUpdateStatus} t={t} />
          <DroppableColumn id="In Progress" title={t('kitchen.inProgress')} orders={orderData['In Progress']} onUpdateStatus={handleUpdateStatus} t={t} />
          <DroppableColumn id="Ready" title={t('kitchen.ready')} orders={orderData['Ready']} onUpdateStatus={handleUpdateStatus} t={t} />
        </div>
        <CancelDropZone activeId={activeId} />
      </div>
      <DragOverlay>
          {activeOrder ? <OrderCard order={activeOrder} isDragging /> : null}
      </DragOverlay>
      <DeleteConfirmationDialog
        open={!!orderToCancel}
        onOpenChange={(isOpen) => !isOpen && setOrderToCancel(null)}
        onConfirm={handleCancelConfirm}
        title={t('dialogs.cancelOrderTitle')}
        description={t('dialogs.cancelOrderDesc', { orderId: orderToCancel?.id, table: orderToCancel?.table })}
      />
    </>
  )
}
