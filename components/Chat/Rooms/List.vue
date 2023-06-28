<template>
  <v-list>
    <v-list-item
      @click="selectRoomClicked(room.id)"
      :border="true"
      class="my-2 mx-1 pa-1"
      :class="
        chatStore.activeRoomId && chatStore.activeRoomId === room.id
          ? 'active-room'
          : ''
      "
      v-for="room in chatStore.availableRooms"
      :key="room.id"
    >
      <template v-slot:title>
        <div class="small-font">
          {{ room.name }}
        </div>
      </template>
      <template v-slot:prepend>
        <chat-rooms-options :room="room" />
      </template>
      <template v-slot:append>
        <v-badge
          class="mr-5"
          v-if="room.messages.filter((m) => !m.wasViewed).length > 0"
          :content="room.messages.filter((m) => !m.wasViewed).length"
          color="error"
        >
          <v-icon size="x-large">mdi-email</v-icon>
        </v-badge>
        <v-icon
          v-if="!room.hasKey && room.encryptedByUser"
          color="error"
          size="x-large"
          >mdi-lock</v-icon
        >
        <v-icon
          v-if="room.hasKey && room.encryptedByUser"
          color="success"
          size="x-large"
          >mdi-lock-open</v-icon
        >
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
const chatStore = useSechatChatStore();
const appStore = useSechatAppStore();

const selectRoomClicked = (roomId: string) => {
  appStore.updateLoadingOverlay(true);
  chatStore.selectRoom(roomId);
  appStore.updateLoadingOverlay(false);
};
</script>

<style scoped>
.active-room {
  background: linear-gradient(0.6turn, transparent, transparent, #ffc107);
}
.active-room-icon {
  width: 10px;
}
</style>
