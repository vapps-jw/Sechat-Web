<template>
  <v-container class="bg-transparent">
    <div class="d-flex justify-center">
      <v-img
        :max-height="300"
        :width="300"
        src="/images/error-image.png"
      ></v-img>
    </div>
    <div class="d-flex justify-center flex-wrap flex-column align-center">
      <div class="text-h6">{{ error?.statusCode }}</div>
      <div class="text-h6">{{ error?.message }}</div>
      <v-divider class="my-4"></v-divider>
      <v-btn color="warning" size="x-large" @click="handleError">Go Back</v-btn>
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
