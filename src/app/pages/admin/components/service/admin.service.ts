import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';
import { Endpoints } from '../../../../API/api.config';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient) {}
  private userSearchSubject = new Subject<{
    page: number;
    limit: number;
    search: string;
  }>();

  // 🔥 Observable that component will subscribe to
  users$ = this.userSearchSubject.pipe(
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
        params = params.set('userName', search);
      }

      return this.http.get<any>(Endpoints.ITEMS, { params });
    }),
  );

  // 🔹 Trigger search/pagination
  searchItems(page: number, limit: number, search: string = '') {
    this.userSearchSubject.next({ page, limit, search });
  }

  getQuotation(): Observable<any> {
    return this.http.get<any>(Endpoints.QUOTATION);
  }

  getQuotationById(id: string): Observable<any> {
    return this.http.get<any>(`${Endpoints.QUOTATION}/${id}`);
  }

  createQuotation(data: any): Observable<any> {
    return this.http.post<any>(Endpoints.QUOTATION, data);
  }

  updateQuotation(id: string, data: { name: string }): Observable<any> {
    return this.http.put<any>(`${Endpoints.ITEMS}/${id}`, data);
  }

  deleteQuotation(id: string): Observable<void> {
    return this.http.delete<void>(`${Endpoints.QUOTATION}/${id}`);
  }
}
