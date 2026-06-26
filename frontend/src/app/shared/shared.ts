import { ComponentBadge } from "./components/badge/badge";
import { ComponentButton } from "./components/button/button";
import { ComponentCard } from "./components/card/card";
import { ComponentEmptyState } from "./components/empty-state/empty-state";
import { ComponentInputUi } from "./components/input-ui/input-ui";
import { ComponentLoading } from "./components/loading/loading";
import { ComponentProcess } from "./components/process/process";

import { ThaiDatePipe } from "./pipes/thai-date.pipe";
import { ThaiTimePipe } from "./pipes/thai-time.pipe";

export const AllComponentUi = [
  ComponentBadge,
  ComponentButton,
  ComponentCard,
  ComponentEmptyState,
  ComponentInputUi,
  ComponentLoading,
  ComponentProcess
];

export const AllPipes = [
  ThaiDatePipe,
  ThaiTimePipe
];

export const AllSharedUi = [
  ...AllComponentUi,
  ...AllPipes
];
