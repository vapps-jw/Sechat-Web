<template>
  <v-row no-gutters class="flex-nowrap align-center my-3">
    <v-col cols="5" class="flex-grow-0 flex-shrink-1 ml-2">
      <v-divider color="tertiary"></v-divider>
    </v-col>

    <v-col
      style="min-width: 150px"
      cols="2"
      class="d-flex flex-grow-1 flex-shrink-0 justify-center align-center"
    >
      <v-sheet class="mx-3">
        <div class="text-warning text-subtitle-1">
          {{ props.message }}
        </div>
      </v-sheet>
    </v-col>

    <v-col cols="5" class="flex-grow-0 flex-shrink-1">
      <v-divider color="tertiary"></v-divider>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
interface PropsModel {
  message: string;
}
const props = defineProps<PropsModel>();
</script>

<style scoped></style>
