import { Component, inject } from '@angular/core';
import { SHARED_MODULES } from '../../../../../constants/sharedModule';
import { Router } from '@angular/router';
import { AdminService } from '../../service/admin.service';

@Component({
  selector: 'app-showtermsandconditions',
  imports: [SHARED_MODULES],
  templateUrl: './showtermsandconditions.component.html',
  styleUrl: './showtermsandconditions.component.css',
})
export class ShowtermsandconditionsComponent {
  router = inject(Router);
  service = inject(AdminService);

  termsList: any[] = [];
  selectedTerm: any = { header: '', body: '' };

  ngOnInit() {
    if (this.termsList.length > 0) {
      this.selectTerm(this.termsList[0]); // Default pehla select karein
    }
    this.loadTerms();
  }

  loadTerms() {
    this.service.getTermsAndConditions().subscribe((res) => {
      this.termsList = res.data?.conditions;
      console.log(this.termsList);
    });
  }

  selectTerm(term: any) {
    this.selectedTerm = { ...term };
    console.log(this.selectedTerm);
  }

  showPopup = false;
  popupMessage = '';
  isError = false;

  onSubmit() {
    const payload = {
      conditions: [
        {
          header: this.selectedTerm.header,
          body: this.selectedTerm.body,
        },
      ],
    };
    this.service.createTermsAndConditions(payload).subscribe({
      next: (res: any) => {
        this.triggerPopup('Terms and conditions updated Successfully!', false);
        this.loadTerms();
      },
      error: (err: any) => {
        console.error('Error saving notes', err);
        this.triggerPopup('Something went wrong while updating!', true);
      },
    });
  }

  // Pop-up handle karne ka function
  triggerPopup(message: string, error: boolean) {
    this.popupMessage = message;
    this.isError = error;
    this.showPopup = true;

    // 3 second baad apne aap gayab ho jayega
    setTimeout(() => {
      this.showPopup = false;
    }, 3000);
  }

  onDelete() {
    console.log('Deleting...');
  }

  onExit() {
    this.router.navigateByUrl('/admin/terms&conditions');
  }
}
