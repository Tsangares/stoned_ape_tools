import { buyApeGiftScreen } from "../utilities/gift_shop";
import { Crux, NPUI, Widget } from "./crux";
import { Universe } from "./universe";
/*
const overrideGiftItems = (Crux: Crux, npui: NPUI) => {
    npui.BuyGiftScreen = () => {
        return buyApeGiftScreen(Crux, NeptunesPride.universe, NeptunesPride.npui);
    }
}
*/
export const onShowApeScreen = function (
  npui: NPUI,
  universe: Universe,
  event: string,
  screenName: string,
  screenConfig: string,
) {
  var scroll = 0;
  if (npui.showingScreen === screenName) {
    scroll = jQuery(window).scrollTop();
  } else {
    jQuery(window).scrollTop(0);
    npui.trigger("play_sound", "screen_open");
  }

  npui.onHideScreen(null, true);
  npui.onHideSelectionMenu();

  npui.trigger("hide_side_menu");
  npui.trigger("reset_edit_mode");

  npui.showingScreen = screenName;
  npui.screenConfig = screenConfig;

  // the player has quit this game and is inly able to see game over screen
  // note: I haven't built the game over screen yet but I will need to
  // show who has quit early, even if the game is not yet won
  if (universe.player && universe.player.conceded > 0) {
    if (
      screenName === "star" ||
      screenName === "fleet" ||
      screenName === "ship_transfer" ||
      screenName === "new_fleet"
    ) {
      npui.showingScreen = "leaderboard";
    }
  }

  // the player is not in this game yet the only window they are allowed
  // to see is the join game window.(and a few others)
  if (
    !universe.player &&
    screenName !== "confirm" &&
    screenName !== "game_password" &&
    screenName !== "custom_settings" &&
    screenName !== "empire" &&
    screenName !== "help"
  ) {
    npui.showingScreen = "join_game";
  }

  var screens: { [key: string]: Widget } = {
    main_menu: npui.MainMenuScreen,
    compose: npui.ComposeDiplomacyScreen,

    inbox: npui.InboxScreen,

    diplomacy_detail: npui.DiplomacyDetailScreen,

    join_game: npui.JoinGameScreen,
    empire: npui.EmpireScreen,
    leaderboard: npui.LeaderboardScreen,
    options: npui.OptionsScreen,
    tech: npui.TechScreen,

    star: npui.StarInspector,
    fleet: npui.FleetInspector,

    edit_order: npui.EditFleetOrder,

    bulk_upgrade: npui.BulkUpgradeScreen,

    ship_transfer: npui.ShipTransferScreen,
    new_fleet: npui.NewFleetScreen,

    star_dir: npui.StarDirectory,
    fleet_dir: npui.FleetDirectory,
    ship_dir: npui.ShipDirectory,

    combat_calculator: npui.CombatCalc,

    custom_settings: npui.CustomSettingsScreen,

    confirm: npui.ConfirmScreen,

    help: npui.HelpScreen,

    select_player: npui.SelectPlayerScreen,

    buy_gift: npui.BuyGiftScreen,
    buy_premium_gift: npui.BuyPremiumGiftScreen,

    intel: npui.Intel,
  };

  npui.activeScreen = screens[npui.showingScreen](screenConfig);

  if (npui.activeScreen) {
    npui.activeScreen.roost(npui.screenContainer);
    npui.layoutElement(npui.activeScreen);
  }

  jQuery(window).scrollTop(scroll);
};
