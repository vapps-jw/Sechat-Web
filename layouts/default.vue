<template>
  <v-app id="main-view">
    <v-main>
      <v-container
        class="bg-transparent d-flex justify-center align-center flex-column"
      >
        <v-img
          :max-height="300"
          :width="300"
          src="/logos/logo-only-transparent-300x300-cropped.png"
        ></v-img>
        <div class="text-h6">E2E Encrypted chat & video calls</div>
        <ChatUserAvatar
          v-if="userStore.isSignedIn"
          :picture="userStore.userProfile.profilePicture"
          :active="false"
          :user-name="userStore.getUserName"
          size="large"
        />
      </v-container>
      <GdprDialog />
      <chat-snackbar />
      <slot />
    </v-main>
    <v-container
      class="bg-transparent d-flex justify-center align-center flex-column"
    >
      <v-btn
        class="mt-10 glow"
        icon="mdi-github"
        href="https://github.com/vapps-jw"
      >
      </v-btn>
      <v-chip class="mt-5" size="x-small" variant="text" color="warning">
        {{ config.public.appVersion }}
      </v-chip>
    </v-container>
  </v-app>
</template>
<script setup lang="ts">
import { useTheme } from "vuetify";

const config = useRuntimeConfig();
const appStore = useSechatAppStore();
const userStore = useUserStore();
const I18n = useI18n();
const theme = useTheme();
const settings = useSettingsStore();

onMounted(async () => {
  console.warn("Chat Defualt Layout onMounted", settings.settings.theme);
  if (settings.settings.theme) {
    theme.global.name.value = settings.settings.theme;
  }
  appStore.updateLocalLanguage(I18n.locale.value);
});
</script>
<style scoped>
html {
  font-family: "Ubuntu";
}
</style>
