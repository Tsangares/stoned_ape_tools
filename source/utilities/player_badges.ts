import { Crux } from "../interfaces/crux";

const KV_REST_API_URL = "https://immune-cricket-36011.kv.vercel-storage.com";
const KV_REST_API_READ_ONLY_TOKEN =
  "AoyrASQgNzE0M2E2NTMtMmFjNC00ZTFlLWJmNTItMGRlYWZmMmY3MTc0ZptG96elbXOjZJ7_GE7w-arYAGCaktoo25q4DXRWL7U=";

// Function that connects to server and retrieves list on key 'ape'
export const get_ape_badges = async () => {
  return fetch(KV_REST_API_URL, {
    headers: {
      Authorization: `Bearer ${KV_REST_API_READ_ONLY_TOKEN}`,
    },
    body: '["LRANGE", "ape", 0, -1]',
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => data.result);
};

/* Updating Badge Classes */
export const ApeBadgeIcon = function (
  Crux: Crux,
  url: string,
  filename: string,
  count: number,
  small: boolean,
) {
  var ebi = Crux.Widget();
  if (small === undefined) small = false;

  if (small) {
    /* Small images */
    let image_url = `/images/badges_small/${filename}.png`;
    if (filename == "ape") {
      image_url = `${url}${filename}_small.png`;
    }

    Crux.Image(image_url, "abs").grid(0.25, 0.25, 2.5, 2.5).roost(ebi);

    Crux.Clickable("show_screen", "buy_gift")
      .grid(0.25, 0.25, 2.5, 2.5)
      .tt(`badge_${filename}`)
      .roost(ebi);
  } else {
    /* Big images */
    let image_url = `/images/badges/${filename}.png`;
    if (filename == "ape") {
      image_url = `${url}${filename}.png`;
    }

    Crux.Image(image_url, "abs").grid(0, 0, 6, 6).tt(filename).roost(ebi);

    Crux.Clickable("show_screen", "buy_gift")
      .grid(0, 0, 6, 6)
      .tt(`badge_${filename}`)
      .roost(ebi);
  }

  if (count > 1 && !small) {
    Crux.Image("/images/badges/counter.png", "abs")
      .grid(0, 0, 6, 6)
      .tt(filename)
      .roost(ebi);

    Crux.Text("", "txt_center txt_tiny", "abs")
      .rawHTML(count)
      .pos(51, 64)
      .size(32, 32)
      .roost(ebi);
  }

  return ebi;
};
/*
const groupApeBadges = function (badgesString: string) {
  if (!badgesString) badgesString = "";
  var groupedBadges: { [key: string]: number } = {};
  var i;
  for (i = badgesString.length - 1; i >= 0; i--) {
    var bchar = badgesString.charAt(i);
    if (groupedBadges.hasOwnProperty(bchar)) {
      groupedBadges[bchar] += 1;
    } else {
      groupedBadges[bchar] = 1;
    }
  }
  return groupedBadges;
};
*/
