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
  @Input() terms: any[] = []; // Jo Master se humne banaye the
  dummyRows = Array.from({ length: 8 }); // jitna space chahiye utne rows
}
