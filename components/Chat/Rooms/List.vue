<template>
  <v-list data-cy="room-list">
    <v-list-item
      data-cy="room-list-item"
      @click="selectRoomClicked(room)"
      :border="true"
      class="my-2 mx-1 pa-1"
      v-for="room in chatStore.availableRooms"
      :key="room.id"
      :class="
        chatStore.activeRoomId && chatStore.activeRoomId === room.id
          ? 'active-room'
          : 'inactive-room'
      "
      active-color=""
    >
      <template v-slot:title>
        <div class="small-font">
          {{ room.name }}
        </div>
      </template>
      <template v-slot:prepend>
        <chat-rooms-options data-cy="room-options" :room="room" />
      </template>
      <template v-slot:append>
        <v-badge
          inline
          v-if="
            room.messages.filter(
              (m) => !m.wasViewed && m.nameSentBy !== userStore.getUserName
            ).length > 0
          "
          :content="
            room.messages.filter(
              (m) => !m.wasViewed && m.nameSentBy !== userStore.getUserName
            ).length
          "
          color="error"
        >
          <v-icon>mdi-email</v-icon>
        </v-badge>
        <v-icon
          v-if="room.hasKey && room.messages?.some((m) => m.error)"
          color="warning"
          >mdi-lock-alert</v-icon
        >
        <v-icon
          v-if="room.hasKey && !room.messages?.some((m) => m.error)"
          color="success"
          >mdi-lock-open</v-icon
        >

        <v-tooltip
          v-if="!room.hasKey"
          v-model="keySyncTooltip"
          location="bottom"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-key-wireless"
              color="warning"
              size="small"
              variant="outlined"
            >
            </v-btn>
          </template>
          <span>Waiting for other user to sync the key</span>
        </v-tooltip>
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
const chatStore = useSechatChatStore();
const sechatStore = useSechatAppStore();
const userStore = useUserStore();

const keySyncTooltip = ref<boolean>(false);

const selectRoomClicked = (room: IRoom) => {
  if (!room.hasKey) {
    sechatStore.showSnackbar(<ISanckbar>{
      snackbar: true,
      text: "At least one Room member has to be online to synchronize keys",
      timeout: 1500,
      color: "warning",
      icon: "mdi-key-wireless",
      iconColor: "black",
    });
    return;
  }
  chatStore.selectRoom(room.id);
};
</script>

<style scoped>
* {
  --border-radius: 3%;
}
.active-room {
  border-left: 3px solid #ffc107;
  border-top-left-radius: var(--border-radius);
  border-bottom-left-radius: var(--border-radius);
  border-right: 3px solid #ffc107;
  border-top-right-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
}
.inactive-room {
  border-left: 3px solid #424242;
  border-top-left-radius: var(--border-radius);
  border-bottom-left-radius: var(--border-radius);
  border-right: 3px solid #424242;
  border-top-right-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
}
</style>
