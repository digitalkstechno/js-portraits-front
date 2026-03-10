import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, ChartOptions } from 'chart.js';

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
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css',
})
export class SummaryComponent implements OnInit, AfterViewInit {
  // Use ViewChild to reference the canvas safely
  @ViewChild('revenueChart') chartCanvas!: ElementRef;
  @ViewChild('donutChart') donutCanvas!: ElementRef<HTMLCanvasElement>;

  reportData: EmployeeReport[] = [
    {
      name: 'Alex Rivera',
      role: 'Sales Mgr',
      salary: 4500,
      revenue: 45000,
      status: 'Paid',
    },
    {
      name: 'Sam Chen',
      role: 'Field Lead',
      salary: 3200,
      revenue: 12000,
      status: 'Paid',
    },
    {
      name: 'Maria Garcia',
      role: 'Coordinator',
      salary: 3500,
      revenue: 18500,
      status: 'Pending',
    },
  ];

  constructor() {}

  ngOnInit(): void {
    // Logic for data fetching would go here
  }

  ngAfterViewInit(): void {
    this.initChart();
    this.initDonutChart();
  }

  initChart() {
    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#e5e7eb',
            boxWidth: 14,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: '#020617',
          borderColor: '#334155',
          borderWidth: 1,
          titleColor: '#e5e7eb',
          bodyColor: '#cbd5f5',
          padding: 10,
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#9ca3af',
          },
          grid: {
            color: 'rgba(148,163,184,0.12)',
          },
        },
        y: {
          ticks: {
            color: '#9ca3af',
          },
          grid: {
            color: 'rgba(148,163,184,0.12)',
          },
        },
      },
    };

    new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Order Revenue',
            data: [12000, 19000, 15000, 22000],
            borderColor: '#60a5fa',
            backgroundColor: 'rgba(37, 99, 235, 0.25)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#1d4ed8',
          },
          {
            label: 'Bill Revenue',
            data: [10000, 15000, 14000, 21000],
            borderColor: '#34d399',
            backgroundColor: 'transparent',
            borderDash: [6, 6],
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#22c55e',
          },
        ],
      },
      options,
    });
  }

  initDonutChart() {
    const ctx = this.donutCanvas.nativeElement;

    const options: ChartOptions<'doughnut'> = {
      cutout: '65%', // donut feel [web:26][web:29]
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: '#e5e7eb',
            boxWidth: 14,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: '#020617',
          borderColor: '#334155',
          borderWidth: 1,
          titleColor: '#e5e7eb',
          bodyColor: '#cbd5f5',
          padding: 10,
        },
      },
    };

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Total Revenue', 'Total Cost'],
        datasets: [
          {
            data: [this.totalRevenue, this.totalCost],
            backgroundColor: ['#22c55e', '#f97316'],
            borderColor: ['#16a34a', '#ea580c'],
            borderWidth: 1,
          },
        ],
      },
      options,
    });
  }

  outdoorOrderRevenue = 45200;
  outdoorBillRevenue = 38000;
  totalSalaryCost = 12400;
  totalPurchase = 12400;
  totalSpend = 12400;

  get totalRevenue(): number {
    return this.outdoorOrderRevenue + this.outdoorBillRevenue;
  }

  get totalCost(): number {
    return this.totalSalaryCost + this.totalPurchase + this.totalSpend;
  }

  get netProfit(): number {
    return this.totalRevenue - this.totalCost;
  }
}
