<template>
  <v-list-item :border="true" class="my-2 mx-1 pa-1">
    <template v-slot:title>
      <div class="small-font">{{ props.calendarEvent.name }}</div>
    </template>
    <template v-slot:prepend>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-dots-vertical"
            variant="plain"
            v-bind="props"
          ></v-btn>
        </template>
        <v-list>
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

<style scoped></style>
