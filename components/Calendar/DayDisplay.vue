<template>
  <v-sheet id="chatView" class="ma-0 pr-1 overflow-auto events-list">
    <v-list
      flex
      align-center
      v-if="calendarStore.getEventsForActiveDay.length > 0"
    >
      <div
        v-for="(ce, index) in calendarStore.getEventsForActiveDay"
        :key="index"
      >
        <calendar-events-list-item :calendar-event="ce" />
      </div>
    </v-list>
  </v-sheet>
</template>

<script setup lang="ts">
const calendarStore = useCalendarStore();
</script>

<style scoped>
.events-list {
  height: 22dvh;
}
</style>
