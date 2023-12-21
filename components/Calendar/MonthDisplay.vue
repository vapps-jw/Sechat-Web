<template>
  <v-container class="py-2">
    <v-card class="transparent px-3 py-3">
      <v-row>
        <v-col v-for="dayName in calendarStore.dayNames">
          <div class="text-center">
            <div class="small-font font-weight-bold">
              {{ dayName }}
            </div>
          </div>
        </v-col>
      </v-row>
      <v-row v-for="(weekRow, weekIndex) in calendarStore.monthArray">
        <v-col
          :class="
            calendarStore.selectedDay === dayPosition && dayPosition !== 0
              ? ' bg-primary rounded-0'
              : ''
          "
          v-for="dayPosition in calendarStore.monthArray[weekIndex]"
        >
          <div
            v-if="dayPosition > 0"
            @click="daySelected(dayPosition)"
            class="text-center pointer"
          >
            <div>
              <p>{{ dayPosition }}</p>
              <div
                v-if="
                  calendarStore.displayBatches.some(
                    (db) =>
                      db.date.setHours(0, 0, 0, 0) ===
                      new Date(
                        calendarStore.activeMonth.setDate(dayPosition)
                      ).setHours(0, 0, 0, 0)
                  )
                "
                v-for="event in calendarStore.displayBatches.find(
                  (db) =>
                    db.date.setHours(0, 0, 0, 0) ===
                    new Date(
                      calendarStore.activeMonth.setDate(dayPosition)
                    ).setHours(0, 0, 0, 0)
                ).events"
                class="box bg-secondary rounded-0"
                :style="`border: 1px solid ${event.color};`"
              ></div>
            </div>
          </div>

          <div v-else class="text-transparent">
            <p>{{ dayPosition }}</p>
          </div>
        </v-col>
      </v-row>
    </v-card>
    <v-btn @click="thisMonth" block rounded="0" class="my-2" size="x-small"
      >Current Month</v-btn
    >
    <div class="text-h5 d-flex justify-center my-1 align-center">
      <v-btn
        @click="monthBack"
        variant="plain"
        icon="mdi-arrow-left-drop-circle-outline"
      >
      </v-btn>
      <v-spacer />
      <div>
        {{
          calendarStore.activeMonth.toLocaleString(appStore.localLanguage, {
            year: "numeric",
            month: "long",
          })
        }}
      </div>
      <v-spacer />
      <v-btn
        @click="monthForward"
        variant="plain"
        icon="mdi-arrow-right-drop-circle-outline"
      >
      </v-btn>
    </div>
    <CalendarDayDisplay v-if="calendarStore.getEventsForActiveDay.length > 0" />
    <v-container v-else class="d-flex justify-center align-center">
      <v-alert
        class="alert-font"
        density="compact"
        type="info"
        variant="tonal"
        title="No Events for this day"
        text="This is a list of Events. You can add reminders to them, you will reveive push notifications."
      ></v-alert>
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { monthAdd } from "~/utilities/dateFunctions";

const appStore = useSechatAppStore();
const calendarStore = useCalendarStore();

const daySelected = (day: number) => {
  calendarStore.activeMonth.setDate(day);
  calendarStore.selectedDay = day;
  console.log("Selected", day, calendarStore.activeMonth);
};

onMounted(() => {
  calendarStore.updateDayNames(appStore.localLanguage);
  calendarStore.createMonthArray(appStore.localLanguage);
});

const monthBack = () => {
  calendarStore.activeMonth = monthAdd(calendarStore.activeMonth, -1);
  calendarStore.createMonthArray(appStore.localLanguage);
};

const monthForward = () => {
  calendarStore.activeMonth = monthAdd(calendarStore.activeMonth, +1);
  calendarStore.createMonthArray(appStore.localLanguage);
};

const thisMonth = () => {
  calendarStore.activeMonth = new Date(Date.now());
  calendarStore.createMonthArray(appStore.localLanguage);
};
</script>

<style scoped>
.box {
  height: 2px;
}

.pointer {
  cursor: pointer;
}
.transparent {
  background-color: transparent !important;
  opacity: 1;
  border-color: transparent !important;
}
</style>
