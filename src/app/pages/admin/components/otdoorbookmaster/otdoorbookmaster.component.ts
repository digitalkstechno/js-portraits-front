import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../service/admin.service';
import { SHARED_MODULES } from '../../../../constants/sharedModule';

@Component({
  selector: 'app-otdoorbookmaster',
  imports: [SHARED_MODULES],
  templateUrl: './otdoorbookmaster.component.html',
  styleUrl: './otdoorbookmaster.component.css',
})
export class OtdoorbookmasterComponent {
  bookForm!: FormGroup;
  router = inject(Router);
  bookService = inject(AdminService);

  // Table ka mock data
  bookList = [
    { name: '23 - 24 ODER', notDisplay: true },
    { name: 'OUTDOR', notDisplay: true },
    { name: 'BM', notDisplay: false },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.bookForm = this.fb.group({
      book: ['BNI-2'],
      entryBy: [''],
      updateBy: [''],
    });
  }

  onSave() {
    console.log('Saving...', this.bookForm.value);
  }
  onDelete() {
    console.log('Deleting...');
  }
  onCancel() {
    this.bookForm.reset();
  }
  onExit() {
    /* Navigation logic */
  }
}
