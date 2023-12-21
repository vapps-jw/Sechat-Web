<template>
  <v-list-item
    class="mx-1 pa-1 event-borders"
    :class="props.calendarEvent.isOld ? 'old-event' : ''"
  >
    <template v-slot:title>
      <div>
        <v-icon
          size="x-small"
          color="success"
          v-if="props.calendarEvent.recurring"
          icon="mdi-repeat"
        ></v-icon>
        {{ props.calendarEvent.name }}
        <div
          class="small-font"
          v-if="!props.calendarEvent.isAllDay && !props.calendarEvent.recurring"
        >
          <div class="tiny-font d-flex justify-start align-center">
            <div>
              {{
                new Date(props.calendarEvent.start).toLocaleString(
                  appStore.localLanguage,
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )
              }}
            </div>
            <v-icon
              v-if="props.calendarEvent.useEndDateTime"
              icon="mdi-menu-right"
              color="warning"
            >
            </v-icon>
            <div v-if="props.calendarEvent.useEndDateTime">
              {{
                new Date(props.calendarEvent.end).toLocaleString(
                  appStore.localLanguage,
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )
              }}
            </div>
          </div>
        </div>
      </div>
      <div
        class="small-font"
        v-if="!props.calendarEvent.isAllDay && props.calendarEvent.recurring"
      >
        <div class="tiny-font d-flex justify-start align-center">
          <div>
            {{
              new Date(
                props.calendarEvent.recurringOptions.startTime
              ).toLocaleString(appStore.localLanguage, {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}
          </div>
          <v-icon
            v-if="props.calendarEvent.useEndDateTime"
            icon="mdi-menu-right"
            color="warning"
          >
          </v-icon>
          <div v-if="props.calendarEvent.useEndDateTime">
            {{
              new Date(
                props.calendarEvent.recurringOptions.endTime
              ).toLocaleString(appStore.localLanguage, {
                hour: "2-digit",
                minute: "2-digit",
              })
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
      <div class="d-flex align-center">
        <v-badge
          v-if="props.calendarEvent.showReminderBagde"
          :content="props.calendarEvent.activeReminders"
          color="error"
        >
          <v-icon color="primary">mdi-bell</v-icon>
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
              <calendar-events-details :calendar-event="props.calendarEvent"
            /></v-list-item>
            <v-list-item>
              <calendar-events-reminders
                :calendar-event="props.calendarEvent"
              />
            </v-list-item>
            <v-list-item>
              <calendar-events-update :calendar-event="props.calendarEvent"
            /></v-list-item>
            <v-list-item>
              <v-btn @click="deleteEvent" class="mx-1" color="error"
                >Delete</v-btn
              ></v-list-item
            >
          </v-list>
        </v-menu>
      </div>
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
    calendarStore.recalculateBatches();
    console.log(
      "Events after remove",
      calendarStore.calendar.calendarEvents,
      calendarStore.displayBatches
    );
    sechatStore.showSuccessSnackbar(SnackbarMessages.Success);
  } catch (error) {
    sechatStore.showErrorSnackbar(error.statusMessage);
  }
};
</script>
<style scoped>
.old-event {
  opacity: 0.3;
}
.event-borders {
  border-left: 3px solid v-bind("props.calendarEvent.color");
}
</style>
