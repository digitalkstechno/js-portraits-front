import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SHARED_MODULES } from '../../../../../constants/sharedModule';
import { Router } from '@angular/router';
import { AdminService } from '../../service/admin.service';

@Component({
  selector: 'app-termsandconditions',
  imports: [SHARED_MODULES],
  templateUrl: './termsandconditions.component.html',
  styleUrl: './termsandconditions.component.css',
})
export class TermsandconditionsComponent {
  termsForm!: FormGroup;
  router = inject(Router);
  service = inject(AdminService);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.termsForm = this.fb.group({
      // FormArray for dynamic T&C blocks
      conditions: this.fb.array([]),
    });

    this.loadTerms();
  }

  loadTerms() {
    this.service.getTermsAndConditions().subscribe((res: any) => {
      // Check karein ki data sahi format mein aa raha hai
      const existingConditions = res.data?.conditions || [];

      if (existingConditions.length > 0) {
        this.conditions.clear(); // Purana empty field hataiye

        existingConditions.forEach((item: any) => {
          this.conditions.push(
            this.fb.group({
              header: [item.header],
              body: [item.body],
            }),
          );
        });
      }
    });
  }

  // Helper to get conditions array
  get conditions() {
    return this.termsForm.get('conditions') as FormArray;
  }

  // Naya T&C block add karne ke liye
  addCondition() {
    const conditionGroup = this.fb.group({
      header: [''], // Example: "Payment Terms"
      body: [''], // Example: "50% Advance, 50% on Delivery"
    });
    this.conditions.push(conditionGroup);
  }

  // Row delete karne ke liye
  removeCondition(index: number) {
    // Simple check
    const confirmDelete = confirm(
      'Are you sure you want to remove this condition? Changes will be permanent after saving.',
    );

    if (confirmDelete) {
      this.conditions.removeAt(index);
      this.triggerPopup('Condition removed from list!', false);
    }
  }

  showPopup = false;
  popupMessage = '';
  isError = false;

  onSubmit() {
    if (this.termsForm.invalid) return;

    // Sirf conditions ka array aur user ka naam bhejna hai
    const payload = {
      conditions: this.termsForm.value.conditions,
      user: 'Admin', // Aap yahan login user ka naam bhej sakte hain
    };

    this.service.createTermsAndConditions(payload).subscribe({
      next: (res: any) => {
        this.triggerPopup('Terms and conditions Saved Successfully!', false);
        // Data save hone ke baad dobara load karne ki zaroorat nahi hai
        // kyunki UI already updated hai, par safe side ke liye kar sakte hain.
        this.loadTerms();
      },
      error: (err: any) => {
        console.error('Error saving notes', err);
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

  onExit() {
    this.router.navigateByUrl('/admin');
  }

  onView() {
    this.router.navigateByUrl('/admin/terms&conditions/show');
  }
}
