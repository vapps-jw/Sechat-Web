type Calendar = {
  id: string;
  name: string;
  calendarEventDtos: CalendarEvent[];
};

type CalendarEvent = {
  id: string;
  name: string;
  description: string;
  isAllDay: boolean;
  allDay: Date;
  start: Date;
  end: Date;
};
