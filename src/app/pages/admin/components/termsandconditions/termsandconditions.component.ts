import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SHARED_MODULES } from '../../../../constants/sharedModule';

@Component({
  selector: 'app-termsandconditions',
  imports: [SHARED_MODULES],
  templateUrl: './termsandconditions.component.html',
  styleUrl: './termsandconditions.component.css',
})
export class TermsandconditionsComponent {
  termsForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.termsForm = this.fb.group({
      // FormArray for dynamic T&C blocks
      conditions: this.fb.array([]),
    });

    // Default ek empty row add karne ke liye
    this.addCondition();
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

  onSave() {
    console.log('Saving T&C:', this.termsForm.value);
    alert('Terms & Conditions Updated!');
  }
}
