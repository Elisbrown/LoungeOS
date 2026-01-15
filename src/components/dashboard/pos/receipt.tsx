
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
        className={cn("p-4 bg-white text-black text-[12px] w-[302px] mx-auto", fontClass)}
        style={{ lineHeight: settings.receiptLineSpacing || 1.2, fontFamily: 'monospace' }}
      >
        {/* Header - Centered */}
        <div className="text-center mb-4 space-y-1">
          <div className="flex items-center justify-center mb-2">
            {settings.platformLogo ? (
              <Image src={settings.platformLogo} alt="logo" width={50} height={50} className="h-12 w-12 object-contain" />
            ) : (
              <LoungeChairIcon className="h-10 w-10 text-black" />
            )}
          </div>
          <h1 className="text-base font-bold uppercase">{settings.organizationName}</h1>
          <p className="text-[11px] leading-tight">{settings.contactAddress}</p>
          <p className="text-[11px]">Tel: {settings.contactPhone}</p>
          {settings.receiptHeader && <p className="mt-1 text-[11px] font-medium">{settings.receiptHeader}</p>}
        </div>

        <div className="border-t border-dashed border-black my-2" />

        {/* Receipt Details - Left/Right */}
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="font-bold">{type === 'Invoice' ? 'INVOICE:' : 'RECEIPT:'}</span>
            <span>#{orderId.split('-').pop()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">DATE:</span>
            <span>{timestamp.toLocaleString()}</span>
          </div>
          {table && (
            <div className="flex justify-between">
              <span className="font-bold">TABLE:</span>
              <span>{table}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="font-bold">CASHIER:</span>
            <span>{cashierName}</span>
          </div>
          {settings.receiptShowWaiter && waiterName && (
            <div className="flex justify-between">
              <span className="font-bold">WAITER:</span>
              <span>{waiterName}</span>
            </div>
          )}
          {settings.receiptCustomFields.map((field, index) => (
            <div key={index} className="flex justify-between">
              <span className="font-bold">{field.label.toUpperCase()}:</span>
              <span>{field.value}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-black my-2" />

        {/* Items */}
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="space-y-0.5">
              <div className="font-bold uppercase">{item.name}</div>
              <div className="flex justify-between items-center text-[11px]">
                <span>{item.quantity} x {formatCurrency(item.price, settings.defaultCurrency)}</span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity, settings.defaultCurrency)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-black my-2" />

        {/* Totals */}
        <div className="space-y-1.5 text-[12px]">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal, settings.defaultCurrency)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Discount{discountName ? ` (${discountName})` : ''}:</span>
            <span>-{formatCurrency(discount || 0, settings.defaultCurrency)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Tax{taxRate ? ` (${taxRate}%)` : ''}:</span>
            <span>{formatCurrency(tax || 0, settings.defaultCurrency)}</span>
          </div>
          
          <div className="border-t border-black my-1" />
          
          <div className="flex justify-between font-bold text-[14px]">
            <span>TOTAL:</span>
            <span>{formatCurrency(total, settings.defaultCurrency)}</span>
          </div>
        </div>

        {type === 'Receipt' && (
          <>
            <div className="border-t border-dashed border-black my-2" />
            <div className="space-y-1 text-[11px]">
              {amountTendered !== undefined && (
                <div className="flex justify-between">
                  <span>Paid ({paymentMethod}):</span>
                  <span>{formatCurrency(amountTendered, settings.defaultCurrency)}</span>
                </div>
              )}
              {change !== undefined && change > 0 && (
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span>{formatCurrency(change, settings.defaultCurrency)}</span>
                </div>
              )}
            </div>
          </>
        )}
        
        <div className="border-t border-dashed border-black my-2" />
        
        {/* Footer - Centered */}
        <div className="text-center mt-4 space-y-2">
          <div className="space-y-0.5">
            <p className="font-bold uppercase text-[11px]">{settings.receiptFooter || 'Thank you for your business!'}</p>
            <p className="text-[10px]">Please come again!</p>
          </div>
          
          <div className="border-t border-dotted border-black/20 pt-2 space-y-0.5 opacity-70">
            <p className="text-[9px] font-medium">Software: LoungeOS</p>
            <p className="text-[9px]">Developed by SIGALIX</p>
            <p className="text-[8px] whitespace-nowrap">+237 679 690 703 | sigalix.net</p>
          </div>
        </div>
      </div>
    );
  }
);

Receipt.displayName = 'Receipt';
