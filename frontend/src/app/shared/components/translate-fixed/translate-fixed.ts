import { Component, Input, inject, OnInit, OnChanges } from "@angular/core";
import { LanguageService } from "../../../core/services/language.service";

@Component({
  selector: "translate-fixed",
  standalone: true,
  template: `
    <span class="translate-fixed-wrapper" [style.justify-items]="align">
      <span
        class="translate-fixed-text"
        [class.translate-fixed-active]="langService.currentLang() === 'th'"
        [class.translate-fixed-hidden]="langService.currentLang() !== 'th'"
        >{{ thText }}</span
      >
      <span
        class="translate-fixed-text"
        [class.translate-fixed-active]="langService.currentLang() === 'en'"
        [class.translate-fixed-hidden]="langService.currentLang() !== 'en'"
        >{{ enText }}</span
      >
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .translate-fixed-wrapper {
        display: inline-grid;
        align-items: center;
        justify-items: start;
      }
      .translate-fixed-text {
        grid-area: 1 / 1;
        white-space: nowrap;
      }
      .translate-fixed-active {
        visibility: visible;
      }
      .translate-fixed-hidden {
        visibility: hidden;
      }
    `,
  ],
  host: {
    class: "inline-flex items-center justify-center",
  },
})
export class TranslateFixed implements OnInit, OnChanges {
  @Input() key = "";
  @Input() thText = "";
  @Input() enText = "";
  @Input() align: "start" | "center" | "end" = "start";

  public readonly langService = inject(LanguageService);

  ngOnInit() {
    this.resolveTexts();
  }

  ngOnChanges() {
    this.resolveTexts();
  }

  private resolveTexts(): void {
    if (this.key) {
      this.thText = this.langService.translate(this.key, "th");
      this.enText = this.langService.translate(this.key, "en");
    }
  }
}
