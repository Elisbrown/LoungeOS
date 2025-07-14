
"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useProducts } from './product-context'; 

export type Category = {
  id: string
  name: string
  productCount: number
  isFood: boolean
}

type CategoryContextType = {
  categories: Category[];
  addCategory: (categoryData: Omit<Category, 'id' | 'productCount'>) => Promise<void>;
  updateCategory: (updatedCategory: Omit<Category, 'productCount'>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
};

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { meals } = useProducts()

  const fetchCategories = useCallback(async () => {
    const response = await fetch('/api/categories');
    if (!response.ok) {
      console.error("Failed to fetch categories");
      return;
    }
    const fetchedCategories: Omit<Category, 'productCount'>[] = await response.json();
    const categoriesWithCounts = fetchedCategories.map(category => ({
      ...category,
      productCount: meals.filter(meal => meal.category === category.name).length
    }));
    setCategories(categoriesWithCounts);
  }, [meals]);

  useEffect(() => {
    if (meals.length > 0) { // Fetch categories only after meals are loaded
        fetchCategories();
    }
  }, [fetchCategories, meals]);

  const addCategory = async (categoryData: Omit<Category, 'id' | 'productCount'>) => {
    await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
    });
    await fetchCategories();
  };

  const updateCategory = async (updatedCategory: Omit<Category, 'productCount'>) => {
    await fetch(`/api/categories?id=${updatedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategory)
    });
    await fetchCategories();
  };

  const deleteCategory = async (categoryId: string) => {
    await fetch(`/api/categories?id=${categoryId}`, {
        method: 'DELETE'
    });
    await fetchCategories();
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
