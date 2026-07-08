import { Component, OnInit, inject, signal, computed, ViewChild, TemplateRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { AllSharedUi } from '../../../../shared/shared';
import { environment } from '../../../../../environments/environment';
import { DialogModule, Dialog, DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ...AllSharedUi],
  templateUrl: './user-list.html',
})
export class UserListComponent implements OnInit {
  @Input() hideHeader = false;

  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(Dialog);

  @ViewChild('addDialogTemplate') addDialogTemplate!: TemplateRef<any>;
  private dialogRef: DialogRef<any> | null = null;

  readonly users = signal<User[]>([]);
  readonly isLoading = signal(false);

  // Add User Modal State
  readonly isSaving = signal(false);

  // Form Fields
  newUserName = '';
  newUserEmail = '';
  newUserPassword = '';
  newUserPhone = '';

  // Validation Errors
  nameError = '';
  emailError = '';
  passwordError = '';
  phoneError = '';

  get currentUserRole(): string {
    return this.authService.currentUser()?.role || 'User';
  }

  get isSuperAdmin(): boolean {
    return this.currentUserRole === 'Super_Admin';
  }

  get isAdmin(): boolean {
    return this.currentUserRole === 'Admin' || this.currentUserRole === 'Super_Admin';
  }

  canDelete(user: User): boolean {
    const currentUserId = this.authService.currentUser()?.userId || this.authService.currentUser()?.user_id;
    if (user.userId === currentUserId) return false; // Cannot delete self
    if (this.isSuperAdmin) {
      return user.role !== 'Super_Admin';
    }
    if (this.currentUserRole === 'Admin') {
      return user.role === 'User';
    }
    return false;
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

  deleteUser(userId: number): void {
    const user = this.users().find(u => u.userId === userId);
    if (!user || !this.canDelete(user)) {
      alert('You do not have permission to delete this user.');
      return;
    }

    if (confirm(`Are you sure you want to delete ${user.userName} from the system?`)) {
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

  openAddModal(): void {
    this.newUserName = '';
    this.newUserEmail = '';
    this.newUserPassword = '';
    this.newUserPhone = '';
    this.nameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.phoneError = '';
    
    this.dialogRef = this.dialog.open(this.addDialogTemplate, {
      width: '448px',
      maxWidth: '95vw',
      backdropClass: ['bg-gray-900/60', 'backdrop-blur-sm', 'animate-backdrop-fade'],
      panelClass: ['w-full', 'max-w-md', 'shadow-xl', 'rounded-2xl', 'overflow-hidden', 'animate-modal-zoom']
    });

    this.dialogRef.closed.subscribe(() => {
      this.dialogRef = null;
    });
  }

  closeAddModal(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /** Validate form — same rules as login page */
  validateAddForm(): boolean {
    let isValid = true;

    // Name
    if (!this.newUserName.trim()) {
      this.nameError = 'Name is required';
      isValid = false;
    } else {
      this.nameError = '';
    }

    // Email — same as login
    if (!this.newUserEmail.trim()) {
      this.emailError = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.newUserEmail.trim())) {
      this.emailError = 'Please enter a valid email address';
      isValid = false;
    } else {
      this.emailError = '';
    }

    // Password — same as login (min 6 chars)
    if (!this.newUserPassword.trim()) {
      this.passwordError = 'Password is required';
      isValid = false;
    } else if (this.newUserPassword.trim().length < 6) {
      this.passwordError = 'Password must be at least 6 characters long';
      isValid = false;
    } else {
      this.passwordError = '';
    }

    // Phone
    if (!this.newUserPhone.trim()) {
      this.phoneError = 'Phone number is required';
      isValid = false;
    } else if (this.newUserPhone.trim().length !== 10) {
      this.phoneError = 'Phone number must be 10 digits';
      isValid = false;
    } else {
      this.phoneError = '';
    }

    return isValid;
  }

  createUserSubmit(): void {
    if (!this.validateAddForm() || this.isSaving()) return;

    this.isSaving.set(true);
    const payload = {
      user_name: this.newUserName.trim(),
      email: this.newUserEmail.trim(),
      password: this.newUserPassword.trim(),
      phone: this.newUserPhone.trim()
    };

    this.userService.create(payload).subscribe({
      next: (createdUser) => {
        this.isSaving.set(false);
        this.closeAddModal();
        this.users.update(current => [createdUser, ...current]);
        alert('User registered successfully.');
      },
      error: (err) => {
        this.isSaving.set(false);
        alert(err.error?.message || 'An error occurred while creating the user.');
      }
    });
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
