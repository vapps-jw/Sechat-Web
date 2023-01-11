<template>
  <div>
    <p>chat</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "board",
  middleware: ["authenticated"],
});
</script>

<style scoped></style>
