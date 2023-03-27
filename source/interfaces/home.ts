import { Point } from "./point";

export interface Home extends Point {
  v: boolean; //Visible
  n: string; //Name
  puid: number;
}
