
"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useAuth } from './auth-context';

export type Table = {
  id: string
  name: string
  capacity: number
  status: "Available" | "Occupied" | "Reserved"
  floor: string
}

type TableContextType = {
  tables: Table[];
  addTable: (table: Omit<Table, 'status' | 'id'>) => Promise<void>;
  updateTable: (table: Table) => Promise<void>;
  updateTableStatus: (tableName: string, status: Table['status']) => Promise<void>;
  deleteTable: (tableId: string) => Promise<void>;
  fetchTables: () => Promise<void>;
};

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider = ({ children }: { children: ReactNode }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const { user } = useAuth();
  
  const fetchTables = useCallback(async () => {
    const response = await fetch('/api/tables');
    if (response.ok) {
        const data = await response.json();
        setTables(data);
    } else {
        console.error("Failed to fetch tables");
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const addTable = useCallback(async (newTableData: Omit<Table, 'status' | 'id'>) => {
    await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTableData, userEmail: user?.email })
    });
    await fetchTables();
  }, [fetchTables, user?.email]);

  const updateTable = useCallback(async (updatedTableData: Table) => {
    await fetch(`/api/tables?id=${updatedTableData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedTableData, userEmail: user?.email })
    });
    await fetchTables();
  }, [fetchTables, user?.email]);

  const updateTableStatus = useCallback(async (tableName: string, status: Table['status']) => {
    const tableToUpdate = tables.find(table => table.name === tableName);
    if(tableToUpdate) {
        const updatedTable = { ...tableToUpdate, status };
        await updateTable(updatedTable);
    }
  }, [tables, updateTable]);

  const deleteTable = useCallback(async (tableId: string) => {
    await fetch(`/api/tables?id=${tableId}&userEmail=${encodeURIComponent(user?.email || '')}`, {
        method: 'DELETE',
    });
    await fetchTables();
  }, [fetchTables, user?.email]);

  return (
    <TableContext.Provider value={{ tables, addTable, updateTable, updateTableStatus, deleteTable, fetchTables }}>
      {children}
    </TableContext.Provider>
  );
};

export const useTables = () => {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTables must be used within a TableProvider');
  }
  return context;
};
