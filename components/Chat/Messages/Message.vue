<template>
  <v-list-item :key="props.message.id" class="mx-0 px-0">
    <template v-slot:title>
      <v-card-subtitle class="tiny-font mx-0 px-0">
        <p class="d-inline text-subtitle-2 font-weight-bold text-white">
          {{ props.message.nameSentBy }}
        </p>
        {{
          new Date(props.message.created).toLocaleString(appStore.localLanguage)
        }}
      </v-card-subtitle>
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
    <template v-slot:prepend>
      <div class="ml-2">
        <ChatUserAvatar
          :active="userStore.getUserName === props.message.nameSentBy"
          :user-name="props.message.nameSentBy"
          size="default"
        />
      </div>
      <chat-messages-message-options
        :message="props.message"
        :disabled="userStore.getUserName !== props.message.nameSentBy"
      />
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { stringToColor } from "~/utilities/stringFunctions";

const appStore = useSechatAppStore();
const userStore = useUserStore();

interface PropsModel {
  message: IMessage;
}
const props = defineProps<PropsModel>();
const userColor = computed(() => stringToColor(userStore.userProfile.userName));
</script>

<style scoped>
.tiny-font {
  font-size: x-small;
}
.glow {
  box-shadow: 0 0 4px 2px white, 0 0 4px 2px v-bind(userColor),
    0 0 6px 4px v-bind(userColor), 0 0 4px 2px v-bind(userColor);
}
</style>
