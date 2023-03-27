export interface Technology {
  level: number; //Actual tech level
  value: number; //value = level * bv + sv
}

export interface Research extends Technology {
  research: number; //Current points in research
  sv: number; //Something Value: Base cost of tech
  bv: number; //Base Value: Used in value calculation
  brr: number; //Research cost per level for this technology
}
