import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * authGuard: ตรวจสอบการเข้าสู่ระบบและสิทธิ์การเข้าใช้งาน
 * - มี JWT token ที่ยังไม่หมดอายุ -> อนุญาตให้ผ่าน
 * - ไม่มีสิทธิ์ -> ส่งกลับไปหน้า Login (/auth/login)
 */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // มี token อยู่แล้ว → ผ่าน
  if (auth.hasValidToken()) {
    if (!auth.currentUser()) {
      try {
        await new Promise((resolve, reject) => {
          auth.getProfile().subscribe({
            next: resolve,
            error: reject
          });
        });
      } catch (err) {
        auth.logout();
        return router.parseUrl('/auth/login');
      }
    }
    return true;
  }

  return router.parseUrl('/auth/login');

};
