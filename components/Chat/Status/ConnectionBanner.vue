<template>
  <v-banner lines="one" color="warning">
    <template v-slot:text>
      <div class="font-weight-bold text-warning">
        {{ props.connectionState }}
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
interface PropsModel {
  connectionState: string;
}
const props = defineProps<PropsModel>();
</script>

<style scoped></style>
