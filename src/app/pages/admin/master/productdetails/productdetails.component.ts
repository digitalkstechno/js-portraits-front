import { Component, HostListener } from '@angular/core';
import { SHARED_MODULES } from '../../../../constants/sharedModule';
import { AdminService } from '../../components/service/admin.service';
import { ItemsService } from '../service/items.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-productdetails',
  imports: [SHARED_MODULES],
  templateUrl: './productdetails.component.html',
  styleUrl: './productdetails.component.css',
})
export class ProductdetailsComponent {
  productForm!: FormGroup;
  page = 1;
  limit = 10;
  searchText = '';
  pagination: any = { page: 1, limit: 10, total: 0, pages: 1 };
  products: any;
  items: any;
  showDropdown = false;
  selectedItemName = '';

  constructor(
    private service: ItemsService,
    private fb: FormBuilder,
  ) {
    this.productForm = fb.group({
      item_name: [''],
      product_name: [''],
      bill_rate: [0],
      per_rate: [0],
      stock_rate: [0],
      total: [0],
      remark: [''],
    });
  }

  ngOnInit() {
    this.items = [];
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

    this.loadItems();

    this.service.searchProducts(this.page, this.limit);
  }

  masterItems: any;
  loadItems() {
    this.service.items$.subscribe({
      next: (res) => {
        console.log('items', res);
        this.masterItems = res.data;
      },
      error: (err) => console.error('Fetch users failed', err),
    });
    this.service.searchItems(this.page, this.limit);
  }

  onItemSearch(searchValue: string) {
    this.selectedItemName = searchValue; // Input ki value update karein

    if (searchValue.length > 0) {
      this.items = this.masterItems.filter((item: any) =>
        item.item_name.toLowerCase().includes(searchValue.toLowerCase()),
      );
      this.showDropdown = true;
    } else {
      this.items = [];
      this.showDropdown = false;
    }
  }

  // 2. Selection Logic: List se item select karna
  selectItem(item: any) {
    this.selectedItemName = item.item_name;
    this.productForm.patchValue({
      item_name: item._id,
    });

    this.showDropdown = false;
    // console.log('Selected Item ID:', item._id);
  }

  // 3. Close on Click Outside: Bahar click karne par dropdown band ho jaye
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!event.target.closest('.custom-search-container')) {
      this.showDropdown = false;
    }
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

  reset(input: HTMLInputElement) {
    input.value = ''; // clear UI
    this.searchText = '';
    this.page = 1;

    // trigger debounced reload without search
    this.service.searchProducts(this.page, this.limit, '');
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const payload = this.productForm.value;
    // console.log('Create user payload:', payload);

    this.service.createProduct(payload).subscribe({
      next: (res) => {
        console.log('Successfully created products', res);
        this.service.searchProducts(this.page, this.limit, this.searchText);
        this.productForm.reset();
        this.selectedItemName = '';
      },
      error: (err: any) => {
        console.error('Create products failed', err);
      },
    });
  }
}
