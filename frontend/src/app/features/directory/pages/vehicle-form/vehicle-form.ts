import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { AllSharedUi } from '../../../../shared/shared';
import { environment } from '../../../../../environments/environment';
import { LanguageService } from '../../../../core/services/language.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi],
  templateUrl: './vehicle-form.html',
  styles: [`
    :host ::ng-deep component-button.h-10 button {
      height: 40px;
    }
  `],
  host: {
    class: 'block w-full h-full'
  }
})
export class VehicleFormComponent implements OnInit {
  private readonly vehicleService = inject(VehicleService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly dialogRef = inject(DialogRef, { optional: true });
  private readonly dialogData = inject(DIALOG_DATA, { optional: true }) as { id?: string } | null;
  private readonly langService = inject(LanguageService);
  private readonly toast = inject(ToastService);

  get isDialog(): boolean {
    return !!this.dialogRef;
  }

  vehicleId: string | null = null;
  isEditMode = false;
  isLoading = signal(false);

  // Form Fields
  vehicle_name = '';
  type = 'Sedan';
  capacity = 4;
  re_fuel = false; // changed to boolean
  total_mile = 0;
  status = 'available';

  // Image Upload
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  existingImgUrl: string | null = null;

  ngOnInit(): void {
    if (this.dialogData?.id) {
      this.vehicleId = this.dialogData.id;
      this.isEditMode = true;
      this.loadVehicle(this.dialogData.id);
    } else {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.vehicleId = id;
          this.isEditMode = true;
          this.loadVehicle(id);
        }
      });
    }
  }

  loadVehicle(id: string): void {
    this.isLoading.set(true);
    this.vehicleService.findById(id).subscribe({
      next: (vehicle) => {
        this.vehicle_name = vehicle.model;
        this.type = vehicle.vehicleTypeId;
        this.capacity = vehicle.capacity;
        this.re_fuel = !!vehicle.reFuel;
        this.total_mile = vehicle.totalMile || 0;
        this.status = vehicle.status || 'available';
        
        if (vehicle.vehicleImg) {
          if (vehicle.vehicleImg.startsWith('http')) {
            this.existingImgUrl = vehicle.vehicleImg;
          } else {
            const baseUrl = environment.apiUrl.replace('/api/v1', '');
            const imgPath = vehicle.vehicleImg.startsWith('/') ? vehicle.vehicleImg : `/${vehicle.vehicleImg}`;
            this.existingImgUrl = `${baseUrl}${imgPath}`;
          }
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toast.error(this.langService.translate('Requested vehicle not found.'));
        this.closeForm();
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile = file;
      this.imagePreviewUrl = URL.createObjectURL(file);
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (['-', '.', 'e', '+'].includes(event.key)) {
      event.preventDefault();
    }
  }

  get isFormValid(): boolean {
    const isCapacityValid = this.capacity > 0 && Number.isInteger(Number(this.capacity));
    const isMileValid = this.total_mile >= 0 && Number.isInteger(Number(this.total_mile));
    return !!this.vehicle_name.trim() && !!this.type && isCapacityValid && isMileValid;
  }

  onSubmit(): void {
    if (!this.isFormValid || this.isLoading()) return;

    if (!Number.isInteger(Number(this.capacity)) || Number(this.capacity) <= 0) {
      this.toast.warning(this.langService.translate("Please enter a valid whole number for capacity."));
      return;
    }
    if (!Number.isInteger(Number(this.total_mile)) || Number(this.total_mile) < 0) {
      this.toast.warning(this.langService.translate("Please enter a valid whole number for mileage."));
      return;
    }

    this.isLoading.set(true);
    const dto = {
      vehicle_name: this.vehicle_name.trim(),
      type: this.type,
      capacity: Number(this.capacity),
      re_fuel: this.re_fuel,
      total_mile: Number(this.total_mile),
      status: this.status
    };

    if (this.isEditMode && this.vehicleId) {
      this.vehicleService.update(this.vehicleId, dto).subscribe({
        next: (updated) => {
          if (this.selectedFile && this.vehicleId) {
            this.uploadVehicleImage(this.vehicleId);
          } else {
            this.isLoading.set(false);
            this.onActionSuccess();
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.toast.error(this.langService.translate(err.error?.message || 'An error occurred while saving the vehicle data.'));
        }
      });
    } else {
      this.vehicleService.create(dto).subscribe({
        next: (created) => {
          if (this.selectedFile && created.id) {
            this.uploadVehicleImage(created.id);
          } else {
            this.isLoading.set(false);
            this.onActionSuccess();
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.toast.error(this.langService.translate(err.error?.message || 'An error occurred while registering the new vehicle.'));
        }
      });
    }
  }

  deleteVehicle(): void {
    if (!this.vehicleId) return;
    if (confirm(this.langService.translate('Are you sure you want to delete this vehicle from the system?'))) {
      this.isLoading.set(true);
      this.vehicleService.delete(this.vehicleId).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toast.error(this.langService.translate('Vehicle deleted successfully.'));
          if (this.dialogRef) {
            this.dialogRef.close(true);
          } else {
            this.router.navigate(['/vehicles']);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.toast.error(this.langService.translate(err.error?.message || 'An error occurred while deleting the vehicle.'));
        }
      });
    }
  }

  closeForm(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.router.navigate(['/vehicles']);
    }
  }

  private onActionSuccess(): void {
    const msg = this.isEditMode ? 'Vehicle updated successfully.' : 'Vehicle added successfully.';
    if (this.isEditMode) {
      this.toast.warning(this.langService.translate(msg));
    } else {
      this.toast.success(this.langService.translate(msg));
    }
    if (this.dialogRef) {
      this.dialogRef.close(true);
    } else {
      this.router.navigate(['/vehicles']);
    }
  }

  private uploadVehicleImage(id: string): void {
    if (!this.selectedFile) return;

    this.vehicleService.uploadImage(id, this.selectedFile).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.onActionSuccess();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toast.warning(this.langService.translate(err.error?.message || 'Vehicle details saved successfully, but image upload failed.'));
        this.onActionSuccess();
      }
    });
  }
}
