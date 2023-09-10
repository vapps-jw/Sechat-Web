<template>
  <div>
    <v-alert
      class="alert-font"
      density="compact"
      type="info"
      variant="tonal"
      title="Profile Picture"
      text="Turn on/off tooltips across the app"
    ></v-alert>
    <v-card>
      <v-card-actions>
        <v-file-input
          accept="image/png, image/jpeg, image/bmp"
          placeholder="Pick an avatar"
          prepend-icon="mdi-camera"
          label="Avatar"
        ></v-file-input>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const settingStore = useSettingsStore();
</script>

<style scoped></style>
