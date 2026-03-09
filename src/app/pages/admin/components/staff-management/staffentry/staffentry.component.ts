import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StaffService } from '../service/staff.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SHARED_MODULES } from '../../../../../constants/sharedModule';
import { AdminService } from '../../service/admin.service';

@Component({
  selector: 'app-staffentry',
  imports: [SHARED_MODULES],
  templateUrl: './staffentry.component.html',
  styleUrl: './staffentry.component.css',
})
export class StaffentryComponent {
  router = inject(Router);
  staffService = inject(StaffService);
  roleService = inject(AdminService);
  fb = inject(FormBuilder);
  staffForm!: FormGroup;
  totalStaff = 0;
  activeStaff = 0;
  onLeaveStaff = 0;
  count: any;
  staff: any;
  roles: string[] = [];
  filteredRoles: string[] = [...this.roles];
  page = 1;
  limit = 10;
  searchText = '';
  staffList$ = this.staffService.staff$;
  isError = false;
  showPopup = false;
  popupMessage = '';

  ngOnInit() {
    this.initForm();
    this.loadRoles();

    // 1. Pehle subscribe karein taaki jab bhi search badle, list update ho
    this.listenToStaffChanges();

    // 2. Initial data fetch karein
    this.staffService.getStaffCount().subscribe((res) => {
      const count = res.count?.count || 0;
      this.totalStaff = count;
      this.staffForm.patchValue({ staffId: count + 1 });
    });

    // 3. Trigger initial search
    this.onSearchChange('');
  }

  listenToStaffChanges() {
    // Service ke staff$ observable ko subscribe karein
    this.staffService.staff$.subscribe({
      next: (res: any) => {
        // Backend agar { data: [...] } bhej raha hai
        const allStaff = res.data || res;

        // Yahan filter lagayein aur UI update karein
        this.staff = allStaff.filter((s: any) => s.isAdmin === false);

        // Total active staff update karein
        this.activeStaff = this.staff.length;
      },
      error: (err) => console.error('Error loading staff', err),
    });
  }

  // loadStaff() ko hata dein ya sirf listenToStaffChanges() use karein
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
    });
  }

  loadRoles() {
    this.roleService.getroles().subscribe((res) => {
      const roles = res.data;
      this.roles = roles.map((r: any) => r.name);
    });
  }

  loadStaff() {
    this.staffService.staff$.subscribe((res) => {
      const staff = res.data;
      console.log(staff);
      this.staff = staff.filter((s: any) => s.isAdmin === false);
    });
  }

  onSearchChange(value: string) {
    this.searchText = value;
    this.staffService.searchStaff(this.page, this.limit, this.searchText);
  }

  filterRoles(event: any) {
    const value = event.target.value.toLowerCase();
    this.filteredRoles = this.roles.filter((role) =>
      role.toLowerCase().includes(value),
    );
  }

  selectRole(role: string) {
    this.staffForm.patchValue({ role: role });
    this.filteredRoles = [];
  }

  onSubmit() {
    if (this.staffForm.invalid) return;

    const staffData = this.staffForm.value;
    // console.log('Staff Data:', staffData);

    this.staffService.createStaff(staffData).subscribe({
      next: () => {
        console.log('Staff created successfully');
        this.triggerPopup('Staff Created Successfully!', false);
        this.staffForm.reset();
        this.staffService.searchStaff(this.page, this.limit, this.searchText);
      },
      error: (err) => {
        console.error(err);
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

  updateStaff() {
    console.log('Update staff');
  }

  clearForm() {
    this.staffForm.reset();
  }

  deleteStaff() {
    console.log('Delete staff');
  }

  clearSearch() {
    this.searchText = '';
    this.page = 1; // Page reset kiya
    this.staffService.searchStaff(this.page, this.limit, '');
  }

  close() {
    this.router.navigateByUrl('/admin');
  }
}
