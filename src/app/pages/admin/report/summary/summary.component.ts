import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, ChartOptions } from 'chart.js';
import { AdminService } from '../../components/service/admin.service';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { IndiancurrencyPipe } from '../../pipe/indiancurrency.pipe';

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
    if (this.revenueChartInstance) this.revenueChartInstance.destroy();

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.revenueChartInstance = new Chart(ctx, {
      type: 'bar', // Line ki jagah Bar zyada suit karega comparison ke liye
      data: {
        labels: ['Orders', 'Bills', 'Direct Sales'],
        datasets: [{
          label: 'Revenue Analysis',
          data: [this.outdoorOrderRevenue, this.outdoorBillRevenue, this.totalSell],
          backgroundColor: ['#60a5fa', '#34d399', '#a855f7'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#e5e7eb' } },
        },
        scales: {
          y: {
            ticks: { color: '#9ca3af' },
            grid: { color: 'rgba(255,255,255,0.1)' },
          },
          x: { ticks: { color: '#9ca3af' }, grid: { display: false } },
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
}
