<template>
  <v-app id="main-view">
    <v-main>
      <v-container class="bg-transparent">
        <div class="d-flex justify-center">
          <NuxtImg
            src="/logos/logo-only-transparent-300x300.png"
            alt=""
            width="300"
            height="150"
          ></NuxtImg>
        </div>
        <div class="d-flex justify-center flex-wrap">
          <v-chip class="ma-2" color="warning">
            {{ config.public.appVersion }}
          </v-chip>
          <v-chip class="ma-2" color="warning">
            For best experience use as PWA
          </v-chip>
        </div>
        <v-divider class="my-4"></v-divider>
      </v-container>
      <GdprDialog />
      <chat-snackbar />
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
</script>
