
"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useProducts } from '@/context/product-context'
import type { Meal } from '@/context/product-context'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { useCategories } from '@/context/category-context'

type ProductGridProps = {
  onProductClick: (product: Meal) => void;
}

export function ProductGrid({ onProductClick }: ProductGridProps) {
  const { meals } = useProducts()
  const { categories } = useCategories()
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

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

  const productsWithAiHints = meals.map(p => ({
    ...p,
    dataAiHint: getProductDataAiHint(p.name)
  }))

  const filteredProducts = productsWithAiHints.filter(product => {
      const matchesCategory = activeTab === 'All' || product.category === activeTab;
      const matchesSearch = searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
  });

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col gap-4 mb-4">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 lg:w-auto lg:grid-flow-col">
                <TabsTrigger value="All">All</TabsTrigger>
                {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.name}>
                    {category.name}
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
                      <p className="text-sm text-muted-foreground">XAF {product.price.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
    </Tabs>
  );
}
