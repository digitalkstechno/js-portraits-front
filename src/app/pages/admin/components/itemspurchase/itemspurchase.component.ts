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
  itemservice = inject(AdminService);

  isError = false;
  showPopup = false;
  popupMessage = '';
  count: string = '';

  ngOnInit(): void {
    this.itemservice.getProductPurchaseCount().subscribe((res) => {
      // console.log(res.count);
      const count = res.count;
      this.count = count + 1;
      // console.log(this.count);
      this.purchaseForm.patchValue({
        invoiceNo: this.count,
      });
    });
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
      items: this.fb.array([]), // Table items storage
    });

    // Top Entry Strip Form
    this.entryForm = this.fb.group({
      itemName: ['', Validators.required],
      qty: [, [Validators.required, Validators.min(1)]],
      purchaseRate: [, Validators.required],
      taxPerc: [0],
      taxAmt: [0],
      totalCost: [0],
    });
  }

  // Helper to get FormArray
  get items() {
    return this.purchaseForm.get('items') as FormArray;
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
    this.items.push(
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
    this.items.removeAt(index);
    this.calculateFinalTotals();
  }

  // Calculate Footer Totals
  calculateFinalTotals() {
    let sub = 0;
    let tax = 0;
    let grand = 0;

    this.items.controls.forEach((control) => {
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
    if (this.purchaseForm.invalid) {
      this.purchaseForm.markAllAsTouched();
      this.triggerPopup('Please fill all required fields!', true);
      return;
    }

    const finalData = this.purchaseForm.value;
    console.log('Saving Purchase Data:', finalData);

    this.itemservice.savePurchase(finalData).subscribe({
      next: (res: any) => {
        this.triggerPopup('Product purchase recorded Successfully!', false);
        this.resetForm();
      },
      error: (err: any) => {
        console.error('Error saving purchase:', err);
        this.triggerPopup('Error: Could not save the transaction.', true);
      },
    });
  }

  resetForm() {
    this.entryForm.reset({
      itemName: '',
      qty: '',
      purchaseRate: '',
      taxPerc: 0,
      taxAmt: 0,
      totalCost: 0,
    });
    this.purchaseForm.reset({
      purchaseDate: new Date().toISOString().substring(0, 10),
      invoiceNo: this.count,
      subTotal: 0,
      totalTax: 0,
      grandTotal: 0,
    });
  }

  triggerPopup(message: string, error: boolean) {
    this.popupMessage = message;
    this.isError = error;
    this.showPopup = true;

    // 3 second baad apne aap gayab ho jayega
    setTimeout(() => {
      this.showPopup = false;
    }, 3000);
  }

  close() {
    this.router.navigate(['/admin']);
  }

  onView(){
    this.router.navigateByUrl('admin/product/purchase/view');
  }
}
