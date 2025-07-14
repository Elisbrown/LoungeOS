// src/lib/db/tickets.ts
import Database from 'better-sqlite3';
import path from 'path';
import type { Ticket, TicketComment } from '@/context/ticket-context';

const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'loungeos.db');

function getDb() {
  return new Database(dbPath, { fileMustExist: true });
}

export async function getTickets(): Promise<Ticket[]> {
    const db = getDb();
    try {
        const stmt = db.prepare(`
            SELECT t.id, t.title, t.description, t.priority, t.category, t.status, t.created_at,
                   c.email as creatorId, c.name as creatorName,
                   a.email as assigneeId, a.name as assigneeName
            FROM tickets t
            JOIN users c ON t.creator_id = c.id
            LEFT JOIN users a ON t.assignee_id = a.id
            ORDER BY t.updated_at DESC
        `);
        const rows = stmt.all() as any[];
        // Note: Comments are not stored in the DB in this schema version.
        // Returning an empty array for comments.
        return rows.map(row => ({
            id: String(row.id),
            title: row.title,
            description: row.description,
            priority: row.priority,
            category: row.category,
            status: row.status,
            timestamp: new Date(row.created_at),
            creatorId: row.creatorId,
            creatorName: row.creatorName,
            assignee: row.assigneeId ? { id: row.assigneeId, name: row.assigneeName } : undefined,
            comments: [] // Comments need a separate table if they are to be persisted
        }));
    } finally {
        db.close();
    }
}

export async function addTicket(ticketData: Omit<Ticket, 'id' | 'timestamp' | 'status' | 'assignee'| 'comments'>): Promise<Ticket> {
    const db = getDb();
    try {
        const creator = db.prepare('SELECT id FROM users WHERE email = ?').get(ticketData.creatorId) as {id: number};
        if (!creator) throw new Error("Creator not found");

        const stmt = db.prepare('INSERT INTO tickets (title, description, priority, category, creator_id) VALUES (@title, @description, @priority, @category, @creator_id)');
        const info = stmt.run({
            title: ticketData.title,
            description: ticketData.description,
            priority: ticketData.priority,
            category: ticketData.category,
            creator_id: creator.id
        });
        
        // This is a simplified return, as comments/assignee are not set on creation
        return {
            ...ticketData,
            id: String(info.lastInsertRowid),
            timestamp: new Date(),
            status: "Open",
            comments: []
        };

    } finally {
        db.close();
    }
}

export async function updateTicket(updatedTicket: Ticket): Promise<Ticket> {
    const db = getDb();
    try {
        const assignee = updatedTicket.assignee ? db.prepare('SELECT id FROM users WHERE email = ?').get(updatedTicket.assignee.id) as { id: number } : null;

        const stmt = db.prepare('UPDATE tickets SET status = @status, assignee_id = @assignee_id, updated_at = datetime("now") WHERE id = @id');
        stmt.run({
            status: updatedTicket.status,
            assignee_id: assignee ? assignee.id : null,
            id: updatedTicket.id
        });
        return updatedTicket;
    } finally {
        db.close();
    }
}

export async function addComment(ticketId: string, comment: TicketComment): Promise<Ticket> {
    // Comments are not persisted in the current DB schema. 
    // This function needs implementation if a 'comments' table is added.
    const db = getDb();
    try {
        const ticket = (await getTickets()).find(t => t.id === ticketId);
        if(!ticket) throw new Error("Ticket not found");
        console.warn("Comment persistence is not implemented in the current database schema.");
        // To make it appear in the UI, we just return the ticket as if it was updated
        return ticket; 
    } finally {
        db.close();
    }
}
