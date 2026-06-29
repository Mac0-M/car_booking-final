import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Booking } from '../models/booking.model';
import { environment } from '../../../environments/environment';

const parseDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return { date: '', time: '' };
  const clean = dateTimeStr.replace(' ', 'T');
  const dt = new Date(clean);
  if (isNaN(dt.getTime())) return { date: '', time: '' };
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const min = String(dt.getMinutes()).padStart(2, '0');
  return {
    date: `${yyyy}-${mm}-${dd}`,
    time: `${clean.split('T')[1]?.substring(0, 5) || (hh + ':' + min)}`
  };
};

const mapBooking = (b: any): Booking => {
  const departParsed = parseDateTime(b.depart);
  const returnParsed = parseDateTime(b.return);
  
  // Format userName to show booking details clearly
  let userNameStr = b.bookedForUser?.user_name || b.user?.user_name || 'N/A';
  if (b.bookedForUser && b.user && b.bookedForUser.user_id !== b.user.user_id) {
    userNameStr = `${b.bookedForUser.user_name} (booked by ${b.user.user_name})`;
  }

  return {
    id: String(b.book_id),
    destination: b.destination || '',
    purpose: b.use_for || '',
    bookingDate: departParsed.date,
    startTime: departParsed.time,
    endTime: returnParsed.time,
    depart: b.depart ? b.depart.replace(' ', 'T') : '',
    return: b.return ? b.return.replace(' ', 'T') : '',
    booked_by: b.booked_by,
    booked_for: b.booked_for,

    userName: userNameStr,
    userPhone: b.bookedForUser?.phone || b.user?.phone || 'N/A',
    bookedByUser: b.user,
    bookedForUser: b.bookedForUser,

    vehicle: b.vehicle ? {
      id: String(b.vehicle.vehicle_id),
      plateNumber: b.vehicle.type || 'None',
      model: b.vehicle.vehicle_name || 'Company Car',
      vehicleTypeId: b.vehicle.type || 'Other',
      driverId: '',
      capacity: b.vehicle.capacity || 4,
      status: b.vehicle.status || 'available',
      vehicleImg: b.vehicle.vehicle_img,
      reFuel: b.vehicle.re_fuel,
      totalMile: b.vehicle.total_mile,
      totalBookBy: b.vehicle.total_bookby
    } : null,
    status: b.status === 'booked' ? 'CONFIRMED' : (b.status === 'cancel' ? 'CANCELLED' : 'COMPLETED'),
    createdAt: b.create_at ? b.create_at.replace(' ', 'T') : ''
  };
};

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly bookingsList = signal<Booking[]>([]);
  readonly bookings = this.bookingsList.asReadonly();

  /**
   * Fetch bookings from backend with optional filters
   */
  fetchBookings(filter?: any): Observable<any> {
    // Clean up empty params
    const params: any = {};
    if (filter) {
      Object.keys(filter).forEach(key => {
        if (filter[key] !== undefined && filter[key] !== null && filter[key] !== '') {
          params[key] = filter[key];
        }
      });
    }

    return this.http.get<any>(`${this.apiUrl}/bookings`, { params }).pipe(
      tap(res => {
        const list = res.data || res || [];
        this.bookingsList.set(list.map((b: any) => mapBooking(b)));
      })
    );
  }

  /**
   * Fetch my bookings
   */
  fetchMyBookings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/bookings/my`).pipe(
      tap(res => {
        const list = res.data || res || [];
        this.bookingsList.set(list.map((b: any) => mapBooking(b)));
      })
    );
  }

  /**
   * Adds a new booking record to the backend
   */
  addBooking(bookingData: {
    vehicle_id: number;
    destination?: string;
    depart: string;
    return: string;
    purpose?: string;
    booked_by?: number;
    booked_for?: number;

  }): Observable<any> {
    const { purpose, ...rest } = bookingData;
    const payload = {
      ...rest,
      use_for: purpose
    };
    return this.http.post<any>(`${this.apiUrl}/bookings`, payload).pipe(
      tap(res => {
        const saved = res.data || res;
        this.bookingsList.update(current => [mapBooking(saved), ...current]);
      })
    );
  }

  /**
   * Cancels a booking by changing its status to CANCELLED on the backend
   */
  cancelBooking(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/bookings/${id}/cancel`, {}).pipe(
      tap(res => {
        const updated = res.data || res;
        this.bookingsList.update(current =>
          current.map(b => (b.id === id ? mapBooking(updated) : b))
        );
      })
    );
  }

  /**
   * Completes a booking by changing its status to COMPLETED and recording mile distance
   */
  completeBooking(id: string, mileDistance?: number): Observable<any> {
    const body = (mileDistance !== undefined && mileDistance !== null && mileDistance !== 0) 
      ? { mile_distance: Number(mileDistance) } 
      : {};
    return this.http.patch<any>(`${this.apiUrl}/bookings/${id}/complete`, body).pipe(
      tap(res => {
        const updated = res.data || res;
        this.bookingsList.update(current =>
          current.map(b => (b.id === id ? mapBooking(updated) : b))
        );
      })
    );
  }
}
