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
    this.loadFinancialSummary();
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

    // Header
    doc.setFontSize(18);
    doc.text('Business Financial Report', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Table Data
    const head = [['Category', 'Description', 'Amount (INR)']];
    const data = [
      [
        'Revenue',
        'Outdoor Orders',
        this.outdoorOrderRevenue.toLocaleString('en-IN'),
      ],
      [
        'Revenue',
        'Outdoor Bills',
        this.outdoorBillRevenue.toLocaleString('en-IN'),
      ],
      ['Revenue', 'Product Sales', this.totalSell.toLocaleString('en-IN')],
      ['---', 'TOTAL REVENUE', this.totalRevenue.toLocaleString('en-IN')],
      [
        'Expense',
        'Staff Salaries',
        this.totalSalaryCost.toLocaleString('en-IN'),
      ],
      [
        'Expense',
        'Stock Purchases',
        this.totalPurchase.toLocaleString('en-IN'),
      ],
      ['---', 'TOTAL COST', this.totalCost.toLocaleString('en-IN')],
      ['RESULT', 'NET PROFIT', this.netProfit.toLocaleString('en-IN')],
    ];

    autoTable(doc, {
      startY: 40,
      head: head,
      body: data,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }, // Dark Slate matching your theme
      didParseCell: (data) => {
        if (data.row.index === 7) {
          // Net Profit Row
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor =
            this.netProfit >= 0 ? [34, 197, 94] : [239, 68, 68];
        }
      },
    });

    doc.save(`Financial_Report_${new Date().getTime()}.pdf`);
  }
}
