<template>
  <v-container fluid class="fill-height">
    <v-layout wrap>
      <div>
        Content you want in a container as this takes on the container class.
      </div>
      <div>
        Content you don't want contained as it takes on the fluid 100% width.
      </div>
      <p>rewrwrwer</p>
      <p>rewrwrwer</p>
      <p>rewrwrwer</p>
      <p>rewrwrwer</p>
    </v-layout>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "board",
});
</script>

<style scoped></style>
