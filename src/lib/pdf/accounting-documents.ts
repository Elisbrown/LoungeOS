import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Settings {
  platformName?: string;
  platformLogo?: string;
  defaultCurrency?: string;
}

// Format currency for display
function formatAmount(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Generate Journal Entry PDF
export function generateJournalEntryPDF(entry: any, settings: Settings) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text(settings.platformName || 'LoungeOS', 14, 22);
  doc.setFontSize(16);
  doc.text('Journal Entry', 14, 32);
  
  // Entry Details
  doc.setFontSize(10);
  doc.text(`Entry #: ${entry.id}`, 14, 42);
  doc.text(`Date: ${new Date(entry.entry_date).toLocaleDateString()}`, 14, 48);
  doc.text(`Type: ${entry.entry_type}`, 14, 54);
  doc.text(`Reference: ${entry.reference || 'N/A'}`, 14, 60);
  doc.text(`Description: ${entry.description}`, 14, 66);
  
  // Lines Table
  const tableData = entry.lines.map((line: any) => [
    `${line.account_code} - ${line.account_name}`,
    line.description || '',
    line.debit > 0 ? formatAmount(line.debit, settings.defaultCurrency) : '',
    line.credit > 0 ? formatAmount(line.credit, settings.defaultCurrency) : '',
  ]);
  
  const totalDebit = entry.lines.reduce((sum: number, l: any) => sum + l.debit, 0);
  const totalCredit = entry.lines.reduce((sum: number, l: any) => sum + l.credit, 0);
  
  tableData.push([
    { content: 'TOTAL', colSpan: 2, styles: { fontStyle: 'bold' } },
    { content: formatAmount(totalDebit, settings.defaultCurrency), styles: { fontStyle: 'bold' } },
    { content: formatAmount(totalCredit, settings.defaultCurrency), styles: { fontStyle: 'bold' } },
  ]);
  
  autoTable(doc, {
    startY: 75,
    head: [['Account', 'Description', 'Debit', 'Credit']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [66, 66, 66] },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10);
  doc.text(`Page ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
  
  return doc;
}

// Generate Profit & Loss PDF
export function generateProfitLossPDF(report: any, settings: Settings) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text(settings.platformName || 'LoungeOS', 14, 22);
  doc.setFontSize(16);
  doc.text('Profit & Loss Statement', 14, 32);
  doc.setFontSize(10);
  doc.text(`Period: ${new Date(report.period.start).toLocaleDateString()} - ${new Date(report.period.end).toLocaleDateString()}`, 14, 40);
  
  // Revenue Section
  const revenueData = report.revenue.map((item: any) => [
    `${item.account_code} - ${item.account_name}`,
    formatAmount(item.balance, settings.defaultCurrency),
  ]);
  
  if (revenueData.length > 0) {
    doc.setFontSize(12);
    doc.text('Revenue', 14, 50);
    
    autoTable(doc, {
      startY: 55,
      body: revenueData,
      theme: 'plain',
      columnStyles: {
        0: { cellWidth: 130 },
        1: { halign: 'right', cellWidth: 50 },
      },
    });
  }
  
  const revenueEndY = (doc as any).lastAutoTable?.finalY || 55;
  
  // Total Revenue
  autoTable(doc, {
    startY: revenueEndY + 2,
    body: [[{ content: 'Total Revenue', styles: { fontStyle: 'bold' } }, { content: formatAmount(report.totalRevenue, settings.defaultCurrency), styles: { fontStyle: 'bold' } }]],
    theme: 'plain',
    columnStyles: {
      0: { cellWidth: 130 },
      1: { halign: 'right', cellWidth: 50 },
    },
    styles: { fillColor: [240, 240, 240] },
  });
  
  const expenseStartY = (doc as any).lastAutoTable.finalY + 10;
  
  // Expenses Section
  const expenseData = report.expenses.map((item: any) => [
    `${item.account_code} - ${item.account_name}`,
    formatAmount(item.balance, settings.defaultCurrency),
  ]);
  
  if (expenseData.length > 0) {
    doc.setFontSize(12);
    doc.text('Expenses', 14, expenseStartY);
    
    autoTable(doc, {
      startY: expenseStartY + 5,
      body: expenseData,
      theme: 'plain',
      columnStyles: {
        0: { cellWidth: 130 },
        1: { halign: 'right', cellWidth: 50 },
      },
    });
  }
  
  const expenseEndY = (doc as any).lastAutoTable?.finalY || expenseStartY + 5;
  
  // Total Expenses
  autoTable(doc, {
    startY: expenseEndY + 2,
    body: [[{ content: 'Total Expenses', styles: { fontStyle: 'bold' } }, { content: formatAmount(report.totalExpenses, settings.defaultCurrency), styles: { fontStyle: 'bold' } }]],
    theme: 'plain',
    columnStyles: {
      0: { cellWidth: 130 },
      1: { halign: 'right', cellWidth: 50 },
    },
    styles: { fillColor: [240, 240, 240] },
  });
  
  const netIncomeY = (doc as any).lastAutoTable.finalY + 10;
  
  // Net Income
  autoTable(doc, {
    startY: netIncomeY,
    body: [[
      { content: 'NET INCOME', styles: { fontStyle: 'bold', fontSize: 12 } },
      { content: formatAmount(report.netIncome, settings.defaultCurrency), styles: { fontStyle: 'bold', fontSize: 12, textColor: report.netIncome >= 0 ? [0, 128, 0] : [255, 0, 0] } }
    ]],
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: 130 },
      1: { halign: 'right', cellWidth: 50 },
    },
    headStyles: { fillColor: [66, 66, 66] },
  });
  
  // Footer
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10);
  
  return doc;
}

// Generate Balance Sheet PDF
export function generateBalanceSheetPDF(report: any, settings: Settings) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text(settings.platformName || 'LoungeOS', 14, 22);
  doc.setFontSize(16);
  doc.text('Balance Sheet', 14, 32);
  doc.setFontSize(10);
  doc.text(`As of: ${new Date(report.asOfDate).toLocaleDateString()}`, 14, 40);
  
  let currentY = 50;
  
  // Assets
  if (report.assets.length > 0) {
    doc.setFontSize(12);
    doc.text('Assets', 14, currentY);
    
    const assetsData = report.assets.map((item: any) => [
      `${item.account_code} - ${item.account_name}`,
      formatAmount(item.balance, settings.defaultCurrency),
    ]);
    
    autoTable(doc, {
      startY: currentY + 5,
      body: assetsData,
      theme: 'plain',
      columnStyles: {
        0: { cellWidth: 130 },
        1: { halign: 'right', cellWidth: 50 },
      },
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 2;
  }
  
  // Total Assets
  autoTable(doc, {
    startY: currentY,
    body: [[{ content: 'Total Assets', styles: { fontStyle: 'bold' } }, { content: formatAmount(report.totalAssets, settings.defaultCurrency), styles: { fontStyle: 'bold' } }]],
    theme: 'plain',
    columnStyles: {
      0: { cellWidth: 130 },
      1: { halign: 'right', cellWidth: 50 },
    },
    styles: { fillColor: [240, 240, 240] },
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 10;
  
  // Liabilities
  if (report.liabilities.length > 0) {
    doc.setFontSize(12);
    doc.text('Liabilities', 14, currentY);
    
    const liabilitiesData = report.liabilities.map((item: any) => [
      `${item.account_code} - ${item.account_name}`,
      formatAmount(item.balance, settings.defaultCurrency),
    ]);
    
    autoTable(doc, {
      startY: currentY + 5,
      body: liabilitiesData,
      theme: 'plain',
      columnStyles: {
        0: { cellWidth: 130 },
        1: { halign: 'right', cellWidth: 50 },
      },
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 2;
  }
  
  // Total Liabilities
  autoTable(doc, {
    startY: currentY,
    body: [[{ content: 'Total Liabilities', styles: { fontStyle: 'bold' } }, { content: formatAmount(report.totalLiabilities, settings.defaultCurrency), styles: { fontStyle: 'bold' } }]],
    theme: 'plain',
    columnStyles: {
      0: { cellWidth: 130 },
      1: { halign: 'right', cellWidth: 50 },
    },
    styles: { fillColor: [240, 240, 240] },
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 10;
  
  // Equity
  if (report.equity.length > 0) {
    doc.setFontSize(12);
    doc.text('Equity', 14, currentY);
    
    const equityData = report.equity.map((item: any) => [
      `${item.account_code} - ${item.account_name}`,
      formatAmount(item.balance, settings.defaultCurrency),
    ]);
    
    autoTable(doc, {
      startY: currentY + 5,
      body: equityData,
      theme: 'plain',
      columnStyles: {
        0: { cellWidth: 130 },
        1: { halign: 'right', cellWidth: 50 },
      },
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 2;
  }
  
  // Total Equity
  autoTable(doc, {
    startY: currentY,
    body: [[{ content: 'Total Equity', styles: { fontStyle: 'bold' } }, { content: formatAmount(report.totalEquity, settings.defaultCurrency), styles: { fontStyle: 'bold' } }]],
    theme: 'plain',
    columnStyles: {
      0: { cellWidth: 130 },
      1: { halign: 'right', cellWidth: 50 },
    },
    styles: { fillColor: [240, 240, 240] },
  });
  
  // Footer
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10);
  
  return doc;
}

// Generate Cash Flow PDF
export function generateCashFlowPDF(report: any, settings: Settings) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text(settings.platformName || 'LoungeOS', 14, 22);
  doc.setFontSize(16);
  doc.text('Cash Flow Statement', 14, 32);
  doc.setFontSize(10);
  doc.text(`Period: ${new Date(report.period.start).toLocaleDateString()} - ${new Date(report.period.end).toLocaleDateString()}`, 14, 40);
  
  let currentY = 50;
  
  // Operating Activities
  if (report.operating.length > 0) {
    doc.setFontSize(12);
    doc.text('Operating Activities', 14, currentY);
    
    const operatingData = report.operating.map((item: any) => [
      item.description,
      formatAmount(item.amount, settings.defaultCurrency),
    ]);
    
    autoTable(doc, {
      startY: currentY + 5,
      body: operatingData,
      theme: 'plain',
      columnStyles: {
        0: { cellWidth: 130 },
        1: { halign: 'right', cellWidth: 50 },
      },
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Summary
  const summaryData = [
    ['Beginning Cash', formatAmount(report.beginningCash, settings.defaultCurrency)],
    ['Net Cash Flow', formatAmount(report.netCashFlow, settings.defaultCurrency)],
    [{ content: 'Ending Cash', styles: { fontStyle: 'bold' } }, { content: formatAmount(report.endingCash, settings.defaultCurrency), styles: { fontStyle: 'bold' } }],
  ];
  
  autoTable(doc, {
    startY: currentY,
    body: summaryData,
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: 130 },
      1: { halign: 'right', cellWidth: 50 },
    },
    headStyles: { fillColor: [66, 66, 66] },
  });
  
  // Footer
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10);
  
  return doc;
}
