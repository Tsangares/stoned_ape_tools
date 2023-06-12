import { universe, map, crux } from "../game_state";
import { Star } from "../interfaces/star";
import { Universe } from "../interfaces/universe";
import { Delaunay } from "d3-delaunay";
//import * as turf from '@turf/turf';
import { Feature, Polygon, MultiPolygon } from "@turf/helpers";
import * as turf from "@turf/turf";
import { Position } from "vitest";

const get_total_natural_resources = function () {
  let player = universe.player;
  let natual_resources: number = 0;
  let star;
  for (let s in universe.galaxy.stars) {
    star = universe.galaxy.stars[s];
    if (star.puid !== player.uid) continue;
    natual_resources += star.r;
  }
  return natual_resources;
};

interface position {
  x: number;
  y: number;
}

export function get_star_positions() {
  function get_star_coordiantes(star: Star): [number, number] {
    //return { x: star.x, y: star.y }
    return [star.x, star.y] as [number, number];
  }
  return Object.values(universe.galaxy.stars).map(get_star_coordiantes);
}

export function hook_star_manager(universe: Universe) {
  universe.get_total_natural_resources = get_total_natural_resources;
  //universe.get_star_positions = get_star_positions;
}

//Show mouse position on screen
export function show_mouse_position(event: MouseEvent) {
  return;
  const { clientX, clientY } = event;
  let canvas = map.canvas[0];
  const ctx = canvas.getContext("2d");
  const canvasRect = canvas.getBoundingClientRect();
  const mouseX = map.screenToWorldX(clientX);
  const mouseY = map.screenToWorldY(clientY);

  // Clear the canvas
  //ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Write the mouse coordinates on the canvas
  console.log(`MouseX: ${mouseX}, MouseY: ${mouseY}`);
  ctx.fillText(`MouseX: ${mouseX}, MouseY: ${mouseY}`, mouseX, mouseY);
}

type DPolygon = Delaunay.Polygon & {
  index: number;
};

let star_polygons: { [key: number | string]: DPolygon } = {};

function set_star_polygons() {
  let players = universe.galaxy.players;
  let star_positions = get_star_positions();
  const delaunay = Delaunay.from(star_positions);
  const voronoi = delaunay.voronoi([
    0,
    0,
    map.viewportWidth,
    map.viewportHeight,
  ]);

  //Find player associated with polygon
  for (const [i, [x, y]] of star_positions.entries()) {
    let star = turf.point([x, y]);
    for (const polygon of voronoi.cellPolygons()) {
      let inside = turf.booleanPointInPolygon(star, turf.polygon([polygon]));
      if (inside) {
        star_polygons[i] = polygon;
        break;
      }
    }
  }
}

function draw_star_verroni() {
  let players = universe.galaxy.players;
  let canvas = map.canvas[0];
  let scale = map.scale;
  let star_map = universe.galaxy.stars;
  let stars = Object.values(star_map);
  let player_stars = stars.map((star: Star) => star.puid);

  let positions = stars.map((star: Star) => {
    return [
      parseFloat(map.worldToScreenX(star.x).toFixed(3)),
      parseFloat(map.worldToScreenY(star.y).toFixed(3)),
    ] as [number, number];
  });

  const delaunay = Delaunay.from(positions);
  const voronoi = delaunay.voronoi([
    0,
    0,
    map.viewportWidth,
    map.viewportHeight,
  ]);
  const context = canvas.getContext("2d");
  if (context) {
    //Preformat polygons based on player
    let index = 0;
    let player_polygons: { [key: string]: number[][][] } = {};
    for (const polygon of voronoi.cellPolygons()) {
      //Find player associated with polygon
      let i = 0;
      let puid = null;
      for (let i = 0; i < positions.length; ++i) {
        let pos = positions[i];
        let star = turf.point([pos[0], pos[1]]);
        let poly = turf.polygon([polygon as number[][]]);
        let inside = turf.booleanPointInPolygon(star, poly);
        if (inside) {
          puid = player_stars[i];
          if (puid != universe.player.uid) {
            continue;
          }
          if (!player_polygons.hasOwnProperty(puid)) {
            player_polygons[puid] = [];
          }
          player_polygons[puid].push(polygon as number[][]);
        }
      }
    }
    //Now go through each group of polygons and group polygons
    let condensed_poly: { [key: string]: number[][][] } = {};
    for (const puid in player_polygons) {
      //List of polygons
      let raw_poly = player_polygons[puid];
      //let polygon: Position[] = player_polygons[puid];

      //Convert raw poly to polygons
      let polygons = [];
      let poly_features = [];
      for (let i = 0; i < raw_poly.length; i++) {
        polygons.push(turf.polygon([raw_poly[i]]));
        poly_features.push(turf.featureCollection([polygons[i]]));
      }
      //Merge polygons
      let features = turf.featureCollection(polygons);
      let union: Feature<Polygon | MultiPolygon> | null = null;

      for (const feature of features.features) {
        const geometry = feature.geometry;
        if (
          geometry &&
          (geometry.type === "Polygon" || geometry.type === "MultiPolygon")
        ) {
          if (union === null) {
            union = feature;
          } else {
            union = turf.union(union, feature);
          }
        }
      }

      condensed_poly[puid] = union.geometry.coordinates as number[][][];
    }
    for (const puid in condensed_poly) {
      //if (puid=="-1") continue;
      index += 1;
      for (const polygon of condensed_poly[puid]) {
        context.beginPath();
        context.strokeStyle = players[puid].colorName;
        context.globalAlpha = 0.25;
        context.fillStyle = players[puid].colorName;
        context.moveTo(polygon[0][0], polygon[0][1]);
        for (const point of polygon) {
          context.lineTo(point[0], point[1]);
        }
        context.closePath();
        context.fill();
        context.stroke();
      }
    }
  }
}

export const get_territory = function () {
  crux.tickCallbacks.push(draw_star_verroni);
  map.on("draw", draw_star_verroni);
  draw_star_verroni();
};
