import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../service/admin.service';
import { SHARED_MODULES } from '../../../../constants/sharedModule';

@Component({
  selector: 'app-outdoorpartypayment',
  imports: [SHARED_MODULES],
  templateUrl: './outdoorpartypayment.component.html',
  styleUrl: './outdoorpartypayment.component.css',
})
export class OutdoorpartypaymentComponent {
  paymentForm!: FormGroup;
  outdoorService = inject(AdminService);

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
  }

  onlyNumberKey(event: any) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
    return true;
  }

  onSave() {
    if (this.paymentForm.valid) {
      console.log(this.paymentForm.value);
    }
  }

  close() {
    /* logic to close */
  }
}
