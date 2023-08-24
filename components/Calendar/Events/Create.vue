<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ props }">
      <v-btn
        data-cy="create-event-dialog-btn"
        v-bind="props"
        icon="mdi-calendar-plus"
        variant="outlined"
      ></v-btn>
    </template>

    <v-card>
      <v-toolbar>
        <v-toolbar-title>Create Event</v-toolbar-title>
        <v-toolbar-items>
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
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
        <v-btn data-cy="create-room-btn" variant="tonal" @click="createEvent">
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { getISODate } from "~/utilities/dateFunctions";

const dialog = ref<boolean>(false);

const eventCreateForm = ref<HTMLFormElement>();
const eventData = ref({
  valid: true,
  name: "",
  description: "",
  color: "#EEEEEE",
  isAllDay: false,
  day: <Date>null,
  start: new Date(new Date().toString().split("GMT")[0] + " UTC")
    .toISOString()
    .split(".")[0],
  end: new Date(
    new Date(Date.now() + 60 * 60 * 1000).toString().split("GMT")[0] + " UTC"
  )
    .toISOString()
    .split(".")[0],
  nameRules: [
    (v) => !!v || "Event Name is required",
    (v) =>
      (v && v.length <= 50) || "Event Name can`t have more than 50 characters",
  ],
  descriptionRules: [
    (v) => v.length <= 500 || "Description can`t have more than 500 characters",
  ],
  startRules: [(v) => !!v || "Start is required"],
  endRules: [(v) => !!v || "End is required"],
});

watch(
  () => eventData.value.start,
  (currValue, prevValue) => {
    if (new Date(currValue) > new Date(eventData.value.end)) {
      currValue = eventData.value.end;
    }
  },
  { deep: true }
);

const createEvent = async () => {
  console.log(eventData.value);
  const { valid } = await eventCreateForm.value?.validate();
  if (!valid) {
    console.warn("Form not valid", valid);
    return;
  }

  // TODO: handle dates conversion - store only UTC
  const newEvent = <CalendarEvent>{
    name: eventData.value.name,
    description: eventData.value.description,
    color: eventData.value.color,
    isAllDay: eventData.value.isAllDay,
    day: eventData.value.day.toISOString(),
    start: eventData.value.start,
    end: eventData.value.end,
  };

  //dialog.value = false;
};
</script>
