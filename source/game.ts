import * as Crux from "./crux";
import { EventListener } from "./utilities";

/*
export function renderLedger(
  config: Config,
  MouseTrap: Bindable,
  np: NP,
  npui: Crux.NPUI,
  universe: Universe,
  templates: Crux.Templates,
  players: Player[],
) {*/

export interface Game {
  config: Config;
  np: NP;
  npui: Crux.NPUI;
  universe: Universe;
  templates: Crux.Templates;
}

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
}

export interface Galaxy {
  player_uid: number;
  players: Player[];
}

export interface Universe {
  galaxy: Galaxy;
  player: Hero;
  now: number;
  playerCount: number;
  selectedPlayer: Hero | Player | null;
}

export interface Point {
  x: number;
  y: number;
}

export interface Home extends Point {
  v: boolean; //Visible
  n: string; //Name
  puid: number;
}

export interface Ledger {
  [player: number]: number;
}

export interface Player {
  uid: number;
  alias: string;
  ai: boolean;
  color: string;
  colorIndex: number;
  shapeIndex: number;
  conceded: number;
  avatar: number;
  total_economy: number;
  total_fleets: number;
  total_industry: number;
  total_science: number;
  total_stars: number;
  total_strength: number;
  shipsPerTick: number;
  karma_to_give: number;
  missed_turns: number;
  huid: number; //I don't know what this is
  home: Home;
  tech: Technologies | Research;
  debt: number; //TODO: Set to zero!
  //war[index: number]: number
}

export interface Hero extends Player {
  cash: number;
  researching: string;
  researching_next: string;
  tech: Research;
  scannedPlayers: number[];
  war: number[];
  stars_abandoned: number;
  ledger?: Ledger;
}

export interface Research {
  scanning: Researchable;
  propulsion: Researchable;
  terraforming: Researchable;
  research: Researchable;
  weapons: Researchable;
  banking: Researchable;
  manufacturing: Researchable;
}
export interface Technologies {
  scanning: Technology;
  propulsion: Technology;
  terraforming: Technology;
  research: Technology;
  weapons: Technology;
  banking: Technology;
  manufacturing: Technology;
}

export interface Technology {
  level: number; //Actual tech level
  value: number; //???
}

export interface Researchable extends Technology {
  research: number; //Current points in research
  sv: number; //???
  bv: number; //???
  brr: number; //Amount limit increases per level
}

export interface Config {
  name: string;
  password: string;
  players: number;
  startingShips: number;
  darkGalaxy: number;
  anonymity: boolean;
  alliances: boolean;
  turnBased: boolean;
  playerType: boolean; //Premium or not
  tradeScanned: boolean;
  tourney: boolean;
  mirror: boolean;
  tradeCost: number;
  startingStars: number;
  customStarfield: Point[];
  non_default_settings: string[];
  startingTechHyperspace: number;
  startingTechTerraforming: number;
  startingTechExperimentation: number;
  startingTechWeapons: number;
  startingTechBanking: number;
  startingTechManufacturing: number;
  startingTechScanning: number;
  startingInfIndustry: number;
  startingInfScience: number;
  startingInfEconomy: number;
  developmentCostEconomy: number;
  developmentCostIndustry: number;
  developmentCostScience: number;
  researchCostManufacturing: number;
  researchCostExperimentation: number;
  researchCostTerraforming: number;
  researchCostBanking: number;
  researchCostWeapons: number;
  researchCostHyperspace: number;
  researchCostScanning: number;
  starScatter: string;
  starsForVictory: number;
  naturalResources: number;
  startingCash: number;
  turnTime: number;
  tickRate: number;
  buildGates: number;
  description: string;
  homeStarDistance: number;
  starsPerPlayer: number;
  productionTicks: number;
  adminUserId: string;
  turnJumpTicks: number;
  randomGates: boolean;
  starfield: string;
  version: string;
}
