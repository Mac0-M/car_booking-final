import { Component, Output, EventEmitter } from '@angular/core';
import { ComponentEmptyState } from '../../../../../../../shared/components/empty-state/empty-state';

/**
 * NoVehicleAvailableComponent: แสดงผลเมื่อไม่พบรถยนต์ว่างในช่วงเวลาและเงื่อนไขที่เลือก
 * - ใช้ shared ComponentEmptyState เพื่อลด code ซ้ำ
 */
@Component({
  selector: 'app-no-vehicle-available',
  standalone: true,
  imports: [ComponentEmptyState],
  templateUrl: './no-vehicle-available.html'
})
export class NoVehicleAvailableComponent {
  @Output() goBack = new EventEmitter<void>();

  onGoBack(): void {
    this.goBack.emit();
  }
}
