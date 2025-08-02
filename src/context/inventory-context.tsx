// src/context/inventory-context.tsx
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { InventoryItem, InventoryMovement, InventoryCategory, InventorySupplier } from '@/lib/db/inventory';

type InventoryContextType = {
    // Items
    items: InventoryItem[];
    addItem: (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'status' | 'supplier'>) => Promise<void>;
    updateItem: (id: number, itemData: Partial<InventoryItem>) => Promise<void>;
    deleteItem: (id: number) => Promise<void>;
    fetchItems: () => Promise<void>;
    
    // Movements
    movements: InventoryMovement[];
    addMovement: (movementData: Omit<InventoryMovement, 'id' | 'movement_date' | 'item' | 'user'>) => Promise<void>;
    fetchMovements: (itemId?: number) => Promise<void>;
    
    // Categories
    categories: InventoryCategory[];
    addCategory: (categoryData: Omit<InventoryCategory, 'id' | 'created_at'>) => Promise<void>;
    fetchCategories: () => Promise<void>;
    
    // Suppliers
    suppliers: InventorySupplier[];
    addSupplier: (supplierData: Omit<InventorySupplier, 'id' | 'created_at'>) => Promise<void>;
    updateSupplier: (supplierData: InventorySupplier) => Promise<void>;
    deleteSupplier: (supplierId: string) => Promise<void>;
    fetchSuppliers: () => Promise<void>;
    
    // Stats
    stats: {
        totalItems: number;
        lowStockItems: number;
        outOfStockItems: number;
        totalValue: number;
        recentMovements: number;
    } | null;
    fetchStats: () => Promise<void>;
    
    // Loading states
    loading: {
        items: boolean;
        movements: boolean;
        categories: boolean;
        suppliers: boolean;
        stats: boolean;
    };
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [movements, setMovements] = useState<InventoryMovement[]>([]);
    const [categories, setCategories] = useState<InventoryCategory[]>([]);
    const [suppliers, setSuppliers] = useState<InventorySupplier[]>([]);
    const [stats, setStats] = useState<InventoryContextType['stats']>(null);
    const [loading, setLoading] = useState({
        items: false,
        movements: false,
        categories: false,
        suppliers: false,
        stats: false
    });

    // Fetch items
    const fetchItems = async () => {
        setLoading(prev => ({ ...prev, items: true }));
        try {
            const response = await fetch('/api/inventory');
            if (response.ok) {
                const data = await response.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Error fetching inventory items:', error);
        } finally {
            setLoading(prev => ({ ...prev, items: false }));
        }
    };

    // Add item
    const addItem = async (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'status' | 'supplier'>) => {
        try {
            const response = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
            if (response.ok) {
                await fetchItems();
            }
        } catch (error) {
            console.error('Error adding inventory item:', error);
            throw error;
        }
    };

    // Update item
    const updateItem = async (id: number, itemData: Partial<InventoryItem>) => {
        try {
            const response = await fetch('/api/inventory', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...itemData })
            });
            if (response.ok) {
                await fetchItems();
            }
        } catch (error) {
            console.error('Error updating inventory item:', error);
            throw error;
        }
    };

    // Delete item
    const deleteItem = async (id: number) => {
        try {
            const response = await fetch('/api/inventory', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (response.ok) {
                await fetchItems();
            }
        } catch (error) {
            console.error('Error deleting inventory item:', error);
            throw error;
        }
    };

    // Fetch movements
    const fetchMovements = async (itemId?: number) => {
        setLoading(prev => ({ ...prev, movements: true }));
        try {
            const url = itemId ? `/api/inventory/movements?itemId=${itemId}` : '/api/inventory/movements';
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setMovements(data);
            }
        } catch (error) {
            console.error('Error fetching inventory movements:', error);
        } finally {
            setLoading(prev => ({ ...prev, movements: false }));
        }
    };

    // Add movement
    const addMovement = async (movementData: Omit<InventoryMovement, 'id' | 'movement_date' | 'item' | 'user'>) => {
        try {
            const response = await fetch('/api/inventory/movements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movementData)
            });
            if (response.ok) {
                await fetchMovements();
                await fetchItems(); // Refresh items to update stock levels
            }
        } catch (error) {
            console.error('Error adding inventory movement:', error);
            throw error;
        }
    };

    // Fetch categories
    const fetchCategories = async () => {
        setLoading(prev => ({ ...prev, categories: true }));
        try {
            const response = await fetch('/api/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(prev => ({ ...prev, categories: false }));
        }
    };

    // Add category
    const addCategory = async (categoryData: Omit<InventoryCategory, 'id' | 'created_at'>) => {
        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryData)
            });
            if (response.ok) {
                await fetchCategories();
            }
        } catch (error) {
            console.error('Error adding category:', error);
            throw error;
        }
    };

    // Fetch suppliers
    const fetchSuppliers = async () => {
        setLoading(prev => ({ ...prev, suppliers: true }));
        try {
            const response = await fetch('/api/suppliers');
            if (response.ok) {
                const data = await response.json();
                setSuppliers(data);
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        } finally {
            setLoading(prev => ({ ...prev, suppliers: false }));
        }
    };

    // Add supplier
    const addSupplier = async (supplierData: Omit<InventorySupplier, 'id' | 'created_at'>) => {
        try {
            const response = await fetch('/api/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supplierData)
            });
            if (response.ok) {
                await fetchSuppliers();
            }
        } catch (error) {
            console.error('Error adding supplier:', error);
            throw error;
        }
    };

    // Update supplier
    const updateSupplier = async (supplierData: InventorySupplier) => {
        try {
            const response = await fetch('/api/suppliers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supplierData)
            });
            if (response.ok) {
                await fetchSuppliers();
            }
        } catch (error) {
            console.error('Error updating supplier:', error);
            throw error;
        }
    };

    // Delete supplier
    const deleteSupplier = async (supplierId: string) => {
        try {
            const response = await fetch('/api/suppliers', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: supplierId })
            });
            if (response.ok) {
                await fetchSuppliers();
            }
        } catch (error) {
            console.error('Error deleting supplier:', error);
            throw error;
        }
    };

    // Fetch stats
    const fetchStats = async () => {
        setLoading(prev => ({ ...prev, stats: true }));
        try {
            const response = await fetch('/api/dashboard-stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data.inventory);
            }
        } catch (error) {
            console.error('Error fetching inventory stats:', error);
        } finally {
            setLoading(prev => ({ ...prev, stats: false }));
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchItems();
        fetchMovements();
        fetchCategories();
        fetchSuppliers();
        fetchStats();
    }, []);

    const value: InventoryContextType = {
        items,
        addItem,
        updateItem,
        deleteItem,
        fetchItems,
        movements,
        addMovement,
        fetchMovements,
        categories,
        addCategory,
        fetchCategories,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        fetchSuppliers,
        stats,
        fetchStats,
        loading
    };

    return (
        <InventoryContext.Provider value={value}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
}; 