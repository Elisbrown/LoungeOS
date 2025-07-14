
// New file: Custom hook to encapsulate DND logic for kitchen/bar views

"use client"

import { useState } from 'react';
import { useSensors, useSensor, PointerSensor, KeyboardSensor, type DragStartEvent, type DragOverEvent, type DragEndEvent } from '@dnd-kit/core';
import type { Order, OrderStatus } from '@/context/order-context';

export function useDnd(
    orders: Order[],
    onStatusChange: (orderId: string, status: OrderStatus) => void,
    setOrderToCancel: (order: Order | null) => void
) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Require the mouse to move by 10 pixels before starting a drag
            // Prevents dragging when clicking a button in the card
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const activeOrder = activeId ? orders.find(o => o.id === activeId) : null;

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (over && over.id === 'cancel' && activeOrder) {
            setOrderToCancel(activeOrder);
        } else if (active && over && active.id !== over.id) {
            const overContainerId = over.data.current?.sortable?.containerId || over.id;
            const validStatuses: OrderStatus[] = ['Pending', 'In Progress', 'Ready'];
            if (validStatuses.includes(overContainerId as OrderStatus)) {
                onStatusChange(active.id as string, overContainerId as OrderStatus);
            }
        }
        setActiveId(null);
    };
    
    return {
        sensors,
        activeId,
        activeOrder,
        handleDragStart,
        handleDragEnd
    }
}
