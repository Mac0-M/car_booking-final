import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  TemplateRef,
  inject,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { DialogModule, Dialog, DialogRef } from "@angular/cdk/dialog";
import { ComponentButton } from "../button/button";
import { TranslateFixed } from "../translate-fixed/translate-fixed";

@Component({
  selector: "component-mobile-filters",
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ComponentButton,
    TranslateFixed,
  ],
  templateUrl: "./mobile-filters.html",
})
export class ComponentMobileFilters implements OnDestroy {
  private readonly dialog = inject(Dialog);
  @ViewChild("dialogTemplate") dialogTemplate!: TemplateRef<any>;
  private dialogRef: DialogRef<any> | null = null;

  @Input() activeFiltersCount = 0;
  @Input() showTrigger = false;
  @Input() triggerText = "";
  @Input() titleKey = "Search & Filters / ค้นหาและกรอง";

  @Output() apply = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();
  @Output() open = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  openMobileFilters(): void {
    this.open.emit();

    if (this.dialogRef || !this.dialogTemplate) return;
    this.dialogRef = this.dialog.open(this.dialogTemplate, {
      width: "100vw",
      maxWidth: "100vw",
      maxHeight: "80dvh",
      backdropClass: [
        "bg-sand-900/60",
        "backdrop-blur-sm",
        "animate-backdrop-fade",
      ],
      panelClass: [
        "w-full",
        "max-w-full",
        "max-h-[80dvh]",
        "flex",
        "flex-col",
        "shadow-xl",
        "mobile-filter-dialog-pane",
        "animate-slide-up",
      ],
    });

    this.dialogRef.closed.subscribe(() => {
      this.dialogRef = null;
      this.close.emit();
    });
  }

  closeMobileFilters(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  applyFilters(): void {
    this.apply.emit();
    this.closeMobileFilters();
  }

  clearAllFilters(): void {
    this.clear.emit();
  }

  ngOnDestroy(): void {
    this.closeMobileFilters();
  }
}
