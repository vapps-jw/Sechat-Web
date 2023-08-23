<template>
  <v-list-item :border="true" class="my-2 mx-1 pa-1">
    <template v-slot:title>
      <div class="small-font"></div>
    </template>
    <template v-slot:prepend>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-dots-vertical"
            variant="plain"
            v-bind="props"
          ></v-btn>
        </template>
      </v-menu>
    </template>
    <template v-slot:append> </template>
  </v-list-item>
</template>

<script setup lang="ts">
const props = defineProps<CalendarEvent>();
</script>

<style scoped></style>
