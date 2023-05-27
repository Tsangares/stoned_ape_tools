/*
 * Helper function for Common NP elements
 */
import { Carrier } from "../interfaces/carrier";
import { Galaxy } from "../interfaces/galaxy";
import { GameState } from "../interfaces/game";
import { Universe } from "../interfaces/universe";
import { Star } from "../interfaces/star";
import { NP } from "../interfaces/neputnes_pride";
declare global {
  var NeptunesPride: GameState;
}

export function get_visible_stars(): Star[] | undefined {
  let stars = get_all_stars();
  if (stars === undefined) return undefined;
  let visible_stars = [];
  for (let [index, star] of Object.entries(stars)) {
    if (star.v === "1") {
      //Star is visible
      visible_stars.push(star);
    }
  }
  return visible_stars;
}

export function get_game_number(): string {
  if (NeptunesPride === undefined) return undefined;
  return NeptunesPride.gameNumber;
}

export function get_all_stars(): { [index: string]: Star } | undefined {
  if (NeptunesPride === undefined) return undefined;
  return NeptunesPride.universe.galaxy.stars;
}

export function get_fleets(): { [index: string]: Carrier } | undefined {
  if (NeptunesPride === undefined) return undefined;
  return NeptunesPride.universe.galaxy.fleets;
}

export function get_galaxy(): Galaxy | undefined {
  if (NeptunesPride === undefined) return undefined;
  return get_universe().galaxy;
}

export function get_universe(): Universe | undefined {
  if (NeptunesPride === undefined) return undefined;
  return NeptunesPride.universe;
}

export function get_neptunes_pride(): NP | undefined {
  if (NeptunesPride === undefined) return undefined;
  return NeptunesPride.np;
}

export function get_game_state(): GameState | undefined {
  if (NeptunesPride === undefined) return undefined;
  return NeptunesPride;
}
