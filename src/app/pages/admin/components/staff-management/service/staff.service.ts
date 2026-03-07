import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Endpoints } from '../../../../../API/api.config';

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  constructor(private http: HttpClient) {}

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
