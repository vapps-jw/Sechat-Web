<template>
  <v-avatar
    :color="picture ? 'transparent' : stringToColor(props.userName)"
    :size="props.size"
    :class="props.active ? 'glow' : ''"
  >
    <v-img
      v-if="picture"
      alt="Avatar"
      :src="'data:image/png;base64,' + picture"
    ></v-img>
    <div v-else>{{ getInitials(props.userName) }}</div>
  </v-avatar>
</template>

<script setup lang="ts">
import { getInitials, stringToColor } from "~/utilities/stringFunctions";

interface PropsModel {
  userName: string;
  active: boolean;
  size: string;
  picture?: string;
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
