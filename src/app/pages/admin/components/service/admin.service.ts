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

  getQuotationByNumber(num: string): Observable<any> {
    return this.http.get<any>(`${Endpoints.QUOTATION}/${num}`);
  }

  getQuotationCount(): Observable<any> {
    return this.http.get<any>(`${Endpoints.QUOTATION}/count`);
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

  // outdoor order
  getOutdoorOrder(): Observable<any> {
    return this.http.get<any>(Endpoints.OUTDOOR_ORDER);
  }

  getOutdoorOrderById(id: string): Observable<any> {
    return this.http.get<any>(`${Endpoints.OUTDOOR_ORDER}/${id}`);
  }

  getOrderQuotationByNumber(num: string): Observable<any> {
    return this.http.get<any>(`${Endpoints.OUTDOOR_ORDER}/${num}`);
  }

  getOrderCount(): Observable<any> {
    return this.http.get<any>(`${Endpoints.OUTDOOR_ORDER}/count`);
  }

  createOutdoorOrder(data: any): Observable<any> {
    return this.http.post<any>(Endpoints.OUTDOOR_ORDER, data);
  }

  // outdoor bill
  getOutdoorBill(): Observable<any> {
    return this.http.get<any>(Endpoints.OUTDOOR_BILL);
  }

  getOutdoorBillById(id: string): Observable<any> {
    return this.http.get<any>(`${Endpoints.OUTDOOR_BILL}/${id}`);
  }

  getBillQuotationByNumber(num: string): Observable<any> {
    return this.http.get<any>(`${Endpoints.OUTDOOR_BILL}/${num}`);
  }

  getOutdoorBillCount(): Observable<any> {
    return this.http.get<any>(`${Endpoints.OUTDOOR_BILL}/count`);
  }

  createOutdoorBill(data: any): Observable<any> {
    return this.http.post<any>(Endpoints.OUTDOOR_BILL, data);
  }

  // role
  getroles(): Observable<any> {
    return this.http.get<any>(Endpoints.ROLE);
  }

  // note setting
  createNoteSettings(data: any): Observable<any> {
    return this.http.post<any>(Endpoints.NOTE_SETTINGS, data);
  }

  getNotes(): Observable<any> {
    return this.http.get<any>(Endpoints.NOTE_SETTINGS);
  }

  // outdoor book master
  getOutdoorBooks(): Observable<any> {
    return this.http.get<any>(Endpoints.OUTDOOR_BOOKS);
  }

  getOutdoorBookById(id: string): Observable<any> {
    return this.http.get<any>(`${Endpoints.OUTDOOR_BOOKS}/${id}`);
  }

  getBookByNumber(num: string): Observable<any> {
    return this.http.get<any>(`${Endpoints.OUTDOOR_BOOKS}/${num}`);
  }

  createOutdoorBook(data: any): Observable<any> {
    return this.http.post<any>(Endpoints.OUTDOOR_BOOKS, data);
  }

  // customers
  getCustomers(): Observable<any> {
    return this.http.get<any>(Endpoints.CUSTOMERS);
  }
}
