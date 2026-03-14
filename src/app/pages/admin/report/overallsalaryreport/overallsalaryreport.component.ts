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
import * as XLSX from 'xlsx'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  // Instances track karne ke liye (taaki destroy kar sakein)
  barChartInstance: any = null;
  pieChartInstance: any = null;
  donutChartInstance: any = null;

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
      this.buildOverallSummary();
      this.computeStats();

      // Give DOM a tick to render canvas elements
      setTimeout(() => {
        this.buildOverallChart();
        this.buildPieChart();
        this.buildDonutChart();
      }, 100);
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
    // 1. Purana instance destroy karein
    if (this.barChartInstance) this.barChartInstance.destroy();

    if (!this.overallBarChart || !this.employeeTotals.length) return;

    const ctx = this.overallBarChart.nativeElement.getContext('2d');
    if (!ctx) return;

    // 2. Use 'any' type to bypass DeepPartialObject errors
    const config: any = {
      type: 'bar',
      data: {
        labels: this.employeeTotals.map((e) => e.staffName),
        datasets: [
          {
            label: 'Total Salary Paid (₹)',
            data: this.employeeTotals.map((e) => e.totalPaid),
            backgroundColor: '#0ea5e9',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true },
        },
      },
    };

    this.barChartInstance = new Chart(ctx, config);
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

  // Aapke existing loadStaffSalary ke niche ye function add karein
  downloadReport() {
    // 1. Data prepare karein (Table format ke liye)
    const dataToExport = this.employeeTotals.map((row) => ({
      'Employee Name': row.staffName,
      'Total Paid (₹)': row.totalPaid,
      'Last Paid Date': new Date(row.lastPaidOn).toLocaleDateString('en-GB'),
    }));

    // 2. Worksheet create karein
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);

    // 3. Columns ki width set karein (Optional, for better look)
    ws['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];

    // 4. Workbook create karke download karein
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Salary Report');

    const fileName = `Staff_Salary_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  downloadPDF() {
    const doc = new jsPDF();

    // 1. Report Title & Header
    doc.setFontSize(18);
    doc.text('Staff Salary Report', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Employees: ${this.employeeTotals.length}`, 14, 34);
    doc.text(
      `Total Amount Paid: Rs. ${this.totalPaid.toLocaleString('en-IN')}`,
      14,
      40,
    );

    // 2. Prepare Table Data
    const head = [['Employee Name', 'Total Paid (INR)', 'Last Paid Date']];
    const data = this.employeeTotals.map((row) => [
      row.staffName,
      `Rs. ${row.totalPaid.toLocaleString('en-IN')}`,
      new Date(row.lastPaidOn).toLocaleDateString('en-GB'),
    ]);

    // 3. Generate Table (AutoTable)
    autoTable(doc, {
      startY: 45,
      head: head,
      body: data,
      theme: 'striped', // Clean professional look
      headStyles: { fillColor: [14, 165, 233] }, // Matches your blue theme (#0ea5e9)
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        1: { halign: 'right' }, // Amount column right align
      },
    });

    // 4. Save the PDF
    const fileName = `Salary_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
}
