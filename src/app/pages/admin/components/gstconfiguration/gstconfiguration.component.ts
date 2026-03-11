import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SHARED_MODULES } from '../../../../constants/sharedModule';

@Component({
  selector: 'app-gstconfiguration',
  imports: [SHARED_MODULES],
  templateUrl: './gstconfiguration.component.html',
  styleUrl: './gstconfiguration.component.css',
})
export class GstconfigurationComponent {
  gstSettingsForm: FormGroup;
  showPopup = false;
  popupMessage = '';
  isError = false;

  constructor(private fb: FormBuilder) {
    this.gstSettingsForm = this.fb.group({
      defaultGstRate: [18],
      isLocal: [true], // Local default selected
      isInterstate: [false], // Interstate default unselected
    });
  }
  
  ngOnInit() {
    // पहले से सेव की हुई सेटिंग्स लोड करें
    const savedSettings = localStorage.getItem('gstSettings');
    if (savedSettings) {
      this.gstSettingsForm.patchValue(JSON.parse(savedSettings));
    }
  }

  toggleRadio(value: string) {
    const currentVal = this.gstSettingsForm.get('taxType')?.value;
    if (currentVal === value) {
      this.gstSettingsForm.get('taxType')?.patchValue(null); // दोबारा क्लिक करने पर अनचेक
    }
  }

  saveSettings() {
    const settings = this.gstSettingsForm.value;
    // localStorage में स्टोर करें ताकि कैलकुलेशन फंक्शन इसे उठा सके
    localStorage.setItem('gstConfig', JSON.stringify(settings));
    this.triggerPopup('Settings Updated!', false);
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
}
