import { Player } from "./player";
import { Carrier } from "./carrier";

export interface Star {
  //All Zero when I can't see it.
  c?: number; //Fractional Ship
  e?: number; //economy
  uid: number; //Star ID
  i?: number; //industry
  s?: number; //science
  n: string; //name or star
  puid: number; //Player ID Number
  r?: number; //Current Resources
  ga?: number; //Unknown what this is?
  v: "1" | "0"; //Visibility
  x: number; //Position
  y: number;
  nr?: number; //Natural Resources
  st?: number; //Current Ship Count

  //These properties are not available through the api:
  alliedDefenders?: number[];
  fleetsInOrbit?: Carrier[];
  player?: Player;
  qualifiedAlias?: string; //Player Alias
  shipsPerTick?: number; //Generated per tick //NAN when invisible
  totalDefenses?: number; //Number of ships on star
  ucd?: number; //??
  uce?: number; //??
  ucg?: number; //??
  uci?: number; //??
  ucs?: number; //??
  victoryBonus?: number; // For extra winings?
}
