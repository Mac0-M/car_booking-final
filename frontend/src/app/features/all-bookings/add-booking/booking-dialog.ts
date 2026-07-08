import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { AllSharedUi } from '../../../shared/shared';
import { BookingStore } from './state/booking.store';
import { AvailabilityService } from '../../../core/services/availability.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { BookingService } from '../../../core/services/booking.service';
import { User } from '../../../core/models/user.model';
import { Vehicle } from '../../../core/models/vehicle.model';
import { BookingDetailModal } from '../components/booking-detail-modal/booking-detail-modal';
import { VehicleCardComponent } from './pages/vehicle-selection/components/vehicle-card/vehicle-card';
import { NoVehicleAvailableComponent } from './pages/vehicle-selection/components/no-vehicle-available/no-vehicle-available';

@Component({
  selector: 'app-booking-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ...AllSharedUi,
    BookingDetailModal,
    VehicleCardComponent,
    NoVehicleAvailableComponent
  ],
  templateUrl: './booking-dialog.html',
  host: {
    class: 'block w-full h-full'
  }
})
export class BookingDialogComponent implements OnInit {
  private readonly dialogRef = inject(DialogRef);
  protected readonly store = inject(BookingStore);
  private readonly availabilityService = inject(AvailabilityService);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly bookingService = inject(BookingService);

  readonly currentStep = signal<number>(1);
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly isConfirmed = signal(false);
  readonly bookingId = signal('');
  readonly errorMessage = signal('');

  // Form Fields
  depart = '';
  returnTime = '';
  destination = '';
  purpose = '';
  booked_for: number | null = null;

  // Validation Errors
  departError = '';
  returnTimeError = '';
  destinationError = '';
  purposeError = '';
  bookedForError = '';

  readonly usersList = signal<User[]>([]);

  readonly currentUser = computed(() => {
    return this.authService.currentUser();
  });

  isMobile(): boolean {
    return window.innerWidth < 1024;
  }

  readonly filteredUsersList = computed(() => {
    const list = this.usersList();
    const curUser = this.currentUser();
    if (!curUser) return list.filter(u => u.role !== 'Super_Admin');
    if (curUser.role === 'User') {
      return list.filter(u => u.role !== 'Admin' && u.role !== 'Super_Admin');
    }
    return list.filter(u => u.role !== 'Super_Admin');
  });

  readonly vehicles = this.store.vehicles;

  ngOnInit(): void {
    // Clear state when dialog opens
    this.store.clear();

    // Load users list for selectors
    this.userService.findAll().subscribe({
      next: (users) => this.usersList.set(users),
      error: (err) => console.error('Error loading users:', err)
    });

    this.initializeFormDates();
  }

  private initializeFormDates(): void {
    const today = new Date();
    const cleanDateTimeStr = (dt: Date) => {
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      const hh = String(dt.getHours()).padStart(2, '0');
      const min = String(dt.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    };

    this.depart = cleanDateTimeStr(today);
    
    // Default return to +2 hours
    const returnDate = new Date(today.getTime() + 2 * 60 * 60 * 1000);
    this.returnTime = cleanDateTimeStr(returnDate);

    // Default user (who will use the car) to current user
    const currentUserId = this.currentUser()?.userId || this.currentUser()?.user_id || null;
    this.booked_for = currentUserId;
  }

  get isFormValid(): boolean {
    if (!this.depart || !this.returnTime) {
      return false;
    }
    const startMs = new Date(this.depart).getTime();
    const endMs = new Date(this.returnTime).getTime();
    return endMs > startMs;
  }

  validateForm(): boolean {
    let isValid = true;

    // Depart
    if (!this.depart) {
      this.departError = 'Departure date & time is required';
      isValid = false;
    } else {
      this.departError = '';
    }

    // Return
    if (!this.returnTime) {
      this.returnTimeError = 'Return date & time is required';
      isValid = false;
    } else {
      this.returnTimeError = '';
    }

    // Compare Depart and Return
    if (this.depart && this.returnTime) {
      const startMs = new Date(this.depart).getTime();
      const endMs = new Date(this.returnTime).getTime();
      const nowMs = new Date().getTime() - 60000; // Allow 1 minute buffer for present time

      if (startMs < nowMs) {
        this.departError = 'Departure time cannot be in the past';
        isValid = false;
      }

      if (endMs <= startMs) {
        this.returnTimeError = 'Return time must be after departure time';
        isValid = false;
      }
    }

    // Booked For
    if (!this.booked_for) {
      this.bookedForError = 'Passenger is required';
      isValid = false;
    } else {
      this.bookedForError = '';
    }

    return isValid;
  }

  onSearchVehicles(): void {
    if (!this.validateForm()) return;
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.availabilityService.search(this.depart, this.returnTime).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        const vehicles = res.data || res;
        const currentUserId = this.currentUser()?.userId || this.currentUser()?.user_id || null;
        
        this.store.setStep1({
          depart: this.depart,
          returnTime: this.returnTime,
          destination: this.destination,
          purpose: this.purpose,
          booked_by: currentUserId,
          booked_for: this.booked_for
        });
        this.store.setVehicles(vehicles);
        this.currentStep.set(2);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'An error occurred while checking vehicle availability. Please try again.');
        alert(this.errorMessage());
      }
    });
  }

  onSelectVehicle(vehicle: Vehicle): void {
    this.store.setSelectedVehicle(vehicle);
    this.currentStep.set(3);
  }

  onConfirmBooking(): void {
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
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        if (err.status === 409) {
          alert('This vehicle is already booked. Please select another vehicle.');
          
          // Re-fetch availability and update store
          this.availabilityService.search(
            this.store.depart(),
            this.store.returnTime()
          ).subscribe({
            next: (res: any) => {
              const vehicles = res.data || res;
              this.store.setVehicles(vehicles);
              this.currentStep.set(2);
            },
            error: () => {
              this.currentStep.set(2);
            }
          });
        } else {
          alert(err.error?.message || 'An error occurred while booking the vehicle. Please try again.');
        }
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onBackToStep1(): void {
    this.currentStep.set(1);
  }

  onBackToStep2(): void {
    this.currentStep.set(2);
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
