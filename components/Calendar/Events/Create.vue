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
      <calendar-events-edit />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { getISODate } from "~/utilities/dateFunctions";

const dialog = ref<boolean>(false);
const e2e = useE2Encryption();
const sechatStore = useSechatAppStore();

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

  const masterKey = e2e.getMasterKey();
  if (!masterKey) {
    sechatStore.showErrorSnackbar("Master Key is missing, check your profile");
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
