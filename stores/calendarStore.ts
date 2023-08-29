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
      this.calendar.calendarEvents = [
        ...this.calendar.calendarEvents.filter((ce) => ce.id !== value.id),
        value,
      ];
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
  },
});
