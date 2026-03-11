import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { ConfigService } from '../service/configService/config.service';

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
  gstSerice = inject(ConfigService);

  constructor(private fb: FormBuilder) {
    this.gstSettingsForm = this.fb.group({
      defaultGstRate: [18],
      isLocal: [true], // Local default selected
      isInterstate: [false], // Interstate default unselected
    });
  }

  ngOnInit() {
    this.gstSerice.getGstConfig().subscribe((res: any) => {
      if (res && res.defaultGstRate) {
        this.gstSettingsForm.patchValue(res);
      }
    });
  }

  toggleRadio(value: string) {
    const currentVal = this.gstSettingsForm.get('taxType')?.value;
    if (currentVal === value) {
      this.gstSettingsForm.get('taxType')?.patchValue(null); // दोबारा क्लिक करने पर अनचेक
    }
  }

  saveSettings() {
    if (this.gstSettingsForm.invalid) {
      this.gstSettingsForm.markAllAsTouched();
      return;
    }

    const settings = this.gstSettingsForm.value;

    this.gstSerice.configGstSettings(settings).subscribe({
      next: (res: any) => {
        this.triggerPopup('GST Configuration settings Updated!', false);
      },
      error: (err: any) => {
        console.error('Error saving GST configuration', err);
        this.triggerPopup(
          'Something went wrong while saving GST configuration!',
          true,
        );
      },
    });
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
