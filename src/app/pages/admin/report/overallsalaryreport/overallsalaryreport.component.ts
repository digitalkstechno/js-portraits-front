import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { StaffService } from '../../components/staff-management/service/staff.service';
Chart.register(...registerables);

interface StaffSalary {
  _id: string;
  staffId: string;
  staffName: string;
  date: string;
  amount: number;
  type: string;
  paymentMode: string;
  remarks: string;
}

@Component({
  selector: 'app-overallsalaryreport',
  standalone: true,
  imports: [SHARED_MODULES],
  templateUrl: './overallsalaryreport.component.html',
  styleUrl: './overallsalaryreport.component.css',
})
export class OverallsalaryreportComponent implements AfterViewInit {
  @ViewChild('overallBarChart') overallBarChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutChart') donutChart!: ElementRef<HTMLCanvasElement>;

  staffService = inject(StaffService);

  salaries: StaffSalary[] = [];

  employeeTotals: {
    staffId: string;
    staffName: string;
    totalPaid: number;
    lastPaidOn: string;
  }[] = [];

  // stats
  totalPaid = 0;
  avgSalary = 0;

  ngOnInit() {
    this.loadStaffSalary();
  }

  ngAfterViewInit(): void {
    // charts are built after data arrives in loadStaffSalary
  }

  loadStaffSalary() {
    this.staffService.getStaffSalary().subscribe((res: any) => {
      this.salaries = res.salary || [];
      console.log('salary', this.salaries);

      this.buildOverallSummary();
      this.computeStats();
      this.buildOverallChart();
      this.buildPieChart();
      this.buildDonutChart();
    });
  }

  private buildOverallSummary() {
    const map = new Map<
      string,
      {
        staffId: string;
        staffName: string;
        totalPaid: number;
        lastPaidOn: string;
      }
    >();

    this.salaries.forEach((s) => {
      const key = s.staffId;
      const existing = map.get(key);
      const paidDate = new Date(s.date);

      if (!existing) {
        map.set(key, {
          staffId: s.staffId,
          staffName: s.staffName,
          totalPaid: s.amount,
          lastPaidOn: s.date,
        });
      } else {
        existing.totalPaid += s.amount;
        if (paidDate > new Date(existing.lastPaidOn)) {
          existing.lastPaidOn = s.date;
        }
      }
    });

    this.employeeTotals = Array.from(map.values()).sort((a, b) =>
      a.staffName.localeCompare(b.staffName),
    );
  }

  private computeStats() {
    this.totalPaid = this.salaries.reduce((sum, s) => sum + s.amount, 0);
    this.avgSalary = this.employeeTotals.length
      ? this.totalPaid / this.employeeTotals.length
      : 0;
  }

  private buildOverallChart() {
    if (!this.employeeTotals.length) return;

    const labels = this.employeeTotals.map((e) => e.staffName);
    const values = this.employeeTotals.map((e) => e.totalPaid);

    const ctx = this.overallBarChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Total Salary Paid (₹)',
            data: values,
            backgroundColor: '#0ea5e9',
            borderRadius: 6,
            maxBarThickness: 40,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ` ₹${ctx.parsed.y?.toLocaleString('en-IN') ?? '0'}`,
            },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: '#e5e7eb' } },
        },
      },
    };

    new Chart(ctx, config);
  }

  // Pie: salary share per employee
  private buildPieChart() {
    if (!this.employeeTotals.length) return;

    const labels = this.employeeTotals.map((e) => e.staffName);
    const values = this.employeeTotals.map((e) => e.totalPaid);

    const ctx = this.pieChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const colors = [
      '#6366f1',
      '#22c55e',
      '#f97316',
      '#e11d48',
      '#0ea5e9',
      '#a855f7',
    ];

    const config: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: labels.map((_, i) => colors[i % colors.length]),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                `${ctx.label}: ₹${ctx.parsed.toLocaleString('en-IN')}`,
            },
          },
        },
      },
    };

    new Chart(ctx, config);
  }

  // Donut: salary by type (Salary, Exposure, etc.)
  private buildDonutChart() {
    if (!this.salaries.length) return;

    const typeMap = new Map<string, number>();
    this.salaries.forEach((s) => {
      typeMap.set(s.type, (typeMap.get(s.type) ?? 0) + s.amount);
    });

    const labels = Array.from(typeMap.keys());
    const values = labels.map((l) => typeMap.get(l) ?? 0);

    const ctx = this.donutChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const colors = ['#0ea5e9', '#f97316', '#22c55e', '#e11d48'];

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: labels.map((_, i) => colors[i % colors.length]),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                `${ctx.label}: ₹${ctx.parsed.toLocaleString('en-IN')}`,
            },
          },
        },
      },
    };

    new Chart(ctx, config);
  }

  private toDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB');
  }
}
