<template>
  <div>
    <p>Error</p>
    <h1>{{ error.statusCode }}</h1>
    <p></p>
    <v-btn @click="handleError">Go Back </v-btn>
  </div>
</template>

<script setup lang="ts">
const error = useError();

const handleError = () => {
  navigateTo("/");
};
</script>

<style scoped></style>
