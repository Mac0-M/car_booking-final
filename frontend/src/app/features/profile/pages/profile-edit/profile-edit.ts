import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { AllSharedUi } from '../../../../shared/shared';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi],
  templateUrl: './profile-edit.html',
})
export class ProfileEditComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly location = inject(Location);

  readonly isLoading = signal(false);
  readonly isEditing = signal(false); // Controls view-only vs edit mode

  // Form Fields
  userId: number | null = null;
  user_name = '';
  phone = '';
  email = '';
  role = 'User';
  newPassword = '';

  // Avatar Image Upload
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  existingImgUrl: string | null = null;

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.populateForm(user);
    }

    // Refresh profile from API to get the latest database values
    this.isLoading.set(true);
    this.authService.getProfile().subscribe({
      next: (latestUser) => {
        this.populateForm(latestUser);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  private populateForm(user: any): void {
    this.userId = user.userId || user.user_id;
    this.user_name = user.userName || user.name || user.user_name || '';
    this.phone = user.phone || '';
    this.email = user.email || '';
    this.role = user.role || 'User';
    
    const profileImg = user.profileImg || user.profile_image || user.profile_img;
    if (profileImg) {
      if (profileImg.startsWith('http')) {
        this.existingImgUrl = profileImg;
      } else {
        const baseUrl = environment.apiUrl.replace('/api/v1', '');
        const imgPath = profileImg.startsWith('/') ? profileImg : `/${profileImg}`;
        this.existingImgUrl = `${baseUrl}${imgPath}`;
      }
    } else {
      this.existingImgUrl = null;
    }
  }

  onFileSelected(event: Event): void {
    if (!this.isEditing()) return;
    
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile = file;
      this.imagePreviewUrl = URL.createObjectURL(file);
    }
  }

  get isFormValid(): boolean {
    const isBasicValid = !!this.user_name.trim() && !!this.email.trim();
    if (this.newPassword.trim() && this.newPassword.trim().length < 6) {
      return false;
    }
    return isBasicValid;
  }

  onSubmit(): void {
    if (!this.isEditing() || !this.isFormValid || !this.userId || this.isLoading()) return;

    this.isLoading.set(true);
    const updateData: any = {
      user_name: this.user_name.trim(),
      phone: this.phone.trim(),
      email: this.email.trim(),
    };

    if (this.newPassword.trim()) {
      updateData.password = this.newPassword.trim();
    }

    this.userService.update(this.userId, updateData).subscribe({
      next: () => {
        if (this.selectedFile && this.userId) {
          this.uploadProfileImage(this.userId);
        } else {
          this.refreshSession();
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        alert(err.error?.message || 'An error occurred while saving profile data.');
      }
    });
  }

  private uploadProfileImage(id: number): void {
    if (!this.selectedFile) return;

    this.userService.uploadProfileImage(id, this.selectedFile).subscribe({
      next: () => {
        this.selectedFile = null;
        this.imagePreviewUrl = null;
        this.refreshSession();
      },
      error: (err) => {
        this.isLoading.set(false);
        alert(err.error?.message || 'Profile saved successfully, but avatar image upload failed.');
        this.refreshSession();
      }
    });
  }

  private refreshSession(): void {
    this.authService.getProfile().subscribe({
      next: (latestUser) => {
        this.populateForm(latestUser);
        this.isLoading.set(false);
        this.isEditing.set(false);
        this.selectedFile = null;
        this.imagePreviewUrl = null;
        this.newPassword = '';
        alert('Profile saved successfully.');
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  startEdit(): void {
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    // Revert inputs to current session data
    const user = this.authService.currentUser();
    if (user) {
      this.populateForm(user);
    }
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    this.newPassword = '';
    this.isEditing.set(false);
  }

  goBack(): void {
    this.location.back();
  }
}
