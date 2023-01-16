<template>
  <v-container>
    <v-card class="mx-auto" max-width="800">
      <v-toolbar>
        <v-toolbar-title
          >{{ chatStore.rooms.value.length }} Rooms</v-toolbar-title
        >
        <v-spacer></v-spacer>
        <chat-dialogs-add-room />
      </v-toolbar>
      <v-list lines="two">
        <v-list-item
          class="my-1"
          v-for="room in chatStore.rooms.value"
          @click="chatStore.selectRoom(room)"
          :key="room.id"
          :title="room.name"
          active-color="primary"
          :value="room"
          :subtitle="
            new Date(room.lastActivity).toLocaleString(
              appStore.localLanguage.value
            )
          "
        >
          <!-- <template v-slot:prepend>
            <v-avatar color="amber">
              <v-icon color="white">"mdi-clipboard-text"</v-icon>
            </v-avatar>
          </template> -->

          <template v-slot:append>
            <v-btn
              @click="async () => await deleteRoom(room.id)"
              v-if="room.creatorId === userData.userProfile.value.userId"
              icon="mdi-delete"
              color="error"
            ></v-btn>
            <v-btn icon="mdi-exit-to-app" class="ma-2" color="warning"></v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const signalr = useSignalR();
const chatStore = useChatStore();
const appStore = useAppStore();
const userData = useUserData();
const config = useRuntimeConfig();

const addRoomForm = ref<boolean>(false);

const deleteRoom = async (roomId: string) => {
  console.log("--> Deleting room", roomId);
  const { error: deleteError } = await useFetch(
    `${config.public.apiBase}/chat/delete-room/?roomId=${roomId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (deleteError.value) {
    throw createError({
      ...deleteError.value,
      statusMessage: "Failed to delete",
      statusCode: deleteError.value.statusCode,
    });
  }
};
</script>

<style scoped></style>
