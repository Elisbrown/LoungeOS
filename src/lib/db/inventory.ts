// src/lib/db/inventory.ts
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'loungeos.db');
let dbInstance: Database.Database | null = null;

function getDb(): Database.Database {
    if (dbInstance && dbInstance.open) {
        return dbInstance;
    }

    const dbExists = fs.existsSync(dbPath);
    const db = new Database(dbPath, { verbose: console.log });

    if (!dbExists) {
        console.log("Database file not found, creating and initializing schema...");
        const schema = fs.readFileSync(path.join(process.cwd(), 'docs', 'database.md'), 'utf8');
        const sqlOnly = schema.split('```sql')[1].split('```')[0];
        db.exec(sqlOnly);
        
        // Create inventory tables if they don't exist
        db.exec(`
            CREATE TABLE IF NOT EXISTS inventory_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sku TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                unit TEXT NOT NULL DEFAULT 'pieces',
                min_stock_level INTEGER DEFAULT 10,
                max_stock_level INTEGER,
                current_stock INTEGER NOT NULL DEFAULT 0,
                cost_per_unit REAL,
                supplier_id INTEGER,
                image TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (supplier_id) REFERENCES inventory_suppliers(id)
            );

            CREATE TABLE IF NOT EXISTS inventory_movements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id INTEGER NOT NULL,
                movement_type TEXT NOT NULL CHECK(movement_type IN ('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER')),
                quantity INTEGER NOT NULL,
                unit_cost REAL,
                total_cost REAL,
                reference_number TEXT,
                reference_type TEXT CHECK(reference_type IN ('PURCHASE_ORDER', 'SALES_ORDER', 'ADJUSTMENT', 'TRANSFER', 'WASTE', 'THEFT', 'DAMAGE')),
                notes TEXT,
                user_id INTEGER,
                movement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (item_id) REFERENCES inventory_items(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS inventory_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                color TEXT DEFAULT '#000000',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS inventory_suppliers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                contact_person TEXT,
                phone TEXT,
                email TEXT,
                address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        console.log("Inventory database schema initialized.");
    }

    dbInstance = db;
    return db;
}

export type InventoryItem = {
    id: number;
    sku: string;
    name: string;
    category: string;
    description?: string;
    unit: string;
    min_stock_level: number;
    max_stock_level?: number;
    current_stock: number;
    cost_per_unit?: number;
    supplier_id?: number;
    image?: string;
    created_at: string;
    updated_at: string;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    supplier?: {
        name: string;
        contact_person?: string;
        phone?: string;
        email?: string;
        address?: string;
    };
};

export type InventoryMovement = {
    id: number;
    item_id: number;
    movement_type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
    quantity: number;
    unit_cost?: number;
    total_cost?: number;
    reference_number?: string;
    reference_type?: 'PURCHASE_ORDER' | 'SALES_ORDER' | 'ADJUSTMENT' | 'TRANSFER' | 'WASTE' | 'THEFT' | 'DAMAGE';
    notes?: string;
    user_id?: number;
    movement_date: string;
    item?: {
        name: string;
        sku: string;
    };
    user?: {
        name: string;
        email: string;
    };
};

export type InventoryCategory = {
    id: number;
    name: string;
    description?: string;
    color: string;
    created_at: string;
};

export type InventorySupplier = {
    id: number;
    name: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
    created_at: string;
};

const getStatusForStock = (currentStock: number, minStockLevel: number): 'In Stock' | 'Low Stock' | 'Out of Stock' => {
    if (currentStock <= 0) return 'Out of Stock';
    if (currentStock < minStockLevel) return 'Low Stock';
    return 'In Stock';
};

export async function getInventoryItems(): Promise<InventoryItem[]> {
    const db = getDb();
    try {
        const rows = db.prepare(`
            SELECT 
                i.*,
                s.name as supplier_name,
                s.contact_person as supplier_contact_person,
                s.phone as supplier_phone,
                s.email as supplier_email,
                s.address as supplier_address
            FROM inventory_items i
            LEFT JOIN inventory_suppliers s ON i.supplier_id = s.id
            ORDER BY i.name
        `).all() as any[];

        return rows.map(row => ({
            ...row,
            status: getStatusForStock(row.current_stock, row.min_stock_level),
            supplier: row.supplier_id ? {
                name: row.supplier_name,
                contact_person: row.supplier_contact_person,
                phone: row.supplier_phone,
                email: row.supplier_email,
                address: row.supplier_address
            } : undefined
        }));
    } finally {
        // No close
    }
}

export async function getInventoryItemById(id: number): Promise<InventoryItem | null> {
    const db = getDb();
    try {
        const row = db.prepare(`
            SELECT 
                i.*,
                s.name as supplier_name,
                s.contact_person as supplier_contact_person,
                s.phone as supplier_phone,
                s.email as supplier_email,
                s.address as supplier_address
            FROM inventory_items i
            LEFT JOIN inventory_suppliers s ON i.supplier_id = s.id
            WHERE i.id = ?
        `).get(id) as any;

        if (!row) return null;

        return {
            ...row,
            status: getStatusForStock(row.current_stock, row.min_stock_level),
            supplier: row.supplier_id ? {
                name: row.supplier_name,
                contact_person: row.supplier_contact_person,
                phone: row.supplier_phone,
                email: row.supplier_email,
                address: row.supplier_address
            } : undefined
        };
    } finally {
        // No close
    }
}

export async function addInventoryItem(itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'status' | 'supplier'>): Promise<InventoryItem> {
    const db = getDb();
    try {
        const transaction = db.transaction((data) => {
            const stmt = db.prepare(`
                INSERT INTO inventory_items (
                    sku, name, category, description, unit, min_stock_level, 
                    max_stock_level, current_stock, cost_per_unit, supplier_id, image
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            const result = stmt.run(
                data.sku,
                data.name,
                data.category,
                data.description || null,
                data.unit,
                data.min_stock_level,
                data.max_stock_level || null,
                data.current_stock,
                data.cost_per_unit || null,
                data.supplier_id || null,
                data.image || null
            );
            
            return result.lastInsertRowid as number;
        });
        
        const newId = transaction(itemData);
        return await getInventoryItemById(newId) as InventoryItem;
    } finally {
        // No close
    }
}

export async function updateInventoryItem(id: number, itemData: Partial<InventoryItem>): Promise<InventoryItem> {
    const db = getDb();
    try {
        const transaction = db.transaction((itemId, data) => {
            const fields = Object.keys(data).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'status' && key !== 'supplier');
            const setClause = fields.map(field => `${field} = ?`).join(', ');
            const values = fields.map(field => (data as any)[field]);
            
            const stmt = db.prepare(`UPDATE inventory_items SET ${setClause}, updated_at = ? WHERE id = ?`);
            stmt.run(...values, new Date().toISOString(), itemId);
            
            return itemId;
        });
        
        transaction(id, itemData);
        return await getInventoryItemById(id) as InventoryItem;
    } finally {
        // No close
    }
}

export async function deleteInventoryItem(id: number): Promise<void> {
    const db = getDb();
    try {
        const transaction = db.transaction((itemId) => {
            // Delete related movements first
            db.prepare('DELETE FROM inventory_movements WHERE item_id = ?').run(itemId);
            // Delete the item
            db.prepare('DELETE FROM inventory_items WHERE id = ?').run(itemId);
        });
        
        transaction(id);
    } finally {
        // No close
    }
}

export async function addInventoryMovement(movementData: Omit<InventoryMovement, 'id' | 'movement_date' | 'item' | 'user'>): Promise<InventoryMovement> {
    const db = getDb();
    try {
        const transaction = db.transaction((data) => {
            // Calculate total cost if unit cost is provided
            const totalCost = data.unit_cost ? data.unit_cost * data.quantity : null;
            
            // Insert movement record
            const movementStmt = db.prepare(`
                INSERT INTO inventory_movements (
                    item_id, movement_type, quantity, unit_cost, total_cost,
                    reference_number, reference_type, notes, user_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            const movementResult = movementStmt.run(
                data.item_id,
                data.movement_type,
                data.quantity,
                data.unit_cost || null,
                totalCost,
                data.reference_number || null,
                data.reference_type || null,
                data.notes || null,
                data.user_id || null
            );
            
            // Update item stock
            const stockChange = data.movement_type === 'IN' ? data.quantity : -data.quantity;
            const itemStmt = db.prepare('UPDATE inventory_items SET current_stock = current_stock + ?, updated_at = ? WHERE id = ?');
            itemStmt.run(stockChange, new Date().toISOString(), data.item_id);
            
            return movementResult.lastInsertRowid as number;
        });
        
        const newMovementId = transaction(movementData);
        return await getInventoryMovementById(newMovementId) as InventoryMovement;
    } finally {
        // No close
    }
}

export async function getInventoryMovements(itemId?: number, limit: number = 100): Promise<InventoryMovement[]> {
    const db = getDb();
    try {
        let query = `
            SELECT 
                m.*,
                i.name as item_name,
                i.sku as item_sku,
                u.name as user_name,
                u.email as user_email
            FROM inventory_movements m
            LEFT JOIN inventory_items i ON m.item_id = i.id
            LEFT JOIN users u ON m.user_id = u.id
        `;
        
        const params: any[] = [];
        if (itemId) {
            query += ' WHERE m.item_id = ?';
            params.push(itemId);
        }
        
        query += ' ORDER BY m.movement_date DESC LIMIT ?';
        params.push(limit);
        
        const rows = db.prepare(query).all(...params) as any[];
        
        return rows.map(row => ({
            ...row,
            item: {
                name: row.item_name,
                sku: row.item_sku
            },
            user: row.user_id ? {
                name: row.user_name,
                email: row.user_email
            } : undefined
        }));
    } finally {
        // No close
    }
}

export async function getInventoryMovementById(id: number): Promise<InventoryMovement | null> {
    const db = getDb();
    try {
        const row = db.prepare(`
            SELECT 
                m.*,
                i.name as item_name,
                i.sku as item_sku,
                u.name as user_name,
                u.email as user_email
            FROM inventory_movements m
            LEFT JOIN inventory_items i ON m.item_id = i.id
            LEFT JOIN users u ON m.user_id = u.id
            WHERE m.id = ?
        `).get(id) as any;

        if (!row) return null;

        return {
            ...row,
            item: {
                name: row.item_name,
                sku: row.item_sku
            },
            user: row.user_id ? {
                name: row.user_name,
                email: row.user_email
            } : undefined
        };
    } finally {
        // No close
    }
}

export async function getInventoryCategories(): Promise<InventoryCategory[]> {
    const db = getDb();
    try {
        return db.prepare('SELECT * FROM inventory_categories ORDER BY name').all() as InventoryCategory[];
    } finally {
        // No close
    }
}

export async function addInventoryCategory(categoryData: Omit<InventoryCategory, 'id' | 'created_at'>): Promise<InventoryCategory> {
    const db = getDb();
    try {
        const stmt = db.prepare('INSERT INTO inventory_categories (name, description, color) VALUES (?, ?, ?)');
        const result = stmt.run(categoryData.name, categoryData.description || null, categoryData.color);
        
        return {
            id: result.lastInsertRowid as number,
            ...categoryData,
            created_at: new Date().toISOString()
        };
    } finally {
        // No close
    }
}

export async function getInventorySuppliers(): Promise<InventorySupplier[]> {
    const db = getDb();
    try {
        return db.prepare('SELECT * FROM inventory_suppliers ORDER BY name').all() as InventorySupplier[];
    } finally {
        // No close
    }
}

export async function addInventorySupplier(supplierData: Omit<InventorySupplier, 'id' | 'created_at'>): Promise<InventorySupplier> {
    const db = getDb();
    try {
        const stmt = db.prepare(`
            INSERT INTO inventory_suppliers (name, contact_person, phone, email, address) 
            VALUES (?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            supplierData.name,
            supplierData.contact_person || null,
            supplierData.phone || null,
            supplierData.email || null,
            supplierData.address || null
        );
        
        return {
            id: result.lastInsertRowid as number,
            ...supplierData,
            created_at: new Date().toISOString()
        };
    } finally {
        // No close
    }
}

export async function updateInventorySupplier(supplierData: InventorySupplier): Promise<InventorySupplier> {
    const db = getDb();
    try {
        const stmt = db.prepare(`
            UPDATE inventory_suppliers 
            SET name = ?, contact_person = ?, phone = ?, email = ?, address = ?
            WHERE id = ?
        `);
        stmt.run(
            supplierData.name,
            supplierData.contact_person || null,
            supplierData.phone || null,
            supplierData.email || null,
            supplierData.address || null,
            supplierData.id
        );
        
        return supplierData;
    } finally {
        // No close
    }
}

export async function deleteInventorySupplier(supplierId: number): Promise<void> {
    const db = getDb();
    try {
        const stmt = db.prepare('DELETE FROM inventory_suppliers WHERE id = ?');
        stmt.run(supplierId);
    } finally {
        // No close
    }
}

export async function getInventoryStats(): Promise<{
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalValue: number;
    recentMovements: number;
}> {
    const db = getDb();
    try {
        const totalItems = db.prepare('SELECT COUNT(*) as count FROM inventory_items').get() as any;
        const lowStockItems = db.prepare('SELECT COUNT(*) as count FROM inventory_items WHERE current_stock < min_stock_level AND current_stock > 0').get() as any;
        const outOfStockItems = db.prepare('SELECT COUNT(*) as count FROM inventory_items WHERE current_stock <= 0').get() as any;
        const totalValue = db.prepare('SELECT SUM(current_stock * COALESCE(cost_per_unit, 0)) as total FROM inventory_items').get() as any;
        const recentMovements = db.prepare('SELECT COUNT(*) as count FROM inventory_movements WHERE movement_date >= datetime(\'now\', \'-7 days\')').get() as any;
        
        return {
            totalItems: totalItems.count,
            lowStockItems: lowStockItems.count,
            outOfStockItems: outOfStockItems.count,
            totalValue: totalValue.total || 0,
            recentMovements: recentMovements.count
        };
    } finally {
        // No close
    }
} 