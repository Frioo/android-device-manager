import { Command } from "@tauri-apps/api/shell";
import { Buffer } from "buffer";

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
    if (!output || output.code != 0) {
      // Error occured
      console.error("[commands] command error", output.stderr);
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
        ...typeInfo,
      });
      return res;
    }, []);

  //console.table(items);
  return items;
};

export const getInstalledPackages = async (opt) => {
  const opts = {
    all: "-a",
    system: "-s",
    user: "-3",
  };
  const flags = {
    includeApk: "-f",
  };
  const script = `
cmd package list packages ${opts[opt]} ${Object.values(flags).join(" ")}
`;
  const output = await runOnDevice(script);
  const packages = output.stdout.split("\n").reduce((res, line) => {
    let [left, right] = line.split("=");
    if (!left || !right) return res;

    let pkgName = right;
    let pkgApk = left.split("package:")[1];
    res.push({
      name: pkgName,
      apk: pkgApk,
    });
    return res;
  }, []);

  console.table(packages);
  return packages;
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
  console.log(props);
  return props;
};

export const dumpBattery = async () => {
  const script = `dumpsys battery`;
  const output = await runOnDevice(script);
  return output.stdout;
};

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
    .map((pkg, i) => ({
      package: pkg.slice(1, -1),
      size: parseInt(appSizes[i]),
      dataSize: parseInt(appDataSizes[i]),
    }));
  console.log(stats);
  console.table(apps);
  return {
    ...stats,
    apps,
  };
};
