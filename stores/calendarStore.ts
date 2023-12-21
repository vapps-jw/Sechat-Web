import { getRecurranceDates } from "~/utilities/calendarUtilities";
import { isToday } from "~/utilities/dateFunctions";

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
      activeMonth: <Date>new Date(Date.now()),
      selectedDay: <number>new Date(Date.now()).getDate(),
      monthArray: [],
      dayNames: <string[]>[],
      calendar: <Calendar>null,
      displayBatches: <EventsDisplayBatch[]>[],
    };
  },
  actions: {
    createMonthArray(locals: string) {
      const firstDay = new Date(
        this.activeMonth.getFullYear(),
        this.activeMonth.getMonth(),
        1
      );

      const fistDayName = firstDay.toLocaleString(locals, {
        weekday: "short",
      });
      const firstDayPosition = this.dayNames.indexOf(fistDayName);
      const lastDay = new Date(
        this.activeMonth.getFullYear(),
        this.activeMonth.getMonth() + 1,
        0
      ).getDate();

      console.log(`Month For Array: ${this.activeMonth}`);
      console.log(`Day: ${fistDayName} Position: ${firstDayPosition}`);
      console.log(`Last day: ${lastDay}`);

      const monthArray = [];
      let dayIndex = 1;
      for (let week = 0; week < 6; week++) {
        monthArray.push([]);
        for (let day = 0; day < 7; day++) {
          if (week === 0) {
            if (day >= firstDayPosition) {
              monthArray[week].push(dayIndex++);
              continue;
            }
          } else {
            if (dayIndex <= lastDay) {
              monthArray[week].push(dayIndex++);
              continue;
            }
          }

          monthArray[week].push(0);
        }
      }
      this.monthArray = [];
      this.monthArray = monthArray;
    },
    updateDayNames(locals: string) {
      var weekDays = [];
      var d = new Date();

      while (d.getDay() > 0) {
        d.setDate(d.getDate() + 1);
      }

      while (weekDays.length < 7) {
        weekDays.push(
          d.toLocaleString(locals, {
            weekday: "short",
          })
        );
        d.setDate(d.getDate() + 1);
      }

      this.dayNames = weekDays;
      console.log("Days", this.dayNames);
    },
    updateCalendar(value: Calendar) {
      value.calendarEvents.forEach((ce) => (ce.activeReminders = 0));
      value.calendarEvents = sortEvents(value.calendarEvents);
      this.calendar = value;
    },
    removeEvents(value: string[]) {
      this.calendar.calendarEvents = this.calendar.calendarEvents.filter(
        (e) => !value.some((td) => td === e.id)
      );
    },
    recalculateReminders() {
      if (!this.calendar || this.calendar!.calendarEvents.length === 0) {
        return;
      }

      this.calendar.calendarEvents.forEach((ce) => {
        ce.showReminderBagde = false;
        ce.activeReminders = 0;

        if (ce.reminders.length === 0) {
          return;
        }

        ce.reminders.forEach((rem) => {
          if (new Date(rem.remind).getTime() < new Date(Date.now()).getTime()) {
            rem.isOld = true;
          } else {
            ce.activeReminders += 1;
            rem.isOld = false;
          }
        });
        if (ce.reminders.some((rem) => !rem.isOld)) {
          ce.showReminderBagde = true;
        } else {
          ce.showReminderBagde = false;
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
    removeAllReminders(eventId: string) {
      const event = this.calendar.calendarEvents.find(
        (ce) => ce.id === eventId
      ) as CalendarEvent;
      event.reminders = [];
    },
    markOldEvents() {
      this.calendar?.calendarEvents.forEach((eventObject) => {
        if (
          eventObject.isAllDay &&
          !eventObject.recurring &&
          new Date(eventObject.day).setHours(0, 0, 0, 0) <
            new Date(Date.now()).setHours(0, 0, 0, 0)
        ) {
          eventObject.isOld = true;
        } else if (
          !eventObject.isAllDay &&
          !eventObject.recurring &&
          new Date(eventObject.end).setHours(0, 0, 0, 0) <
            new Date(Date.now()).setHours(0, 0, 0, 0)
        ) {
          eventObject.isOld = true;
        } else if (eventObject.recurring) {
          console.log(
            "Recurring Log, Options:",
            eventObject.name,
            eventObject.recurringOptions
          );
          console.log(
            "Recurring Log, CurrentDate:",
            new Date(Date.now()).setHours(0, 0, 0, 0)
          );
          if (
            eventObject.recurringOptions.recurringDates.every(
              (d) => d < new Date(Date.now()).setHours(0, 0, 0, 0)
            )
          ) {
            eventObject.isOld = true;
          }
        } else {
          eventObject.isOld = false;
        }
      });
    },
  },
  getters: {
    calendarData: (state) => (state.calendar ? true : false),
    getEventsForActiveDay: (state): CalendarEvent[] => {
      const db = state.displayBatches.find(
        (db) =>
          db.date.setHours(0, 0, 0, 0) ===
          new Date(state.activeMonth.setDate(state.selectedDay)).setHours(
            0,
            0,
            0,
            0
          )
      );

      console.warn("Getting events for active day", db);
      if (db) {
        return db.events;
      }
      return [];
    },
    getEvents: (state) => state.calendar?.calendarEvents,
    getOldEvents: (state) =>
      state.calendar?.calendarEvents.filter((e) => e.isOld),
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
