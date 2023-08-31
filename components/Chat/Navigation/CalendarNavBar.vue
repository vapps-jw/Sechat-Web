<template>
  <v-bottom-navigation
    mode="shift"
    color="primary"
    v-model="chatStore.activeChatTab"
  >
    <v-btn
      color="tertiary"
      :value="ChatViews.Events"
      @click="chatStore.activateView(ChatViews.Events)"
    >
      <v-icon>mdi-calendar-star</v-icon>
      <span>Events</span>
    </v-btn>
    <!-- <v-btn
      color="tertiary"
      :value="ChatViews.Calendar"
      @click="chatStore.activateView(ChatViews.Calendar)"
    >
      <v-icon>mdi-calendar-month</v-icon>
      <span>Calendar</span>
    </v-btn> -->
    <!-- <v-btn
        color="tertiary"
        v-if="chatStore.activeBottomNav === BottomNavBarSet.CalendarNavBar"
        :value="ChatViews.Notes"
        @click="chatStore.activateView(ChatViews.Notes)"
      >
        <v-icon>mdi-notebook-edit-outline</v-icon>
        <span>Notes</span>
      </v-btn> -->
    <v-btn
      color="warning"
      :value="ChatViews.AppsSelection"
      @click="chatStore.activateView(ChatViews.AppsSelection)"
    >
      <v-icon>mdi-apps</v-icon>
      <span>Sechat</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
import { readSavedDate } from "~/utilities/dateFunctions";
import { ChatViews } from "~~/utilities/globalEnums";
const chatStore = useSechatChatStore();
const calendarStore = useCalendarStore();
const config = useRuntimeConfig();
const e2e = useE2Encryption();
const sechatStore = useSechatAppStore();

onMounted(async () => {
  if (calendarStore.calendarData) {
    return;
  }

  const masterKey = e2e.getMasterKey();
  if (!masterKey) {
    sechatStore.showErrorSnackbar("Master Key is missing, check your profile");
    return;
  }

  console.log("Fetching calendar data");

  const data = await getCalendar();
  const mappedCalendar: Calendar = {
    calendarEvents: data.calendarEvents.map((ce) => {
      // TODO: handle decryption error
      const decryptedData = e2e.decryptMessage(ce.data, masterKey);
      const eventObject = JSON.parse(decryptedData) as CalendarEvent;
      console.log("Decrypted Event", eventObject);
      eventObject.id = ce.id;
      eventObject.reminders = ce.reminders;

      if (eventObject.isAllDay && eventObject.day) {
        eventObject.day = readSavedDate(eventObject.day);
      } else {
        eventObject.start = readSavedDate(eventObject.start);
        eventObject.end = readSavedDate(eventObject.end);
      }

      console.log("Mapped Event", eventObject);
      return eventObject;
    }),
  };

  console.log("Calendar Fetched", mappedCalendar);
  calendarStore.updateCalendar(mappedCalendar);

  console.log("Display Batches", calendarStore.getDisplayBatches);
});

const getCalendar = async () => {
  console.log("Getting Calendar from API");
  const { error: apiError, data: res } = await useFetch<CalendarDto>(
    `${config.public.apiBase}/calendar`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (apiError.value) {
    throw createError({
      ...apiError.value,
      statusCode: apiError.value.statusCode,
      statusMessage: apiError.value.data,
    });
  }
  return res.value;
};
</script>

<style scoped></style>
