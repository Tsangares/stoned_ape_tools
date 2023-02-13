import { Game, NP, Universe, Player, Ledger, Config } from "./game";
import * as Crux from "./crux";
import { get_hero, Bindable } from "./utilities";
import * as Cache from "./event_cache";

interface Event {
  payload: Payload;
  status: string; //read or unread
  key: string; //Unique per event
  group: string; //Always "game_event" unless messages
  created: string; //Date string
  activity: string; //Equivalent to created?
  comment_count: number; //TODO: Needs description
  comments: unknown; //TODO: Needs description
  commentsLoaded: boolean; //TODO: Needs description
}

//A Payload is either a tech/money transfer, battle, afk/quit event or message.
interface Payload {
  template: string; //Descibes the payload type
  tick: number; //Tick the event occured on
  created: unknown;
  creationTime: string;
}

interface Transfer extends Payload {
  from_puid: number; //Player's ID who SENT
  to_puid: number; //Player's ID who RECIEVED

  giverName: string; //Sender's alias
  giverUid: number; //alias of from_puid
  giverColour: string; //HTML String: "<span class='playericon_font pc_3'>1</span>"
  receiverName: string; //Reciever's alias
  receiverUid: number; //alias of to_puid
  receiverColour: string;
}
interface MoneyTransfer extends Transfer {
  template: "money_sent";
  amount: number;
}

interface TechTransfer extends Transfer {
  template: "shared_technology";
  price: number; //Cost of transfer
  name: string; //Name of technology
  display_name: string; //Acutal name of the technology
  level: number; //Level of the tech
}

interface Battle extends Payload {
  template: "combat_mk_ii";
  attackers: Ship[]; //List of attacking ships
  defenders: Ship[]; //List of defending ships
  aw: number; //Attacher Weapons
  dw: number; //Defender Weapons (After advantage)
  loot: number; //Econ reward
  looter: number; //uid of winner
}
interface Ship {}

interface AFK extends Payload {
  template: "goodbye_to_player_inactivity";
  name: string; //HTML string
  uid: number; //User ID
  colour: string; //HTML color stirng
}

//Get ledger info to see what is owed
//Actually shows the panel of loading
export function get_ledger(game: Game, crux: Crux.Crux, messages: unknown[]) {
  let templates = game.templates;
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

    Cache.update_event_cache(4, Cache.recieve_new_messages, console.error);
  });
  //Why not np.on("ForgiveDebt")?
  np.onForgiveDebt = function (event: string, data: unknown) {
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
