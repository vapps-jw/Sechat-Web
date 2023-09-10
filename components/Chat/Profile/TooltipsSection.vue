<template>
  <div>
    <v-alert
      class="alert-font"
      density="compact"
      type="info"
      variant="tonal"
      title="Tooltips"
      text="Turn on/off tooltips across the app"
    ></v-alert>
    <v-card>
      <v-card-actions>
        <v-switch
          color="primary"
          v-model="settingStore.settings.tooltipSetting"
          hide-details
          :true-value="TooltpSetting.VISIBLE"
          :false-value="TooltpSetting.HIDDEN"
          :label="`${settingStore.settings.tooltipSetting}`"
        ></v-switch>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const settingStore = useSettingsStore();

const { settings } = storeToRefs(settingStore);
watch(
  settings,
  async (newVal, oldVal) => {
    console.log("Tolltip update", newVal, oldVal);
    settingStore.updateStoredSettings();
  },
  { deep: true }
);
</script>

<style scoped></style>
