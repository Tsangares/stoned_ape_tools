//Bind to inbox.fetchMessages

import { cached_events } from "../event_cache";
import { update_event_cache } from "../event_cache";
import { Crux } from "../interfaces/crux";
import { GameState } from "../interfaces/game";
import { Inbox } from "../interfaces/inbox";
import { inbox } from "../game_state";

export const fetchFilteredMessages = function (
  game: GameState,
  Crux: Crux,
  inbox: Inbox,
  filter: string,
) {
  console.log("Fethcin    g Filtered Messages");
  displayEvents();
  if (inbox.filter !== filter) {
    inbox.filter = filter;
    inbox.messages[inbox.filter] = null;
    inbox.page = 0;
  }

  if (inbox.unreadEvents) inbox.messages["game_event"] = null;
  if (inbox.unreadDiplomacy) inbox.messages["game_diplomacy"] = null;

  if (inbox.messages[inbox.filter] !== null) {
    // 1. if we are loading, we are still waiting for the server to respond
    // 2. if messages is null then we have never requested the messages
    // 3. if messages is empty array [] then the server already told us
    //    there are no messages
    return;
  }
  let super_filter = null;
  if (inbox.filter == "technology") {
    inbox.filter = "game_event";
    super_filter = "technology";
  }
  update_event_cache(10, (game) => displayEvents(), console.log);
  inbox.trigger("server_request", {
    type: "fetch_game_messages",
    count: inbox.mpp,
    offset: inbox.mpp * inbox.page,
    group: inbox.filter,
  });

  inbox.loading = true;
};
export const displayEvents = function () {
  console.log(cached_events);
  let tech_updates = cached_events.filter((m) => {
    m.payload.template == "tech_up";
  });
  console.log(tech_updates);
  inbox.messages = tech_updates;
};
