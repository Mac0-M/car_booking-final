import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private readonly langService = inject(LanguageService);

  transform(value: string): string {
    if (!value) return '';
    return this.langService.translate(value);
  }
}
