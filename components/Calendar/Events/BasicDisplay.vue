<template>
  <div
    class="small-font text-primary"
    v-if="props.calendarEvent.isAllDay && !props.calendarEvent.recurring"
  >
    All Day Event
  </div>
  <div
    class="small-font text-primary"
    v-else-if="props.calendarEvent.isAllDay && props.calendarEvent.recurring"
  >
    All Day Recurring Event
  </div>
  <div
    class="small-font text-primary"
    v-else-if="props.calendarEvent.recurring"
  >
    One Time Recurring Event
  </div>
  <div
    class="small-font text-primary"
    v-else-if="!props.calendarEvent.recurring"
  >
    One Time Event
  </div>

  <p class="text-h5 text--primary mb-2 font-weight-bold">
    {{ props.calendarEvent.name }}
  </p>

  <p class="small-font">
    {{ props.calendarEvent.description }}
  </p>
</template>

<script setup lang="ts">
interface PropsModel {
  calendarEvent: CalendarEvent;
}
const props = defineProps<PropsModel>();
</script>

<style scoped></style>
