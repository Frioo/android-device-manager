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
