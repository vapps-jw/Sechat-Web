<template>
  <v-banner lines="one" color="warning">
    <template v-slot:text>
      <div class="font-weight-bold text-warning">
        {{ signalRStore.connectionState }}
      </div>
    </template>
    <template v-slot:prepend>
      <div class="d-flex align-center">
        <Icon name="svg-spinners:bars-scale" />
      </div>
    </template>
  </v-banner>
</template>

<script setup lang="ts">
const signalRStore = useSignalRStore();
</script>

<style scoped></style>
