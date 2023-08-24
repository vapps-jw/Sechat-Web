export const getISODate = (value: Date) => {
  return value.toISOString().slice(0, 10);
};
