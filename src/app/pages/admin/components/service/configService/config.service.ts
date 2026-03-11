import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Endpoints } from '../../../../../API/api.config';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(private http: HttpClient) {}

  // gst configuration
  configGstSettings(data: any): Observable<any> {
    return this.http.post<any>(Endpoints.GST_CONFIGURATION, data);
  }

  getGstConfig(): Observable<any> {
    return this.http.get<any>(Endpoints.GST_CONFIGURATION);
  }

  // print settings
  configprintSettings(data: any): Observable<any> {
    return this.http.post<any>(Endpoints.PRINT_SETTINGS, data);
  }

  getPrintSettings(): Observable<any> {
    return this.http.get<any>(Endpoints.PRINT_SETTINGS);
  }
}
