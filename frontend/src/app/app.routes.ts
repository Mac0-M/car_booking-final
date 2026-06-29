import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { bookingStepGuard } from './core/guards/booking-step.guard';
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
    path: 'booking',
    canActivate: [authGuard],
    children: [
      {
        path: 'form',
        title: 'Booking',
        loadComponent: () =>
          import('./features/booking/pages/booking-form/booking-form').then(
            (m) => m.BookingFormComponent
          ),
      },
      {
        path: 'select-vehicle',
        title: 'Booking',
        canActivate: [bookingStepGuard],
        loadComponent: () =>
          import('./features/booking/pages/vehicle-selection/vehicle-selection').then(
            (m) => m.VehicleSelectionComponent
          ),
      },
      {
        path: 'confirm',
        title: 'Confirm-Booking',
        canActivate: [bookingStepGuard],
        loadComponent: () =>
          import('./features/booking/pages/booking-confirm/booking-confirm').then(
            (m) => m.BookingConfirmComponent
          ),
      },
    ],
  },
  {
    path: 'bookings',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        title: 'All-Bookings',
        loadComponent: () =>
          import('./features/all-bookings/pages/booking-list/booking-list').then(
            (m) => m.BookingList
          ),
      },
      {
        path: 'history',
        title: 'Booking History',
        loadComponent: () =>
          import('./features/all-bookings/pages/booking-history/booking-history').then(
            (m) => m.BookingHistoryComponent
          ),
      }
    ]
  },
  {
    path: 'vehicles',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        title: 'All Vehicles',
        loadComponent: () =>
          import('./features/vehicles/pages/vehicle-list/vehicle-list').then(
            (m) => m.VehicleListComponent
          ),
      },
      {
        path: 'new',
        title: 'New Vehicle',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/vehicles/pages/vehicle-form/vehicle-form').then(
            (m) => m.VehicleFormComponent
          ),
      },
      {
        path: ':id/edit',
        title: 'Edit Vehicle',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/vehicles/pages/vehicle-form/vehicle-form').then(
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
        title: 'All-Users',
        loadComponent: () =>
          import('./features/admin/pages/user-list/user-list').then(
            (m) => m.UserListComponent
          ),
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
