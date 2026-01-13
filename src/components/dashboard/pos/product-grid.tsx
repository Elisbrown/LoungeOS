
"use client"

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useProducts } from '@/context/product-context'
import { useInventory } from '@/context/inventory-context'
import type { Meal } from '@/context/product-context'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { useSettings } from '@/context/settings-context'
import { formatCurrency } from '@/lib/utils'
import { useCategories } from '@/context/category-context'

type ProductGridProps = {
  onProductClick: (product: Meal) => void;
}

export function ProductGrid({ onProductClick }: ProductGridProps) {
  const { meals } = useProducts()
  const { items: inventoryItems } = useInventory()
  const { categories } = useCategories()
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();
  const { settings } = useSettings();

  const dynamicCategories = useMemo(() => {
    const cats = categories.map(c => ({ id: c.name.toLowerCase(), name: c.name, label: c.name }));
    // Add Packaging if it's not there
    if (!cats.find(c => c.id === 'packaging')) {
        cats.push({ id: 'packaging', name: 'Packaging', label: 'Packaging' });
    }
    return [{ id: 'all', name: 'All', label: 'All' }, ...cats];
  }, [categories]);

  const getProductDataAiHint = (productName: string) => {
    const hints: { [key: string]: string } = {
      "Mojito": "mojito cocktail",
      "Cosmopolitan": "cosmopolitan cocktail",
      "Margarita": "margarita cocktail",
      "Chicken Wings": "chicken wings",
      "Beef Suya": "beef suya",
      "French Fries": "french fries",
      "Coca-Cola": "soda can",
      "Fanta": "soda can",
      "Heineken": "beer bottle",
      "Guinness": "beer bottle",
      "Cabernet Sauvignon": "wine bottle",
      "Chardonnay": "wine bottle"
    };
    return hints[productName] || "product image";
  }

  // Function to categorize products based on their category name
  const getProductCategory = (product: Meal): string => {
    const category = product.category.toLowerCase();
    
    // Check if it's a packaging item first (standardized)
    if (category.includes('packaging') || category.includes('container') || category.includes('bag') ||
        category.includes('box') || category.includes('wrapper') || category.includes('paper') ||
        category.includes('plastic') || category.includes('foil') || category.includes('straw') ||
        category.includes('cup') || category.includes('plate') || category.includes('bowl')) {
      return 'packaging';
    }
    
    // Return the actual category name (lowercase) to match dynamic categories
    return category;
  };

  // Convert inventory items to Meal format for packaging
  const packagingItems: Meal[] = inventoryItems
    .filter(item => {
      const category = item.category.toLowerCase();
      return category.includes('packaging') || category.includes('container') || category.includes('bag') ||
             category.includes('box') || category.includes('wrapper') || category.includes('paper') ||
             category.includes('plastic') || category.includes('foil') || category.includes('straw') ||
             category.includes('cup') || category.includes('plate') || category.includes('bowl') ||
             category.includes('utensil') || category.includes('napkin') || category.includes('tissue');
    })
    .map((item, index) => ({
      // Use SKU primarily, fallback to id, and add index to ensure uniqueness
      id: `inv_${item.sku || item.id}_${index}`,
      name: item.name,
      price: item.cost_per_unit ? item.cost_per_unit * 1.5 : 100, // Add markup for packaging
      category: item.category,
      image: item.image || "https://placehold.co/150x150.png",
      quantity: item.current_stock
    }));

  // Combine meals with packaging items
  const allProducts = [...meals, ...packagingItems];

  const productsWithAiHints = allProducts.map(p => ({
    ...p,
    dataAiHint: getProductDataAiHint(p.name),
    posCategory: getProductCategory(p)
  }))

  const filteredProducts = productsWithAiHints.filter(product => {
      const matchesCategory = activeTab === 'all' || product.posCategory === activeTab;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
  });

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col gap-4 mb-4">
            <TabsList className="grid w-full grid-cols-5 h-auto flex-wrap gap-1 bg-transparent border-b rounded-none mb-2">
                {dynamicCategories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full text-xs py-1 px-3 h-8 shadow-sm border border-muted hover:bg-muted transition-all"
                >
                    {category.label}
                </TabsTrigger>
                ))}
            </TabsList>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search for products..."
                    className="w-full pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

      <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden cursor-pointer hover:border-primary relative group"
                  onClick={() => product.quantity > 0 && onProductClick(product)}
                  aria-disabled={product.quantity <= 0}
                >
                  {product.quantity <= 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                        <Badge variant="destructive">{t('inventory.outofstock')}</Badge>
                    </div>
                  )}
                  <CardContent className="p-0">
                    <Image
                      src={product.image || 'https://placehold.co/150x150.png'}
                      alt={product.name}
                      width={150}
                      height={150}
                      className="h-auto w-full object-cover"
                      data-ai-hint={product.dataAiHint}
                    />
                    <div className="p-3">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{formatCurrency(product.price, settings.defaultCurrency)}</p>
                      {product.id.startsWith('inv_') && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {t('meals.inventoryItem')}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
    </Tabs>
  );
}
