import { Universe, Hero } from "./game";

export type Event = string;

export function get_hero(universe: Universe): Hero {
  return universe.player;
}

export interface Bindable {
  (keys: string[], callback: () => void): unknown;
}

export interface EventListener {
  on(key: string, callback: (event?: string, payload?: unknown) => void): void;
  off(key: string, callback: (event?: string, payload?: unknown) => void): void;
  trigger(event: string, payload?: unknown): void;
}

export default { get_hero };
