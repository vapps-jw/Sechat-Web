<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" icon="mdi-account-cog" variant="outlined"></v-btn>
    </template>
    <v-card>
      <v-toolbar>
        <v-toolbar-title>Room Settings</v-toolbar-title>
        <v-toolbar-items>
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text class="ma-0 pa-0">
        <v-container>
          <v-alert
            density="comfortable"
            type="info"
            title="Room Owner"
            :text="chatStore.getActiveRoom.creatorName"
            variant="tonal"
          ></v-alert>
        </v-container>
        <ChatRoomsAddMember :room-id="props.roomId" />
        <ChatRoomsRemoveMemeber />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const dialog = ref<boolean>(false);
const chatStore = useSechatChatStore();

interface PropsModel {
  roomId: string;
}

const props = defineProps<PropsModel>();
</script>

<style scoped></style>
