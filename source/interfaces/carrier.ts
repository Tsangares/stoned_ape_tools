import { Star } from "./star";
import { Player } from "./player";

//Fleets are just the api data for carriers

export interface Carrier {
  uid: number; //Player Number
  l: number; //Unknown Variable
  o: string | number[][]; //Sometimes its a list
  n: string; //Name of ship
  puid: number; //Player ID
  w: number; //Unknown weight
  y: string;
  x: string;
  st: number; //Ship Count
  lx: string;
  ly: string;

  //The following is not in the api:
  colourBox?: string;
  eta?: number;
  etaFirst?: number;
  hyperlinkedAlias?: string;
  kind?: string; //"fleet"
  lastStar?: null; //?
  loop?: number; // ? In a loop 0 or 1
  orbiting?: Star | null;
  orders?: unknown[];
  ouid?: number;
  owned?: boolean; //If you own it
  path?: unknown[];
  player?: Player;
  qualifiedAlias?: string; // Player Alias
  showStrength?: boolean; // Idk?
  warpSpeed?: number; //?
}

export interface Fleet extends Carrier {}
