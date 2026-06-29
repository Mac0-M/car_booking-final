import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

const mapUser = (u: any): User => ({
  userId: u.user_id,
  userName: u.user_name || '',
  email: u.email || '',
  phone: u.phone || '',
  profileImg: u.profile_img,
  totalBooked: u.total_booked || 0,
  role: u.role || 'User',
  createAt: u.create_at ? u.create_at.replace(' ', 'T') : '',
  lastUpdate: u.last_update ? u.last_update.replace(' ', 'T') : ''
});

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /** ดึงรายชื่อผู้ใช้ทั้งหมด (Admin) */
  findAll(): Observable<User[]> {
    return this.http.get<any>(`${this.apiUrl}/users`).pipe(
      map(res => {
        const list = res.data || res || [];
        return list.map((u: any) => mapUser(u));
      })
    );
  }

  /** สร้างผู้ใช้ใหม่ (Admin/Super Admin) */
  create(data: any): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/users`, data).pipe(
      map(res => mapUser(res.data || res))
    );
  }

  /** ดึงข้อมูลผู้ใช้ตาม ID */
  findById(id: number): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/users/${id}`).pipe(
      map(res => mapUser(res.data || res))
    );
  }

  /** แก้ไขข้อมูลผู้ใช้ */
  update(id: number, data: Partial<{ user_name: string; phone: string; email: string; password?: string }>): Observable<User> {
    return this.http.patch<any>(`${this.apiUrl}/users/${id}`, data).pipe(
      map(res => mapUser(res.data || res))
    );
  }

  /** ลบผู้ใช้ (Super Admin) */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/${id}`);
  }

  /** เปลี่ยน role ของผู้ใช้ (Super Admin) */
  updateRole(id: number, role: string): Observable<User> {
    return this.http.patch<any>(`${this.apiUrl}/users/${id}/role`, { role }).pipe(
      map(res => mapUser(res.data || res))
    );
  }

  /** อัปโหลดรูปโปรไฟล์ */
  uploadProfileImage(id: number, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<any>(`${this.apiUrl}/users/${id}/profile-image`, formData).pipe(
      map(res => mapUser(res.data || res))
    );
  }
}
