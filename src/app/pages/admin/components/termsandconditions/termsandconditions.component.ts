import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { Router } from '@angular/router';
import { AdminService } from '../service/admin.service';

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

    // Default ek empty row add karne ke liye
    this.addCondition();
    this.loadTerms();
  }

  loadTerms(){
    this.service.getTermsAndConditions().subscribe((res) => {
      console.log(res);
    })
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
    this.conditions.removeAt(index);
  }

  showPopup = false;
  popupMessage = '';
  isError = false;

  onSubmit() {
    if (this.termsForm.invalid) {
      this.termsForm.markAllAsTouched();
      return;
    }

    const formValue = this.termsForm.value;

    this.service.createTermsAndConditions(formValue).subscribe({
      next: (res: any) => {
        this.triggerPopup('Terms and conditions Saved Successfully!', false);
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
}
