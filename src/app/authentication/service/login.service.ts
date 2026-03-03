import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Endpoints } from '../../API/api.config';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient) {}
  private TOKEN_KEY = 'token';

  // 🔐 Login
  login(payload: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(Endpoints.LOGIN, payload).pipe(
      tap((res) => {
        if (res?.token) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          localStorage.setItem('refreshToken', res.refreshToken);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      }),
    );
  }

  refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');

    return this.http
      .post<any>(Endpoints.REFRESH_TOKEN, {
        refreshToken,
      })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.TOKEN_KEY, res.token);
        }),
      );
  }

  // 🚪 Logout
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // ✅ Check login status
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  // 🎟 Get token (used by guard/interceptor if needed)
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
