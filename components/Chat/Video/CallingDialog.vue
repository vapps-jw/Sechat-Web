<template>
  <v-dialog
    v-model="signalRStore.isVideoCallDialogVisible"
    persistent
    width="auto"
  >
    <v-card>
      <v-card-title class="text-h5">
        Use Google's location service?
      </v-card-title>
      <v-card-text
        >Let Google help apps determine location. This means sending anonymous
        location data to Google, even when no apps are running.</v-card-text
      >
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="green-darken-1"
          variant="text"
          @click="signalRStore.hideVideoCallDialog"
        >
          Disagree
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const signalRStore = useSignalRStore();
</script>

<style scoped></style>
