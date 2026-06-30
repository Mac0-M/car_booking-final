import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../../../core/models/booking.model';
import { AllSharedUi } from '../../../../shared/shared';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-booking-card',
  standalone: true,
  imports: [CommonModule, ...AllSharedUi],
  templateUrl: './booking-card.html',
})
export class BookingCard {
  @Input() booking!: Booking;
  @Input() showPlateNumber = true;

  getBookingStatusVariant(booking: Booking): 'available' | 'pending' | 'booked' | 'unavailable' {
    if (booking.status === 'CANCELLED') return 'unavailable';
    if (booking.status === 'COMPLETED') return 'booked';

    const now = new Date();
    const cleanTime = (t: string) => {
      return new Date(t.replace(' ', 'T'));
    };

    const departTime = cleanTime(booking.depart || '');
    const returnTime = cleanTime(booking.return || '');

    if (now < departTime) {
      return 'available';
    } else {
      return 'pending';
    }
  }

  getBookingStatusLabel(booking: Booking): string {
    const state = this.getBookingStatusVariant(booking);
    if (state === 'available') return 'Upcoming';
    if (state === 'pending') return 'Ongoing';
    if (state === 'booked') return 'Completed';
    return 'Cancelled';
  }

  getVehicleImgUrl(vehicle: any): string {
    if (!vehicle || !vehicle.vehicleImg) {
      return '';
    }
    if (vehicle.vehicleImg.startsWith('http') || vehicle.vehicleImg.startsWith('blob:')) {
      return vehicle.vehicleImg;
    }
    const baseUrl = environment.apiUrl.replace('/api/v1', '');
    const imgPath = vehicle.vehicleImg.startsWith('/') ? vehicle.vehicleImg : `/${vehicle.vehicleImg}`;
    return `${baseUrl}${imgPath}`;
  }
}
