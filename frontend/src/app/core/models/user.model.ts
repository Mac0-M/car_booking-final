/**
 * User Model: นิยามประเภทข้อมูลผู้ใช้ (User)
 */
export interface User {
  userId: number;
  userName: string;
  email: string;
  phone: string;
  profileImg: string | null;
  totalBooked: number;
  role: 'User' | 'Admin' | 'Super_Admin';
  createAt: string;
  lastUpdate: string;
}
