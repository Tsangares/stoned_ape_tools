import { universe } from "../game_state";
import { Star } from "../interfaces/star";
import { Universe } from "../interfaces/universe";

const get_total_natural_resources = function () {
  let player = universe.player;
  let natual_resources: number = 0;
  let star;
  for (let s in universe.galaxy.stars) {
    star = universe.galaxy.stars[s];
    if (star.puid !== player.uid) continue;
    natual_resources += star.r;
  }
  return natual_resources;
};

interface position {
  x: number;
  y: number;
}
const get_star_positions = function () {
  let positions: position[] = [];
  let star: Star;
  for (let s in universe.galaxy.stars) {
    star = universe.galaxy.stars[s];
    positions.push({ x: star.x, y: star.y });
  }
  return positions;
};

export function hook_star_manager(universe: Universe) {
  universe.get_total_natural_resources = get_total_natural_resources;
  universe.get_star_positions = get_star_positions;
}
