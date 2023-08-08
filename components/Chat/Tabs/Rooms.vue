<template>
  <v-container class="d-flex justify-center align-center">
    <v-card min-width="350" width="700" class="sechat-v-card-full">
      <v-toolbar>
        <v-toolbar-title>Rooms</v-toolbar-title>
        <v-spacer></v-spacer>
        <chat-rooms-create-room />
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <v-alert
          v-if="settingStore.settings.tooltipSetting === TooltpSetting.VISIBLE"
          class="alert-font"
          density="compact"
          type="info"
          variant="tonal"
          title="E2E Encryption"
          text="When you create a Room new key for this room is created. New Room members have to be online to sync the room key. If all of the Room members lost their keys, the Room messages wont be possible to decrypt."
        ></v-alert>
        <chat-rooms-list />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const settingStore = useSettingsStore();
</script>

<style scoped></style>
