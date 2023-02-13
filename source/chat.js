//For quick research display
const get_research = () => {
  let hero = get_hero(NeptunesPride.universe);
  let science = hero.total_science;

  //Current Science
  let current = hero.tech[hero.researching];
  let current_points_remaining =
    current["brr"] * current["level"] - current["research"];
  let eta = Math.ceil(current_points_remaining / science); //Hours

  //Next science
  let next = hero.tech[hero.researching_next];
  let next_points_remaining = next["brr"] * next["level"] - next["research"];
  let next_eta = Math.ceil(next_points_remaining / science) + eta;
  let next_level = next["level"] + 1;
  if (hero.researching == hero.researching_next) {
    //Recurring research
    next_points_remaining += next["brr"];
    next_eta = Math.ceil((next["brr"] * next["level"] + 1) / science) + eta;
    next_level += 1;
  }
  let name_map = {
    scanning: "Scanning",
    propulsion: "Hyperspace Range",
    terraforming: "Terraforming",
    research: "Experimentation",
    weapons: "Weapons",
    banking: "Banking",
    manufacturing: "Manufacturing",
  };

  return {
    current_name: name_map[hero.researching],
    current_level: current["level"] + 1,
    current_eta: eta,
    next_name: name_map[hero.researching_next],
    next_level: next_level,
    next_eta: next_eta,
    science: science,
  };
};

const get_research_text = () => {
  const research = get_research();
  let first_line = `Now: ${research["current_name"]} ${research["current_level"]} - ${research["current_eta"]} ticks.`;
  let second_line = `Next: ${research["next_name"]} ${research["next_level"]} - ${research["next_eta"]} ticks.`;
  let third_line = `My Science: ${research["science"]}`;
  return `${first_line}\n${second_line}\n${third_line}\n`;
};

export { get_research, get_research_text };
