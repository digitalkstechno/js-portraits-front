import { Component, Input } from '@angular/core';
import { SHARED_MODULES } from '../../../../constants/sharedModule';

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

  ngOnInit() {
    console.log('quotation data', this.data);
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
}
