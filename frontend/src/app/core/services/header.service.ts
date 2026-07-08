import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  readonly isMobileFilterVisible = signal<boolean>(false);
  readonly activeFiltersCount = signal<number>(0);
  readonly mobileFilterAction = signal<(() => void) | null>(null);
  readonly clearFilterAction = signal<(() => void) | null>(null);

  reset(): void {
    this.isMobileFilterVisible.set(false);
    this.activeFiltersCount.set(0);
    this.mobileFilterAction.set(null);
    this.clearFilterAction.set(null);
  }
}
