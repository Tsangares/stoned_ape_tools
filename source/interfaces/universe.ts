import { Galaxy } from "./galaxy";
import { Hero, Player } from "./player";
import { Star } from "./star";

export interface Universe {
  galaxy: Galaxy;
  player: Hero;
  now: number;
  playerCount: number;
  selectedPlayer: Hero | Player | null;
  distance(x_1: number, y_1: number, x_2: number, y_2: number): number; //L2 NORM
  findBestStar(): Star;
  get_total_natural_resources?(): number;
  get_star_positions?(): { x: number; y: number }[];
}
