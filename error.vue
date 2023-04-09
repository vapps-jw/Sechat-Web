<template>
  <v-container class="bg-transparent">
    <div class="d-flex justify-center">
      <NuxtImg src="/images/error-image.png" alt=""></NuxtImg>
    </div>
    <div class="d-flex justify-center flex-wrap flex-column align-center">
      <div class="text-h3">{{ error?.statusCode }}</div>
      <div class="text-h3">{{ error?.message }}</div>
      <v-divider class="my-4"></v-divider>
      <v-btn color="success" size="x-large" @click="handleError">Go Back</v-btn>
    </div>
  </v-container>
</template>

<script setup>
const error = useError();

const handleError = () => {
  clearError({
    redirect: "/",
  });
};
</script>

<style scoped></style>
