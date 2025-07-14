
"use client"

import React, { useState, useRef } from "react"
import ReactDOMServer from 'react-dom/server';
import { formatDistanceToNow } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useOrders, type Order } from "@/context/order-context"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { useTranslation } from "@/hooks/use-translation"
import { PaymentDialog, type PaymentDetails } from "@/components/dashboard/pos/payment-dialog"
import { Receipt, type ReceiptProps } from "@/components/dashboard/pos/receipt"
import { SplitOrderDialog } from "./split-order-dialog"
import { MergeOrderDialog } from "./merge-order-dialog"
import { MinusCircle, PlusCircle, Trash2, Printer } from "lucide-react"
import { useSettings } from "@/context/settings-context";


export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
}: {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { updateOrder } = useOrders()
  const [isPaymentOpen, setPaymentOpen] = useState(false)
  const [isSplitOpen, setSplitOpen] = useState(false)
  const [isMergeOpen, setMergeOpen] = useState(false)
  const [editableOrder, setEditableOrder] = useState<Order | null>(order)
  
  const { toast } = useToast()
  const { user } = useAuth()
  const { t } = useTranslation()
  const { settings } = useSettings();
  
  const handlePrint = () => {
    if (!editableOrder || !user) return;
    
    const invoiceProps: ReceiptProps = {
        type: 'Invoice',
        orderId: editableOrder.id,
        table: editableOrder.table,
        items: editableOrder.items,
        subtotal: total,
        total: total,
        totalDue: total,
        timestamp: new Date(),
        cashierName: user.name,
        settings: settings, // Pass settings explicitly
    };

    const printContent = ReactDOMServer.renderToString(
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap');
          body { -webkit-print-color-adjust: exact; }
        `}</style>
        <Receipt {...invoiceProps} />
      </>
    );

    const printWindow = window.open('', '', 'height=600,width=400');
    if (printWindow) {
        printWindow.document.write('<html><head><title>Print Invoice</title>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        
        // Use a timeout to ensure content is loaded before printing
        setTimeout(() => {
           printWindow.print();
           printWindow.close();
        }, 500);
    }
  };


  React.useEffect(() => {
    setEditableOrder(order)
  }, [order])
  

  if (!order || !editableOrder) return null

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Pending": return "destructive"
      case "In Progress": return "secondary"
      case "Ready": return "default"
      default: return "outline"
    }
  }
  
  const total = editableOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  
  const handlePaymentSuccess = (paymentDetails: PaymentDetails) => {
    if (!user) return
    const completedOrder = { ...editableOrder, status: "Completed" as const }
    updateOrder(completedOrder)
  }
  
  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    setEditableOrder(prev => {
        if (!prev) return null;
        const newItems = prev.items.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
        ).filter(item => item.quantity > 0);
        return { ...prev, items: newItems };
    });
  }

  const handleSaveChanges = () => {
    if(JSON.stringify(order) !== JSON.stringify(editableOrder)) {
        updateOrder(editableOrder)
        toast({ title: t('toasts.orderUpdated'), description: t('toasts.orderUpdatedDesc', { orderId: editableOrder.id }) })
    }
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{t('orders.orderDetailsTitle', { orderId: order.id })}</DialogTitle>
            <DialogDescription>
              {t('orders.orderDetailsDesc', { table: order.table, time: formatDistanceToNow(order.timestamp, { addSuffix: true }) })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
             <div className="flex items-center space-x-4">
                <p className="font-medium">{t('inventory.status')}:</p>
                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
            </div>
             <Separator />

            <div className="space-y-4">
                {editableOrder.items.map((item) => (
                <div key={item.id} className="flex items-center">
                    <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                        XAF {item.price.toLocaleString()}
                    </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    >
                        <MinusCircle className="h-4 w-4" />
                    </Button>
                    <span>{item.quantity}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    >
                        <PlusCircle className="h-4 w-4" />
                    </Button>
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleUpdateQuantity(item.id, 0)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    </div>
                </div>
                ))}
            </div>
             <Separator />
             <div className="flex w-full justify-between font-bold text-lg">
                <span>{t('pos.total')}</span>
                <span>XAF {total.toLocaleString()}</span>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
            <div className="flex sm:justify-end gap-2 w-full flex-wrap">
                <Button variant="outline" onClick={handleSaveChanges}>{t('dialogs.saveChanges')}</Button>
                <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Invoice</Button>
                <Button variant="secondary" onClick={() => setSplitOpen(true)}>{t('orders.splitOrder')}</Button>
                <Button variant="secondary" onClick={() => setMergeOpen(true)}>{t('orders.mergeOrder')}</Button>
                <Button onClick={() => setPaymentOpen(true)}>{t('pos.chargeOrder')}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <PaymentDialog
        isOpen={isPaymentOpen}
        onOpenChange={setPaymentOpen}
        totalAmount={total}
        onPaymentSuccess={handlePaymentSuccess}
        orderForReceipt={editableOrder}
        onClose={() => onOpenChange(false)}
      />
      
      {editableOrder && (
          <>
            <SplitOrderDialog
                order={editableOrder}
                open={isSplitOpen}
                onOpenChange={setSplitOpen}
            />
            <MergeOrderDialog
                order={editableOrder}
                open={isMergeOpen}
                onOpenChange={setMergeOpen}
            />
          </>
      )}

    </>
  )
}
