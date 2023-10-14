<template>
  <v-list-item
    class="my-2 mx-1 pa-1 event-borders"
    :class="props.calendarEvent.isOld ? 'old-event' : ''"
  >
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
          <div v-else class="tiny-font d-flex flex-column justify-center">
            <div>
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
            </div>
            <v-icon class="ml-12" icon="mdi-menu-down" color="warning">
            </v-icon>
            <div>
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
      </div>
    </template>
    <template v-slot:subtitle>
      <div class="small-font">
        {{ props.calendarEvent.description }}
      </div>
    </template>
    <template v-slot:prepend>
      <div class="d-flex align-center">
        <v-badge v-if="reminderBadge" :content="reminderBadge" color="error">
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

const reminderBadge = computed<number>(() => {
  console.log("calculating badges", props.calendarEvent.reminders.length);
  if (props.calendarEvent.reminders.length === 0) {
    console.log("reminder badge computed", props.calendarEvent.name, 0);
    return 0;
  }
  const res = props.calendarEvent.reminders.reduce((sum, item) => {
    if (new Date(item.remind) > new Date(Date.now())) {
      return (sum += 1);
    }
    return sum;
  }, 0);
  console.log("reminder badge computed", props.calendarEvent.name, res);
  return res;
});

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
.old-event {
  opacity: 0.3;
}
.event-borders {
  border-left: 3px solid v-bind("props.calendarEvent.color");
}
</style>
