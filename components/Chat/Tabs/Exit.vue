<template>
  <v-container
    class="bg-transparent d-flex justify-center align-center flex-column sechat-v-card-full"
  >
    <NuxtImg
      src="/logos/logo-only-transparent-300x300.png"
      alt=""
      width="300"
      height="150"
    ></NuxtImg>
    <div class="text-h6 mb-3">Leave Sechat</div>
    <v-btn color="warning" @click="backToHomePage">Exit</v-btn>
  </v-container>
</template>

<script setup lang="ts">
const backToHomePage = () => {
  navigateTo("/");
};
</script>

<style scoped></style>
