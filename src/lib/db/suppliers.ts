// src/lib/db/suppliers.ts
import Database from 'better-sqlite3';
import path from 'path';
import type { Supplier } from '@/context/supplier-context';

const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'loungeos.db');

function getDb() {
  return new Database(dbPath, { fileMustExist: true });
}

export async function getSuppliers(): Promise<Supplier[]> {
  const db = getDb();
  try {
    const stmt = db.prepare('SELECT id, name, contact_person, phone, email FROM suppliers');
    const rows = stmt.all() as any[];
    return rows.map(row => ({
        ...row,
        id: String(row.id)
    }));
  } finally {
    db.close();
  }
}

export async function addSupplier(supplierData: Omit<Supplier, 'id'>): Promise<Supplier> {
  const db = getDb();
  try {
    const stmt = db.prepare('INSERT INTO suppliers (name, contact_person, phone, email) VALUES (@name, @contactPerson, @phone, @email)');
    const info = stmt.run(supplierData);
    return {
      id: String(info.lastInsertRowid),
      ...supplierData
    };
  } finally {
    db.close();
  }
}

export async function updateSupplier(updatedSupplier: Supplier): Promise<Supplier> {
  const db = getDb();
  try {
    const stmt = db.prepare('UPDATE suppliers SET name = @name, contact_person = @contactPerson, phone = @phone, email = @email WHERE id = @id');
    stmt.run(updatedSupplier);
    return updatedSupplier;
  } finally {
    db.close();
  }
}

export async function deleteSupplier(supplierId: string): Promise<{ id: string }> {
  const db = getDb();
  try {
    const stmt = db.prepare('DELETE FROM suppliers WHERE id = ?');
    stmt.run(supplierId);
    return { id: supplierId };
  } finally {
    db.close();
  }
}
