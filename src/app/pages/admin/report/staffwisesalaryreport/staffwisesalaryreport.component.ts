import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef); // 2. Inject karein

  salaries: StaffSalary[] = [];
  chartInstance: any = null;
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
      this.buildEmployeeTotals();

      if (this.employeeTotals.length) {
        this.onSelectEmployee(this.employeeTotals[0].staffId);

        // 3. Force Angular to update HTML (Canvas ko DOM mein laane ke liye)
        this.cdr.detectChanges();

        // 4. Phir chart build karein
        this.buildEmployeeLineChart();
      }
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

    // Build chart only if history exists
    if (this.employeeHistory.length > 0) {
      // Thoda delay taaki DOM render ho jaye (ngIf ke case mein zaroori hai)
      setTimeout(() => this.buildEmployeeLineChart(), 0);
    }
  }

  private buildEmployeeLineChart() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    if (!this.employeeLineChart) return;

    // FIX: Typescript ko explicit bataein ki labels strings hain
    // aur values numbers hain (ya null ho sakte hain)
    const labels: string[] = this.employeeHistory.map((h) => h.date);
    const values: (number | null)[] = this.employeeHistory.map((h) => h.amount);

    const ctx = this.employeeLineChart.nativeElement.getContext('2d');
    if (!ctx) return;

    // Config ko strictly type karein
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: labels, // Yahan Type mismatch solve ho gaya
        datasets: [
          {
            label: `${this.selectedStaffName} - Salary (₹)`,
            data: values, // Yahan data mismatch solve ho gaya
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
              label: (context) => {
                // context ka type automatic detect hoga
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: ₹${value?.toLocaleString('en-IN') ?? '0'}`;
              },
            },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            grid: { color: '#e5e7eb' },
            ticks: {
              callback: (value) => '₹' + value.toLocaleString('en-IN'),
            },
          },
        },
      },
    };

    this.chartInstance = new Chart(ctx, config as any);
  }

  private toDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB');
  }
}
