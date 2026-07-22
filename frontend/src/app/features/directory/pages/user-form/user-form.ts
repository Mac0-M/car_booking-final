import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DialogRef } from "@angular/cdk/dialog";
import { UserService } from "../../../../core/services/user.service";
import { AuthService } from "../../../../core/services/auth.service";
import { LanguageService } from "../../../../core/services/language.service";
import { AllSharedUi } from "../../../../shared/shared";
import { ToastService } from "../../../../core/services/toast.service";

@Component({
  selector: "app-user-form",
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi],
  templateUrl: "./user-form.html",
  host: {
    class: "block w-full h-full",
  },
})
export class UserFormComponent {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly dialogRef = inject(DialogRef);
  private readonly langService = inject(LanguageService);
  private readonly toast = inject(ToastService);

  readonly isSaving = signal(false);

  // Form Fields
  newUserName = "";
  newUserEmail = "";
  newUserPassword = "";
  newUserPhone = "";

  // Validation Errors
  nameError = "";
  emailError = "";
  passwordError = "";
  phoneError = "";

  get currentUserRole(): string {
    return this.authService.currentUser()?.role || "User";
  }

  get isSuperAdmin(): boolean {
    return this.currentUserRole === "Super_Admin";
  }

  closeAddModal(): void {
    this.dialogRef.close();
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
      this.nameError = "Name is required";
      isValid = false;
    } else {
      this.nameError = "";
    }

    // Email
    if (!this.newUserEmail.trim()) {
      this.emailError = "Email is required";
      isValid = false;
    } else if (!this.isValidEmail(this.newUserEmail.trim())) {
      this.emailError = "Please enter a valid email address";
      isValid = false;
    } else {
      this.emailError = "";
    }

    // Password
    if (!this.newUserPassword.trim()) {
      this.passwordError = "Password is required";
      isValid = false;
    } else if (this.newUserPassword.trim().length < 6) {
      this.passwordError = "Password must be at least 6 characters long";
      isValid = false;
    } else {
      this.passwordError = "";
    }

    // Phone
    if (!this.newUserPhone.trim()) {
      this.phoneError = "Phone number is required";
      isValid = false;
    } else if (this.newUserPhone.trim().length !== 10) {
      this.phoneError = "Phone number must be 10 digits";
      isValid = false;
    } else {
      this.phoneError = "";
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
      phone: this.newUserPhone.trim(),
    };

    this.userService.create(payload).subscribe({
      next: (createdUser) => {
        this.isSaving.set(false);
        this.toast.success(this.langService.translate("User registered successfully."));
        this.dialogRef.close(createdUser);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toast.error(
          this.langService.translate(
            err.error?.message || "An error occurred while creating the user.",
          ),
        );
      },
    });
  }
}
