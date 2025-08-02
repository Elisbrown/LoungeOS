
"use client"

import { useState } from 'react'
import { useOrders } from '@/context/order-context'
import { useCategories } from '@/context/category-context'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/hooks/use-translation'
import { useNotifications } from '@/context/notification-context'
import { DroppableColumn } from '@/components/dnd/dnd-components'
import { CancelDropZone } from '@/components/dnd/cancel-drop-zone'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import type { Order, OrderStatus } from '@/context/order-context'

export function BarView({ orderToCancel, setOrderToCancel }: { 
  orderToCancel: Order | null; 
  setOrderToCancel: (order: Order | null) => void 
}) {
  const { orders, updateOrderStatus } = useOrders()
  const { categories } = useCategories()
  const { toast } = useToast()
  const { t } = useTranslation()
  const { addNotification } = useNotifications()

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

  return (
    <>
      <div className="flex-1 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DroppableColumn 
            id="Pending" 
            title={t('bar.pending')} 
            orders={orderData['Pending']} 
            onUpdateStatus={handleUpdateStatus} 
            t={t} 
          />
          <DroppableColumn 
            id="In Progress" 
            title={t('bar.inProgress')} 
            orders={orderData['In Progress']} 
            onUpdateStatus={handleUpdateStatus} 
            t={t} 
          />
          <DroppableColumn 
            id="Ready" 
            title={t('bar.ready')} 
            orders={orderData['Ready']} 
            onUpdateStatus={handleUpdateStatus} 
            t={t} 
          />
        </div>
        <CancelDropZone activeId={orderToCancel?.id || null} />
      </div>

      <AlertDialog open={!!orderToCancel} onOpenChange={() => setOrderToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('bar.cancelOrder')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('bar.cancelOrderDesc', { orderId: orderToCancel?.id || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('dialogs.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm}>
              {t('bar.confirmCancel')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
