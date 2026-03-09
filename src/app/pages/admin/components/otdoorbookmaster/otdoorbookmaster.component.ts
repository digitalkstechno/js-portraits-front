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
  bookList: any;
  isError = false;
  showPopup = false;
  popupMessage = '';
  router = inject(Router);
  bookService = inject(AdminService);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.bookForm = this.fb.group({
      bookName: [''],
      entryBy: [''],
      updateBy: [''],
    });
    this.loadBooks();
  }

  loadBooks() {
    this.bookService.getOutdoorBooks().subscribe((res) => {
      console.log(res);
      this.bookList = res.books;
    });
  }

  onSubmit() {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    const formValue = this.bookForm.value;

    this.bookService.createOutdoorBook(formValue).subscribe({
      next: (res: any) => {
        this.triggerPopup('Outdoor book created Successfully!', false);
        this.loadBooks();
      },
      error: (err: any) => {
        console.error('Error creating outdoor book', err);
        this.triggerPopup('Something went wrong while saving!', true);
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
  onCancel() {
    this.bookForm.reset();
  }
  onExit() {
    this.router.navigateByUrl('/admin')
  }
}
