<template>
  <v-dialog width="500">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" class="mx-1" color="primary">Details</v-btn>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-toolbar
          color="primary"
          :title="props.calendarEvent.name"
        ></v-toolbar>
        <v-card-text>
          <div class="text-h2 pa-12">{{ props.calendarEvent.description }}</div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="isActive.value = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
interface PropsModel {
  calendarEvent: CalendarEvent;
}
const props = defineProps<PropsModel>();
</script>

<style scoped></style>
