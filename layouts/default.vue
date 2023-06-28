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
      </v-container>
      <v-divider
        class="border-opacity-50 mx-10 my-5"
        color="warning"
      ></v-divider>
      <GdprDialog />
      <chat-snackbar />
      <slot />
    </v-main>
  </v-app>
</template>
<script setup lang="ts">
const conf = useRuntimeConfig();
</script>
