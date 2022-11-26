export {};
import { qx as _qx } from "./qooxdoo"; // path to qooxdoo.d.ts
declare global {
  interface qx extends _qx {}
  //** Global reference for qooxdoo
  var qx: typeof _qx;
}
