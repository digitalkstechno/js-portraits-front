import { Component, inject } from '@angular/core';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemsService } from '../../master/service/items.service';
import { AdminService } from '../service/admin.service';

@Component({
  selector: 'app-outdoorbill',
  imports: [SHARED_MODULES],
  templateUrl: './outdoorbill.component.html',
  styleUrl: './outdoorbill.component.css',
})
export class OutdoorbillComponent {
  fb = inject(FormBuilder);
  itemService = inject(ItemsService);
  billService = inject(AdminService);
  router = inject(Router);

  billForm!: FormGroup;
  entryForm!: FormGroup;

  itemsList: any[] = [];
  productsList: any[] = [];
  filteredItems: any[] = [];
  filteredProducts: any[] = [];

  ngOnInit() {
    this.initForms();
    this.loadItems();

    // Jab bhi discount, tax ya advance badle, calculation refresh ho
    this.billForm.valueChanges.subscribe(() => {
      this.calculateGrandTotal();
    });
  }

  initForms() {
    this.billForm = this.fb.group({
      book: [''],
      billNo: [''],
      date: [new Date().toISOString().split('T')[0]],
      outdoorParty: [''],
      address: [''],
      orderNo: [''],
      gstType: [''],
      govt: [''],
      coupleName: [''],
      gst: [''],
      package: [''],
      items: this.fb.array([]),
      subTotal: [0],
      discount: [0],
      cgstPerc: [0],
      cgstAmt: [0],
      sgstPerc: [0],
      sgstAmt: [0],
      igstPerc: [0],
      igstAmt: [0],
      netTotal: [0],
      advance: [0],
      balanceDue: [0],
    });

    this.entryForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0]],
      itemName: ['', Validators.required],
      itemId: [''],
      productName: ['', Validators.required],
      productId: [''],
      event: [''],
      qty: [1],
      rate: [0],
      amount: [0],
      place: [''],
      time: [''],
    });
  }

  loadItems() {
    this.itemService
      .getItems()
      .subscribe((res: any) => (this.itemsList = res.data));
  }

  // --- SEARCH DROPDOWN LOGIC ---
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

  onProductType(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredProducts = query
      ? this.productsList.filter((p) =>
          p.product_name.toLowerCase().includes(query),
        )
      : [];
  }

  selectProduct(p: any) {
    this.entryForm.patchValue({
      productName: p.product_name,
      productId: p._id,
      rate: p.bill_rate,
      amount: p.bill_rate * this.entryForm.get('qty')?.value,
    });
    this.filteredProducts = [];
  }

  // --- TABLE & TOTALS LOGIC ---
  get itemsFormArray() {
    return this.billForm.get('items') as FormArray;
  }

  addItem() {
    if (this.entryForm.invalid) return;
    const val = this.entryForm.value;
    const itemGroup = this.fb.group({
      date: [val.date],
      itemName: [val.itemName],
      productName: [val.productName],
      event: [val.event],
      qty: [val.qty],
      rate: [val.rate],
      total: [val.qty * val.rate],
      place: [val.place],
      time: [val.time],
    });
    this.itemsFormArray.push(itemGroup);
    this.calculateGrandTotal();
    this.clearEntry();
  }

  calculateGrandTotal() {
    let subTotal = 0;
    this.itemsFormArray.controls.forEach(
      (c: any) => (subTotal += c.get('total')?.value || 0),
    );

    const f = this.billForm.value;
    const taxable = subTotal - f.discount;

    const cgstAmt = (taxable * f.cgstPerc) / 100;
    const sgstAmt = (taxable * f.sgstPerc) / 100;
    const igstAmt = (taxable * f.igstPerc) / 100;

    const netTotal = taxable + cgstAmt + sgstAmt + igstAmt;

    this.billForm.patchValue(
      {
        subTotal,
        cgstAmt: cgstAmt.toFixed(2),
        sgstAmt: sgstAmt.toFixed(2),
        igstAmt: igstAmt.toFixed(2),
        netTotal: netTotal.toFixed(2),
        balanceDue: (netTotal - f.advance).toFixed(2),
      },
      { emitEvent: false },
    );
  }

  clearEntry() {
    this.entryForm.reset({
      date: new Date().toISOString().split('T')[0],
      qty: 1,
      rate: 0,
      amount: 0,
    });
  }

  clearAll() {
    // 1. Reset Entry Strip (Input area)
    this.entryForm.reset({
      date: new Date().toISOString().split('T')[0],
      qty: 1,
      rate: 0,
      amount: 0,
      itemName: '',
      productName: '',
    });

    // 2. Clear Search Lists
    this.productsList = [];
    this.filteredItems = [];
    this.filteredProducts = [];

    // 3. Clear Table Items (FormArray)
    // Table ke saare rows delete karne ke liye ye zaroori hai
    while (this.itemsFormArray.length !== 0) {
      this.itemsFormArray.removeAt(0);
    }

    // 4. Reset Main Bill Form
    this.billForm.reset({
      book: '',
      billNo: '',
      date: new Date().toISOString().split('T')[0],
      outdoorParty: '',
      address: '',
      orderNo: '',
      gstType: '',
      govt: '',
      coupleName: '',
      gst: '',
      package: '',
      subTotal: 0,
      discount: 0,
      cgstPerc: 0,
      cgstAmt: 0,
      sgstPerc: 0,
      sgstAmt: 0,
      igstPerc: 0,
      igstAmt: 0,
      netTotal: 0,
      advance: 0,
      balanceDue: 0,
    });
  }

  onSubmit() {}

  close() {
    this.router.navigate(['/admin']);
  }
}
