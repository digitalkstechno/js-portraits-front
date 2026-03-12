import { Component, inject } from '@angular/core';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemsService } from '../../master/service/items.service';
import { AdminService } from '../service/admin.service';
import { ConfigService } from '../service/configService/config.service';

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
  gstService = inject(ConfigService);
  router = inject(Router);

  billForm!: FormGroup;
  entryForm!: FormGroup;
  count: any;

  filteredCustomers: any[] = [];
  filteredBooks: any[] = [];
  parties: any[] = [];
  books: any[] = [];
  bills: any[] = [];
  itemsList: any[] = [];
  productsList: any[] = [];
  filteredItems: any[] = [];
  filteredProducts: any[] = [];

  isError = false;
  showPopup = false;
  popupMessage = '';
  selectedBookName: string = '';

  ngOnInit() {
    this.initForms();
    this.billService.getOutdoorBillCount().subscribe((res) => {
      // console.log(res.count);
      const count = res.count;
      this.count = count + 1;
      // console.log(this.count);
      this.billForm.patchValue({
        billNo: this.count,
      });
    });
    this.loadItems();
    this.loadCustomers();
    this.loadBooks();
    this.loadBills();
    this.loadGstConfiguration();

    // Jab bhi discount, tax ya advance badle, calculation refresh ho
    this.billForm.valueChanges.subscribe(() => {
      this.calculateGrandTotal();
    });
  }

  initForms() {
    this.billForm = this.fb.group({
      bookName: ['', Validators.required],
      billNo: [this.count],
      date: [new Date().toISOString().split('T')[0]],
      outdoorParty: ['', [Validators.required]],
      address: [''],
      // orderNo: [''],
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
      qty: [],
      rate: [0],
      amount: [0],
      place: [''],
      time: [''],
    });
  }

  loadCustomers() {
    this.billService.getCustomers().subscribe((res: any) => {
      this.parties = res.data || res;
    });
  }

  loadBooks() {
    this.billService.getOutdoorBooks().subscribe((res: any) => {
      const books = res.books;
      this.books = books.filter((b: any) => !b.notDisplayInOutBill);
      console.log(this.books);
    });
  }

  loadBills() {
    this.billService.getOutdoorBill().subscribe((res) => {
      this.bills = res.bills;
      console.log(this.bills);
    });
  }

  gstConfig: any;
  loadGstConfiguration() {
    this.gstService.getGstConfig().subscribe((config: any) => {
      if (config) {
        this.gstConfig = config;
        this.gstService.getGstConfig().subscribe((config) => {
          if (config) {
            // अगर Local है तो आधा-आधा, वरना IGST
            this.billForm.patchValue({
              cgstPerc: config.isLocal ? config.defaultGstRate / 2 : 0,
              sgstPerc: config.isLocal ? config.defaultGstRate / 2 : 0,
              igstPerc: config.isInterstate ? config.defaultGstRate : 0,
            });
            this.calculateGrandTotal();
          }
        });
      }
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
    this.billForm.patchValue({
      outdoorParty: party.name,
    });

    this.filteredCustomers = [];
  }

  filterBooks(event: any) {
    const value = event.target.value.toLowerCase();
    this.selectedBookName = value;
    if (!value) {
      this.filteredBooks = [];
      return;
    }

    this.filteredBooks = this.books.filter(
      (book: any) =>
        book.bookName && book.bookName.toString().toLowerCase().includes(value),
    );
  }

  selectBook(book: any) {
    this.selectedBookName = book.bookName;
    this.billForm.patchValue({
      bookName: book._id,
    });
    this.filteredBooks = [];
  }

  filteredBills: any[] = [];
  searchBills(event: any) {
    const term = event.target.value.toString().toLowerCase();

    if (term) {
      this.filteredBills = this.bills.filter(
        (bill) =>
          bill.billNo.toString().toLowerCase().includes(term) ||
          bill.outdoorParty.toLowerCase().includes(term),
      );
    } else {
      this.filteredBills = [];
    }
  }

  // 2. बिल सिलेक्ट होने पर सारा डेटा फॉर्म में भरना
  selectBill(bill: any) {
    console.log(bill);
    this.billForm.patchValue({
      date: this.formatDate(bill.date),
      billNo: bill.billNo,
      subTotal: bill.subTotal,
      discount: bill.discount,
      cgstPerc: bill.cgstPerc,
      cgstAmt: bill.cgstAmt,
      sgstPerc: bill.sgstPerc,
      sgstAmt: bill.sgstAmt,
      igstPerc: bill.igstPerc,
      igstAmt: bill.igstAmt,
      grandTotal: bill.grandTotal,
      balanceDue: bill.balanceDue,
      advance: bill.advance,
      outdoorParty: bill.outdoorParty,
      bookName: bill.bookName?._id,
    });

    this.selectedBookName = bill.bookName?.bookName;

    // 2. Items (FormArray) को अपडेट करें
    const itemsArray = this.billForm.get('items') as FormArray;

    // पहले पुराने आइटम्स साफ़ करें
    while (itemsArray.length !== 0) {
      itemsArray.removeAt(0);
    }

    // अब रिस्पॉन्स वाले नए आइटम्स जोड़ें
    bill.items.forEach((item: any) => {
      itemsArray.push(
        this.fb.group({
          date: this.formatDate(item.date),
          itemName: item.itemName,
          productName: item.productName,
          qty: item.qty,
          rate: item.rate,
          amount: item.amount,
        }),
      );
    });

    this.filteredBills = []; // ड्रॉपडाउन बंद करें
  }

  // 3. FormArray (Items) को भरने के लिए (अगर जरूरत हो)
  setBillItems(items: any[]) {
    const itemFormArray = this.billForm.get('items') as FormArray;
    itemFormArray.clear(); // पुराना डेटा साफ़ करें

    items.forEach((item) => {
      itemFormArray.push(
        this.fb.group({
          itemName: item.name,
          productName: item.productName,
          qty: item.qty,
          price: item.price,
        }),
      );
    });
  }

  // searchQuotation() {
  //   const qNo = this.billForm.get('orderNo')?.value;

  //   this.billService.getQuotationByNumber(qNo).subscribe((res: any) => {
  //     // Patch Main Form
  //     this.billForm.patchValue({
  //       date: this.formatDate(res.date),
  //       outdoorParty: res.outdoorParty,
  //       contactNo: res.contactNo,
  //       couple: res.couple,
  //       address: res.address,
  //       remarks: res.remarks,
  //     });

  //     // Clear existing items
  //     this.itemsFormArray.clear();

  //     // Add quotation items
  //     res.items.forEach((item: any) => {
  //       const itemGroup = this.fb.group({
  //         date: [item.date],
  //         itemName: [item.itemName],
  //         productName: [item.productId?.product_name || 'Product'],
  //         productId: [item.productId?._id],
  //         event: [item.event],
  //         qty: [item.qty],
  //         rate: [item.rate],
  //         amount: [item.amount],
  //         place: [item.place],
  //         time: [item.time],
  //       });

  //       this.itemsFormArray.push(itemGroup);
  //     });

  //     this.calculateGrandTotal();
  //   });
  // }

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
      amount: [val.qty * val.rate],
      place: [val.place],
      time: [val.time],
    });
    this.itemsFormArray.push(itemGroup);
    this.calculateGrandTotal();
    this.clearEntry();
  }

  calculateGrandTotal() {
    let subTotal = 0;

    this.itemsFormArray.controls.forEach((c: any) => {
      subTotal += Number(c.get('amount')?.value || 0);
    });

    // getRawValue() इस्तेमाल करें ताकि readonly fields भी मिल सकें
    const f = this.billForm.getRawValue();

    const discount = Number(f.discount || 0);
    const taxable = subTotal - discount;

    // Percentages को Numbers में बदलें
    const cPerc = Number(f.cgstPerc || 0);
    const sPerc = Number(f.sgstPerc || 0);
    const iPerc = Number(f.igstPerc || 0);

    const cgstAmt = (taxable * cPerc) / 100;
    const sgstAmt = (taxable * sPerc) / 100;
    const igstAmt = (taxable * iPerc) / 100;

    const netTotal = taxable + cgstAmt + sgstAmt + igstAmt;
    const advance = Number(f.advance || 0);

    this.billForm.patchValue(
      {
        subTotal: subTotal.toFixed(2),
        cgstAmt: cgstAmt.toFixed(2),
        sgstAmt: sgstAmt.toFixed(2),
        igstAmt: igstAmt.toFixed(2),
        netTotal: netTotal.toFixed(2),
        balanceDue: (netTotal - advance).toFixed(2),
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
      bookName: '',
      billNo: '',
      date: new Date().toISOString().split('T')[0],
      outdoorParty: '',
      address: '',
      // orderNo: '',
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

  formatDate(dateStr: string) {
    if (!dateStr) return '';

    const d = new Date(dateStr);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  onSubmit() {
    if (this.billForm.invalid) {
      this.billForm.markAllAsTouched();
      return;
    }

    const formValue = this.billForm.value;

    const payload = {
      bookName: formValue.bookName,
      billNo: formValue.billNo,
      date: formValue.date,
      outdoorParty: formValue.outdoorParty,
      address: formValue.address,
      // orderNo: formValue.orderNo,
      gstType: formValue.gstType,
      govt: formValue.govt,
      coupleName: formValue.coupleName,
      gst: formValue.gst,
      package: formValue.package,

      subTotal: formValue.subTotal,
      discount: formValue.discount,
      cgstPerc: formValue.cgstPerc,
      cgstAmt: formValue.cgstAmt,
      sgstPerc: formValue.sgstPerc,
      sgstAmt: formValue.sgstAmt,
      igstPerc: formValue.igstPerc,
      igstAmt: formValue.igstAmt,
      netTotal: formValue.netTotal,
      advance: formValue.advance,
      balanceDue: formValue.balanceDue,

      items: this.itemsFormArray.value,
    };

    this.billService.createOutdoorBill(payload).subscribe({
      next: (res: any) => {
        this.triggerPopup('Outdoor Bill Created Successfully!', false);
        this.clearAll();
      },
      error: (err: any) => {
        console.error('Error creating bill', err);
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
    this.router.navigate(['/admin']);
  }
}
