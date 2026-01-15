
"use client"

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/dashboard/header'
import { OrderSummary, type OrderItem } from '@/components/dashboard/pos/order-summary'
import { ProductGrid } from '@/components/dashboard/pos/product-grid'
import type { Meal } from '@/context/product-context'
import { useOrders } from '@/context/order-context'
import { useInventory } from '@/context/inventory-context'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useProducts } from '@/context/product-context'

import { useTables } from '@/context/table-context'
import { TableProvider } from '@/context/table-context'
import { useStaff } from '@/context/staff-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, ArrowLeft, Table as TableIcon } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import type { PaymentDetails } from '@/components/dashboard/pos/payment-dialog'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PageOnboarding } from '@/components/dashboard/onboarding/page-onboarding'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function PosPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  const { addOrder, orders, updateOrder, updateOrderStatus } = useOrders()
  const { user } = useAuth()
  const { toast } = useToast()
  const { deductIngredientsForMeal } = useProducts()
  const { updateTableStatus, tables } = useTables();
  const { items: inventoryItems, addMovement } = useInventory();
  const { staff } = useStaff();
  const { t } = useTranslation();

  useEffect(() => {
    const tableFromUrl = searchParams.get('table');
    if (tableFromUrl) {
        setSelectedTable(tableFromUrl);
        const activeOrder = orders.find(o => o.table === tableFromUrl && o.status !== "Completed" && o.status !== "Canceled");
        if (activeOrder) {
            setOrderItems(activeOrder.items.map(i => ({...i, isPersisted: true})));
            setActiveOrderId(activeOrder.id);
        } else {
            setOrderItems([]);
            setActiveOrderId(null);
        }
    }
  }, [searchParams, orders]);

  const availableTables = useMemo(() => {
    return tables.filter(table => table.status === 'Available' || table.status === 'Occupied');
  }, [tables]);

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    const activeOrder = orders.find(o => o.table === tableName && o.status !== "Completed" && o.status !== "Canceled");
    if (activeOrder) {
        setOrderItems(activeOrder.items.map(i => ({...i, isPersisted: true})));
        setActiveOrderId(activeOrder.id);
    } else {
        setOrderItems([]);
        setActiveOrderId(null);
    }
  };

  const handleProductClick = (product: Meal) => {
    // Check if this is an inventory item (packaging)
    const isInventoryItem = product.id.startsWith('inv_');
    
    if (isInventoryItem) {
      const inventoryId = parseInt(product.id.replace('inv_', ''));
      const inventoryItem = inventoryItems.find(item => item.id === inventoryId);
      
      if (inventoryItem && inventoryItem.current_stock <= 0) {
        toast({
          variant: "destructive",
          title: t('toasts.error'),
          description: `${product.name} is out of stock.`,
        });
        return;
      }
    }

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
  
  const handlePlaceOrder = async (totals: { subtotal: number, tax: number, discount: number, total: number, discountName?: string }) => {
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

    setIsPlacingOrder(true);

    try {
        // Get current user's ID from staff data
        const currentStaff = staff.find(s => s.email === user.email);
        const userId = currentStaff ? parseInt(currentStaff.id) : undefined;

        let success = false;

        if (activeOrderId) {
            // Update existing order
            const existingOrder = orders.find(o => o.id === activeOrderId);
            if (existingOrder) {
                try {
                    await updateOrder({ 
                    ...existingOrder, 
                    items: orderItems, 
                    timestamp: new Date(),
                    waiter_id: userId,
                    subtotal: totals.subtotal,
                    tax: totals.tax,
                    discount: totals.discount,
                    discountName: totals.discountName,
                    total: totals.total
                    });
                    success = true;
                    toast({ title: t('toasts.orderUpdated'), description: t('toasts.orderUpdatedDesc', { orderId: activeOrderId })});
                } catch (err) {
                    console.error("Failed to update order:", err);
                }
            }
        } else {
            // Create new order - unified (no splitting)
            const res = await addOrder({
                table: selectedTable,
                items: orderItems,
                status: "Pending",
                waiter_id: userId,
                subtotal: totals.subtotal,
                tax: totals.tax,
                discount: totals.discount,
                discountName: totals.discountName,
                total: totals.total
            });
            
            if (res) success = true;
            
            if (success) {
                updateTableStatus(selectedTable, 'Occupied');
                toast({ title: t('toasts.orderPlaced'), description: `New order for ${selectedTable} has been sent.`});
                
                // Deduct ingredients after successful placement
                orderItems.forEach(item => {
                    deductIngredientsForMeal(item.id, item.quantity)
                })
            } else {
                toast({ variant: "destructive", title: t('toasts.error'), description: "Failed to place order. Please try again." });
            }
        }
    } finally {
        setIsPlacingOrder(false);
    }
  }

  const handlePaymentSuccess = async (paymentDetails: PaymentDetails) => {
    if (!user) return;
    const allowedRoles = ["Cashier", "Manager", "Admin", "Super Admin"];
      if (!allowedRoles.includes(user.role)) {
        toast({
            variant: "destructive",
            title: t('toasts.permissionDenied'),
            description: t('toasts.paymentDenied'),
        })
        return;
    }
    
    // Get current user's ID
    const currentStaff = staff.find(s => s.email === user.email);
    const userId = currentStaff ? parseInt(currentStaff.id) : undefined;

    if (activeOrderId) {
        const existingOrder = orders.find(o => o.id === activeOrderId);
        if (existingOrder) {
            // Deduct inventory for packaging items
            existingOrder.items.forEach(item => {
              if (item.id.startsWith('inv_')) {
                const inventoryId = parseInt(item.id.replace('inv_', ''));
                addMovement({
                    item_id: inventoryId,
                    movement_type: 'OUT',
                    quantity: item.quantity,
                    reference_type: 'SALES_ORDER',
                    notes: `Sold in order ${activeOrderId} for table ${existingOrder.table}`,
                    user_id: userId
                });
              }
            });

            // Update existing order status
            await updateOrder({
                ...existingOrder,
                status: "Completed",
                timestamp: new Date(),
                subtotal: paymentDetails.subtotal,
                discount: paymentDetails.discount,
                discountName: paymentDetails.discountName,
                tax: paymentDetails.tax,
                total: paymentDetails.total,
                waiter_id: userId
            });
        }
    } else {
        // Handle new order that hasn't been placed yet
        if (orderItems.length === 0) return;
        
        const success = await addOrder({
            table: selectedTable || 'POS',
            items: orderItems,
            status: "Completed",
            waiter_id: userId,
            subtotal: paymentDetails.subtotal || 0,
            tax: paymentDetails.tax || 0,
            discount: paymentDetails.discount || 0,
            discountName: paymentDetails.discountName,
            total: paymentDetails.total
        });

        if (success) {
            // Deduct ingredients
            orderItems.forEach(item => {
                deductIngredientsForMeal(item.id, item.quantity);
                if (item.id.startsWith('inv_')) {
                    const inventoryId = parseInt(item.id.replace('inv_', ''));
                    addMovement({
                        item_id: inventoryId,
                        movement_type: 'OUT',
                        quantity: item.quantity,
                        reference_type: 'SALES_ORDER',
                        notes: `Sold in new POS order for table ${selectedTable || 'POS'}`,
                        user_id: userId
                    });
                }
            });
        }
    }
    
    handleClearOrder()
    setActiveOrderId(null);
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

  // Show table selection if no table is selected
  if (!selectedTable) {
    return (
      <div className="flex h-screen w-full flex-col">
        <PageOnboarding page="pos" />
        <Header title={t('pos.title')} />
        <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TableIcon className="h-5 w-5" />
                {t('pos.selectTable')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="table-select">{t('pos.selectTableLabel')}</Label>
                <Select onValueChange={handleTableSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('pos.selectTablePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTables.map((table) => (
                      <SelectItem key={table.id} value={table.name}>
                        {table.name} ({table.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/dashboard/tables">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    {t('tables.backToTables')}
                  </Link>
                </Button>
              </div>
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
          <div className="w-full max-w-sm border-l bg-card flex flex-col h-full overflow-hidden">
            <div className="flex-none p-4 border-b">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => setSelectedTable('')}>
                  <ArrowLeft className="mr-2 h-4 w-4"/>
                  {t('pos.changeTable')}
                </Button>
                <div className="text-right">
                  <Label htmlFor="table-select" className="text-[10px] uppercase font-bold text-muted-foreground">{t('pos.currentTable')}</Label>
                  <h2 id="table-select" className="text-xl font-black text-primary">{selectedTable}</h2>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
               <OrderSummary 
                 items={orderItems}
                 onUpdateQuantity={handleUpdateQuantity}
                 onClearOrder={handleClearOrder}
                 onPaymentSuccess={handlePaymentSuccess}
                 onPlaceOrder={handlePlaceOrder}
                 isPlacingOrder={isPlacingOrder}
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
