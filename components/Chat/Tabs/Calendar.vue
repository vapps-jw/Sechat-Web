<template>
  <v-container class="d-flex justify-center align-center">
    <v-row justify="space-around" class="my-1">
      <v-date-picker
        @click:save="saveEvent"
        @click:cancel="cancelEvent"
        @update:model-value="modelUpdate"
        color="primary"
      ></v-date-picker>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const appStore = useSechatAppStore();
const calendarDate = ref<string>(null);

const saveEvent = () => {
  console.log("Save");
};

const cancelEvent = () => {
  console.log("Cancel");
};

const modelUpdate = (something: any) => {
  console.log("Model update", something);
};
</script>

<style scoped></style>
