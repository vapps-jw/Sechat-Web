<template>
  <v-dialog min-width="350" width="500">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" class="mx-1" color="primary">Details</v-btn>
    </template>
    <v-card>
      <v-container>
        <calendar-events-basic-display :calendar-event="props.calendarEvent" />
        <v-divider class="my-2" />
        <CalendarEventsDatesDisplay :calendar-event="props.calendarEvent" />
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
interface PropsModel {
  calendarEvent: CalendarEvent;
}
const props = defineProps<PropsModel>();
</script>

<style scoped></style>
