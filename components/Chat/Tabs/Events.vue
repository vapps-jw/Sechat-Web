<template>
  <v-container class="d-flex justify-center align-center">
    <v-card min-width="350" width="700" class="sechat-v-card-full">
      <v-toolbar>
        <v-toolbar-title>Events</v-toolbar-title>
        <calendar-events-create />
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <calendar-events-list />
      </v-card-text>
      <v-card-actions>
        <v-btn
          :loading="isBusy"
          :disabled="isBusy"
          variant="tonal"
          @click="deleteOld"
          class="mx-1"
          >Delete Old</v-btn
        >
        <v-spacer />
        <v-btn
          :loading="isBusy"
          :disabled="isBusy"
          variant="tonal"
          @click="scrollToToday"
          class="mx-1"
          >Show Recent</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const calendarStore = useCalendarStore();
const isBusy = ref<boolean>(false);
const config = useRuntimeConfig();
const sechatStore = useSechatAppStore();

const deleteOld = async () => {
  if (calendarStore.calendar?.calendarEvents?.length == 0) {
    return;
  }

  const eventsToDelete = calendarStore.calendar?.calendarEvents
    .filter((e) => e.isOld)
    .map((e) => e.id);

  if (eventsToDelete.length === 0) {
    return;
  }

  isBusy.value = true;
  const { error: apiError, data: preview } = await useFetch(
    `${config.public.apiBase}/calendar/delete-events`,
    {
      method: "POST",
      credentials: "include",
      body: eventsToDelete,
    }
  );

  if (apiError.value) {
    sechatStore.showErrorSnackbar(apiError.value.data);
    isBusy.value = false;
    return;
  }

  calendarStore.removeEvents(eventsToDelete);
  calendarStore.recalculateBatches();
  calendarStore.markOldEvents();
  sechatStore.showSuccessSnackbar("Old Events Deleted");
  isBusy.value = false;
};

const scrollToToday = () => {
  if (calendarStore.displayBatches.length === 0) {
    return;
  }
  var today = new Date(Date.now()).setHours(0, 0, 0, 0);
  const closestBatch = calendarStore.displayBatches.reduce(function (
    prev,
    curr
  ) {
    var prevDist = Math.abs(new Date(prev.date).setHours(0, 0, 0, 0) - today);
    var currDist = Math.abs(new Date(curr.date).setHours(0, 0, 0, 0) - today);
    if (prevDist < currDist) {
      return prev;
    }
    return curr;
  });

  document
    .getElementById(closestBatch.id.toString())
    .scrollIntoView({ behavior: "smooth" });
};

onMounted(() =>
  setTimeout(() => {
    scrollToToday();
  })
);
</script>

<style scoped></style>
