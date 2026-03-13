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

  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredPurchases = this.purchases.filter(
      (p) =>
        p.vendorName.toLowerCase().includes(query) ||
        p.invoiceNo.toString().includes(query),
    );
    this.calculateGrandTotal();
  }

  calculateGrandTotal() {
    this.totalSpending = this.filteredPurchases.reduce(
      (acc, curr) => acc + curr.grandTotal,
      0,
    );
  }

  close() {
    this.router.navigateByUrl('/admin/product/purchase');
  }
}
