import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';
import { Endpoints } from '../../../../../API/api.config';

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  constructor(private http: HttpClient) {}
  private staffSearchSubject = new Subject<{
    page: number;
    limit: number;
    search: string;
  }>();

  private staffSalarySearchSubject = new Subject<{
    page: number;
    limit: number;
    search: string;
  }>();

  // 🔥 Observable that component will subscribe to
  // staff.service.ts
  staff$ = this.staffSearchSubject.pipe(
    debounceTime(400),
    switchMap(({ page, limit, search }) => {
      let params = new HttpParams()
        .set('page', page.toString())
        .set('limit', limit.toString());

      if (search) {
        params = params.set('name', search);
      }

      return this.http.get<any>(Endpoints.STAFF, { params });
    }),
  );

  salary$ = this.staffSalarySearchSubject.pipe(
    debounceTime(400),
    switchMap(({ page, limit, search }) => {
      let params = new HttpParams()
        .set('page', page.toString())
        .set('limit', limit.toString());

      if (search) {
        params = params.set('staffName', search);
      }

      return this.http.get<any>(Endpoints.STAFF_SALARY, { params });
    }),
  );

  searchStaff(page: number, limit: number, search: string = '') {
    this.staffSearchSubject.next({ page, limit, search });
  }

  searchStaffSalary(page: number, limit: number, search: string = '') {
    this.staffSalarySearchSubject.next({ page, limit, search });
  }

  getStaff(): Observable<any> {
    return this.http.get<any>(Endpoints.STAFF);
  }

  getStaffById(id: string): Observable<any> {
    return this.http.get<any>(`${Endpoints.STAFF}/${id}`);
  }

  getStaffCount(): Observable<any> {
    return this.http.get<any>(`${Endpoints.STAFF}/count`);
  }

  createStaff(data: any): Observable<any> {
    return this.http.post<any>(Endpoints.STAFF, data);
  }

  // staff salary
  getStaffSalary(): Observable<any> {
    return this.http.get<any>(Endpoints.STAFF_SALARY);
  }

  getStaffSalaryById(id: string): Observable<any> {
    return this.http.get<any>(`${Endpoints.STAFF_SALARY}/${id}`);
  }

  createStaffPayment(data: any): Observable<any> {
    return this.http.post<any>(Endpoints.STAFF_SALARY, data);
  }
}
