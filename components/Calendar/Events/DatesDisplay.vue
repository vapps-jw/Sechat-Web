<template>
  <div v-if="props.calendarEvent.recurring">
    <div v-if="props.calendarEvent.isAllDay" v-for="dt in recurringDates">
      <div class="d-flex justify-center align-center font-weight-bold">
        <div>
          {{
            new Date(dt).toLocaleString(appStore.localLanguage, {
              year: "numeric",
              month: "numeric",
              day: "numeric",
            })
          }}
        </div>
      </div>
    </div>
    <div
      v-else
      v-for="dt in recurringDates"
      class="d-flex justify-center align-center"
    >
      <div class="font-weight-bold">
        <div>
          {{
            new Date(dt).toLocaleString(appStore.localLanguage, {
              year: "numeric",
              month: "numeric",
              day: "numeric",
            })
          }}
        </div>
      </div>
      <v-spacer />
      <div class="d-flex justify-center align-center">
        <div>
          {{
            new Date(
              props.calendarEvent.recurringOptions.startTime
            ).toLocaleString(appStore.localLanguage, {
              hour: "2-digit",
              minute: "2-digit",
            })
          }}
        </div>
        <v-icon icon="mdi-menu-right" color="warning"> </v-icon>
        <div>
          {{
            new Date(
              props.calendarEvent.recurringOptions.endTime
            ).toLocaleString(appStore.localLanguage, {
              hour: "2-digit",
              minute: "2-digit",
            })
          }}
        </div>
      </div>
    </div>
  </div>

  <div v-else>
    <div
      v-if="props.calendarEvent.isAllDay"
      class="d-flex justify-center align-center font-weight-bold"
    >
      <div>
        {{
          new Date(props.calendarEvent.day).toLocaleString(
            appStore.localLanguage,
            {
              year: "numeric",
              month: "numeric",
              day: "numeric",
            }
          )
        }}
      </div>
    </div>
    <div v-else class="d-flex justify-center align-center">
      <div class="font-weight-bold">
        <div>
          {{
            new Date(props.calendarEvent.start).toLocaleString(
              appStore.localLanguage,
              {
                year: "numeric",
                month: "numeric",
                day: "numeric",
              }
            )
          }}
        </div>
      </div>
      <v-spacer />
      <div class="d-flex justify-center align-center">
        <div>
          {{
            new Date(props.calendarEvent.start).toLocaleString(
              appStore.localLanguage,
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )
          }}
        </div>
        <v-icon icon="mdi-menu-right" color="warning"> </v-icon>
        <div>
          {{
            new Date(props.calendarEvent.end).toLocaleString(
              appStore.localLanguage,
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getRecurranceDates } from "~/utilities/calendarUtilities";

const appStore = useSechatAppStore();

interface PropsModel {
  calendarEvent: CalendarEvent;
}
const props = defineProps<PropsModel>();
const recurringDates = ref<Date[]>([]);

onMounted(async () => {
  if (props.calendarEvent.recurring) {
    recurringDates.value = getRecurranceDates(
      props.calendarEvent.recurringOptions
    ).map((d) => new Date(d));
  }
});
</script>

<style scoped></style>
