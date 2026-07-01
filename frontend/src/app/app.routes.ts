import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

/**
 * appRoutes: การตั้งค่าเส้นทางหลักของทั้งแอปพลิเคชัน
 * - จัดการ Lazy Loading สำหรับ Feature Modules ต่างๆ
 * - ควบคุมการเปลี่ยนเส้นทางเริ่มต้น (Redirect) กรณีระบุ URL ไม่ตรง
 */
export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        title: 'Login',
        loadComponent: () =>  
          import('./features/auth/pages/login/login').then(
            (m) => m.LoginComponent
          ),
      },
    ],
  },
  {
    path: 'bookings',
    canActivate: [authGuard],
    title: 'Bookings Dashboard',
    loadComponent: () =>
      import('./features/all-bookings/pages/booking-list/booking-list').then(
        (m) => m.BookingList
      ),
  },
  {
    path: 'bookings/history',
    redirectTo: 'bookings',
    pathMatch: 'full'
  },
  {
    path: 'directory',
    canActivate: [authGuard],
    title: 'Directory & Management',
    loadComponent: () =>
      import('./features/directory/pages/directory/directory').then(
        (m) => m.DirectoryComponent
      ),
  },
  {
    path: 'vehicles',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: '/directory',
        pathMatch: 'full'
      },
      {
        path: 'new',
        title: 'New Vehicle',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/directory/pages/vehicle-form/vehicle-form').then(
            (m) => m.VehicleFormComponent
          ),
      },
      {
        path: ':id/edit',
        title: 'Edit Vehicle',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/directory/pages/vehicle-form/vehicle-form').then(
            (m) => m.VehicleFormComponent
          ),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: 'users',
        redirectTo: '/directory',
        pathMatch: 'full'
      },
    ],
  },
  {
    path: 'profile',
    title: 'Profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/pages/profile-edit/profile-edit').then(
        (m) => m.ProfileEditComponent
      ),
  },
  {
    path: '',
    redirectTo: 'bookings',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'bookings',
  },
];
