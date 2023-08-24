type Calendar = {
  calendarEventDtos: CalendarEvent[];
};

type CalendarEvent = {
  id: string;

  name: string;
  description: string;
  color: string;

  isAllDay: boolean;
  day: string;

  start: string;
  end: string;

  reminders: EventReminder[];
};

type EventReminder = {
  id: number;
  remind: Date;
  reminders: number;
};
