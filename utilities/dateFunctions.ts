export const getISODate = (value: Date) => {
  return value.toISOString().slice(0, 10);
};

export const readSavedDate = (date: string): string => {
  return new Date(new Date(date).toString().split("GMT")[0] + " UTC")
    .toISOString()
    .split(".")[0]
    .slice(0, -3);
};

export const getEventDateTime = (date: Date): string => {
  return new Date(date)
    .toISOString()
    .replace(/.\d+Z$/g, "")
    .substring(0, 16);
};

export const getTime = (date: Date): string => {
  return date.toTimeString().substring(0, 5);
};

export const addHoursToDate = (myDate: Date, hours: number): Date => {
  return new Date(new Date(myDate).setHours(myDate.getHours() + hours));
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
