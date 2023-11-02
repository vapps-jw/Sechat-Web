<template>
  <v-card-text>
    <v-form ref="eventCreateForm" @submit.prevent>
      <v-text-field
        data-cy="new-event-name-field"
        class="my-2"
        v-model="eventData.name"
        :rules="eventData.nameRules"
        :counter="50"
        label="Name"
        required
      ></v-text-field>
      <v-textarea
        data-cy="new-event-description-field"
        class="my-2"
        v-model="eventData.description"
        :rules="eventData.descriptionRules"
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
      <!-- <v-checkbox
        density="compact"
        hide-details
        v-model="eventData.recurring"
        label="Recurring"
      ></v-checkbox> -->
      <v-divider class="mb-3" />

      <!-- All Day -->

      <v-text-field
        v-if="eventData.isAllDay && !eventData.recurring"
        v-model="eventData.day"
        type="date"
        label="All Day Event"
      ></v-text-field>

      <!-- Recurring Start Day -->

      <v-text-field
        v-if="eventData.recurring"
        v-model="eventData.recurringOptions.startDay"
        type="date"
        label="Recurring Event Start Day"
      ></v-text-field>

      <!-- Start & End -->

      <v-text-field
        v-if="!eventData.isAllDay && !eventData.recurring"
        v-model="eventData.start"
        type="datetime-local"
        :min="eventData.start"
        label="Start"
      ></v-text-field>

      <v-text-field
        v-if="!eventData.isAllDay && !eventData.recurring"
        v-model="eventData.end"
        type="datetime-local"
        :min="eventData.start"
        label="End"
      ></v-text-field>

      <!-- Recurring Start & End -->
      <v-text-field
        v-if="!eventData.isAllDay && eventData.recurring"
        v-model="eventData.recurringOptions.startTime"
        type="time"
        label="Recurring Event Start"
        :rules="eventData.recurranceStartRules"
      ></v-text-field>

      <v-text-field
        v-if="!eventData.isAllDay && eventData.recurring"
        v-model="eventData.recurringOptions.endTime"
        :min="eventData.recurringOptions.startTime"
        :rules="eventData.recurranceEndRules"
        type="time"
        label="Recurring Event End"
      ></v-text-field>

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
      :disabled="props.isBusy"
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
const e2e = useE2Encryption();
const sechatStore = useSechatAppStore();

const emit = defineEmits(["updateEvent"]);

// TODO: add section for recurring

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
      start: new Date(Date.now()).toISOString(),
      end: new Date(Date.now()).toISOString(),
      recurringOptions: {
        startDay: new Date(Date.now()).toISOString().split("T")[0],
        startTime: null,
        endTime: null,
        interval: 1,
        duration: 1,
      },
    },
  },
});

onMounted(async () => {
  console.info("Create event mounted", eventData.value);
});

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
  recurring: false,
  recurringOptions: {
    startDay: props.calendarEvent.day,
    startTime: props.calendarEvent.start,
    endTime: props.calendarEvent.end,
    interval: 1,
    duration: 1,
  },
  nameRules: [
    (v) => !!v || "Event Name is required",
    (v) =>
      (v && v.length <= 25) || "Event Name can`t have more than 25 characters",
  ],
  descriptionRules: [
    (v) => v.length <= 500 || "Description can`t have more than 500 characters",
  ],
  startRules: [
    (v) =>
      (!!v && eventData.recurring && !eventData.isAllDay) ||
      "Start is required",
    (v) =>
      (new Date(v).getTime() > new Date(eventData.value.end).getTime() &&
        eventData.recurring &&
        !eventData.isAllDay) ||
      "Start must be before End",
  ],
  recurranceStartRules: [(v) => !!v || "Start Time is required"],
  recurranceEndRules: [
    (v) => !!v || "End Time is required",
    (v) =>
      (eventData.recurring &&
        !eventData.isAllDay &&
        new Date(v).getTime() <
          new Date(eventData.recurringOptions.startTime).getTime()) ||
      "Start must be before End",
  ],
  endRules: [(v) => !!v || "End is required"],
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
  };

  console.log("Event Edit Form Result", newEvent);
  emit("updateEvent", newEvent);
};
</script>

<style scoped></style>
