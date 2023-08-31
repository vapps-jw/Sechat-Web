type EventsDisplayBatch = {
  date: Date;
  events: CalendarEvent[];
};

export const useCalendarStore = defineStore({
  id: "sechat-calendar-store",
  state: () => {
    return {
      calendar: <Calendar>null,
    };
  },
  actions: {
    updateCalendar(value: Calendar) {
      value.calendarEvents = sortEvents(value.calendarEvents);
      this.calendar = value;
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
    getDisplayBatches: (state): EventsDisplayBatch[] => {
      if (state.calendar.calendarEvents.length === 0) {
        return [];
      }

      const batches = [] as EventsDisplayBatch[];
      let result = [] as number[];
      state.calendar.calendarEvents.forEach((ce) => {
        if (ce.isAllDay) {
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
          state.calendar.calendarEvents.filter((ce) => {
            if (ce.isAllDay) {
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
          date: new Date(r),
          events: validEvents,
        };
        batches.push(batch);
      });

      return batches.sort((a, b) => {
        return Number(b.date) - Number(a.date);
      });
    },
  },
});

const getDatesInRange = (startDate: number, endDate: number): number[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates = [];

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
