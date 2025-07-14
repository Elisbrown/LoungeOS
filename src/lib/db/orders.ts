
// src/lib/db/orders.ts
import Database from 'better-sqlite3';
import path from 'path';
import type { Order, OrderItem } from '@/context/order-context';
import fs from 'fs';

const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'loungeos.db');

let dbInstance: Database.Database | null = null;

// This function now handles creation and initialization
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
        console.log("Database schema initialized.");
    }

    dbInstance = db;
    return db;
}


// Function to get a single order, useful for transactions
function getOrderById(id: string, db: Database.Database): Order | null {
    const row = db.prepare(`
        SELECT id, table_name, status, timestamp 
        FROM orders WHERE id = ?
    `).get(id) as any;

    if (!row) return null;

    const itemStmt = db.prepare(`
        SELECT p.id, p.name, oi.quantity, oi.price, p.category, p.image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    `);
    
    const items = itemStmt.all(row.id) as any[];

    const mappedItems: OrderItem[] = items.map(item => ({
        ...item,
        id: String(item.id) // Ensure product ID is a string
    }));

    return {
        id: row.id,
        table: row.table_name,
        status: row.status,
        timestamp: new Date(row.timestamp),
        items: mappedItems,
    };
}

export async function getOrders(): Promise<Order[]> {
    const db = getDb();
    try {
        const rows = db.prepare(`
            SELECT
                o.id as order_id,
                o.table_name,
                o.status,
                o.timestamp,
                p.id as product_id,
                p.name as product_name,
                oi.quantity,
                oi.price,
                p.category,
                p.image
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            ORDER BY o.timestamp DESC
        `).all() as any[];

        const ordersMap = new Map<string, Order>();

        for (const row of rows) {
            if (!ordersMap.has(row.order_id)) {
                ordersMap.set(row.order_id, {
                    id: row.order_id,
                    table: row.table_name,
                    status: row.status,
                    timestamp: new Date(row.timestamp),
                    items: [],
                });
            }

            if (row.product_id) {
                const order = ordersMap.get(row.order_id)!;
                order.items.push({
                    id: String(row.product_id),
                    name: row.product_name,
                    price: row.price,
                    quantity: row.quantity,
                    category: row.category,
                    image: row.image,
                });
            }
        }

        return Array.from(ordersMap.values());
    } finally {
        // We no longer close the db instance here to allow reuse
    }
}


export async function addOrder(order: Omit<Order, 'id' | 'timestamp'> & { id?: string, timestamp?: Date }): Promise<Order> {
    const db = getDb();
    const transaction = db.transaction((ord) => {
        const orderId = ord.id || `ORD-${Date.now()}`;
        const timestamp = (ord.timestamp || new Date()).toISOString();

        const orderStmt = db.prepare('INSERT INTO orders (id, table_name, status, timestamp) VALUES (?, ?, ?, ?)');
        orderStmt.run(orderId, ord.table, ord.status, timestamp);

        const itemStmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
        for (const item of ord.items) {
            // Ensure product_id is a number for the foreign key
            const productId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;
            if(isNaN(productId)) throw new Error(`Invalid product ID: ${item.id}`);

            itemStmt.run(orderId, productId, item.quantity, item.price);
            // Also deduct stock
            db.prepare('UPDATE products SET quantity = quantity - ? WHERE id = ?').run(item.quantity, productId);
        }
        
        return getOrderById(orderId, db)!;
    });

    try {
        return transaction(order);
    } finally {
        // No close
    }
}


export async function updateOrder(updatedOrder: Order): Promise<Order> {
    const db = getDb();
    const transaction = db.transaction((order) => {
        // Update order status and timestamp
        db.prepare('UPDATE orders SET status = ?, timestamp = ? WHERE id = ?')
          .run(order.status, order.timestamp.toISOString(), order.id);

        // Delete old items and insert new ones to handle quantity changes
        db.prepare('DELETE FROM order_items WHERE order_id = ?').run(order.id);
        
        const itemStmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
        for (const item of order.items) {
            const productId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;
             if(isNaN(productId)) throw new Error(`Invalid product ID: ${item.id}`);
            itemStmt.run(order.id, productId, item.quantity, item.price);
        }
        return getOrderById(order.id, db)!;
    });

    try {
        return transaction(updatedOrder);
    } finally {
        // No close
    }
}

export async function deleteOrder(orderId: string): Promise<{ id: string }> {
    const db = getDb();
    const transaction = db.transaction((id) => {
        db.prepare('DELETE FROM order_items WHERE order_id = ?').run(id);
        db.prepare('DELETE FROM orders WHERE id = ?').run(id);
    });
    try {
        transaction(orderId);
        return { id: orderId };
    } finally {
        // No close
    }
}

export async function splitOrder(orderId: string, itemsToSplit: OrderItem[]): Promise<{ updatedOrder: Order, newOrder: Order }> {
    const db = getDb();
    const transaction = db.transaction((id, items) => {
        const originalOrder = getOrderById(id, db);
        if (!originalOrder) {
            throw new Error("Original order not found");
        }
        
        const newOrderId = `ORD-${Date.now()}-SPLIT`;
        const remainingItems = originalOrder.items.filter(item => !items.find(splitItem => splitItem.id === item.id));

        // Create the new order with the split items
        const newOrderData: Order = {
            id: newOrderId,
            table: originalOrder.table,
            items: items,
            status: 'Pending',
            timestamp: new Date()
        };
        addOrder(newOrderData); // This is a nested transaction which might be problematic, let's inline it
        
        const orderStmt = db.prepare('INSERT INTO orders (id, table_name, status, timestamp) VALUES (?, ?, ?, ?)');
        orderStmt.run(newOrderData.id, newOrderData.table, newOrderData.status, newOrderData.timestamp.toISOString());
        const itemStmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
        for (const item of newOrderData.items) {
            const productId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;
            itemStmt.run(newOrderData.id, productId, item.quantity, item.price);
        }


        // Update the original order with the remaining items
        originalOrder.items = remainingItems;
        if (remainingItems.length === 0) {
            // If no items left, delete original order
            deleteOrder(originalOrder.id);
        } else {
            updateOrder(originalOrder);
        }
        
        const updatedOriginal = getOrderById(id, db);
        const newCreatedOrder = getOrderById(newOrderId, db);

        return { updatedOrder: updatedOriginal, newOrder: newCreatedOrder };
    });

    try {
        // @ts-ignore
        return transaction(orderId, itemsToSplit);
    } finally {
        // No close
    }
}

export async function mergeOrders(fromOrderId: string, toOrderId: string): Promise<Order> {
    const db = getDb();
    const transaction = db.transaction((fromId, toId) => {
        const fromOrder = getOrderById(fromId, db);
        const toOrder = getOrderById(toId, db);

        if (!fromOrder || !toOrder) {
            throw new Error("One or both orders not found");
        }

        // Move items from 'from' order to 'to' order
        const itemMoveStmt = db.prepare('UPDATE order_items SET order_id = ? WHERE order_id = ?');
        itemMoveStmt.run(toId, fromId);

        // Delete the now-empty 'from' order
        db.prepare('DELETE FROM orders WHERE id = ?').run(fromId);
        
        // Update the timestamp of the 'to' order
        db.prepare('UPDATE orders SET timestamp = ? WHERE id = ?').run(new Date().toISOString(), toId);

        return getOrderById(toId, db)!;
    });

    try {
        return transaction(fromOrderId, toOrderId);
    } finally {
        // No close
    }
}
