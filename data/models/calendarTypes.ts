type Calendar = {
  calendarEvents: CalendarEvent[];
};

type CalendarEvent = {
  id?: string;
  name: string;
  description: string;
  color: string;
  isAllDay: boolean;
  day?: string;
  start?: string;
  end?: string;
  reminders?: EventReminder[];
};

type EventReminder = {
  id: number;
  remind: Date;
  reminders: number;
};

// API DTOs

type CalendarDto = {
  calendarEvents: CalendarEventDto[];
};

type CalendarEventDto = {
  id?: string;
  data: string;
  reminders?: EventReminder[];
};
