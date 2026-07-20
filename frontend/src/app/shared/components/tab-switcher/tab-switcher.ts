import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateFixed } from "../translate-fixed/translate-fixed";
import { TranslatePipe } from "../../pipes/translate.pipe";

@Component({
  selector: "component-tab-switcher",
  standalone: true,
  imports: [CommonModule, TranslateFixed, TranslatePipe],
  templateUrl: "./tab-switcher.html",
})
export class ComponentTabSwitcher {
  @Input() activeTab: any;
  @Input() tab1Value: any;
  @Input() tab1Label = "";
  @Input() tab1Icon = "";
  @Input() tab2Value: any;
  @Input() tab2Label = "";
  @Input() tab2Icon = "";
  @Output() activeTabChange = new EventEmitter<any>();

  toggleActiveTab(): void {
    const nextTab = this.activeTab === this.tab1Value ? this.tab2Value : this.tab1Value;
    this.activeTabChange.emit(nextTab);
  }
}
