import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { AdminService } from '../../components/service/admin.service';

@Component({
  selector: 'app-itemmaster',
  imports: [SHARED_MODULES],
  templateUrl: './itemmaster.component.html',
  styleUrl: './itemmaster.component.css',
})
export class ItemmasterComponent {
  itemForm!: FormGroup;
  page = 1;
  limit = 10;
  searchText = '';
  pagination: any = { page: 1, limit: 10, total: 0, pages: 1 };
  items = [
    { name: 'ALBUM', hsn: '0' },
    { name: 'CANVAS', hsn: '0' },
    { name: 'LAMINATION', hsn: '0' },
    { name: 'PHOTOGRAPHY', hsn: '0' },
    { name: 'VIDEO SHOOT', hsn: '0' },
  ];

  constructor(
    private fb: FormBuilder,
    private service: AdminService,
  ) {
    this.itemForm = fb.group({
      item_name: [''],
      hsn_code: [''],
      display_in_stock: [''],
      entry_by: [''],
      updated_by: [''],
    });
  }

  products = [
    {
      item: 'PHOTOGRAPHY',
      size: 'PHOTO FRAME',
      stock: 0,
      rate: 0,
      total: 0.0,
      billSize: 10,
      prate: 0,
    },
    {
      item: 'PHOTOGRAPHY',
      size: 'PHOTOGRAPHY',
      stock: 0,
      rate: 0,
      total: 0.0,
      billSize: 20,
      prate: 0,
    },
  ];

  ngOnInit() {}

  loadProducts() {
    this.service.getItems().subscribe({
      next: (res) => {
        console.log('Response', res);
      },
      error: (err) => {
        console.error(err);
      },
    });
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
  onSubmit() {}
}
