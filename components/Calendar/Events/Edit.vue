<template>
  <v-card-text>
    <v-form v-model="form" ref="eventCreateForm" @submit.prevent>
      <v-text-field
        data-cy="new-event-name-field"
        class="my-2"
        v-model="eventData.name"
        :rules="validationRules.nameRules"
        :counter="25"
        label="Name"
        required
      ></v-text-field>
      <v-textarea
        data-cy="new-event-description-field"
        class="my-2"
        v-model="eventData.description"
        :rules="validationRules.descriptionRules"
        :counter="500"
        label="Description"
        required
      ></v-textarea>
      <v-divider />
      <v-checkbox
        density="compact"
        hide-details
        v-model="eventData.isAllDay"
        label="All Day Event"
      >
      </v-checkbox>
      <v-checkbox
        density="compact"
        hide-details
        v-model="eventData.recurring"
        label="Recurring"
      ></v-checkbox>
      <v-divider class="mb-3" />

      <div v-if="!eventData.recurring">
        <!-- All Day -->

        <v-text-field
          v-if="eventData.isAllDay"
          v-model="eventData.day"
          type="date"
          label="All Day Event"
          :rules="[allDayRules.standard.notNull(eventData.day)]"
        ></v-text-field>

        <!-- Start & End -->

        <v-text-field
          v-if="!eventData.isAllDay && !eventData.recurring"
          v-model="eventData.start"
          type="datetime-local"
          label="Start"
          :rules="[
            timedEventRules.standard.notNull(eventData.start),
            timedEventRules.standard.startCheck(eventData, eventData.start),
          ]"
        ></v-text-field>

        <v-text-field
          v-if="!eventData.isAllDay && !eventData.recurring"
          v-model="eventData.end"
          type="datetime-local"
          :min="eventData.start"
          label="End"
          :rules="[
            timedEventRules.standard.notNull(eventData.end),
            timedEventRules.standard.endCheck(eventData, eventData.end),
          ]"
        ></v-text-field>
      </div>
      <div v-else>
        <!-- Recurring Start Day -->

        <v-text-field
          v-if="eventData.recurring"
          v-model="eventData.recurringOptions.startDay"
          type="date"
          label="Recurring Event Start Day"
          :rules="[
            allDayRules.recurring.notNull(eventData.recurringOptions.startDay),
          ]"
        ></v-text-field>

        <!-- Recurring Start & End -->

        <v-text-field
          v-if="!eventData.isAllDay"
          v-model="eventData.recurringOptions.startTime"
          type="time"
          label="Recurring Event Start"
          :rules="[
            timedEventRules.recurring.notNull(
              eventData.recurringOptions.startTime
            ),
            timedEventRules.recurring.startCheck(
              eventData,
              eventData.recurringOptions.startTime
            ),
          ]"
        ></v-text-field>

        <v-text-field
          v-if="!eventData.isAllDay"
          v-model="eventData.recurringOptions.endTime"
          type="time"
          label="Recurring Event End"
          :rules="[
            timedEventRules.recurring.notNull(
              eventData.recurringOptions.endTime
            ),
            timedEventRules.recurring.endCheck(
              eventData,
              eventData.recurringOptions.endTime
            ),
          ]"
        ></v-text-field>

        <!-- Recurring Settings -->

        <v-combobox
          label="Interval"
          v-model="eventData.recurringOptions.intervalType"
          :items="Object.values(RecurringIntervalType)"
        ></v-combobox>

        <v-text-field
          v-if="
            eventData.recurringOptions.intervalType ===
            RecurringIntervalType.FixedInterval
          "
          v-model="eventData.recurringOptions.fixedIntervalStep"
          :min="1"
          :max="100"
          type="number"
          label="Repeat every X days"
        ></v-text-field>

        <v-text-field
          v-model="eventData.recurringOptions.duration"
          :min="1"
          :max="100"
          type="number"
          label="Repeat X times"
        ></v-text-field>
      </div>

      <div class="d-flex justify-center align-center">
        <v-color-picker
          dot-size="25"
          hide-inputs
          v-model="eventData.color"
        ></v-color-picker>
      </div>
    </v-form>
  </v-card-text>
  <v-card-actions class="justify-center">
    <v-btn
      :disabled="props.isBusy || !form"
      :loading="props.isBusy"
      data-cy="create-room-btn"
      variant="tonal"
      @click="submit"
    >
      Save
    </v-btn>
  </v-card-actions>
</template>

<script setup lang="ts">
import {
  addHoursToDate,
  getEventDateTime,
  getTime,
} from "~/utilities/dateFunctions";
import { RecurringIntervalType } from "~/utilities/globalEnums";

const e2e = useE2Encryption();
const sechatStore = useSechatAppStore();

const emit = defineEmits(["updateEvent"]);
3;
const form = ref(false);

const props = defineProps({
  isBusy: {
    type: Boolean,
    default: false,
  },
  calendarEvent: {
    type: Object as PropType<CalendarEvent>,
    default: {
      reminders: <EventReminder[]>[],
      id: "",
      name: "",
      description: "",
      recurring: false,
      color: "#EEEEEE",
      isAllDay: false,
      day: new Date(Date.now()).toISOString().split("T")[0],
      start: getEventDateTime(addHoursToDate(new Date(Date.now()), 0)),
      end: getEventDateTime(addHoursToDate(new Date(Date.now()), 1)),
      recurringOptions: {
        startDay: new Date(Date.now()).toISOString().split("T")[0],
        startTime: addHoursToDate(new Date(Date.now()), 1),
        endTime: addHoursToDate(new Date(Date.now()), 2),
        intervalType: RecurringIntervalType.MonthDay,
        fixedIntervalStep: 1,
        duration: 1,
      },
    },
  },
});

onMounted(async () => {
  console.log("Create event mounted", eventData.value);
});

const allDayRules = {
  standard: {
    notNull: (v) => !!v || "Field is required",
  },
  recurring: {
    notNull: (v) => !!v || "Field is required",
  },
};

const timedEventRules = {
  standard: {
    notNull: (v) => !!v || "Field is required",
    startCheck: (eventData, v) => {
      console.log(
        "Standard Start Check",
        new Date(eventData.start).getTime(),
        new Date(eventData.end).getTime(),
        new Date(eventData.start).getTime() < new Date(eventData.end).getTime()
      );
      if (
        eventData.start &&
        eventData.end &&
        new Date(eventData.start).getTime() < new Date(eventData.end).getTime()
      ) {
        return true;
      }
      return "Incorrect Data";
    },
    endCheck: (eventData, v) => {
      if (
        eventData.start &&
        eventData.end &&
        new Date(eventData.start).getTime() < new Date(eventData.end).getTime()
      ) {
        return true;
      }
      return "Incorrect Data";
    },
  },
  recurring: {
    notNull: (v) => !!v || "Field is required",
    startCheck: (eventData, v) => {
      const start: number = eventData.recurringOptions.startTime.replace(
        ":",
        ""
      );
      const end: number = eventData.recurringOptions.endTime.replace(":", "");

      if (start < end) {
        return true;
      }
      return "Incorrect Data";
    },
    endCheck: (eventData, v) => {
      const start: number = eventData.recurringOptions.startTime.replace(
        ":",
        ""
      );
      const end: number = eventData.recurringOptions.endTime.replace(":", "");

      if (start < end) {
        return true;
      }
      return "Incorrect Data";
    },
  },
};

const validationRules = {
  nameRules: [
    (v) => !!v || "Event Name is required",
    (v) =>
      (v && v.length <= 25) || "Event Name can`t have more than 25 characters",
  ],
  descriptionRules: [
    (v) => v.length <= 500 || "Description can`t have more than 500 characters",
  ],
};

const eventCreateForm = ref<HTMLFormElement>();
const eventData = ref({
  reminders: props.calendarEvent.reminders,
  valid: true,
  id: props.calendarEvent.id,
  name: props.calendarEvent.name,
  description: props.calendarEvent.description,
  color: props.calendarEvent.color,
  isAllDay: props.calendarEvent.isAllDay,
  day: props.calendarEvent.day,
  start: props.calendarEvent.start,
  end: props.calendarEvent.end,
  recurring: props.calendarEvent.recurring,
  recurringOptions: {
    startDay: props.calendarEvent.recurringOptions.startDay,
    startTime: getTime(
      new Date(props.calendarEvent.recurringOptions.startTime)
    ),
    endTime: getTime(new Date(props.calendarEvent.recurringOptions.endTime)),
    intervalType: props.calendarEvent.recurringOptions.intervalType,
    fixedIntervalStep: props.calendarEvent.recurringOptions.fixedIntervalStep,
    duration: props.calendarEvent.recurringOptions.duration,
  },
});

const submit = async () => {
  const { valid } = await eventCreateForm.value?.validate();
  if (!valid) {
    console.warn("Form not valid", valid);
    return;
  }

  const masterKey = e2e.getMasterKey();
  if (!masterKey) {
    sechatStore.showErrorSnackbar("Master Key is missing, check your profile");
  }

  console.warn("Original start", eventData.value.start);
  console.warn("Original end", eventData.value.end);
  console.warn("Original day", eventData.value.day);

  console.warn("startToSave", eventData.value.start);
  console.warn("endToSave", eventData.value.end);
  console.warn(
    "dayToSave",
    eventData.value.isAllDay ? eventData.value.day : null
  );

  const newEvent = <CalendarEvent>{
    id: eventData.value.id,
    name: eventData.value.name,
    description: eventData.value.description,
    color: eventData.value.color,
    isAllDay: eventData.value.isAllDay,
    day: eventData.value.isAllDay ? eventData.value.day : null,
    start: eventData.value.start,
    end: eventData.value.end,
    reminders: eventData.value.reminders,
    recurring: eventData.value.recurring,
    recurringOptions: {
      startDay: eventData.value.recurringOptions.startDay,
      startTime: eventData.value.recurringOptions.startTime,
      endTime: eventData.value.recurringOptions.endTime,
      intervalType: eventData.value.recurringOptions.intervalType,
      fixedIntervalStep: eventData.value.recurringOptions.fixedIntervalStep,
      duration: eventData.value.recurringOptions.duration,
      recurringDates: [],
    },
  };

  if (newEvent.recurringOptions.startTime) {
    const today = new Date();
    const h: number = Number(newEvent.recurringOptions.startTime.split(":")[0]);
    const m: number = Number(newEvent.recurringOptions.startTime.split(":")[1]);
    newEvent.recurringOptions.startTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      h,
      m,
      0
    ).toISOString();
  }

  if (newEvent.recurringOptions.endTime) {
    const today = new Date();
    const h: number = Number(newEvent.recurringOptions.endTime.split(":")[0]);
    const m: number = Number(newEvent.recurringOptions.endTime.split(":")[1]);
    newEvent.recurringOptions.endTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      h,
      m,
      0
    ).toISOString();
  }

  console.warn("Event Edit Form Result", newEvent);
  emit("updateEvent", newEvent);
};
</script>

<style scoped></style>
