import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { Chart, registerables, ChartOptions } from 'chart.js';
import { AdminService } from '../../components/service/admin.service';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { IndiancurrencyPipe } from '../../pipe/indiancurrency.pipe';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

Chart.register(...registerables); // Required in newer Chart.js versions

interface EmployeeReport {
  name: string;
  role: string;
  salary: number;
  revenue: number;
  status: 'Paid' | 'Pending';
}

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [SHARED_MODULES, IndiancurrencyPipe],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css',
})
export class SummaryComponent implements OnInit, AfterViewInit {
  // Use ViewChild to reference the canvas safely
  @ViewChild('revenueChart') chartCanvas!: ElementRef;
  @ViewChild('donutChart') donutCanvas!: ElementRef<HTMLCanvasElement>;
  outdoorService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  startDate: string = '';
  endDate: string = '';
  summaryData: any;

  outdoorOrderRevenue = 0;
  outdoorBillRevenue = 0;
  totalSalaryCost = 0;
  totalPurchase = 0;
  totalSell = 0;
  totalRevenue = 0;
  totalCost = 0;

  // Add these to track chart instances
  revenueChartInstance: any;
  donutChartInstance: any;

  ngOnInit(): void {
    const now = new Date();

    // 1. Local dates nikalne ka sabse safe tarika (YYYY-MM-DD)
    const today = now.toLocaleDateString('en-CA');
    const firstDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toLocaleDateString('en-CA');

    // 2. Variables ko update karein taaki UI boxes mein bhi date dikhe
    this.startDate = firstDay;
    this.endDate = today;

    console.log('Initial Load with Dates:', firstDay, 'to', today);

    // 3. Dates ke saath call karein
    this.loadFinancialSummary(this.startDate, this.endDate);
  }

  ngAfterViewInit(): void {
    this.initLineChart();
    this.initDonutChart();
  }

  loadFinancialSummary(sDate?: string, eDate?: string) {
    this.outdoorService.getFinancialSummary(sDate, eDate).subscribe({
      next: (res) => {
        this.summaryData = res.reportData;
        this.outdoorOrderRevenue = this.summaryData.revenue?.fromOrders || 0;
        this.outdoorBillRevenue = this.summaryData.revenue?.fromBills || 0;
        this.totalSalaryCost = this.summaryData.expenses?.staffSalaries || 0;
        this.totalPurchase = this.summaryData.expenses?.stockPurchases || 0;
        this.totalSell = this.summaryData.revenue?.fromProductSells || 0;
        this.totalRevenue = this.summaryData.revenue?.totalRevenue || 0;
        this.totalCost = this.summaryData.expenses?.totalSpend || 0;

        // Force Angular to detect changes before initializing charts
        this.cdr.detectChanges();

        // Use setTimeout to ensure Canvas is painted by the browser
        setTimeout(() => {
          this.initLineChart();
          this.initDonutChart();
        }, 100);
      },
      error: (err) => console.error('Error:', err),
    });
  }

  onDateChange(sDate: string, eDate: string) {
    if (sDate && eDate) {
      // console.log('Filtering from:', sDate, 'to:', eDate);
      this.loadFinancialSummary(sDate, eDate);
    }
  }

  get netProfit(): number {
    return this.totalRevenue - this.totalCost;
  }

  initLineChart() {
    if (!this.chartCanvas) return;
    if (this.revenueChartInstance) {
      this.revenueChartInstance.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Trend dikhane ke liye humein datasets mein Revenue aur Cost dono dalne honge
    this.revenueChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        // Filhal labels static hain, agar aapke paas monthly data hai toh wo yahan aayega
        labels: ['Orders', 'Bills', 'Direct Sales', 'Salaries', 'Purchases'],
        datasets: [
          {
            label: 'Revenue Stream',
            data: [
              this.outdoorOrderRevenue,
              this.outdoorBillRevenue,
              this.totalSell,
              null,
              null,
            ],
            borderColor: '#22c55e', // Green
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#22c55e',
          },
          {
            label: 'Expense Stream',
            data: [null, null, null, this.totalSalaryCost, this.totalPurchase],
            borderColor: '#ef4444', // Red
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#ef4444',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { color: '#e5e7eb', usePointStyle: true },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#1e293b',
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            callbacks: {
              label: (ctx: any) => ` ₹${ctx.raw.toLocaleString('en-IN')}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#9ca3af' },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#9ca3af',
              callback: (value) => '₹' + value.toLocaleString('en-IN'),
            },
          },
        },
      },
    });
  }

  initDonutChart() {
    if (!this.donutCanvas) return;
    if (this.donutChartInstance) this.donutChartInstance.destroy();

    const ctx = this.donutCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.donutChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Revenue', 'Expense'],
        datasets: [
          {
            data: [this.totalRevenue, this.totalCost],
            backgroundColor: ['#22c55e', '#f97316'],
            borderColor: ['#16a34a', '#ea580c'],
            borderWidth: 2,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        cutout: '70%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#e5e7eb', usePointStyle: true },
          },
        },
      },
    });
  }

  downloadExcel() {
    const report = [
      {
        Category: 'Revenue',
        Item: 'Outdoor Orders',
        Amount: this.outdoorOrderRevenue,
      },
      {
        Category: 'Revenue',
        Item: 'Outdoor Bills',
        Amount: this.outdoorBillRevenue,
      },
      { Category: 'Revenue', Item: 'Product Sales', Amount: this.totalSell },
      { Category: 'Summary', Item: 'TOTAL REVENUE', Amount: this.totalRevenue },
      {
        Category: 'Expense',
        Item: 'Staff Salaries',
        Amount: this.totalSalaryCost,
      },
      {
        Category: 'Expense',
        Item: 'Stock Purchases',
        Amount: this.totalPurchase,
      },
      { Category: 'Summary', Item: 'TOTAL COST', Amount: this.totalCost },
      { Category: 'Summary', Item: 'NET PROFIT', Amount: this.netProfit },
    ];

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(report);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Financial Summary');

    const fileName = `Financial_Report_${new Date().toLocaleDateString()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  // 2. PDF DOWNLOAD
  downloadPDF() {
    const doc = new jsPDF();

    // 1. COLORS & THEME (Matching the Beige Image)
    const bgBeige: [number, number, number] = [225, 213, 201]; // Header box color
    const textDark: [number, number, number] = [44, 44, 44]; // Dark slate/black
    const accentBrown: [number, number, number] = [101, 67, 33]; // Brown logo box color

    // 2. HEADER BOX (The Beige Rectangle)
    doc.setFillColor(...bgBeige);
    doc.roundedRect(10, 10, 190, 50, 2, 2, 'F');

    // Title "FINANCIAL REPORT" (Using Serif style)
    doc.setFont('times', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(...textDark);
    doc.text('REPORT', 20, 35);

    // Small Brown Logo Box (Matching the image)
    doc.setFillColor(...accentBrown);
    doc.rect(130, 15, 8, 15, 'F');

    // Business Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('JS BUSINESS ANALYTICS', 142, 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Financial Summary Report', 142, 28);

    // Metadata (Billed To / Dates)
    doc.setFontSize(9);
    // doc.text(`Report No: ${new Date().getTime().toString().slice(-6)}`, 20, 48);
    doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 20, 53);

    doc.setFont('helvetica', 'bold');
    doc.text('Date Range:', 142, 48);
    doc.setFont('helvetica', 'normal');
    doc.text(`${this.startDate || 'N/A'} to ${this.endDate || 'N/A'}`, 142, 53);

    // 3. TABLE SECTION (Clean & Modern)
    const head = [['No.', 'Item Description', 'Category', 'Amount (INR)']];
    const data = [
      [
        1,
        'Outdoor Order Revenue',
        'Revenue',
        this.outdoorOrderRevenue.toLocaleString('en-IN'),
      ],
      [
        2,
        'Outdoor Bill Revenue',
        'Revenue',
        this.outdoorBillRevenue.toLocaleString('en-IN'),
      ],
      [
        3,
        'Direct Product Sales',
        'Revenue',
        this.totalSell.toLocaleString('en-IN'),
      ],
      [
        4,
        'Staff Salary Cost',
        'Expense',
        this.totalSalaryCost.toLocaleString('en-IN'),
      ],
      [
        5,
        'Stock/Product Purchases',
        'Expense',
        this.totalPurchase.toLocaleString('en-IN'),
      ],
    ];

    autoTable(doc, {
      startY: 65,
      head: head,
      body: data,
      theme: 'striped',
      headStyles: {
        fillColor: [190, 170, 150], // Slightly darker beige for header
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 10 },
        3: { halign: 'right' },
      },
    });

    // 4. TOTALS SECTION (Right Aligned)
    // --- TABLE KE BAAD KA SECTION ---
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    const rightAlignX = 195; // Right margin focus

    // 1. SUB-DETAILS (Subtle & Small)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100); // Gray text

    doc.text(`Total Gross Revenue :`, 140, finalY, { align: 'right' });
    doc.text(
      `${this.totalRevenue.toLocaleString('en-IN')}`,
      rightAlignX,
      finalY,
      { align: 'right' },
    );

    doc.text(`Total Operating Cost :`, 140, finalY + 8, { align: 'right' });
    doc.text(
      `${this.totalCost.toLocaleString('en-IN')}`,
      rightAlignX,
      finalY + 8,
      { align: 'right' },
    );

    // 2. DIVIDER LINE
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(130, finalY + 12, rightAlignX, finalY + 12);

    // 3. MAIN TOTAL (Net Profit - High Impact)
    // Ek chota beige background box "Net Profit" ke liye
    doc.setFillColor(245, 240, 235); // Very light beige
    doc.rect(120, finalY + 15, 80, 15, 'F');

    doc.setFont('times', 'bold'); // Professional Serif Font
    doc.setFontSize(16);
    doc.setTextColor(...textDark);

    // "NET PROFIT" Label
    doc.text('NET TOTAL :', 155, finalY + 25, { align: 'right' });

    // Profit Value (Color according to profit/loss)
    const profitColor: [number, number, number] =
      this.netProfit >= 0 ? [22, 101, 52] : [153, 27, 27];
    doc.setTextColor(...profitColor);
    doc.text(
      `INR  ${this.netProfit.toLocaleString('en-IN')}`,
      rightAlignX,
      finalY + 25,
      { align: 'right' },
    );

    // 5. FOOTER (Matching the image layout)
    const footerY = 270;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);

    // Left Side: Address/Contact
    doc.text('Vesu, Surat, Gujarat', 15, footerY);
    doc.text('support@jsanalytics.com', 15, footerY + 5);

    // Right Side: Notes
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Note', 140, footerY);
    doc.setFont('helvetica', 'normal');
    doc.text('This report is generated based on selected', 140, footerY + 5);
    doc.text('filters and reflects real-time data.', 140, footerY + 10);

    doc.save(`Financial_Report_${this.endDate}.pdf`);
  }
}
