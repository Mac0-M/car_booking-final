import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * adminGuard: ตรวจสอบสิทธิ์ Admin / Super_Admin
 * - อนุญาตเฉพาะผู้ใช้ที่มี role เป็น Admin หรือ Super_Admin
 * - ถ้าไม่มีสิทธิ์ → ส่งกลับไปหน้า /bookings
 */
export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // ต้อง login ก่อน
  if (!auth.hasValidToken()) {
    return router.parseUrl('/auth/login');
  }

  // ดึง profile ถ้ายังไม่มี
  if (!auth.currentUser()) {
    try {
      await new Promise((resolve, reject) => {
        auth.getProfile().subscribe({
          next: resolve,
          error: reject
        });
      });
    } catch {
      auth.logout();
      return router.parseUrl('/auth/login');
    }
  }

  const user = auth.currentUser();
  if (user?.role === 'Admin' || user?.role === 'Super_Admin') {
    return true;
  }

  return router.parseUrl('/bookings');
};
