import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  Input,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { UserService } from "../../../../core/services/user.service";
import { AuthService } from "../../../../core/services/auth.service";
import { User } from "../../../../core/models/user.model";
import { AllSharedUi } from "../../../../shared/shared";
import { environment } from "../../../../../environments/environment";
import { DialogModule, Dialog } from "@angular/cdk/dialog";
import { LanguageService } from "../../../../core/services/language.service";
import { UserFormComponent } from "../user-form/user-form";

@Component({
  selector: "app-user-list",
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ...AllSharedUi],
  templateUrl: "./user-list.html",
})
export class UserListComponent implements OnInit {
  @Input() hideHeader = false;
  @Input() viewMode: "grid" | "list" = "list"; // default to list view for users
  @Input() isMobile = false;

  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(Dialog);
  private readonly langService = inject(LanguageService);

  readonly users = signal<User[]>([]);
  readonly isLoading = signal(false);

  get currentUserRole(): string {
    return this.authService.currentUser()?.role || "User";
  }

  get isSuperAdmin(): boolean {
    return this.currentUserRole === "Super_Admin";
  }

  get isAdmin(): boolean {
    return (
      this.currentUserRole === "Admin" || this.currentUserRole === "Super_Admin"
    );
  }

  canDelete(user: User): boolean {
    const currentUserId =
      this.authService.currentUser()?.userId ||
      this.authService.currentUser()?.user_id;
    if (user.userId === currentUserId) return false; // Cannot delete self
    if (this.isSuperAdmin) {
      return user.role !== "Super_Admin";
    }
    if (this.currentUserRole === "Admin") {
      return user.role === "User";
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
      },
    });
  }

  deleteUser(userId: number): void {
    const user = this.users().find((u) => u.userId === userId);
    if (!user || !this.canDelete(user)) {
      alert(
        this.langService.translate(
          "You do not have permission to delete this user.",
        ),
      );
      return;
    }

    const confirmMsg =
      this.langService.currentLang() === "th"
        ? `คุณแน่ใจหรือไม่ว่าต้องการลบ ${user.userName} ออกจากระบบ?`
        : `Are you sure you want to delete ${user.userName} from the system?`;
    if (confirm(confirmMsg)) {
      this.userService.delete(userId).subscribe({
        next: () => {
          this.users.update((current) =>
            current.filter((u) => u.userId !== userId),
          );
        },
        error: (err) => {
          alert(
            this.langService.translate(
              err.error?.message ||
                "An error occurred while deleting the user.",
            ),
          );
        },
      });
    }
  }

  openAddModal(): void {
    const dialogRef = this.dialog.open<User | undefined>(UserFormComponent, {
      width: "448px",
      maxWidth: "95vw",
      backdropClass: [
        "bg-sand-900/60",
        "backdrop-blur-sm",
        "animate-backdrop-fade",
      ],
      panelClass: [
        "w-full",
        "max-w-md",
        "shadow-xl",
        "rounded-2xl",
        "overflow-hidden",
        "animate-modal-zoom",
      ],
    });

    dialogRef.closed.subscribe((createdUser) => {
      if (createdUser) {
        this.users.update((current) => [createdUser, ...current]);
      }
    });
  }

  getProfileImgUrl(user: User): string {
    if (!user.profileImg) {
      return "";
    }
    if (user.profileImg.startsWith("http")) {
      return user.profileImg;
    }
    const baseUrl = environment.apiUrl.replace("/api/v1", "");
    const imgPath = user.profileImg.startsWith("/")
      ? user.profileImg
      : `/${user.profileImg}`;
    return `${baseUrl}${imgPath}`;
  }
}
