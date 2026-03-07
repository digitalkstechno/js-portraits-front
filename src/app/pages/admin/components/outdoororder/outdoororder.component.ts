import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { AdminService } from '../service/admin.service';
import { ItemsService } from '../../master/service/items.service';

@Component({
  selector: 'app-outdoororder',
  imports: [SHARED_MODULES],
  templateUrl: './outdoororder.component.html',
  styleUrl: './outdoororder.component.css',
})
export class OutdoororderComponent implements OnInit {
  router = inject(Router);
  outdoorService = inject(AdminService);
  itemService = inject(ItemsService);
  fb = inject(FormBuilder);
  orderForm!: FormGroup;
  itemsList: any[] = [];
  productsList: any[] = [];

  ngOnInit() {
    this.orderForm = this.fb.group({
      orderNo: [''],
      date: [new Date().toISOString().split('T')[0]],
      contactNo: [''],
      quotationNo: [''],

      outdoorParty: [''],
      couple: [''],
      address: [''],
      remarks: [''],
      notes: [''],
      package: [''],

      items: this.fb.array([]),

      subTotal: [0],
      discount: [0],
      advance: [0],
      grandTotal: [0],
    });

    // Listen for Discount or Advance changes
    this.orderForm.valueChanges.subscribe(() => {
      this.calculateSubtotal();
    });

    this.loadItems();
  }

  loadItems() {
    this.itemService.getItems().subscribe((res: any) => {
      this.itemsList = res.data;
    });
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  createItem(): FormGroup {
    const item = this.fb.group({
      date: [''],
      itemName: [''],
      productName: [''], // Display ke liye
      productId: [''], // Backend ID ke liye
      eventName: [''],
      qty: [0],
      rate: [0],
      total: [0],
      place: [''],
      time: [''],
    });

    // This ensures that when you patch qty or rate, the total updates immediately
    item.valueChanges.subscribe(() => {
      const qty = item.get('qty')?.value || 0;
      const rate = item.get('rate')?.value || 0;
      const total = qty * rate;

      // { emitEvent: false } is vital to prevent an infinite loop
      item.get('total')?.patchValue(total, { emitEvent: false });
      this.calculateSubtotal();
    });

    return item;
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    this.calculateSubtotal();
  }

  calculateSubtotal() {
    let subtotal = 0;

    // 1. Calculate sum of all item totals
    this.items.controls.forEach((row: any) => {
      subtotal += row.get('total')?.value || 0;
    });

    // 2. Get Discount and Advance from form
    const discount = this.orderForm.get('discount')?.value || 0;
    const advance = this.orderForm.get('advance')?.value || 0;

    // 3. Grand Total logic
    const grand = subtotal - discount - advance;

    // 4. Update the form without triggering another 'valueChanges' event
    this.orderForm.patchValue(
      {
        subTotal: subtotal,
        grandTotal: grand,
      },
      { emitEvent: false },
    );
  }

  searchItem(event: any) {
    const keyword = event.target.value.toLowerCase();

    this.itemsList = this.itemsList.filter((i: any) =>
      i.item_name.toLowerCase().includes(keyword),
    );
  }

  searchQuotation() {
    const qNo = this.orderForm.get('quotationNo')?.value;
    this.outdoorService.getQuotationByNumber(qNo).subscribe((res: any) => {
      // Patch Main Form
      this.orderForm.patchValue({
        date: this.formatDate(res.date),
        outdoorParty: res.outdoorParty,
        contactNo: res.contactNo,
        couple: res.couple,
        address: res.address,
        remarks: res.remarks,
        // ... other fields
      });

      // Clear and Fill Table
      // this.items.clear();
      res.items.forEach((item: any) => {
        const row = this.createItem();
        row.patchValue({
          date: item.date,
          itemName: item.itemName,
          productName: item.productId?.product_name || 'Product', // API se agar name aa raha ho
          productId: item.productId,
          eventName: item.event,
          qty: item.qty,
          rate: item.rate,
          total: item.total,
        });
        this.items.push(row);
      });
    });
  }

  // Helper to format date if your input expects DD/MM/YYYY
  formatDate(dateStr: string) {
    if (!dateStr) return '';

    const d = new Date(dateStr);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  selectItemByRow(event: any, index: number) {
    const selectedName = event.target.value;

    // Find the item object from your list based on the name typed/selected
    const item = this.itemsList.find((i) => i.item_name === selectedName);

    if (item) {
      // 1. Fetch products specifically for this item
      this.itemService.getProductByItem(item._id).subscribe((res: any) => {
        // NOTE: If your productsList is shared, it will update for all rows.
        // For a more advanced setup, you'd store products in an array per row index.
        this.productsList = res.data || res;
      });

      // 2. Optionally clear the product and rate if the item changed
      const row = this.items.at(index);
      row.patchValue({
        productId: '',
        rate: 0,
      });
    }
  }

  // Logic for the Entry Strip (The inputs above the table)
  selectedItemForEntry: any = null;

  selectItem(itemId: any) {
    const item = this.itemsList.find((i) => i._id === itemId);
    this.selectedItemForEntry = item;

    this.itemService.getProductByItem(itemId).subscribe((res: any) => {
      this.productsList = res.data || res; // Adjust based on your API response structure
    });
  }

  // Variables for Entry Strip
  entryDate: string = '';
  entryEventName: string = '';
  entryQty: number = 0;
  entryRate: number = 0;
  entryPlace: string = '';
  entryTime: string = '';
  selectedProductId: string = '';

  // Jab Product select karein, rate auto-fill ho jaye
  selectProduct(event: any) {
    this.selectedProductId = event.target.value;
    const product = this.productsList.find(
      (p) => p._id === this.selectedProductId,
    );
    if (product) {
      this.entryRate = product.bill_rate || 0;
    }
  }

  // Entry Strip ka Total calculate karne ke liye
  get entryTotal(): number {
    return this.entryQty * this.entryRate;
  }

  // addItem() mein dono values patch karein
  addItem() {
    const product = this.productsList.find(
      (p) => p._id === this.selectedProductId,
    );

    const newItem = this.createItem();
    newItem.patchValue({
      date: this.entryDate,
      itemName: this.selectedItemForEntry.item_name,
      productName: product ? product.product_name : '', // Yahan Name jayega
      productId: this.selectedProductId, // Yahan ID jayegi
      eventName: this.entryEventName,
      qty: this.entryQty,
      rate: this.entryRate,
      total: this.entryTotal,
      place: this.entryPlace,
      time: this.entryTime,
    });

    this.items.push(newItem);
    this.resetEntryFields();
  }

  resetEntryFields() {
    this.entryDate = '';
    this.entryEventName = '';
    this.entryQty = 0;
    this.entryRate = 0;
    this.entryPlace = '';
    this.entryTime = '';
    this.selectedProductId = '';

    this.itemsList = [];
    this.productsList = [];
  }
  // Update rate when product is selected in the table row
  onProductChange(index: number) {
    const row = this.items.at(index);
    const productId = row.value.productId;
    const product = this.productsList.find((p) => p._id === productId);

    if (product) {
      row.patchValue({
        rate: product.bill_rate || 0,
        // Total calculation is handled by the valueChanges subscription inside createItem()
      });
    }
  }

  onSubmit() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const formValue = this.orderForm.value;

    const payload = {
      orderNo: formValue.orderNo,
      quotationNo: formValue.quotationNo,
      date: formValue.date,
      contactNo: formValue.contactNo,

      outdoorParty: formValue.outdoorParty,
      couple: formValue.couple,
      address: formValue.address,
      remarks: formValue.remarks,
      notes: formValue.notes,
      package: formValue.package,

      subTotal: formValue.subTotal,
      discount: formValue.discount,
      advance: formValue.advance,
      grandTotal: formValue.grandTotal,

      items: this.items.value,
    };

    this.outdoorService.createOutdoorOrder(payload).subscribe({
      next: (res: any) => {
        alert('Outdoor Order Created Successfully');

        this.orderForm.reset({
          date: new Date().toISOString().split('T')[0],
          subTotal: 0,
          discount: 0,
          advance: 0,
          grandTotal: 0,
        });

        this.items.clear();
      },

      error: (err: any) => {
        console.error('Order creation failed', err);
        alert('Failed to create order');
      },
    });
  }

  close() {
    this.router.navigateByUrl('/admin');
  }
}
