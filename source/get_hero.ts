import { Universe } from "./interfaces/universe";
import { Hero } from "./interfaces/player";
import { get_universe } from "./utilities/get_game_state";

export function get_hero(universe: Universe = get_universe()): Hero {
  return universe.player;
}
