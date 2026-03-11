import { Component, inject } from '@angular/core';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemsService } from '../../master/service/items.service';
import { AdminService } from '../service/admin.service';
import { PdfService } from '../service/pdf-service/pdf.service';
import { QuotationprintComponent } from "../quotationprint/quotationprint.component";
import { ConfigService } from '../service/configService/config.service';

@Component({
  selector: 'app-quotation',
  imports: [SHARED_MODULES, QuotationprintComponent],
  templateUrl: './quotation.component.html',
  styleUrl: './quotation.component.css',
})
export class QuotationComponent {
  router = inject(Router);
  fb = inject(FormBuilder);
  productService = inject(ItemsService);
  quotationService = inject(AdminService);
  pdfService = inject(PdfService);
  gstService = inject(ConfigService);

  filteredCustomers: any[] = [];
  filteredProducts: any[] = [];
  filteredQuotations: any[] = [];
  quotation: any[] = [];
  filteredItems: any[] = [];
  productsList: any[] = [];
  itemsList: any[] = [];
  parties = [];
  count: any;
  isError = false;
  showPopup = false;
  popupMessage = '';
  savedTermsFromMaster: any[] = [];

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
    cgstPerc: [0],
    cgstAmt: [0],
    sgstPerc: [0],
    sgstAmt: [0],
    igstPerc: [0],
    igstAmt: [0],
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
    this.loadTerms();
    this.loadQuotations();
    this.loadGstConfiguration();
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

  loadTerms() {
    this.quotationService.getTermsAndConditions().subscribe((res: any) => {
      const existingConditions = res.data?.conditions || [];
      this.savedTermsFromMaster = existingConditions;
    });
  }

  loadQuotations() {
    this.quotationService.getQuotation().subscribe((res) => {
      this.quotation = res;
      console.log(this.quotation);
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
            this.quotationForm.patchValue({
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
    this.quotationForm.patchValue({
      outdoorParty: party.name,
      contactNo: party.contact,
    });

    this.filteredCustomers = [];
  }

  searchQuotations(event: any) {
    const term = event.target.value.toString();

    if (term) {
      this.filteredQuotations = this.quotation.filter((quot) =>
        quot.quotationNo.toString().includes(term),
      );
    } else {
      this.filteredQuotations = [];
    }
  }

  // 2. patch all data on select bill
  selectQuotation(quot: any) {
    this.quotationData = quot;
    this.quotationForm.patchValue(
      {
        date: this.formatDate(quot.date),
        billNo: quot.billNo,
        discount: quot.discount || 0,
        amountPaid: quot.amountPaid || 0,
        cgstPerc: quot.cgstPerc,
        cgstAmt: quot.cgstAmt,
        sgstPerc: quot.sgstPerc,
        sgstAmt: quot.sgstAmt,
        igstPerc: quot.igstPerc,
        igstAmt: quot.igstAmt,
        outdoorParty: quot.outdoorParty,
        contactNo: quot.contactNo,
        address: quot.address,
        email: quot.email,
        functionName: quot.functionName,
        refBy: quot.refBy,
        bookName: quot.bookName?._id, // ID पैच कर रहे हैं
      },
      { emitEvent: false },
    );

    // 2. Items Array साफ़ करें
    const itemsArray = this.quotationForm.get('items') as FormArray;
    itemsArray.clear(); // removeAt(0) वाले लूप से बेहतर है

    // 3. नए आइटम्स जोड़ें
    quot.items.forEach((item: any) => {
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

    this.filteredQuotations = [];
  }

  // 3. FormArray (Items) को भरने के लिए (अगर जरूरत हो)
  setQuotationItems(items: any[]) {
    const itemFormArray = this.quotationForm.get('items') as FormArray;
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

    // 1. सभी आइटम्स का टोटल निकालें
    this.items.controls.forEach((item: any) => {
      // सुनिश्चित करें कि FormArray में फील्ड का नाम 'total' ही है
      subTotal += Number(item.get('total')?.value || 0);
    });

    // 2. फॉर्म से Taxable वैल्यू और GST Rates निकालें
    const f = this.quotationForm.getRawValue();
    const discount = Number(f.discount || 0);
    const taxable = subTotal - discount;

    // ये Percentages आपकी GST Configuration से पैच होनी चाहिए
    const cgstPerc = Number(f.cgstPerc || 0);
    const sgstPerc = Number(f.sgstPerc || 0);
    const igstPerc = Number(f.igstPerc || 0);

    // 3. GST Amounts की गणना
    const cgstAmt = (taxable * cgstPerc) / 100;
    const sgstAmt = (taxable * sgstPerc) / 100;
    const igstAmt = (taxable * igstPerc) / 100;

    const totalGst = cgstAmt + sgstAmt + igstAmt;

    // 4. Final Totals
    const netTotal = taxable + totalGst;

    // 5. फॉर्म में वैल्यूज अपडेट करें
    this.quotationForm.patchValue(
      {
        subTotal: subTotal.toFixed(2),
        cgstAmt: cgstAmt.toFixed(2),
        sgstAmt: sgstAmt.toFixed(2),
        igstAmt: igstAmt.toFixed(2),
        totalGst: totalGst.toFixed(2),
        grandTotal: netTotal.toFixed(2), // या netTotal.toFixed(2)
      },
      { emitEvent: false },
    );
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
      cgstPerc: [0],
      cgstAmt: [0],
      sgstPerc: [0],
      sgstAmt: [0],
      igstPerc: [0],
      igstAmt: [0],
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

  formatDate(dateStr: string) {
    if (!dateStr) return '';

    const d = new Date(dateStr);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  printConfig = { rate: true, disc: true };
  quotationData: any; // API se aaya hua data
  showRate: boolean = true;
  showDiscount: boolean = true;

  printQuotation(rate: boolean, discount: boolean) {
    this.showRate = rate;
    this.showDiscount = discount;

    setTimeout(() => {
      window.print();
    }, 200);
  }
}
