import { Component, inject } from '@angular/core';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemsService } from '../../master/service/items.service';
import { AdminService } from '../service/admin.service';

@Component({
  selector: 'app-quotation',
  imports: [SHARED_MODULES],
  templateUrl: './quotation.component.html',
  styleUrl: './quotation.component.css',
})
export class QuotationComponent {
  router = inject(Router);
  fb = inject(FormBuilder);
  productService = inject(ItemsService);
  quotationService = inject(AdminService);

  itemsList: any[] = [];
  productsList: any[] = [];

  // ENTRY FORM (Item Entry Strip)
  entryForm: FormGroup = this.fb.group({
    date: [''],
    itemId: ['', Validators.required],
    productId: ['', Validators.required],
    event: [''],
    qty: [0, Validators.required],
    rate: [0, Validators.required],
    amount: [0],
  });

  quotationForm: FormGroup = this.fb.group({
    quotationNo: [''],
    date: [new Date()],

    outdoorParty: [''],
    address: [''],
    contactNo: [''],
    email: [''],
    refBy: [''],

    package: [''],

    functionDate: [''],
    functionName: [''],

    items: this.fb.array([]),

    subTotal: [0],
    discount: [0],
    grandTotal: [0],

    notes: [''],
    remarks: [''],

    status: ['Draft'],
  });

  ngOnInit() {
    this.loadItems();
  }

  // LOAD ITEMS
  loadItems() {
    this.productService.getItems().subscribe((res: any) => {
      this.itemsList = res.data;
    });
  }

  // FORM ARRAY
  get items(): FormArray {
    return this.quotationForm.get('items') as FormArray;
  }

  // ITEM SELECT
  onItemSelect(itemId: string) {
    const item = this.itemsList.find((x) => x._id === itemId);

    if (!item) return;

    this.productService.getProductByItem(itemId).subscribe((res: any) => {
      this.productsList = res.data || res;
    });
  }

  // PRODUCT SELECT
  onProductSelect(productId: string) {
    const product = this.productsList.find((x) => x._id === productId);

    if (!product) return;

    this.entryForm.patchValue({
      rate: Number(product.bill_rate),
    });

    this.calculateAmount();
  }

  // AMOUNT CALCULATION
  calculateAmount() {
    const qty = Number(this.entryForm.get('qty')?.value || 0);
    const rate = Number(this.entryForm.get('rate')?.value || 0);

    const amount = qty * rate;

    this.entryForm.patchValue({
      amount,
    });
  }

  // ADD ITEM
  addItem() {
    if (this.entryForm.invalid) return;

    const value = this.entryForm.value;

    const itemData = this.itemsList.find((x) => x._id === value.itemId);
    const productData = this.productsList.find(
      (x) => x._id === value.productId,
    );

    const item = this.fb.group({
      date: [value.date],
      itemName: [itemData?.item_name],
      productName: [productData?.product_name],
      productId: [value.productId],
      event: [value.event],
      qty: [value.qty],
      rate: [value.rate],
      total: [value.amount],
    });

    this.items.push(item);
    // console.log("items", this.items.value);

    this.calculateGrandTotal();

    this.clearItem();
  }

  // REMOVE ITEM
  removeItem(index: number) {
    this.items.removeAt(index);
    this.calculateGrandTotal();
  }

  // GRAND TOTAL
  calculateGrandTotal() {
    let subTotal = 0;

    this.items.controls.forEach((item: any) => {
      subTotal += item.get('total')?.value || 0;
    });

    const discount = Number(this.quotationForm.get('discount')?.value || 0);

    const grandTotal = subTotal - discount;

    this.quotationForm.patchValue({
      subTotal,
      grandTotal,
    });
  }

  // CLEAR ENTRY STRIP
  clearItem() {
    this.entryForm.reset({
      qty: 0,
      rate: 0,
      amount: 0,
    });

    this.productsList = [];
  }

  clearAll() {
    this.entryForm.reset({
      qty: 0,
      rate: 0,
      amount: 0,
    });

    this.productsList = [];
    this.quotationForm.reset({
      quotationNo: [''],
      date: [new Date()],
      outdoorParty: [''],
      address: [''],
      contactNo: [''],
      email: [''],
      refBy: [''],
      package: [''],
      functionDate: [''],
      functionName: [''],
      subTotal: [0],
      discount: [0],
      grandTotal: [0],
      notes: [''],
      remarks: [''],
    });
  }

  // SAVE
  onSubmit() {
    if (this.quotationForm.invalid) return;

    const payload = {
      ...this.quotationForm.value,
      items: this.items.value,
    };

    console.log(payload);

    this.quotationService.createQuotation(payload).subscribe({
      next: (res) => {
        console.log('successfully created quotation', res);
        this.quotationForm.reset();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  close() {
    this.router.navigateByUrl('/admin');
  }
}
