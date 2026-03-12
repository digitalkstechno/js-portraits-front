import { Component, inject, Input } from '@angular/core';
import { ConfigService } from '../service/configService/config.service';
import { SHARED_MODULES } from '../../../../constants/sharedModule';

@Component({
  selector: 'app-outdoorbillprint',
  imports: [SHARED_MODULES],
  templateUrl: './outdoorbillprint.component.html',
  styleUrl: './outdoorbillprint.component.css',
})
export class OutdoorbillprintComponent {
  @Input() data: any;
  @Input() showRate: boolean = true;
  gst: number = 0;
  gstAmt: number = 0;
  printService = inject(ConfigService);
  printSettings: any;
  formattedAddress: string = '';

  ngOnInit() {
    console.log('quotation data', this.data);
    this.loadPrintSettings();
    this.gst = this.data.cgstPerc
      ? this.data.cgstPerc + this.data.cgstPerc
      : this.data.igstPerc
        ? this.data.igstPerc
        : 0;

    this.gstAmt = this.data.cgstPerc
      ? this.data.cgstAmt + this.data.cgstAmt
      : this.data.igstPerc
        ? this.data.igstAmt
        : 0;
  }

  loadPrintSettings() {
    this.printService.getPrintSettings().subscribe((res) => {
      this.printSettings = res;
      if (this.printSettings?.address) {
        this.formattedAddress = this.printSettings.address.replace(
          /\n/g,
          '<br>',
        );
      }
    });
  }
}
