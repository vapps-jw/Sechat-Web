<template>
  <v-list>
    <v-list-item
      color="warning"
      class="ma-0 pa-1"
      v-for="room in chatStore.availableRooms"
      :key="room.id"
      :title="room.name"
      @click="selection = room.id"
    >
      <template v-slot:append>
        <div
          v-for="rm in room.members"
          class="d-flex flex-column justify-center align-center ma-1"
        >
          <v-avatar
            class="tiny-font"
            size="20"
            :color="stringToColor(rm.userName)"
          >
            {{ getInitials(rm.userName) }}
          </v-avatar>
          <div class="tiny-font">{{ rm.userName }}</div>
        </div>
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { getInitials, stringToColor } from "~/utilities/stringFunctions";

const chatStore = useSechatChatStore();
const selection = ref<string>("");

const emit = defineEmits(["shareTargetSelected"]);

watch(selection, (newVal, oldVal) => {
  emit("shareTargetSelected", selection.value);
});
</script>

<style scoped></style>
