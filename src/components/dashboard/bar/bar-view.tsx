
"use client"

import React, { useState } from 'react';
import { useDnd } from '@/hooks/use-dnd';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useOrders, type Order, type OrderStatus } from "@/context/order-context"
import { useCategories } from "@/context/category-context"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/use-translation"
import { useNotifications } from "@/context/notification-context"
import { OrderCard, DroppableColumn } from '@/components/dnd/dnd-components';
import { CancelDropZone } from '@/components/dnd/cancel-drop-zone';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';

export function BarView() {
  const { orders, updateOrderStatus } = useOrders()
  const { categories } = useCategories();
  const { toast } = useToast()
  const { t } = useTranslation()
  const { addNotification } = useNotifications();
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const getDrinkOrders = (status: OrderStatus) => {
    return orders
      .filter(order => order.status === status && order.items.some(item => {
        const category = categories.find(c => c.name === item.category);
        return category && !category.isFood;
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };
  
  const orderData = {
      'Pending': getDrinkOrders('Pending'),
      'In Progress': getDrinkOrders('In Progress'),
      'Ready': getDrinkOrders('Ready'),
      'Canceled': getDrinkOrders('Canceled'),
  };
  
  const allDrinkOrders = [...orderData['Pending'], ...orderData['In Progress'], ...orderData['Ready']];

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

  const { sensors, activeId, activeOrder, handleDragStart, handleDragEnd } = useDnd(
    allDrinkOrders, 
    handleUpdateStatus,
    setOrderToCancel
  );


  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <DroppableColumn id="Pending" title={t('bar.pending')} orders={orderData['Pending']} onUpdateStatus={handleUpdateStatus} t={t} />
            <DroppableColumn id="In Progress" title={t('bar.inProgress')} orders={orderData['In Progress']} onUpdateStatus={handleUpdateStatus} t={t} />
            <DroppableColumn id="Ready" title={t('bar.ready')} orders={orderData['Ready']} onUpdateStatus={handleUpdateStatus} t={t} />
          </div>
          <CancelDropZone activeId={activeId} />
        </div>
        <DragOverlay>
            {activeOrder ? <OrderCard order={activeOrder} isDragging /> : null}
        </DragOverlay>
      </DndContext>
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
