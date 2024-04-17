import { Home } from "./home";
import { Research, Technology } from "./research_technology";
import { Ledger } from "../ledger";

export interface Player {
  ai: boolean;
  alias: string;
  avatar: number;
  conceded: number;
  huid: number; //Possibly home star?
  karma_to_give: number;
  missed_turns: number;
  ready: number;
  regard: number;
  tech: { [name: string]: Research | Technology };
  total_economy: number;
  total_fleets: number;
  total_industry: number;
  total_science: number;
  total_stars: number;
  total_strength: number;
  uid: number;

  //Non Api Values:
  color?: string;
  colorIndex?: number;
  colorName?: string;
  debt?: number; //TODO: Set to zero!
  home?: Home;
  shapeIndex?: number;
  shipsPerTick?: number;
  //war[index: number]: number
  colourBox?: string;
  hyperlinkedAlias?: string;
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
