<template>
  <v-avatar
    :color="stringToColor(props.userName)"
    :size="props.size"
    :class="props.active ? 'glow' : ''"
  >
    {{ getInitials(props.userName) }}</v-avatar
  >
</template>

<script setup lang="ts">
import { getInitials, stringToColor } from "~/utilities/stringFunctions";

interface PropsModel {
  userName: string;
  active: boolean;
  size: string;
}

const props = defineProps<PropsModel>();

const userColor = computed(() => stringToColor(props.userName));
</script>

<style scoped>
.glow {
  box-shadow: 0 0 4px 2px white, 0 0 4px 2px v-bind(userColor),
    0 0 6px 4px v-bind(userColor), 0 0 4px 2px v-bind(userColor);
}
</style>
