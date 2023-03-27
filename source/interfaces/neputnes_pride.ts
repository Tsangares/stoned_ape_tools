import { Universe } from "./universe";
import { Carrier } from "./carrier";
import { EventListener } from "./events";
import * as Crux from "./crux";
import { GameState } from "./game";
import { Galaxy } from "./galaxy";

export interface NP extends EventListener {
  universe: Universe;
  npui: Crux.NPUI;
  SideMenuItem(
    icon: Crux.Icon,
    label: Crux.Template,
    event: string,
    data: unknown,
  ): Crux.Widget;
  onForgiveDebt(event?: string, data?: unknown): unknown;
  onNewFleetResponse(event?: string, newFleet?: Carrier): void;
  onNewFleet(event?: string, data?: unknown): void;
  onFullUniverse(event: string, newGalaxy: Galaxy): unknown;
}
