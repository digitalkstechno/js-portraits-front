import { Component, inject } from '@angular/core';
import { AdminService } from '../service/admin.service';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { Router } from '@angular/router';

@Component({
  selector: 'app-itempurchaselist',
  imports: [SHARED_MODULES],
  templateUrl: './itempurchaselist.component.html',
  styleUrl: './itempurchaselist.component.css',
})
export class ItempurchaselistComponent {
  purchases: any[] = [];
  filteredPurchases: any[] = [];
  totalSpending: number = 0;
  service = inject(AdminService);
  router = inject(Router);

  ngOnInit() {
    this.fetchPurchases();
  }

  fetchPurchases() {
    this.service.getAllProductPurchase().subscribe((res: any) => {
      this.purchases = res;
      this.filteredPurchases = res;
      this.calculateGrandTotal();
    });
  }
  
  calculateGrandTotal() {
    this.totalSpending = this.filteredPurchases.reduce(
      (acc, curr) => acc + curr.grandTotal,
      0,
    );
  }

  startDate: string = '';
  endDate: string = '';

  onSearch(event?: any) {
    let filtered = [...this.purchases];

    // 1. Text Search Logic
    const query = event?.target?.value?.toLowerCase() || '';
    if (query) {
      filtered = filtered.filter(
        (p) =>
          p.vendorName.toLowerCase().includes(query) ||
          p.invoiceNo.toString().includes(query),
      );
    }

    // 2. Date Filter Logic
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate).getTime();
      const end = new Date(this.endDate).getTime();

      filtered = filtered.filter((p) => {
        const pDate = new Date(p.purchaseDate).getTime();
        return pDate >= start && pDate <= end;
      });
    }

    this.filteredPurchases = filtered;
    this.calculateGrandTotal();
  }

  close() {
    this.router.navigateByUrl('/admin/product/purchase');
  }
}
