import {
  get_cached_events,
  recieve_new_messages,
  update_event_cache,
} from "../event_cache";
import { Crux } from "../interfaces/crux";
import { Goodbye, Payload } from "../interfaces/events";
import { GameState } from "../interfaces/game";
import { Player } from "../interfaces/player";

export function get_npc_tick(game: GameState, crux: Crux) {
  let ai: Player = game.universe.selectedPlayer;
  let cache = get_cached_events();
  let events = cache.map((e) => e.payload);
  let goodbyes = events.filter((e: Goodbye) =>
    e.template.includes("goodbye_to_player"),
  );
  let tick = goodbyes.filter((e: Goodbye) => e.uid == ai.uid)[0].tick;
  console.log(tick);
  return tick;
}

export function add_npc_tick_counter(game: GameState, crux: Crux) {
  let tick = get_npc_tick(game, crux);
  let title = document.querySelector<HTMLElement>(
    "#contentArea > div > div.widget.fullscreen > div:nth-child(3) > div > div:nth-child(5) > div.widget.section_title.col_black",
  );
  let subtitle = document.querySelector<HTMLElement>(
    "#contentArea > div > div.widget.fullscreen > div:nth-child(3) > div > div:nth-child(5) > div.widget.txt_right.pad12",
  );
  let current_tick = game.universe.galaxy.tick;
  let next_move = (current_tick - tick) % 4;
  let last_move = 4 - next_move;
  //let last_move = current_tick-next_move
  let postfix_1 = "";
  let postfix_2 = "";
  if (next_move != 1) {
    postfix_1 += "s";
  }
  if (last_move != 1) {
    postfix_2 += "s";
  }
  if (next_move == 0) {
    next_move = 4;
    title.innerText = `AI moves in ${next_move} tick${postfix_1}`;
    subtitle.innerText = "AI moved this tick";
  } else {
    title.innerText = `AI moves in ${next_move} tick${postfix_1}`;
    subtitle.innerText = `AI last moved ${last_move} tick${postfix_2} ago`;
    //subtitle.innerText = `AI last moved on tick ${last_move}`
  }
}

export function hook_npc_tick_counter(game: GameState, crux: Crux) {
  const selectedPlayer: Player = game.universe.selectedPlayer;
  if (selectedPlayer.ai) {
    update_event_cache(game, crux, 4, add_npc_tick_counter, console.error);
  }
}
