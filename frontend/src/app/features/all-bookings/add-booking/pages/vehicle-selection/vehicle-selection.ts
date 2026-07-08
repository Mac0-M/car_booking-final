import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Vehicle } from '../../../../../core/models/vehicle.model';
import { VehicleCardComponent } from './components/vehicle-card/vehicle-card';
import { NoVehicleAvailableComponent } from './components/no-vehicle-available/no-vehicle-available';
import { BookingStore } from '../../state/booking.store';
import { AllSharedUi } from '../../../../../shared/shared';

/**
 * VehicleSelectionComponent: หน้าจอเลือกรถที่ตรงกับเงื่อนไขการจองและว่างงาน (Step 2)
 * - ดึงข้อมูลรถที่ว่างและแสดงเป็นรายการจาก Backend
 * - แสดงกล่อง Empty State เมื่อตรวจไม่พบรถว่างในช่วงเวลานั้น
 */
@Component({
  selector: 'app-vehicle-selection',
  standalone: true,
  imports: [VehicleCardComponent, NoVehicleAvailableComponent, ...AllSharedUi],
  templateUrl: './vehicle-selection.html',
})
export class VehicleSelectionComponent {
  protected readonly store = inject(BookingStore);
  readonly vehicles = this.store.vehicles;
  readonly isLoading = signal(false);

  constructor(private router: Router) {}

  onSelectVehicle(vehicle: Vehicle): void {
    console.log('Selected vehicle:', vehicle);
    this.store.setSelectedVehicle(vehicle);
    this.router.navigate(['/booking/confirm']);
  }

  onGoBack(): void {
    this.router.navigate(['/booking/form']);
  }
}
