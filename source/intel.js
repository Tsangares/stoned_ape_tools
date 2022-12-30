import { image_url } from "./imageutils";
import { clip, lastClip } from "./hotkey";

/* global define, Crux, NeptunesPride, Mousetrap, jQuery, Cookies, $ */

const sat_version = "2.21";

//Custom UI ComponentsNe
const PlayerNameIconRowLink = (player) => {
  let playerNameIconRow = Crux.Widget("rel col_black clickable").size(480, 48);

  NeptunesPride.npui.PlayerIcon(player, true).roost(playerNameIconRow);

  Crux.Text("", "section_title")
    .grid(6, 0, 21, 3)
    .rawHTML(
      `<a onclick="Crux.crux.trigger('show_player_uid', '${player.uid}' )">${player.alias}</a>`,
    )
    .roost(playerNameIconRow);

  return playerNameIconRow;
};

//Get ledger info to see what is owed

const get_hero = () => {
  let gal = NeptunesPride.universe.galaxy;
  let player = gal["player_uid"];
  return gal.players[Number(player)];
};

const get_ledger = (messages) => {
  let loading = Crux.Text("", "rel txt_center pad12").rawHTML(
    `Parsing ${messages.length} messages.`,
  );
  loading.roost(NeptunesPride.npui.activeScreen);
  let uid = get_hero().uid;
  let ledger = {};
  messages
    .filter(
      (m) =>
        m.payload.template == "money_sent" ||
        m.payload.template == "shared_technology",
    )
    .map((m) => m.payload)
    .forEach((m) => {
      let liaison = m.from_puid == uid ? m.to_puid : m.from_puid;
      let value = m.template == "money_sent" ? m.amount : m.price;
      value *= m.from_puid == uid ? 1 : -1; // amount is (+) if credit & (-) if debt
      liaison in ledger
        ? (ledger[liaison] += value)
        : (ledger[liaison] = value);
    });

  let players = [];
  for (const [_key, p] of Object.entries(
    NeptunesPride.universe.galaxy.players,
  )) {
    p.debt = 0;
  }
  for (let uid in ledger) {
    let player = NeptunesPride.universe.galaxy.players[uid];
    player.debt = ledger[uid];
    players.push(player);
  }
  get_hero().ledger = ledger;
  return players;
};

/*
Ledger Display
*/
//Handler for new message ajax request

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
let cached_events = [];
let cacheFetchStart = new Date();
let cacheFetchSize = 0;

const update_event_cache = (fetchSize, success, error) => {
  const count = cached_events.length > 0 ? fetchSize : 100000;

  cacheFetchStart = new Date();
  cacheFetchSize = count;

  jQuery.ajax({
    type: "POST",
    url: "/trequest/fetch_game_messages",
    async: true,
    data: {
      type: "fetch_game_messages",
      count,
      offset: 0,
      group: "game_event",
      version: NeptunesPride.version,
      game_number: NeptunesPride.gameNumber,
    },
    success,
    error,
    dataType: "json",
  });
};
const recieve_new_messages = (response) => {
  const cacheFetchEnd = new Date();
  const elapsed = cacheFetchEnd.getTime() - cacheFetchStart.getTime();
  console.log(`Fetched ${cacheFetchSize} events in ${elapsed}ms`);

  const npui = NeptunesPride.npui;
  const universe = NeptunesPride.universe;
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
      update_event_cache(size, recieve_new_messages, console.error);
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
      update_event_cache(100000, recieve_new_messages, console.error);
    }
  }
  cached_events = incoming.concat(cached_events);
  const players = get_ledger(cached_events);

  const ledgerScreen = npui.ledgerScreen();

  npui.onHideScreen(null, true);
  npui.onHideSelectionMenu();
  npui.trigger("hide_side_menu");
  npui.trigger("reset_edit_mode");
  npui.activeScreen = ledgerScreen;
  ledgerScreen.roost(npui.screenContainer);
  npui.layoutElement(ledgerScreen);

  players.forEach((p) => {
    let player = PlayerNameIconRowLink(universe.galaxy.players[p.uid]).roost(
      npui.activeScreen,
    );
    player.addStyle("player_cell");
    let prompt = p.debt > 0 ? "They owe" : "You owe";
    if (p.debt == 0) {
      prompt = "Balance";
    }
    if (p.debt < 0) {
      Crux.Text("", "pad12 txt_right red-text")
        .rawHTML(`${prompt}: ${p.debt}`)
        .grid(20, 0, 10, 3)
        .roost(player);
      // rome-ignore lint/complexity/useSimplifiedLogicExpression: @Lorentz?
      if (true || p.debt * -1 <= get_hero().cash) {
        Crux.Button("forgive", "forgive_debt", { targetPlayer: p.uid })
          .grid(17, 0, 6, 3)
          .roost(player);
      }
    } else if (p.debt > 0) {
      Crux.Text("", "pad12 txt_right blue-text")
        .rawHTML(`${prompt}: ${p.debt}`)
        .grid(20, 0, 10, 3)
        .roost(player);
    } else if (p.debt == 0) {
      Crux.Text("", "pad12 txt_right orange-text")
        .rawHTML(`${prompt}: ${p.debt}`)
        .grid(20, 0, 10, 3)
        .roost(player);
    }
  });
};

const renderLedger = () => {
  Mousetrap.bind(["m", "M"], function () {
    NeptunesPride.np.trigger("trigger_ledger");
  });
  const np = NeptunesPride.np;
  const npui = NeptunesPride.npui;
  const universe = NeptunesPride.universe;
  NeptunesPride.templates["ledger"] = "Ledger";
  NeptunesPride.templates["tech_trading"] = "Trading Technology";
  NeptunesPride.templates["forgive"] = "Pay Debt";
  NeptunesPride.templates["forgive_debt"] =
    "Are you sure you want to forgive this debt?";
  if (!npui.hasmenuitem) {
    npui
      .SideMenuItem("icon-database", "ledger", "trigger_ledger")
      .roost(npui.sideMenu);
    npui.hasmenuitem = true;
  }
  npui.ledgerScreen = (_config) => {
    return npui.Screen("ledger");
  };
  NeptunesPride.np.on("trigger_ledger", () => {
    const ledgerScreen = npui.ledgerScreen();
    let loading = Crux.Text("", "rel txt_center pad12 section_title").rawHTML(
      "Tabulating Ledger...",
    );
    loading.roost(ledgerScreen);

    npui.onHideScreen(null, true);
    npui.onHideSelectionMenu();
    npui.trigger("hide_side_menu");
    npui.trigger("reset_edit_mode");
    npui.activeScreen = ledgerScreen;
    ledgerScreen.roost(npui.screenContainer);
    npui.layoutElement(ledgerScreen);

    update_event_cache(4, recieve_new_messages, console.error);
  });

  np.onForgiveDebt = function (event, data) {
    let targetPlayer = data.targetPlayer;
    let player = universe.galaxy.players[targetPlayer];
    let amount = player.debt * -1;
    //let amount = 1
    universe.player.ledger[targetPlayer] = 0;
    np.trigger("show_screen", [
      "confirm",
      {
        message: "forgive_debt",
        eventKind: "confirm_forgive_debt",
        eventData: {
          type: "order",
          order: `send_money,${targetPlayer},${amount}`,
        },
      },
    ]);
  };
  np.on("confirm_forgive_debt", (event, data) => {
    np.trigger("server_request", data);
    np.trigger("trigger_ledger");
  });
  np.on("forgive_debt", np.onForgiveDebt);
};

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

const get_research = () => {
  let hero = get_hero();
  let science = hero.total_science;

  //Current Science
  let current = hero.tech[hero.researching];
  let current_points_remaining =
    current["brr"] * current["level"] - current["research"];
  let eta = Math.ceil(current_points_remaining / science); //Hours

  //Next science
  let next = hero.tech[hero.researching_next];
  let next_points_remaining = next["brr"] * next["level"] - next["research"];
  let next_eta = Math.ceil(next_points_remaining / science) + eta;
  let next_level = next["level"] + 1;
  if (hero.researching == hero.researching_next) {
    //Recurring research
    next_points_remaining += next["brr"];
    next_eta = Math.ceil((next["brr"] * next["level"] + 1) / science) + eta;
    next_level += 1;
  }
  let name_map = {
    scanning: "Scanning",
    propulsion: "Hyperspace Range",
    terraforming: "Terraforming",
    research: "Experimentation",
    weapons: "Weapons",
    banking: "Banking",
    manufacturing: "Manufacturing",
  };

  return {
    current_name: name_map[hero.researching],
    current_level: current["level"] + 1,
    current_eta: eta,
    next_name: name_map[hero.researching_next],
    next_level: next_level,
    next_eta: next_eta,
    science: science,
  };
};

const get_research_text = () => {
  const research = get_research();
  let first_line = `Now: ${research["current_name"]} ${research["current_level"]} - ${research["current_eta"]} ticks.`;
  let second_line = `Next: ${research["next_name"]} ${research["next_level"]} - ${research["next_eta"]} ticks.`;
  let third_line = `My Science: ${research["science"]}`;
  return `${first_line}\n${second_line}\n${third_line}\n`;
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
const apply_hooks = () => {
  NeptunesPride.np.on("share_all_tech", (event, player) => {
    let total_cost = get_tech_trade_cost(get_hero(), player);
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
    console.log(player);
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
    let hero = get_hero();
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

function InstallResearchButton() {
  const npui = NeptunesPride.npui;
  //Research button to quickly tell friends research
  NeptunesPride.templates["npa_research"] = "Research";

  let superNewMessageCommentBox = npui.NewMessageCommentBox;

  let reportResearchHook = function (_e, _d) {
    let text = get_research_text();
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
    ).grid(14, 12, 6, 3);
    research_button.roost(widget);
    return widget;
  };
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

    var myAchievements;
    //U=>Toxic
    //V=>Magic
    //5=>Flombaeu
    //W=>Wizard
    if (universe.playerAchievements) {
      myAchievements = universe.playerAchievements[player.uid];
      if (
        player.rawAlias == "Lorentz" &&
        "W" != myAchievements.badges.slice(0, 1)
      ) {
        myAchievements.badges = `W${myAchievements.badges}`;
      } else if (
        player.rawAlias == "A Stoned Ape" &&
        "5" != myAchievements.badges.slice(0, 1)
      ) {
        myAchievements.badges = `5${myAchievements.badges}`;
      }
    }
    if (myAchievements) {
      npui
        .SmallBadgeRow(myAchievements.badges)
        .grid(0, 3, 30, 3)
        .roost(playerPanel);
    }

    Crux.Widget("col_black").grid(10, 6, 20, 3).roost(playerPanel);
    if (player.uid != get_hero().uid && player.ai == 0) {
      //Use this to only view when they are within scanning:
      //universe.selectedStar.v != "0"
      let total_sell_cost = get_tech_trade_cost(get_hero(), player);
      let btn = Crux.Button("", "share_all_tech", player)
        .addStyle("fwd")
        .rawHTML(`Share All Tech: $${total_sell_cost}`)
        .grid(10, 31, 14, 3);
      if (get_hero().cash >= total_sell_cost) {
        btn.roost(playerPanel);
      } else {
        btn.disable().roost(playerPanel);
      }
      let total_buy_cost = get_tech_trade_cost(player, get_hero());
      btn = Crux.Button("", "buy_all_tech", {
        player: player,
        tech: null,
        cost: total_buy_cost,
      })
        .addStyle("fwd")
        .rawHTML(`Pay for All Tech: $${total_buy_cost}`)
        .grid(10, 49, 14, 3);
      if (get_hero().cash >= total_sell_cost) {
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
        let one_tech_cost = get_tech_trade_cost(player, get_hero(), tech);
        let one_tech = Crux.Button("", "buy_one_tech", {
          player: player,
          tech: tech,
          cost: one_tech_cost,
        })
          .addStyle("fwd")
          .rawHTML(`Pay: $${one_tech_cost}`)
          .grid(15, 34.5 + i * 2, 7, 2);
        if (get_hero().cash >= one_tech_cost && one_tech_cost > 0) {
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

    return playerPanel;
  };
};

NeptunesPride.npui.StarInspector = function () {
  let npui = NeptunesPride.npui;
  let universe = NeptunesPride.universe;
  var starInspector = npui.Screen();
  starInspector.heading.rawHTML(universe.selectedStar.n);

  Crux.IconButton("icon-help", "show_help", "stars")
    .grid(24.5, 0, 3, 3)
    .roost(starInspector);

  Crux.IconButton("icon-doc-text", "show_screen", "combat_calculator")
    .grid(22, 0, 3, 3)
    .roost(starInspector);

  var starKind = "unscanned_star";
  if (!universe.selectedStar.player) {
    starKind = "unclaimed_star";
  } else {
    starKind = "enemy_star";
    if (universe.selectedStar.v === "0") {
      starKind = "unscanned_enemy";
    }
  }

  if (universe.selectedStar.owned) {
    starKind = "my_star";
  }
  // subtitle
  starInspector.intro = Crux.Widget("rel").roost(starInspector);

  Crux.Text(starKind, "pad12 rel col_black txt_center")
    .format(universe.selectedStar)
    .roost(starInspector.intro);

  if (starKind === "unclaimed_star") {
    npui.StarResStatus(true, false).roost(starInspector);
    starInspector.footerRequired = false;
  }

  if (starKind === "unscanned_enemy") {
    npui.StarResStatus(true, false).roost(starInspector);

    npui.PlayerPanel(universe.selectedStar.player, true).roost(starInspector);
  }

  if (starKind === "enemy_star") {
    npui.StarDefStatus(false).roost(starInspector);

    npui.StarInfStatus(false).roost(starInspector);

    Crux.Widget("rel col_black").size(480, 8).roost(starInspector);

    npui.ShipConstructionRate().roost(starInspector);

    if (universe.selectedStar.ga > 0) {
      Crux.Widget("rel col_black").size(480, 8).roost(starInspector);
      Crux.Text("has_warp_gate", "rel col_accent pad12 txt_center")
        .size(480, 48)
        .roost(starInspector);
    }

    npui.PlayerPanel(universe.selectedStar.player, true).roost(starInspector);
  }

  if (starKind === "my_star") {
    npui.StarDefStatus(true).roost(starInspector);

    npui.StarInfStatus(true).roost(starInspector);

    Crux.Widget("rel col_black").size(480, 8).roost(starInspector);

    npui.ShipConstructionRate().roost(starInspector);

    Crux.Widget("rel col_black").size(480, 8).roost(starInspector);

    npui.StarBuildFleet().roost(starInspector);

    if (NeptunesPride.gameConfig.buildGates !== 0) {
      Crux.Widget("rel col_black").size(480, 8).roost(starInspector);

      npui.StarGateStatus(true).roost(starInspector);
    } else {
      if (universe.selectedStar.ga > 0) {
        Crux.Widget("rel col_black").size(480, 8).roost(starInspector);
        Crux.Text("has_warp_gate", "rel col_accent pad12 txt_center")
          .size(480, 48)
          .roost(starInspector);
      }
    }

    Crux.Widget("rel col_black").size(480, 8).roost(starInspector);

    npui.StarAbandon().roost(starInspector);

    npui.StarPremium().roost(starInspector);

    npui.PlayerPanel(universe.selectedStar.player, true).roost(starInspector);
  }

  async function apply_fractional_ships() {
    let depth = NeptunesPride.gameConfig.turnBased ? 4 : 3;
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

setTimeout(InstallResearchButton, 1000);
setTimeout(renderLedger, 2000);
setTimeout(apply_hooks, 2000);

//Test to see if PlayerPanel is there
//If it is overwrites custom one
//Otherwise while loop & set timeout until its there
force_add_custom_player_panel();
