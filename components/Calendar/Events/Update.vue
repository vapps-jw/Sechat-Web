<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" class="mx-1" color="primary">Edit</v-btn>
    </template>

    <v-card>
      <v-toolbar>
        <v-toolbar-title>Edit Event</v-toolbar-title>
        <v-toolbar-items>
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <calendar-events-edit
        @update-event="updateEvent"
        :calendar-event="props.calendarEvent"
      />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { getISODate, readSavedDate } from "~/utilities/dateFunctions";

const dialog = ref<boolean>(false);
const e2e = useE2Encryption();
const sechatStore = useSechatAppStore();
const config = useRuntimeConfig();
const calendarStore = useCalendarStore();

interface PropsModel {
  calendarEvent: CalendarEvent;
}
const props = defineProps<PropsModel>();

const updateEvent = async (data: CalendarEvent) => {
  if (data.isAllDay) {
    data.day = new Date(data.day).toUTCString();
  } else {
    data.start = new Date(data.start).toUTCString();
    data.end = new Date(data.end).toUTCString();
  }

  console.log("Submitting Event", data);

  const masterKey = e2e.getMasterKey();
  const encrptedData = e2e.encryptMessage(JSON.stringify(data), masterKey);

  if (!calendarStore.calendarData) {
    console.error("Calendar is missing");
    return;
  }

  const { error: apiError, data: res } = await useFetch(
    `${config.public.apiBase}/calendar/event`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      credentials: "include",
      body: {
        id: data.id,
        data: encrptedData,
      },
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(apiError.value.data);
    return;
  } else {
    sechatStore.showSuccessSnackbar("Event saved");
  }

  if (data.isAllDay && data.day) {
    data.day = getISODate(new Date(data.day));
  } else {
    data.start = readSavedDate(data.start);
    data.end = readSavedDate(data.end);
  }
  console.log("Updating Event", data);

  calendarStore.updateEvent(data);
  dialog.value = false;
};
</script>
