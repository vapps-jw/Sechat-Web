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

      <v-checkbox
        v-model="eventData.isAllDay"
        label="All Day Event"
      ></v-checkbox>
      <v-text-field
        v-if="eventData.isAllDay"
        v-model="eventData.day"
        type="date"
        :min="getISODate(new Date(Date.now() + 60 * 60 * 24 * 1000))"
        label="Pick a Day"
      ></v-text-field>

      <!-- Start & End -->

      <v-text-field
        v-if="!eventData.isAllDay"
        v-model="eventData.start"
        type="datetime-local"
        :max="eventData.end"
        label="Start"
      ></v-text-field>

      <v-text-field
        v-if="!eventData.isAllDay"
        v-model="eventData.end"
        type="datetime-local"
        :min="eventData.start"
        label="End"
      ></v-text-field>

      <div class="d-flex justify-center align-center">
        <v-color-picker
          dot-size="20"
          v-model="eventData.color"
          hide-inputs
        ></v-color-picker>
      </div>
    </v-form>
  </v-card-text>
  <v-card-actions class="justify-center">
    <v-btn data-cy="create-room-btn" variant="tonal" @click="submit">
      Create
    </v-btn>
  </v-card-actions>
</template>

<script setup lang="ts">
import { getISODate } from "~/utilities/dateFunctions";
const emit = defineEmits(["sendEvent"]);

const props = defineProps({
  calendarEvent: {
    type: Object as PropType<CalendarEvent>,
    default: {
      name: "",
      description: "",
      color: "#EEEEEE",
      isAllDay: false,
      day: <Date>null,
      start: new Date(new Date().toString().split("GMT")[0] + " UTC")
        .toISOString()
        .split(".")[0]
        .slice(0, -3),
      end: new Date(
        new Date(Date.now() + 60 * 60 * 1000).toString().split("GMT")[0] +
          " UTC"
      )
        .toISOString()
        .split(".")[0]
        .slice(0, -3),
    },
  },
});

onMounted(async () => {
  console.info("Create event mounted", eventData.value);
});

const eventCreateForm = ref<HTMLFormElement>();
const eventData = ref({
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
      (v && v.length <= 50) || "Event Name can`t have more than 50 characters",
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

watch(
  () => eventData.value.start,
  (currValue, prevValue) => {
    // if (
    //   new Date(currValue).getTime() > new Date(eventData.value.end).getTime()
    // ) {
    //   console.warn("Watcher", currValue, eventData.value.end);
    //   eventData.value.start = eventData.value.end;
    // }
  },
  { deep: true }
);

const submit = async () => {
  const { valid } = await eventCreateForm.value?.validate();
  if (!valid) {
    console.warn("Form not valid", valid);
    return;
  }

  console.log("Submitting changes", eventData.value);
  emit("sendEvent", eventData.value);
};
</script>

<style scoped></style>
