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
      <calendar-events-edit @update-event="createEvent" />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const dialog = ref<boolean>(false);
const e2e = useE2Encryption();
const sechatStore = useSechatAppStore();
const config = useRuntimeConfig();
const calendarStore = useCalendarStore();

const createEvent = async (data: CalendarEvent) => {
  console.log("Submitting Event", data);

  const masterKey = e2e.getMasterKey();
  const encrptedData = e2e.encryptMessage(JSON.stringify(data), masterKey);
  console.log("Encrypted Data", encrptedData);

  if (!calendarStore.calendarData) {
    console.error("Calendar is missing");
    return;
  }

  const { error: apiError, data: res } = await useFetch<CalendarEventDto>(
    `${config.public.apiBase}/calendar/event`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: {
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

  console.log("API result", res.value);
  data.id = res.value.id;
  calendarStore.updateEvent(data);
  dialog.value = false;
};
</script>
