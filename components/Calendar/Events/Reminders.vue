<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" class="mx-1" color="primary">Reminders</v-btn>
    </template>

    <v-card>
      <v-toolbar>
        <v-toolbar-title>Reminders</v-toolbar-title>
        <v-toolbar-items>
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const dialog = ref<boolean>(false);
interface PropsModel {
  calendarEvent: CalendarEvent;
}
const props = defineProps<PropsModel>();
</script>

<style scoped></style>
