import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { BookingStore } from '../../features/booking/state/booking.store';

/**
 * bookingStepGuard: ตรวจสอบและควบคุมลำดับขั้นตอนการจองรถ
 * - ป้องกันไม่ให้ผู้ใช้ข้ามขั้นตอน (เช่น ไปหน้าสรุปโดยยังไม่ได้ระบุสถานที่หรือเลือกรถ)
 */
export const bookingStepGuard: CanActivateFn = (route, state) => {
  const store = inject(BookingStore);
  const router = inject(Router);

  // ขั้นตอนที่ 1: ต้องกรอกฟอร์มค้นหารถให้สมบูรณ์ก่อน
  if (!store.isStep1Valid()) {
    return router.parseUrl('/booking/form');
  }

  // ขั้นตอนที่ 2: ถ้ากำลังจะไปหน้ายืนยันการจอง (confirm) จะต้องเลือกรถก่อน
  if (state.url.includes('/booking/confirm') && !store.selectedVehicle()) {
    return router.parseUrl('/booking/select-vehicle');
  }

  return true;
};
