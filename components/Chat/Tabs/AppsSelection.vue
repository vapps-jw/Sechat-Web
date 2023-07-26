<template>
  <v-container class="d-flex justify-center align-start">
    <v-card
      class="sechat-v-card-full overflow-auto"
      min-width="350"
      width="700"
    >
      <ChatTabsVariantsChatCard />
      <!-- TODO:uncomment when calendar ready -->
      <!-- <ChatTabsVariantsCalendarCard /> -->
      <ChatTabsVariantsProfileCard />
    </v-card>
  </v-container>
</template>

<script setup lang="ts"></script>

<style scoped></style>
