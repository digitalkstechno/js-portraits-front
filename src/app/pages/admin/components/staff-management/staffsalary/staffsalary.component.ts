import { Component, HostListener, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SHARED_MODULES } from '../../../../../constants/sharedModule';
import { StaffService } from '../service/staff.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-staffsalary',
  imports: [SHARED_MODULES],
  templateUrl: './staffsalary.component.html',
  styleUrl: './staffsalary.component.css',
})
export class StaffsalaryComponent {
  staffService = inject(StaffService);
  router = inject(Router);

  salaryForm: FormGroup;
  filteredStaff: any[] = [];
  showDropdown = false;
  selectedStaff: any = null;
  stats = { monthly: 0, paid: 0, pending: 0 };
  staff: any[] = [];
  staffSalary: any;

  constructor(private fb: FormBuilder) {
    this.salaryForm = this.fb.group({
      staffId: ['', Validators.required],
      staffName: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      type: ['Salary', Validators.required], // 'salary' or 'exposure'
      amount: [0, [Validators.required, Validators.min(1)]],
      payMode: ['Cash'],
      remarks: [''],
    });
  }

  ngOnInit(): void {
    this.loadStaff();
    this.loadStaffSalary();
  }

  loadStaff() {
    this.staffService.getStaff().subscribe((res: any) => {
      const staff = res;
      this.staff = staff.filter((s: any) => s.isAdmin === false);
    });
  }

  loadStaffSalary() {
    this.staffService.getStaffSalary().subscribe((res: any) => {
      const salary = res.salary;
      this.staffSalary = salary;
      console.log("saalry", this.staffSalary)
    });
  }

  // 1. Search Staff Logic
  onStaffSearch(val: string) {
    if (!this.staff) return;

    console.log('staf', this.staff);

    if (val && val.length > 0) {
      this.filteredStaff = this.staff.filter((s) =>
        s.name.toLowerCase().includes(val.toLowerCase()),
      );

      console.log('filtered', this.filteredStaff);
      this.showDropdown = true;
    } else {
      this.filteredStaff = [];
      this.showDropdown = false;
    }
  }

  // 2. Select Staff & Load Stats
  selectStaff(staff: any) {
    this.selectedStaff = staff;
    this.showDropdown = false;

    // Form update
    this.salaryForm.patchValue({
      staffId: staff._id,
      staffName: staff.name,
    });

    // Sidebar Update Logic (Dummy calculation)
    this.stats.monthly = staff.monthly_salary;
    this.stats.paid = 15000; // Ye backend se fetch hoga real app mein
    this.stats.pending = this.stats.monthly - this.stats.paid;
  }

  // 3. Save Record
  onSubmit() {
    if (this.salaryForm.invalid) {
      this.salaryForm.markAllAsTouched();
      alert('Please fill all required fields!');
      return;
    }

    const payload = this.salaryForm.value;

    console.log('Submitting Salary Transaction:', payload);

    this.staffService.createStaff(payload).subscribe({
      next: () => {
        alert('Record saved successfully');
        alert(`${payload.type.toUpperCase()} recorded successfully!`);
        this.salaryForm.reset();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  resetForm() {
    this.salaryForm.reset({
      date: new Date().toISOString().split('T')[0],
      type: 'Salary',
      payMode: 'Cash',
      amount: 0,
    });
    this.selectedStaff = null;
    this.stats = { monthly: 0, paid: 0, pending: 0 };
  }

  // Close dropdown on outside click
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!event.target.closest('.field-item')) {
      this.showDropdown = false;
    }
  }

  onExit() {
    this.router.navigateByUrl('/admin');
  }
}
