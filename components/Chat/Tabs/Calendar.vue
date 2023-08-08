<template>
  <v-container class="d-flex justify-center align-center">
    <v-row justify="space-around" class="my-1">
      <v-date-picker
        v-model="calendarModel"
        @click:save="saveEvent"
        @click:cancel="cancelEvent"
        @update:model-value="modelUpdate"
        cancel-text="Clear"
        color="primary"
      >
      </v-date-picker>
    </v-row>
    <v-text-field type="date" label="start (required)"></v-text-field>
    <v-text-field type="time" label="start (required)"></v-text-field>
  </v-container>
</template>

<script setup lang="ts">
const appStore = useSechatAppStore();
const calendarDate = ref<string>(null);
const calendarModel = ref<any>(null);

const saveEvent = () => {
  console.log("Save");
  const lastDate = [calendarModel.value];
  console.log("First date", lastDate);

  console.log("After Update", calendarModel.value);
};

const cancelEvent = () => {
  console.log("Cancel");
};

const modelUpdate = (something: any) => {};
</script>

<style scoped></style>
