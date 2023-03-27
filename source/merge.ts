import { Star } from "./interfaces/star";
import { ApiData, ApiError, ScanningData } from "./utilities/api";
import {
  get_galaxy,
  get_game_number,
  get_universe,
  get_visible_stars,
} from "./utilities/get_game_state";
import { get_api_data } from "./utilities/api";
import { Carrier } from "./interfaces/carrier";

let originalPlayer: number = undefined;

//This saves the actual client's player.
function set_original_player(): boolean {
  if (originalPlayer === undefined) {
    originalPlayer = NeptunesPride.originalPlayer;
    return true;
  }
  return false;
}

function valid_apikey(apikey: string): boolean {
  return true;
}
function bad_key(err?: ApiError): void {
  console.log("The key is bad and merging FAILED!");
}
export function mergeUser(event: Event, data: string) {
  set_original_player();

  //Extract that KEY
  //TODO: Add regex to get THAT KEY
  let apikey: string = data?.split(":")[1];
  console.log(apikey);

  if (valid_apikey(apikey)) {
    get_api_data(apikey)
      .then((data: ApiData | ApiError) => {
        return "error" in data
          ? bad_key(data)
          : mergeUserData(data.scanning_data);
      })
      .catch(console.log);
  }
}

//Combine data from another user
//Callback on API ..
//mechanic closes at 5pk,m
export function mergeUserData(scanningData: ScanningData) {
  let galaxy = get_galaxy();
  let stars: { [index: string]: Star } = scanningData.stars;
  let fleets: { [index: string]: Carrier } = scanningData.fleets;
  // Update stars
  for (const starId in stars) {
    const star = stars[starId];
    if (Object.keys(galaxy.stars).indexOf(starId) !== -1) {
      // The star already exists, do something
      console.log("Star already exists in the galaxy");
    } else {
      // The star does not exist, add it to the galaxy
      galaxy.stars[starId] = star;
    }
  }

  // Add fleets
  for (const fleetId in fleets) {
    const fleet = fleets[fleetId];
    // Check if the fleet already exists in the galaxy
    if (Object.keys(galaxy.fleets).indexOf(fleetId) !== -1) {
      // The fleet already exists, do something
      console.log("Fleet already exists in the galaxy");
    } else {
      // The fleet does not exist, add it to the galaxy
      galaxy.fleets[fleetId] = fleet;
    }
  }
  //NeptunesPride.np.onFullUniverse(null, galaxy);
  //NeptunesPride.npui.onHideScreen(null, true);
}
