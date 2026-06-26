import { Injectable, signal } from '@angular/core';

/**
 * TokenService: จัดการ JWT token และ expireDate ใน localStorage
 * - เก็บ token + expireDate → ทำ auto-login ได้โดยไม่ต้องยิง API
 */
@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly tokenKey = 'jwt_token';
  private readonly expireKey = 'jwt_expire';
  private readonly jwtToken = signal<string | null>(this.loadToken());

  /** โหลด token จาก localStorage (ถ้ายังไม่หมดอายุ) */
  private loadToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    const expire = localStorage.getItem(this.expireKey);

    if (!token) return null;

    // ถ้ามี expireDate ให้ตรวจสอบว่ายังไม่หมดอายุ
    if (expire) {
      const expireDate = new Date(expire);
      if (expireDate <= new Date()) {
        // Token หมดอายุแล้ว → ลบออก
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.expireKey);
        return null;
      }
    }

    return token;
  }

  setToken(token: string | null, expiresIn?: number): void {
    this.jwtToken.set(token);
    if (token) {
      localStorage.setItem(this.tokenKey, token);

      // ถ้ามี expiresIn (วินาที) ให้คำนวณ expireDate
      if (expiresIn) {
        const expireDate = new Date(Date.now() + expiresIn * 1000);
        localStorage.setItem(this.expireKey, expireDate.toISOString());
      } else {
        // พยายาม decode JWT เพื่อดึง exp
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp) {
            const expireDate = new Date(payload.exp * 1000);
            localStorage.setItem(this.expireKey, expireDate.toISOString());
          }
        } catch {
          // ถ้า decode ไม่ได้ → ไม่เก็บ expireDate
        }
      }
    } else {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.expireKey);
    }
  }

  getToken(): string | null {
    return this.jwtToken();
  }

  hasToken(): boolean {
    return this.jwtToken() !== null;
  }

  /** ตรวจสอบว่า token หมดอายุหรือยัง */
  isExpired(): boolean {
    const expire = localStorage.getItem(this.expireKey);
    if (!expire) return false; // ไม่มี expireDate → ถือว่ายังใช้ได้
    return new Date(expire) <= new Date();
  }

  clear(): void {
    this.jwtToken.set(null);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expireKey);
  }
}
