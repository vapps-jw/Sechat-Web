<template>
  <v-list flex align-center>
    <div v-for="(batch, index) in calendarStore.getDisplayBatches" :key="index">
      <v-row no-gutters class="flex-nowrap align-center my-2 mx-1 pa-1">
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
                new Date(batch.date).toLocaleString(appStore.localLanguage, {
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
      <div v-for="(ce, index) in batch.events" :key="`${index}`">
        <calendar-events-list-item :calendar-event="ce" />
      </div>
    </div>
  </v-list>
</template>

<script setup lang="ts">
const calendarStore = useCalendarStore();
const appStore = useSechatAppStore();
</script>

<style scoped></style>
