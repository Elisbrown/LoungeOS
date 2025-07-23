
"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, MinusCircle, Trash2 } from "lucide-react"
import { PaymentDialog, type PaymentDetails } from "./payment-dialog"
import { useTranslation } from "@/hooks/use-translation"
import { useAuth } from "@/context/auth-context"
import { type ReceiptProps } from "./receipt"
import { type Order, type OrderItem } from "@/context/order-context"

type OrderSummaryProps = {
  items: OrderItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onClearOrder: () => void
  onPaymentSuccess: (details: PaymentDetails) => void
  onPlaceOrder: () => void
}

export function OrderSummary({ items, onUpdateQuantity, onClearOrder, onPaymentSuccess, onPlaceOrder }: OrderSummaryProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { t } = useTranslation()
  const { user } = useAuth();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSuccessfulPayment = (details: PaymentDetails) => {
    onPaymentSuccess(details)
  }

  const isOrderEmpty = items.length === 0;
  
  const canPlaceOrder = () => {
    if (!user) return false;
    const allowedRoles = ["Waiter", "Manager", "Admin", "Super Admin", "Cashier", "Bartender"];
    return allowedRoles.includes(user.role)
  }
  
  const canProcessPayment = () => {
      if (!user) return false;
      const allowedRoles = ["Cashier", "Manager", "Admin", "Super Admin"];
      return allowedRoles.includes(user.role)
  }
  
  const orderForReceipt: Omit<Order, 'id' | 'timestamp' | 'status'> = {
    table: 'POS',
    items: items
  }

  return (
    <>
    <Card className="flex h-full flex-col border-0 shadow-none">
      <CardHeader>
        <CardTitle className="font-headline">{t('pos.currentOrder')}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-y-auto pr-2">
        {items.length === 0 ? (
          <div className="text-center text-muted-foreground pt-10">
            <p>{t('pos.noItems')}</p>
            <p className="text-sm">{t('pos.getStarted')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <Image src={item.image || "https://placehold.co/150x150.png"} alt={item.name} width={40} height={40} className="rounded-md aspect-square object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-sm leading-tight">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    XAF {item.price.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <span>{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                 <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onUpdateQuantity(item.id, 0)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-4">
         <Separator />
        <div className="flex w-full justify-between font-bold text-lg">
          <span>{t('pos.total')}</span>
          <span>XAF {total.toLocaleString()}</span>
        </div>
        <div className="w-full flex gap-2">
            <Button 
                variant="outline"
                className="w-full" 
                size="lg" 
                disabled={isOrderEmpty}
                onClick={onPlaceOrder}
            >
              {t('pos.placeOrder')}
            </Button>
            <Button 
                className="w-full" 
                size="lg" 
                disabled={isOrderEmpty || !canProcessPayment()}
                onClick={() => setDialogOpen(true)}
            >
              {t('pos.chargeOrder')}
            </Button>
        </div>
      </CardFooter>
    </Card>
    <PaymentDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        totalAmount={total}
        onPaymentSuccess={handleSuccessfulPayment}
        orderForReceipt={orderForReceipt}
        onClose={() => setDialogOpen(false)}
    />
    </>
  )
}

export { OrderItem }
