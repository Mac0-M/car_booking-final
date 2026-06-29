import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vehicle } from '../../../../../../core/models/vehicle.model';
import { AllSharedUi } from '../../../../../../shared/shared';
import { VehicleCardComponent } from '../../../../../booking/pages/vehicle-selection/components/vehicle-card/vehicle-card';
import { AuthService } from '../../../../../../core/services/auth.service';

@Component({
  selector: 'app-booking-detail-modal',
  standalone: true,
  imports: [CommonModule, ...AllSharedUi, VehicleCardComponent],
  templateUrl: './booking-detail-modal.html',
})
export class BookingDetailModal {
  private readonly authService = inject(AuthService);

  @Input() bookingDate = '';
  @Input() startTime = '';
  @Input() endTime = '';
  @Input() destination = '';
  @Input() purpose = '';
  @Input() userName = '';
  @Input() userPhone = '';
  @Input() vehicle: Vehicle | null = null;
  @Input() status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' = 'CONFIRMED';

  @Input() depart = '';
  @Input() returnTime = '';
  @Input() bookedByUser: any = null;
  @Input() bookedForUser: any = null;


  // Modal Configuration
  @Input() title = '';
  @Input() description = '';
  @Input() isModal = false;
  @Input() isOpen = false;

  @Output() close = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() complete = new EventEmitter<number>();

  readonly showMileInput = signal(false);
  readonly mileDistanceValue = signal<string>('');

  get isAdmin(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'Admin' || role === 'Super_Admin';
  }

  get canManage(): boolean {
    if (this.isAdmin) return true;
    const currentUserId = this.authService.currentUser()?.userId || this.authService.currentUser()?.user_id;
    if (!currentUserId) return false;
    return this.bookedByUser?.user_id === currentUserId || this.bookedForUser?.user_id === currentUserId;
  }

  onCompleteClick(): void {
    this.showMileInput.set(true);
  }

  confirmComplete(): void {
    const rawVal = this.mileDistanceValue().trim();
    if (rawVal === '') {
      this.complete.emit(0);
      this.showMileInput.set(false);
      this.mileDistanceValue.set('');
      return;
    }
    const val = Number(rawVal);
    if (isNaN(val) || val < 0) {
      alert('Please enter a distance value greater than or equal to 0.');
      return;
    }
    this.complete.emit(val);
    this.showMileInput.set(false);
    this.mileDistanceValue.set('');
  }

  cancelComplete(): void {
    this.showMileInput.set(false);
    this.mileDistanceValue.set('');
  }

  get totalDuration(): string {
    const startStr = this.depart || '';
    const endStr = this.returnTime || '';

    if (startStr && endStr) {
      const cleanStart = startStr.replace(' ', 'T');
      const cleanEnd = endStr.replace(' ', 'T');
      const diffMs = new Date(cleanEnd).getTime() - new Date(cleanStart).getTime();
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
    }

    if (!this.startTime || !this.endTime) return '';

    const [startH, startM] = this.startTime.split(':').map(Number);
    const [endH, endM] = this.endTime.split(':').map(Number);

    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return '';

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const diffMinutes = endMinutes - startMinutes;
    if (diffMinutes <= 0) return '';

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
  }
}

