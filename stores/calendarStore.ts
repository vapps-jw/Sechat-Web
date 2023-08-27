import { toRaw } from "vue";

export const useCalendarStore = defineStore({
  id: "sechat-calendar-store",
  state: () => {
    return {
      calendar: <Calendar>null,
    };
  },
  actions: {
    updateCalendar(value: Calendar) {
      this.calendar = value;
    },
    updateEvent(value: CalendarEvent) {
      console.log("Current Raw calendar", this.calendar);
      this.calendar.calendarEvents = [
        ...this.calendar.calendarEvents.filter((ce) => ce.id !== value.id),
        value,
      ];
      console.log("New Calendar", this.calendar);
    },
  },
  getters: {
    calendarData: (state) => (state.calendar ? true : false),
    getEvents: (state) => state.calendar?.calendarEvents,
  },
});
