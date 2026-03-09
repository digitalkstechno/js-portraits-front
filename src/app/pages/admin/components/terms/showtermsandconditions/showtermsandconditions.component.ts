import { Component, inject } from '@angular/core';
import { SHARED_MODULES } from '../../../../../constants/sharedModule';
import { Router } from '@angular/router';

@Component({
  selector: 'app-showtermsandconditions',
  imports: [SHARED_MODULES],
  templateUrl: './showtermsandconditions.component.html',
  styleUrl: './showtermsandconditions.component.css',
})
export class ShowtermsandconditionsComponent {
  router = inject(Router);
  termsList: any[] = [
    { header: 'Payment Terms', body: '50% Advance, 50% on delivery.' },
    { header: 'Delivery', body: 'Within 7 working days.' },
    { header: 'Cancellation', body: 'Amount is non-refundable.' },
  ];

  selectedTerm: any = { header: '', body: '' };

  ngOnInit() {
    if (this.termsList.length > 0) {
      this.selectTerm(this.termsList[0]); // Default pehla select karein
    }
  }

  selectTerm(term: any) {
    this.selectedTerm = { ...term };
  }

  onSave() {
    console.log('Saving...', this.selectedTerm);
  }

  onDelete() {
    console.log('Deleting...');
  }

  onExit() {
    this.router.navigateByUrl('/admin/terms&conditions');
  }
}
