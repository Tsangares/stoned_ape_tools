import { Universe } from "./interfaces/universe";
import { Hero } from "./interfaces/player";
import { get_universe } from "./utilities/get_game_state";

export function get_hero(universe: Universe = null): Hero {
  if (universe == null) {
    universe = get_universe();
  }
  return universe.player;
}
