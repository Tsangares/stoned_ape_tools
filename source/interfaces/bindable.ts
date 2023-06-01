export interface Bindable {
  (keys: string[], callback: () => void): unknown;
  bind(keys: string[], callback: () => void): unknown;
}
