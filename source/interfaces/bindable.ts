export interface Bindable {
  (keys: string[], callback: () => void): unknown;
}
