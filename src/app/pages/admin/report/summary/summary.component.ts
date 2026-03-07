import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

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
  }

  initChart() {
    new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Order Revenue',
            data: [12000, 19000, 15000, 22000],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Bill Revenue',
            data: [10000, 15000, 14000, 21000],
            borderColor: '#10b981',
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }
}
