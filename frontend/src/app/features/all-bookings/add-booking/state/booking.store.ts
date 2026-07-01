import { Injectable, signal, computed } from '@angular/core';
import { Vehicle } from '../../../../core/models/vehicle.model';

export interface Step1Data {
  depart: string;
  returnTime: string;
  destination?: string;
  purpose?: string;
  booked_by?: number | null;
  booked_for?: number | null;

}

@Injectable({
  providedIn: 'root'
})
export class BookingStore {
  // State Signals
  readonly depart = signal<string>('');
  readonly returnTime = signal<string>('');
  readonly destination = signal<string>('');
  readonly purpose = signal<string>('');
  readonly booked_by = signal<number | null>(null);
  readonly booked_for = signal<number | null>(null);

  
  // Step 2 & 3 State Signals
  readonly vehicles = signal<Vehicle[]>([]);
  readonly selectedVehicle = signal<Vehicle | null>(null);

  // Backward compatibility computed signals
  readonly bookingDate = computed(() => this.depart().split('T')[0] || '');
  readonly startTime = computed(() => this.depart().split('T')[1] || '');
  readonly endTime = computed(() => this.returnTime().split('T')[1] || '');

  // Computed Properties for Validation
  readonly isStep1Valid = computed(() => {
    const dep = this.depart();
    const ret = this.returnTime();

    if (!dep || !ret) {
      return false;
    }

    const startMs = new Date(dep).getTime();
    const endMs = new Date(ret).getTime();
    return endMs > startMs;
  });

  // Actions
  setStep1(data: Step1Data): void {
    this.depart.set(data.depart);
    this.returnTime.set(data.returnTime);
    this.destination.set(data.destination || '');
    this.purpose.set(data.purpose || '');
    this.booked_by.set(data.booked_by || null);
    this.booked_for.set(data.booked_for || null);

  }

  setVehicles(vehicles: Vehicle[]): void {
    this.vehicles.set(vehicles);
  }

  setSelectedVehicle(vehicle: Vehicle | null): void {
    this.selectedVehicle.set(vehicle);
  }

  clear(): void {
    this.depart.set('');
    this.returnTime.set('');
    this.destination.set('');
    this.purpose.set('');
    this.booked_by.set(null);
    this.booked_for.set(null);

    this.vehicles.set([]);
    this.selectedVehicle.set(null);
  }
}
