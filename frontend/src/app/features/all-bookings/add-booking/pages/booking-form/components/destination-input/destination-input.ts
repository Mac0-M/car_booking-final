import { Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { AllSharedUi } from '../../../../../../../shared/shared';

export interface LocationSearchResult {
  displayName: string;
  name: string;
  lat: number;
  lng: number;
}

/**
 * DestinationInputComponent:
 * - Sub-component of booking form (Step 1)
 * - Input field for booking destination
 * - Fetches real coordinates using Nominatim API (with AbortController and debouncing)
 */
@Component({
  selector: 'featurecomp-destination-input',
  standalone: true,
  imports: [CommonModule, FormsModule, AllSharedUi],
  templateUrl: './destination-input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DestinationInputComponent),
      multi: true
    }
  ]
})
export class DestinationInputComponent implements ControlValueAccessor {
  @Input() label = 'Destination';
  @Input() placeholder = 'Search for destination...';

  value = '';
  disabled = false;
  searchResults: LocationSearchResult[] = [];
  isSearching = false;
  showResults = false;
  
  private searchTimeout: any;
  private abortController: AbortController | null = null;

  onChange = (val: string) => {};
  onTouched = () => {};

  onQueryChange(query: string): void {
    if (this.disabled) return;
    this.value = query;
    this.onChange(query);

    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      this.searchResults = [];
      this.cancelPendingSearch();
      return;
    }

    this.searchTimeout = setTimeout(() => this.fetchLocations(trimmed), 500);
  }

  private cancelPendingSearch(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isSearching = false;
  }

  fetchLocations(query: string): void {
    this.cancelPendingSearch();
    this.isSearching = true;
    this.abortController = new AbortController();

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=th&limit=5&accept-language=th,en`;
    
    fetch(url, { signal: this.abortController.signal })
      .then(res => res.json())
      .then(data => {
        this.searchResults = Array.isArray(data) ? data.map((item: any) => ({
          displayName: item.display_name,
          name: item.name || item.display_name.split(',')[0],
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        })) : [];
        this.isSearching = false;
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Error fetching locations:', err);
          this.searchResults = [];
          this.isSearching = false;
        }
      });
  }

  selectLocation(location: LocationSearchResult): void {
    this.value = location.displayName;
    this.searchResults = [];
    this.onChange(this.value);
    this.onTouched();
    this.showResults = false;
  }

  onFocus(): void {
    this.showResults = true;
  }

  onBlur(): void {
    setTimeout(() => this.showResults = false, 250);
  }

  // ControlValueAccessor Implementation
  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
