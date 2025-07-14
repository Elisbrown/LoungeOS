
"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
};

export type OrderStatus = "Pending" | "In Progress" | "Ready" | "Completed" | "Canceled";

export type Order = {
  id: string;
  table: string;
  items: OrderItem[];
  status: OrderStatus;
  timestamp: Date;
};

type OrderContextType = {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'timestamp'> & {id?: string; timestamp?: Date;}) => Promise<void>;
  updateOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  splitOrder: (orderId: string, itemsToSplit: OrderItem[]) => Promise<void>;
  mergeOrders: (fromOrderId: string, toOrderId: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  fetchOrders: () => Promise<void>;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();

  const fetchOrders = useCallback(async () => {
      const response = await fetch('/api/orders');
      const data = await response.json();
      if(response.ok) {
          setOrders(data.map((o: any) => ({ ...o, timestamp: new Date(o.timestamp) })));
      } else {
          console.error("Failed to fetch orders:", data.message);
      }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const addOrder = useCallback(async (order: Omit<Order, 'id' | 'timestamp'> & {id?: string; timestamp?: Date;}) => {
    await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
    });
    await fetchOrders();
  }, [fetchOrders]);

  const updateOrder = useCallback(async (updatedOrder: Order) => {
    await fetch(`/api/orders?id=${updatedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrder)
    });
    await fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if(orderToUpdate) {
        await updateOrder({ ...orderToUpdate, status, timestamp: new Date() });
    }
  }, [orders, updateOrder]);
  
  const deleteOrder = useCallback(async (orderId: string) => {
    await fetch(`/api/orders?id=${orderId}`, {
        method: 'DELETE',
    });
    await fetchOrders();
  }, [fetchOrders]);

  const splitOrder = useCallback(async (orderId: string, itemsToSplit: OrderItem[]) => {
      const response = await fetch('/api/orders/split', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, itemsToSplit })
      });
      if(response.ok) {
        await fetchOrders();
        const { newOrder } = await response.json();
        toast({ title: t('toasts.orderSplit'), description: t('toasts.orderSplitDesc', { newOrderId: newOrder.id }) });
      }
  }, [fetchOrders, t, toast]);

  const mergeOrders = useCallback(async (fromOrderId: string, toOrderId: string) => {
      await fetch('/api/orders/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromOrderId, toOrderId })
      });
      await fetchOrders();
      toast({ title: t('toasts.orderMerged'), description: t('toasts.orderMergedDesc', { fromId: fromOrderId, toId: toOrderId }) });
  }, [fetchOrders, t, toast]);

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder, updateOrderStatus, splitOrder, mergeOrders, deleteOrder, fetchOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
