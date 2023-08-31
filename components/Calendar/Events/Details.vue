<template>
  <v-dialog width="500">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" class="mx-1" color="primary">Details</v-btn>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <template v-slot:subtitle>
          <div v-if="props.calendarEvent.isAllDay">
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
          <div v-else>
            {{
              new Date(props.calendarEvent.start).toLocaleString(
                appStore.localLanguage
              )
            }}
            -
            {{
              new Date(props.calendarEvent.end).toLocaleString(
                appStore.localLanguage
              )
            }}
          </div>
        </template>
        <v-card-text>
          <p class="text-h4 text--primary">{{ props.calendarEvent.name }}</p>
          <div class="text--primary" v-if="props.calendarEvent.description">
            {{ props.calendarEvent.description }}
          </div>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
const appStore = useSechatAppStore();
interface PropsModel {
  calendarEvent: CalendarEvent;
}
const props = defineProps<PropsModel>();
</script>

<style scoped></style>
