import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { AllSharedUi } from '../../../../shared/shared';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi],
  templateUrl: './user-list.html',
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);

  readonly users = signal<User[]>([]);
  readonly isLoading = signal(false);

  get currentUserRole(): string {
    return this.authService.currentUser()?.role || 'User';
  }

  get isSuperAdmin(): boolean {
    return this.currentUserRole === 'Super_Admin';
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.userService.findAll().subscribe({
      next: (res) => {
        this.users.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  changeRole(user: User, newRole: string): void {
    if (!this.isSuperAdmin) {
      alert('Only Super Admin can change user roles.');
      return;
    }

    if (confirm(`Are you sure you want to change the role of ${user.userName} to ${newRole}?`)) {
      this.userService.updateRole(user.userId, newRole).subscribe({
        next: (updated) => {
          this.users.update(current =>
            current.map(u => u.userId === user.userId ? { ...u, role: updated.role } : u)
          );
        },
        error: (err) => {
          alert(err.error?.message || 'An error occurred while changing the user role.');
          // Reload users to revert select state
          this.loadUsers();
        }
      });
    } else {
      // Reload users to revert select state
      this.loadUsers();
    }
  }

  deleteUser(userId: number): void {
    if (!this.isSuperAdmin) {
      alert('Only Super Admin can delete users.');
      return;
    }

    if (confirm('Are you sure you want to delete this user from the system?')) {
      this.userService.delete(userId).subscribe({
        next: () => {
          this.users.update(current => current.filter(u => u.userId !== userId));
        },
        error: (err) => {
          alert(err.error?.message || 'An error occurred while deleting the user.');
        }
      });
    }
  }

  getProfileImgUrl(user: User): string {
    if (!user.profileImg) {
      return '';
    }
    if (user.profileImg.startsWith('http')) {
      return user.profileImg;
    }
    const baseUrl = environment.apiUrl.replace('/api/v1', '');
    const imgPath = user.profileImg.startsWith('/') ? user.profileImg : `/${user.profileImg}`;
    return `${baseUrl}${imgPath}`;
  }
}
