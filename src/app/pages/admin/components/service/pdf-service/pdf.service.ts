import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

generateDynamicPDF(data: any, items: any[], options: {showRate: boolean, showDiscount: boolean}) {
  const doc = new jsPDF();
  
  // Header details (Company Name, Party Details etc.)
  doc.setFontSize(16);
  doc.text("QUOTATION", 105, 15, { align: 'center' });

  // Columns definition
  let columns: any[] = [
    { header: 'Sr.', dataKey: 'sr' },
    { header: 'Description', dataKey: 'desc' },
    { header: 'Qty', dataKey: 'qty' }
  ];

  // Dynamic conditions
  if (options.showRate) {
    columns.push({ header: 'Rate', dataKey: 'rate' });
  }
  
  if (options.showDiscount) {
    columns.push({ header: 'Disc %', dataKey: 'disc' });
  }

  // Hamesha Amount tab dikhayenge jab Rate ON ho
  if (options.showRate) {
    columns.push({ header: 'Total', dataKey: 'total' });
  }

  // Row Mapping
  const rows = items.map((item, index) => ({
    sr: index + 1,
    desc: item.description,
    qty: item.qty,
    rate: item.rate,
    disc: item.discount + '%',
    total: (item.qty * item.rate) - (item.discount || 0) // Calculation logic
  }));

  autoTable(doc, {
    startY: 40,
    columns: columns,
    body: rows,
    theme: 'grid'
  });

  doc.save(`Quotation_${data.billNo || 'Print'}.pdf`);
}
}
