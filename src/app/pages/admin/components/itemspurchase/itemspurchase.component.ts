import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemsService } from '../../master/service/items.service';
import { AdminService } from '../service/admin.service';
import { ConfigService } from '../service/configService/config.service';
import { Router } from '@angular/router';
import { SHARED_MODULES } from '../../../../constants/sharedModule';

@Component({
  selector: 'app-itemspurchase',
  imports: [SHARED_MODULES],
  templateUrl: './itemspurchase.component.html',
  styleUrl: './itemspurchase.component.css',
})
export class ItemspurchaseComponent {
  fb = inject(FormBuilder);
  purchaseForm!: FormGroup;
  entryForm!: FormGroup;
  itemService = inject(ItemsService);
  router = inject(Router);

  vendors: any[] = [];
  filteredVendors: any[] = [];
  itemsList: any[] = [];
  filteredItems: any[] = [];
  productsList: any[] = [];

  ngOnInit() {
    this.initForms();
    // this.loadSuppliers();
    this.loadItems();
  }

  initForms() {
    this.purchaseForm = this.fb.group({
      vendorName: ['', Validators.required],
      vendorId: [''],
      invoiceNo: ['', Validators.required],
      purchaseDate: [new Date().toISOString().split('T')[0]],
      items: this.fb.array([]),
      subTotal: [0],
      totalTax: [0],
      grandTotal: [0],
      remarks: [''],
    });

    this.entryForm = this.fb.group({
      itemId: [''],
      itemName: ['', Validators.required],
      qty: [1, [Validators.required, Validators.min(1)]],
      purchaseRate: [0, Validators.required],
      taxPerc: [18],
      taxAmt: [0],
      totalCost: [0],
    });
  }

  loadItems() {
    this.itemService
      .getItems()
      .subscribe((res: any) => (this.itemsList = res.data));
  }

  onItemType(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredItems = query
      ? this.itemsList.filter((i) => i.item_name.toLowerCase().includes(query))
      : [];
  }

  selectItem(item: any) {
    this.entryForm.patchValue({ itemName: item.item_name, itemId: item._id });
    this.filteredItems = [];
    this.itemService
      .getProductByItem(item._id)
      .subscribe((res: any) => (this.productsList = res.data || res));
  }

  filterVendors(vendor: any) {}
  selectVendor(v: any){}

  // --- Calculations ---
  calcEntryAmount() {
    const qty = this.entryForm.get('qty')?.value || 0;
    const rate = this.entryForm.get('purchaseRate')?.value || 0;
    const taxP = this.entryForm.get('taxPerc')?.value || 0;

    const basicAmt = qty * rate;
    const taxAmt = (basicAmt * taxP) / 100;
    const total = basicAmt + taxAmt;

    this.entryForm.patchValue(
      {
        taxAmt: taxAmt.toFixed(2),
        totalCost: total.toFixed(2),
      },
      { emitEvent: false },
    );
  }

  addItem() {
    if (this.entryForm.invalid) return;

    const itemData = this.entryForm.value;
    const itemGroup = this.fb.group({
      itemId: [itemData.itemId],
      itemName: [itemData.itemName],
      qty: [itemData.qty],
      purchaseRate: [itemData.purchaseRate],
      taxPerc: [itemData.taxPerc],
      taxAmt: [itemData.taxAmt],
      totalCost: [itemData.totalCost],
    });

    this.purchaseItems.push(itemGroup);
    this.calculateFinalTotals();
    this.entryForm.reset({ qty: 1, purchaseRate: 0, taxPerc: 18 });
  }

  calculateFinalTotals() {
    let subTotal = 0;
    let taxTotal = 0;

    this.purchaseItems.controls.forEach((control) => {
      const qty = control.get('qty')?.value;
      const rate = control.get('purchaseRate')?.value;
      subTotal += qty * rate;
      taxTotal += Number(control.get('taxAmt')?.value);
    });

    this.purchaseForm.patchValue({
      subTotal: subTotal.toFixed(2),
      totalTax: taxTotal.toFixed(2),
      grandTotal: (subTotal + taxTotal).toFixed(2),
    });
  }

  get purchaseItems() {
    return this.purchaseForm.get('items') as FormArray;
  }

  removeItem(index: number) {
    this.purchaseItems.removeAt(index);
    this.calculateFinalTotals();
  }

  // --- Save Logic ---
  savePurchase() {
    if (this.purchaseForm.invalid || this.purchaseItems.length === 0) {
      alert('Please add at least one item and select a supplier.');
      return;
    }

    const payload = this.purchaseForm.value;
    console.log('Saving Purchase Order...', payload);
    // Yahan aapka service call aayega
    // this.adminService.savePurchase(payload).subscribe(...)
  }

  resetForm() {}
  close() {
    this.router.navigate(['/admin']);
  }
}
