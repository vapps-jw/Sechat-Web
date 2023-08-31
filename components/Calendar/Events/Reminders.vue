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
            text="TEXT"
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
              <v-list-item-title v-text="r.remind"></v-list-item-title>
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
          <div v-else>No Reminders</div>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();
const calendarStore = useCalendarStore();

const dialog = ref<boolean>(false);

interface PropsModel {
  calendarEvent: CalendarEvent;
}
const props = defineProps<PropsModel>();

const removeReminder = (reminder: EventReminder) => {
  console.log("Removing reminder", reminder);
};

const createReminder = async () => {
  console.log("Creating Reminder", new Date(date.value).toISOString());

  const { error: apiError, data: res } = await useFetch<EventReminder>(
    `${config.public.apiBase}/event/${props.calendarEvent.id}/reminder`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: {
        remind: new Date(date.value).toISOString(),
      },
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(apiError.value.data);
    return;
  }
  sechatStore.showSuccessSnackbar("Reminder saved");
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
