type Calendar = {
  calendarEventDtos: CalendarEvent[];
};

type CalendarEvent = {
  id: string;
  name: string;
  description: string;
  color: string;
  isAllDay: boolean;
  allDay: Date;
  start: Date;
  end: Date;
};
