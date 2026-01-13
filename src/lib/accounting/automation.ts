import Database from 'better-sqlite3';
import path from 'path';
import { createJournalEntry } from '../db/accounting';

function getDb(): Database.Database {
  const dbPath = path.join(process.cwd(), 'loungeos.db');
  return new Database(dbPath);
}

/**
 * Sync POS sales to journal entries
 * Creates journal entries for completed orders
 */
export function syncSalesFromPOS(startDate?: string, endDate?: string) {
  const db = getDb();
  try {
    // Get completed orders that haven't been synced to accounting
    let query = `
      SELECT 
        o.id,
        o.timestamp,
        COALESCE(SUM(oi.quantity * oi.price), 0) as total
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = 'Completed'
        AND NOT EXISTS (
          SELECT 1 FROM journal_entries je 
          WHERE je.reference = 'POS-' || o.id
        )
    `;
    
    const params: any[] = [];
    if (startDate) {
      query += ' AND DATE(o.timestamp) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND DATE(o.timestamp) <= ?';
      params.push(endDate);
    }
    
    query += ' GROUP BY o.id, o.timestamp ORDER BY o.timestamp';
    
    const stmt = db.prepare(query);
    const orders = stmt.all(...params) as any[];
    
    let syncedCount = 0;
    
    for (const order of orders) {
      try {
        // Skip if total is 0 (no items or all items free)
        if (order.total <= 0) continue;
        
        // Create journal entry for each order
        // Debit: Cash (1000)
        // Credit: Sales Revenue (4000)
        const lines = [
          {
            account_code: '1000',
            account_name: 'Cash',
            description: `POS Sale Receipt`,
            debit: order.total,
            credit: 0,
          },
          {
            account_code: '4000',
            account_name: 'Sales Revenue',
            description: `POS Sale`,
            debit: 0,
            credit: order.total,
          },
        ];
        
        createJournalEntry({
          entry_date: order.timestamp.split('T')[0],
          entry_type: 'sales',
          description: `POS Sale - Order #${order.id}`,
          reference: `POS-${order.id}`,
          lines,
          created_by: 1, // System
        });
        
        syncedCount++;
      } catch (error) {
        console.error(`Failed to sync order ${order.id}:`, error);
      }
    }
    
    return { synced: syncedCount, total: orders.length };
  } finally {
    db.close();
  }
}

/**
 * Sync inventory movements to journal entries
 * Creates entries for inventory purchases and usage
 */
export function syncInventoryMovements(startDate?: string, endDate?: string) {
  const db = getDb();
  try {
    // Get inventory movements that haven't been synced
    let query = `
      SELECT 
        m.id,
        m.movement_date,
        m.movement_type,
        m.quantity,
        m.unit_cost,
        m.notes,
        i.name as item_name
      FROM inventory_movements m
      JOIN inventory_items i ON m.item_id = i.id
      WHERE m.unit_cost > 0
        AND NOT EXISTS (
          SELECT 1 FROM journal_entries je 
          WHERE je.reference = 'INV-' || m.id
        )
    `;
    
    const params: any[] = [];
    if (startDate) {
      query += ' AND DATE(m.movement_date) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND DATE(m.movement_date) <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY m.movement_date';
    
    const stmt = db.prepare(query);
    const movements = stmt.all(...params) as any[];
    
    let syncedCount = 0;
    
    for (const movement of movements) {
      try {
        const totalCost = movement.quantity * movement.unit_cost;
        const lines = [];
        
        if (movement.movement_type === 'IN') {
          // Purchase: Debit Inventory, Credit Cash/Payables
          lines.push(
            {
              account_code: '1200',
              account_name: 'Inventory',
              description: `Purchase: ${movement.item_name}`,
              debit: totalCost,
              credit: 0,
            },
            {
              account_code: '1000',
              account_name: 'Cash',
              description: `Payment for inventory`,
              debit: 0,
              credit: totalCost,
            }
          );
        } else if (movement.movement_type === 'OUT') {
          // Usage: Debit COGS, Credit Inventory
          lines.push(
            {
              account_code: '5000',
              account_name: 'Cost of Goods Sold',
              description: `Usage: ${movement.item_name}`,
              debit: totalCost,
              credit: 0,
            },
            {
              account_code: '1200',
              account_name: 'Inventory',
              description: `Inventory reduction`,
              debit: 0,
              credit: totalCost,
            }
          );
        } else if (movement.movement_type === 'ADJUSTMENT') {
          // Adjustment: Handle gain or loss
          if (movement.quantity > 0) {
            // Gain: Debit Inventory, Credit COGS (reduction of expense)
            lines.push(
              {
                account_code: '1200',
                account_name: 'Inventory',
                description: `Inventory Adjustment (Gain): ${movement.item_name}`,
                debit: totalCost,
                credit: 0,
              },
              {
                account_code: '5000',
                account_name: 'Cost of Goods Sold',
                description: `Inventory Adjustment (Gain)`,
                debit: 0,
                credit: totalCost,
              }
            );
          } else {
            // Loss: Debit COGS, Credit Inventory
            // Note: totalCost is negative here because quantity is negative, so we take absolute value
            const absCost = Math.abs(totalCost);
            lines.push(
              {
                account_code: '5000',
                account_name: 'Cost of Goods Sold',
                description: `Inventory Adjustment (Loss): ${movement.item_name}`,
                debit: absCost,
                credit: 0,
              },
              {
                account_code: '1200',
                account_name: 'Inventory',
                description: `Inventory Adjustment (Loss)`,
                debit: 0,
                credit: absCost,
              }
            );
          }
        }
        
        if (lines.length > 0) {
          createJournalEntry({
            entry_date: movement.movement_date,
            entry_type: 'general',
            description: `Inventory ${movement.movement_type}: ${movement.item_name} - ${movement.notes || ''}`,
            reference: `INV-${movement.id}`,
            lines,
            created_by: 1, // System
          });
          
          syncedCount++;
        }
      } catch (error) {
        console.error(`Failed to sync movement ${movement.id}:`, error);
      }
    }
    
    return { synced: syncedCount, total: movements.length };
  } finally {
    db.close();
  }
}

/**
 * Sync all transactions from the system
 */
export function syncAllTransactions(startDate?: string, endDate?: string) {
  const salesSync = syncSalesFromPOS(startDate, endDate);
  const inventorySync = syncInventoryMovements(startDate, endDate);
  
  return {
    sales: salesSync,
    inventory: inventorySync,
    totalSynced: salesSync.synced + inventorySync.synced,
    totalAvailable: salesSync.total + inventorySync.total,
  };
}

/**
 * Get sync status - how many transactions are unsynced
 */
export function getSyncStatus() {
  const db = getDb();
  try {
    // Count unsynced orders
    const unsyncedOrders = db.prepare(`
      SELECT COUNT(*) as count
      FROM orders o
      WHERE o.status = 'Completed'
        AND NOT EXISTS (
          SELECT 1 FROM journal_entries je 
          WHERE je.reference = 'POS-' || o.id
        )
    `).get() as { count: number };
    
    // Count unsynced inventory movements
    const unsyncedInventory = db.prepare(`
      SELECT COUNT(*) as count
      FROM inventory_movements m
      WHERE m.unit_cost > 0
        AND NOT EXISTS (
          SELECT 1 FROM journal_entries je 
          WHERE je.reference = 'INV-' || m.id
        )
    `).get() as { count: number };
    
    return {
      unsyncedOrders: unsyncedOrders.count,
      unsyncedInventory: unsyncedInventory.count,
      totalUnsynced: unsyncedOrders.count + unsyncedInventory.count,
    };
  } finally {
    db.close();
  }
}
