"use client"

import { Header } from '@/components/dashboard/header'
import { useAuth } from '@/context/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock, BookOpen, Plus, Search, ChefHat, Calculator, TrendingUp } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { useInventory } from '@/context/inventory-context'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState, useMemo } from 'react'

export default function InventoryRecipesPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { items, loading } = useInventory()
  const [searchTerm, setSearchTerm] = useState("")

  const canViewPage = () => {
    if (!user) return false
    const allowedRoles = ["Manager", "Admin", "Super Admin", "Stock Manager", "Chef"];
    return allowedRoles.includes(user.role)
  }

  // Mock recipe data - in a real app, this would come from the database
  const mockRecipes = [
    {
      id: 1,
      name: "Beef Burger",
      category: "Main Course",
      ingredients: [
        { item: "Beef Patty", quantity: 1, unit: "piece", cost: 2.50 },
        { item: "Burger Bun", quantity: 1, unit: "piece", cost: 0.50 },
        { item: "Lettuce", quantity: 0.1, unit: "kg", cost: 0.20 },
        { item: "Tomato", quantity: 0.05, unit: "kg", cost: 0.15 },
        { item: "Cheese Slice", quantity: 1, unit: "piece", cost: 0.75 }
      ],
      totalCost: 4.10,
      sellingPrice: 12.00,
      profitMargin: 65.8,
      status: "Active"
    },
    {
      id: 2,
      name: "Margherita Pizza",
      category: "Main Course",
      ingredients: [
        { item: "Pizza Base", quantity: 1, unit: "piece", cost: 1.20 },
        { item: "Tomato Sauce", quantity: 0.1, unit: "kg", cost: 0.30 },
        { item: "Mozzarella", quantity: 0.15, unit: "kg", cost: 1.50 },
        { item: "Basil", quantity: 0.02, unit: "kg", cost: 0.40 }
      ],
      totalCost: 3.40,
      sellingPrice: 15.00,
      profitMargin: 77.3,
      status: "Active"
    },
    {
      id: 3,
      name: "Caesar Salad",
      category: "Appetizer",
      ingredients: [
        { item: "Mixed Greens", quantity: 0.2, unit: "kg", cost: 1.00 },
        { item: "Chicken Breast", quantity: 0.15, unit: "kg", cost: 2.25 },
        { item: "Parmesan Cheese", quantity: 0.05, unit: "kg", cost: 0.75 },
        { item: "Croutons", quantity: 0.05, unit: "kg", cost: 0.25 },
        { item: "Caesar Dressing", quantity: 0.03, unit: "kg", cost: 0.45 }
      ],
      totalCost: 4.70,
      sellingPrice: 14.00,
      profitMargin: 66.4,
      status: "Active"
    }
  ]

  const filteredRecipes = useMemo(() => {
    return mockRecipes.filter(recipe => 
      searchTerm === "" || 
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [mockRecipes, searchTerm])

  const getProfitMarginColor = (margin: number) => {
    if (margin >= 70) return 'text-green-600'
    if (margin >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  if (!canViewPage()) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header title={t('inventory.recipes.title')} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
           <Card className="flex flex-col items-center justify-center p-10 text-center">
            <CardHeader>
                <div className="mx-auto bg-muted rounded-full p-4">
                    <Lock className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">{t('dialogs.accessDenied')}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{t('dialogs.permissionDenied')}</p>
                <p className="text-sm text-muted-foreground mt-2">{t('dialogs.contactAdmin')}</p>
            </CardContent>
           </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t('inventory.recipes.title')} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className='font-headline flex items-center gap-2'>
                  <BookOpen className="h-5 w-5" />
                  {t('inventory.recipes.recipeManagement')}
                </CardTitle>
                <CardDescription>{t('inventory.recipes.description')}</CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('inventory.recipes.addRecipe')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={t('inventory.recipes.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Recipes Table */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('inventory.recipes.recipe')}</TableHead>
                    <TableHead>{t('inventory.recipes.category')}</TableHead>
                    <TableHead>{t('inventory.recipes.ingredients')}</TableHead>
                    <TableHead>{t('inventory.recipes.cost')}</TableHead>
                    <TableHead>{t('inventory.recipes.price')}</TableHead>
                    <TableHead>{t('inventory.recipes.margin')}</TableHead>
                    <TableHead>{t('inventory.recipes.status')}</TableHead>
                    <TableHead>{t('inventory.recipes.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecipes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        {t('inventory.recipes.noRecipes')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecipes.map((recipe) => (
                      <TableRow key={recipe.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{recipe.name}</div>
                            <div className="text-sm text-muted-foreground">{recipe.ingredients.length} {t('inventory.recipes.ingredients')}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{recipe.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {recipe.ingredients.slice(0, 2).map((ingredient, index) => (
                              <div key={index} className="text-sm">
                                {ingredient.quantity} {ingredient.unit} {ingredient.item}
                              </div>
                            ))}
                            {recipe.ingredients.length > 2 && (
                              <div className="text-sm text-muted-foreground">
                                +{recipe.ingredients.length - 2} {t('inventory.recipes.more')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${recipe.totalCost.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${recipe.sellingPrice.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${getProfitMarginColor(recipe.profitMargin)}`}>
                            {recipe.profitMargin.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={recipe.status === 'Active' ? 'default' : 'secondary'}>
                            {recipe.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <ChefHat className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Calculator className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <TrendingUp className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recipe Analytics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('inventory.recipes.totalRecipes')}</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockRecipes.length}</div>
              <p className="text-xs text-muted-foreground">{t('inventory.recipes.activeRecipes')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('inventory.recipes.avgCost')}</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(mockRecipes.reduce((sum, recipe) => sum + recipe.totalCost, 0) / mockRecipes.length).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">{t('inventory.recipes.perRecipe')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('inventory.recipes.avgMargin')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(mockRecipes.reduce((sum, recipe) => sum + recipe.profitMargin, 0) / mockRecipes.length).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">{t('inventory.recipes.profitMargin')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('inventory.recipes.totalIngredients')}</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockRecipes.reduce((sum, recipe) => sum + recipe.ingredients.length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">{t('inventory.recipes.uniqueItems')}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 