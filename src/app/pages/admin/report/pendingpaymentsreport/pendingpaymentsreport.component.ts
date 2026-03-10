import { Component, inject } from '@angular/core';
import { AdminService } from '../../components/service/admin.service';
import { SHARED_MODULES } from '../../../../constants/sharedModule';

@Component({
  selector: 'app-pendingpaymentsreport',
  imports: [SHARED_MODULES],
  templateUrl: './pendingpaymentsreport.component.html',
  styleUrl: './pendingpaymentsreport.component.css',
})
export class PendingpaymentsreportComponent {
  // report.component.ts
  pendingList: any[] = [];
  billService = inject(AdminService);

  loadPendingReport() {
    this.billService.getPendingPaymentsReport().subscribe((res: any) => {
      this.pendingList = res.data;
    });
  }

  // Total Pending Amount nikalne ke liye
  getTotalPending() {
    return this.pendingList.reduce((acc, curr) => acc + curr.balanceDue, 0);
  }

  getAvgPending() {
    if (this.pendingList.length === 0) return 0;
    return this.getTotalPending() / this.pendingList.length;
  }
}
