import { Delaunay } from "d3-delaunay";
import { Universe } from "../interfaces/universe";
import { Star } from "../interfaces/star";

interface Point {
  0: number;
  1: number;
}

export function getTerritory(universe: Universe, canvas: HTMLCanvasElement) {
  let star_map = universe.galaxy.stars;
  let stars: Star[] = [];
  for (let star_id in star_map) {
    stars.push(star_map[star_id]);
  }
  let positions = stars.map((star: Star) => {
    return [star.x, star.y] as [number, number];
  });

  const delaunay = Delaunay.from(positions);
  const voronoi = delaunay.voronoi([0, 0, 960, 500]);
  const context = canvas.getContext("2d");
  if (context) {
    context.beginPath();
    for (const polygon of voronoi.cellPolygons()) {
      context.moveTo(polygon[0][0], polygon[0][1]);
      for (const point of polygon) {
        context.lineTo(point[0], point[1]);
      }
      context.closePath();
    }
    context.stroke();
  }
}
