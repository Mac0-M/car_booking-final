import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly apiUrl = environment.apiUrl;

  readonly currentUser = signal<any | null>(null);

  /** เข้าสู่ระบบผ่าน Email + Password (Local Login) */
  loginLocal(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        const data = res.data || res;
        this.saveTokens(data);
      })
    );
  }

  /** ดึงข้อมูลผู้ใช้ปัจจุบัน */
  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/me`).pipe(
      map(res => res.data || res),
      tap(user => {
        user.name = user.user_name || user.name || 'User';
        user.profile_image = user.profile_img || user.profile_image;
        this.currentUser.set(user);
      })
    );
  }

  /** บันทึก Token ลง TokenService */
  saveTokens(res: any): void {
    const token = res.access_token || res.token || res.accessToken || res.data?.access_token || null;
    this.tokenService.setToken(token);
    if (res.user) {
      const user = res.user;
      user.name = user.user_name || user.name || 'User';
      user.profile_image = user.profile_img || user.profile_image;
      this.currentUser.set(user);
    }
  }

  /** ตรวจสอบว่าผู้ใช้มี JWT token ที่ถูกต้องอยู่แล้วหรือไม่ */
  hasValidToken(): boolean {
    return this.tokenService.hasToken() && !this.tokenService.isExpired();
  }

  /** อัปเดตเบอร์โทรศัพท์ของผู้ใช้ปัจจุบัน */
  updatePhone(phone: string): Observable<any> {
    const userId = this.currentUser()?.userId || this.currentUser()?.user_id;
    return this.http.patch<any>(`${this.apiUrl}/users/${userId}`, { phone }).pipe(
      tap(res => {
        const user = res.data || res;
        this.currentUser.update(current => current ? { ...current, phone: user.phone || user.phone_number } : null);
      })
    );
  }

  /** ออกจากระบบ (Logout) */
  logout(): void {
    this.tokenService.clear();
    this.currentUser.set(null);
  }
}
