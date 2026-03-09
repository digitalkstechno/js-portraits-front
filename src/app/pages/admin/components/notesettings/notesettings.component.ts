import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SHARED_MODULES } from '../../../../constants/sharedModule';

@Component({
  selector: 'app-notesettings',
  imports: [SHARED_MODULES],
  templateUrl: './notesettings.component.html',
  styleUrl: './notesettings.component.css',
})
export class NotesettingsComponent {
  settingsForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const bankDetails = `THE SURAT MERCANTILE CO-OP. BANK LTD.
A/C Name :- ZAINAM RAJUBHAI SHAH
A/C No :- 000522001064488
IFSC CODE :- YESB0SMCB0`;

    const orderDetails = `All RAW PHOTOS
40 PAGES ALBUM|VIDEO EDITING
(Full Movie, Highlights, Teaser)
50 Photos Editing
Reals 4 Function
64Gb Pendrive`;

    this.settingsForm = this.fb.group({
      quotation: [bankDetails],
      order: [orderDetails],
      bill: [bankDetails],
      entryBy: [''],
      updateBy: ['jsp'],
    });
  }

  onSave() {
    console.log('Saved Data:', this.settingsForm.value);
    alert('Settings saved successfully!');
  }

  onExit() {
    if (confirm('Close settings?')) {
      // Logic to close modal or navigate back
    }
  }
}
