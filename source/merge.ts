import { Game, getGame, getUniverse, Hero } from "./game";
import { get_hero } from "./utilities";

let originalPlayer: Hero = undefined;

function set_original_player(): boolean {
  if (originalPlayer === undefined) {
    originalPlayer = get_hero(getUniverse());
    return true;
  }
  return false;
}
//Needs access to Universe!
export function mergeUser(event: Event, data: string) {
  let game = NeptunesPride;
  let universe = game.universe;
  //This saves the actual client's player.
  set_original_player();
  console.log(event);
  //Extract code
  let code: string = data?.split(":")[1];
  console.log(code);
  if (otherUserCode) {
    let params = {
      game_number: game,
      api_version: "0.1",
      code: otherUserCode,
    };
    fetch();
    let eggers = jQuery.ajax({
      type: "POST",
      url: "https://np.ironhelmet.com/api",
      async: false,
      data: params,
      dataType: "json",
    });
    //TODO: BLOCK LOADING MY OWN STARS
    let universe = NeptunesPride.universe;
    let scan = eggers.responseJSON.scanning_data;
    universe.galaxy.stars = { ...scan.stars, ...universe.galaxy.stars };
    for (let s in scan.stars) {
      const star = scan.stars[s];
      //Add here a statement to skip if it is hero's star.
      if (star.v !== "0") {
        universe.galaxy.stars[s] = { ...universe.galaxy.stars[s], ...star };
      }
    }
    universe.galaxy.fleets = { ...scan.fleets, ...universe.galaxy.fleets };
    NeptunesPride.np.onFullUniverse(null, universe.galaxy);
    NeptunesPride.npui.onHideScreen(null, true);
    init(); //INIT??????
  }
}
