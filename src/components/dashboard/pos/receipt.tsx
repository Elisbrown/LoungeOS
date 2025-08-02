
"use client"

import React from 'react';
import { OrderItem } from './order-summary';
import { type Settings } from '@/context/settings-context';
import Image from 'next/image';
import { cn, formatCurrency } from '@/lib/utils';

function LoungeChairIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14 17a2 2 0 1 0-4 0" />
            <path d="M6 10h12" />
            <path d="M16 4h-8" />
            <path d="M6 4v13" />
            <path d="M18 4v13" />
            <path d="M5 17h14" />
        </svg>
    )
}

export type ReceiptProps = {
  orderId: string;
  type: 'Invoice' | 'Receipt';
  table: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  totalPaid?: number;
  totalDue?: number;
  amountTendered?: number;
  change?: number;
  paymentMethod?: string;
  timestamp: Date;
  cashierName: string;
  waiterName?: string;
  settings: Settings; // Make settings mandatory for printing
  // Tax and discount breakdown
  discount?: number;
  tax?: number;
  taxRate?: number;
  discountName?: string;
};

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(
  (props, ref) => {
    const { 
        orderId, type, table, items, subtotal, total, totalPaid, totalDue, amountTendered, change, paymentMethod,
        timestamp, cashierName, waiterName, settings, discount, tax, taxRate, discountName
    } = props;
    
    const fontClass = {
        mono: 'font-mono',
        sans: 'font-sans',
        serif: 'font-serif'
    }[settings.receiptFont] || 'font-mono';

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <div 
        ref={ref} 
        className={cn("p-2 bg-white text-black text-[10px] w-[300px] mx-auto", fontClass)}
        style={{ lineHeight: settings.receiptLineSpacing }}
      >
        <div className="text-center mb-2">
           <div className="flex items-center justify-center mb-1">
              {settings.platformLogo ? (
                <Image src={settings.platformLogo} alt="logo" width={40} height={40} className="h-10 w-10 object-contain" />
              ) : (
                <LoungeChairIcon className="h-8 w-8 text-black" />
              )}
          </div>
          <h1 className="text-sm font-bold font-sans">{settings.organizationName}</h1>
          <p>{settings.contactAddress}</p>
          <p>Tel: {settings.contactPhone}</p>
          {settings.receiptHeader && <p className="mt-1 text-[9px]">{settings.receiptHeader}</p>}
        </div>

        <div className="mb-1">
            {settings.receiptCustomFields.map((field, index) => (
                <div key={index} className="flex justify-between">
                    <span className="font-bold">{field.label}:</span>
                    <span>{field.value}</span>
                </div>
            ))}
        </div>
        
        <div className="mb-1">
            <div className="flex justify-between">
                <span className="font-bold">{type === 'Invoice' ? 'Invoice Number' : 'Receipt No'}:</span>
                <span>{orderId}</span>
            </div>
            <div className="flex justify-between">
                <span className="font-bold">{type === 'Invoice' ? 'Invoice Date' : 'Date'}:</span>
                <span>{timestamp.toLocaleString()}</span>
            </div>
             <div className="flex justify-between">
                <span className="font-bold">Table:</span>
                <span>{table}</span>
            </div>
            <div className="flex justify-between">
                <span className="font-bold">Cashier:</span>
                <span>{cashierName}</span>
            </div>
          {settings.receiptShowWaiter && waiterName && (
             <div className="flex justify-between">
                <span className="font-bold">Waiter:</span>
                <span>{waiterName}</span>
            </div>
          )}
        </div>

        <hr className="border-dashed border-black my-1" />
        
        <table className="w-full">
          <thead>
            <tr className="border-b border-dashed border-black">
              <th className="text-left font-bold w-1/2">Item</th>
              <th className="text-center font-bold">Qty</th>
              <th className="text-right font-bold">Rate</th>
              <th className="text-right font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td className="text-left">{item.name}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">{formatCurrency(item.price, settings.defaultCurrency)}</td>
                <td className="text-right">{formatCurrency(item.price * item.quantity, settings.defaultCurrency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="border-dashed border-black my-1" />
        
        <div className="space-y-1">
            <div className="flex justify-between">
              <span>Total Qty:</span>
              <span>{totalQuantity}</span>
            </div>
            <div className="flex justify-between">
              <span>Sub Total:</span>
              <span>{formatCurrency(subtotal, settings.defaultCurrency)}</span>
            </div>
            
            {/* Discount */}
            {discount && discount > 0 && (
              <div className="flex justify-between">
                <span>Discount{discountName ? ` (${discountName})` : ''}:</span>
                <span>-{formatCurrency(discount, settings.defaultCurrency)}</span>
              </div>
            )}
            
            {/* Tax */}
            {settings.taxEnabled && tax && tax > 0 && (
              <div className="flex justify-between">
                <span>Tax{taxRate ? ` (${taxRate}%)` : ''}:</span>
                <span>{formatCurrency(tax, settings.defaultCurrency)}</span>
              </div>
            )}
            
            <hr className="border-dashed border-black my-1" />
            <div className="flex justify-between font-bold">
              <span>TOTAL:</span>
              <span>{formatCurrency(total, settings.defaultCurrency)}</span>
            </div>
        </div>

        {type === 'Receipt' && (
            <>
                <hr className="border-dashed border-black my-1" />
                <div className="space-y-1">
                    {amountTendered !== undefined && (
                        <div className="flex justify-between">
                            <span>Amount Tendered ({paymentMethod}):</span>
                            <span>{formatCurrency(amountTendered, settings.defaultCurrency)}</span>
                        </div>
                    )}
                    {change !== undefined && (
                         <div className="flex justify-between">
                            <span>Change:</span>
                            <span>{formatCurrency(change, settings.defaultCurrency)}</span>
                        </div>
                    )}
                </div>
            </>
        )}
        
        <div className="text-center mt-3">
          <p className="font-bold">{settings.receiptFooter}</p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = 'Receipt';
