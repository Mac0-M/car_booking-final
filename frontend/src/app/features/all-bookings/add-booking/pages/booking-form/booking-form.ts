import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AllSharedUi } from '../../../../../shared/shared';
import { BookingStore } from '../../state/booking.store';
import { AvailabilityService } from '../../../../../core/services/availability.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { UserService } from '../../../../../core/services/user.service';
import { User } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ...AllSharedUi
  ],
  templateUrl: './booking-form.html'
})
export class BookingFormComponent implements OnInit {
  private readonly store = inject(BookingStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly availabilityService = inject(AvailabilityService);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  // Form Fields
  depart = '';
  returnTime = '';
  destination = '';
  purpose = '';
  
  booked_for: number | null = null;


  readonly usersList = signal<User[]>([]);

  readonly filteredUsersList = computed(() => {
    const list = this.usersList();
    const currentUser = this.authService.currentUser();
    if (!currentUser) return list.filter(u => u.role !== 'Super_Admin');
    if (currentUser.role === 'User') {
      return list.filter(u => u.role !== 'Admin' && u.role !== 'Super_Admin');
    }
    return list.filter(u => u.role !== 'Super_Admin');
  });
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  // Phone overlay variables
  readonly showPhoneOverlay = signal(false);
  phoneInput = '';
  phoneError = '';

  ngOnInit(): void {
    // Load users list for selectors
    this.userService.findAll().subscribe({
      next: (users) => this.usersList.set(users),
      error: (err) => console.error('Error loading users:', err)
    });

    this.initializeFormFromStore();

    this.route.queryParams.subscribe(params => {
      if (params['start']) {
        // start datetime parameter from calendar click/drag (format: YYYY-MM-DDTHH:mm)
        this.depart = params['start'].substring(0, 16);
      }
      if (params['end']) {
        this.returnTime = params['end'].substring(0, 16);
      }
      if (params['requirePhone'] === 'true') {
        this.showPhoneOverlay.set(true);
      }
    });
  }

  private initializeFormFromStore(): void {
    const storeDepart = this.store.depart();
    const storeReturn = this.store.returnTime();
    const storeDest = this.store.destination();
    const storePurp = this.store.purpose();
    const storeBookedBy = this.store.booked_by();


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

    this.depart = storeDepart || cleanDateTimeStr(today);
    
    // Default return to +2 hours
    const returnDate = new Date(today.getTime() + 2 * 60 * 60 * 1000);
    this.returnTime = storeReturn || cleanDateTimeStr(returnDate);

    this.destination = storeDest || '';
    this.purpose = storePurp || '';

    // Default user (who will use the car) to current user
    const currentUserId = this.authService.currentUser()?.userId || this.authService.currentUser()?.user_id || null;
    const storeBookedFor = this.store.booked_for();
    this.booked_for = storeBookedFor || storeBookedBy || currentUserId;
    

  }

  get isFormValid(): boolean {
    if (!this.depart || !this.returnTime) {
      return false;
    }
    const startMs = new Date(this.depart).getTime();
    const endMs = new Date(this.returnTime).getTime();
    return endMs > startMs;
  }

  onSubmit(): void {
    if (!this.isFormValid || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.availabilityService.search(this.depart, this.returnTime).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        const vehicles = res.data || res;
        const currentUserId = this.authService.currentUser()?.userId || this.authService.currentUser()?.user_id || null;
        this.store.setStep1({
          depart: this.depart,
          returnTime: this.returnTime,
          destination: this.destination,
          purpose: this.purpose,
          booked_by: currentUserId,
          booked_for: this.booked_for
        });
        this.store.setVehicles(vehicles);
        this.router.navigate(['/booking/select-vehicle']);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'An error occurred while checking vehicle availability. Please try again.');
        alert(this.errorMessage());
      }
    });
  }



  submitPhone(): void {
    if (!this.phoneInput) {
      this.phoneError = 'Phone number is required.';
      return;
    }
    if (this.phoneInput.length !== 10 || !/^\d+$/.test(this.phoneInput)) {
      this.phoneError = 'Phone number must be 10 digits.';
      return;
    }
    this.phoneError = '';
    
    this.authService.updatePhone(this.phoneInput).subscribe({
      next: () => {
        this.showPhoneOverlay.set(false);
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { requirePhone: null },
          queryParamsHandling: 'merge'
        });
      },
      error: (err: any) => {
        alert(err.error?.message || 'An error occurred while saving phone number.');
      }
    });
  }
}
