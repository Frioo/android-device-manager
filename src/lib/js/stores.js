import { writable } from "svelte/store";

const explorerDefault = {
  items: undefined,
  path: ["sdcard"],
};
export const explorer = writable(explorerDefault);
