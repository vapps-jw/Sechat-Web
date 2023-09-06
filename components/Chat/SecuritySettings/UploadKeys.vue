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
          type="file"
          accept="application/json"
          placeholder="Pick a file"
          label="File with Keys"
          v-model="chosenFile"
        >
          <template v-slot:append>
            <v-icon @click="importfile" color="warning">mdi-send</v-icon>
          </template></v-file-input
        >
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const chosenFile = ref<File[]>(null);

const importfile = () => {
  console.log("Chosen File", chosenFile.value[0]);

  const reader = new FileReader();
  reader.readAsText(chosenFile.value[0]);
  reader.onload = (re) => {
    const storedKeys = JSON.parse(reader.result as string) as E2EExtract;
    console.log("JSON", storedKeys);
  };
};
</script>

<style scoped></style>
