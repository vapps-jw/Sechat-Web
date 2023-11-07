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

        <v-container
          v-if="!props.calendarEvent.isAllDay"
          class="d-flex justify-center flex-wrap ma-0 pa-0"
        >
          <v-btn
            :disabled="postingReminder"
            :loading="postingReminder"
            color="primary"
            size="small"
            class="ma-1"
            @click="createDefualtReminder(DefaultReminder[5])"
            >5 mins before
          </v-btn>
          <v-btn
            :disabled="postingReminder"
            :loading="postingReminder"
            color="primary"
            size="small"
            class="ma-1"
            @click="createDefualtReminder(DefaultReminder[15])"
            >15 mins before
          </v-btn>
          <v-btn
            :disabled="postingReminder"
            :loading="postingReminder"
            color="primary"
            size="small"
            class="ma-1"
            @click="createDefualtReminder(DefaultReminder[30])"
            >30 mins before
          </v-btn>
          <v-btn
            :disabled="postingReminder"
            :loading="postingReminder"
            color="primary"
            size="small"
            class="ma-1"
            @click="createDefualtReminder(DefaultReminder[60])"
            >1 hour before
          </v-btn>
        </v-container>

        <v-container class="my-0 py-0">
          <div class="text-caption my-3">Add Reminder</div>
          <v-text-field
            :disabled="postingReminder"
            :loading="postingReminder"
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
        <v-container
          class="my-0 py-0 d-flex justify-center flex-wrap"
          v-if="props.calendarEvent.reminders.length > 0"
        >
          <v-btn
            :disabled="deletingReminder"
            :loading="deletingReminder"
            color="primary"
            size="small"
            @click="removeAllReminders"
          >
            Delete All Reminders
          </v-btn>
        </v-container>

        <v-container class="ma-0 pa-0">
          <v-list density="compact" v-if="props.calendarEvent.reminders">
            <v-list-item
              v-for="r in props.calendarEvent.reminders"
              :key="r.id"
              class="mr-1"
            >
              <v-list-item-title>
                {{
                  new Date(r.remind).toLocaleString(appStore.localLanguage)
                }}</v-list-item-title
              >
              <template v-slot:append>
                <v-btn
                  :disabled="deletingReminder"
                  :loading="deletingReminder"
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
import { getRecurranceDatesForReminders } from "~/utilities/calendarUtilities";

const appStore = useSechatAppStore();
const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();
const calendarStore = useCalendarStore();
const postingReminder = ref<boolean>(false);
const deletingReminder = ref<boolean>(false);

const DefaultReminder = {
  5: "5",
  15: "15",
  30: "30",
  60: "60",
};

type RemiderPostData = {
  eventId: string;
  remind: string;
};

const dialog = ref<boolean>(false);

interface PropsModel {
  calendarEvent: CalendarEvent;
}
const props = defineProps<PropsModel>();

const removeReminder = async (reminder: EventReminder) => {
  console.log("Removing reminder", reminder);

  if (deletingReminder.value) {
    return;
  } else {
    deletingReminder.value = true;
  }

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
  calendarStore.recalculateReminders();
  deletingReminder.value = false;
};

const removeAllReminders = async (eventId: string) => {
  console.log("Removing All reminders", eventId);

  if (deletingReminder.value) {
    return;
  } else {
    deletingReminder.value = true;
  }

  const { error: apiError } = await useFetch(
    `${config.public.apiBase}/calendar/event/${props.calendarEvent.id}/reminders`,
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
  sechatStore.showSuccessSnackbar("Reminders deleted");
  calendarStore.removeAllReminders(props.calendarEvent.id);
  calendarStore.recalculateReminders();
  deletingReminder.value = false;
};

const createDefualtReminder = async (reminder: string) => {
  console.log("Create Default Reminder", reminder);

  if (postingReminder.value) {
    return;
  } else {
    postingReminder.value = true;
  }

  if (!props.calendarEvent.recurring) {
    const reminderDate = new Date(props.calendarEvent.start);
    reminderDate.setMinutes(reminderDate.getMinutes() - Number(reminder));

    console.warn(
      "Create Default Reminder",
      new Date(reminderDate).toISOString()
    );

    await postReminder({
      eventId: props.calendarEvent.id,
      remind: new Date(reminderDate).toISOString(),
    });
    postingReminder.value = false;
    return;
  }

  const remindDates = getRecurranceDatesForReminders(
    props.calendarEvent.recurringOptions
  );

  const forms = [];
  remindDates.forEach(async (rd) => {
    forms.push({
      eventId: props.calendarEvent.id,
      remind: new Date(
        new Date(
          new Date(rd).setMinutes(new Date(rd).getMinutes() - Number(reminder))
        )
      ).toISOString(),
    });
  });

  const { error: apiError, data: res } = await useFetch<EventReminder[]>(
    `${config.public.apiBase}/calendar/event/${props.calendarEvent.id}/reminders`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: forms,
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(apiError.value.data);
    postingReminder.value = false;
    return;
  }
  sechatStore.showSuccessSnackbar("Reminders saved");

  console.log("Adding Reminders", res.value);

  calendarStore.addReminders(props.calendarEvent.id, res.value);
  calendarStore.recalculateReminders();
  postingReminder.value = false;
};

const postReminder = async (postData: RemiderPostData) => {
  const { error: apiError, data: res } = await useFetch<EventReminder>(
    `${config.public.apiBase}/calendar/event/reminder`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: {
        eventId: postData.eventId,
        remind: postData.remind,
      },
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar("Failed to create Reminder");
    console.error(apiError.value.data);
    return;
  }
  sechatStore.showSuccessSnackbar("Reminder saved");

  console.log("Adding Reminder", res.value);
  calendarStore.addReminder(props.calendarEvent.id, res.value);
  calendarStore.recalculateReminders();
};

const createReminder = async () => {
  console.log(
    "Creating Reminder",
    date.value,
    new Date(date.value).toISOString()
  );

  if (!date.value) {
    return;
  }

  if (postingReminder.value) {
    return;
  } else {
    postingReminder.value = true;
  }

  await postReminder({
    eventId: props.calendarEvent.id,
    remind: new Date(date.value).toISOString(),
  });
  postingReminder.value = false;
};

const minReminderDate = computed<string>(() =>
  new Date(new Date().toString().split("GMT")[0] + " UTC")
    .toISOString()
    .split(".")[0]
    .slice(0, -3)
);

const date = ref<string>("");
</script>

<style scoped></style>
