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

export const getUTCDate = (date: Date): Date => {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    )
  );
};

export const isToday = (dateToCheck: Date): boolean => {
  const today = new Date();

  const isSameDate =
    dateToCheck.getDate() === today.getDate() &&
    dateToCheck.getMonth() === today.getMonth() &&
    dateToCheck.getFullYear() === today.getFullYear();

  return isSameDate;
};
