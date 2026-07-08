import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef } from '@angular/cdk/dialog';
import { AllSharedUi } from '../../../shared/shared';
import { BookingStore } from './state/booking.store';
import { AuthService } from '../../../core/services/auth.service';
import { BookingFormComponent } from './pages/booking-form/booking-form';
import { VehicleSelectionComponent } from './pages/vehicle-selection/vehicle-selection';
import { BookingConfirmComponent } from './pages/booking-confirm/booking-confirm';

/**
 * BookingDialogComponent:
 * - Dialog coordinator component for the multi-step booking wizard.
 * - Manages dialog header titles and stepper process state.
 * - Delegates step forms, vehicle search, selections, and confirmations to subcomponents.
 */
@Component({
  selector: 'app-booking-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ...AllSharedUi,
    BookingFormComponent,
    VehicleSelectionComponent,
    BookingConfirmComponent
  ],
  templateUrl: './booking-dialog.html',
  host: {
    class: 'block w-full h-full'
  }
})
export class BookingDialogComponent implements OnInit {
  private readonly dialogRef = inject(DialogRef);
  protected readonly store = inject(BookingStore);
  private readonly authService = inject(AuthService);

  readonly currentStep = signal<number>(1);
  readonly isConfirmed = signal(false);
  readonly bookingId = signal('');

  readonly currentUser = computed(() => {
    return this.authService.currentUser();
  });

  isMobile(): boolean {
    return window.innerWidth < 1024;
  }

  ngOnInit(): void {
    // Clear state when dialog opens
    this.store.clear();
    
    // Default dates
    const today = new Date();
    const cleanDateTimeStr = (dt: Date) => {
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      const hh = String(dt.getHours()).padStart(2, '0');
      const min = String(dt.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    };

    // Initialize store step 1 data with defaults
    const currentUserId = this.currentUser()?.userId || this.currentUser()?.user_id || null;
    const returnDate = new Date(today.getTime() + 2 * 60 * 60 * 1000);
    this.store.setStep1({
      depart: cleanDateTimeStr(today),
      returnTime: cleanDateTimeStr(returnDate),
      destination: '',
      purpose: '',
      booked_by: currentUserId,
      booked_for: currentUserId
    });
  }

  onStep1Success(): void {
    this.currentStep.set(2);
  }

  onStep2Success(): void {
    this.currentStep.set(3);
  }

  onStep2Back(): void {
    this.currentStep.set(1);
  }

  onStep3Confirmed(bookingId: string): void {
    this.bookingId.set(bookingId);
    this.isConfirmed.set(true);
  }

  onStep3Back(): void {
    this.currentStep.set(2);
  }

  onClose(): void {
    this.dialogRef.close();
  }

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
}
