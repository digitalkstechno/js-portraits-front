import { Component, inject } from '@angular/core';
import { AdminService } from '../../components/service/admin.service';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { IndiancurrencyPipe } from '../../pipe/indiancurrency.pipe';

@Component({
  selector: 'app-pendingpaymentsreport',
  imports: [SHARED_MODULES, IndiancurrencyPipe],
  templateUrl: './pendingpaymentsreport.component.html',
  styleUrl: './pendingpaymentsreport.component.css',
})
export class PendingpaymentsreportComponent {
  pendingList: any[] = [];
  outdoorService = inject(AdminService);
  pendingSummary: any;
  outstandingList: any[] = [];
  staffList: any[] = [];
  totalOutstanding = 0;
  totalSalaryPending = 0;
  pendingCategories = {
    orders: false,
    bills: false,
    sales: false,
    salaries: false,
  };

  ngOnInit() {
    this.loadPendingSummary();
  }

  loadPendingSummary(sDate?: string, eDate?: string) {
    this.outdoorService.getPendingAmountSummary(sDate, eDate).subscribe({
      next: (res) => {
        this.pendingSummary = res.reportData;
        // 1. Outstanding List Prepare karein (Orders, Bills, Sells ka mix)
        this.outstandingList = [
          { name: 'Outdoor Orders', ...this.pendingSummary.orders },
          { name: 'Outdoor Bills', ...this.pendingSummary.bills },
          { name: 'Product Sales', ...this.pendingSummary.sells },
        ];

        // 2. Staff List
        this.staffList = this.pendingSummary.staffStatus;

        // 3. Summary Cards Calculations
        this.totalOutstanding =
          this.pendingSummary.orders.totalPending +
          this.pendingSummary.bills.totalPending +
          this.pendingSummary.sells.totalPending +
          this.staffList.reduce(
            (acc: number, curr: any) => acc + curr.pendingAmount,
            0,
          );
        this.totalSalaryPending = this.staffList.reduce(
          (acc: number, curr: any) => acc + curr.pendingAmount,
          0,
        );
        this.pendingCategories.orders =
          this.pendingSummary.orders.totalPending > 0;
        this.pendingCategories.bills =
          this.pendingSummary.bills.totalPending > 0;
        this.pendingCategories.sales =
          this.pendingSummary.sells.totalPending > 0;
        this.pendingCategories.salaries = this.staffList.some(
          (s) => s.pendingAmount > 0,
        );
        console.log(res);
        // Force Angular to detect changes before initializing charts
        // this.cdr.detectChanges();
      },
      error: (err) => console.error('Error:', err),
    });
  }
}
