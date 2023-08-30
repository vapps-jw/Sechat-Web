<template>
  <v-list-item class="my-2 mx-1 pa-1 event-borders">
    <template v-slot:title>
      <div>
        {{ props.calendarEvent.name }}
        <div class="small-font" v-if="!props.calendarEvent.isAllDay">
          <div
            v-if="
              new Date(props.calendarEvent.start).toLocaleDateString(
                appStore.localLanguage
              ) ===
              new Date(props.calendarEvent.end).toLocaleDateString(
                appStore.localLanguage
              )
            "
          >
            {{
              new Date(props.calendarEvent.start).toLocaleTimeString(
                appStore.localLanguage,
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )
            }}
            -
            {{
              new Date(props.calendarEvent.end).toLocaleTimeString(
                appStore.localLanguage,
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )
            }}
          </div>
          <div v-else>
            {{
              new Date(props.calendarEvent.start).toLocaleString(
                appStore.localLanguage,
                {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )
            }}
            -
            {{
              new Date(props.calendarEvent.end).toLocaleString(
                appStore.localLanguage,
                {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )
            }}
          </div>
        </div>
      </div>
    </template>
    <template v-slot:subtitle>
      <div class="small-font">
        {{ props.calendarEvent.description }}
      </div>
    </template>
    <template v-slot:prepend>
      <v-badge
        class="mr-5"
        v-if="props.calendarEvent.reminders.length > 0"
        :content="props.calendarEvent.reminders.length"
        color="error"
      >
        <v-icon>mdi-bell</v-icon>
      </v-badge>
      <v-icon class="mx-0 my-0" v-else>mdi-bell-off</v-icon>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            class="mx-1 my-1"
            icon="mdi-dots-vertical"
            variant="plain"
            v-bind="props"
          ></v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-btn @click="" class="mx-1" color="primary"
              >Details</v-btn
            ></v-list-item
          >
          <v-list-item>
            <v-btn @click="" class="mx-1" color="primary"
              >Add Reminder</v-btn
            ></v-list-item
          >
          <v-list-item>
            <v-btn @click="" class="mx-1" color="primary"
              >Edit</v-btn
            ></v-list-item
          >
          <v-list-item>
            <v-btn @click="deleteEvent" class="mx-1" color="error"
              >Delete</v-btn
            ></v-list-item
          >
        </v-list>
      </v-menu>
    </template>
    <template v-slot:append> </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { SnackbarMessages } from "~/utilities/globalEnums";

const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();
const calendarStore = useCalendarStore();
const appStore = useSechatAppStore();

interface PropsModel {
  calendarEvent: CalendarEvent;
}
const props = defineProps<PropsModel>();

const deleteEvent = async () => {
  console.log("Deleting Event", props.calendarEvent.id);
  try {
    const { error: apiError } = await useFetch(
      `${config.public.apiBase}/calendar/event/?eventId=${props.calendarEvent.id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (apiError.value) {
      console.error("API error", apiError.value);
      throw createError({
        ...apiError.value,
        statusCode: apiError.value.statusCode,
        statusMessage: apiError.value.data,
      });
    }

    calendarStore.removeEvent(props.calendarEvent);
    sechatStore.showSuccessSnackbar(SnackbarMessages.Success);
  } catch (error) {
    sechatStore.showErrorSnackbar(error.statusMessage);
  }
};
</script>
<style scoped>
.event-borders {
  border-left: 3px solid v-bind("props.calendarEvent.color");
}
</style>
