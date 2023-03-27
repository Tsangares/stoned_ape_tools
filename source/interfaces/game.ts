import { NP } from "./neputnes_pride";
import { Point } from "./point";
import { Universe } from "./universe";
import * as Crux from "./crux";

//This is the NeptunesPride Object
export interface GameState {
  config: Config;
  np: NP;
  npui: Crux.NPUI;
  universe: Universe;
  templates: Crux.Templates;
  version: string;
  gameNumber: string;
  originalPlayer: number;
}
export interface GameState {
  inbox: unknown;
  account: unknown;
  InterfaceScreens: unknown;
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
