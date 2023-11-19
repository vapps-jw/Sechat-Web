<template>
  <v-list flex align-center v-if="calendarStore.displayBatches.length > 0">
    <div
      :id="batch.id.toString()"
      v-for="(batch, index) in calendarStore.displayBatches"
      :key="batch.id"
    >
      <v-row no-gutters class="flex-nowrap align-center my-2 mx-1 pa-1">
        <v-col cols="4" class="flex-grow-0 flex-shrink-1 ml-2">
          <v-divider color="tertiary"></v-divider>
        </v-col>

        <v-col
          style="min-width: 150px"
          cols="4"
          class="d-flex flex-grow-1 flex-shrink-0 justify-center align-center flex-column"
        >
          <v-sheet class="mx-3">
            <div
              :class="
                batch.today
                  ? 'font-weight-bold text-warning'
                  : 'small-font text-primary'
              "
            >
              {{
                new Date(batch.date).toLocaleString(appStore.localLanguage, {
                  weekday: "long",
                })
              }}
            </div>
          </v-sheet>
          <v-sheet class="mx-3">
            <div
              :class="
                batch.today
                  ? 'font-weight-bold text-warning'
                  : 'small-font text-primary'
              "
            >
              {{
                new Date(batch.date).toLocaleString(appStore.localLanguage, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              }}
            </div>
          </v-sheet>
        </v-col>

        <v-col cols="4" class="flex-grow-0 flex-shrink-1">
          <v-divider color="tertiary"></v-divider>
        </v-col>
      </v-row>
      <div v-for="(ce, index) in batch.events" :key="index">
        <calendar-events-list-item :calendar-event="ce" />
      </div>
    </div>
  </v-list>
  <v-container v-else class="d-flex justify-center align-center">
    <v-alert
      class="alert-font"
      density="compact"
      type="info"
      variant="tonal"
      title="Add First Event"
      text="This is a chronological list of Events. You can add reminders to them, you will reveive push notifications."
    ></v-alert>
  </v-container>
</template>

<script setup lang="ts">
const calendarStore = useCalendarStore();
const appStore = useSechatAppStore();
</script>

<style scoped></style>
