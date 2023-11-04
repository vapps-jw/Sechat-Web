import { isToday } from "~/utilities/dateFunctions";
import { RecurringIntervalType } from "~/utilities/globalEnums";

type EventsDisplayBatch = {
  id: number;
  date: Date;
  today: boolean;
  events: CalendarEvent[];
};

export const useCalendarStore = defineStore({
  id: "sechat-calendar-store",
  state: () => {
    return {
      calendar: <Calendar>null,
      displayBatches: <EventsDisplayBatch[]>[],
    };
  },
  actions: {
    updateCalendar(value: Calendar) {
      value.calendarEvents = sortEvents(value.calendarEvents);
      this.calendar = value;
    },
    recalculateEvents() {
      if (!this.calendar || this.calendar!.calendarEvents.length === 0) {
        return;
      }
      this.calendar.calendarEvents.forEach((eventObject) => {
        if (
          eventObject.isAllDay &&
          new Date(eventObject.day).setHours(0, 0, 0, 0) <
            new Date(Date.now()).setHours(0, 0, 0, 0)
        ) {
          eventObject.isOld = true;
        } else if (
          new Date(eventObject.end).setHours(0, 0, 0, 0) <
          new Date(Date.now()).setHours(0, 0, 0, 0)
        ) {
          eventObject.isOld = true;
        }
      });
    },
    recalculateBatches() {
      if (!this.calendar || this.calendar!.calendarEvents.length === 0) {
        this.displayBatches = [];
        return;
      }

      const batches = [] as EventsDisplayBatch[];
      let result = [] as number[];
      this.calendar.calendarEvents.forEach((ce) => {
        if (ce.recurring) {
          const dates = getRecurranceDates(ce.recurringOptions);
          ce.recurringOptions.recurringDates = dates;
          result = [...result, ...dates];
        } else if (ce.isAllDay) {
          result.push(new Date(ce.day).setHours(0, 0, 0, 0));
        } else {
          result = [
            ...result,
            ...getDatesInRange(
              new Date(ce.start).setHours(0, 0, 0, 0),
              new Date(ce.end).setHours(0, 0, 0, 0)
            ),
          ];
        }
      });

      result = result
        .filter((value, index, array) => array.indexOf(value) === index)
        .sort((a, b) => {
          return a - b;
        });

      console.log("All Dates", result);
      result.forEach((r) => {
        const validEvents: CalendarEvent[] =
          this.calendar.calendarEvents.filter((ce) => {
            if (ce.recurring) {
              return ce.recurringOptions.recurringDates.some(
                (rd) =>
                  new Date(rd).setHours(0, 0, 0, 0) ===
                  new Date(r).setHours(0, 0, 0, 0)
              );
            } else if (ce.isAllDay) {
              return (
                new Date(ce.day).setHours(0, 0, 0, 0) ===
                new Date(r).setHours(0, 0, 0, 0)
              );
            } else {
              const result =
                new Date(r).setHours(0, 0, 0, 0) >=
                  new Date(ce.start).setHours(0, 0, 0, 0) &&
                new Date(r).setHours(0, 0, 0, 0) <=
                  new Date(ce.end).setHours(0, 0, 0, 0);
              return result;
            }
          });

        const batch: EventsDisplayBatch = {
          id: new Date(r).setHours(0, 0, 0, 0),
          date: new Date(r),
          today: isToday(new Date(r)),
          events: validEvents,
        };
        batches.push(batch);
      });

      this.displayBatches = batches.sort((a, b) => {
        return Number(b.date) - Number(a.date);
      });
    },
    updateEvent(value: CalendarEvent) {
      let newList = [
        ...this.calendar.calendarEvents.filter((ce) => ce.id !== value.id),
        value,
      ] as CalendarEvent[];
      this.calendar.calendarEvents = sortEvents(newList);
    },
    removeEvent(value: CalendarEvent) {
      this.calendar.calendarEvents = [
        ...this.calendar.calendarEvents.filter((ce) => ce.id !== value.id),
      ];
    },
    addReminder(eventId: string, data: EventReminder) {
      const event = this.calendar.calendarEvents.find(
        (ce) => ce.id === eventId
      ) as CalendarEvent;
      event.reminders.push(data);

      event.reminders = event.reminders.sort((a, b) => {
        return new Date(a.remind).getTime() - new Date(b.remind).getTime();
      });
    },
    addReminders(eventId: string, data: EventReminder[]) {
      const event = this.calendar.calendarEvents.find(
        (ce) => ce.id === eventId
      ) as CalendarEvent;
      event.reminders = [...event.reminders, ...data];

      event.reminders = event.reminders.sort((a, b) => {
        return new Date(a.remind).getTime() - new Date(b.remind).getTime();
      });
    },
    removeReminder(eventId: string, reminderId: number) {
      const event = this.calendar.calendarEvents.find(
        (ce) => ce.id === eventId
      ) as CalendarEvent;
      event.reminders = event.reminders.filter((r) => r.id !== reminderId);
    },
  },
  getters: {
    calendarData: (state) => (state.calendar ? true : false),
    getEvents: (state) => state.calendar?.calendarEvents,
  },
});

const getDatesInRange = (startDate: number, endDate: number): number[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates = <number[]>[];

  while (start <= end) {
    dates.push(new Date(start).setHours(0, 0, 0, 0));
    start.setDate(start.getDate() + 1);
  }

  return dates;
};

const getRecurranceDates = (
  recurringOptions: EventRecurringOptions
): number[] => {
  let startDate = new Date(recurringOptions.startDay);
  console.log("Recurring start date", recurringOptions.startDay, startDate);

  const startDay = startDate.getDate();
  console.log("Recurring start Day", startDay);

  console.log("Interval Step", recurringOptions.fixedIntervalStep);

  const dates = <number[]>[];
  dates.push(startDate.setHours(0, 0, 0, 0));

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
      ).setHours(0, 0, 0, 0);

      dates.push(result);
      continue;
    }
  }

  return dates;
};

const sortEvents = (list: CalendarEvent[]): CalendarEvent[] => {
  return list.sort((a, b) => {
    let aValue: Date = null;
    let bValue: Date = null;
    if (a.isAllDay) {
      aValue = new Date(a.day);
    } else {
      aValue = new Date(a.start);
    }

    if (b.isAllDay) {
      bValue = new Date(b.day);
    } else {
      bValue = new Date(b.start);
    }
    return Number(bValue) - Number(aValue);
  });
};
