import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { AllSharedUi } from '../../../../shared/shared';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ...AllSharedUi],
  templateUrl: './vehicle-form.html',
})
export class VehicleFormComponent implements OnInit {
  private readonly vehicleService = inject(VehicleService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.vehicleId = id;
        this.isEditMode = true;
        this.loadVehicle(id);
      }
    });
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
        alert('ไม่พบข้อมูลรถยนต์ที่ต้องการแก้ไข');
        this.router.navigate(['/vehicles']);
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

  get isFormValid(): boolean {
    return !!this.vehicle_name.trim() && !!this.type && this.capacity > 0 && this.total_mile >= 0;
  }

  onSubmit(): void {
    if (!this.isFormValid || this.isLoading()) return;

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
            this.router.navigate(['/vehicles']);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          alert(err.error?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
      });
    } else {
      this.vehicleService.create(dto).subscribe({
        next: (created) => {
          if (this.selectedFile && created.id) {
            this.uploadVehicleImage(created.id);
          } else {
            this.isLoading.set(false);
            this.router.navigate(['/vehicles']);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          alert(err.error?.message || 'เกิดข้อผิดพลาดในการสร้างรถยนต์ใหม่');
        }
      });
    }
  }

  private uploadVehicleImage(id: string): void {
    if (!this.selectedFile) return;

    this.vehicleService.uploadImage(id, this.selectedFile).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/vehicles']);
      },
      error: (err) => {
        this.isLoading.set(false);
        alert(err.error?.message || 'บันทึกข้อมูลสำเร็จ แต่อัปโหลดรูปภาพไม่สำเร็จ');
        this.router.navigate(['/vehicles']);
      }
    });
  }
}
