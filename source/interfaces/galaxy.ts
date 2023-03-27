import { Player } from "./player";
import { Star } from "./star";
import { Carrier } from "./carrier";
import { get_fleets } from "../utilities/get_game_state";

export interface Galaxy {
  player_uid: number;
  players: { [index: string]: Player };
  stars: { [index: string]: Star };
  fleets: { [index: string]: Carrier };
}
