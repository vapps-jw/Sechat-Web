<script setup lang="ts">
const myCoolDiv = ref(null);

const clickMe = () => console.log(myCoolDiv);
</script>

<template>
  <div>
    <button @click="clickMe">show me the ref</button>
    <div ref="myCoolDiv">hello there</div>
  </div>
</template>
