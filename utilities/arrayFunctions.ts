export const insertTypingUser = (arr: string[], element: string) => {
  if (arr.some((i) => i === element)) {
    return;
  }
  arr.push(element);
  setTimeout(() => {
    const index = arr.indexOf(element);
    if (index >= 0) {
      arr.splice(index, 1);
    }
  }, 2000);
};
