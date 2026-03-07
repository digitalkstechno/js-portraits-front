import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StaffService } from '../service/staff.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SHARED_MODULES } from '../../../../../constants/sharedModule';

@Component({
  selector: 'app-staffentry',
  imports: [SHARED_MODULES],
  templateUrl: './staffentry.component.html',
  styleUrl: './staffentry.component.css',
})
export class StaffentryComponent {
  router = inject(Router);
  staffService = inject(StaffService);
  fb = inject(FormBuilder);
  staffForm!: FormGroup;
  totalStaff = 0;
  activeStaff = 0;
  onLeaveStaff = 0;
  count: any;

  ngOnInit() {
    this.initForm();
    this.staffService.getStaffCount().subscribe((res) => {
      const count = res.count?.count;
      this.count = count + 1;
      this.staffForm.patchValue({
        staffId: this.count,
      });
    });
  }

  initForm() {
    this.staffForm = this.fb.group({
      staffId: [''],
      name: [''],
      email: [''],
      role: [''],
      isAdmin: [false],
      contact_no: [''],
      joining_date: [new Date().toISOString().split('T')[0]],
      age: [''],
      gender: [''],
      salary: [''],
      address: [''],
      remarks: [''],
      status: ['Active'],
    });
  }

  onSubmit() {
    if (this.staffForm.invalid) return;

    const staffData = this.staffForm.value;
    console.log('Staff Data:', staffData);

    this.staffService.createStaff(staffData).subscribe({
      next: () => {
        console.log('Staff created successfully');
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  updateStaff() {
    console.log('Update staff');
  }

  clearForm() {
    this.staffForm.reset();
  }

  deleteStaff() {
    console.log('Delete staff');
  }

  searchStaff(value: string) {
    console.log('Searching:', value);
  }

  close() {
    this.router.navigateByUrl('/admin');
  }
}
