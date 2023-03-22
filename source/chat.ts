import { Game, Research, Hero } from "./game";
import { get_hero } from "./utilities";
import { NPUI, Widget, MessageComment } from "./crux";
interface ResearchMap {
  [key: string]: string;
}
const RESEACH_MAP: ResearchMap = {
  scanning: "Scanning",
  propulsion: "Hyperspace Range",
  terraforming: "Terraforming",
  research: "Experimentation",
  weapons: "Weapons",
  banking: "Banking",
  manufacturing: "Manufacturing",
};
//For quick research display
function get_research(game: Game): { [key: string]: string | number } {
  let universe = game.universe;
  let hero = get_hero(game.universe);
  let science = hero.total_science;

  //Current Science
  let current = hero.tech[hero.researching];
  let current_points_remaining = current.brr * current.level - current.research;
  let eta = Math.ceil(current_points_remaining / science); //Hours

  //Next science
  let next: Research = hero.tech[hero.researching_next];
  let next_points_remaining = next.brr * next.level - next.research;
  let next_eta = Math.ceil(next_points_remaining / science) + eta;
  let next_level = next.level + 1;

  if (hero.researching == hero.researching_next) {
    //Recurring research
    next_points_remaining += next.brr;
    next_eta = Math.ceil((next.brr * next.level + 1) / science) + eta;
    next_level += 1;
  }

  return {
    current_name: RESEACH_MAP[hero.researching],
    current_level: current["level"] + 1,
    current_eta: eta,
    next_name: RESEACH_MAP[hero.researching_next],
    next_level: next_level,
    next_eta: next_eta,
    science: science,
  };
}

function get_research_text(game: Game): string {
  const research = get_research(game);
  let first_line = `Now: ${research["current_name"]} ${research["current_level"]} - ${research["current_eta"]} ticks.`;
  let second_line = `Next: ${research["next_name"]} ${research["next_level"]} - ${research["next_eta"]} ticks.`;
  let third_line = `My Science: ${research["science"]}`;
  return `${first_line}\n${second_line}\n${third_line}\n`;
}

function MarkDownMessageComment(
  context: NPUI,
  text: string,
  index: number,
): string {
  let messageComment = context.MessageComment(text, index);

  return "";
}
export { get_research, get_research_text, MarkDownMessageComment };
