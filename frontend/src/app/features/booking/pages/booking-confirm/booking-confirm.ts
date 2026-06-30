import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingStore } from '../../state/booking.store';
import { AllSharedUi } from '../../../../shared/shared';
import { BookingDetailModal } from '../../../all-bookings/components/booking-detail-modal/booking-detail-modal';
import { BookingService } from '../../../../core/services/booking.service';
import { AvailabilityService } from '../../../../core/services/availability.service';
import { AuthService } from '../../../../core/services/auth.service';


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
  protected readonly store = inject(BookingStore);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  private readonly availabilityService = inject(AvailabilityService);
  private readonly authService = inject(AuthService);


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
    // Go back to vehicle selection step (Step 2)
    this.router.navigate(['/booking/select-vehicle']);
  }

  onBackToForm(): void {
    // Reset all booking info and return to form step (Step 1)
    this.store.clear();
    this.router.navigate(['/booking/form']);
  }

  onViewBookingHistory(): void {
    // Reset store and navigate to bookings list
    this.store.clear();
    this.router.navigate(['/bookings']);
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
        const savedBooking = res.data || res;
        this.bookingId.set(savedBooking.id);
        this.store.clear();
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        if (err.status === 409) {
          alert('This vehicle is already booked. Please select another vehicle.');
          
          // Re-fetch availability and update store to reflect correct status
          this.availabilityService.search(
            this.store.depart(),
            this.store.returnTime()
          ).subscribe({
            next: (res: any) => {
              const vehicles = res.data || res;
              this.store.setVehicles(vehicles);
              this.router.navigate(['/booking/select-vehicle']);
            },
            error: () => {
              this.router.navigate(['/booking/select-vehicle']);
            }
          });
        } else {
          alert(err.error?.message || 'An error occurred while booking the vehicle. Please try again.');
        }
      }
    });
  }

}
