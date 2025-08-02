// src/lib/db/activity-logs.ts
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
        console.log("Database schema initialized.");
    }

    dbInstance = db;
    return db;
}

export type ActivityLog = {
    id: number;
    user_id: number | null;
    action: string;
    details: string | null;
    timestamp: string;
    user?: {
        name: string;
        email: string;
        avatar: string;
    };
};

export async function getActivityLogs(limit: number = 1000): Promise<ActivityLog[]> {
    const db = getDb();
    try {
        const rows = db.prepare(`
            SELECT 
                al.id,
                al.user_id,
                al.action,
                al.details,
                al.timestamp,
                u.name as user_name,
                u.email as user_email,
                u.avatar as user_avatar
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.timestamp DESC
            LIMIT ?
        `).all(limit) as any[];

        return rows.map(row => ({
            id: row.id,
            user_id: row.user_id,
            action: row.action,
            details: row.details,
            timestamp: row.timestamp,
            user: row.user_id ? {
                name: row.user_name,
                email: row.user_email,
                avatar: row.user_avatar || "https://placehold.co/100x100.png"
            } : undefined
        }));
    } finally {
        // No close
    }
}

export async function addActivityLog(userId: number | null, action: string, details: string): Promise<ActivityLog> {
    const db = getDb();
    const transaction = db.transaction((uid, act, det) => {
        const stmt = db.prepare('INSERT INTO activity_logs (user_id, action, details, timestamp) VALUES (?, ?, ?, ?)');
        const result = stmt.run(uid, act, det, new Date().toISOString());
        
        return {
            id: result.lastInsertRowid as number,
            user_id: uid,
            action: act,
            details: det,
            timestamp: new Date().toISOString()
        };
    });

    try {
        return transaction(userId, action, details);
    } finally {
        // No close
    }
}

export async function clearActivityLogs(): Promise<void> {
    const db = getDb();
    const transaction = db.transaction(() => {
        db.prepare('DELETE FROM activity_logs').run();
    });

    try {
        transaction();
    } finally {
        // No close
    }
} 