<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        size="small"
        icon="mdi-cogs"
        color="warning"
        variant="outlined"
      ></v-btn>
    </template>
    <v-card>
      <v-toolbar>
        <v-toolbar-title>{{ props.roomName }} Settings</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text class="ma-0 pa-0 sechat-v-card-text-full">
        <v-autocomplete
          item-title="displayName"
          :items="chatStore.getApprovedConnections.value"
          item-text="displayName"
          variant="solo"
          v-model="chosenConnection"
          return-object
        ></v-autocomplete>
      </v-card-text>
      <v-card-actions>
        <v-btn color="success" variant="text" @click="dialog = false">
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="text"> Send </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const chatStore = useChatStore();
const dialog = ref<boolean>(false);
const chosenConnection = ref<IConnectionRequest>();

interface PropsModel {
  roomId: string;
  roomName: string;
}
const props = defineProps<PropsModel>();
</script>

<style scoped></style>
