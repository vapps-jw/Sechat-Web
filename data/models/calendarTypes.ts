type Calendar = {
  calendarEventDtos: CalendarEvent[];
};

type CalendarEvent = {
  id: string;

  name: string;
  description: string;
  color: string;

  isAllDay: boolean;
  day: Date;

  start: Date;
  end: Date;

  reminders: EventReminder[];
};

type EventReminder = {
  id: number;
  remind: Date;
  reminders: number;
};
