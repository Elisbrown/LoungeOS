
"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { OrderItem } from './order-context';
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from '@/hooks/use-translation';
import { useNotifications } from './notification-context'; 

// Represents raw materials
export type Ingredient = {
  name: string
  sku: string
  category: string
  stock: number
  status: "In Stock" | "Low Stock" | "Out of Stock"
  image: string
}

// Represents a sellable meal
export type Meal = {
  id: string
  name: string
  price: number
  category: string
  image: string
  quantity: number
}

type ProductContextType = {
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  addIngredient: (ingredient: Omit<Ingredient, 'status' | 'image'>) => Promise<void>;
  meals: Meal[];
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
  addMeal: (meal: Omit<Meal, 'id'>) => Promise<void>;
  updateMeal: (meal: Meal) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
  deductIngredientsForMeal: (mealId: string, quantity: number) => void;
  fetchMeals: () => Promise<void>;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const { t } = useTranslation()
  const { addNotification } = useNotifications(); // Get addNotification function

  const fetchMeals = useCallback(async () => {
    const response = await fetch('/api/products');
    const data = await response.json();
    if(response.ok) {
        setMeals(data);
    } else {
        console.error("Failed to fetch meals:", data.message);
    }
  }, []);
  
  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);


  const deductIngredientsForMeal = useCallback((mealId: string, quantitySold: number) => {
    setMeals(prevMeals => {
      const mealToUpdate = prevMeals.find(meal => meal.id === mealId);
      if (mealToUpdate) {
          const newQuantity = mealToUpdate.quantity - quantitySold;
          if (newQuantity < 10 && mealToUpdate.quantity >= 10) {
            addNotification({
              title: t('toasts.lowStockAlert'),
              description: t('toasts.lowStockAlertDesc', { productName: mealToUpdate.name, count: newQuantity }),
              type: 'alert'
            });
          }
          const updatedMeal = { ...mealToUpdate, quantity: newQuantity > 0 ? newQuantity : 0 };
          // This should ideally be a single API call
          fetch(`/api/products?id=${mealId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedMeal),
          });
      }
      return prevMeals.map(m => m.id === mealId ? {...m, quantity: m.quantity - quantitySold} : m);
    });
  }, [addNotification, t]);
  
  const addIngredient = useCallback(async (newIngredientData: Omit<Ingredient, 'status' | 'image'>) => {
    // This part is not fully implemented with API routes yet, but keeping the structure.
    console.warn("addIngredient via API not implemented");
  }, []);

  const addMeal = useCallback(async (mealData: Omit<Meal, 'id'>) => {
    await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealData),
    });
    await fetchMeals();
  }, [fetchMeals]);

  const updateMeal = useCallback(async (updatedMeal: Meal) => {
    const mealBeforeUpdate = meals.find(m => m.id === updatedMeal.id);
    
    await fetch(`/api/products?id=${updatedMeal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMeal),
    });

    if (mealBeforeUpdate && updatedMeal.quantity < 10 && mealBeforeUpdate.quantity >= 10) {
      addNotification({
        title: t('toasts.lowStockAlert'),
        description: t('toasts.lowStockAlertDesc', { productName: updatedMeal.name, count: updatedMeal.quantity }),
        type: 'alert'
      });
    }

    await fetchMeals();
  }, [meals, addNotification, t, fetchMeals]);

  const deleteMeal = useCallback(async (mealId: string) => {
    await fetch(`/api/products?id=${mealId}`, {
        method: 'DELETE',
    });
    await fetchMeals();
  }, [fetchMeals]);


  return (
    <ProductContext.Provider value={{ 
        ingredients, setIngredients, addIngredient, 
        meals, setMeals, addMeal, updateMeal, deleteMeal,
        deductIngredientsForMeal,
        fetchMeals,
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
