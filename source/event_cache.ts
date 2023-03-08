import { Game, Player, Universe } from "./game";
import { get_ledger } from "./ledger";
import { Widget,Crux, NPUI } from "./crux";
import { Event,MessageEvent } from "./events";
import { get_hero } from "./utilities";
import { cache } from "webpack";

//Global cached event system.
export let cached_events: Event[] = [];
export let cacheFetchStart = new Date();
export let cacheFetchSize = 0;

interface Callback {
  (value: Response): Response|void
}
interface EventCacheCallback {
  (game: Game, crux: Crux, messages: MessageEvent): void
}
//Async request game events
//game is used to get the api version and the gameNumber
export function update_event_cache(game:Game, crux:Crux, fetchSize:number, success:EventCacheCallback, error:Callback): void {
  const count = cached_events.length > 0 ? fetchSize : 100000;

  cacheFetchStart = new Date();
  cacheFetchSize = count;

  const params = new URLSearchParams({
    type: "fetch_game_messages",
    count: count.toString(),
    offset: "0",
    group: "game_event",
    version: game.version,
    game_number: game.gameNumber,
  })
  const headers = {
    'Content-Type': 'application/x-www-form-urlencodedn'
  }

  fetch("/trequest/fetch_game_messages",{
    method: "POST",
    headers:{
      'Content-Type': 'application/x-www-form-urlencoded'
    }, 
    body: params
  })  
    .then((response: Response)=>response.json())
    .then((response: MessageEvent)=>success(game,crux,response))
    .catch(error)
};

//Custom UI Components for Ledger
export function PlayerNameIconRowLink (crux:Crux, npui:NPUI, player:Player): Widget {
  let playerNameIconRow = crux.Widget("rel col_black clickable").size(480, 48);
  npui.PlayerIcon(player, true).roost(playerNameIconRow);
  crux.Text("", "section_title")
    .grid(6, 0, 21, 3)
    .rawHTML(
      `<a onclick="Crux.crux.trigger('show_player_uid', '${player.uid}' )">${player.alias}</a>`,
    )
    .roost(playerNameIconRow);
  return playerNameIconRow;
};

//Handler to recieve new messages
export function recieve_new_messages(game:Game, crux:Crux, response: MessageEvent): void {
  let universe = game.universe;
  let npui = game.npui;

  const cacheFetchEnd = new Date();
  const elapsed = cacheFetchEnd.getTime() - cacheFetchStart.getTime();
  console.log(`Fetched ${cacheFetchSize} events in ${elapsed}ms`);
  let incoming = response.report.messages;
  if (cached_events.length > 0) {
    let overlapOffset = -1;
    for (let i = 0; i < incoming.length; ++i) {
      const message = incoming[i];
      if (message.key === cached_events[0].key) {
        overlapOffset = i;
        break;
      }
    }
    if (overlapOffset >= 0) {
      incoming = incoming.slice(0, overlapOffset);
    } else if (overlapOffset < 0) {
      const size = incoming.length * 2;
      console.log(`Missing some events, double fetch to ${size}`);
      update_event_cache(game, crux, size, recieve_new_messages, console.error);
      return;
    }

    // we had cached events, but want to be extra paranoid about
    // correctness. So if the response contained the entire event
    // log, validate that it exactly matches the cached events.
    if (response.report.messages.length === cached_events.length) {
      console.log("*** Validating cached_events ***");
      const valid = response.report.messages;
      let invalidEntries = cached_events.filter(
        (e, i) => e.key !== valid[i].key,
      );
      if (invalidEntries.length) {
        console.error("!! Invalid entries found: ", invalidEntries);
      }
      console.log("*** Validation Completed ***");
    } else {
      // the response didn't contain the entire event log. Go fetch
      // a version that _does_.
      update_event_cache(game, crux, 100000, recieve_new_messages, console.error);
    }
  }
  cached_events = incoming.concat(cached_events);

  const players = get_ledger(game, crux, cached_events);

  const ledgerScreen = npui.ledgerScreen();

  npui.onHideScreen(null, true);
  npui.onHideSelectionMenu();
  npui.trigger("hide_side_menu");
  npui.trigger("reset_edit_mode");
  npui.activeScreen = ledgerScreen;
  ledgerScreen.roost(npui.screenContainer);
  npui.layoutElement(ledgerScreen);

  players.forEach((p) => {
    let player = PlayerNameIconRowLink(crux,npui,universe.galaxy.players[p.uid]).roost(
      npui.activeScreen,
    );
    player.addStyle("player_cell");
    let prompt = p.debt > 0 ? "They owe" : "You owe";
    if (p.debt == 0) {
      prompt = "Balance";
    }
    if (p.debt < 0) {
      crux.Text("", "pad12 txt_right red-text")
        .rawHTML(`${prompt}: ${p.debt}`)
        .grid(20, 0, 10, 3)
        .roost(player);

      if (p.debt * -1 <= get_hero(universe).cash) {
        crux.Button("forgive", "forgive_debt", { targetPlayer: p.uid })
          .grid(17, 0, 6, 3)
          .roost(player);
      }
    } else if (p.debt > 0) {
      crux.Text("", "pad12 txt_right blue-text")
        .rawHTML(`${prompt}: ${p.debt}`)
        .grid(20, 0, 10, 3)
        .roost(player);
    } else if (p.debt == 0) {
      crux.Text("", "pad12 txt_right orange-text")
        .rawHTML(`${prompt}: ${p.debt}`)
        .grid(20, 0, 10, 3)
        .roost(player);
    }
  });
};

export default {
  update_event_cache,
  recieve_new_messages
};
