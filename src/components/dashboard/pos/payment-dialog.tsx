
"use client"

import React, { useState, useRef } from "react"
import ReactDOMServer from 'react-dom/server';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/use-translation"
import { Receipt, type ReceiptProps } from './receipt'
import { Printer } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { type Order, type OrderItem } from "@/context/order-context"
import { useSettings } from "@/context/settings-context";

export type PaymentDetails = {
    paymentMethod: string;
    amountPaid: number;
    change: number;
}

type PaymentDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  totalAmount: number
  onPaymentSuccess: (details: PaymentDetails) => void
  orderForReceipt: Omit<Order, 'id' | 'timestamp' | 'status'>,
  onClose: () => void;
}

export function PaymentDialog({
  isOpen,
  onOpenChange,
  totalAmount,
  onPaymentSuccess,
  orderForReceipt,
  onClose,
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [amountPaid, setAmountPaid] = useState(totalAmount)
  const [change, setChange] = useState(0)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [receiptProps, setReceiptProps] = useState<ReceiptProps | null>(null);

  const { toast } = useToast()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { settings } = useSettings();
  
  const handlePrint = () => {
    if (!receiptProps) return;

    const printContent = ReactDOMServer.renderToString(
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap');
          body { -webkit-print-color-adjust: exact; }
        `}</style>
        <Receipt {...receiptProps} />
      </>
    );

    const printWindow = window.open('', '', 'height=600,width=400');
    if (printWindow) {
        printWindow.document.write('<html><head><title>Print Receipt</title>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
           printWindow.print();
           printWindow.close();
        }, 500);
    }
  };


  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setAmountPaid(value)
    if (paymentMethod === "cash" && value >= totalAmount) {
      setChange(value - totalAmount)
    } else {
      setChange(0)
    }
  }

  const handleConfirmPayment = () => {
    if (!user) return;
    
    toast({
        title: t('toasts.paymentSuccess'),
        description: t('toasts.paymentSuccessDesc'),
    })
    
    const paymentDetails: PaymentDetails = {
        paymentMethod,
        amountPaid: paymentMethod === 'cash' ? amountPaid : totalAmount,
        change,
    };
    
    const finalReceiptProps: ReceiptProps = {
      type: 'Receipt',
      orderId: (orderForReceipt as Order).id || `PAY-${Date.now()}`,
      table: orderForReceipt.table,
      items: orderForReceipt.items,
      subtotal: totalAmount,
      total: totalAmount,
      totalPaid: totalAmount,
      totalDue: 0,
      amountTendered: paymentDetails.amountPaid,
      change: paymentDetails.change,
      paymentMethod: paymentDetails.paymentMethod,
      timestamp: new Date(),
      cashierName: user.name,
      settings: settings, // Pass settings explicitly
    };
    setReceiptProps(finalReceiptProps)

    onPaymentSuccess(paymentDetails);
    setIsConfirmed(true)
  }
  
  React.useEffect(() => {
    if (isOpen) {
      setAmountPaid(totalAmount)
      setChange(0)
      setPaymentMethod("cash")
      setIsConfirmed(false)
      setReceiptProps(null)
    }
  }, [isOpen, totalAmount])

  const handleCloseDialog = () => {
    onOpenChange(false);
    if (isConfirmed) {
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">{isConfirmed ? "Payment Successful" : t('pos.completePaymentTitle')}</DialogTitle>
          <DialogDescription>
            {isConfirmed ? "You can now print the receipt or close this window." : t('pos.completePaymentDesc')}
          </DialogDescription>
        </DialogHeader>
        {!isConfirmed ? (
            <div className="space-y-4 py-4">
            <div className="text-4xl font-bold text-center">
                XAF {totalAmount.toLocaleString()}
            </div>
            <div className="space-y-2">
                <Label>{t('pos.paymentMethod')}</Label>
                <RadioGroup
                defaultValue="cash"
                className="grid grid-cols-3 gap-4"
                onValueChange={setPaymentMethod}
                value={paymentMethod}
                >
                <div>
                    <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                    <Label
                    htmlFor="cash"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                    {t('pos.cash')}
                    </Label>
                </div>
                <div>
                    <RadioGroupItem
                    value="card"
                    id="card"
                    className="peer sr-only"
                    />
                    <Label
                    htmlFor="card"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                    {t('pos.card')}
                    </Label>
                </div>
                <div>
                    <RadioGroupItem
                    value="mobile"
                    id="mobile"
                    className="peer sr-only"
                    />
                    <Label
                    htmlFor="mobile"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                    {t('pos.mobile')}
                    </Label>
                </div>
                </RadioGroup>
            </div>
            {paymentMethod === 'cash' && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount-paid">{t('pos.amountPaid')}</Label>
                        <Input id="amount-paid" type="number" value={amountPaid} onChange={handleAmountChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="change">{t('pos.change')}</Label>
                        <Input id="change" type="number" value={change} readOnly className="font-bold" />
                    </div>
                </div>
            )}
            {paymentMethod !== 'cash' && (
                <div className="space-y-2">
                    <Label htmlFor="reference">{t('pos.reference')}</Label>
                    <Input id="reference" placeholder={t('pos.referencePlaceholder')} />
                </div>
            )}
            </div>
        ) : (
            <div className="py-8 text-center">
                <p>Order has been finalized.</p>
            </div>
        )}
        <DialogFooter>
          {isConfirmed ? (
              <>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Close
                </Button>
                <Button type="button" onClick={handlePrint} disabled={!receiptProps}>
                    <Printer className="mr-2 h-4 w-4" /> Print Receipt
                </Button>
              </>
          ) : (
              <>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    {t('dialogs.cancel')}
                </Button>
                <Button type="button" onClick={handleConfirmPayment} disabled={paymentMethod === 'cash' && amountPaid < totalAmount}>
                    {t('pos.confirmPayment')}
                </Button>
              </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
