<template>
  <v-list>
    <v-list-item
      color="warning"
      :border="true"
      class="ma-1"
      v-for="uc in chatStore.getApprovedContactsWithKeys"
      :key="uc.id"
      :title="uc.displayName"
      @click="selection = uc.id"
    >
      <template v-slot:title>
        <div class="small-font">{{ uc.displayName }}</div>
      </template>
      <template v-slot:prepend>
        <div class="d-flex align-center justify-center mr-2 flex-column">
          <ChatUserAvatar
            :active="false"
            :user-name="uc.displayName"
            size="default"
          />
        </div>
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { getInitials, stringToColor } from "~/utilities/stringFunctions";

const chatStore = useSechatChatStore();
const selection = ref<number>(null);

const emit = defineEmits(["shareTargetSelectedContact"]);
watch(selection, (newVal, oldVal) => {
  emit("shareTargetSelectedContact", selection.value);
});
</script>

<style scoped></style>
