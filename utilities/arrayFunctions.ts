export const insert = (arr: string[], element: string) => {
  arr.push(element);
  setTimeout(() => {
    const index = arr.indexOf(element);
    if (index >= 0) {
      arr.splice(index, 1);
    }
  }, 2000);
};
