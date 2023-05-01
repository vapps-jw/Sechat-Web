<template>
  <v-footer class="d-flex flex-row justify-center h-5">
    <v-chip color="warning">
      {{ config.public.appVersion }}
    </v-chip>
    <v-spacer></v-spacer>
  </v-footer>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
</script>

<style scoped></style>
