<template>
  <v-avatar
    :color="picture ? 'transparent' : stringToColor(props.userName)"
    :size="props.size"
    :class="props.active ? '' : ''"
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

<style scoped></style>
