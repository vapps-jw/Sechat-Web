<template>
  <div>
    <p>Error</p>
    <h1>{{ error?.statusCode }}</h1>
    <p>{{ error?.message }}</p>
    <v-btn @click="handleError">Go Back</v-btn>
  </div>
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
