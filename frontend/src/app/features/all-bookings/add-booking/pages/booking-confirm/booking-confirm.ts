import { Component, inject, signal, computed, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DialogRef } from '@angular/cdk/dialog';
import { BookingStore } from '../../state/booking.store';
import { AllSharedUi } from '../../../../../shared/shared';
import { BookingDetailModal } from '../../../components/booking-detail-modal/booking-detail-modal';
import { BookingService } from '../../../../../core/services/booking.service';
import { AvailabilityService } from '../../../../../core/services/availability.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { LanguageService } from '../../../../../core/services/language.service';
import { ToastService } from '../../../../../core/services/toast.service';

/**
 * BookingConfirmComponent:
 * - หน้าจอขั้นตอนสุดท้ายของการจองรถ (Step 3: Booking Confirm)
 * - แสดงสถานะของการจองสำเร็จ รายละเอียดการสรุปข้อมูลทั้งหมด (รถยนต์, จุดหมาย, วันและเวลา)
 */
@Component({
  selector: 'app-booking-confirm',
  standalone: true,
  imports: [CommonModule, ...AllSharedUi, BookingDetailModal],
  templateUrl: './booking-confirm.html',
})
export class BookingConfirmComponent {
  @Input() isDialog = false;
  @Output() confirmed = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();
  @Output() bookAnother = new EventEmitter<void>();

  protected readonly store = inject(BookingStore);
  private readonly router = inject(Router);
  private readonly dialogRef = inject(DialogRef, { optional: true });
  private readonly bookingService = inject(BookingService);
  private readonly availabilityService = inject(AvailabilityService);
  private readonly authService = inject(AuthService);
  private readonly langService = inject(LanguageService);
  private readonly toast = inject(ToastService);


  readonly isSubmitting = signal(false);
  readonly isConfirmed = signal(false);
  readonly bookingId = signal('');
  
  readonly currentUser = computed(() => {
    return this.authService.currentUser();
  });

  readonly totalDuration = computed(() => {
    const startStr = this.store.depart();
    const endStr = this.store.returnTime();

    if (!startStr || !endStr) return '';

    const diffMs = new Date(endStr).getTime() - new Date(startStr).getTime();
    if (diffMs <= 0) return '';

    const diffMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    const parts: string[] = [];
    if (hours > 0) {
      parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
    }

    return parts.length > 0 ? parts.join(' ') : '0 mins';
  });

  onBack(): void {
    if (this.isDialog) {
      this.back.emit();
    } else {
      this.router.navigate(['/booking/select-vehicle']);
    }
  }

  onBackToForm(): void {
    this.store.clear();
    if (this.isDialog) {
      this.bookAnother.emit();
    } else {
      this.router.navigate(['/booking/form']);
    }
  }

  onViewBookingHistory(): void {
    this.store.clear();
    if (this.isDialog && this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.router.navigate(['/bookings']);
    }
  }

  onConfirm(): void {
    const vehicle = this.store.selectedVehicle();
    if (!vehicle || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    const bookingData = {
      vehicle_id: Number(vehicle.id),
      destination: this.store.destination() || undefined,
      purpose: this.store.purpose() || undefined,
      depart: this.store.depart().replace('T', ' ') + ':00',
      return: this.store.returnTime().replace('T', ' ') + ':00',
      booked_by: this.store.booked_by() || undefined,
      booked_for: this.store.booked_for() || undefined
    };

    this.bookingService.addBooking(bookingData).subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);
        this.isConfirmed.set(true);
        this.toast.success(this.langService.translate('Booking created successfully.'));
        const savedBooking = res.data || res;
        this.bookingId.set(savedBooking.book_id || savedBooking.id);
        this.confirmed.emit(savedBooking.book_id || savedBooking.id);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        if (err.status === 409) {
          this.toast.warning(this.langService.translate('This vehicle is already booked. Please select another vehicle.'));
          
          this.availabilityService.search(
            this.store.depart(),
            this.store.returnTime()
          ).subscribe({
            next: (res: any) => {
              const vehicles = res.data || res;
              this.store.setVehicles(vehicles);
              if (this.isDialog) {
                this.back.emit();
              } else {
                this.router.navigate(['/booking/select-vehicle']);
              }
            },
            error: () => {
              if (this.isDialog) {
                this.back.emit();
              } else {
                this.router.navigate(['/booking/select-vehicle']);
              }
            }
          });
        } else {
          this.toast.error(this.langService.translate(err.error?.message || 'An error occurred while booking the vehicle. Please try again.'));
        }
      }
    });
  }

}
