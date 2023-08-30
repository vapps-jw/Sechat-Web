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
  },
  getters: {
    calendarData: (state) => (state.calendar ? true : false),
    getEvents: (state) => state.calendar?.calendarEvents,
    getEventsDates: (state): Date[] => {
      if (state.calendar.calendarEvents.length === 0) {
        return [];
      }

      const dates = [] as Date[];
      for (
        let index = 0;
        index < state.calendar.calendarEvents.length;
        index++
      ) {
        if (state.calendar.calendarEvents[index].isAllDay) {
          const day = new Date(
            new Date(state.calendar.calendarEvents[index].day).setHours(0)
          );
          if (!dates.some((d) => d === day)) {
            dates.push(day);
          }
        } else {
          const start = new Date(
            new Date(state.calendar.calendarEvents[index].start).setHours(0)
          );
          const end = new Date(
            new Date(state.calendar.calendarEvents[index].end).setHours(0)
          );
          let nextDate = start;
          while (nextDate <= end) {
            if (dates.some((d) => d === nextDate)) {
              continue;
            }
            dates.push(nextDate);
            nextDate = new Date(nextDate.setDate(nextDate.getDate() + 1));
          }
        }
      }
      return dates;
    },
  },
});

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
