<template>
  <v-tooltip v-model="keySyncTooltip" location="bottom">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon="mdi-key-wireless"
        color="warning"
        size="small"
        variant="outlined"
      >
      </v-btn>
    </template>
    <span>Waiting for other user to sync the key</span>
  </v-tooltip>
</template>

<script setup lang="ts">
const keySyncTooltip = ref<boolean>(false);
</script>

<style scoped></style>
