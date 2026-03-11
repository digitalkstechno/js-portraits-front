import { Component, inject } from '@angular/core';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemsService } from '../../master/service/items.service';
import { AdminService } from '../service/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-purchaseitems',
  imports: [SHARED_MODULES],
  templateUrl: './purchaseitems.component.html',
  styleUrl: './purchaseitems.component.css',
})
export class PurchaseitemsComponent {
  fb = inject(FormBuilder);
  itemService = inject(ItemsService);
  billService = inject(AdminService);
  router = inject(Router);

  productSellForm!: FormGroup;
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
    this.loadGstSettings();
    this.billService.getProductSellCount().subscribe((res) => {
      // console.log(res.count);
      const count = res.count;
      this.count = count + 1;
      // console.log(this.count);
      this.productSellForm.patchValue({
        billNo: this.count,
      });
    });
    this.loadItems();
    this.loadCustomers();
    this.loadBooks();
    this.loadBills();

    // Jab bhi discount, tax ya advance badle, calculation refresh ho
    this.productSellForm.valueChanges.subscribe(() => {
      this.calculateGrandTotal();
    });
  }

  fixedGstRate: number = 0; // Will be fetched from DB

  loadGstSettings() {
    // Assuming you have a service method to get common settings
    this.billService.getGstConfiguration().subscribe((res: any) => {
      // Assuming your settings panel returns { gstPercentage: 18 }
      this.fixedGstRate = res.gstPercentage || 0;
      this.calculateGrandTotal(); // Recalculate once GST is loaded
    });
  }

  calculateGrandTotal() {
    let subTotal = 0;

    // सभी आइटम्स का टोटल निकालें
    this.itemsFormArray.controls.forEach((c: any) => {
      subTotal += Number(c.get('total')?.value || 0);
    });

    const f = this.productSellForm.getRawValue();

    const discount = Number(f.discount || 0);
    const taxable = subTotal - discount;
    const totalGstAmt = (taxable * (this.fixedGstRate || 0)) / 100;
    const netTotal = taxable + totalGstAmt;
    const paid = Number(f.amountPaid || 0);

    // balanceDue = कुल बिल - जितना पैसा मिला
    const due = netTotal - paid;

    this.productSellForm.patchValue(
      {
        subTotal: subTotal.toFixed(2),
        totalGst: totalGstAmt.toFixed(2),
        grandTotal: netTotal.toFixed(2),
        balanceDue: due.toFixed(2), // अब यह नेगेटिव नहीं आएगा
      },
      { emitEvent: false },
    );
  }

  initForms() {
    this.productSellForm = this.fb.group({
      bookName: [''],
      billNo: [this.count],
      purchaseDate: [new Date().toISOString().split('T')[0]],
      partyName: ['', Validators.required],
      contactNo: [''],

      items: this.fb.array([]),
      subTotal: [0],
      discount: [0],
      totalGst: [0],
      grandTotal: [0],

      // Naye Payment Fields
      paymentMode: ['Cash'],
      transactionId: [''],
      amountPaid: [0],
      balanceDue: [0],
    });

    this.entryForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0]],
      itemName: ['', Validators.required],
      itemId: [''],
      productName: ['', Validators.required],
      productId: [''],
      qty: [],
      rate: [0],
      amount: [0],
    });
  }

  loadCustomers() {
    this.billService.getCustomers().subscribe((res: any) => {
      this.parties = res.data || res;
    });
  }

  loadBooks() {
    this.billService.getOutdoorBooks().subscribe((res: any) => {
      this.books = res.books;
      console.log(this.books);
    });
  }

  loadBills() {
    this.billService.getProductSell().subscribe((res) => {
      this.bills = res.data;
      console.log(this.bills);
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
    this.productSellForm.patchValue({
      partyName: party.name,
      contactNo: party.contact,
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
    this.productSellForm.patchValue({
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

  // 2. patch all data on select bill
  selectBill(bill: any) {
    this.productSellForm.patchValue(
      {
        date: this.formatDate(bill.sellDate), 
        billNo: bill.billNo,
        discount: bill.discount || 0,
        amountPaid: bill.amountPaid || 0,
        partyName: bill.partyName,
        contactNo: bill.contactNo,
        bookName: bill.bookName?._id, // ID पैच कर रहे हैं
      },
      { emitEvent: false },
    );

    this.selectedBookName = bill.bookName?.bookName;

    // 2. Items Array साफ़ करें
    const itemsArray = this.productSellForm.get('items') as FormArray;
    itemsArray.clear(); // removeAt(0) वाले लूप से बेहतर है

    // 3. नए आइटम्स जोड़ें
    bill.items.forEach((item: any) => {
      itemsArray.push(
        this.fb.group({
          date: this.formatDate(item.date),          
          itemName: item.itemName,
          productName: item.productName,
          qty: item.qty,
          rate: item.rate,
          total: item.amount || item.qty * item.rate,
        }),
      );
    });

    // 4. सबसे जरूरी: पैच करने के बाद दोबारा कैलकुलेट करें
    this.calculateGrandTotal();

    this.filteredBills = [];
  }

  // 3. FormArray (Items) को भरने के लिए (अगर जरूरत हो)
  setBillItems(items: any[]) {
    const itemFormArray = this.productSellForm.get('items') as FormArray;
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
    return this.productSellForm.get('items') as FormArray;
  }

  addItem() {
    if (this.entryForm.invalid) return;
    const val = this.entryForm.value;
    const itemGroup = this.fb.group({
      date: [val.date],
      itemName: [val.itemName],
      productName: [val.productName],
      qty: [val.qty],
      rate: [val.rate],
      total: [val.qty * val.rate],
    });
    this.itemsFormArray.push(itemGroup);
    this.calculateGrandTotal();
    this.clearEntry();
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
    this.productSellForm.reset({
      bookName: '',
      billNo: '',
      sellDate: new Date().toISOString().split('T')[0],
      partyName: '',
      contactNo: '',
      subTotal: 0,
      discount: 0,
      totalGst: 0,
      grandTotal: 0,
      amountPaid: 0,
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
    if (this.productSellForm.invalid) {
      this.productSellForm.markAllAsTouched();
      this.triggerPopup('Please fill all required fields!', true);
      return;
    }

    const formValue = this.productSellForm.getRawValue(); // getRawValue use karein taaki disabled fields bhi mil jayein

    const payload = {
      bookName: formValue.bookName,
      billNo: formValue.billNo,
      sellDate: formValue.purchaseDate,
      partyName: formValue.partyName,
      contactNo: formValue.contactNo,

      // Items array (Dynamic rows from Table)
      items: this.itemsFormArray.value,

      // Totals & GST
      subTotal: formValue.subTotal,
      discount: formValue.discount,
      totalGst: formValue.totalGst,
      grandTotal: formValue.grandTotal,

      // Payment Section
      paymentMode: formValue.paymentMode,
      transactionId:
        formValue.paymentMode !== 'Cash' ? formValue.transactionId : '',
      amountPaid: formValue.amountPaid, // Frontend ka 'advance' backend ka 'amountPaid' hai
      balanceDue: formValue.balanceDue,

      // Status Logic
      paymentStatus: formValue.balanceDue <= 0 ? 'Paid' : 'Partial',
    };

    this.billService.saveProductSell(payload).subscribe({
      next: (res: any) => {
        this.triggerPopup('Product Sale Recorded Successfully!', false);
        this.clearAll();
      },
      error: (err: any) => {
        console.error('Error saving purchase:', err);
        this.triggerPopup('Error: Could not save the transaction.', true);
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
