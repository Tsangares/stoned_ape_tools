import { Carrier } from "../interfaces/carrier";
import { Player } from "../interfaces/player";
import { Star } from "../interfaces/star";
import { get_game_number } from "./get_game_state";

export interface ApiData {
  scanning_data: ScanningData;
}

//Responds: {"error": "code not found in game"} if the apikey is wrong I think.
//Responds: {"error": "unknown error while retrieving game"} When issue with request
export interface ApiError {
  error: string;
}
export interface ScanningData {
  admin: number; //Which Player is Admin
  fleet_speed: number; //No Idea
  fleets: { [index: string]: Carrier };
  game_over: number; //True False
  now: number; //Timestamp
  paused: boolean;
  player_uid: number; //UID of API Caller
  players: { [index: string]: Player };
  production_counter: number;
  production_rate: number; //Ticks per production
  productions: number; //Cycle number
  stars_for_victory: number;
  stars: { [index: string]: Star };
  start_time: number;
  started: boolean;
  tick_fragment: number; //Fraction of a tick
  tick_rate: number; //?
  tick: number; //Current Tick Rate
  total_stars: number; //Number of Stars in game
  trade_cost: number; //Trading Cost
  trade_scanned: number; //Tradign Scan Enabled
  turn_based_time_out: number; //AFK Timer
  turn_based: number; //True False
  war: number; //I Don't Understand
}

export function get_api_data(apikey: string): Promise<ApiData | ApiError> {
  let game_number = get_game_number();
  return fetch("https://np.ironhelmet.com/api", {
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: `https://np.ironhelmet.com/game/${game_number}`,
    referrerPolicy: "strict-origin-when-cross-origin",
    body: `game_number=${game_number}&api_version=0.1&code=${apikey}`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  }).then((response) => response.json());
}
