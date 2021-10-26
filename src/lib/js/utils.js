export const formatSize = (bytes) => {
  let units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let size = bytes;
  while (size >= 1000) {
    size = size / 1000;
    i += 1;
  }
  return `${Math.round(size * 100) / 100} ${units[i]}`;
};

export const arraysEqual = (arr1, arr2) => {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
};

export function log(text, tag = undefined, ...rest) {
  let tagStr = tag ? `[${tag}] ` : "";
  let caller = arguments.callee.caller.name;
  let str = `[${caller}] ${text}`;
  console.log(str, ...rest);
}

export const splitAt = (str, index) => {
  return [str.substring(0, index), str.substring(index + 1)];
};
