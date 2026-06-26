import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vehicle } from '../models/vehicle.model';
import { environment } from '../../../environments/environment';

const mapVehicle = (v: any): Vehicle => ({
  id: String(v.vehicle_id),
  plateNumber: v.type || 'ไม่มี',
  model: v.vehicle_name || 'รถยนต์ส่วนกลาง',
  vehicleTypeId: v.type || 'Other',
  driverId: '',
  capacity: v.capacity || 4,
  status: v.status || 'available',
  reFuel: !!v.re_fuel,
  totalMile: v.total_mile || 0,
  lastMaintenance: v.last_maintenance ? v.last_maintenance.replace(' ', 'T') : '',
  vehicleImg: v.vehicle_img,
  totalBookBy: v.total_bookby || 0,
  lastUpdate: v.last_update ? v.last_update.replace(' ', 'T') : ''
});

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /** ดึงรายการรถทั้งหมด พร้อม filter */
  findAll(filters?: { type?: string; status?: string; capacity?: number; search?: string; re_fuel?: boolean }): Observable<Vehicle[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const val = (filters as any)[key];
        if (val !== undefined && val !== null && val !== '') {
          params = params.set(key, String(val));
        }
      });
    }

    return this.http.get<any>(`${this.apiUrl}/vehicles`, { params }).pipe(
      map(res => {
        const list = res.data || res || [];
        return list.map((v: any) => mapVehicle(v));
      })
    );
  }

  /** ดึงรายละเอียดรถ */
  findById(id: string): Observable<Vehicle> {
    return this.http.get<any>(`${this.apiUrl}/vehicles/${id}`).pipe(
      map(res => mapVehicle(res.data || res))
    );
  }

  /** เพิ่มรถใหม่ (Admin) */
  create(dto: { vehicle_name: string; type: string; capacity: number; re_fuel: boolean; total_mile?: number; status?: string }): Observable<Vehicle> {
    return this.http.post<any>(`${this.apiUrl}/vehicles`, dto).pipe(
      map(res => mapVehicle(res.data || res))
    );
  }

  /** แก้ไขข้อมูลรถ (Admin) */
  update(id: string, dto: Partial<{ vehicle_name: string; type: string; capacity: number; re_fuel: boolean; total_mile?: number; status?: string }>): Observable<Vehicle> {
    return this.http.patch<any>(`${this.apiUrl}/vehicles/${id}`, dto).pipe(
      map(res => mapVehicle(res.data || res))
    );
  }

  /** ลบรถ (Admin) */
  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/vehicles/${id}`);
  }

  /** เปลี่ยนสถานะรถ (Admin) */
  updateStatus(id: string, status: 'available' | 'unavailable'): Observable<Vehicle> {
    return this.http.patch<any>(`${this.apiUrl}/vehicles/${id}/status`, { status }).pipe(
      map(res => mapVehicle(res.data || res))
    );
  }

  /** อัปโหลดรูปภาพรถ (Admin) */
  uploadImage(id: string, file: File): Observable<Vehicle> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<any>(`${this.apiUrl}/vehicles/${id}/image`, formData).pipe(
      map(res => mapVehicle(res.data || res))
    );
  }
}
