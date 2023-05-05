export interface EventListener {
  on(key: string, callback: (event?: string, payload?: unknown) => void): void;
  off(key: string, callback: (event?: string, payload?: unknown) => void): void;
  trigger(event: string, payload?: unknown): void;
}

export interface MessageEvent {
  event: string;
  report: {
    messages: Event[];
    group: string;
  };
}

export interface Event {
  payload: Payload;
  status: string; //read or unread
  key: string; //Unique per event
  group: string; //Always "game_event" unless messages
  created: string; //Date string
  activity: string; //Equivalent to created?
  comment_count: number; //TODO: Needs description
  comments: unknown; //TODO: Needs description
  commentsLoaded: boolean; //TODO: Needs description
}

export interface MergeEvent extends Event {
  type: string;
  timeStamp: number;
  isTrigger: number;
  target: HTMLElement;
  delegateTarget: HTMLElement;
  currentTarget: unknown;
}

export interface HTMLElement {}

export interface HandleObj {
  type: string;
  origType: string;
  guid: number;
  namespace: string;
}

//A Payload is either a tech/money transfer, battle, afk/quit event or message.
export interface Payload {
  template: string; //Descibes the payload type
  tick: number; //Tick the event occured on
  created: unknown;
  creationTime: string;
}

export interface Goodbye extends Payload {
  uid: number;
}

export interface Transfer extends Payload {
  from_puid: number; //Player's ID who SENT
  to_puid: number; //Player's ID who RECIEVED

  giverName: string; //Sender's alias
  giverUid: number; //alias of from_puid
  giverColour: string; //HTML String: "<span class='playericon_font pc_3'>1</span>"
  receiverName: string; //Reciever's alias
  receiverUid: number; //alias of to_puid
  receiverColour: string;
}
export interface MoneyTransfer extends Transfer {
  template: "money_sent";
  amount: number;
}

export interface TechTransfer extends Transfer {
  template: "shared_technology";
  price: number; //Cost of transfer
  name: string; //Name of technology
  display_name: string; //Acutal name of the technology
  level: number; //Level of the tech
}

export interface Battle extends Payload {
  template: "combat_mk_ii";
  attackers: Ship[]; //List of attacking ships
  defenders: Ship[]; //List of defending ships
  aw: number; //Attacher Weapons
  dw: number; //Defender Weapons (After advantage)
  loot: number; //Econ reward
  looter: number; //uid of winner
}
export interface Ship {}

export interface AFK extends Payload {
  template: "goodbye_to_player_inactivity";
  name: string; //HTML string
  uid: number; //User ID
  colour: string; //HTML color stirng
}
