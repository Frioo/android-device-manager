import { explorer_cache } from "@js/stores";
import { ls } from "@js/commands";
import { get } from "svelte/store";

export const up = async () => {
  let state = get(explorer_cache);
  let path = state.path;
  let newPath;
  if (path.length === 0) {
    newPath = path;
  } else {
    newPath = path.slice(0, -1);
  }
  let dir = await list(newPath);
  await explorer_cache.set(dir);
  return dir;
};

export const list = async (path) => {
  let pathStr = path.join("/");
  let items = await ls(pathStr);
  let result = {
    path,
    items,
  };
  console.log(`[explorer.js] list ${pathStr}`, result);
  return result;
};

// Navigate to a directory inside current directory
export const navigate = async (path, relative = true) => {
  let state = get(explorer_cache);
  let newPath;
  if (relative) {
    newPath = [...state.path, ...path];
  } else {
    newPath = [...path];
  }
  let dir = await list(newPath);
  await explorer_cache.set(dir);
  return dir;
};

// Navigate to an absolute path
export const navigateAbs = async (path) => {};
