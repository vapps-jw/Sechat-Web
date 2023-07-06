<template>
  <v-container class="d-flex justify-center align-center">
    <v-card min-width="350" width="700" class="sechat-v-card-full">
      <v-toolbar>
        <v-toolbar-title>Rooms</v-toolbar-title>
        <v-spacer></v-spacer>
        <chat-rooms-create-room />
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 overflow-auto">
        <chat-rooms-list />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts"></script>

<style scoped></style>
