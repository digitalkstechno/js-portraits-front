import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-staffsalary',
  imports: [],
  templateUrl: './staffsalary.component.html',
  styleUrl: './staffsalary.component.css',
})
export class StaffsalaryComponent {
  salaryForm: FormGroup;
  filteredStaff: any;
  showDropdown = false;
  selectedStaff: any = null;
  stats = { monthly: 0, paid: 0, pending: 0 };
  // Dummy Data for Staff
  masterStaffList = [
    {
      _id: 's1',
      name: 'John Doe',
      monthly_salary: 25000,
      designation: 'Senior Editor',
    },
    {
      _id: 's2',
      name: 'Amit Sharma',
      monthly_salary: 18000,
      designation: 'Photographer',
    },
    {
      _id: 's3',
      name: 'Rahul Verma',
      monthly_salary: 12000,
      designation: 'Assistant',
    },
  ];

  constructor(private fb: FormBuilder) {
    this.salaryForm = this.fb.group({
      staffId: ['', Validators.required],
      staffName: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      type: ['salary', Validators.required], // 'salary' or 'exposure'
      amount: [0, [Validators.required, Validators.min(1)]],
      payMode: ['Cash'],
      remarks: [''],
    });
  }

  ngOnInit(): void {}

  // 1. Search Staff Logic
  onStaffSearch(val: string) {
    if (val.length > 0) {
      this.filteredStaff = this.masterStaffList.filter((s) =>
        s.name.toLowerCase().includes(val.toLowerCase()),
      );
      this.showDropdown = true;
    } else {
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
  saveTransaction() {
    if (this.salaryForm.invalid) {
      alert('Please fill all required fields!');
      return;
    }

    const payload = this.salaryForm.value;
    console.log('Saving Salary/Exposure Record:', payload);

    // API Call Code Here
    // this.service.saveSalary(payload).subscribe(...)

    alert(`${payload.type.toUpperCase()} recorded successfully!`);
    this.resetForm();
  }

  resetForm() {
    this.salaryForm.reset({
      date: new Date().toISOString().split('T')[0],
      type: 'salary',
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
}
