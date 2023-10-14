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

      <!-- All Day -->

      <v-text-field
        v-if="eventData.isAllDay"
        v-model="eventData.day"
        type="date"
        label="Pick a Day"
      ></v-text-field>

      <!-- Start & End -->

      <v-text-field
        v-if="!eventData.isAllDay"
        v-model="eventData.start"
        type="datetime-local"
        :min="eventData.start"
        label="Start"
      ></v-text-field>

      <v-text-field
        v-if="!eventData.isAllDay"
        v-model="eventData.end"
        type="datetime-local"
        :min="eventData.start"
        label="End"
      ></v-text-field>

      <v-checkbox
        v-model="eventData.isAllDay"
        label="All Day Event"
      ></v-checkbox>

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
    <v-btn data-cy="create-room-btn" variant="tonal" @click="submit">
      Save
    </v-btn>
  </v-card-actions>
</template>

<script setup lang="ts">
import { createDateToSave, getISODate } from "~/utilities/dateFunctions";

const e2e = useE2Encryption();
const sechatStore = useSechatAppStore();

const emit = defineEmits(["updateEvent"]);

const props = defineProps({
  calendarEvent: {
    type: Object as PropType<CalendarEvent>,
    default: {
      reminders: <EventReminder[]>[],
      id: "",
      name: "",
      description: "",
      color: "#EEEEEE",
      isAllDay: false,
      day: new Date(Date.now()).toISOString().split("T")[0],
      start: new Date(Date.now()).toISOString(),
      end: new Date(Date.now()).toISOString(),
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
  nameRules: [
    (v) => !!v || "Event Name is required",
    (v) =>
      (v && v.length <= 25) || "Event Name can`t have more than 25 characters",
  ],
  descriptionRules: [
    (v) => v.length <= 500 || "Description can`t have more than 500 characters",
  ],
  startRules: [
    (v) => !!v || "Start is required",
    (v) =>
      new Date(v).getTime() > new Date(eventData.value.end).getTime() ||
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

  console.log("Event Edit Form", eventData.value);

  console.warn("Original start", eventData.value.start);
  console.warn("Original end", eventData.value.end);
  console.warn("Original day", eventData.value.day);

  const startToSave = eventData.value.start;
  const endToSave = eventData.value.end;
  const dayToSave = eventData.value.isAllDay ? eventData.value.day : null;

  console.warn("startToSave", startToSave);
  console.warn("endToSave", endToSave);
  console.warn("dayToSave", dayToSave);

  const newEvent = <CalendarEvent>{
    id: eventData.value.id,
    name: eventData.value.name,
    description: eventData.value.description,
    color: eventData.value.color,
    isAllDay: eventData.value.isAllDay,
    day: dayToSave,
    start: startToSave,
    end: endToSave,
    reminders: eventData.value.reminders,
  };
  emit("updateEvent", newEvent);
};
</script>

<style scoped></style>
