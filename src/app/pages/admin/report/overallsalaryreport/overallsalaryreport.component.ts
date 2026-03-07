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

  // 1) Individual employee report
  selectedStaffId: string | null = null;
  selectedStaffName = '';
  employeeHistory: {
    date: string;
    amount: number;
    type: string;
    paymentMode: string;
    remarks: string;
  }[] = [];

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
    this.initDefaultEmployee();
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

  // ------- INDIVIDUAL EMPLOYEE REPORT -------

  initDefaultEmployee() {
    if (this.employeeTotals.length) {
      this.onSelectEmployee(this.employeeTotals[0].staffId);
    }
  }

  onSelectEmployee(staffId: string) {
    this.selectedStaffId = staffId;
    const staff = this.employeeTotals.find((e) => e.staffId === staffId);
    this.selectedStaffName = staff?.staffName ?? '';

    const history = this.salaries
      .filter((s) => s.staffId === staffId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    this.employeeHistory = history.map((s) => ({
      date: this.toDate(s.date),
      amount: s.amount,
      type: s.type,
      paymentMode: s.paymentMode,
      remarks: s.remarks,
    }));

    this.buildEmployeeLineChart();
  }

  private buildEmployeeLineChart() {
    const labels = this.employeeHistory.map((h) => h.date);
    const values = this.employeeHistory.map((h) => h.amount);

    const ctx = this.employeeLineChart.nativeElement.getContext('2d');
    if (!ctx) return;

    // destroy old chart if you store ref; here simple new chart for brevity
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `${this.selectedStaffName} - Salary (₹)`,
            data: values,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34,197,94,0.15)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 4,
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
