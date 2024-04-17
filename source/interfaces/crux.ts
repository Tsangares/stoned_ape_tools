import { EventListener } from "./events";
import { Player } from "./player";

//Weird legacy part of Jay's UI system.
export type Template = string;
export interface Templates {
  [key: string]: Template;
}
[];

export type Icon = string;

/* Now to build common elements */
type css = string;

export interface Widget extends EventListener {
  (styles: string): Widget;
  format(options: { [key: string]: string }): Widget;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  mum?: Widget;
  ui: unknown;
  rawHTML(text: string | number): Widget;
  roost(parent: Widget): Widget;
  addChild(child: Widget): Widget;
  removeChild(child: Widget): Widget;
  preRemove(): Widget;
  postRoost(): Widget;
  style(styles: string): Widget;
  addStyle(styles: string): Widget;
  removeStyle(styles: string): Widget;
  pos(x: number, y?: number): Widget;
  size(width: number, height: number): Widget;
  place(x: number, y: number, width: number, height: number): Widget;
  grid(x: number, y: number, row: number, col: number): Widget;
  inset(x: number): Widget;
  hide(): Widget;
  show(): Widget;
  size(px: number): Widget;
  tt(key: unknown): Widget; //Tool Tip from Templates
  icon: unknown;
  body: unknown;
  buyNowBg: Widget;
  buyNowButton: Widget;
  disable(): void;
}
export interface Text extends Widget {
  (id: Template, styles: css, option?: string): Widget;
}
export interface SideMenuItem extends Widget {
  (icon: Icon, label: Template, event: string, data: unknown): Widget;
}

export interface Screen extends Widget {
  (title: string, subtitle?: string): Screen;
  addFooter?(): void;
}

//Object definitions of npui
export interface NPUI {
  Widget(styles: string | unknown): Widget;
  SideMenuItem(
    icon: Icon,
    label: Template,
    event: string,
    data?: unknown,
  ): Widget;
  Screen(title: string, subtitle?: string): Screen;
  ledgerScreen(): Screen;
  GalacticCreditBalance(): Widget;
  GiftItem(item: BadgeItemInterface): Widget;
  showingScreen: string;
  screenConfig: unknown;
  map: MAP;
  BuyGiftScreen: Screen;
  MainMenuScreen: Screen;
  ComposeDiplomacyScreen: Screen;
  InboxScreen: Screen;
  DiplomacyDetailScreen: Screen;
  JoinGameScreen: Screen;
  EmpireScreen: Screen;
  LeaderboardScreen: Screen;
  OptionsScreen: Screen;
  TechScreen: Screen;
  StarInspector: Screen;
  FleetInspector: Screen;
  EditFleetOrder: Screen;
  BulkUpgradeScreen: Screen;
  ShipTransferScreen: Screen;
  NewFleetScreen: Screen;
  StarDirectory: Screen;
  FleetDirectory: Screen;
  ShipDirectory: Screen;
  CombatCalc: Screen;
  CustomSettingsScreen: Screen;
  ConfirmScreen: Screen;
  HelpScreen: Screen;
  SelectPlayerScreen: Screen;
  BuyPremiumGiftScreen: Screen;
  Intel: Widget;
}
//Maybe the canavas
export interface MapContext {
  font: string; //14px OpensansRegular, sans-seriff;
  fillStyle: string; //#FF0000
  textAlign: string; //right
  textBaseline: string; //middle
  fillText(text: string, x: number, y: number): void;
}
//NeptunesPride.npui.map
export interface MAP {
  context: MapContext;
  canvas: {
    0: HTMLCanvasElement;
  };
  scale: number;
  viewportHeight: number;
  viewportWidth: number;
  sx: number; //Offset x
  sy: number; //Offset y
  worldToScreenX(x: number): number;
  worldToScreenY(y: number): number;
  worldToScreenScale(scale: number): number;
  screenToWorldX(x: number): number;
  screenToWorldY(y: number): number;
  screenToWorldScale(scale: number): number;
  on(event: string, callback?: unknown): void;
}

//Properties of npui
export interface NPUI extends EventListener {
  activeScreen: Widget;
  screenContainer: Widget;
  hasmenuitem: boolean;
  sideMenu: Widget;
  PlayerIcon(playre: Player, horizontal: boolean): Widget;
  NagScreen(): void;
  onHideSelectionMenu(event?: string, data?: unknown): void;
  onShowScreen(event: string, screenName: string, screenConfig: unknown): void;
  onHideScreen(event: string, quiet: boolean): void;
  onRefreshInterface(): void;
  onRefreshPlayerIcons(): void;
  onRefreshBuildInf(): void;
  onRebuildPlayerIcons(): void;
  layoutElement(element: unknown): void;
  MessageComment(comment: string, i: number): Widget;
  refreshTurnManager(): void; //No idea what this does....
}

export interface Crux {
  Widget(styles?: string): Widget;
  Image(path: string, css: string): Widget;
  Clickable(event: string, template: string): Widget;
  Text(id: Template, styles: css, option?: string): Widget;
  Button(
    id: Template,
    event: string,
    response: { [key: string | number]: string | number } | BadgeItemInterface,
  ): Widget;
  tickCallbacks: Array<() => void>;
}

export interface MessageComment {
  addStyle(style: string): void;
  comment: Text;
}

export interface BadgeItemInterface {
  icon: string;
  amount: number;
  puid?: number;
}
