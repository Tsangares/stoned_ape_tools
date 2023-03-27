import { Galaxy } from "./galaxy";
import { Hero, Player } from "./player";

export interface Universe {
  galaxy: Galaxy;
  player: Hero;
  now: number;
  playerCount: number;
  selectedPlayer: Hero | Player | null;
  distance(x_1: number, y_1: number, x_2: number, y_2: number): number; //L2 NORM
}
