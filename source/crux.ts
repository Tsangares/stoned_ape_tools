import { EventListener } from "./utilities";

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
  (icon: Icon, label: Template, event: string, data: any): Widget;
}

export interface Screen extends Widget {
  (title: string, subtitle?: string): Screen;
  addFooter(): void;
}

//Object definitions of npui
export interface NPUI {
  Widget(styles: string): Widget;
  SideMenuItem(icon: Icon, label: Template, event: string, data?: any): Widget;
  Screen(title: string, subtitle?: string): Screen;
  ledgerScreen(): Screen;
}
//Properties of npui
export interface NPUI extends EventListener {
  activeScreen: Widget;
  screenContainer: Widget;
  hasmenuitem: boolean;
  sideMenu: Widget;
  NagScreen(): void;
  onHideSelectionMenu(event?: string, data?: any): void;
  onShowScreen(event: string, screenName: string, screenConfig: unknown): void;
  onHideScreen(event: string, quiet: boolean): void;
  onRefreshInterface(): void;
  onRefreshPlayerIcons(): void;
  onRefreshBuildInf(): void;
  onRebuildPlayerIcons(): void;
  layoutElement(element: unknown): void;
}

export interface Crux {
  Widget(styles: string): Widget;
  Text(id: Template, styles: css): Widget;
}