<template>
  <v-container class="d-flex justify-center align-center">
    <v-card min-width="350" width="700" class="sechat-v-card-full">
      <v-toolbar>
        <v-toolbar-title>Events</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn @click="scrollToToday" class="mx-1">Show Recent</v-btn>
        <calendar-events-create />
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <calendar-events-list />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const calendarStore = useCalendarStore();

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
