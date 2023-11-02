<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" class="mx-1" color="primary">Reminders</v-btn>
    </template>

    <v-card>
      <v-toolbar>
        <v-toolbar-title>Reminders</v-toolbar-title>
        <v-toolbar-items>
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text class="ma-0 pa-0">
        <v-container>
          <v-alert
            density="comfortable"
            type="info"
            title="Push notification reminder"
            text="You will receive a notification at this time"
            variant="tonal"
          ></v-alert>
        </v-container>

        <v-container>
          <div class="text-caption my-3">Add Reminder</div>
          <v-text-field
            v-model="date"
            type="datetime-local"
            :min="minReminderDate"
            label="End"
          >
            <template v-slot:append>
              <v-icon @click="createReminder" color="success"
                >mdi-plus-circle-outline</v-icon
              >
            </template></v-text-field
          >
        </v-container>

        <v-container>
          <v-list density="compact" v-if="props.calendarEvent.reminders">
            <v-list-item
              v-for="r in props.calendarEvent.reminders"
              :key="r.id"
              class="mr-1"
            >
              <v-list-item-title>
                {{
                  new Date(r.remind).toLocaleString(appStore.localLanguage, {
                    hour: "2-digit",
                    minute: "2-digit",
                    weekday: "short",
                    year: "2-digit",
                    month: "numeric",
                    day: "numeric",
                  })
                }}</v-list-item-title
              >
              <template v-slot:append>
                <v-btn
                  color="error"
                  icon="mdi-close-circle"
                  variant="text"
                  @click="removeReminder(r)"
                ></v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const appStore = useSechatAppStore();
const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();
const calendarStore = useCalendarStore();

const dialog = ref<boolean>(false);

interface PropsModel {
  calendarEvent: CalendarEvent;
}
const props = defineProps<PropsModel>();

const removeReminder = async (reminder: EventReminder) => {
  console.log("Removing reminder", reminder);

  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/calendar/event/${props.calendarEvent.id}/${reminder.id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
      credentials: "include",
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(apiError.value.data);
    return;
  }
  sechatStore.showSuccessSnackbar("Reminder deleted");
  calendarStore.removeReminder(props.calendarEvent.id, reminder.id);
};

const createReminder = async () => {
  // TODO: add default cases + handle recurring events, 5mins, 15mins, 30mins, 1hr before

  console.log(
    "Creating Reminder",
    date.value,
    new Date(new Date(date.value).toUTCString()).toISOString()
  );

  const { error: apiError, data: res } = await useFetch<EventReminder>(
    `${config.public.apiBase}/calendar/event/reminder`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: {
        eventId: props.calendarEvent.id,
        remind: new Date(new Date(date.value).toUTCString()).toISOString(),
      },
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(apiError.value.data);
    return;
  }
  sechatStore.showSuccessSnackbar("Reminder saved");

  console.log("Reminder saved", res.value);

  console.log("Adding Reminder", res.value);
  calendarStore.addReminder(props.calendarEvent.id, res.value);
};

const minReminderDate = computed<string>(() =>
  new Date(new Date().toString().split("GMT")[0] + " UTC")
    .toISOString()
    .split(".")[0]
    .slice(0, -3)
);

const date = ref<string>(minReminderDate.value);
</script>

<style scoped></style>
