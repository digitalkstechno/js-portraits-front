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
    this.loadTerms(); // Sirf call karein, select subscribe ke andar hoga
  }

  loadTerms() {
    this.service.getTermsAndConditions().subscribe((res: any) => {
      // 1. Data list mein assign karein
      this.termsList = res.data?.conditions || [];

      // 2. Sirf tab select karein jab data successfully aa chuka ho
      if (this.termsList.length > 0) {
        // Agar pehle se koi term selected hai (editing ke waqt), toh use wahi rehne dein
        // Warna default pehla select karein
        const currentHeader = this.selectedTerm?.header;
        const found = this.termsList.find((t) => t.header === currentHeader);

        this.selectTerm(found || this.termsList[0]);
      }
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
    // 1. Pura array map karein: Agar header match kare toh update karein, warna wahi rehne dein
    const updatedConditions = this.termsList.map((item: any) => {
      if (item.header === this.selectedTerm.header) {
        return {
          header: this.selectedTerm.header,
          body: this.selectedTerm.body,
        };
      }
      return item;
    });

    // 2. Payload mein poora updated array bhejiye
    const payload = {
      conditions: updatedConditions,
      user: 'Admin',
    };

    this.service.createTermsAndConditions(payload).subscribe({
      next: (res: any) => {
        this.triggerPopup('Terms updated Successfully!', false);
        this.loadTerms(); // Refresh list from backend
      },
      error: (err: any) => {
        this.triggerPopup('Update failed!', true);
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
    if (!confirm('Are you sure you want to delete this term?')) return;

    // Selected item ko list se nikal dein
    const updatedConditions = this.termsList.filter(
      (item: any) => item.header !== this.selectedTerm.header,
    );

    const payload = {
      conditions: updatedConditions,
      user: 'Admin',
    };

    this.service.createTermsAndConditions(payload).subscribe({
      next: (res: any) => {
        this.triggerPopup('Term Deleted Successfully!', false);
        this.selectedTerm = { header: '', body: '' }; // Clear editor
        this.loadTerms();
      },
    });
  }

  onExit() {
    this.router.navigateByUrl('/admin/terms&conditions');
  }
}
