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

  filteredCustomers: any[] = [];
  filteredProducts: any[] = [];
  filteredItems: any[] = [];
  productsList: any[] = [];
  itemsList: any[] = [];
  parties = [];
  count: any;
  isError = false;
  showPopup = false;
  popupMessage = '';

  // ENTRY FORM (Item Entry Strip)
  entryForm: FormGroup = this.fb.group({
    date: [new Date().toISOString().split('T')[0]],
    itemName: ['', Validators.required], // Name for searching
    itemId: [''], // Hidden ID
    productName: ['', Validators.required],
    productId: [''],
    event: [''],
    qty: [, [Validators.required, Validators.min(1)]],
    rate: [0, Validators.required],
    amount: [0],
  });

  quotationForm: FormGroup = this.fb.group({
    quotationNo: [''],
    date: [new Date().toISOString().split('T')[0]],
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
    this.quotationService.getQuotationCount().subscribe((res) => {
      // console.log(res.count);
      const count = res.count;
      this.count = count + 1;
      // console.log(this.count);
      this.quotationForm.patchValue({
        quotationNo: this.count,
      });
    });

    this.loadItems();
    this.loadCustomers();
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

  loadCustomers() {
    this.quotationService.getCustomers().subscribe((res: any) => {
      this.parties = res.data || res;
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
    this.quotationForm.patchValue({
      outdoorParty: party.name,
      contactNo: party.contact,
    });

    this.filteredCustomers = [];
  }

  // Item search logic
  onItemType(event: any) {
    const val = event.target.value.toLowerCase();
    this.filteredItems = val
      ? this.itemsList.filter((i) => i.item_name.toLowerCase().includes(val))
      : [];
  }

  selectItem(item: any) {
    this.entryForm.patchValue({ itemName: item.item_name, itemId: item._id });
    this.filteredItems = []; // Close dropdown
    this.onItemSelect(item._id); // Load products
  }

  // Product search logic
  onProductType(event: any) {
    const val = event.target.value.toLowerCase();
    this.filteredProducts = val
      ? this.productsList.filter((p) =>
          p.product_name.toLowerCase().includes(val),
        )
      : [];
  }

  selectProduct(product: any) {
    this.entryForm.patchValue({
      productName: product.product_name,
      productId: product._id,
    });
    this.filteredProducts = []; // Close dropdown
    this.onProductSelect(product._id); // Auto-fill rate
  }

  onItemSelect(itemId: string) {
    const item = this.itemsList.find((x) => x._id === itemId);

    if (!item) return;

    this.productService.getProductByItem(itemId).subscribe((res: any) => {
      this.productsList = res.data || res;
    });
  }

  onProductSelect(productId: string) {
    const product = this.productsList.find((x) => x._id === productId);

    if (!product) return;

    this.entryForm.patchValue({
      rate: Number(product.bill_rate),
    });

    this.calculateAmount();
  }

  calculateAmount() {
    const qty = Number(this.entryForm.get('qty')?.value || 0);
    const rate = Number(this.entryForm.get('rate')?.value || 0);

    const amount = qty * rate;

    this.entryForm.patchValue({
      amount,
    });
  }

  addItem() {
    if (this.entryForm.invalid) return;

    const value = this.entryForm.value;

    const itemGroup = this.fb.group({
      date: [value.date],
      itemName: [value.itemName],
      productName: [value.productName],
      productId: [value.productId],
      event: [value.event],
      qty: [value.qty],
      rate: [value.rate],
      total: [value.amount],
    });

    this.items.push(itemGroup);
    this.calculateGrandTotal();
    this.clearItem();
  }

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
        this.triggerPopup('Quotation Created Successfully!', false);
        this.quotationForm.reset();
      },
      error: (err) => {
        console.error(err);
        this.triggerPopup('Something went wrong while saving!', true);
      },
    });
  }

  triggerPopup(message: string, error: boolean) {
    this.popupMessage = message;
    this.isError = error;
    this.showPopup = true;

    setTimeout(() => {
      this.showPopup = false;
    }, 3000);
  }

  close() {
    this.router.navigateByUrl('/admin');
  }
}
