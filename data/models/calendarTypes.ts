type Calendar = {
  calendarEvents: CalendarEvent[];
  decrypted: boolean;
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
  isOld?: boolean;
  reminders: EventReminder[];
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
