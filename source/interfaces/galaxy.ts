import { Player } from "./player";
import { Star } from "./star";
import { Carrier } from "./carrier";
import { get_fleets } from "../utilities/get_game_state";

export interface Galaxy {
  player_uid: number;
  players: { [index: string]: Player };
  stars: { [index: string]: Star };
  fleets: { [index: string]: Carrier };
  tick: number;
  now: number; //UTC time
  name: string;
  started: boolean;
  tick_rate: number;
  total_stars: number;
  //TODO: Finish adding Galaxy properties
}
