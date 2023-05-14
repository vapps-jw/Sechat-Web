<template>
  <p>
    forgot password ups - expext email and token from sendgrid, allow to type
    new password and send it back to api with token and email
  </p>
</template>

<script setup lang="ts">
const route = useRoute();
const token = ref(route.query.token ? route.query.token : "");
const email = ref(route.query.email ? route.query.email : "");
</script>

<style scoped></style>
