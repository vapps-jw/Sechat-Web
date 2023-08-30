<template>
  <v-list flex align-center>
    <div
      v-for="(ce, index) in calendarStore.getEvents"
      :key="`${ce.id}-${index}`"
    >
      <v-row
        v-if="
          index === 0 ||
          placementDate(calendarStore.getEvents[index - 1]) !==
            placementDate(ce)
        "
        no-gutters
        class="flex-nowrap align-center my-2 mx-1 pa-1"
      >
        <v-col cols="5" class="flex-grow-0 flex-shrink-1 ml-2">
          <v-divider color="tertiary"></v-divider>
        </v-col>

        <v-col
          style="min-width: 150px"
          cols="2"
          class="d-flex flex-grow-1 flex-shrink-0 justify-center align-center"
        >
          <v-sheet class="mx-3">
            <div class="small-font text-primary">
              {{
                toDate(ce).toLocaleString(appStore.localLanguage, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              }}
            </div>
          </v-sheet>
        </v-col>

        <v-col cols="5" class="flex-grow-0 flex-shrink-1">
          <v-divider color="tertiary"></v-divider>
        </v-col>
      </v-row>
      <calendar-events-list-item :calendar-event="ce" />
    </div>
  </v-list>
</template>

<script setup lang="ts">
const calendarStore = useCalendarStore();
const appStore = useSechatAppStore();

onMounted(async () => {});

const placementDate = (ce: CalendarEvent): number => {
  if (ce.isAllDay) {
    return new Date(ce.day).setHours(0, 0, 0, 0);
  } else {
    return new Date(ce.start).setHours(0, 0, 0, 0);
  }
};
const toDate = (ce: CalendarEvent): Date => {
  if (ce.isAllDay) {
    return new Date(ce.day);
  } else {
    return new Date(ce.start);
  }
};
</script>

<style scoped></style>
