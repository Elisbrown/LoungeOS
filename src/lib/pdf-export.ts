import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Order } from '@/context/order-context';
import { InventoryItem } from '@/lib/db/inventory';

// Define the type for autoTable since it extends jsPDF
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

/**
 * Export orders to PDF
 */
interface UserInfo {
    name: string;
    email: string;
    address?: string;
    phone?: string;
}

/**
 * Export orders to PDF
 */
export const exportOrdersToPDF = (orders: Order[], title: string = 'Orders Report', staff: any[] = [], userInfo?: UserInfo) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  const addHeader = (data: any) => {
      // Platform User Header
      if (userInfo) {
          doc.setFontSize(10);
          doc.setTextColor(50);
          const rightX = doc.internal.pageSize.width - 14;
          doc.text(userInfo.name, rightX, 15, { align: 'right' });
          if(userInfo.address) doc.text(userInfo.address, rightX, 20, { align: 'right' });
          if(userInfo.phone) doc.text(userInfo.phone, rightX, 25, { align: 'right' });
      }

      // Title
      doc.setFontSize(18);
      doc.setTextColor(0);
      doc.text(title, 14, 22);
      
      // Date
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${format(new Date(), 'PPP p')}`, 14, 30);
  }

  const addFooter = (data: any) => {
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(150);
      
      const footerText1 = "LoungeOS, built by Sunyin Elisbrown(SIGALIX)";
      const footerText2 = "contact: elisbrown@sigalix.net and +237679690703";
      
      doc.text(footerText1, 14, pageHeight - 10);
      doc.text(footerText2, 14, pageHeight - 6);
      
      const pageNumber = "Page " + data.pageNumber;
      doc.text(pageNumber, doc.internal.pageSize.width - 20, pageHeight - 10);
  }

  // Prepare table data
  const tableColumn = ["Order ID", "Table", "Status", "Items", "Total", "Date", "Notes"];
  const tableRows = orders.map(order => {
    const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsSummary = order.items.map(item => `${item.quantity}x ${item.name}`).join(', ');
    
    let notes = "";
    if (order.status === 'Canceled') {
        let staffName = "Unknown";
        if (order.cancelled_by) {
            const found = staff.find(s => parseInt(s.id) === order.cancelled_by);
            if (found) staffName = found.name;
        }
        notes = `Canceled by ${staffName}\nReason: ${order.cancellation_reason || 'N/A'}\nTime: ${order.cancelled_at ? format(new Date(order.cancelled_at), 'HH:mm') : ''}`;
    }

    return [
      order.id,
      order.table,
      order.status,
      itemsSummary,
      `XAF ${total.toLocaleString()}`,
      format(new Date(order.timestamp), 'PP p'),
      notes
    ];
  });

  // Generate table
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: 'linebreak',
      valign: 'top'
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
        6: { cellWidth: 40 } // Give more width to notes column
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    didDrawPage: (data) => {
        addHeader(data);
        addFooter(data);
    },
    margin: { top: 40 }
  });

  // Save the PDF
  doc.save(`orders_export_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`);
};

/**
 * Export inventory items to PDF
 */
export const exportInventoryToPDF = (items: InventoryItem[], title: string = 'Inventory Report') => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${format(new Date(), 'PPP p')}`, 14, 30);
  
  // Prepare table data
  const tableColumn = ["SKU", "Name", "Category", "Stock", "Cost/Unit", "Status", "Supplier"];
  const tableRows = items.map(item => {
    return [
      item.sku,
      item.name,
      item.category,
      `${item.current_stock} ${item.unit}`,
      item.cost_per_unit ? `XAF ${item.cost_per_unit.toLocaleString()}` : '-',
      item.status,
      item.supplier?.name || '-'
    ];
  });

  // Generate table
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [46, 204, 113], // Green for inventory
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Save the PDF
  doc.save(`inventory_export_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`);
};
