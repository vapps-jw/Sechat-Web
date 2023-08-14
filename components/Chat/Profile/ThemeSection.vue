<template>
  <div>
    <v-alert
      class="alert-font"
      density="compact"
      type="info"
      variant="tonal"
      title="Tooltips"
      text="Switch between light and dark Theme"
    ></v-alert>
    <v-card>
      <v-card-actions>
        <v-switch
          v-model="settingStore.settings.theme"
          hide-details
          :true-value="ThemeSetting.DARK"
          :false-value="ThemeSetting.LIGHT"
          :label="
            settingStore.settings.theme === ThemeSetting.DARK
              ? 'Dark Theme'
              : 'Light Theme'
          "
        ></v-switch>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from "vuetify";

const settingStore = useSettingsStore();
const theme = useTheme();

const { settings } = storeToRefs(settingStore);
watch(
  settings,
  async (newVal, oldVal) => {
    console.log("Theme update", newVal, oldVal, settings);
    theme.global.name.value = settings.value.theme;
    settingStore.updateStoredSettings();
  },
  { deep: true }
);
</script>

<style scoped></style>
