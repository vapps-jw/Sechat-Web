export const getISODate = (value: Date) => {
  return value.toISOString().slice(0, 10);
};

export const createDateToSave = (date: string): string => {
  return new Date(date).toISOString();
};

export const readSavedDate = (date: string): string => {
  return new Date(new Date(date).toString().split("GMT")[0] + " UTC")
    .toISOString()
    .split(".")[0]
    .slice(0, -3);
};
