import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
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
  imports: [SHARED_MODULES],
  templateUrl: './overallsalaryreport.component.html',
  styleUrl: './overallsalaryreport.component.css',
})
export class OverallsalaryreportComponent implements AfterViewInit {
  @ViewChild('employeeLineChart')
  employeeLineChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('overallBarChart') overallBarChart!: ElementRef<HTMLCanvasElement>;

  // In real app, fetch this from a service
  salaries: StaffSalary[] = [
    {
      _id: '69a96f7c628bafbb3cd658d3',
      staffId: '69a57465cf86a334bdcd0ba4',
      staffName: 'Priya',
      date: '2026-03-05T00:00:00.000Z',
      amount: 15000,
      type: 'Salary',
      paymentMode: 'Bank Transfer',
      remarks: 'Salary for February 2026',
    },
    // add more records for multiple employees / months...
  ];

  // 2) Overall employee summary
  employeeTotals: {
    staffId: string;
    staffName: string;
    totalPaid: number;
    lastPaidOn: string;
  }[] = [];

  ngAfterViewInit(): void {
    this.buildOverallSummary();
    this.buildOverallChart();
  }

  // ------- OVERALL EMPLOYEE SUMMARY -------

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

  private buildOverallChart() {
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

  private toDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB'); // 05/03/2026
  }
}
