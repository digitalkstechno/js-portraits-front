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
  parties: any[] = [];
  filteredCustomers: any[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.paymentForm = this.fb.group({
      transNo: ['39'],
      date: [new Date().toISOString().substring(0, 10)],
      outdoorParty: ['', Validators.required],
      orderNo: [''],
      address: [''],
      contactNumber: ['', [Validators.pattern('^[0-9]{10}$')]],
      billTotalAmt: [0],
      totalPaidAmt: [0],
      totalPendingAmt: [0],
      orderTotalAmt: [0],
      paymentType: ['CASH'],
      amount: [0, Validators.required],
      remark: [''],
      entryBy: [''],
      updateBy: [''],
    });

    this.loadCustomers();
  }

  loadCustomers() {
    this.outdoorService.getCustomers().subscribe((res: any) => {
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
    this.paymentForm.patchValue({
      outdoorParty: party.name,
    });

    this.filteredCustomers = [];
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

  close() {
    this.router.navigateByUrl('/admin');
  }
}
