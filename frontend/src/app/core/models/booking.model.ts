import { Vehicle } from './vehicle.model';

/**
 * Booking Model: นิยามประเภทข้อมูลการจอง (Booking)
 */
export interface Booking {
  id: string;
  destination: string;
  purpose: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  userName: string;
  userPhone: string;
  vehicle: Vehicle | null;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  depart: string;
  return: string;
  booked_by?: number;
  booked_for?: number;

  bookedByUser?: any;
  bookedForUser?: any;

}
// cache trigger to force Angular watcher to reload Booking type

