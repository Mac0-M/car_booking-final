import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Toast Service
 * - บริการจัดการการแจ้งเตือนแบบ Toast Notification
 * - ใช้ Angular Material MatSnackBar แสดงตรงกลางล่าง
 * - รองรับ 4 ประเภท: success, error, warning, info
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);

  /** แสดง Toast สำเร็จ (สีเขียว) */
  success(message: string, duration = 3000): void {
    this.show(message, 'success', duration);
  }

  /** แสดง Toast ข้อผิดพลาด (สีแดง) */
  error(message: string, duration = 4000): void {
    this.show(message, 'error', duration);
  }

  /** แสดง Toast คำเตือน (สีเหลือง) */
  warning(message: string, duration = 3500): void {
    this.show(message, 'warning', duration);
  }

  /** แสดง Toast ข้อมูล (สีฟ้า) */
  info(message: string, duration = 3000): void {
    this.show(message, 'info', duration);
  }

  /** แสดง Toast ทั่วไป */
  show(message: string, type: ToastType = 'info', duration = 3000): void {
    this.snackBar.open(message, '✕', {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [`toast-${type}`],
    });
  }

  /** ปิด Toast ที่แสดงอยู่ */
  dismiss(): void {
    this.snackBar.dismiss();
  }
}
