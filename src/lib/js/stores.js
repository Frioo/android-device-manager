import { writable } from "svelte/store";

/*  */
export const env = writable({
  root: true,
});

/* File explorer */
const explorerDefault = {
  items: undefined,
  path: ["sdcard"],
};

export const explorer_cache = writable(explorerDefault);

/* App manager */
export const apps_cache = writable([]);
