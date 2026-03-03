import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { AdminService } from '../../components/service/admin.service';
import { ItemsService } from '../service/items.service';

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
    private service: ItemsService,
  ) {
    this.itemForm = fb.group({
      item_name: [''],
      hsn_code: [''],
      display_in_stock: [''],
      entry_by: [''],
      updated_by: [''],
    });
  }

  ngOnInit() {
    this.service.products$.subscribe({
      next: (res) => {
        const users = res.users;
        this.items = users.filter(
          (u: any) => u.role?.roleName === 'merchandiser',
        );
        // console.log("users", this.users);
        this.pagination = {
          page: res.pagination.page,
          limit: this.limit,
          pages: res.pagination.pages,
          total: res.pagination.total,
        };
      },
      error: (err) => console.error('Fetch users failed', err),
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

  onSubmit() {}
}
