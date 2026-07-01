import { Injectable, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { BookingDialogComponent } from './booking-dialog';

@Injectable({
  providedIn: 'root'
})
export class BookingDialogService {
  private readonly dialog = inject(Dialog);

  open(): void {
    this.dialog.open(BookingDialogComponent, {
      width: '672px',
      maxWidth: '95vw',
      backdropClass: ['bg-gray-900/60', 'backdrop-blur-sm'],
      panelClass: ['w-full', 'max-w-2xl', 'shadow-xl', 'rounded-2xl', 'overflow-hidden', 'animate-in', 'zoom-in', 'duration-200']
    });
  }
}
