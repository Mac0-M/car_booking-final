import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  ViewChild,
  TemplateRef,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AllSharedUi } from "../../../../shared/shared";
import { VEHICLE_TYPES } from "../../../../core/models/vehicle.model";
import { DialogModule, Dialog, DialogRef } from "@angular/cdk/dialog";

@Component({
  selector: "app-directory-mobile-filters",
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi, DialogModule],
  templateUrl: "./directory-mobile-filters.html",
})
export class DirectoryMobileFiltersComponent implements OnDestroy {
  private readonly dialog = inject(Dialog);
  @ViewChild("dialogTemplate") dialogTemplate!: TemplateRef<any>;
  private dialogRef: DialogRef<any> | null = null;

  @Input() searchQuery = "";
  @Input() selectedType = "";
  @Input() selectedStatus = "";
  @Input() selectedReFuel = "";
  @Input() activeFiltersCount = 0;
  @Input() showTrigger = true;

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() selectedTypeChange = new EventEmitter<string>();
  @Output() selectedStatusChange = new EventEmitter<string>();
  @Output() selectedReFuelChange = new EventEmitter<string>();
  @Output() resetFilters = new EventEmitter<void>();

  readonly vehicleTypes = VEHICLE_TYPES;

  // Local drafts for buffering changes before Apply is clicked
  localSearchQuery = "";
  localSelectedType = "";
  localSelectedStatus = "";
  localSelectedReFuel = "";

  toggleLocalVehicleType(typeVal: string): void {
    if (this.localSelectedType === typeVal) {
      this.localSelectedType = "";
    } else {
      this.localSelectedType = typeVal;
    }
  }

  openMobileFilters(): void {
    this.localSearchQuery = this.searchQuery;
    this.localSelectedType = this.selectedType;
    this.localSelectedStatus = this.selectedStatus;
    this.localSelectedReFuel = this.selectedReFuel;

    if (this.dialogRef || !this.dialogTemplate) return;
    this.dialogRef = this.dialog.open(this.dialogTemplate, {
      width: "100vw",
      maxWidth: "100vw",
      maxHeight: "80dvh",
      backdropClass: [
        "bg-gray-900/60",
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
    });
  }

  closeMobileFilters(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  applyFilters(): void {
    this.searchQueryChange.emit(this.localSearchQuery);
    this.selectedTypeChange.emit(this.localSelectedType);
    this.selectedStatusChange.emit(this.localSelectedStatus);
    this.selectedReFuelChange.emit(this.localSelectedReFuel);
    this.closeMobileFilters();
  }

  clearAllFilters(): void {
    this.localSearchQuery = "";
    this.localSelectedType = "";
    this.localSelectedStatus = "";
    this.localSelectedReFuel = "";
    this.resetFilters.emit();
    this.closeMobileFilters();
  }

  ngOnDestroy(): void {
    this.closeMobileFilters();
  }
}
