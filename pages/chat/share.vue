<template>
  <div>Route: {{ route.fullPath }}</div>
  <div>Title: {{ title }}</div>
  <div>Text: {{ text }}</div>
  <div>Url: {{ url }}</div>
</template>

<script setup lang="ts">
const route = useRoute();
const title = ref(route.query.title ? route.query.title : "");
const text = ref(route.query.text ? route.query.text : "");
const url = ref(route.query.url ? route.query.url : "");

definePageMeta({
  layout: "board",
  middleware: ["authenticated"],
});
</script>

<style scoped></style>
