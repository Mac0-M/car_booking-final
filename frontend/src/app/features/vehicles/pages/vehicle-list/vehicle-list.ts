import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { AllSharedUi } from '../../../../shared/shared';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ...AllSharedUi],
  templateUrl: './vehicle-list.html',
})
export class VehicleListComponent implements OnInit {
  private readonly vehicleService = inject(VehicleService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly vehicles = signal<Vehicle[]>([]);
  readonly isLoading = signal(false);

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



  deleteVehicle(id: string): void {
    if (confirm('Are you sure you want to delete this vehicle from the system?')) {
      this.vehicleService.delete(id).subscribe({
        next: () => {
          this.vehicles.update(current => current.filter(v => v.id !== id));
        },
        error: (err) => {
          alert(err.error?.message || 'An error occurred while deleting the vehicle.');
        }
      });
    }
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
