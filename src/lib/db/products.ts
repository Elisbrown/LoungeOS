
// src/lib/db/products.ts
import Database from 'better-sqlite3';
import path from 'path';
import type { Meal } from '@/context/product-context';
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

export async function getMeals(): Promise<Meal[]> {
  const db = getDb();
  try {
    const stmt = db.prepare('SELECT id, name, price, category, image, quantity FROM products');
    const meals = stmt.all() as any[];
    return meals.map(meal => ({
        ...meal,
        id: String(meal.id) // Ensure id is a string
    }));
  } finally {
    // No close
  }
}

export async function addMeal(mealData: Omit<Meal, 'id'>): Promise<Meal> {
  const db = getDb();
  try {
    const stmt = db.prepare('INSERT INTO products (name, price, category, image, quantity) VALUES (@name, @price, @category, @image, @quantity)');
    const info = stmt.run({
        name: mealData.name,
        price: mealData.price,
        category: mealData.category,
        image: mealData.image || 'https://placehold.co/150x150.png',
        quantity: mealData.quantity
    });
    return {
      id: String(info.lastInsertRowid),
      ...mealData
    };
  } finally {
    // No close
  }
}

export async function updateMeal(updatedMeal: Meal): Promise<Meal> {
  const db = getDb();
  try {
    const stmt = db.prepare('UPDATE products SET name = @name, price = @price, category = @category, image = @image, quantity = @quantity WHERE id = @id');
    stmt.run({
        name: updatedMeal.name,
        price: updatedMeal.price,
        category: updatedMeal.category,
        image: updatedMeal.image,
        quantity: updatedMeal.quantity,
        id: updatedMeal.id
    });
    return updatedMeal;
  } finally {
    // No close
  }
}

export async function deleteMeal(mealId: string): Promise<{ id: string }> {
  const db = getDb();
  try {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run(mealId);
    return { id: mealId };
  } finally {
    // No close
  }
}
