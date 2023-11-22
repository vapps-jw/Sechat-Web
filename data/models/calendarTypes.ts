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
  useEndDateTime?: boolean;
  end?: string;
  isOld?: boolean;
  reminders: EventReminder[];
  showReminderBagde: boolean;
  activeReminders: number;

  recurring?: boolean;
  recurringOptions?: EventRecurringOptions;
};

type EventRecurringOptions = {
  startDay?: string;
  startTime?: string;
  endTime?: string;
  intervalType?: string;
  fixedIntervalStep?: number;
  duration?: number;
  recurringDates?: number[];
};

type EventReminder = {
  id: number;
  remind: Date;
  reminders: number;
  isOld: boolean;
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
