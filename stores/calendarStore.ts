export const useCalendarStore = defineStore({
  id: "sechat-calendar-store",
  state: () => {
    return {
      calendar: <Calendar>null,
    };
  },
  actions: {
    updateUserProfile(value: Calendar) {
      this.calendar = value;
    },
  },
  getters: {
    calendarData: (state) => (state.calendar ? true : false),
  },
});
