import * as Crux from "./crux";
import { EventListener } from "./utilities";

// Reference: https://forum.ironhelmet.com/t/api-documentation-player-written/7533

declare global {
  var NeptunesPride: Game;
}
//This is the NeptunesPride Object
export interface Game {
  config: Config;
  np: NP;
  npui: Crux.NPUI;
  universe: Universe;
  templates: Crux.Templates;
  version: string;
  gameNumber: string;
  originalPlayer: number;
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
  stars: Star[];
}
export interface Star {
  //All Zero when I can't see it.
  puid: number;
  x: number; //Position
  y: number;
  n: string; //name or star
  v: string; //"1" is visible; "0" if not.
  e: number; //economy
  i: number; //industry
  s: number; //science
  nr: number; //Natural Resources
  r: number; //Current Resources
  c: number; //Fractional Ship
  st: number; //Current Ship Count
  ga: number; //?
  alliedDefenders: number[];
  fleetsInOrbit: Carrier[];
  qualifiedAlias: string; //Player Alias
  player: Player;
  shipsPerTick: number; //Generated per tick //NAN when invisible
  totalDefenses: number; //Number of ships on star
  uce: number; //??
  ucg: number; //??
  uci: number; //??
  ucs: number; //??
  ucd: number; //??
  victoryBonus: number; // For extra winings?
}
export interface Carrier {
  ouid: number;
  puid: number; //Player ID
  orbiting: Star | null;
  owned: boolean; //If you own it
  player: Player;
  st: number; //Ship Count
  warpSpeed: number; //?
  w: number; //?
  x: string;
  y: string;
  lx: string;
  ly: string;
  n: string; //Name of ship
  loop: number; // ? In a loop 0 or 1
  kind: string; //"fleet"
  etaFirst: number;
  eta: number;
  colourBox: string;
  hyperlinkedAlias: string;
  orders: unknown[];
  path: unknown[];
}
export interface Universe {
  galaxy: Galaxy;
  player: Hero;
  now: number;
  playerCount: number;
  selectedPlayer: Hero | Player | null;
  distance(x_1: number, y_1: number, x_2: number, y_2: number): number; //L2 NORM
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
  tech: { [name: string]: Research | Technology };
  debt: number; //TODO: Set to zero!
  //war[index: number]: number
}

export interface Hero extends Player {
  cash: number;
  researching: string;
  researching_next: string;
  tech: { [name: string]: Research };
  scannedPlayers: number[];
  war: number[];
  stars_abandoned: number;
  ledger?: Ledger;
}

export interface Technology {
  level: number; //Actual tech level
  value: number; //value = level * bv + sv
}

export interface Research extends Technology {
  research: number; //Current points in research
  sv: number; //Something Value: Base cost of tech
  bv: number; //Base Value: Used in value calculation
  brr: number; //Research cost per level for this technology
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
