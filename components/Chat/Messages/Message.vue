<template>
  <v-list-item :key="props.message.id">
    <template v-slot:title>
      <div class="d-flex align-center">
        <ChatUserAvatar
          class="ma-2"
          :active="userStore.getUserName === props.message.nameSentBy"
          :user-name="props.message.nameSentBy"
          :picture="props.image"
          size="default"
        />
        <chat-messages-message-options
          :message="props.message"
          :disabled="userStore.getUserName !== props.message.nameSentBy"
        />
        <v-card-subtitle class="tiny-font mx-0 px-0">
          <p class="d-inline text-subtitle-2 font-weight-bold text-white">
            {{ props.message.nameSentBy }}
          </p>
          {{
            new Date(props.message.created).toLocaleString(
              appStore.localLanguage
            )
          }}
        </v-card-subtitle>
      </div>
    </template>
    <template v-slot:subtitle>
      <v-card-text class="px-0 py-0">
        <div
          class="text--primary text-sm mb-3"
          :class="props.message.error ? 'error-font' : ''"
          v-html="props.message.text"
        ></div>
      </v-card-text>
      <v-card-subtitle class="tiny-font mx-0 px-0">
        <v-chip
          variant="text"
          v-for="seenBy in props.message.messageViewers.filter(
            (mv) =>
              mv.user !== userStore.getUserName &&
              mv.user !== props.message.nameSentBy
          )"
          class="ma- 0 pa-1"
          size="x-small"
          color="success"
          append-icon="mdi-eye-check-outline"
        >
          {{ seenBy.user }}
        </v-chip>
      </v-card-subtitle>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { stringToColor } from "~/utilities/stringFunctions";

const appStore = useSechatAppStore();
const userStore = useUserStore();

interface PropsModel {
  message: IMessage;
  image?: string;
}
const props = defineProps<PropsModel>();
const userColor = computed(() => stringToColor(userStore.userProfile.userName));
</script>

<style scoped>
.tiny-font {
  font-size: x-small;
}
</style>
