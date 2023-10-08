<template>
  <v-overlay
    :opacity="0.9"
    :persistent="true"
    :model-value="props.overlay"
    class="align-center justify-center"
  >
    <div class="d-flex flex-column text-h5 align-center mt-15">
      <v-progress-circular
        color="warning"
        indeterminate
        size="64"
      ></v-progress-circular>
      <p class="text-warning">
        {{ appStore.loadingOverlayMessage }}
      </p>
    </div>
  </v-overlay>
</template>

<script setup lang="ts">
const appStore = useSechatAppStore();
interface PropsModel {
  overlay: boolean;
}

const props = defineProps<PropsModel>();
</script>

<style scoped></style>
