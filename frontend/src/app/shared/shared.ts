import { ComponentBadge } from "./components/badge/badge";
import { ComponentButton } from "./components/button/button";
import { ComponentCard } from "./components/card/card";
import { ComponentEmptyState } from "./components/empty-state/empty-state";
import { ComponentInputUi } from "./components/input-ui/input-ui";
import { ComponentLoading } from "./components/loading/loading";
import { ComponentProcess } from "./components/process/process";
import { ComponentFilterPill } from "./components/filter-pill/filter-pill";
import { TranslateFixed } from "./components/translate-fixed/translate-fixed";
import { ComponentGridCard } from "./components/grid-card/grid-card";
import { ComponentMobileFilters } from "./components/mobile-filters/mobile-filters";
import { ComponentTabSwitcher } from "./components/tab-switcher/tab-switcher";

import { ThaiDatePipe } from "./pipes/thai-date.pipe";
import { ThaiTimePipe } from "./pipes/thai-time.pipe";
import { TranslatePipe } from "./pipes/translate.pipe";
import { EngDatePipe } from "./pipes/eng-date.pipe";
import { EngTimePipe } from "./pipes/eng-time.pipe";
import { AppDatePipe } from "./pipes/app-date.pipe";
import { AppTimePipe } from "./pipes/app-time.pipe";

export const AllComponentUi = [
  ComponentBadge,
  ComponentButton,
  ComponentCard,
  ComponentEmptyState,
  ComponentInputUi,
  ComponentLoading,
  ComponentProcess,
  ComponentFilterPill,
  TranslateFixed,
  ComponentGridCard,
  ComponentMobileFilters,
  ComponentTabSwitcher,
];

export const AllPipes = [
  ThaiDatePipe,
  ThaiTimePipe,
  TranslatePipe,
  EngDatePipe,
  EngTimePipe,
  AppDatePipe,
  AppTimePipe,
];

export const AllSharedUi = [...AllComponentUi, ...AllPipes];
