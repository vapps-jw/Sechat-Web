<template>
  <v-overlay
    :persistent="true"
    :model-value="props.overlay"
    class="align-center justify-center"
  >
    <v-progress-circular
      color="warning"
      indeterminate
      size="64"
    ></v-progress-circular>
  </v-overlay>
</template>

<script setup lang="ts">
interface PropsModel {
  overlay: boolean;
}

const props = defineProps<PropsModel>();
</script>

<style scoped></style>
