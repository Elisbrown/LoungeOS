
"use client"

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/dashboard/header'
import { OrderSummary, type OrderItem } from '@/components/dashboard/pos/order-summary'
import { ProductGrid } from '@/components/dashboard/pos/product-grid'
import type { Meal } from '@/context/product-context'
import { useOrders } from '@/context/order-context'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useProducts } from '@/context/product-context'
import { useCategories } from '@/context/category-context'
import { useTables } from '@/context/table-context'
import { TableProvider } from '@/context/table-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, ArrowLeft } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import type { PaymentDetails } from '@/components/dashboard/pos/payment-dialog'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PageOnboarding } from '@/components/dashboard/onboarding/page-onboarding'

function PosPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  
  const { addOrder, orders, updateOrder } = useOrders()
  const { categories } = useCategories()
  const { user } = useAuth()
  const { toast } = useToast()
  const { deductIngredientsForMeal } = useProducts()
  const { updateTableStatus } = useTables();
  const { t } = useTranslation();

  useEffect(() => {
    const tableFromUrl = searchParams.get('table');
    if (tableFromUrl) {
        setSelectedTable(tableFromUrl);
        const activeOrder = orders.find(o => o.table === tableFromUrl && o.status !== "Completed");
        if (activeOrder) {
            setOrderItems(activeOrder.items);
            setActiveOrderId(activeOrder.id);
        } else {
            setOrderItems([]);
            setActiveOrderId(null);
        }
    } else {
        // If no table is specified, redirect back to tables view
        router.push('/dashboard/tables');
    }
  }, [searchParams, orders, router]);


  const handleProductClick = (product: Meal) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id)
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevItems, { id: product.id, name: product.name, price: product.price, quantity: 1, category: product.category, image: product.image || "https://placehold.co/150x150.png" }]
    })
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setOrderItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.id !== id);
      }
      return prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
    });
  };

  const handleClearOrder = () => {
    setOrderItems([])
  }
  
  const handlePlaceOrder = () => {
    if (!user) return;
    const allowedRoles = ["Waiter", "Manager", "Admin", "Super Admin", "Cashier", "Bartender"];
    if (!allowedRoles.includes(user.role)){
        toast({
            variant: "destructive",
            title: t('toasts.permissionDenied'),
            description: t('toasts.placeOrderDenied'),
        })
        return;
    }
    if (orderItems.length === 0) return;
    if (!selectedTable) {
        toast({ variant: "destructive", title: t('toasts.error'), description: t('toasts.selectTableError')});
        return;
    }

    if (activeOrderId) {
        // Update existing order - for simplicity, we don't split updates.
        const existingOrder = orders.find(o => o.id === activeOrderId);
        if (existingOrder) {
            updateOrder({ ...existingOrder, items: orderItems, timestamp: new Date() });
            toast({ title: "Order Updated", description: `Order for ${selectedTable} has been updated.`});
        }
    } else {
        // Create new order(s)
        const foodItems = orderItems.filter(item => categories.find(c => c.name === item.category)?.isFood);
        const drinkItems = orderItems.filter(item => !categories.find(c => c.name === item.category)?.isFood);
        
        const baseOrderId = `ORD-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        if (foodItems.length > 0) {
            const foodOrder = {
              id: drinkItems.length > 0 ? `${baseOrderId}-K` : baseOrderId,
              table: selectedTable,
              items: foodItems,
              status: "Pending" as const,
              timestamp: new Date(),
            }
            addOrder(foodOrder);
        }

        if (drinkItems.length > 0) {
            const drinkOrder = {
                id: foodItems.length > 0 ? `${baseOrderId}-B` : baseOrderId,
                table: selectedTable,
                items: drinkItems,
                status: "Pending" as const,
                timestamp: new Date(),
            }
            addOrder(drinkOrder);
        }
        
        updateTableStatus(selectedTable, 'Occupied');
        toast({ title: "Order Placed", description: `New order for ${selectedTable} has been sent.`});
    }

    orderItems.forEach(item => {
        deductIngredientsForMeal(item.id, item.quantity)
    })

    router.push('/dashboard/tables');
  }

  const handlePaymentSuccess = (paymentDetails: PaymentDetails) => {
    if (!user || !activeOrderId) return;
    const allowedRoles = ["Cashier", "Manager", "Admin", "Super Admin"];
      if (!allowedRoles.includes(user.role)) {
        toast({
            variant: "destructive",
            title: t('toasts.permissionDenied'),
            description: t('toasts.paymentDenied'),
        })
        return;
    }
    
    const existingOrder = orders.find(o => o.id === activeOrderId);
    if (!existingOrder) return;

    updateOrder({ ...existingOrder, status: "Completed", items: orderItems });
    updateTableStatus(selectedTable, "Available");
    
    handleClearOrder()
    router.push('/dashboard/tables');
  }

  
  const canViewPage = () => {
    if (!user) return false;
    const allowedRoles = ["Waiter", "Cashier", "Manager", "Admin", "Super Admin", "Bartender"];
    return allowedRoles.includes(user.role);
  }

  if (!canViewPage()) {
      return (
        <div className="flex min-h-screen w-full flex-col">
            <Header title={t('pos.title')} />
            <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
                <Card className="flex flex-col items-center justify-center p-10 text-center">
                    <CardHeader>
                        <div className="mx-auto bg-muted rounded-full p-4">
                            <Lock className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <CardTitle className="mt-4">{t('pos.accessDeniedTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{t('pos.accessDeniedDescription')}</p>
                    </CardContent>
                </Card>
            </main>
        </div>
      );
  }


  return (
    <>
      <div className="flex h-screen w-full flex-col">
        <PageOnboarding page="pos" />
        <Header title={t('pos.title')} />
        <main className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <ProductGrid onProductClick={handleProductClick} />
          </div>
          <div className="w-full max-w-sm border-l bg-card p-4 flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <Link href="/dashboard/tables">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to Tables
                  </Button>
              </Link>
              <div className="text-right">
                <Label htmlFor="table-select">{t('pos.selectTable')}</Label>
                <h2 id="table-select" className="text-xl font-bold">{selectedTable || "..."}</h2>
              </div>
            </div>
            <div className="flex-1">
              <OrderSummary 
                items={orderItems}
                onUpdateQuantity={handleUpdateQuantity}
                onClearOrder={handleClearOrder}
                onPaymentSuccess={handlePaymentSuccess}
                onPlaceOrder={handlePlaceOrder}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default function PosPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TableProvider>
        <PosPageContent />
      </TableProvider>
    </Suspense>
  )
}
