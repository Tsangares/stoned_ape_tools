import { MapContext, MAP } from "./crux";
import { Galaxy, Carrier, Universe } from "./game";

export function drawOverlayString(
  context: MapContext,
  text: string,
  x: number,
  y: number,
  fgColor: string,
): void {
  context.fillStyle = "#000000";
  for (let smear = 1; smear < 4; ++smear) {
    context.fillText(text, x + smear, y + smear);
    context.fillText(text, x - smear, y + smear);
    context.fillText(text, x - smear, y - smear);
    context.fillText(text, x + smear, y - smear);
  }
  context.fillStyle = fgColor || "#00ff00";
  context.fillText(text, x, y);
}
export function anyStarCanSee(
  universe: Universe,
  owner: number,
  fleet: Carrier,
): boolean {
  let stars = universe.galaxy.stars;
  let scanRange = universe.galaxy.players[owner].tech.scanning.value;
  for (const s in stars) {
    let star = stars[s];
    if (star.puid == owner) {
      let distance = universe.distance(star.x, star.y, fleet.x, fleet.y);
      if (distance <= scanRange) {
        return true;
      }
    }
  }
  return false;
}
