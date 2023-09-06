<template>
  <div>
    <v-alert
      class="alert-font"
      density="compact"
      type="warning"
      variant="tonal"
      title="Restore Keys"
      text="Pick a file and get saved keys from the file"
    ></v-alert>
    <v-card>
      <v-card-text class="pb-0">
        <v-file-input
          accept="application/json"
          placeholder="Pick a file"
          label="File with Keys"
          v-model="chosenFile"
        >
          <template v-slot:append>
            <v-icon @click="" color="warning">mdi-send</v-icon>
          </template></v-file-input
        >
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const chosenFile = ref(null);

const importfile = () => {};
</script>

<style scoped></style>
