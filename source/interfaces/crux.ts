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
  rawHTML(text: string): Widget;
  roost(parent: Widget): Widget;
  addChild(child: Widget): Widget;
  removeChild(child: Widget): Widget;
  preRemove(): Widget;
  postRoost(): Widget;
  style(styles: string): Widget;
  addStyle(styles: string): Widget;
  removeStyle(styles: string): Widget;
  pos(x: number, y: number): Widget;
  size(width: number, height: number): Widget;
  place(x: number, y: number, width: number, height: number): Widget;
  grid(x: number, y: number, row: number, col: number): Widget;
  inset(x: number): Widget;
  hide(): Widget;
  show(): Widget;
  tt(key: unknown): Widget; //Tool Tip from Templates
}
export interface Text extends Widget {
  (id: Template, styles: css): Widget;
}
export interface SideMenuItem extends Widget {
  (icon: Icon, label: Template, event: string, data: unknown): Widget;
}

export interface Screen extends Widget {
  (title: string, subtitle?: string): Screen;
  addFooter(): void;
}

//Object definitions of npui
export interface NPUI {
  Widget(styles: string): Widget;
  SideMenuItem(
    icon: Icon,
    label: Template,
    event: string,
    data?: unknown,
  ): Widget;
  Screen(title: string, subtitle?: string): Screen;
  ledgerScreen(): Screen;
  map: unknown;
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
  Widget(styles: string): Widget;
  Text(id: Template, styles: css): Widget;
  Button(
    id: Template,
    event: string,
    response: { [key: string | number]: string | number },
  ): Widget;
}

export interface MessageComment {
  addStyle(style: string): void;
  comment: Text;
}
