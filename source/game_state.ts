import { Crux, MAP, NPUI } from "./interfaces/crux";
import { Galaxy } from "./interfaces/galaxy";
import { GameState } from "./interfaces/game";
import { Inbox } from "./interfaces/inbox";
import { NP } from "./interfaces/neputnes_pride";
import { Universe } from "./interfaces/universe";

export let NeptunesPride: GameState = null;
export let game: GameState = null;
export let crux: Crux = null;
export let universe: Universe = null;
export let galaxy: Galaxy = null;
export let npui: NPUI = null;
export let np: NP = null;
export let inbox: Inbox = null;
export let map: MAP = null;

export const set_game_state = function (_game: GameState, _Crux: Crux) {
  game = _game;
  NeptunesPride = _game;
  npui = game.npui;
  np = game.np;
  crux = _Crux;
  universe = game.universe;
  galaxy = game.universe.galaxy;
  inbox = game.inbox;
  map = npui.map;
};
