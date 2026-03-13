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
  purchaseForm!: FormGroup;
  entryForm!: FormGroup;
  router = inject(Router);
  fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initForms();
  }

  initForms() {
    this.purchaseForm = this.fb.group({
      vendorName: ['', Validators.required],
      invoiceNo: [''],
      purchaseDate: [new Date().toISOString().substring(0, 10)], 
      remarks: [''],
      subTotal: [0],
      totalTax: [0],
      grandTotal: [0],
      purchaseItems: this.fb.array([]), // Table items storage
    });

    // Top Entry Strip Form
    this.entryForm = this.fb.group({
      itemName: ['', Validators.required],
      qty: [1, [Validators.required, Validators.min(1)]],
      purchaseRate: [0, Validators.required],
      taxPerc: [0],
      taxAmt: [0],
      totalCost: [0],
    });
  }

  // Helper to get FormArray
  get purchaseItems() {
    return this.purchaseForm.get('purchaseItems') as FormArray;
  }

  // Calculation for the Entry Strip
  calcEntryAmount() {
    const qty = this.entryForm.value.qty || 0;
    const rate = this.entryForm.value.purchaseRate || 0;
    const taxPerc = this.entryForm.value.taxPerc || 0;

    const baseAmount = qty * rate;
    const taxAmount = (baseAmount * taxPerc) / 100;
    const total = baseAmount + taxAmount;

    this.entryForm.patchValue(
      {
        taxAmt: taxAmount,
        totalCost: total,
      },
      { emitEvent: false },
    );
  }

  // Add item from Strip to Table
  addItem() {
    if (this.entryForm.invalid) {
      alert('Please fill Item Name, Qty and Rate');
      return;
    }

    const itemData = this.entryForm.value;

    // Push to FormArray
    this.purchaseItems.push(
      this.fb.group({
        itemName: [itemData.itemName],
        qty: [itemData.qty],
        purchaseRate: [itemData.purchaseRate],
        taxPerc: [itemData.taxPerc],
        taxAmt: [itemData.taxAmt],
        totalCost: [itemData.totalCost],
      }),
    );

    this.calculateFinalTotals();

    // Reset entry strip for next item
    this.entryForm.reset({
      itemName: '',
      qty: 1,
      purchaseRate: 0,
      taxPerc: 0,
      taxAmt: 0,
      totalCost: 0,
    });
  }

  removeItem(index: number) {
    this.purchaseItems.removeAt(index);
    this.calculateFinalTotals();
  }

  // Calculate Footer Totals
  calculateFinalTotals() {
    let sub = 0;
    let tax = 0;
    let grand = 0;

    this.purchaseItems.controls.forEach((control) => {
      const item = control.value;
      sub += item.qty * item.purchaseRate;
      tax += item.taxAmt;
      grand += item.totalCost;
    });

    this.purchaseForm.patchValue({
      subTotal: sub,
      totalTax: tax,
      grandTotal: grand,
    });
  }

  savePurchase() {
    if (this.purchaseForm.invalid || this.purchaseItems.length === 0) {
      alert('Please fill vendor details and add at least one item.');
      return;
    }

    const finalData = this.purchaseForm.value;
    console.log('Saving Purchase Data:', finalData);

    // Call your service here:
    // this.service.postPurchase(finalData).subscribe(...)

    alert('Purchase Posted Successfully!');
    this.resetForm();
  }

  resetForm() {
    this.purchaseItems.clear();
    this.purchaseForm.reset({
      purchaseDate: new Date().toISOString().substring(0, 10),
      subTotal: 0,
      totalTax: 0,
      grandTotal: 0,
    });
  }

  close() {
    this.router.navigate(['/admin']);
  }
}
