import { Game, NP, Universe, Player, Ledger, Config } from "./game";
import * as Crux from "./crux";
import { get_hero, Bindable } from "./utilities";
import * as Cache from "./event_cache";
import {Event, TechTransfer, MoneyTransfer} from './events';
//Get ledger info to see what is owed
//Actually shows the panel of loading
export function get_ledger(game: Game, crux: Crux.Crux, messages: unknown[]) {
  let npui = game.npui;
  let universe = game.universe;
  let players = universe.galaxy.players;

  let loading = crux
    .Text("", "rel txt_center pad12")
    .rawHTML(`Parsing ${messages.length} messages.`);
  loading.roost(npui.activeScreen);
  let uid = get_hero(universe).uid;

  //Ledger is a list of debts
  let ledger: Ledger = {};
  messages
    .filter(
      (m: Event) =>
        m.payload.template == "money_sent" ||
        m.payload.template == "shared_technology",
    )
    .map((m: Event) => m.payload)
    .forEach((m: TechTransfer | MoneyTransfer) => {
      let liaison: number = m.from_puid == uid ? m.to_puid : m.from_puid;
      let value: number = m.template == "money_sent" ? m.amount : m.price;
      value *= m.from_puid == uid ? 1 : -1; // amount is (+) if credit & (-) if debt
      liaison in ledger
        ? (ledger[liaison] += value)
        : (ledger[liaison] = value);
    });
  //TODO: Review that this is correctly finding a list of only people who have debts.

  //Accounts are the credit or debit related to each user
  let accounts = [];
  for (let uid in ledger) {
    let player: Player = players[parseInt(uid)];
    player.debt = ledger[uid];
    accounts.push(player);
  }
  get_hero(universe).ledger = ledger;
  console.log(accounts);
  return accounts;
}

export function renderLedger(game: Game, crux: Crux.Crux, MouseTrap: Bindable) {
  //Deconstruction of different components of the game.
  let config = game.config;
  let np = game.np;
  let npui = game.npui;
  let universe = game.universe;
  let templates = game.templates;
  let players = universe.galaxy.players;

  MouseTrap.bind(["m", "M"], function () {
    np.trigger("trigger_ledger");
  });
  templates["ledger"] = "Ledger";
  templates["tech_trading"] = "Trading Technology";
  templates["forgive"] = "Pay Debt";
  templates["forgive_debt"] = "Are you sure you want to forgive this debt?";
  if (!npui.hasmenuitem) {
    npui
      .SideMenuItem("icon-database", "ledger", "trigger_ledger")
      .roost(npui.sideMenu);
    npui.hasmenuitem = true;
  }
  npui.ledgerScreen = () => {
    return npui.Screen("ledger");
  };
  np.on("trigger_ledger", () => {
    const ledgerScreen = npui.ledgerScreen();
    let loading = crux
      .Text("", "rel txt_center pad12 section_title")
      .rawHTML("Tabulating Ledger...");
    loading.roost(ledgerScreen);

    npui.onHideScreen(null, true);
    npui.onHideSelectionMenu();
    npui.trigger("hide_side_menu");
    npui.trigger("reset_edit_mode");
    npui.activeScreen = ledgerScreen;
    ledgerScreen.roost(npui.screenContainer);
    npui.layoutElement(ledgerScreen);

    Cache.update_event_cache(game,crux,4, Cache.recieve_new_messages, console.error);
  });

  interface ForgiveDebtEvent {
    targetPlayer: number //The player ID to pay
  }
  //Why not np.on("ForgiveDebt")?
  np.onForgiveDebt = function (event: string, data: ForgiveDebtEvent) {
    let targetPlayer = data.targetPlayer;
    let player = players[targetPlayer];
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
  np.on("confirm_forgive_debt", (event: unknown, data: unknown) => {
    np.trigger("server_request", data);
    np.trigger("trigger_ledger");
  });
  np.on("forgive_debt", np.onForgiveDebt);
}
