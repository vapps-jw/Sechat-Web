<template>
  <v-list flex align-center>
    <calendar-events-list-item
      v-for="ce in calendarStore.getEvents"
      :key="ce.id"
      :calendar-event="ce"
    />
  </v-list>
</template>

<script setup lang="ts">
const calendarStore = useCalendarStore();
</script>

<style scoped></style>
