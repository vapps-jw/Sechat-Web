<template>
  <div>
    <v-alert
      class="alert-font"
      density="compact"
      type="warning"
      variant="tonal"
      title="Save Keys"
      text="Save keys to file"
    ></v-alert>
    <v-card>
      <v-card-actions>
        <v-btn @click="extractKeys" color="success" variant="outlined">
          Save to File
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const e2e = useE2Encryption();

const extractKeys = () => {
  const extract = e2e.extractKeys();
  console.log("Extracted keys", extract);

  const data = JSON.stringify(extract);
  const blob = new Blob([data], { type: "text/plain" });
  const e = document.createEvent("MouseEvents"),
    a = document.createElement("a");
  a.download = "test.json";
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
  a.dispatchEvent(e);
};
</script>

<style scoped></style>
