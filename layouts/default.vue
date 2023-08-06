<template>
  <v-app id="main-view">
    <v-main class="sechat-layout">
      <v-container
        class="bg-transparent d-flex justify-center align-center flex-column"
      >
        <NuxtImg
          src="/logos/logo-only-transparent-300x300.png"
          alt=""
          width="300"
          height="150"
        ></NuxtImg>
        <div class="text-h6">Encrypted chat & video calls</div>
        <ChatUserAvatar
          v-if="userStore.isSignedIn"
          :active="false"
          :user-name="userStore.getUserName"
          size="small"
        />
      </v-container>
      <v-divider
        class="border-opacity-40 mx-10 my-2"
        color="warning"
      ></v-divider>
      <GdprDialog />
      <chat-snackbar />
      <slot />
      <v-divider
        class="border-opacity-40 mx-10 my-5"
        color="warning"
      ></v-divider>
      <v-container
        class="bg-transparent d-flex justify-center align-center flex-column"
      >
        <div class="d-flex justify-center flex-column align-center">
          <div class="text-subtitle-2 mb-2">Tech</div>
          <div class="d-flex flex-row">
            <Icon name="logos:nuxt-icon" />
            <Icon name="logos:vuetifyjs" />
            <Icon name="devicon:csharp" />
          </div>
        </div>
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
    </v-main>
  </v-app>
</template>
<script setup lang="ts">
const config = useRuntimeConfig();
const appStore = useSechatAppStore();
const userStore = useUserStore();
const chatApi = useChatApi();
const refreshHandler = useRefreshHandler();

onMounted(async () => {
  appStore.updateLocalLanguage();
  const authCheck = await chatApi.isAuthorized();
  if (!authCheck) {
    console.error("Auth Check Failed");
    console.error("Stored Profile", userStore.userProfile);
    refreshHandler.signOutCleanup();
  }
});
</script>
<style scoped>
.glow {
  box-shadow: 0 0 4px 2px #000000, 0 0 3px 2px #616161, 0 0 3px 4px #bdbdbd,
    0 0 3px 1px #616161;
}
</style>
