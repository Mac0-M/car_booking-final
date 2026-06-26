import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vehicle } from '../models/vehicle.model';
import { environment } from '../../../environments/environment';

/**
 * AvailabilityService:
 * - จัดการดึงข้อมูลรถยนต์ที่ว่างตามเงื่อนไข วันที่ เวลา และความพร้อมของรถ
 * - ค้นหารถโดยการส่งคำขอไปยัง API `GET /vehicles/available`
 */
@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  search(depart: string, returnTime: string): Observable<Vehicle[]> {
    const departStr = depart.replace('T', ' ') + ':00';
    const returnStr = returnTime.replace('T', ' ') + ':00';

    return this.http.get<any>(`${this.apiUrl}/vehicles/available`, {
      params: {
        depart: departStr,
        return: returnStr
      }
    }).pipe(
      map(res => {
        const list = res.data || res || [];
        return list.map((vehicle: any) => ({
          id: String(vehicle.vehicle_id),
          plateNumber: vehicle.type || 'ไม่มี',
          model: vehicle.vehicle_name || 'รถยนต์ส่วนกลาง',
          vehicleTypeId: vehicle.type || 'Other',
          driverId: '',
          capacity: vehicle.capacity || 4,
          status: vehicle.status || 'available'
        }));
      })
    );
  }
}
