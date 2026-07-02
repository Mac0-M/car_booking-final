import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogModule, Dialog } from '@angular/cdk/dialog';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { AllSharedUi } from '../../../../shared/shared';
import { environment } from '../../../../../environments/environment';
import { VehicleFormComponent } from '../vehicle-form/vehicle-form';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ...AllSharedUi],
  templateUrl: './vehicle-list.html',
})
export class VehicleListComponent implements OnInit {
  @Input() hideHeader = false;
  @Input() hideFilters = false;

  @Input() set searchQueryInput(val: string) {
    this.searchQuery.set(val);
    this.onFilterChange();
  }
  @Input() set selectedTypeInput(val: string) {
    this.selectedType.set(val);
    this.onFilterChange();
  }
  @Input() set selectedStatusInput(val: string) {
    this.selectedStatus.set(val);
    this.onFilterChange();
  }
  @Input() set selectedReFuelInput(val: string) {
    this.selectedReFuel.set(val);
    this.onFilterChange();
  }

  private readonly vehicleService = inject(VehicleService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);

  readonly vehicles = signal<Vehicle[]>([]);
  readonly isLoading = signal(false);

  openAddModal(): void {
    const dialogRef = this.dialog.open(VehicleFormComponent, {
      width: '672px',
      maxWidth: '95vw',
      backdropClass: ['bg-gray-900/60', 'backdrop-blur-sm', 'no-animation-backdrop'],
      panelClass: ['w-full', 'max-w-2xl', 'shadow-xl', 'rounded-2xl', 'overflow-hidden', 'no-animation-panel']
    });
    dialogRef.closed.subscribe(result => {
      if (result) {
        this.loadVehicles();
      }
    });
  }

  openEditModal(vehicleId: string): void {
    const dialogRef = this.dialog.open(VehicleFormComponent, {
      width: '672px',
      maxWidth: '95vw',
      backdropClass: ['bg-gray-900/60', 'backdrop-blur-sm', 'no-animation-backdrop'],
      panelClass: ['w-full', 'max-w-2xl', 'shadow-xl', 'rounded-2xl', 'overflow-hidden', 'no-animation-panel'],
      data: { id: vehicleId }
    });
    dialogRef.closed.subscribe(result => {
      if (result) {
        this.loadVehicles();
      }
    });
  }

  // Filters
  readonly selectedType = signal<string>('');
  readonly selectedStatus = signal<string>('');
  readonly selectedReFuel = signal<string>('');
  readonly searchQuery = signal<string>('');

  get isAdmin(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'Admin' || role === 'Super_Admin';
  }

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.isLoading.set(true);

    let reFuelParam: boolean | undefined = undefined;
    if (this.selectedReFuel() === 'true') {
      reFuelParam = true;
    } else if (this.selectedReFuel() === 'false') {
      reFuelParam = false;
    }

    const filters = {
      type: this.selectedType() || undefined,
      status: this.selectedStatus() || undefined,
      re_fuel: reFuelParam,
      search: this.searchQuery().trim() || undefined,
    };

    this.vehicleService.findAll(filters).subscribe({
      next: (res) => {
        this.vehicles.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.loadVehicles();
  }




  getVehicleImgUrl(vehicle: Vehicle): string {
    if (!vehicle.vehicleImg) {
      return '';
    }
    if (vehicle.vehicleImg.startsWith('http')) {
      return vehicle.vehicleImg;
    }
    const baseUrl = environment.apiUrl.replace('/api/v1', '');
    const imgPath = vehicle.vehicleImg.startsWith('/') ? vehicle.vehicleImg : `/${vehicle.vehicleImg}`;
    return `${baseUrl}${imgPath}`;
  }
}
