import { RecurringIntervalType } from "~/utilities/globalEnums";

export const getRecurranceDatesForReminders = (
  recurringOptions: EventRecurringOptions
): number[] => {
  let startDate = new Date(recurringOptions.startDay);
  const eventStartTime = new Date(recurringOptions.startTime);

  console.log("Recurring start date", recurringOptions.startDay, startDate);

  const startDay = startDate.getDate();
  console.log("Recurring start Day", startDay);

  console.log("Interval Step", recurringOptions.fixedIntervalStep);

  let dates = <number[]>[];
  dates.push(
    startDate.setHours(
      eventStartTime.getHours(),
      eventStartTime.getMinutes(),
      0,
      0
    )
  );

  if (recurringOptions.intervalType === RecurringIntervalType.MonthDay) {
    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  }

  for (let index = 1; index <= recurringOptions.duration; index++) {
    if (recurringOptions.intervalType === RecurringIntervalType.FixedInterval) {
      var newDate = new Date(startDate);
      newDate.setDate(
        newDate.getDate() + recurringOptions.fixedIntervalStep * index
      );
      dates.push(newDate.setHours(0, 0, 0, 0));
      continue;
    }

    if (recurringOptions.intervalType === RecurringIntervalType.MonthDay) {
      startDate.setMonth(startDate.getMonth() + 1);

      const dim = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0
      ).getDate();

      if (startDay > dim) {
        const result = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          dim
        ).setHours(0, 0, 0, 0);
        dates.push(result);
        continue;
      }

      const result = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDay
      ).setHours(eventStartTime.getHours(), eventStartTime.getMinutes(), 0, 0);

      console.warn("--->  Pushing Date", new Date(result));
      dates.push(result);
      continue;
    }
  }

  console.log(
    "Recurring Dates",
    dates.map((rd) => new Date(rd))
  );
  dates = dates.filter(
    (d) => new Date(d).getTime() > new Date(Date.now()).getTime()
  );
  return dates;
};
