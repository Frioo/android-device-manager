import { packages } from "@js/commands";
import { apps_cache, env } from "@js/stores";
import { cacheDir } from "@tauri-apps/api/path";
import { get } from "svelte/store";

export const listApps = async ({ installedBy = "user", onApp = undefined }) => {
  let appEnv = get(env);
  const cached = get(apps_cache);
  // TODO: verify cached apps (checksums/version codes) and reload packages if necessary
  if (cached && cached.length > 0) {
    console.log("[pm.js] loaded apps from cache", cached);
    return cached;
  }

  let apps = await packages({
    root: appEnv.root,
    installedBy,
    callback: (e) => {
      apps_cache.update((cache) => [...cache, e.app]);
      console.log("app processed", e);
      if (onApp) {
        onApp(e);
      }
    },
  });

  return apps;
};
