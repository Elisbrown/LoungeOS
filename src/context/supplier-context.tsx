
"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

export type Supplier = {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
};

type SupplierContextType = {
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (supplierId: string) => Promise<void>;
  fetchSuppliers: () => Promise<void>;
};

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

export const SupplierProvider = ({ children }: { children: ReactNode }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const fetchSuppliers = useCallback(async () => {
    const response = await fetch('/api/suppliers');
    if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
    } else {
        console.error("Failed to fetch suppliers");
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const addSupplier = useCallback(async (supplierData: Omit<Supplier, 'id'>) => {
    await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierData)
    });
    await fetchSuppliers();
  }, [fetchSuppliers]);

  const updateSupplier = useCallback(async (updatedSupplier: Supplier) => {
    await fetch(`/api/suppliers?id=${updatedSupplier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSupplier)
    });
    await fetchSuppliers();
  }, [fetchSuppliers]);

  const deleteSupplier = useCallback(async (supplierId: string) => {
    await fetch(`/api/suppliers?id=${supplierId}`, {
        method: 'DELETE'
    });
    await fetchSuppliers();
  }, [fetchSuppliers]);

  return (
    <SupplierContext.Provider value={{ suppliers, addSupplier, updateSupplier, deleteSupplier, fetchSuppliers }}>
      {children}
    </SupplierContext.Provider>
  );
};

export const useSuppliers = () => {
  const context = useContext(SupplierContext);
  if (context === undefined) {
    throw new Error('useSuppliers must be used within a SupplierProvider');
  }
  return context;
};
