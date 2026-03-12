import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { AdminService } from '../service/admin.service';
import { ItemsService } from '../../master/service/items.service';
import { OutdoororderprintComponent } from "../outdoororderprint/outdoororderprint.component";

@Component({
  selector: 'app-outdoororder',
  imports: [SHARED_MODULES, OutdoororderprintComponent],
  templateUrl: './outdoororder.component.html',
  styleUrl: './outdoororder.component.css',
})
export class OutdoororderComponent implements OnInit {
  router = inject(Router);
  outdoorService = inject(AdminService);
  itemService = inject(ItemsService);
  fb = inject(FormBuilder);
  orderForm!: FormGroup;
  filteredCustomers: any[] = [];
  productsList: any[] = [];
  itemsList: any[] = [];
  parties: any[] = [];
  count: any;
  isError = false;
  showPopup = false;
  popupMessage = '';
  entryDate = new Date().toISOString().split('T')[0];
  entryQty: number = 0;
  entryRate: number = 0;
  fixedGstRate: number = 0; // Config se aayega
  filteredOrders: any[] = [];
  orders: any[] = [];
  orderData: any[] = [];

  ngOnInit() {
    this.orderForm = this.fb.group({
      orderNo: [''],
      date: [new Date().toISOString().split('T')[0]],
      contactNo: ['', [Validators.required, Validators.pattern(`^[0-9]{10}$`)]],
      quotationNo: [''],
      outdoorParty: ['', [Validators.required]],
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
      // Payment Section
      paymentMode: ['Cash'], // Added
      transactionId: [''], // Added          // Matches your "Amount Paid" logic
      balanceDue: [0], // Added
    });

    this.outdoorService.getOrderCount().subscribe((res) => {
      // console.log(res.count);
      const count = res.count;
      this.count = count + 1;
      // console.log(this.count);
      this.orderForm.patchValue({
        orderNo: this.count,
      });
    });

    // Listen for Discount or Advance changes
    this.orderForm.valueChanges.subscribe(() => {
      this.calculateSubtotal();
    });

    this.loadItems();
    this.loadCustomers();
    this.loadOrders();
  }

  loadItems() {
    this.itemService.getItems().subscribe((res: any) => {
      this.itemsList = res.data;
    });
  }

  loadCustomers() {
    this.outdoorService.getCustomers().subscribe((res: any) => {
      this.parties = res.data || res;
    });
  }

  loadOrders() {
    this.outdoorService.getOutdoorOrder().subscribe((res) => {
      this.orders = res.orders;
      console.log(this.orders);
    });
  }

  filterParty(event: any) {
    const value = event.target.value.toLowerCase();
    if (!value) {
      this.filteredCustomers = [];
      return;
    }

    this.filteredCustomers = this.parties.filter(
      (party: any) =>
        party.name && party.name.toString().toLowerCase().includes(value),
    );
  }

  selectParty(party: any) {
    this.orderForm.patchValue({
      outdoorParty: party.name,
      contactNo: party.contact,
    });

    this.filteredCustomers = [];
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

  searchOrders(event: any) {
    const term = event.target.value.toString().toLowerCase();

    if (term) {
      this.filteredOrders = this.orders.filter((order) =>
        order.orderNo.toString().toLowerCase().includes(term),
      );
    } else {
      this.filteredOrders = [];
    }
  }

  // 2. बिल सिलेक्ट होने पर सारा डेटा फॉर्म में भरना
  selectOrder(order: any) {
    this.orderData = order;
    this.orderForm.patchValue({
      date: this.formatDate(order.date),
      orderNo: order.orderNo,
      subTotal: order.subTotal,
      discount: order.discount,
      cgstPerc: order.cgstPerc,
      cgstAmt: order.cgstAmt,
      sgstPerc: order.sgstPerc,
      sgstAmt: order.sgstAmt,
      igstPerc: order.igstPerc,
      igstAmt: order.igstAmt,
      grandTotal: order.grandTotal,
      balanceDue: order.balanceDue,
      advance: order.advance,
      outdoorParty: order.outdoorParty,
      contactNo: order.contactNo,
      quotationNo: order.quotationNo,
      couple: order.couple,
      address: order.address,
      remarks: order.remarks,
      notes: order.notes,
    });

    // 2. Items (FormArray) को अपडेट करें
    const itemsArray = this.orderForm.get('items') as FormArray;

    // पहले पुराने आइटम्स साफ़ करें
    while (itemsArray.length !== 0) {
      itemsArray.removeAt(0);
    }

    // अब रिस्पॉन्स वाले नए आइटम्स जोड़ें
    order.items.forEach((item: any) => {
      itemsArray.push(
        this.fb.group({
          date: this.formatDate(item.date),
          itemName: item.itemName,
          eventName: item.eventName,
          productName: item.productId?.product_name,
          qty: item.qty,
          rate: item.rate,
          total: item.total,
        }),
      );
    });

    this.filteredOrders = []; // ड्रॉपडाउन बंद करें
  }

  calculateSubtotal() {
    let subtotal = 0;
    this.items.controls.forEach((row: any) => {
      subtotal += row.get('total')?.value || 0;
    });

    const f = this.orderForm.getRawValue();
    const taxable = subtotal - (f.discount || 0);

    // GST Calculation
    const totalGstAmt = (taxable * this.fixedGstRate) / 100;
    const netTotal = taxable + totalGstAmt;
    const paid = f.advance || 0;

    this.orderForm.patchValue(
      {
        subTotal: subtotal.toFixed(2),
        totalGst: totalGstAmt.toFixed(2),
        grandTotal: netTotal.toFixed(2),
        balanceDue: (netTotal - paid).toFixed(2),
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

  // Entry Strip ka Total calculate karne ke liye
  get entryTotal(): number {
    return this.entryQty * this.entryRate;
  }

  clear() {
    this.orderForm.reset();
    this.entryDate = new Date().toISOString().split('T')[0];
    this.orderForm.patchValue({
      date: new Date().toISOString().split('T')[0],
      orderNo: this.count,
    });
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
      paymentMode: formValue.paymentMode,
      transactionId: formValue.transactionId,
      balanceDue: formValue.balanceDue,

      items: this.items.value,
    };

    this.outdoorService.createOutdoorOrder(payload).subscribe({
      next: (res: any) => {
        this.triggerPopup('Outdoor Order Created Successfully!', false);

        this.orderForm.reset({
          date: new Date().toISOString().split('T')[0],
          paymentMode: 'Cash',
          subTotal: 0,
          discount: 0,
          advance: 0,
          grandTotal: 0,
        });

        this.items.clear();
      },

      error: (err: any) => {
        console.error('Order creation failed', err);
        this.triggerPopup('Something went wrong while saving!', true);
      },
    });
  }

  // Pop-up handle karne ka function
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
    this.router.navigateByUrl('/admin');
  }

  printConfig = { rate: true };
  showRate: boolean = true;

  printOrder(rate: boolean) {
    this.showRate = rate;

    setTimeout(() => {
      window.print();
    }, 200);
  }

  onlyNumberKey(event: any) {
    const charCode = event.which ? event.which : event.keyCode;
    // Only allow numbers 0-9
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}
