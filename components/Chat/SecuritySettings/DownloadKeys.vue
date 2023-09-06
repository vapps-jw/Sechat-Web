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
        <a id="downloadAnchorElem" style="display: none"></a>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const e2e = useE2Encryption();
const userStore = useUserStore();

const extractKeys = () => {
  const extract = e2e.extractKeys();
  console.log("Extracted keys", extract);

  let dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(extract));
  let dlAnchorElem = document.getElementById("downloadAnchorElem");
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute(
    "download",
    `${userStore.getUserName}_sechat_keys.json`
  );
  dlAnchorElem.click();
};
</script>

<style scoped></style>
