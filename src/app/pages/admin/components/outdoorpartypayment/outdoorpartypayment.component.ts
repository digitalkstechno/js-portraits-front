import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../service/admin.service';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { Router } from '@angular/router';

@Component({
  selector: 'app-outdoorpartypayment',
  imports: [SHARED_MODULES],
  templateUrl: './outdoorpartypayment.component.html',
  styleUrl: './outdoorpartypayment.component.css',
})
export class OutdoorpartypaymentComponent {
  paymentForm!: FormGroup;
  outdoorService = inject(AdminService);
  router = inject(Router);

  isError = false;
  showPopup = false;
  popupMessage = '';
  count: string = '';
  parties: any[] = [];
  payments: any[] = [];
  orders: any[] = [];
  filteredOrders: any[] = [];
  filteredPayments: any[] = [];
  filteredCustomers: any[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.outdoorService.getPaymentCount().subscribe((res) => {
      const count = res.count;
      this.count = count + 1;
      this.paymentForm.patchValue({
        transNo: this.count,
      });
    });

    this.paymentForm = this.fb.group({
      transNo: [''],
      date: [new Date().toISOString().substring(0, 10)],
      outdoorParty: ['', Validators.required],
      orderNo: [''],
      address: [''],
      contactNumber: ['', [Validators.pattern('^[0-9]{10}$')]],
      billTotalAmt: [0],
      totalPaidAmt: [0],
      totalPendingAmt: [0],
      orderTotalAmt: [0],
      orderTotalPaidAmt: [0],
      orderTotalPendingAmt: [0],
      paymentType: ['CASH'],
      amount: [0, Validators.required],
      remark: [''],
      entryBy: [''],
      updateBy: [''],
    });

    this.loadCustomers();
    this.loadPayments();
    this.loadOrders();
  }

  loadCustomers() {
    this.outdoorService.getCustomers().subscribe((res: any) => {
      this.parties = res.data || res;
    });
  }

  loadPayments() {
    this.outdoorService.getAllPayments().subscribe((res) => {
      this.payments = res.bills;
      console.log(this.payments);
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
    this.paymentForm.patchValue({
      outdoorParty: party.name,
    });

    this.filteredCustomers = [];
  }

  searchBills(event: any) {
    const term = event.target.value.toString().toLowerCase();

    if (term) {
      this.filteredPayments = this.payments.filter((payment) =>
        payment.transNo.toString().toLowerCase().includes(term),
      );
    } else {
      this.filteredPayments = [];
    }
  }

  // 2. patch data on select
  selectBill(bill: any) {
    console.log(bill);
    this.paymentForm.patchValue({
      date: this.formatDate(bill.date),
      transNo: bill.billNo,
      subTotal: bill.subTotal,
      grandTotal: bill.grandTotal,
      balanceDue: bill.balanceDue,
      advance: bill.advance,
      outdoorParty: bill.outdoorParty,
    });

    this.filteredPayments = []; // close the dropdown
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

  selectOrder(order: any) {
    console.log(order);
    this.paymentForm.patchValue({
      orderNo: order.orderNo,
      orderTotalAmt: order.subTotal,
      orderTotalPaidAmt: order.advance,
      grandTotal: order.grandTotal,
      orderTotalPendingAmt: order.balanceDue,
    });

    this.filteredOrders = []; // ड्रॉपडाउन बंद करें
  }

  onlyNumberKey(event: any) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
    return true;
  }

  onSubmit() {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const formValue = this.paymentForm.value;
    this.outdoorService.savePayment(formValue).subscribe({
      next: (res: any) => {
        this.triggerPopup('Outdoor party payment saved successfully!', false);

        this.paymentForm.reset({
          date: new Date().toISOString().split('T')[0],
          paymentMode: 'Cash',
          subTotal: 0,
          discount: 0,
          advance: 0,
          grandTotal: 0,
        });
      },

      error: (err: any) => {
        console.error('Outdoor party payment creation failed', err);
        this.triggerPopup('Something went wrong while saving!', true);
      },
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

  formatDate(dateStr: string) {
    if (!dateStr) return '';

    const d = new Date(dateStr);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  close() {
    this.router.navigateByUrl('/admin');
  }
}
