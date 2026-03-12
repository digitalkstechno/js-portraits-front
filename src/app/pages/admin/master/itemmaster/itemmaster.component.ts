import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { AdminService } from '../../components/service/admin.service';
import { ItemsService } from '../service/items.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-itemmaster',
  imports: [SHARED_MODULES],
  templateUrl: './itemmaster.component.html',
  styleUrl: './itemmaster.component.css',
})
export class ItemmasterComponent {
  itemForm: FormGroup;
  page = 1;
  limit = 10;
  searchText = '';
  pagination: any = { page: 1, limit: 10, total: 0, pages: 1 };
  items: any;
  isError = false;
  showPopup = false;
  popupMessage = '';

  constructor(
    private fb: FormBuilder,
    private service: ItemsService,
    private router: Router,
  ) {
    this.itemForm = fb.group({
      item_name: ['', [Validators.required]],
      hsn_code: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]{4}$|^[0-9]{6}$|^[0-9]{8}$'),
        ],
      ],
      display_in_stock: [false],
      entry_by: [''],
      updated_by: [''],
    });
  }

  ngOnInit() {
    this.service.items$.subscribe({
      next: (res) => {
        // console.log('Items', res);
        this.items = res.data;
        this.pagination = {
          page: res.page,
          limit: this.limit,
          pages: res.total,
          total: res.totalPages,
        };
      },
      error: (err) => console.error('Fetch items failed', err),
    });

    this.service.searchItems(this.page, this.limit);
  }

  // 🔍 Debounced search
  onSearch(value: string) {
    this.page = 1;
    this.searchText = value;
    this.service.searchItems(this.page, this.limit, value);
  }

  nextPage() {
    if (this.pagination.page < this.pagination.pages) {
      this.page++;
      this.service.searchItems(this.page, this.limit, this.searchText);
    }
  }

  prevPage() {
    if (this.pagination.page > 1) {
      this.page--;
      this.service.searchItems(this.page, this.limit, this.searchText);
    }
  }

  onSubmit() {
    if (this.itemForm.invalid) {
      console.log(true);
      this.itemForm.markAllAsTouched();
      return;
    } else {
      this.isError = true;
      this.popupMessage = 'Please fix the errors before saving.';
      this.showPopup = true;

      // Auto-hide popup after 3 seconds
      this.triggerPopup(this.popupMessage, this.isError);
      setTimeout(() => (this.showPopup = false), 3000);
    }

    const payload = this.itemForm.value;
    // console.log('Create user payload:', payload);

    this.service.createItem(payload).subscribe({
      next: (res) => {
        this.triggerPopup('Item created Successfully!', false);
        this.service.searchItems(this.page, this.limit, this.searchText);
        this.itemForm.reset();
      },
      error: (err: any) => {
        console.error('Create user failed', err);
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

  close() {
    this.router.navigateByUrl('/admin');
  }

  onlyNumberKey(event: any) {
    const charCode = event.which ? event.which : event.keyCode;
    // Only allow numbers 0-9
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}
