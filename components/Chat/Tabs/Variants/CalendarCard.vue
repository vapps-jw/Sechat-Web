<template>
  <v-card
    @click="activate"
    min-height="150"
    class="ma-2"
    :color="
      chatStore.activeBottomNav === BottomNavBarSet.CalendarNavBar
        ? 'accent'
        : ''
    "
  >
    <div class="d-flex flex-no-wrap justify-space-between">
      <div>
        <v-card-title class="text-h5"> Calendar </v-card-title>
        <v-card-subtitle>Organizer</v-card-subtitle>
      </div>

      <v-avatar class="ma-3" size="125" rounded="0">
        <v-progress-circular
          v-if="loading"
          color="warning"
          indeterminate
          size="64"
        ></v-progress-circular>
        <NuxtImg
          v-else
          src="/logos/logo-only-transparent-300x300.png"
          alt=""
          width="100"
          height="100"
        ></NuxtImg>
      </v-avatar>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import {
  BottomNavBarSet,
  ChatViews,
  LocalStoreTypes,
} from "~~/utilities/globalEnums";
import { E2EStatusMessages } from "~/utilities/e2eEnums";
import { getISODate, readSavedDate } from "~/utilities/dateFunctions";
const chatStore = useSechatChatStore();
const e2e = useE2Encryption();
const appStore = useSechatAppStore();
const calendarStore = useCalendarStore();
const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();
const loading = ref<boolean>(false);

const activate = async () => {
  loading.value = true;

  const masterKeys = e2e.getKeys(LocalStoreTypes.E2EMASTER);
  if (masterKeys.length === 0) {
    appStore.showWarningSnackbar("First you have to create or sync Master Key");
    loading.value = false;
    return;
  }

  if (calendarStore.calendarData) {
    chatStore.activateNavBar(BottomNavBarSet.CalendarNavBar);
    loading.value = false;
    return;
  }

  const masterKey = e2e.getMasterKey();
  if (!masterKey) {
    sechatStore.showErrorSnackbar("Master Key is missing, check your profile");
    loading.value = false;
    return;
  }

  const data = await getCalendar();
  console.log("Fetching calendar data", data);
  let decryptionResult = true;
  const mappedCalendar: Calendar = {
    decrypted: false,
    calendarEvents: data.calendarEvents.map((ce) => {
      const decryptedData = e2e.decryptMessage(ce.data, masterKey);
      if (decryptedData === E2EStatusMessages.DECRYPTION_ERROR) {
        decryptionResult = false;
        return {
          id: ce.id,
          name: "Decryption Error",
          description: "Decryption Error",
          color: "#EEEEEE",
          isAllDay: false,
          reminders: [],
          day: null,
          start: null,
          end: null,
        } as CalendarEvent;
      }
      const eventObject = JSON.parse(decryptedData) as CalendarEvent;
      console.log("Decrypted Event", eventObject);
      eventObject.id = ce.id;
      eventObject.reminders = ce.reminders;

      if (eventObject.isAllDay && eventObject.day) {
        eventObject.day = getISODate(new Date(eventObject.day));
      } else {
        eventObject.start = readSavedDate(eventObject.start);
        eventObject.end = readSavedDate(eventObject.end);
      }

      console.log("Mapped Event", eventObject);
      return eventObject;
    }),
  };
  mappedCalendar.decrypted = decryptionResult;

  if (!decryptionResult) {
    sechatStore.showErrorSnackbar(
      "Calendar decryption failed. Check your master key."
    );
    loading.value = false;
    return;
  }

  console.log("Calendar Fetched", mappedCalendar);
  calendarStore.updateCalendar(mappedCalendar);
  console.log("Display Batches", calendarStore.getDisplayBatches);

  chatStore.activateNavBar(BottomNavBarSet.CalendarNavBar);
  loading.value = false;
};

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
