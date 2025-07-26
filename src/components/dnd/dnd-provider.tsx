// New file: DndProvider to abstract away DND context setup
"use client"

import React from 'react';
import { DndContext, useSensors, useSensor, PointerSensor, KeyboardSensor } from '@dnd-kit/core';

export function DndProvider({ children }: { children: React.ReactNode }) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(KeyboardSensor)
    );

    return (
        <DndContext sensors={sensors}>
            {children}
        </DndContext>
    );
}
