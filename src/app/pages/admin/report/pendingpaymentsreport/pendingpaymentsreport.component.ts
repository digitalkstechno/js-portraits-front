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
  pendingList: any[] = [];
  outdoorService = inject(AdminService);

  ngOnInit() {
    this.loadPendingSummary();
  }

  loadPendingSummary(sDate?: string, eDate?: string) {
    this.outdoorService.getPendingAmountSummary(sDate, eDate).subscribe({
      next: (res) => {
        console.log(res);
        // Force Angular to detect changes before initializing charts
        // this.cdr.detectChanges();
      },
      error: (err) => console.error('Error:', err),
    });
  }
}
