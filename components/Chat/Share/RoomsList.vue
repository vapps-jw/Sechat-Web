<template>
  <v-list>
    <v-list-item
      color="warning"
      :border="true"
      class="ma-1"
      v-for="room in chatStore.getAvailableRoomsWithKeys"
      :key="room.id"
      :title="room.name"
      @click="selection = room.id"
    >
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { getInitials, stringToColor } from "~/utilities/stringFunctions";

const chatStore = useSechatChatStore();
const selection = ref<string>("");

const emit = defineEmits(["shareTargetSelectedRoom"]);

watch(selection, (newVal, oldVal) => {
  emit("shareTargetSelectedRoom", selection.value);
});
</script>

<style scoped></style>
