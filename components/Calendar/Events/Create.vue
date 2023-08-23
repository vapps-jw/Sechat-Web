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
      <v-card-text>
        <v-form ref="eventCreateForm" @submit.prevent>
          <v-alert
            class="alert-font"
            density="compact"
            type="info"
            variant="tonal"
            title="Encryption"
            text="text"
          ></v-alert>
          <v-text-field
            data-cy="new-event-name-field"
            class="my-2"
            v-model="eventData.name"
            :rules="eventData.nameRules"
            :counter="50"
            label="Name"
            required
          ></v-text-field>
          <v-textarea
            data-cy="new-event-description-field"
            class="my-2"
            v-model="eventData.description"
            :rules="eventData.descriptionRules"
            :counter="500"
            label="Description"
            required
          ></v-textarea>
          <div class="d-flex justify-center align-center">
            <v-color-picker
              v-model="eventData.color"
              hide-inputs
            ></v-color-picker>
          </div>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn data-cy="create-room-btn" variant="tonal" @click="createEvent">
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const dialog = ref<boolean>(false);
const signalR = useSignalR();

const eventCreateForm = ref<HTMLFormElement>();
const eventData = ref({
  valid: true,
  name: "",
  description: "",
  color: "",
  isAllDay: false,
  allDay: <Date>null,
  start: Date.now(),
  end: Date.now() + 1000 * 60 * 60,
  nameRules: [
    (v) => !!v || "Event Name is required",
    (v) =>
      (v && v.length <= 50) || "Event Name can`t have more than 50 characters",
  ],
  descriptionRules: [
    (v) => v.length <= 500 || "Description can`t have more than 500 characters",
  ],
});

// id: string;
//   name: string;
//   description: string;
//   color: string;
//   isAllDay: boolean;
//   allDay: Date;
//   start: Date;
//   end: Date;

const createEvent = async () => {
  console.log(eventData.value);
  //dialog.value = false;
};
</script>
