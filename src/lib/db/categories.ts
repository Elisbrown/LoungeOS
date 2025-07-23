// src/lib/db/categories.ts
import Database from 'better-sqlite3';
import path from 'path';
import { type Category } from '@/context/category-context';

const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'loungeos.db');

function getDb() {
  // This should be the singleton instance from another db file if it exists
  // For now, we'll assume it might create its own connection if needed.
  return new Database(dbPath, { fileMustExist: true });
}

export async function getCategories(): Promise<Omit<Category, 'productCount'>[]> {
  const db = getDb();
  try {
    // We don't store productCount in the DB, it's a derived property.
    const stmt = db.prepare('SELECT id, name, is_food FROM categories');
    const rows = stmt.all() as { id: number, name: string, is_food: number }[];
    return rows.map(row => ({
        id: String(row.id),
        name: row.name,
        isFood: Boolean(row.is_food)
    }));
  } finally {
    db.close();
  }
}

export async function addCategory(categoryData: Omit<Category, 'id' | 'productCount'>): Promise<Omit<Category, 'productCount'>> {
  const db = getDb();
  try {
    const stmt = db.prepare('INSERT INTO categories (name, is_food) VALUES (@name, @isFood)');
    const info = stmt.run({ name: categoryData.name, isFood: Number(categoryData.isFood) });
    return {
      id: String(info.lastInsertRowid),
      name: categoryData.name,
      isFood: categoryData.isFood
    };
  } finally {
    db.close();
  }
}

export async function updateCategory(updatedCategory: Omit<Category, 'productCount'>): Promise<Omit<Category, 'productCount'>> {
  const db = getDb();
  try {
    const stmt = db.prepare('UPDATE categories SET name = @name, is_food = @isFood WHERE id = @id');
    stmt.run({
        name: updatedCategory.name,
        isFood: Number(updatedCategory.isFood),
        id: updatedCategory.id
    });
    return updatedCategory;
  } finally {
    db.close();
  }
}

export async function deleteCategory(categoryId: string): Promise<{ id: string }> {
  const db = getDb();
  try {
    // Add logic here to handle products in this category (e.g., set to null or prevent deletion)
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    stmt.run(categoryId);
    return { id: categoryId };
  } finally {
    db.close();
  }
}
