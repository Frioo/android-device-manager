import { Command } from "@tauri-apps/api/shell";
import { Buffer } from "buffer";
import { Buffer } from "buffer/";
import parser from "./badging_parser";
import { log, splitAt } from "@js/utils";

/* 
  Accepts a (sh) script in string format.
  Script is Base64 encoded and passed to Android's shell via ADB
  The encoded script is decoded on-device and executed.
  Result (stdout) is returned as a string.
*/
const runOnDevice = async (script) => {
  try {
    let payload = Buffer.from(script).toString("base64");
    const cmd = new Command("adb", [
      "shell",
      `echo ${payload} | base64 -d | sh`,
    ]);
    const output = await cmd.execute();
    if (!output || output.code != 0 || !output.stdout || output.stderr) {
      // Error occured
      console.error("[commands] command error", output.stdout, output.stderr);
    }
    return output;
  } catch (err) {
    console.error(`[commands] Error runnning shell script on device.`, err);
    return undefined;
  }
};

export const devices = async () => {
  const cmd = new Command("adb", "devices");
  const output = await cmd.execute();
  const states = ["device", "recovery", "fastboot", "bootloader"];
  const devices = output.stdout.split("\n").slice(1, -1);

  console.log(devices);

  return devices;
};

export const waitForDevice = async (state) => {
  console.log(`[commands] waiting for ${state}`);
  const cmd = new Command("adb", [`wait-for-${state}`]);
  const output = await cmd.execute();
  return output;
};

export const subdirSizes = async (path) => {
  // Don't calculate disk usage of subdirs in root
  if (!path || path.length === 0) {
    return [];
  }
  const script = `du -s -- ~/${path}/*/`;
  const output = await runOnDevice(script);
  if (!output.stdout) {
    return {};
  }
  let subdirs = output.stdout.split("\n").reduce((res, line) => {
    let [size, path] = line.split(/[\s]+/);
    const bytes = parseInt(size);
    let parts = path.split("/").filter((part) => part && part !== "");
    const name = parts[parts.length - 1];
    res[name] = {
      name,
      path: parts,
      bytes,
    };

    return res;
  }, {});
  console.table(subdirs);
  return subdirs;
};

export const countDir = async (path) => {
  const script = `ls -Hlpq ~/${path} | wc -l`;
  const output = await runOnDevice(script);
  const res = Number.parseInt(output.stdout);
  return res <= 0 ? 0 : res - 1;
};

export const ls = async (path) => {
  /* 
    List files/directories with their metadata
    -H: follow symlinks
    -l: display items in vertical list
    -t
    -r
    -p: adds trailing slash on directories

    ONLY CALCULATES SUBDIR SIZES IN SDCARD
  */
  const script = `ls -Hlp ~/${path}`;
  const output = await runOnDevice(script);

  let items = output.stdout
    .split("\n")
    .slice(1)
    .reduce((res, line) => {
      let meta = line.split(/[ ]+/);
      if (meta.length < 8) {
        return res;
      }
      const delim = " ";
      const [permissions, links, ownerName, ownerGroup, bytes] = meta.splice(
        0,
        5
      );
      const lastModified = meta.splice(0, 2).join(delim);
      const nameText = meta.join(delim);
      const [name, linkTo] = nameText.split(" -> ");
      let typeInfo = {};
      switch (permissions[0]) {
        case "-":
          typeInfo = {
            type: "file",
          };
          break;

        case "d":
          typeInfo = {
            type: "dir",
            name: name.slice(0, -1), // Strip the trailing slash
          };
          break;
        case "l":
          typeInfo = {
            type: "link",
            linksTo: linkTo,
          };
          break;
      }

      res.push({
        permissions,
        links,
        ownerName,
        ownerGroup,
        bytes,
        lastModified,
        name,
        fullPath: `${path}/${name}`,
        ...typeInfo,
      });
      return res;
    }, []);

  //console.table(items);
  return items;
};

export const getProps = async () => {
  const script = `getprop`;
  const output = await runOnDevice(script);
  // Regex to select [key]: [value] pairs from getprop command
  const re = /[a-zA-Z0-9.,_\-/:;=+?%\s]+(?=])/g;
  const props = output.stdout.split("\n").reduce((res, line) => {
    let matches = [...line.matchAll(re)];
    let key = matches[0] ? matches[0][0] : undefined;
    let value = matches[1] ? matches[1][0] : undefined;
    if (key) {
      res[key] = value;
    }
    return res;
  }, {});
  //console.log(props);
  return props;
};

export const dumpBattery = async () => {
  const script = `dumpsys battery`;
  const output = await runOnDevice(script);
  return output.stdout;
};

/* 
  Returns an object with diskstats from dumpsys
  {
    <...other keys>
    apps: {
      "com.app.package": {
        size: <int>
        dataSize: <int>
      }
    }
  }
*/
export const packageDiskStats = async () => {
  const script = `dumpsys diskstats`;
  const output = await runOnDevice(script);
  if (!output || output.code != 0) {
    // error
  }
  const stats = output.stdout.split("\n").reduce((res, line) => {
    let [param, val] = line.split(": ");
    res[param] = val;
    return res;
  }, {});
  let appDataSizes = stats["App Data Sizes"].slice(1, -1).split(",");
  let appSizes = stats["App Sizes"].slice(1, -1).split(",");
  let apps = stats["Package Names"]
    .slice(1, -1)
    .split(",")
    .reduce((res, pkg, i) => {
      let pkgName = pkg.slice(1, -1);
      let size = parseInt(appSizes[i]);
      let dataSize = parseInt(appDataSizes[i]);
      res[pkgName] = {
        size,
        dataSize,
      };
      return res;
    }, {});
  //console.log(stats);
  //console.table(apps);
  return {
    ...stats,
    apps,
  };
};

/* non-root */
export const systemApps = async () => {
  const systemAppEntries = await ls("system/app");
  if (!systemAppEntries) {
    return;
  }
  const apps = systemAppEntries.map(async (appDir) => {
    let apkPath = `${appDir.fullPath}/${appDir.name}.apk`;
    let manifest = await apkManifest(apkPath);
    return {};
  });
};

const excludePaths = ["apex"];
const joinAbsPath = (pathArr) => `/${pathArr.join("/")}/`;

export const packages = async ({
  root = false,
  installedBy = "user",
  callback = undefined,
}) => {
  const opts = {
    all: "-a",
    system: "-s",
    user: "-3",
  };
  const flags = {
    includeApk: "-f",
  };
  const script = `cmd package list packages ${
    opts[installedBy]
  } ${Object.values(flags).join(" ")}`;
  const output = await runOnDevice(script);

  // DiskStats needed for app / app data size info
  let diskStats = await packageDiskStats();
  // Parse output
  // example: 'package:/data/app/org.example.app/org.example.app.apk=org.example.app
  let packages = [];
  let items = output.stdout.split("\n");
  for (let i = 0; i < items.length; i++) {
    const line = items[i];
    let [left, right] = splitAt(line, line.lastIndexOf("="));
    if (!left || !right) continue;

    let pkg = right;
    let apkPath = left.split("package:")[1];
    let manifest = root ? await apkManifest(apkPath) : undefined;

    const res = {
      pkg,
      apk: apkPath,
      installedBy: apkPath.startsWith("/data/app/") ? "user" : "system",
      ...diskStats.apps[pkg],
      manifest,
    };

    // If callback is passed, it is called with each processed app
    if (callback) {
      callback({
        current: i + 1,
        total: items.length,
        app: res,
      });
    }
    packages.push(res);
  }

  console.table(packages);
  return packages;
};

// TODO: detect required utils and autoinstall busybox or sth
/* Dumps manifest info as json from apk (aapt2) */
const apkManifest = async (apkPath) => {
  if (!apkPath) {
    console.log("apk path is unspecified");
    return undefined;
  } else if (excludePaths.some((path) => apkPath.startsWith(`/${path}/`))) {
    // The apk is in an excluded directory, exit
    console.log("skipping apk: excluded directory", apkPath);
    return undefined;
  }

  const script = `su -c "~/data/adm/aapt2 dump badging ${apkPath}"`;
  const output = await runOnDevice(script);
  try {
    const manifest = parser.parse(output.stdout);
    console.log("apk manifest parsed", apkPath, manifest);
    return manifest;
  } catch (err) {
    console.log("error parsing apk manifest", apkPath, err);
    return undefined;
  }
};

const dumpApp = async () => {};
