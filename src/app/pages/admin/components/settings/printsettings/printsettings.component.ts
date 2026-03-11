import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SHARED_MODULES } from '../../../../../constants/sharedModule';
import { ConfigService } from '../../service/configService/config.service';

@Component({
  selector: 'app-printsettings',
  imports: [SHARED_MODULES],
  templateUrl: './printsettings.component.html',
  styleUrl: './printsettings.component.css',
})
export class PrintsettingsComponent {
  printSettingsForm: FormGroup;
  signaturePreview: string | null = null;
  isError = false;
  showPopup = false;
  popupMessage = '';
  printService = inject(ConfigService);

  constructor(private fb: FormBuilder) {
    this.printSettingsForm = this.fb.group({
      companyName: [''],
      address: [''],
      phone: [''],
      gstin: [''],
      signatureBase64: [''], // इमेज का डेटा यहाँ रहेगा
    });
  }

  ngOnInit() {
    const saved = localStorage.getItem('printConfig');
    if (saved) {
      const data = JSON.parse(saved);
      this.printSettingsForm.patchValue(data);
      this.signaturePreview = data.signatureBase64;
    }
  }

  onSignatureUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.signaturePreview = reader.result as string;
        this.printSettingsForm.patchValue({ signatureBase64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  removeSignature() {
    this.signaturePreview = null;
    this.printSettingsForm.patchValue({ signatureBase64: '' });
  }

  savePrintSettings() {
    if (this.printSettingsForm.invalid) {
      this.printSettingsForm.markAllAsTouched();
      return;
    }

    const settings = this.printSettingsForm.value;

    this.printService.configprintSettings(settings).subscribe({
      next: (res: any) => {
        localStorage.setItem(
          'printConfig',
          JSON.stringify(this.printSettingsForm.value),
        );
        this.triggerPopup('Print settings Updated!', false);
      },
      error: (err: any) => {
        console.error('Error saving print settings', err);
        this.triggerPopup(
          'Something went wrong while saving Print settings!',
          true,
        );
      },
    });
  }

  triggerPopup(message: string, error: boolean) {
    this.popupMessage = message;
    this.isError = error;
    this.showPopup = true;

    setTimeout(() => {
      this.showPopup = false;
    }, 3000);
  }
}
