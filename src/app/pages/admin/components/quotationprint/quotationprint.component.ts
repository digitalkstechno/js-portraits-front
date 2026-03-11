import { Component, inject, Input } from '@angular/core';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { ConfigService } from '../service/configService/config.service';

@Component({
  selector: 'app-quotationprint',
  imports: [SHARED_MODULES],
  templateUrl: './quotationprint.component.html',
  styleUrl: './quotationprint.component.css',
})
export class QuotationprintComponent {
  @Input() data: any; // Pura quotation data (Customer info, items, etc.)
  @Input() showRate: boolean = true;
  @Input() showDiscount: boolean = true;
  @Input() terms: any[] = [];
  gst: number = 0;
  gstAmt: number = 0;
  printService = inject(ConfigService);
  printSettings: any;
  formattedAddress: string = '';

  ngOnInit() {
    console.log('quotation data', this.data);
    console.log('Terms conditions', this.terms);
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

  termsPerPage = 5;

  get paginatedTerms() {
    const pages = [];

    for (let i = 0; i < this.terms.length; i += this.termsPerPage) {
      pages.push(this.terms.slice(i, i + this.termsPerPage));
    }

    return pages;
  }
}
