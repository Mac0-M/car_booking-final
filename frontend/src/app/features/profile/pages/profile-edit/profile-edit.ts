import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { AllSharedUi } from '../../../../shared/shared';
import { environment } from '../../../../../environments/environment';
import { LanguageService } from '../../../../core/services/language.service';
import { ToastService } from '../../../../core/services/toast.service';

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
  private readonly langService = inject(LanguageService);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(false);
  readonly isEditing = signal(false); // Controls view-only vs edit mode

  // Form Fields
  userId: number | null = null;
  user_name = '';
  phone = '';
  email = '';
  role = 'User';
  newPassword = '';

  // Initial Form Values Tracking (for dirty checking)
  private initialUserName = '';
  private initialPhone = '';
  private initialEmail = '';

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

    this.initialUserName = this.user_name;
    this.initialPhone = this.phone;
    this.initialEmail = this.email;
    
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

  get isFormDirty(): boolean {
    if (this.selectedFile !== null) return true;
    if (this.newPassword.trim() !== '') return true;
    if (this.user_name.trim() !== this.initialUserName.trim()) return true;
    if (this.phone.trim() !== this.initialPhone.trim()) return true;
    if (this.email.trim() !== this.initialEmail.trim()) return true;
    return false;
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

    if (this.isFormDirty) {
      const confirmMsg = this.langService.translate(
        'Are you sure you want to save changes? / คุณต้องการบันทึกการเปลี่ยนแปลงโปรไฟล์ใช่หรือไม่?'
      );
      if (!confirm(confirmMsg)) {
        return;
      }
    }

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
        this.toast.error(this.langService.translate(err.error?.message || 'An error occurred while saving profile data.'));
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
        this.toast.warning(this.langService.translate(err.error?.message || 'Profile saved successfully, but avatar image upload failed.'));
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
        this.toast.warning(this.langService.translate('Profile saved successfully.'));
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  startEdit(): void {
    this.initialUserName = this.user_name;
    this.initialPhone = this.phone;
    this.initialEmail = this.email;
    this.newPassword = '';
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    if (this.isFormDirty) {
      const confirmMsg = this.langService.translate(
        'You have unsaved changes. Are you sure you want to cancel? / คุณมีการแก้ไขข้อมูลที่ยังไม่ได้บันทึก ต้องการยกเลิกใช่หรือไม่?'
      );
      if (!confirm(confirmMsg)) {
        return;
      }
    }

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
    if (this.isEditing() && this.isFormDirty) {
      const confirmMsg = this.langService.translate(
        'You have unsaved changes. Are you sure you want to leave? / คุณมีการแก้ไขข้อมูลที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้ใช่หรือไม่?'
      );
      if (!confirm(confirmMsg)) {
        return;
      }
    }
    this.location.back();
  }
}
