import { Component } from '@angular/core';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { AdminService } from '../../components/service/admin.service';
import { ItemsService } from '../service/items.service';

@Component({
  selector: 'app-productdetails',
  imports: [SHARED_MODULES],
  templateUrl: './productdetails.component.html',
  styleUrl: './productdetails.component.css',
})
export class ProductdetailsComponent {
  page = 1;
  limit = 10;
  searchText = '';
  pagination: any = { page: 1, limit: 10, total: 0, pages: 1 };
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

  constructor(private service: ItemsService) {}

  ngOnInit() {
    this.service.products$.subscribe({
      next: (res) => {
        console.log('Products', res);
        this.products = res.data;
        this.pagination = {
          page: res.page,
          limit: this.limit,
          pages: res.total,
          total: res.totalPages,
        };
      },
      error: (err) => console.error('Fetch users failed', err),
    });

    this.service.searchProducts(this.page, this.limit);
  }

  // 🔍 Debounced search
  onSearch(value: string) {
    this.page = 1;
    this.searchText = value;
    this.service.searchProducts(this.page, this.limit, value);
  }

  nextPage() {
    if (this.pagination.page < this.pagination.pages) {
      this.page++;
      this.service.searchProducts(this.page, this.limit, this.searchText);
    }
  }

  prevPage() {
    if (this.pagination.page > 1) {
      this.page--;
      this.service.searchProducts(this.page, this.limit, this.searchText);
    }
  }

  onSubmit() {}
}
