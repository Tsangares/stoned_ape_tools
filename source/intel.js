import { get_research_text } from "./chat";
import { get_hero } from "./get_hero";
import { clip, lastClip } from "./hotkey";
import { renderLedger } from "./ledger";
import { mergeUser } from "./utilities/merge";
import { is_valid_image_url, is_valid_youtube } from "./utilities/parse_utils";
import { anyStarCanSee, drawOverlayString } from "./utilities/graphics";
import { hook_npc_tick_counter } from "./utilities/npc_calc";
import {
  get_ape_badges,
  ApeBadgeIcon,
  groupApeBadges,
} from "./utilities/player_badges";
import { ApeGiftItem, buyApeGiftScreen } from "./utilities/gift_shop";
import { fetchFilteredMessages } from "./utilities/fetch_messages";
import { set_game_state } from "./game_state";
import {
  get_territory,
  hook_star_manager,
  show_mouse_position,
} from "./utilities/territory";
import { unique } from "webpack-merge";

let SAT_VERSION = "loading";

if (NeptunesPride === undefined) {
  thisGame.neptunesPride = NeptunesPride;
}

// toProperCase makes a string Title Case
String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

//This should count the quantity of an array given a filter
// TODO: Find out where this is used?
Object.defineProperties(Array.prototype, {
  find: {
    value: function (value) {
      return this.filter((x) => x == value).length;
    },
  },
});

/* Extra Badges */
let ape_players = [];
async function get_ape_players() {
  get_ape_badges()
    .then((players) => {
      ape_players = players;
    })
    .catch((err) => console.log("ERROR: Unable to get APE players", err));
}
get_ape_players();
//Override widget intefaces
const overrideBadgeWidgets = () => {
  NeptunesPride.npui.badgeFileNames["a"] = "ape";
  const image_url = $("#ape-intel-plugin").attr("images");
  NeptunesPride.npui.BadgeIcon = (filename, count, small) =>
    ApeBadgeIcon(Crux, image_url, filename, count, small);
};
const overrideTemplates = () => {
  let ape =
    "<h3>Ape - 420 Credits</h3><p>Is this what you call 'evolution'? Because frankly, I've seen better designs of a banana peel.</p>";
  let wizard =
    "<h3>Wizard Badge - ? Credits</h3><p>Awarded to members of the community that have made a significant contribution to the game. Code for a new feature or a map design we all enjoyed.</p>";
  let rat =
    "<h3>Lab Rat - ? Crets  </h3><p>Awarded to players who have helped test the most crazy new features and game types. Keep an eye on the forums if you would like to subject yourself to the game's experiments.</p>";
  let bullseye =
    "<h3>Bullseye - ? Credits  </h3><p>They really hit the target.</p>";
  let flambeau =
    "<h3>Flambeau - ? Credits  </h3><p>This player really lit up your life.</p>";
  let tourney_join =
    "<h3>Tournement Participation - ? Credits  </h3><p>Hey at least you tried.\nAwarded to each player that participates in an official tournament.</p>";
  let tourney_win =
    "<h3>Tournement Winner - ? Credits  </h3><p>Hey at least you won.\nAwarded to the winner of an official tournament.</p>";
  let proteus =
    "<h3>Proteus Victory - ? Credits  </h3><p>Awarded to players who win a game of Proteus!</p>";
  let honour =
    "<h3>Special Badge of Honor - ? Credits  </h3><p>Buy one get one free!\nAwarded for every gift purchased for another player. These players go above and beyond the call of duty in support of the game!</p>";
  NeptunesPride.templates["gift_desc_ape"] = ape;
  NeptunesPride.templates["gift_desc_wizard"] = wizard;
  NeptunesPride.templates["gift_desc_rat"] = rat;
  NeptunesPride.templates["gift_desc_bullseye"] = bullseye;
  NeptunesPride.templates["gift_desc_flambeau"] = flambeau;
  NeptunesPride.templates["gift_desc_tourney_join"] = tourney_join;
  NeptunesPride.templates["gift_desc_tourney_win"] = tourney_win;
  NeptunesPride.templates["gift_desc_proteus"] = proteus;
  NeptunesPride.templates["gift_desc_honour"] = honour;
  //NeptunesPride.templates["gift_desc_lifetime"] = lifetime

  Crux.localise = function (id) {
    if (Crux.templates[id]) {
      return Crux.templates[id];
    } else {
      return id.toProperCase();
    }
  };
};
const overrideGiftItems = () => {
  const image_url = $("#ape-intel-plugin").attr("images");
  console.log(image_url);
  NeptunesPride.npui.BuyGiftScreen = () => {
    return buyApeGiftScreen(Crux, NeptunesPride.universe, NeptunesPride.npui);
  };
  NeptunesPride.npui.GiftItem = (item) => {
    return ApeGiftItem(Crux, image_url, item);
  };
};
const overrideShowScreen = () => {
  NeptunesPride.npui.onShowScreen = (event, screenName, screenConfig) => {
    return onShowApeScreen(
      NeptunesPride.npui,
      NeptunesPride.universe,
      event,
      screenName,
      screenConfig,
    );
  };
};

/*
$("ape-intel-plugin").ready(() => {
  post_hook();
  //$("#ape-intel-plugin").remove();
});
*/
function page_hook() {
  pre_post_hook();
  post_hook();
}

function pre_post_hook() {
  /* PRE POST HOOK */
  set_game_state(NeptunesPride, Crux);
  /* POST HOOK */
}

function post_hook() {
  console.log("Running post hook");
  renderLedger(Mousetrap);
  overrideGiftItems();
  //overrideShowScreen(); //Not needed unless I want to add new ones.
  overrideTemplates();
  overrideBadgeWidgets();
  //getTerritory(NeptunesPride.universe, $("canvas")[0]);
  SAT_VERSION = $("#ape-intel-plugin").attr("title");
  console.log(SAT_VERSION, "Loaded");
  renderLedger(Mousetrap);
  //Override inbox Fetch Messages
  //NeptunesPride.inbox.fetchMessages = (filter)=>fetchFilteredMessages(NeptunesPride,Crux,NeptunesPride.inbox,filter)

  //NPC Calc
  hook_npc_tick_counter();
  //Star Manager
  hook_star_manager(NeptunesPride.universe);

  //get_territory()

  //Territory draw
  //$('canvas')[0].addEventListener('mousemove',show_mouse_position);
}
function onGameRender() {
  //NeptunesPride.np.on("order:full_universe", post_hook);
}
//TODO: Organize typescript to an interfaces directory
//TODO: Then make other gFame engine objects
// Part of your code is re-creating the game in typescript
// The other part is adding features
// Then there is a segment that is overwriting existing content to add small additions.

//Add custom settings when making a nwe game.
function modify_custom_game() {
  console.log("Running custom game settings modification");
  let selector = $(
    "#contentArea > div > div.widget.fullscreen > div.widget.rel > div:nth-child(4) > div:nth-child(15) > select",
  )[0];
  if (selector == undefined) {
    //Not in menu
    return;
  }
  let textString = "";
  for (let i = 2; i <= 32; ++i) {
    textString += `<option value="${i}">${i} Players</option>`;
  }
  console.log(textString);
  selector.innerHTML = textString;
}

setTimeout(modify_custom_game, 500);

//TODO: Make is within scanning function
//Share all tech display as tech is actively trading.
const display_tech_trading = () => {
  let npui = NeptunesPride.npui;
  var tech_trade_screen = npui.Screen("tech_trading");
  npui.onHideScreen(null, true);
  npui.onHideSelectionMenu();
  npui.trigger("hide_side_menu");
  npui.trigger("reset_edit_mode");
  npui.activeScreen = tech_trade_screen;
  tech_trade_screen.roost(npui.screenContainer);
  npui.layoutElement(tech_trade_screen);

  let trading = Crux.Text("", "rel pad12").rawHTML("Trading..");
  trading.roost(tech_trade_screen);

  tech_trade_screen.transact = (text) => {
    let trading = Crux.Text("", "rel pad8").rawHTML(text);
    trading.roost(tech_trade_screen);
  };
  return tech_trade_screen;
};

//Returns all stars I suppose
const _get_star_gis = () => {
  let stars = NeptunesPride.universe.galaxy.stars;
  let output = [];
  for (const s in stars) {
    let star = stars[s];
    output.push({
      x: star.x,
      y: star.y,
      owner: star.qualifiedAlias,
      economy: star.e,
      industry: star.i,
      science: star.s,
      ships: star.totalDefenses,
    });
  }
  return output;
};

const _get_weapons_next = () => {
  const research = get_research();
  if (research["current_name"] == "Weapons") {
    return research["current_eta"];
  } else if (research["next_name"] == "Weapons") {
    return research["next_eta"];
  }
  return 10 ** 10;
};

const get_tech_trade_cost = (from, to, tech_name = null) => {
  let total_cost = 0;
  for (const [tech, value] of Object.entries(to.tech)) {
    if (tech_name == null || tech_name == tech) {
      let me = from.tech[tech].level;
      let you = value.level;
      for (let i = 1; i <= me - you; ++i) {
        //console.log(tech,(you+i),(you+i)*15)
        total_cost += (you + i) * NeptunesPride.gameConfig.tradeCost;
      }
    }
  }
  return total_cost;
};

//Hooks to buttons for sharing and buying
//Pretty simple hooks that can be added to a typescript file.
const apply_hooks = () => {
  NeptunesPride.np.on("share_all_tech", (event, player) => {
    let total_cost = get_tech_trade_cost(
      get_hero(NeptunesPride.universe),
      player,
    );
    NeptunesPride.templates[
      `confirm_tech_share_${player.uid}`
    ] = `Are you sure you want to spend $${total_cost} to give ${player.rawAlias} all of your tech?`;
    NeptunesPride.np.trigger("show_screen", [
      "confirm",
      {
        message: `confirm_tech_share_${player.uid}`,
        eventKind: "confirm_trade_tech",
        eventData: player,
      },
    ]);
  });
  NeptunesPride.np.on("buy_all_tech", (event, data) => {
    let player = data.player;
    let cost = data.cost;
    NeptunesPride.templates[
      `confirm_tech_share_${player.uid}`
    ] = `Are you sure you want to spend $${cost} to buy all of ${player.rawAlias}'s tech? It is up to them to actually send it to you.`;
    NeptunesPride.np.trigger("show_screen", [
      "confirm",
      {
        message: `confirm_tech_share_${player.uid}`,
        eventKind: "confirm_buy_tech",
        eventData: data,
      },
    ]);
  });
  NeptunesPride.np.on("buy_one_tech", (event, data) => {
    let player = data.player;
    let tech = data.tech;
    let cost = data.cost;
    NeptunesPride.templates[
      `confirm_tech_share_${player.uid}`
    ] = `Are you sure you want to spend $${cost} to buy ${tech} from ${player.rawAlias}? It is up to them to actually send it to you.`;
    NeptunesPride.np.trigger("show_screen", [
      "confirm",
      {
        message: `confirm_tech_share_${player.uid}`,
        eventKind: "confirm_buy_tech",
        eventData: data,
      },
    ]);
  });
  NeptunesPride.np.on("confirm_trade_tech", (even, player) => {
    let hero = get_hero(NeptunesPride.universe);
    let display = display_tech_trading();
    const close = () => {
      NeptunesPride.universe.selectPlayer(player);
      NeptunesPride.np.trigger("refresh_interface");
      NeptunesPride.np.npui.refreshTurnManager();
    };
    let offset = 300;
    for (const [tech, value] of Object.entries(player.tech)) {
      let me = hero.tech[tech].level;
      let you = value.level;
      for (let i = 1; i <= me - you; ++i) {
        setTimeout(() => {
          console.log(me - you, {
            type: "order",
            order: `share_tech,${player.uid},${tech}`,
          });
          display.transact(`Sending ${tech} level ${you + i}`);
          NeptunesPride.np.trigger("server_request", {
            type: "order",
            order: `share_tech,${player.uid},${tech}`,
          });
          if (i == me - you) {
            display.transact("Done.");
          }
        }, offset);
        offset += 1000;
      }
    }
    setTimeout(close, offset + 1000);
  });

  //Pays a player a certain amount
  NeptunesPride.np.on("confirm_buy_tech", (even, data) => {
    let player = data.player;
    NeptunesPride.np.trigger("server_request", {
      type: "order",
      order: `send_money,${player.uid},${data.cost}`,
    });
    NeptunesPride.universe.selectPlayer(player);
    NeptunesPride.np.trigger("refresh_interface");
  });
};

const _wide_view = () => {
  NeptunesPride.np.trigger("map_center_slide", { x: 0, y: 0 });
  NeptunesPride.np.trigger("zoom_minimap");
};

function Legacy_NeptunesPrideAgent() {
  let title = document?.currentScript?.title || `SAT ${SAT_VERSION}`;
  //let title = "MONKEY";\\
  let version = title.replace(/^.*v/, "v");

  let copy = function (reportFn) {
    return function () {
      reportFn();
      navigator.clipboard.writeText(lastClip);
    };
  };

  let hotkeys = [];
  let hotkey = function (key, action) {
    hotkeys.push([key, action]);
    Mousetrap.bind(key, copy(action));
  };

  if (!String.prototype.format) {
    String.prototype.format = function (...args) {
      return this.replace(/{(\d+)}/g, function (match, number) {
        if (typeof args[number] === "number") {
          return Math.trunc(args[number] * 1000) / 1000;
        }
        return typeof args[number] != "undefined" ? args[number] : match;
      });
    };
  }

  const linkFleets = function () {
    let universe = NeptunesPride.universe;
    let fleets = NeptunesPride.universe.galaxy.fleets;

    for (const f in fleets) {
      let fleet = fleets[f];
      let fleetLink = `<a onClick='Crux.crux.trigger(\"show_fleet_uid\", \"${fleet.uid}\")'>${fleet.n}</a>`;
      universe.hyperlinkedMessageInserts[fleet.n] = fleetLink;
    }
  };

  function starReport() {
    let players = NeptunesPride.universe.galaxy.players;
    let stars = NeptunesPride.universe.galaxy.stars;

    let output = [];
    for (const p in players) {
      output.push("[[{0}]]".format(p));
      for (const s in stars) {
        let star = stars[s];
        if (star.puid == p && star.shipsPerTick >= 0) {
          output.push(
            "  [[{0}]] {1}/{2}/{3} {4} ships".format(
              star.n,
              star.e,
              star.i,
              star.s,
              star.totalDefenses,
            ),
          );
        }
      }
    }
    clip(output.join("\n"));
  }
  hotkey("*", starReport);
  starReport.help =
    "Generate a report on all stars in your scanning range, and copy it to the clipboard." +
    "<p>This same report can also be viewed via the menu; enter the agent and choose it from the dropdown.";

  let ampm = function (h, m) {
    if (m < 10) m = `0${m}`;
    if (h < 12) {
      if (h == 0) h = 12;
      return "{0}:{1} AM".format(h, m);
    } else if (h > 12) {
      return "{0}:{1} PM".format(h - 12, m);
    }
    return "{0}:{1} PM".format(h, m);
  };

  let msToTick = function (tick, wholeTime) {
    let universe = NeptunesPride.universe;
    var ms_since_data = 0;
    var tf = universe.galaxy.tick_fragment;
    var ltc = universe.locTimeCorrection;

    if (!universe.galaxy.paused) {
      ms_since_data = new Date().valueOf() - universe.now.valueOf();
    }

    if (wholeTime || universe.galaxy.turn_based) {
      ms_since_data = 0;
      tf = 0;
      ltc = 0;
    }

    var ms_remaining =
      tick * 1000 * 60 * universe.galaxy.tick_rate -
      tf * 1000 * 60 * universe.galaxy.tick_rate -
      ms_since_data -
      ltc;
    return ms_remaining;
  };

  let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let msToEtaString = function (msplus, prefix) {
    let now = new Date();
    let arrival = new Date(now.getTime() + msplus);
    let p = prefix !== undefined ? prefix : "ETA ";
    //What is ttt?
    let ttt = p + ampm(arrival.getHours(), arrival.getMinutes());
    if (!NeptunesPride.gameConfig.turnBased) {
      ttt = p + ampm(arrival.getHours(), arrival.getMinutes());
      if (arrival.getDay() != now.getDay())
        // Generate time string
        ttt = `${p}${days[arrival.getDay()]} @ ${ampm(
          arrival.getHours(),
          arrival.getMinutes(),
        )}`;
    } else {
      let totalETA = arrival - now;
      ttt = p + Crux.formatTime(totalETA);
    }
    return ttt;
  };
  let tickToEtaString = function (tick, prefix) {
    let msplus = msToTick(tick);
    return msToEtaString(msplus, prefix);
  };
  let msToCycleString = function (msplus, prefix) {
    let p = prefix !== undefined ? prefix : "ETA";
    let cycleLength = NeptunesPride.universe.galaxy.production_rate;
    let tickLength = NeptunesPride.universe.galaxy.tick_rate;
    let ticksToComplete = Math.ceil(msplus / 60000 / tickLength);
    //Generate time text string
    let ttt = `${p}${ticksToComplete} ticks - ${(
      ticksToComplete / cycleLength
    ).toFixed(2)}C`;
    return ttt;
  };
  let fleetOutcomes = {};
  let combatHandicap = 0;
  let combatOutcomes = function () {
    let universe = NeptunesPride.universe;
    let players = NeptunesPride.universe.galaxy.players;
    let fleets = NeptunesPride.universe.galaxy.fleets;
    let stars = NeptunesPride.universe.galaxy.stars;
    let flights = [];
    fleetOutcomes = {};
    for (const f in fleets) {
      let fleet = fleets[f];
      if (fleet.o && fleet.o.length > 0) {
        let stop = fleet.o[0][1];
        let ticks = fleet.etaFirst;
        let starname = stars[stop]?.n;
        if (!starname) {
          continue;
        }
        flights.push([
          ticks,
          "[[{0}]] [[{1}]] {2} → [[{3}]] {4}".format(
            fleet.puid,
            fleet.n,
            fleet.st,
            starname,
            tickToEtaString(ticks),
          ),
          fleet,
        ]);
      }
    }
    flights = flights.sort(function (a, b) {
      return a[0] - b[0];
    });
    let arrivals = {};
    let output = [];
    let arrivalTimes = [];
    let starstate = {};
    for (const i in flights) {
      let fleet = flights[i][2];
      if (fleet.orbiting) {
        let orbit = fleet.orbiting.uid;
        if (!starstate[orbit]) {
          starstate[orbit] = {
            last_updated: 0,
            ships: stars[orbit].totalDefenses,
            puid: stars[orbit].puid,
            c: stars[orbit].c,
          };
        }
        // This fleet is departing this tick; remove it from the origin star's totalDefenses
        starstate[orbit].ships -= fleet.st;
      }
      if (
        arrivalTimes.length === 0 ||
        arrivalTimes[arrivalTimes.length - 1] !== flights[i][0]
      ) {
        arrivalTimes.push(flights[i][0]);
      }
      let arrivalKey = [flights[i][0], fleet.o[0][1]];
      if (arrivals[arrivalKey] !== undefined) {
        arrivals[arrivalKey].push(fleet);
      } else {
        arrivals[arrivalKey] = [fleet];
      }
    }
    for (const k in arrivals) {
      let arrival = arrivals[k];
      let ka = k.split(",");
      let tick = ka[0];
      let starId = ka[1];
      if (!starstate[starId]) {
        starstate[starId] = {
          last_updated: 0,
          ships: stars[starId].totalDefenses,
          puid: stars[starId].puid,
          c: stars[starId].c,
        };
      }
      if (starstate[starId].puid == -1) {
        // assign ownership of the star to the player whose fleet has traveled the least distance
        let minDistance = 10000;
        let owner = -1;
        for (const i in arrival) {
          let fleet = arrival[i];
          let d = universe.distance(
            stars[starId].x,
            stars[starId].y,
            fleet.lx,
            fleet.ly,
          );
          if (d < minDistance || owner == -1) {
            owner = fleet.puid;
            minDistance = d;
          }
        }
        starstate[starId].puid = owner;
      }
      output.push(
        "{0}: [[{1}]] [[{2}]] {3} ships".format(
          tickToEtaString(tick, "@"),
          starstate[starId].puid,
          stars[starId].n,
          starstate[starId].ships,
        ),
      );
      let tickDelta = tick - starstate[starId].last_updated - 1;
      if (tickDelta > 0) {
        let oldShips = starstate[starId].ships;
        starstate[starId].last_updated = tick - 1;
        if (stars[starId].shipsPerTick) {
          let oldc = starstate[starId].c;
          starstate[starId].ships +=
            stars[starId].shipsPerTick * tickDelta + oldc;
          starstate[starId].c =
            starstate[starId].ships - Math.trunc(starstate[starId].ships);
          starstate[starId].ships -= starstate[starId].c;
          output.push(
            "  {0}+{3} + {2}/h = {1}+{4}".format(
              oldShips,
              starstate[starId].ships,
              stars[starId].shipsPerTick,
              oldc,
              starstate[starId].c,
            ),
          );
        }
      }
      for (const i in arrival) {
        let fleet = arrival[i];
        if (
          fleet.puid == starstate[starId].puid ||
          starstate[starId].puid == -1
        ) {
          let oldShips = starstate[starId].ships;
          if (starstate[starId].puid == -1) {
            starstate[starId].ships = fleet.st;
          } else {
            starstate[starId].ships += fleet.st;
          }
          let landingString = "  {0} + {2} on [[{3}]] = {1}".format(
            oldShips,
            starstate[starId].ships,
            fleet.st,
            fleet.n,
          );
          output.push(landingString);
          landingString = landingString.substring(2);
        }
      }
      for (const i in arrival) {
        let fleet = arrival[i];
        if (fleet.puid == starstate[starId].puid) {
          let outcomeString = "{0} ships on {1}".format(
            Math.floor(starstate[starId].ships),
            stars[starId].n,
          );
          fleetOutcomes[fleet.uid] = {
            eta: tickToEtaString(fleet.etaFirst),
            outcome: outcomeString,
          };
        }
      }
      let awt = 0;
      let offense = 0;
      let contribution = {};
      for (const i in arrival) {
        let fleet = arrival[i];
        if (fleet.puid != starstate[starId].puid) {
          let olda = offense;
          offense += fleet.st;
          output.push(
            "  [[{4}]]! {0} + {2} on [[{3}]] = {1}".format(
              olda,
              offense,
              fleet.st,
              fleet.n,
              fleet.puid,
            ),
          );
          contribution[[fleet.puid, fleet.uid]] = fleet.st;
          let wt = players[fleet.puid].tech.weapons.level;
          if (wt > awt) {
            awt = wt;
          }
        }
      }
      let attackersAggregate = offense;
      while (offense > 0) {
        let dwt = players[starstate[starId].puid].tech.weapons.level;
        let defense = starstate[starId].ships;
        output.push(
          "  Combat! [[{0}]] defending".format(starstate[starId].puid),
        );
        output.push("    Defenders {0} ships, WS {1}".format(defense, dwt));
        output.push("    Attackers {0} ships, WS {1}".format(offense, awt));
        dwt += 1;
        if (starstate[starId].puid !== universe.galaxy.player_uid) {
          if (combatHandicap > 0) {
            dwt += combatHandicap;
            output.push(
              "    Defenders WS{0} = {1}".format(handicapString(""), dwt),
            );
          } else {
            awt -= combatHandicap;
            output.push(
              "    Attackers WS{0} = {1}".format(handicapString(""), awt),
            );
          }
        } else {
          if (combatHandicap > 0) {
            awt += combatHandicap;
            output.push(
              "    Attackers WS{0} = {1}".format(handicapString(""), awt),
            );
          } else {
            dwt -= combatHandicap;
            output.push(
              "    Defenders WS{0} = {1}".format(handicapString(""), dwt),
            );
          }
        }

        if (universe.galaxy.player_uid === starstate[starId].puid) {
          // truncate defense if we're defending to give the most
          // conservative estimate
          defense = Math.trunc(defense);
        }
        while (defense > 0 && offense > 0) {
          offense -= dwt;
          if (offense <= 0) break;
          defense -= awt;
        }

        let newAggregate = 0;
        let playerContribution = {};
        let biggestPlayer = -1;
        let biggestPlayerId = starstate[starId].puid;
        if (offense > 0) {
          output.push(
            "  Attackers win with {0} ships remaining".format(offense),
          );
          for (const k in contribution) {
            let ka = k.split(",");
            let fleet = fleets[ka[1]];
            let playerId = ka[0];
            contribution[k] = (offense * contribution[k]) / attackersAggregate;
            newAggregate += contribution[k];
            if (playerContribution[playerId]) {
              playerContribution[playerId] += contribution[k];
            } else {
              playerContribution[playerId] = contribution[k];
            }
            if (playerContribution[playerId] > biggestPlayer) {
              biggestPlayer = playerContribution[playerId];
              biggestPlayerId = playerId;
            }
            output.push(
              "    [[{0}]] has {1} on [[{2}]]".format(
                fleet.puid,
                contribution[k],
                fleet.n,
              ),
            );
            let outcomeString = "Wins! {0} land.".format(contribution[k]);
            fleetOutcomes[fleet.uid] = {
              eta: tickToEtaString(fleet.etaFirst),
              outcome: outcomeString,
            };
          }
          offense = newAggregate - playerContribution[biggestPlayerId];
          starstate[starId].puid = biggestPlayerId;
          starstate[starId].ships = playerContribution[biggestPlayerId];
        } else {
          starstate[starId].ships = defense;
          for (const i in arrival) {
            let fleet = arrival[i];
            if (fleet.puid == starstate[starId].puid) {
              let outcomeString = "{0} ships on {1}".format(
                Math.floor(starstate[starId].ships),
                stars[starId].n,
              );
              fleetOutcomes[fleet.uid] = {
                eta: tickToEtaString(fleet.etaFirst),
                outcome: outcomeString,
              };
            }
          }
          for (const k in contribution) {
            let ka = k.split(",");
            let fleet = fleets[ka[1]];
            let outcomeString = "Loses! {0} live.".format(defense);
            fleetOutcomes[fleet.uid] = {
              eta: tickToEtaString(fleet.etaFirst),
              outcome: outcomeString,
            };
          }
        }
        attackersAggregate = offense;
      }
      output.push(
        "  [[{0}]] [[{1}]] {2} ships".format(
          starstate[starId].puid,
          stars[starId].n,
          starstate[starId].ships,
        ),
      );
    }
    return output;
  };

  function incCombatHandicap() {
    combatHandicap += 1;
  }
  function decCombatHandicap() {
    combatHandicap -= 1;
  }
  hotkey(".", incCombatHandicap);
  incCombatHandicap.help =
    "Change combat calculation to credit your enemies with +1 weapons. Useful " +
    "if you suspect they will have achieved the next level of tech before a battle you are investigating." +
    "<p>In the lower left of the HUD, an indicator will appear reminding you of the weapons adjustment. If the " +
    "indicator already shows an advantage for defenders, this hotkey will reduce that advantage first before crediting " +
    "weapons to your opponent.";
  hotkey(",", decCombatHandicap);
  decCombatHandicap.help =
    "Change combat calculation to credit yourself with +1 weapons. Useful " +
    "when you will have achieved the next level of tech before a battle you are investigating." +
    "<p>In the lower left of the HUD, an indicator will appear reminding you of the weapons adjustment. When " +
    "indicator already shows an advantage for attackers, this hotkey will reduce that advantage first before crediting " +
    "weapons to you.";

  function longFleetReport() {
    clip(combatOutcomes().join("\n"));
  }
  hotkey("&", longFleetReport);
  longFleetReport.help =
    "Generate a detailed fleet report on all carriers in your scanning range, and copy it to the clipboard." +
    "<p>This same report can also be viewed via the menu; enter the agent and choose it from the dropdown.";

  function briefFleetReport() {
    let fleets = NeptunesPride.universe.galaxy.fleets;
    let stars = NeptunesPride.universe.galaxy.stars;
    let flights = [];
    for (const f in fleets) {
      let fleet = fleets[f];
      if (fleet.o && fleet.o.length > 0) {
        let stop = fleet.o[0][1];
        let ticks = fleet.etaFirst;
        let starname = stars[stop]?.n;
        if (!starname) continue;
        flights.push([
          ticks,
          "[[{0}]] [[{1}]] {2} → [[{3}]] {4}".format(
            fleet.puid,
            fleet.n,
            fleet.st,
            stars[stop].n,
            tickToEtaString(ticks, ""),
          ),
        ]);
      }
    }
    flights = flights.sort(function (a, b) {
      return a[0] - b[0];
    });
    clip(flights.map((x) => x[1]).join("\n"));
  }

  hotkey("^", briefFleetReport);
  briefFleetReport.help =
    "Generate a summary fleet report on all carriers in your scanning range, and copy it to the clipboard." +
    "<p>This same report can also be viewed via the menu; enter the agent and choose it from the dropdown.";

  function screenshot() {
    let map = NeptunesPride.npui.map;
    clip(map.canvas[0].toDataURL("image/webp", 0.05));
  }

  hotkey("#", screenshot);
  screenshot.help =
    "Create a data: URL of the current map. Paste it into a browser window to view. This is likely to be removed.";

  let homePlanets = function () {
    let p = NeptunesPride.universe.galaxy.players;
    let output = [];
    for (let i in p) {
      let home = p[i].home;
      if (home) {
        output.push(
          "Player #{0} is [[{0}]] home {2} [[{1}]]".format(
            i,
            home.n,
            i == home.puid ? "is" : "was",
          ),
        );
      } else {
        output.push("Player #{0} is [[{0}]] home unknown".format(i));
      }
    }
    clip(output.join("\n"));
  };
  hotkey("!", homePlanets);
  homePlanets.help =
    "Generate a player summary report and copy it to the clipboard." +
    "<p>This same report can also be viewed via the menu; enter the agent and choose it from the dropdown. " +
    "It is most useful for discovering player numbers so that you can write [[#]] to reference a player in mail.";

  let playerSheet = function () {
    let p = NeptunesPride.universe.galaxy.players;
    let output = [];
    let fields = [
      "alias",
      "total_stars",
      "shipsPerTick",
      "total_strength",
      "total_economy",
      "total_fleets",
      "total_industry",
      "total_science",
    ];
    output.push(fields.join(","));
    for (let i in p) {
      player = { ...p[i] };
      const record = fields.map((f) => p[i][f]);
      output.push(record.join(","));
    }
    clip(output.join("\n"));
  };
  hotkey("$", playerSheet);
  playerSheet.help =
    "Generate a player summary mean to be made into a spreadsheet." +
    "<p>The clipboard should be pasted into a CSV and then imported.";

  let hooksLoaded = false;
  let handicapString = function (prefix) {
    let p =
      prefix !== undefined ? prefix : combatHandicap > 0 ? "Enemy WS" : "My WS";
    return p + (combatHandicap > 0 ? "+" : "") + combatHandicap;
  };
  let loadHooks = function () {
    let superDrawText = NeptunesPride.npui.map.drawText;
    NeptunesPride.npui.map.drawText = function () {
      let universe = NeptunesPride.universe;
      let map = NeptunesPride.npui.map;
      superDrawText();

      map.context.font = `${14 * map.pixelRatio}px OpenSansRegular, sans-serif`;
      map.context.fillStyle = "#FF0000";
      map.context.textAlign = "right";
      map.context.textBaseline = "middle";
      let v = $("#ape-intel-plugin").attr("title");
      if (combatHandicap !== 0) {
        v = `${handicapString()} ${v}`;
      }

      drawOverlayString(
        map.context,
        v,
        map.viewportWidth - 10,
        map.viewportHeight - 16 * map.pixelRatio,
      );
      if (NeptunesPride.originalPlayer === undefined) {
        NeptunesPride.originalPlayer = universe.player.uid;
      }
      if (NeptunesPride.originalPlayer !== universe.player.uid) {
        let n = universe.galaxy.players[universe.player.uid].alias;
        drawOverlayString(
          map.context,
          n,
          map.viewportWidth - 100,
          map.viewportHeight - 2 * 16 * map.pixelRatio,
        );
      }

      if (universe.selectedFleet && universe.selectedFleet.path.length > 0) {
        //console.log("Selected fleet", universe.selectedFleet);
        map.context.font = `${
          14 * map.pixelRatio
        }px OpenSansRegular, sans-serif`;
        map.context.fillStyle = "#FF0000";
        map.context.textAlign = "left";
        map.context.textBaseline = "middle";
        let dy = universe.selectedFleet.y - universe.selectedFleet.ly;
        let dx = universe.selectedFleet.x - universe.selectedFleet.lx;
        dy = universe.selectedFleet.path[0].y - universe.selectedFleet.y;
        dx = universe.selectedFleet.path[0].x - universe.selectedFleet.x;
        let lineHeight = 16 * map.pixelRatio;
        let radius = 2 * 0.028 * map.scale * map.pixelRatio;
        let angle = Math.atan(dy / dx);
        let offsetx = radius * Math.cos(angle);
        let offsety = radius * Math.sin(angle);
        if (offsetx > 0 && dx > 0) {
          offsetx *= -1;
        }
        if (offsety > 0 && dy > 0) {
          offsety *= -1;
        }
        if (offsetx < 0 && dx < 0) {
          offsetx *= -1;
        }
        if (offsety < 0 && dy < 0) {
          offsety *= -1;
        }
        combatOutcomes();
        let s = fleetOutcomes[universe.selectedFleet.uid].eta;
        let o = fleetOutcomes[universe.selectedFleet.uid].outcome;
        let x = map.worldToScreenX(universe.selectedFleet.x) + offsetx;
        let y = map.worldToScreenY(universe.selectedFleet.y) + offsety;
        if (offsetx < 0) {
          map.context.textAlign = "right";
        }
        drawOverlayString(map.context, s, x, y);
        drawOverlayString(map.context, o, x, y + lineHeight);
      }
      if (
        !NeptunesPride.gameConfig.turnBased &&
        universe.timeToTick(1).length < 3
      ) {
        let lineHeight = 16 * map.pixelRatio;
        map.context.font = `${
          14 * map.pixelRatio
        }px OpenSansRegular, sans-serif`;
        map.context.fillStyle = "#FF0000";
        map.context.textAlign = "left";
        map.context.textBaseline = "middle";
        let s = "Tick < 10s away!";
        if (universe.timeToTick(1) === "0s") {
          s = "Tick passed. Click production countdown to refresh.";
        }
        drawOverlayString(map.context, s, 1000, lineHeight);
      }
      if (
        universe.selectedStar &&
        universe.selectedStar.puid != universe.player.uid &&
        universe.selectedStar.puid !== -1
      ) {
        // enemy star selected; show HUD for scanning visibility
        map.context.textAlign = "left";
        map.context.textBaseline = "middle";
        let xOffset = 26 * map.pixelRatio;
        //map.context.translate(xOffset, 0);
        let fleets = NeptunesPride.universe.galaxy.fleets;
        for (const f in fleets) {
          let fleet = fleets[f];
          if (fleet.puid === universe.player.uid) {
            let dx = universe.selectedStar.x - fleet.x;
            let dy = universe.selectedStar.y - fleet.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let offsetx = xOffset;
            let offsety = 0;
            let x = map.worldToScreenX(fleet.x) + offsetx;
            let y = map.worldToScreenY(fleet.y) + offsety;
            if (
              distance >
              universe.galaxy.players[universe.selectedStar.puid].tech.scanning
                .value
            ) {
              if (fleet.path && fleet.path.length > 0) {
                dx = fleet.path[0].x - universe.selectedStar.x;
                dy = fleet.path[0].y - universe.selectedStar.y;
                distance = Math.sqrt(dx * dx + dy * dy);
                if (
                  distance <
                  universe.galaxy.players[universe.selectedStar.puid].tech
                    .scanning.value
                ) {
                  let stepRadius = NeptunesPride.universe.galaxy.fleet_speed;
                  if (fleet.warpSpeed) stepRadius *= 3;
                  dx = fleet.x - fleet.path[0].x;
                  dy = fleet.y - fleet.path[0].y;
                  let angle = Math.atan(dy / dx);
                  let stepx = stepRadius * Math.cos(angle);
                  let stepy = stepRadius * Math.sin(angle);
                  if (stepx > 0 && dx > 0) {
                    stepx *= -1;
                  }
                  if (stepy > 0 && dy > 0) {
                    stepy *= -1;
                  }
                  if (stepx < 0 && dx < 0) {
                    stepx *= -1;
                  }
                  if (stepy < 0 && dy < 0) {
                    stepy *= -1;
                  }
                  let ticks = 0;
                  do {
                    let x = ticks * stepx + Number(fleet.x);
                    let y = ticks * stepy + Number(fleet.y);
                    //let sx = map.worldToScreenX(x);
                    //let sy = map.worldToScreenY(y);
                    dx = x - universe.selectedStar.x;
                    dy = y - universe.selectedStar.y;
                    distance = Math.sqrt(dx * dx + dy * dy);
                    //console.log(distance, x, y);
                    //drawOverlayString(map.context, "o", sx, sy);
                    ticks += 1;
                  } while (
                    distance >
                      universe.galaxy.players[universe.selectedStar.puid].tech
                        .scanning.value &&
                    ticks <= fleet.etaFirst + 1
                  );
                  ticks -= 1;
                  let visColor = "#00ff00";
                  if (anyStarCanSee(universe, universe.selectedStar.puid, fleet)) {
                    visColor = "#888888";
                  }
                  drawOverlayString(
                    map.context,
                    `Scan ${tickToEtaString(ticks)}`,
                    x,
                    y,
                    visColor,
                  );
                }
              }
            }
          }
        }
        //map.context.translate(-xOffset, 0);
      }
      if (universe.ruler.stars.length == 2) {
        let p1 = universe.ruler.stars[0].puid;
        let p2 = universe.ruler.stars[1].puid;
        if (p1 !== p2 && p1 !== -1 && p2 !== -1) {
          //console.log("two star ruler");
        }
      }
    };

    //TODO: Learn more about this hook. its run too much..
    Crux.format = function (s, templateData) {
      if (!s) {
        return "error";
      }
      var i;
      var fp;
      var sp;
      var sub;
      var pattern;

      i = 0;
      fp = 0;
      sp = 0;
      sub = "";
      pattern = "";

      // look for standard patterns
      while (fp >= 0 && i < 1000) {
        i = i + 1;
        fp = s.search("\\[\\[");
        sp = s.search("\\]\\]");
        sub = s.slice(fp + 2, sp);
        let uri = sub.replaceAll("&#x2F;", "/");
        pattern = `[[${sub}]]`;
        if (templateData[sub] !== undefined) {
          s = s.replace(pattern, templateData[sub]);
        } else if (/^api:\w{6}$/.test(sub)) {
          let apiLink = `<a onClick='Crux.crux.trigger(\"switch_user_api\", \"${sub}\")'> View as ${sub}</a>`;
          apiLink += ` or <a onClick='Crux.crux.trigger(\"merge_user_api\", \"${sub}\")'> Merge ${sub}</a>`;
          s = s.replace(pattern, apiLink);
        } else if (is_valid_image_url(uri)) {
          s = s.replace(pattern, `<img width="100%" src='${uri}' />`);
        } else if (is_valid_youtube(uri)) {
          //Pass
        } else {
          s = s.replace(pattern, `(${sub})`);
        }
      }
      return s;
    };
    let npui = NeptunesPride.npui;
    //Research button to quickly tell friends research
    NeptunesPride.templates["npa_research"] = "Research";

    let superNewMessageCommentBox = npui.NewMessageCommentBox;

    let reportResearchHook = function (_e, _d) {
      let text = get_research_text(NeptunesPride);
      console.log(text);
      let inbox = NeptunesPride.inbox;
      inbox.commentDrafts[inbox.selectedMessage.key] += text;
      inbox.trigger("show_screen", "diplomacy_detail");
    };

    NeptunesPride.np.on("paste_research", reportResearchHook);

    npui.NewMessageCommentBox = function () {
      let widget = superNewMessageCommentBox();
      let research_button = Crux.Button(
        "npa_research",
        "paste_research",
        "research",
      ).grid(11, 12, 8, 3);
      research_button.roost(widget);
      return widget;
    };
    let superFormatTime = Crux.formatTime;
    let relativeTimes = 0;
    Crux.formatTime = function (ms, mins, secs) {
      switch (relativeTimes) {
        case 0: //standard
          return superFormatTime(ms, mins, secs);
        case 1: //ETA, - turn(s) for turnbased
          if (!NeptunesPride.gameConfig.turnBased) {
            return msToEtaString(ms, "");
          } else {
            const tick_rate = NeptunesPride.universe.galaxy.tick_rate;
            return `${superFormatTime(ms, mins, secs)} - ${(
              ((ms / 3600000) * 10) /
              tick_rate
            ).toFixed(2)} turn(s)`;
          }
        case 2: //cycles + ticks format
          return msToCycleString(ms, "");
      }
    };
    let switchTimes = function () {
      //0 = standard, 1 = ETA, - turn(s) for turnbased, 2 = cycles + ticks format
      relativeTimes = (relativeTimes + 1) % 3;
    };
    hotkey("%", switchTimes);
    switchTimes.help =
      "Change the display of ETAs between relative times, absolute clock times, and cycle times. Makes predicting " +
      "important times of day to sign in and check much easier especially for multi-leg fleet movements. Sometimes you " +
      "will need to refresh the display to see the different times.";

    try {
      Object.defineProperty(Crux, "touchEnabled", {
        get: () => false,
        set: (x) => {
          console.log("Crux.touchEnabled set ignored", x);
        },
      });
    } catch (e) {
      console.log(e);
    }
    Object.defineProperty(NeptunesPride.npui.map, "ignoreMouseEvents", {
      get: () => false,
      set: (x) => {
        console.log("NeptunesPride.npui.map.ignoreMouseEvents set ignored", x);
      },
    });

    hooksLoaded = true;
  };

  let init = function () {
    if (NeptunesPride.universe?.galaxy && NeptunesPride.npui.map) {
      page_hook();
      linkFleets();
      console.log("Fleet linking complete.");
      if (!hooksLoaded) {
        loadHooks();
        console.log("HUD setup complete.");
      } else {
        console.log("HUD setup already done; skipping.");
      }
      homePlanets();
    } else {
      console.log(
        "Game not fully initialized yet; wait.",
        NeptunesPride.universe,
      );
    }
  };
  hotkey("@", init);
  init.help =
    "Reinitialize Neptune's Pride Agent. Use the @ hotkey if the version is not being shown on the map after dragging.";

  if (NeptunesPride.universe?.galaxy && NeptunesPride.npui.map) {
    console.log("Universe already loaded. Hyperlink fleets & load hooks.");
    init();
  } else {
    console.log("Universe not loaded. Hook onServerResponse.");
    let superOnServerResponse = NeptunesPride.np.onServerResponse;
    NeptunesPride.np.onServerResponse = function (response) {
      superOnServerResponse(response);
      if (response.event === "order:player_achievements") {
        console.log("Initial load complete. Reinstall.");
        init();
      } else if (response.event === "order:full_universe") {
        console.log("Universe received. Reinstall.");
        NeptunesPride.originalPlayer = NeptunesPride.universe.player.uid;
        init();
      } else if (!hooksLoaded && NeptunesPride.npui.map) {
        console.log("Hooks need loading and map is ready. Reinstall.");
        init();
      }
    };
  }

  var otherUserCode = undefined;
  let game = NeptunesPride.gameNumber;

  //This puts you into their position.
  //How is it different?
  let switchUser = function (event, data) {
    if (NeptunesPride.originalPlayer === undefined) {
      NeptunesPride.originalPlayer = NeptunesPride.universe.player.uid;
    }
    let code = data?.split(":")[1] || otherUserCode;
    otherUserCode = code;
    if (otherUserCode) {
      let params = {
        game_number: game,
        api_version: "0.1",
        code: otherUserCode,
      };
      let eggers = jQuery.ajax({
        type: "POST",
        url: "https://np.ironhelmet.com/api",
        async: false,
        data: params,
        dataType: "json",
      });
      //Loads the pull universe data into the function. Thats the difference.
      //The other version loads an updated galaxy into the function
      NeptunesPride.np.onFullUniverse(null, eggers.responseJSON.scanning_data);
      NeptunesPride.npui.onHideScreen(null, true);
      NeptunesPride.np.trigger("select_player", [
        NeptunesPride.universe.player.uid,
        true,
      ]);
      init();
    }
  };

  hotkey(">", switchUser);
  switchUser.help =
    "Switch views to the last user whose API key was used to load data. The HUD shows the current user when " +
    "it is not your own alias to help remind you that you aren't in control of this user.";
  hotkey("|", mergeUser);
  mergeUser.help =
    "Merge the latest data from the last user whose API key was used to load data. This is useful after a tick " +
    "passes and you've reloaded, but you still want the merged scan data from two players onscreen.";
  NeptunesPride.np.on("switch_user_api", switchUser);
  NeptunesPride.np.on("merge_user_api", mergeUser);

  let npaHelp = function () {
    let help = [`<H1>${title}</H1>`];
    for (let pair in hotkeys) {
      let key = hotkeys[pair][0];
      let action = hotkeys[pair][1];
      help.push(`<h2>Hotkey: ${key}</h2>`);
      if (action.help) {
        help.push(action.help);
      } else {
        help.push(
          `<p>No documentation yet.<p><code>${action.toLocaleString()}</code>`,
        );
      }
    }
    NeptunesPride.universe.helpHTML = help.join("");
    NeptunesPride.np.trigger("show_screen", "help");
  };
  npaHelp.help = "Display this help screen.";
  hotkey("?", npaHelp);

  var autocompleteMode = 0;
  let autocompleteTrigger = function (e) {
    if (e.target.type === "textarea") {
      if (autocompleteMode) {
        let start = autocompleteMode;
        let endBracket = e.target.value.indexOf("]", start);
        if (endBracket === -1) endBracket = e.target.value.length;
        let autoString = e.target.value.substring(start, endBracket);
        let key = e.key;
        if (key === "]") {
          autocompleteMode = 0;
          let m = autoString.match(/^[0-9][0-9]*$/);
          if (m?.length) {
            let puid = Number(autoString);
            let end = e.target.selectionEnd;
            let auto = `${puid}]] ${NeptunesPride.universe.galaxy.players[puid].alias}`;
            e.target.value =
              e.target.value.substring(0, start) +
              auto +
              e.target.value.substring(end, e.target.value.length);
            e.target.selectionStart = start + auto.length;
            e.target.selectionEnd = start + auto.length;
          }
        }
      } else if (e.target.selectionStart > 1) {
        let start = e.target.selectionStart - 2;
        let ss = e.target.value.substring(start, start + 2);
        autocompleteMode = ss === "[[" ? e.target.selectionStart : 0;
      }
    }
  };
  document.body.addEventListener("keyup", autocompleteTrigger);
}

const force_add_custom_player_panel = () => {
  if ("PlayerPanel" in NeptunesPride.npui) {
    add_custom_player_panel();
  } else {
    setTimeout(add_custom_player_panel, 3000);
  }
};

const add_custom_player_panel = () => {
  NeptunesPride.npui.PlayerPanel = function (player, showEmpire) {
    let universe = NeptunesPride.universe;
    let npui = NeptunesPride.npui;
    var playerPanel = Crux.Widget("rel").size(480, 264 - 8 + 48);

    var heading = "player";
    if (
      universe.playerAchievements &&
      NeptunesPride.gameConfig.anonymity === 0
    ) {
      if (universe.playerAchievements[player.uid]) {
        if (universe.playerAchievements[player.uid].premium === "premium") {
          heading = "premium_player";
        }
        if (universe.playerAchievements[player.uid].premium === "lifetime") {
          heading = "lifetime_premium_player";
        }
      }
    }

    Crux.Text(heading, "section_title col_black")
      .grid(0, 0, 30, 3)
      .roost(playerPanel);

    if (player.ai) {
      Crux.Text("ai_admin", "txt_right pad12")
        .grid(0, 0, 30, 3)
        .roost(playerPanel);
    }

    Crux.Image(`../images/avatars/160/${player.avatar}.jpg`, "abs")
      .grid(0, 6, 10, 10)
      .roost(playerPanel);

    Crux.Widget(`pci_48_${player.uid}`).grid(7, 13, 3, 3).roost(playerPanel);

    Crux.Widget("col_accent").grid(0, 3, 30, 3).roost(playerPanel);

    Crux.Text("", "screen_subtitle")
      .grid(0, 3, 30, 3)
      .rawHTML(player.qualifiedAlias)
      .roost(playerPanel);

    // Achievements
    var myAchievements;
    //U=>Toxic
    //V=>Magic
    //5=>Flombaeu
    //W=>Wizard
    if (universe.playerAchievements) {
      myAchievements = universe.playerAchievements[player.uid];
      if (ape_players?.includes(player.rawAlias)) {
        if (myAchievements.extra_badges == undefined) {
          myAchievements.extra_badges = true;
          ape_players.forEach((ape_name) => {
            if (ape_name == player.rawAlias) {
              myAchievements.badges = `a${myAchievements.badges}`;
            }
          });
        }
      }
    }
    if (myAchievements) {
      npui
        .SmallBadgeRow(myAchievements.badges)
        .grid(0, 3, 30, 3)
        .roost(playerPanel);
    }

    Crux.Widget("col_black").grid(10, 6, 20, 3).roost(playerPanel);
    if (player.uid != get_hero(NeptunesPride.universe).uid && player.ai == 0) {
      //Use this to only view when they are within scanning:
      //universe.selectedStar.v != "0"
      let total_sell_cost = get_tech_trade_cost(
        get_hero(NeptunesPride.universe),
        player,
      );

      /*** SHARE ALL TECH  ***/
      let btn = Crux.Button("", "share_all_tech", player)
        .addStyle("fwd")
        .rawHTML(`Share All Tech: $${total_sell_cost}`)
        .grid(10, 31, 14, 3);
      //Disable if in a game with FA & Scan (BUG)
      let config = NeptunesPride.gameConfig;
      if (!(config.tradeScanned && config.alliances)) {
        if (get_hero(NeptunesPride.universe).cash >= total_sell_cost) {
          btn.roost(playerPanel);
        } else {
          btn.disable().roost(playerPanel);
        }
      }

      /*** PAY FOR ALL TECH ***/
      let total_buy_cost = get_tech_trade_cost(
        player,
        get_hero(NeptunesPride.universe),
      );
      btn = Crux.Button("", "buy_all_tech", {
        player: player,
        tech: null,
        cost: total_buy_cost,
      })
        .addStyle("fwd")
        .rawHTML(`Pay for All Tech: $${total_buy_cost}`)
        .grid(10, 49, 14, 3);
      if (get_hero(NeptunesPride.universe).cash >= total_sell_cost) {
        btn.roost(playerPanel);
      } else {
        btn.disable().roost(playerPanel);
      }

      /*Individual techs*/
      let _name_map = {
        scanning: "Scanning",
        propulsion: "Hyperspace Range",
        terraforming: "Terraforming",
        research: "Experimentation",
        weapons: "Weapons",
        banking: "Banking",
        manufacturing: "Manufacturing",
      };
      let techs = [
        "scanning",
        "propulsion",
        "terraforming",
        "research",
        "weapons",
        "banking",
        "manufacturing",
      ];
      techs.forEach((tech, i) => {
        let one_tech_cost = get_tech_trade_cost(
          player,
          get_hero(NeptunesPride.universe),
          tech,
        );
        let one_tech = Crux.Button("", "buy_one_tech", {
          player: player,
          tech: tech,
          cost: one_tech_cost,
        })
          .addStyle("fwd")
          .rawHTML(`Pay: $${one_tech_cost}`)
          .grid(15, 34.5 + i * 2, 7, 2);
        if (
          get_hero(NeptunesPride.universe).cash >= one_tech_cost &&
          one_tech_cost > 0
        ) {
          one_tech.roost(playerPanel);
        }
      });
    }

    Crux.Text("you", "pad12 txt_center").grid(25, 6, 5, 3).roost(playerPanel);

    // Labels
    Crux.Text("total_stars", "pad8").grid(10, 9, 15, 3).roost(playerPanel);

    Crux.Text("total_fleets", "pad8").grid(10, 11, 15, 3).roost(playerPanel);

    Crux.Text("total_ships", "pad8").grid(10, 13, 15, 3).roost(playerPanel);

    Crux.Text("new_ships", "pad8").grid(10, 15, 15, 3).roost(playerPanel);

    // This players stats
    if (player !== universe.player) {
      Crux.Text("", "pad8 txt_center")
        .grid(20, 9, 5, 3)
        .rawHTML(player.total_stars)
        .roost(playerPanel);

      Crux.Text("", "pad8 txt_center")
        .grid(20, 11, 5, 3)
        .rawHTML(player.total_fleets)
        .roost(playerPanel);

      Crux.Text("", "pad8 txt_center")
        .grid(20, 13, 5, 3)
        .rawHTML(player.total_strength)
        .roost(playerPanel);

      Crux.Text("", "pad8 txt_center")
        .grid(20, 15, 5, 3)
        .rawHTML(player.shipsPerTick)
        .roost(playerPanel);
    }

    function selectHilightStyle(p1, p2) {
      p1 = Number(p1);
      p2 = Number(p2);
      if (p1 < p2) return " txt_warn_bad";
      if (p1 > p2) return " txt_warn_good";
      return "";
    }

    // Your stats
    if (universe.player) {
      Crux.Text(
        "",
        `pad8 txt_center ${selectHilightStyle(
          universe.player.total_stars,
          player.total_stars,
        )}`,
      )
        .grid(25, 9, 5, 3)
        .rawHTML(universe.player.total_stars)
        .roost(playerPanel);

      Crux.Text(
        "",
        `pad8 txt_center${selectHilightStyle(
          universe.player.total_fleets,
          player.total_fleets,
        )}`,
      )
        .grid(25, 11, 5, 3)
        .rawHTML(universe.player.total_fleets)
        .roost(playerPanel);

      Crux.Text(
        "",
        `pad8 txt_center${selectHilightStyle(
          universe.player.total_strength,
          player.total_strength,
        )}`,
      )
        .grid(25, 13, 5, 3)
        .rawHTML(universe.player.total_strength)
        .roost(playerPanel);

      Crux.Text(
        "",
        `pad8 txt_center${selectHilightStyle(
          universe.player.shipsPerTick,
          player.shipsPerTick,
        )}`,
      )
        .grid(25, 15, 5, 3)
        .rawHTML(universe.player.shipsPerTick)
        .roost(playerPanel);
    }

    Crux.Widget("col_accent").grid(0, 16, 10, 3).roost(playerPanel);

    if (universe.player) {
      var msgBtn = Crux.IconButton(
        "icon-mail",
        "inbox_new_message_to_player",
        player.uid,
      )
        .grid(0, 16, 3, 3)
        .addStyle("fwd")
        .disable()
        .roost(playerPanel);
      if (player !== universe.player && player.alias) {
        msgBtn.enable();
      }

      Crux.IconButton("icon-chart-line", "show_intel", player.uid)
        .grid(2.5, 16, 3, 3)
        .roost(playerPanel);

      if (showEmpire) {
        Crux.IconButton("icon-eye", "show_screen", "empire")
          .grid(7, 16, 3, 3)
          .roost(playerPanel);
      }
    }
    hook_npc_tick_counter();
    return playerPanel;
  };
};
let superStarInspector = NeptunesPride.npui.StarInspector;
NeptunesPride.npui.StarInspector = function () {
  let universe = NeptunesPride.universe;
  let config = NeptunesPride.gameConfig;

  //Call super (Previous StarInspector from gamecode)
  let starInspector = superStarInspector();
  Crux.IconButton("icon-help rel", "show_help", "stars").roost(
    starInspector.heading,
  );
  Crux.IconButton(
    "icon-doc-text rel",
    "show_screen",
    "combat_calculator",
  ).roost(starInspector.heading);

  //Append extra function
  async function apply_fractional_ships() {
    let depth = config.turnBased ? 4 : 3;
    let selector = `#contentArea > div > div.widget.fullscreen > div:nth-child(${depth}) > div > div:nth-child(5) > div.widget.pad12.icon-rocket-inline.txt_right`;

    let element = $(selector);
    let counter = 0;
    let fractional_ship = universe.selectedStar["c"].toFixed(2);
    $(selector).append(fractional_ship);

    while (element.length == 0 && counter <= 100) {
      await new Promise((r) => setTimeout(r, 10));
      element = $(selector);
      let fractional_ship = universe.selectedStar["c"];
      let new_value = parseInt($(selector).text()) + fractional_ship;
      $(selector).text(new_value.toFixed(2));
      counter += 1;
    }
  }
  if ("c" in universe.selectedStar) {
    apply_fractional_ships();
  }

  return starInspector;
};

//Javascript call
setTimeout(Legacy_NeptunesPrideAgent, 1000);
setTimeout(apply_hooks, 1500);

//Test to see if PlayerPanel is there
//If it is overwrites custom one
//Otherwise while loop & set timeout until its there
force_add_custom_player_panel();
