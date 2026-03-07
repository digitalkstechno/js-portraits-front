import { Component, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
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
  selector: 'app-staffwisesalaryreport',
  standalone: true,
  imports: [SHARED_MODULES],
  templateUrl: './staffwisesalaryreport.component.html',
  styleUrl: './staffwisesalaryreport.component.css',
})
export class StaffwisesalaryreportComponent implements AfterViewInit {
  @ViewChild('employeeLineChart')
  employeeLineChart!: ElementRef<HTMLCanvasElement>;
  staffService = inject(StaffService);

  salaries: StaffSalary[] = [];

  selectedStaffId: string | null = null;
  selectedStaffName = '';
  employeeHistory: {
    date: string;
    amount: number;
    type: string;
    paymentMode: string;
    remarks: string;
  }[] = [];

  employeeTotals: {
    staffId: string;
    staffName: string;
    totalPaid: number;
    lastPaidOn: string;
  }[] = [];

  ngOnInit() {
    this.loadStaffSalary();
  }

  ngAfterViewInit(): void {
    // nothing here OR only logic that does not depend on data
  }

  loadStaffSalary() {
    this.staffService.getStaffSalary().subscribe((res: any) => {
      this.salaries = res.salary || [];
      console.log('salary', this.salaries);

      // now that data is here, build summary and default chart
      this.buildEmployeeTotals();
      this.initDefaultEmployee();
    });
  }

  private buildEmployeeTotals() {
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
      const existing = map.get(s.staffId);
      if (!existing) {
        map.set(s.staffId, {
          staffId: s.staffId,
          staffName: s.staffName,
          totalPaid: s.amount,
          lastPaidOn: s.date,
        });
      } else {
        existing.totalPaid += s.amount;
        if (new Date(s.date) > new Date(existing.lastPaidOn)) {
          existing.lastPaidOn = s.date;
        }
      }
    });

    this.employeeTotals = Array.from(map.values());
  }

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
    if (!this.employeeHistory.length) return;

    const labels = this.employeeHistory.map((h) => h.date);
    const values = this.employeeHistory.map((h) => h.amount);

    const ctx = this.employeeLineChart.nativeElement.getContext('2d');
    if (!ctx) return;

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
    return new Date(iso).toLocaleDateString('en-GB');
  }
}
