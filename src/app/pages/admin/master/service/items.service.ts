import { Injectable } from '@angular/core';
import { Endpoints } from '../../../../API/api.config';
import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  constructor(private http: HttpClient) {}
  private itemSearchSubject = new Subject<{
    page: number;
    limit: number;
    search: string;
  }>();
  private productSearchSubject = new Subject<{
    page: number;
    limit: number;
    search: string;
  }>();

  // 🔥 Observable that component will subscribe to
  items$ = this.itemSearchSubject.pipe(
    debounceTime(400),
    distinctUntilChanged(
      (prev, curr) =>
        prev.page === curr.page &&
        prev.limit === curr.limit &&
        prev.search === curr.search,
    ),
    switchMap(({ page, limit, search }) => {
      let params = new HttpParams()
        .set('page', page.toString())
        .set('limit', limit.toString());

      if (search) {
        params = params.set('item_name', search);
      }

      return this.http.get<any>(Endpoints.ITEMS, { params });
    }),
  );

  products$ = this.productSearchSubject.pipe(
    debounceTime(400),
    distinctUntilChanged(
      (prev, curr) =>
        prev.page === curr.page &&
        prev.limit === curr.limit &&
        prev.search === curr.search,
    ),
    switchMap(({ page, limit, search }) => {
      let params = new HttpParams()
        .set('page', page.toString())
        .set('limit', limit.toString());

      if (search) {
        params = params.set('product_name', search);
      }

      return this.http.get<any>(Endpoints.PRODUCTS, { params });
    }),
  );

  // 🔹 Trigger search/pagination
  searchItems(page: number, limit: number, search: string = '') {
    this.itemSearchSubject.next({ page, limit, search });
  }

  searchProducts(page: number, limit: number, search: string = '') {
    this.productSearchSubject.next({ page, limit, search });
  }

  getItems(): Observable<any> {
    return this.http.get<any>(Endpoints.ITEMS);
  }

  getItemById(id: string): Observable<any> {
    return this.http.get<any>(`${Endpoints.ITEMS}/${id}`);
  }

  createItem(data: any): Observable<any> {
    return this.http.post<any>(Endpoints.ITEMS, data);
  }

  updateItem(id: string, data: { name: string }): Observable<any> {
    return this.http.put<any>(`${Endpoints.ITEMS}/${id}`, data);
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${Endpoints.ITEMS}/${id}`);
  }

  // product service
  getProducts(): Observable<any> {
    return this.http.get<any>(Endpoints.PRODUCTS);
  }

  getProductById(id: string): Observable<any> {
    return this.http.get<any>(`${Endpoints.PRODUCTS}/${id}`);
  }

  createProduct(data: any): Observable<any> {
    return this.http.post<any>(Endpoints.PRODUCTS, data);
  }

  updateProduct(id: string, data: { name: string }): Observable<any> {
    return this.http.put<any>(`${Endpoints.PRODUCTS}/${id}`, data);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${Endpoints.PRODUCTS}/${id}`);
  }
}
