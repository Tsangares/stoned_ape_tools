import { BadgeItemInterface, Crux, NPUI, Screen } from "../interfaces/crux";
import { Universe } from "../interfaces/universe";

export const buyApeGiftScreen = function (
  Crux: Crux,
  universe: Universe,
  npui: NPUI,
): Screen {
  console.log("Overloadded Gift Screen");
  var buy = npui.Screen("gift_heading").size(480);

  Crux.Text("gift_intro", "rel pad12 col_accent txt_center")
    .format({
      player:
        universe.selectedPlayer.colourBox +
        universe.selectedPlayer.hyperlinkedAlias,
    })
    .size(480)
    .roost(buy);

  npui.GalacticCreditBalance().roost(buy);

  var i;

  var menu: BadgeItemInterface[] = [
    { icon: "trek", amount: 1 },
    { icon: "rebel", amount: 1 },
    { icon: "empire", amount: 1 },
    { icon: "wolf", amount: 5 },

    { icon: "toxic", amount: 10 },

    { icon: "pirate", amount: 5 },
    { icon: "wordsmith", amount: 2 },
    { icon: "lucky", amount: 2 },
    { icon: "ironborn", amount: 2 },
    { icon: "strange", amount: 2 },

    { icon: "ape", amount: 999 },

    { icon: "cheesy", amount: 1 },
    { icon: "strategic", amount: 1 },
    { icon: "badass", amount: 1 },
    { icon: "lionheart", amount: 1 },
    { icon: "gun", amount: 1 },
    { icon: "command", amount: 1 },
    { icon: "science", amount: 1 },
    { icon: "nerd", amount: 1 },
    { icon: "merit", amount: 1 },
  ];

  let secret_menu: BadgeItemInterface[] = [
    { icon: "honour", amount: 1 },
    { icon: "wizard", amount: 1 },
    { icon: "lifetime", amount: 1 },
    { icon: "tourney_win", amount: 1 },
    { icon: "tourney_join", amount: 1 },
    { icon: "tourney_join", amount: 1 },
    { icon: "tourney_join", amount: 1 },
    { icon: "bullseye", amount: 1 },
    { icon: "proteus", amount: 1 },
    { icon: "flambeau", amount: 1 },
    { icon: "rat", amount: 1 },
  ];

  //let items: BadgeItemInterface[] = menu + secret_menu;
  let items = menu;
  for (i = items.length - 1; i >= 0; i--) {
    items[i].puid = universe.selectedPlayer.uid;
    npui.GiftItem(items[i]).roost(buy);
  }

  return buy;
};

export const ApeGiftItem = function (
  Crux: Crux,
  url: string,
  item: BadgeItemInterface,
) {
  var gi = Crux.Widget("rel").size(480);

  Crux.Widget("rel col_base").size(480, 16).roost(gi);

  let image_url = `../images/badges/${item.icon}.png`;
  if (item.icon == "ape") {
    image_url = `${url}${item.icon}.png`;
  }
  gi.icon = Crux.Image(image_url, "abs").grid(0.25, 1, 6, 6).roost(gi);

  gi.body = Crux.Text(`gift_desc_${item.icon}`, "rel txt_selectable")
    .size(384 - 24)
    .pos(96 + 12)
    .roost(gi);

  gi.buyNowBg = Crux.Widget("rel").size(480, 52).roost(gi);

  gi.buyNowButton = Crux.Button("buy_now", "buy_gift", item)
    .grid(20, 0, 10, 3)
    .roost(gi.buyNowBg);

  if (item.amount > NeptunesPride.account.credits) {
    gi.buyNowButton.disable();
  }
  Crux.Widget("rel col_accent").size(480, 4).roost(gi);

  return gi;
};
